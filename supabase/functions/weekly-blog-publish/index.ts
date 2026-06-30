// Automated weekly blog publisher.
// - Picks the next pending blog idea (lowest week_number).
// - Generates a full article with interleaved stock photos via Lovable AI Gateway.
// - Fetches images from Pexels (if PEXELS_API_KEY is set) or falls back to curated Unsplash pool.
// - Publishes directly (status=published, published_at=now) by default for automated runs.
// - Sends internal notification email to tapizadosnova@gmail.com.
//
// Auth: X-Automation-Secret header OR ?secret= URL param.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-automation-secret",
};

// Curated pool of relevant interior/upholstery photos from Unsplash (always available)
const FALLBACK_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80", alt: "sofá tapizado moderno en sala de estar" },
  { url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=80", alt: "tejido premium para tapicería" },
  { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80", alt: "sala de estar con sofá tapizado en tonos neutros" },
  { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80", alt: "tela de terciopelo para tapicería" },
  { url: "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?w=900&q=80", alt: "sofá contemporáneo de diseño" },
  { url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=80", alt: "sillón tapizado restaurado" },
  { url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=80", alt: "interiorismo con muebles tapizados elegantes" },
  { url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=900&q=80", alt: "diseño de interiores con tapizados artesanales" },
  { url: "https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=900&q=80", alt: "cabecero tapizado en dormitorio" },
  { url: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=900&q=80", alt: "muestras de telas para tapizar muebles" },
  { url: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=900&q=80", alt: "taller de tapicería artesanal" },
  { url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=900&q=80", alt: "detalle de costura en tapizado de calidad" },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").slice(0, 80);
}

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchPexelsImage(query: string): Promise<{ url: string; alt: string } | null> {
  const apiKey = Deno.env.get("PEXELS_API_KEY");
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&size=large`,
      { headers: { Authorization: apiKey } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data.photos?.[0];
    if (!photo) return null;
    return { url: photo.src.large2x || photo.src.large, alt: photo.alt || query };
  } catch {
    return null;
  }
}

async function getPhoto(query: string, index: number): Promise<{ url: string; alt: string }> {
  const pexels = await fetchPexelsImage(query);
  if (pexels) return pexels;
  return FALLBACK_PHOTOS[index % FALLBACK_PHOTOS.length];
}

// Injects images into markdown content: one image after each H2 heading.
async function injectImagesIntoContent(
  content: string,
  queries: string[]
): Promise<{ enriched: string; featuredUrl: string; featuredAlt: string }> {
  if (!queries.length) {
    const photo = await getPhoto("tapicería sofá premium", 0);
    return { enriched: content, featuredUrl: photo.url, featuredAlt: photo.alt };
  }

  // Find all H2 positions
  const h2Regex = /^## .+$/gm;
  const matches: { index: number; match: string }[] = [];
  let m;
  while ((m = h2Regex.exec(content)) !== null) {
    matches.push({ index: m.index, match: m[0] });
  }

  // Fetch photos for each H2 section (up to queries.length)
  const photos = await Promise.all(
    queries.slice(0, Math.max(matches.length, 1)).map((q, i) => getPhoto(q, i))
  );

  // Featured image is the first one
  const featured = photos[0];

  // Inject images after each H2 heading
  if (!matches.length) {
    return { enriched: content, featuredUrl: featured.url, featuredAlt: featured.alt };
  }

  // Build enriched content by splicing image markdown after each H2
  let result = content;
  let offset = 0;
  matches.forEach(({ index, match }, i) => {
    const photo = photos[Math.min(i, photos.length - 1)];
    const imgMarkdown = `\n\n![${photo.alt}](${photo.url})\n\n`;
    const insertAt = index + offset + match.length;
    result = result.slice(0, insertAt) + imgMarkdown + result.slice(insertAt);
    offset += imgMarkdown.length;
  });

  return { enriched: result, featuredUrl: featured.url, featuredAlt: featured.alt };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ---- Auth: shared secret ----
    const expected = Deno.env.get("BLOG_AUTOMATION_SECRET");
    if (!expected) {
      console.error("BLOG_AUTOMATION_SECRET not configured");
      return jsonRes({ error: "automation_secret_missing" }, 500);
    }
    const provided =
      req.headers.get("x-automation-secret") ??
      new URL(req.url).searchParams.get("secret") ?? "";
    if (provided !== expected) {
      return jsonRes({ error: "unauthorized" }, 401);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return jsonRes({ error: "LOVABLE_API_KEY missing" }, 500);

    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const supaSrv = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supaUrl, supaSrv);

    let body: any = null;
    try { body = await req.json(); } catch { /* may be GET / empty */ }
    const forcedIdeaId: string | undefined = body?.idea_id;
    const shouldPublish: boolean = body?.publish !== false; // default: publish
    const mode: "draft" | "published" = shouldPublish ? "published" : "draft";

    // ---- Pick the next idea ----
    let ideaQuery = admin.from("blog_ideas").select("*").limit(1);
    if (forcedIdeaId) {
      ideaQuery = ideaQuery.eq("id", forcedIdeaId);
    } else {
      ideaQuery = ideaQuery.eq("status", "pending").order("week_number", { ascending: true });
    }
    const { data: ideas, error: ideaErr } = await ideaQuery;
    if (ideaErr) throw ideaErr;
    const idea = ideas?.[0];
    if (!idea) return jsonRes({ ok: true, message: "No pending ideas" });

    // ---- Generate article with AI ----
    const system = `Eres redactor profesional para Tapizados Nova, tapicería artesanal en Rubí (Barcelona). Escribes en español, tono cercano, profesional y cálido. Devuelves JSON estricto.`;
    const userPrompt = `Genera un artículo de blog para Tapizados Nova.
Título base: "${idea.title}"
Categoría: "${idea.category}"

Estructura el artículo (markdown en content):
- Introducción cercana (2-3 párrafos)
- 3 o 4 secciones con subtítulos H2
- Consejos prácticos en listas cuando proceda
- Mención natural a Tapizados Nova
- CTA final invitando a pedir presupuesto en /#presupuesto o WhatsApp

Devuelve SOLO JSON válido:
{
  "title": "título SEO definitivo (<60 chars)",
  "slug": "slug-amigable",
  "excerpt": "extracto breve (<160 chars)",
  "content": "markdown completo (>=700 palabras, con H2 para cada sección)",
  "tags": ["3 a 6 etiquetas"],
  "seo_title": "<60 chars",
  "seo_description": "<160 chars",
  "featured_image_alt": "texto alternativo descriptivo",
  "image_queries": ["consulta en inglés para foto sección 1", "consulta sección 2", "consulta sección 3", "consulta sección 4"]
}

image_queries debe contener 3-4 búsquedas cortas en inglés (2-4 palabras) para encontrar fotos de stock relevantes para cada H2 del artículo.
Ejemplos: "upholstery fabric texture", "sofa reupholstering workshop", "luxury velvet armchair", "interior design living room".`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(`AI gateway ${aiRes.status}: ${t}`);
    }
    const aiJson = await aiRes.json();
    const parsed = JSON.parse(aiJson.choices?.[0]?.message?.content ?? "{}");

    const imageQueries: string[] = Array.isArray(parsed.image_queries) ? parsed.image_queries : [];

    // ---- Inject images into content ----
    const { enriched: enrichedContent, featuredUrl, featuredAlt } =
      await injectImagesIntoContent(parsed.content || "", imageQueries);

    const baseSlug = (parsed.slug && slugify(parsed.slug)) || slugify(parsed.title || idea.title);
    const finalSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const insert = {
      title: parsed.title || idea.title,
      slug: finalSlug,
      excerpt: parsed.excerpt || "",
      content: enrichedContent,
      category: idea.category,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      featured_image_url: featuredUrl,
      featured_image_alt: parsed.featured_image_alt || featuredAlt,
      seo_title: parsed.seo_title || parsed.title || idea.title,
      seo_description: parsed.seo_description || parsed.excerpt || "",
      status: mode,
      published_at: shouldPublish ? new Date().toISOString() : null,
    };

    const { data: post, error: insErr } = await admin
      .from("blog_posts").insert(insert).select().single();
    if (insErr) throw insErr;

    await admin.from("blog_ideas")
      .update({
        status: shouldPublish ? "published" : "generated",
        generated_post_id: post.id,
      })
      .eq("id", idea.id);

    // ---- Internal notification email ----
    const postUrl = `https://tapizadosnova.es/blog/${post.slug}`;
    try {
      await admin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "blog-weekly-published",
          templateData: {
            title: post.title,
            slug: post.slug,
            category: post.category,
            excerpt: post.excerpt,
            weekNumber: idea.week_number,
            postUrl,
            mode,
          },
          idempotencyKey: `blog-weekly-${post.id}`,
        },
      });
    } catch (mailErr) {
      console.error("notification email failed (continuing):", mailErr);
    }

    return jsonRes({
      ok: true,
      mode,
      post: { id: post.id, slug: post.slug, title: post.title, url: postUrl, status: mode },
      idea_id: idea.id,
      images_injected: imageQueries.length,
    });
  } catch (e) {
    console.error("weekly-blog-publish error:", e);
    return jsonRes({ error: e instanceof Error ? e.message : "internal_error" }, 500);
  }
});
