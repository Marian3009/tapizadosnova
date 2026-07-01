import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SITE_URL = "https://tapizadosnova.es";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const { email: rawEmail, source } = await req.json();
    const email = String(rawEmail || "").trim().toLowerCase();

    if (!email || email.length > 255 || !EMAIL_RE.test(email)) {
      return json({ error: "invalid_email" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert subscriber
    const { data: existing } = await admin
      .from("blog_subscribers")
      .select("id, email, confirmed_at, confirm_token, unsubscribed_at")
      .eq("email", email)
      .maybeSingle();

    let confirmToken: string;
    let subscriberId: string;

    if (existing) {
      if (existing.confirmed_at && !existing.unsubscribed_at) {
        return json({ ok: true, already_subscribed: true });
      }
      // Re-activate / regenerate token
      const { data: updated, error: uErr } = await admin
        .from("blog_subscribers")
        .update({
          confirm_token: crypto.randomUUID(),
          unsubscribed_at: null,
          source: source || existing["source"] || "blog_form",
        })
        .eq("id", existing.id)
        .select("id, confirm_token")
        .single();
      if (uErr) throw uErr;
      subscriberId = updated.id;
      confirmToken = updated.confirm_token;
    } else {
      const { data: inserted, error: iErr } = await admin
        .from("blog_subscribers")
        .insert({ email, source: source || "blog_form" })
        .select("id, confirm_token")
        .single();
      if (iErr) throw iErr;
      subscriberId = inserted.id;
      confirmToken = inserted.confirm_token;
    }

    const confirmUrl = `${SITE_URL}/blog/confirmar?token=${confirmToken}`;

    // Send confirmation email (transactional, one recipient, opt-in)
    try {
      await admin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "blog-subscribe-confirm",
          recipientEmail: email,
          idempotencyKey: `blog-subscribe-${subscriberId}-${confirmToken.slice(0, 8)}`,
          templateData: { confirmUrl },
        },
      });
    } catch (mailErr) {
      console.error("subscribe email failed:", mailErr);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("blog-subscribe error:", e);
    return json({ error: e instanceof Error ? e.message : "internal_error" }, 500);
  }
});
