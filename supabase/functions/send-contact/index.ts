// Edge function: guarda el formulario de contacto en Supabase y opcionalmente envía email con Resend
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limit en memoria por IP: 3 envíos / 5 minutos
const RATE_LIMIT_WINDOW_MS = 5 * 60_000;
const RATE_LIMIT_MAX = 3;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (arr.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, arr);
    return true;
  }
  arr.push(now);
  ipHits.set(ip, arr);
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "rate_limit" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { nombre, email, telefono, tipo, descripcion, origen } = body;

    if (!nombre || !email || !tipo || !descripcion) {
      return new Response(JSON.stringify({ error: "missing_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Guardar en base de datos usando service_role (bypassa RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: dbError } = await supabase
      .from("contact_submissions")
      .insert({ nombre, email, telefono: telefono || null, tipo, descripcion, origen: origen || null });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(JSON.stringify({ error: "db_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enviar email con Resend (opcional — solo si RESEND_API_KEY está configurado)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const TO_EMAIL = Deno.env.get("CONTACT_TO_EMAIL") ?? "tapizadosnova@gmail.com";
      const FROM_EMAIL = Deno.env.get("CONTACT_FROM_EMAIL") ?? "noreply@tapizadosnova.com";

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2a303c">
          <div style="background:#2a303c;padding:24px 32px;border-radius:12px 12px 0 0">
            <h1 style="color:#c6a564;font-size:22px;margin:0;font-family:Georgia,serif">
              Nueva solicitud de presupuesto
            </h1>
            <p style="color:#f8f7f4;margin:4px 0 0;font-size:14px">Tapizados Nova</p>
          </div>
          <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e8e5de">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede6;font-weight:600;width:140px">Nombre</td><td style="padding:10px 0;border-bottom:1px solid #f0ede6">${nombre}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede6;font-weight:600">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0ede6"><a href="mailto:${email}" style="color:#c6a564">${email}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede6;font-weight:600">Teléfono</td><td style="padding:10px 0;border-bottom:1px solid #f0ede6">${telefono || "—"}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede6;font-weight:600">Tipo de trabajo</td><td style="padding:10px 0;border-bottom:1px solid #f0ede6">${tipo}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede6;font-weight:600">¿Cómo nos conoció?</td><td style="padding:10px 0;border-bottom:1px solid #f0ede6">${origen || "—"}</td></tr>
            </table>
            <div style="margin-top:24px">
              <p style="font-weight:600;margin-bottom:8px">Descripción del trabajo:</p>
              <p style="background:#f8f7f4;padding:16px;border-radius:8px;line-height:1.6;margin:0">${descripcion.replace(/\n/g, "<br>")}</p>
            </div>
            <div style="margin-top:24px;padding:16px;background:#f8f7f4;border-radius:8px;font-size:13px;color:#666">
              Puedes ver todas las solicitudes en el panel de administración de Tapizados Nova.
            </div>
          </div>
        </div>
      `;

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `Tapizados Nova <${FROM_EMAIL}>`,
          to: [TO_EMAIL],
          reply_to: email,
          subject: `Nueva solicitud: ${tipo} — ${nombre}`,
          html,
        }),
      });

      if (!emailRes.ok) {
        // El formulario ya se guardó en BD; solo logueamos el error de email
        console.error("Resend error", emailRes.status, await emailRes.text());
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-contact error", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
