// Instagram automated carousel publisher for @tapizados.nova
//
// Runs 3x/week via pg_cron:
//   Monday    09:00 UTC → blog article carousel (from latest published post)
//   Wednesday 09:00 UTC → tapicería tips & techniques
//   Friday    09:00 UTC → interior design / decoration inspiration
//
// Each post: 5 slides (Pexels stock photos → uploaded to Supabase Storage)
// + structured AI-generated caption with hashtags
//
// Publishing: sends payload to Make.com webhook → Make publishes to Instagram
//   (no Meta Developer account required on our side)
//
// Auth: x-automation-secret header (same as weekly-blog-publish)
// Dry-run: pass {"dry_run": true} to generate content without calling Make
//
// Required secrets:
//   MAKE_INSTAGRAM_WEBHOOK_URL  — Make.com webhook URL (from your scenario)
//   LOVABLE_API_KEY             — Gemini via Lovable Gateway
//   PEXELS_API_KEY              — Pexels stock photo search
//   BLOG_AUTOMATION_SECRET      — auth header

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import jsonRepair from "https://esm.sh/jsonrepair@3.11.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-automation-secret",
};

const SITE_URL = "https://tapizadosnova.es";
const BRAND_NAME = "Tapizados Nova";

const BASE_HASHTAGS = [
  "#tapizadosnova", "#tapiceria", "#tapizado", "#tapizados",
  "#barcelona", "#rubi", "#sofa", "#muebles", "#decoracion", "#hogar",
];

const TIPS_TOPICS = [
  "tipos de tejidos y telas para tapizar sofás: antimanchas, terciopelo, lino, microfibra",
  "cómo restaurar sillas y butacas antiguas con tapizado artesanal",
  "cabeceros tapizados: tendencias y cómo elegir el tejido perfecto",
  "fundas a medida vs tapizado completo: ventajas y cuándo elegir cada opción",
  "cuidado y limpieza de tapizados: guía por tipo de tejido",
  "colores y texturas de tapicería para 2026: tendencias de decoración",
  "proceso artesanal del tapizado: paso a paso desde la tela hasta el resultado",
];

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

