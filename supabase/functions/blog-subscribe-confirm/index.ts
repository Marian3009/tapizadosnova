import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let token = "";
    if (req.method === "GET") {
      token = new URL(req.url).searchParams.get("token") || "";
    } else {
      const body = await req.json().catch(() => ({}));
      token = String(body.token || "");
    }

    if (!token || token.length > 64) return json({ ok: false, error: "invalid_token" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: sub, error } = await admin
      .from("blog_subscribers")
      .select("id, email, confirmed_at")
      .eq("confirm_token", token)
      .maybeSingle();

    if (error) throw error;
    if (!sub) return json({ ok: false, error: "not_found" }, 404);

    if (!sub.confirmed_at) {
      const { error: uErr } = await admin
        .from("blog_subscribers")
        .update({ confirmed_at: new Date().toISOString(), unsubscribed_at: null })
        .eq("id", sub.id);
      if (uErr) throw uErr;
    }

    return json({ ok: true, email: sub.email });
  } catch (e) {
    console.error("blog-subscribe-confirm error:", e);
    return json({ ok: false, error: e instanceof Error ? e.message : "internal_error" }, 500);
  }
});
