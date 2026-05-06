// Edge function: analiza una imagen de mueble con Lovable AI (visión)
// y devuelve la zona tapizable en porcentajes.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "Missing imageBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

    const prompt = `Analiza esta imagen de un mueble destinado a tapizado/funda. Identifica con precisión la BOUNDING BOX rectangular que cubre exclusivamente la zona tapizable (asiento, respaldo, brazos, cojines de tela). Excluye patas, estructura de madera, fondo y suelo. Responde SOLO con JSON válido sin texto extra:
{
  "tipo_mueble": "sofa|silla|butaca|sillon|cabecero|puff|otro",
  "zona_tapizable": {
    "descripcion": "string corta",
    "porcentaje_x_inicio": number,
    "porcentaje_x_fin": number,
    "porcentaje_y_inicio": number,
    "porcentaje_y_fin": number
  },
  "color_fondo": "claro|oscuro|mixto",
  "tiene_patas": boolean,
  "zonas_no_tapizar": ["string"]
}
Los porcentajes son 0-100 respecto al ancho/alto de la imagen. Sé generoso pero preciso: incluye todo lo tapizable, no recortes cojines.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limit" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "payment_required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "ai_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";

    // Extraer JSON aunque venga con backticks o texto adicional
    let analysis: any = null;
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        analysis = JSON.parse(match[0]);
      } catch (_) {
        analysis = null;
      }
    }

    if (!analysis?.zona_tapizable) {
      return new Response(JSON.stringify({ error: "invalid_response", raw: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-furniture error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
