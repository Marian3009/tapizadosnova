// Instagram automated carousel publisher for @tapizados.nova
//
// Runs 3x/week via pg_cron:
//   Monday    09:00 UTC → blog article carousel (from latest published post)
//   Wednesday 09:00 UTC → tapicería tips & techniques
//   Friday    09:00 UTC → interior design / decoration inspiration
//
// Each post: 5 slides (Pexels stock photos uploaded to Supabase Storage)
// + structured AI-generated caption with hashtags
//
// Auth: x-automation-secret header (same secret as weekly-blog-publish)
// Dry-run mode: pass {"dry_run": true} to generate content without posting to Instagram.
//
// Required secrets:
//   INSTAGRAM_ACCESS_TOKEN  — long-lived Meta Graph API token (refresh every 60 days)
//   INSTAGRAM_ACCOUNT_ID    — numeric Instagram Business Account ID
//   LOVABLE_API_KEY         — Gemini via Lovable Gateway
//   PEXELS_API_KEY          — stock photo search
//   BLOG_AUTOMATION_SECRET  — auth header (same as weekly-blog-publish)

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import jsonRepair from "https://esm.sh/jsonrepair@3.11.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-automation-secret",
};

const GRAPH_API = "https://graph.facebook.com/v21.0";
const SITE_URL = "https://tapizadosnova.es";
const BRAND_NAME = "Tapizados Nova";
const BRAND_IG = "@tapizados.nova";

// Always-on hashtag set for the brand
const BASE_HASHTAGS = [
  "#tapizadosnova", "#tapiceria", "#tapizado", "#tapizados",
  "#barcelona", "#rubi", "#sofa", "#muebles", "#decoracion", "#hogar",
];

// Topic rotation for tips (Wednesday) — cycles through week number mod length
const TIPS_TOPICS = [
  "tipos de tejidos y telas para tapizar sofás: antimanchas, terciopelo, lino, microfibra",
  "cómo restaurar sillas y butacas antiguas con tapizado artesanal",
  "cabeceros tapizados: tendencias y cómo elegir el tejido perfecto",
  "fundas a medida vs tapizado completo: ventajas y cuándo elegir cada opción",
  "cuidado y limpieza de tapizados: guía por tipo de tejido",
  "colores y texturas de tapicería para 2026: tendencias de decoración",
  "proceso artesanal del tapizado: paso a paso desde la tela hasta el resultado",
];

// Inspiration topics for Friday
const INSPIRATION_TOPICS = [
  "interiorismo mediterráneo con tapizados en tonos cálidos y texturas naturales",
  "estilo nórdico y tapicería: sofás minimalistas, telas neutras y líneas limpias",
  "tendencias en decoración textil 2026: terciopelos, boucle y tejidos orgánicos",
  "salones con sofás tapizados a medida: inspiración y ideas de distribución",
  "dormitorios con cabeceros tapizados: diferentes estilos y acabados",
  "el antes y el después de una restauración de tapicería: transformaciones reales",
  "interiorismo boho-chic con muebles tapizados en tonos tierra y texturas artesanales",
];

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Pexels ────────────────────────────────────────────────────────────────────

