import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) { ipHits.set(ip, hits); return true; }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

const DEFAULT_SYSTEM_PROMPT = `Eres el asistente virtual de Tapizados Nova, empresa familiar de tapicería artesanal en Rubí (Barcelona) con más de 30 años de experiencia desde 1995.

DATOS DE CONTACTO:
- Dirección: Calle Bilbao N1, 1ª planta, 08191 Rubí (Barcelona)
- Teléfono/WhatsApp: +34 611 491 661
- Email: tapizadosnova@gmail.com
- Web: tapizadosnova.es
- Horario: Lunes a Viernes 9:00-18:00h, Sábados 9:00-14:00h

SERVICIOS Y PRECIOS ORIENTATIVOS:
- Asiento silla: desde 55€ | Silla completa: desde 84€
- Butaca: desde 320€ | Butaca XL: desde 430€ | Sillón orejero: desde 430€
- Sofá 2 plazas: desde 670€ | Sofá 3 plazas: desde 820€
- Chaise longue: desde 800€ | Rinconera: desde 1.210€
- Cabeceros a medida: presupuesto personalizado

TELAS (más de 500 opciones):
- Básica: desde 20€/m | Antimanchas: 35€/m | Terciopelo: 35€/m | Premium/Lino: 70€/m

PLAZOS: 1-2 semanas. Recogida a domicilio disponible en área de Barcelona.

INSTRUCCIONES:
- Responde en español, amable y conciso (máximo 3 frases para voz)
- Para presupuesto exacto: invita a la calculadora en tapizadosnova.es o al WhatsApp
- Si no sabes algo, indica que llamen al +34 611 491 661`;

type ChatMessage = { role: "user" | "assistant"; content: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "rate_limit" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supaUrl = Deno.env.get("SUPABASE_URL")!;
  const supaServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supaUrl, supaServiceKey);

  try {
    const { message, history = [], session_id } = await req.json() as {
      message: string;
      history: ChatMessage[];
      session_id?: string;
    };

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "message_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cargar configuración del agente desde admin panel
    let systemPrompt = DEFAULT_SYSTEM_PROMPT;
    try {
      const { data: cfg } = await db
        .from("agent_config")
        .select("system_prompt")
        .eq("id", "default")
        .maybeSingle();
      if (cfg?.system_prompt?.trim()) systemPrompt = cfg.system_prompt;
    } catch { /* usa el prompt por defecto */ }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "configuration_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recentHistory = history.slice(-8) as ChatMessage[];
    let reply: string;

    if (Deno.env.get("ANTHROPIC_API_KEY")) {
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          system: systemPrompt,
          messages: [...recentHistory, { role: "user", content: message }],
        }),
      });
      if (!aiRes.ok) throw new Error(`Anthropic ${aiRes.status}`);
      const data = await aiRes.json();
      reply = data.content?.[0]?.text ?? "Lo siento, no pude responder en este momento.";
    } else {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "anthropic/claude-3-5-haiku-20241022",
          max_tokens: 300,
          messages: [
            { role: "system", content: systemPrompt },
            ...recentHistory,
            { role: "user", content: message },
          ],
        }),
      });
      if (!aiRes.ok) throw new Error(`Lovable gateway ${aiRes.status}`);
      const data = await aiRes.json();
      reply = data.choices?.[0]?.message?.content ?? "Lo siento, no pude responder.";
    }

    // Guardar conversación en DB (sin bloquear la respuesta)
    if (session_id) {
      const updatedMessages = [
        ...recentHistory,
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ];
      db.from("agent_conversations")
        .upsert(
          {
            id: session_id,
            channel: "web",
            contact: "web-" + ip.slice(0, 8),
            messages: updatedMessages,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .then(() => {})
        .catch((e: Error) => console.error("Failed to save conversation:", e));
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("voice-agent error:", e);
    return new Response(
      JSON.stringify({
        error: "internal_error",
        reply: "Lo siento, ha habido un error técnico. Puedes contactarnos al +34 611 491 661.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
