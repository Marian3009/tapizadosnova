// Textiq AI — devuelve el consumo del mes en curso y el plan activo,
// para pintar el contador de uso y el paywall en el cliente.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  pro: 150,
  business: 500,
  agency: 2000,
};

function monthStartIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const { deviceId } = await req.json().catch(() => ({}));

    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data: userData } = await admin.auth.getUser(authHeader.slice(7));
      if (userData?.user) userId = userData.user.id;
    }

    if (!userId && !deviceId) {
      return new Response(JSON.stringify({ error: "missing_identity" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let plan = "free";
    let businessName: string | null = null;
    if (userId) {
      const { data: sub } = await admin
        .from("textiq_subscribers")
        .select("plan, status, business_name")
        .eq("user_id", userId)
        .maybeSingle();
      if (sub && sub.status === "active") plan = sub.plan;
      businessName = sub?.business_name ?? null;
    }

    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

    let usageQuery = admin
      .from("textiq_usage")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStartIso());
    usageQuery = userId ? usageQuery.eq("user_id", userId) : usageQuery.eq("device_id", String(deviceId));
    const { count: used } = await usageQuery;

    return new Response(
      JSON.stringify({ plan, limit, used: used ?? 0, businessName, authenticated: !!userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("textiq-usage error", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