async function searchPexels(query: string, count = 3): Promise<Array<{ url: string; alt: string }>> {
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

// ── Supabase Storage (re-hosts images so Instagram/Make can access them) ──────

async function uploadSlideToStorage(
  imageUrl: string,
  filename: string,
  admin: ReturnType<typeof createClient>
): Promise<string | null> {
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const bytes = new Uint8Array(await imgRes.arrayBuffer());
    const { error } = await admin.storage
      .from("blog-media")
      .upload(`instagram/${filename}`, bytes, { contentType: "image/jpeg", upsert: true });
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

// ── Make.com webhook ──────────────────────────────────────────────────────────

async function callMakeWebhook(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; body: string }> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  return { ok: res.ok, body };
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
Creas contenido para Instagram (@tapizados.nova): cercano, inspirador, profesional.
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

async function generateBlogContent(post: any, apiKey: string) {
  return callGemini(`Genera contenido para Instagram sobre este artículo del blog de ${BRAND_NAME}.

ARTÍCULO:
Título: ${post.title}
Categoría: ${post.category}
Extracto: ${post.excerpt || ""}
Contenido: ${(post.content || "").slice(0, 2000)}

Crea un carrusel de 5 slides. Devuelve JSON:
{
  "slides": [
    {"emoji": "✨", "title": "TÍTULO EN MAYÚSCULAS (max 6 palabras)", "body": "texto del slide (2-3 líneas)"},
    {"emoji": "🪡", "title": "...", "body": "..."},
    {"emoji": "💡", "title": "...", "body": "..."},
    {"emoji": "✅", "title": "...", "body": "..."},
    {"emoji": "📞", "title": "PIDE TU PRESUPUESTO", "body": "Visítanos en Rubí o escríbenos por WhatsApp. Más de 500 telas disponibles."}
  ],
  "caption_hook": "primera línea gancho (max 140 chars, sin hashtags)",
  "caption_body": "cuerpo del caption, máx 800 chars, emojis y saltos de línea",
  "cta": "Lee el artículo completo → ${SITE_URL}/blog/${post.slug}",
  "image_queries": ["english query 1","english query 2","english query 3","english query 4","english query 5"],
  "extra_hashtags": ["#renovacion","#interiorismo", ... 8 hashtags temáticos]
}`, apiKey);
}

async function generateTipsContent(weekNum: number, apiKey: string) {
  const topic = TIPS_TOPICS[weekNum % TIPS_TOPICS.length];
  return callGemini(`Crea un carrusel de Instagram con consejos prácticos sobre: "${topic}" para ${BRAND_NAME}.

Devuelve JSON:
{
  "slides": [
    {"emoji": "💡", "title": "TÍTULO EN MAYÚSCULAS (max 6 palabras)", "body": "consejo práctico (2-3 líneas)"},
    {"emoji": "🪡", "title": "...", "body": "..."},
    {"emoji": "✔️", "title": "...", "body": "..."},
    {"emoji": "🎨", "title": "...", "body": "..."},
    {"emoji": "📍", "title": "TAPIZADOS NOVA · RUBÍ", "body": "Taller artesanal en Rubí (Barcelona). Más de 30 años de experiencia. Pide tu presupuesto sin compromiso."}
  ],
  "caption_hook": "gancho potente para la primera línea (max 140 chars)",
  "caption_body": "cuerpo del caption con los consejos, máx 800 chars, emojis y saltos de línea",
  "cta": "Pide presupuesto sin compromiso en ${SITE_URL}",
  "image_queries": ["english query 1","english query 2","english query 3","english query 4","english query 5"],
  "extra_hashtags": ["#tejido","#tapiceria", ... 8 hashtags relevantes]
}`, apiKey);
}

async function generateInspirationContent(weekNum: number, apiKey: string) {
  const topic = INSPIRATION_TOPICS[weekNum % INSPIRATION_TOPICS.length];
  return callGemini(`Crea un carrusel de Instagram inspiracional sobre: "${topic}" para ${BRAND_NAME}.

Devuelve JSON:
{
  "slides": [
    {"emoji": "🏠", "title": "TÍTULO INSPIRADOR (max 6 palabras)", "body": "texto inspiracional (2-3 líneas)"},
    {"emoji": "✨", "title": "...", "body": "..."},
    {"emoji": "🎨", "title": "...", "body": "..."},
    {"emoji": "💫", "title": "...", "body": "..."},
    {"emoji": "📲", "title": "¿TE INSPIRA? HÁBLANOS", "body": "En ${BRAND_NAME} transformamos tus ideas en realidad. Rubí, Barcelona. tapizadosnova.es"}
  ],
  "caption_hook": "gancho inspiracional potente (max 140 chars)",
  "caption_body": "cuerpo inspiracional, máx 800 chars, emojis y saltos de línea",
  "cta": "Transforma tu hogar → ${SITE_URL}",
  "image_queries": ["english query 1","english query 2","english query 3","english query 4","english query 5"],
  "extra_hashtags": ["#interiorismo","#decoracion", ... 8 hashtags relevantes]
}`, apiKey);
}

function buildCaption(content: any): string {
  const { slides, caption_hook, caption_body, cta, extra_hashtags } = content;
  const slideSection = (slides as any[])
    .map((s, i) => `${s.emoji || "▪️"} SLIDE ${i + 1}: ${s.title}\n${s.body}`)
    .join("\n\n");
  const hashtags = [...BASE_HASHTAGS, ...(extra_hashtags ?? [])].slice(0, 28).join(" ");
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
    hashtags,
  ].join("\n");
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
    const expected = Deno.env.get("BLOG_AUTOMATION_SECRET");
    if (!expected) return jsonRes({ error: "automation_secret_missing" }, 500);
    if ((req.headers.get("x-automation-secret") ?? "") !== expected)
      return jsonRes({ error: "unauthorized" }, 401);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return jsonRes({ error: "LOVABLE_API_KEY missing" }, 500);

    const webhookUrl = Deno.env.get("MAKE_INSTAGRAM_WEBHOOK_URL");

    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const supaSrv = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supaUrl, supaSrv);

    let body: any = {};
    try { body = await req.json(); } catch {}

    const dryRun: boolean = body?.dry_run === true;
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));

    // Post type: from body, or inferred from day of week
    let postType: "blog" | "tips" | "inspiration" = body?.type;
    if (!postType) {
      const day = new Date().getDay();
      postType = day === 1 ? "blog" : day === 3 ? "tips" : "inspiration";
    }

    // ── 1. Generate AI content ───────────────────────────────────────────────
    let content: any;
    let blogPostId: string | undefined;

    if (postType === "blog") {
      const { data: posts } = await admin
        .from("blog_posts")
        .select("id,title,slug,excerpt,content,category")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1);
      const post = posts?.[0];
      if (!post) return jsonRes({ ok: true, message: "No published posts yet" });
      content = await generateBlogContent(post, apiKey);
      blogPostId = post.id;
    } else if (postType === "tips") {
      content = await generateTipsContent(weekNum, apiKey);
    } else {
      content = await generateInspirationContent(weekNum, apiKey);
    }

    // ── 2. Fetch Pexels images + upload to Supabase Storage ──────────────────
    const imageQueries: string[] = Array.isArray(content.image_queries)
      ? content.image_queries.slice(0, 5)
      : ["upholstery fabric", "sofa interior", "velvet armchair", "fabric design", "living room"];

    const ts = Date.now();
    const slideUrls: string[] = [];

    for (let i = 0; i < 5; i++) {
      const query = imageQueries[i] || "interior design";
      const results = await searchPexels(query, 3);
      const pexelsUrl = results[0]?.url;
      if (!pexelsUrl) continue;

      const filename = `${postType}-${ts}-slide${i + 1}.jpg`;
      const stored = await uploadSlideToStorage(pexelsUrl, filename, admin);
      slideUrls.push(stored ?? pexelsUrl); // fallback to Pexels URL
    }

    if (slideUrls.length < 2) return jsonRes({ error: "Not enough slide images" }, 500);

    // ── 3. Build caption ─────────────────────────────────────────────────────
    const caption = buildCaption(content);

    // ── 4. Build Make.com payload ────────────────────────────────────────────
    // Make receives each slide as image_1…image_5 + the full caption
    const makePayload: Record<string, unknown> = {
      post_type: postType,
      caption,
      image_1: slideUrls[0] ?? null,
      image_2: slideUrls[1] ?? null,
      image_3: slideUrls[2] ?? null,
      image_4: slideUrls[3] ?? null,
      image_5: slideUrls[4] ?? null,
      slide_count: slideUrls.length,
      ...(blogPostId && { blog_post_id: blogPostId }),
    };

    // ── 5. Call Make webhook (or skip in dry_run) ────────────────────────────
    let makeResult: { ok: boolean; body: string } | null = null;
    let status = "pending";

    if (dryRun) {
      status = "dry_run";
    } else if (!webhookUrl) {
      status = "pending";
      console.warn("MAKE_INSTAGRAM_WEBHOOK_URL not set — content saved but not posted");
    } else {
      makeResult = await callMakeWebhook(webhookUrl, makePayload);
      status = makeResult.ok ? "published" : "error";
    }

    // ── 6. Log to DB ─────────────────────────────────────────────────────────
    await admin.from("instagram_posts_log").insert({
      post_type: postType,
      blog_post_id: blogPostId ?? null,
      caption,
      slide_urls: slideUrls,
      hashtags: [...BASE_HASHTAGS, ...(content.extra_hashtags ?? [])],
      status,
      error_msg: makeResult && !makeResult.ok ? makeResult.body : null,
      published_at: status === "published" ? new Date().toISOString() : null,
    });

    return jsonRes({
      ok: true,
      dry_run: dryRun,
      post_type: postType,
      status,
      slides: slideUrls.length,
      slide_urls: slideUrls,
      caption_preview: caption.slice(0, 500) + "\n...",
      make_response: makeResult?.body ?? null,
    });

  } catch (e) {
    console.error("instagram-auto-post error:", e);
    return jsonRes({ error: e instanceof Error ? e.message : "internal_error" }, 500);
  }
});
