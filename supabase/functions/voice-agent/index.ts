const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limit: 20 req / 60s por IP
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

const SYSTEM_PROMPT = `Eres el asistente virtual de Tapizados Nova, empresa familiar de tapicería artesanal en Rubí (Barcelona) con más de 30 años de experiencia desde 1995. Hablas directamente con clientes potenciales.

DATOS DE CONTACTO:
- Dirección: Calle Bilbao N1, 1ª planta, 08191 Rubí (Barcelona)
- Teléfono/WhatsApp: +34 611 491 661
- Email: tapizadosnova@gmail.com
- Web: tapizadosnova.es
- Horario: Lunes a Viernes 9:00-18:00, Sábados 9:00-14:00

SERVICIOS Y PRECIOS ORIENTATIVOS (mano de obra + tela):
- Asiento silla: desde 55€ (básica) hasta 77€ (premium)
- Silla completa (asiento+respaldo): desde 84€ hasta 144€
- Butaca: desde 320€ hasta 545€
- Sofá 2 plazas: desde 670€ hasta 1.220€
- Sofá 3 plazas: desde 820€ hasta 1.520€
- Rinconera: desde 1.210€ hasta 2.110€
- Chaise longue: desde 800€ hasta 1.300€
- Cabeceros: presupuesto personalizado

TELAS DISPONIBLES (más de 500 opciones):
- Básica: desde 20€/metro
- Antimanchas: desde 35€/metro
- Terciopelo: desde 35€/metro
- Lino y Premium: desde 70€/metro

PLAZOS: habitualmente 1-2 semanas según carga de trabajo.
RECOGIDA: disponible con servicio a domicilio en el área de Barcelona.
PRESUPUESTO: gratuito y sin compromiso. Calculadora online en tapizadosnova.es.

INSTRUCCIONES DE RESPUESTA:
- Responde siempre en español, con tono amable y profesional
- Para voz: máximo 2-3 frases cortas y directas
- Si piden presupuesto exacto: invítales a usar la calculadora en la web o a contactar por WhatsApp al +34 611 491 661
- Si no sabes algo: indica que pueden llamar o escribir al WhatsApp
- No inventes precios fuera de los rangos indicados`;

type ChatMessage = { role: "user" | "assistant"; content: string };

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
    const { message, history = [] } = await req.json() as {
      message: string;
      history: ChatMessage[];
    };

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "message_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error("No AI API key configured (ANTHROPIC_API_KEY or LOVABLE_API_KEY)");
      return new Response(JSON.stringify({ error: "configuration_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const useAnthropic = !!Deno.env.get("ANTHROPIC_API_KEY");
    const recentHistory = history.slice(-8) as ChatMessage[];

    let reply: string;

    if (useAnthropic) {
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
          system: SYSTEM_PROMPT,
          messages: [...recentHistory, { role: "user", content: message }],
        }),
      });

      if (!aiRes.ok) {
        const t = await aiRes.text();
        console.error("Anthropic API error", aiRes.status, t);
        throw new Error(`AI error ${aiRes.status}`);
      }

      const data = await aiRes.json();
      reply = data.content?.[0]?.text ?? "Lo siento, no pude procesar tu consulta.";
    } else {
      // Lovable AI gateway (OpenAI-compatible)
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-5-haiku-20241022",
          max_tokens: 300,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...recentHistory,
            { role: "user", content: message },
          ],
        }),
      });

      if (!aiRes.ok) {
        const t = await aiRes.text();
        console.error("Lovable gateway error", aiRes.status, t);
        throw new Error(`AI error ${aiRes.status}`);
      }

      const data = await aiRes.json();
      reply = data.choices?.[0]?.message?.content ?? "Lo siento, no pude procesar tu consulta.";
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("voice-agent error:", e);
    return new Response(
      JSON.stringify({ error: "internal_error", reply: "Lo siento, ha habido un problema técnico. Por favor contacta al +34 611 491 661." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
