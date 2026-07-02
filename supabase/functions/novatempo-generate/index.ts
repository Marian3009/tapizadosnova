// NovaTempo AI — motor de generación multi-categoría / multi-espacio.
// Reutiliza el mismo gateway de IA de imagen (Gemini 2.5 Flash Image) que
// analyze-furniture, pero añade: categorías más allá de tapicería de
// muebles (cortinas, cabeceros, camas, exterior/chill-out), un modo para
// proponer decoración en espacios vacíos, y control de límites por plan.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_IMAGE_BASE64_BYTES = 8 * 1024 * 1024;

// Rate limit en memoria por IP: protección adicional además del límite de plan.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
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

// Límite de generaciones incluidas por plan y mes natural.
const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  pro: 150,
  business: 500,
  agency: 2000,
};

type Mode = "retapizar" | "proponer";

const CATEGORY_LABELS: Record<string, string> = {
  sofa: "sofá o sillón",
  silla: "silla",
  cabecero: "cabecero de cama",
  cama: "cama / ropa de cama",
  cortinas: "cortinas",
  pouf: "pouf o banqueta tapizada",
  exterior: "mobiliario de exterior / chill-out",
  decoracion_completa: "conjunto de mobiliario y textiles",
};

const SPACE_LABELS: Record<string, string> = {
  salon: "salón",
  dormitorio: "dormitorio",
  cocina: "cocina",
  bano: "baño",
  recibidor: "recibidor / entrada",
  jardin: "jardín",
  piscina: "zona de piscina",
  barbacoa: "zona de barbacoa / chill-out exterior",
};

const STYLE_LABELS: Record<string, string> = {
  minimalista: "minimalista, líneas limpias, colores neutros",
  boho: "bohemio (boho), texturas naturales, mimbre, tonos tierra",
  escandinavo: "escandinavo, madera clara, blancos y funcionalidad",
  industrial: "industrial, metal negro, madera envejecida, hormigón",
  clasico_renovado: "clásico renovado, elegante y atemporal con toques actuales",
  mediterraneo: "mediterráneo, tonos cálidos, lino, fibras naturales",
};

function buildPrompt(opts: {
  mode: Mode;
  category: string;
  spaceType?: string;
  style?: string;
  hasReferenceImage: boolean;
}): string {
  const categoryLabel = CATEGORY_LABELS[opts.category] ?? opts.category;

  if (opts.mode === "retapizar") {
    return `Eres un editor experto de imágenes de decoración e interiorismo. Tienes DOS imágenes:
1) La PRIMERA imagen muestra un elemento textil/tapizable: un ${categoryLabel}.
2) La SEGUNDA imagen es el TEJIDO o material de referencia que se debe aplicar.

Genera UNA SOLA imagen final donde el elemento de la primera foto aparece renovado con EXACTAMENTE el tejido/material de la segunda foto. Reglas estrictas:
- Conserva la forma, proporciones, pliegues, costuras, perspectiva, sombras y volumen del elemento original.
- Aplica el nuevo material SOLO en las zonas textiles/tapizables correspondientes. NO modifiques estructura de madera, metal, cristal ni el fondo de la imagen.
- El material debe verse como tela o superficie real adaptada a la forma del objeto, con pliegues y sombras integradas, NO como una capa plana superpuesta.
- Mantén el color y patrón del material fieles a la segunda imagen.
- Devuelve solo la imagen resultado, sin texto.`;
  }

  const spaceLabel = opts.spaceType ? SPACE_LABELS[opts.spaceType] ?? opts.spaceType : "espacio";
  const styleLabel = opts.style ? STYLE_LABELS[opts.style] ?? opts.style : "actual y en tendencia";
  const referenceLine = opts.hasReferenceImage
    ? "\n- Se adjunta una SEGUNDA imagen de inspiración: úsala como referencia de estilo, color o material para los elementos que añadas."
    : "";

  return `Eres un interiorista profesional experto en home staging con inteligencia artificial. Tienes una foto de un(a) ${spaceLabel}.

Genera una nueva versión de ESA MISMA imagen añadiendo o renovando ${categoryLabel}, en estilo ${styleLabel}, siguiendo las tendencias de decoración de interiores y exteriores más actuales. Reglas estrictas:
- Conserva la arquitectura, ventanas, puertas, suelo, iluminación y perspectiva original del espacio. NO inventes otra habitación ni cambies el encuadre.
- Integra los elementos nuevos de forma fotorrealista: proporciones, sombras y perspectiva coherentes con el espacio.
- Si el espacio ya tiene mobiliario, puedes complementarlo o renovarlo, pero mantén la coherencia general de la estancia.
- El resultado debe parecer una fotografía real de interiorismo, no un collage.${referenceLine}
- Devuelve solo la imagen resultado, sin texto.`;
}

function monthStartIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      console.error("Missing Supabase service credentials");
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const {
      mode,
      category,
      spaceType,
      style,
      itemBase64,
      itemMime,
      referenceBase64,
      referenceMime,
      deviceId,
    } = body ?? {};

    if (mode !== "retapizar" && mode !== "proponer") {
      return new Response(JSON.stringify({ error: "invalid_mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!category || typeof category !== "string") {
      return new Response(JSON.stringify({ error: "missing_category" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!itemBase64 || typeof itemBase64 !== "string" || itemBase64.length > MAX_IMAGE_BASE64_BYTES) {
      return new Response(JSON.stringify({ error: "missing_or_too_large_image" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (mode === "retapizar" && (!referenceBase64 || typeof referenceBase64 !== "string")) {
      return new Response(JSON.stringify({ error: "missing_reference_image" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (referenceBase64 && referenceBase64.length > MAX_IMAGE_BASE64_BYTES) {
      return new Response(JSON.stringify({ error: "payload_too_large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!deviceId && !req.headers.get("authorization")) {
      return new Response(JSON.stringify({ error: "missing_identity" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Identidad: usuario autenticado o dispositivo anónimo (plan free) ---
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const jwt = authHeader.slice(7);
      const { data: userData } = await admin.auth.getUser(jwt);
      if (userData?.user) userId = userData.user.id;
    }

    let plan = "free";
    if (userId) {
      const { data: sub } = await admin
        .from("novatempo_subscribers")
        .select("plan, status")
        .eq("user_id", userId)
        .maybeSingle();
      if (sub && sub.status === "active") plan = sub.plan;
    }

    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

    // --- Comprobar consumo del mes en curso ---
    let usageQuery = admin
      .from("novatempo_usage")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStartIso());
    usageQuery = userId ? usageQuery.eq("user_id", userId) : usageQuery.eq("device_id", String(deviceId));
    const { count: used, error: usageErr } = await usageQuery;
    if (usageErr) {
      console.error("usage count error", usageErr);
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((used ?? 0) >= limit) {
      return new Response(
        JSON.stringify({ error: "limit_reached", plan, limit, used: used ?? 0 }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt({ mode, category, spaceType, style, hasReferenceImage: !!referenceBase64 });

    const itemUrl = `data:${itemMime || "image/jpeg"};base64,${itemBase64}`;
    const content: Record<string, unknown>[] = [{ type: "image_url", image_url: { url: itemUrl } }];
    if (referenceBase64) {
      const refUrl = `data:${referenceMime || "image/jpeg"};base64,${referenceBase64}`;
      content.push({ type: "image_url", image_url: { url: refUrl } });
    }
    content.push({ type: "text", text: prompt });

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content }],
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
      imageUrl = images[0]?.image_url?.url || images[0]?.url || null;
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

    const { error: insertErr } = await admin.from("novatempo_usage").insert({
      user_id: userId,
      device_id: userId ? null : String(deviceId),
      mode,
      category,
    });
    if (insertErr) console.error("usage insert error", insertErr);

    return new Response(
      JSON.stringify({ imageUrl, usage: { used: (used ?? 0) + 1, limit, plan } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("novatempo-generate error", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
