// Edge function: re-tapiza un mueble usando IA generativa de imagen
// (Gemini 2.5 Flash Image / nano-banana) usando la foto del mueble
// y la foto del tejido como referencias.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Tamaño máximo de cada imagen base64 (~6 MB de datos crudos)
const MAX_IMAGE_BASE64_BYTES = 8 * 1024 * 1024;

// Rate limit en memoria por IP: 5 peticiones / 60s
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
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
    const { furnitureBase64, furnitureMime, fabricBase64, fabricMime } = await req.json();
    if (!furnitureBase64 || !fabricBase64) {
      return new Response(JSON.stringify({ error: "missing_images" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      typeof furnitureBase64 !== "string" ||
      typeof fabricBase64 !== "string" ||
      furnitureBase64.length > MAX_IMAGE_BASE64_BYTES ||
      fabricBase64.length > MAX_IMAGE_BASE64_BYTES
    ) {
      return new Response(JSON.stringify({ error: "payload_too_large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const furnitureUrl = `data:${furnitureMime || "image/jpeg"};base64,${furnitureBase64}`;
    const fabricUrl = `data:${fabricMime || "image/jpeg"};base64,${fabricBase64}`;

    const prompt = `Eres un editor experto de imágenes para tapicería. Tienes DOS imágenes:
1) La PRIMERA imagen es un mueble (sofá, silla, butaca, cabecero, puff, etc.) que hay que retapizar.
2) La SEGUNDA imagen es el TEJIDO que se debe aplicar al mueble.

Genera UNA SOLA imagen final donde el mueble de la primera foto aparece tapizado con EXACTAMENTE el tejido de la segunda foto. Reglas estrictas:
- Conserva la forma, proporciones, pliegues, cojines, costuras, perspectiva, sombras y volumen del mueble original.
- Aplica el tejido SOLO en las zonas tapizables (asiento, respaldo, brazos, cojines). NO modifiques patas, estructura de madera, marco metálico ni fondo.
- Conserva el fondo de la imagen original tal cual está.
- El tejido debe verse como tela real adaptada al mueble, con sus pliegues y sombras integradas, NO como una capa plana superpuesta.
- Mantén el color y patrón del tejido fieles a la segunda imagen.
- Devuelve solo la imagen resultado, sin texto.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: furnitureUrl } },
              { type: "image_url", image_url: { url: fabricUrl } },
              { type: "text", text: prompt },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI image gen error", aiRes.status, t);
      const code = aiRes.status === 429 ? "rate_limit" : aiRes.status === 402 ? "payment_required" : "ai_error";
      return new Response(JSON.stringify({ error: code }), {
        status: aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const msg = data?.choices?.[0]?.message;
    let imageUrl: string | null = null;
    const images = msg?.images;
    if (Array.isArray(images) && images.length) {
      const first = images[0];
      imageUrl = first?.image_url?.url || first?.url || null;
    }
    if (!imageUrl && typeof msg?.content === "string") {
      const m = msg.content.match(/data:image\/[^\s)"']+/);
      if (m) imageUrl = m[0];
    }
    if (!imageUrl && Array.isArray(msg?.content)) {
      for (const part of msg.content) {
        if (part?.type === "image_url" && part?.image_url?.url) {
          imageUrl = part.image_url.url;
          break;
        }
      }
    }

    if (!imageUrl) {
      console.error("No image in AI response", JSON.stringify(data).slice(0, 600));
      return new Response(JSON.stringify({ error: "no_image" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("retapizar error", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