async function searchPexels(query: string, count = 5): Promise<Array<{ url: string; alt: string }>> {
  const apiKey = Deno.env.get("PEXELS_API_KEY");
  if (!apiKey) return [];
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=square&size=large`,
      { headers: { Authorization: apiKey } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.photos ?? []).map((p: any) => ({
      url: p.src.large2x || p.src.large,
      alt: p.alt || query,
    }));
  } catch {
    return [];
  }
}

// ── Supabase Storage ──────────────────────────────────────────────────────────

async function uploadSlideToStorage(
  imageUrl: string,
  filename: string,
  admin: ReturnType<typeof createClient>
): Promise<string | null> {
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const arrayBuf = await imgRes.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    const { error } = await admin.storage
      .from("blog-media")
      .upload(`instagram/${filename}`, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (error) { console.error("Storage upload error:", error); return null; }
    const { data: { publicUrl } } = admin.storage
      .from("blog-media")
      .getPublicUrl(`instagram/${filename}`);
    return publicUrl;
  } catch (e) {
    console.error("uploadSlideToStorage:", e);
    return null;
  }
}

// ── Instagram Graph API ───────────────────────────────────────────────────────

async function createMediaContainer(
  imageUrl: string,
  isCarouselItem: boolean,
  accountId: string,
  accessToken: string
): Promise<string | null> {
  const params = new URLSearchParams({
    image_url: imageUrl,
    access_token: accessToken,
    ...(isCarouselItem && { is_carousel_item: "true" }),
  });
  const res = await fetch(`${GRAPH_API}/${accountId}/media`, {
    method: "POST",
    body: params,
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    console.error("createMediaContainer failed:", data);
    return null;
  }
  return data.id as string;
}

async function createCarouselContainer(
  childIds: string[],
  caption: string,
  accountId: string,
  accessToken: string
): Promise<string | null> {
  const params = new URLSearchParams({
    media_type: "CAROUSEL",
    caption,
    children: childIds.join(","),
    access_token: accessToken,
  });
  const res = await fetch(`${GRAPH_API}/${accountId}/media`, {
    method: "POST",
    body: params,
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    console.error("createCarouselContainer failed:", data);
    return null;
  }
  return data.id as string;
}

async function publishMedia(
  creationId: string,
  accountId: string,
  accessToken: string
): Promise<string | null> {
  const params = new URLSearchParams({ creation_id: creationId, access_token: accessToken });
  const res = await fetch(`${GRAPH_API}/${accountId}/media_publish`, {
    method: "POST",
    body: params,
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    console.error("publishMedia failed:", data);
    return null;
  }
  return data.id as string;
}

async function postCarousel(
  slideUrls: string[],
  caption: string,
  accessToken: string,
  accountId: string
): Promise<string | null> {
  // Step 1: create child containers
  const childIds: string[] = [];
  for (const url of slideUrls) {
    const id = await createMediaContainer(url, true, accountId, accessToken);
    if (!id) return null;
    childIds.push(id);
    await new Promise(r => setTimeout(r, 500)); // small delay between requests
  }
  // Step 2: create carousel container
  const carouselId = await createCarouselContainer(childIds, caption, accountId, accessToken);
  if (!carouselId) return null;
  // Step 3: publish
  await new Promise(r => setTimeout(r, 2000)); // Instagram recommends a short wait
  return publishMedia(carouselId, accountId, accessToken);
}

// ── AI Content Generation ─────────────────────────────────────────────────────

async function callGemini(prompt: string, apiKey: string): Promise<any> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `Eres el community manager de ${BRAND_NAME}, tapicería artesanal en Rubí (Barcelona).
Creas contenido para Instagram (@tapizados.nova) con tono cercano, inspirador y profesional.
Escribes en español. Devuelves JSON estricto.`,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return JSON.parse(jsonRepair(json.choices?.[0]?.message?.content ?? "{}"));
}

// Blog carousel — extract key points from the article
async function generateBlogContent(post: any, apiKey: string) {
  const prompt = `Genera contenido para Instagram sobre este artículo del blog de ${BRAND_NAME}.

ARTÍCULO:
Título: ${post.title}
Categoría: ${post.category}
Extracto: ${post.excerpt || ""}
Contenido: ${(post.content || "").slice(0, 2000)}

Crea un carrusel de Instagram con 5 slides. Devuelve JSON:
{
  "slides": [
    {"emoji": "✨", "title": "TÍTULO SLIDE 1 (max 6 palabras, mayúsculas)", "body": "texto corto del slide (2-3 líneas)"},
    ...5 slides total...
  ],
  "caption_hook": "primera línea del caption, gancho potente (max 140 chars, sin hashtags)",
  "caption_body": "cuerpo del caption con los puntos clave, máx 800 chars, usar emojis y saltos de línea",
  "cta": "llamada a la acción (ej: Lee el artículo completo en tapizadosnova.es/blog)",
  "image_queries": ["english search 1", "english search 2", "english search 3", "english search 4", "english search 5"],
  "extra_hashtags": ["#interiorismo", "#renovacion", "#sofa", ... 8-10 hashtags temáticos sin repetir los básicos]
}

image_queries: 5 búsquedas en inglés de 2-4 palabras para fotos de stock relevantes al tema.
Slide 1 = imagen hero/inspiradora. Slide 5 = imagen CTA (ej: "upholstery workshop craftsman").`;

  return callGemini(prompt, apiKey);
}

// Tips carousel — tapicería / textiles / decoration tips
async function generateTipsContent(weekNum: number, apiKey: string) {
  const topic = TIPS_TOPICS[weekNum % TIPS_TOPICS.length];
  const prompt = `Crea un carrusel de Instagram sobre: "${topic}" para ${BRAND_NAME}.

El carrusel debe aportar valor real al lector y posicionar a ${BRAND_NAME} como expertos en tapicería artesanal.

Devuelve JSON:
{
  "slides": [
    {"emoji": "💡", "title": "TÍTULO SLIDE 1 (max 6 palabras, mayúsculas)", "body": "texto del slide (2-3 líneas con consejos prácticos)"},
    ...5 slides total...
  ],
  "caption_hook": "gancho potente para la primera línea (max 140 chars)",
  "caption_body": "cuerpo del caption con los consejos, máx 800 chars, emojis y saltos de línea",
  "cta": "llamada a la acción para pedir presupuesto o visitar la web",
  "image_queries": ["english query 1", "english query 2", "english query 3", "english query 4", "english query 5"],
  "extra_hashtags": ["#tejido", "#tapiceria", ... 8-10 hashtags temáticos relevantes]
}`;

  return callGemini(prompt, apiKey);
}

// Inspiration carousel — interior design / textile decoration
async function generateInspirationContent(weekNum: number, apiKey: string) {
  const topic = INSPIRATION_TOPICS[weekNum % INSPIRATION_TOPICS.length];
  const prompt = `Crea un carrusel de Instagram inspiracional sobre: "${topic}" para ${BRAND_NAME}.

El contenido debe inspirar y mostrar el universo de la tapicería artesanal y el interiorismo textil.

Devuelve JSON:
{
  "slides": [
    {"emoji": "🏠", "title": "TÍTULO SLIDE 1 (max 6 palabras, mayúsculas)", "body": "texto inspiracional del slide (2-3 líneas)"},
    ...5 slides total...
  ],
  "caption_hook": "gancho inspiracional potente (max 140 chars)",
  "caption_body": "cuerpo del caption con inspiración y contexto, máx 800 chars, emojis y saltos de línea",
  "cta": "llamada a la acción para transformar su hogar o pedir información",
  "image_queries": ["english query 1", "english query 2", "english query 3", "english query 4", "english query 5"],
  "extra_hashtags": ["#interiorismo", "#decoracion", ... 8-10 hashtags temáticos relevantes]
}`;

  return callGemini(prompt, apiKey);
}

// Build the full Instagram caption from AI content
function buildCaption(content: any): string {
  const { slides, caption_hook, caption_body, cta, extra_hashtags } = content;

  const slideSection = slides
    .map((s: any, i: number) =>
      `${s.emoji || "▪️"} SLIDE ${i + 1}: ${s.title}\n${s.body}`
    )
    .join("\n\n");

  const allHashtags = [...BASE_HASHTAGS, ...(extra_hashtags ?? [])].slice(0, 28).join(" ");

  return [
    caption_hook,
    "👉 Desliza para ver más →",
    "",
    "━━━━━━━━━━━━━━━━",
    "",
    slideSection,
    "",
    "━━━━━━━━━━━━━━━━",
    "",
    caption_body,
    "",
    `📲 ${cta}`,
    `🌐 ${SITE_URL}`,
    `📞 +34 611 491 661`,
    "",
    "━━━━━━━━━━━━━━━━",
    "",
    allHashtags,
  ].join("\n");
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
    const expected = Deno.env.get("BLOG_AUTOMATION_SECRET");
    if (!expected) return jsonRes({ error: "automation_secret_missing" }, 500);
    const provided = req.headers.get("x-automation-secret") ?? "";
    if (provided !== expected) return jsonRes({ error: "unauthorized" }, 401);

    // Config
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return jsonRes({ error: "LOVABLE_API_KEY missing" }, 500);

    const accessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
    const accountId = Deno.env.get("INSTAGRAM_ACCOUNT_ID");

    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const supaSrv = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supaUrl, supaSrv);

    // Parse request
    let body: any = {};
    try { body = await req.json(); } catch {}

    const dryRun: boolean = body?.dry_run === true;
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)); // week since epoch

    // Determine post type from body or day of week
    let postType: "blog" | "tips" | "inspiration" = body?.type;
    if (!postType) {
      const day = new Date().getDay(); // 0=Sun,1=Mon,...,5=Fri
      postType = day === 1 ? "blog" : day === 3 ? "tips" : "inspiration";
    }

    // Log entry
    const logEntry: any = { post_type: postType, status: "pending" };

    // ── 1. Generate content ──────────────────────────────────────────────────
    let content: any;
    let blogPostId: string | undefined;

    if (postType === "blog") {
      const { data: posts } = await admin
        .from("blog_posts")
        .select("id,title,slug,excerpt,content,category,featured_image_url")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1);
      const post = posts?.[0];
      if (!post) return jsonRes({ ok: true, message: "No published blog posts yet" });
      content = await generateBlogContent(post, apiKey);
      blogPostId = post.id;
      logEntry.blog_post_id = blogPostId;
      // Use article URL in CTA
      content.cta = `Lee el artículo completo → ${SITE_URL}/blog/${post.slug}`;
    } else if (postType === "tips") {
      content = await generateTipsContent(weekNum, apiKey);
    } else {
      content = await generateInspirationContent(weekNum, apiKey);
    }

    // ── 2. Fetch stock photos ────────────────────────────────────────────────
    const imageQueries: string[] = Array.isArray(content.image_queries)
      ? content.image_queries.slice(0, 5)
      : ["upholstery fabric texture", "sofa interior design", "velvet armchair", "fabric samples", "interior living room"];

    const slideImages: Array<{ url: string; alt: string }> = [];
    for (let i = 0; i < 5; i++) {
      const query = imageQueries[i] || "upholstery interior";
      const results = await searchPexels(query, 3);
      slideImages.push(results[0] ?? { url: "", alt: query });
    }

    // ── 3. Upload to Supabase Storage ────────────────────────────────────────
    const ts = Date.now();
    const uploadedUrls: string[] = [];

    for (let i = 0; i < slideImages.length; i++) {
      const img = slideImages[i];
      if (!img.url) continue;
      const filename = `${postType}-${ts}-slide${i + 1}.jpg`;
      const publicUrl = await uploadSlideToStorage(img.url, filename, admin);
      if (publicUrl) uploadedUrls.push(publicUrl);
      else uploadedUrls.push(img.url); // fallback: use Pexels URL directly
    }

    if (uploadedUrls.length === 0) {
      return jsonRes({ error: "No slide images available" }, 500);
    }

    // ── 4. Build caption ─────────────────────────────────────────────────────
    const caption = buildCaption(content);
    logEntry.caption = caption;
    logEntry.slide_urls = uploadedUrls;
    logEntry.hashtags = [...BASE_HASHTAGS, ...(content.extra_hashtags ?? [])];

    // ── 5. Post to Instagram (skip in dry_run mode) ──────────────────────────
    let igMediaId: string | null = null;

    if (!dryRun) {
      if (!accessToken || !accountId) {
        // Instagram not configured — save to log as pending for manual review
        logEntry.status = "pending";
        logEntry.error_msg = "INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_ACCOUNT_ID not set";
        await admin.from("instagram_posts_log").insert(logEntry);
        return jsonRes({
          ok: false,
          message: "Instagram credentials not configured. Content saved to instagram_posts_log for review.",
          content_preview: {
            type: postType,
            caption_preview: caption.slice(0, 300) + "...",
            slides: uploadedUrls.length,
            slide_urls: uploadedUrls,
          },
        });
      }

      igMediaId = await postCarousel(uploadedUrls, caption, accessToken, accountId);
      logEntry.ig_media_id = igMediaId;
      logEntry.status = igMediaId ? "published" : "error";
      logEntry.published_at = igMediaId ? new Date().toISOString() : undefined;
      if (!igMediaId) logEntry.error_msg = "Instagram API: carousel publish failed";
    } else {
      logEntry.status = "dry_run";
    }

    await admin.from("instagram_posts_log").insert(logEntry);

    return jsonRes({
      ok: true,
      dry_run: dryRun,
      post_type: postType,
      ig_media_id: igMediaId,
      status: logEntry.status,
      slides: uploadedUrls.length,
      slide_urls: uploadedUrls,
      caption_preview: caption.slice(0, 400) + "...",
    });

  } catch (e) {
    console.error("instagram-auto-post error:", e);
    return jsonRes({ error: e instanceof Error ? e.message : "internal_error" }, 500);
  }
});
