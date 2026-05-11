// Automated weekly blog publisher.
// - Picks the next pending blog idea (lowest week_number).
// - Generates a full article via Lovable AI Gateway.
// - Publishes it directly (status=published, published_at=now).
// - Marks the idea as 'published'.
// - Sends an internal notification email to tapizadosnova@gmail.com.
//
// Secured by the BLOG_AUTOMATION_SECRET header (X-Automation-Secret) so it
// can be safely exposed publicly (verify_jwt=false). Callable from pg_cron,
// n8n, Zapier, Make, GitHub Actions, etc.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-automation-secret",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").slice(0, 80);
}

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

    // Optional override (manual trigger from panel)
    let body: any = null;
    try { body = await req.json(); } catch { /* may be GET / empty */ }
    const forcedIdeaId: string | undefined = body?.idea_id;
    // Default behaviour: generate a DRAFT for manual review.
    // Pass { publish: true } to publish immediately (legacy behaviour).
    const shouldPublish: boolean = body?.publish === true;
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

Estructura el artículo así (markdown en content):
- Introducción cercana
- Varios subtítulos H2
- Consejos prácticos en listas cuando proceda
- Mención natural a Tapizados Nova
- CTA final invitando a pedir presupuesto en /#presupuesto o WhatsApp

Devuelve SOLO JSON válido:
{
  "title": "título SEO definitivo (<60 chars)",
  "slug": "slug-amigable",
  "excerpt": "extracto breve (<160 chars)",
  "content": "markdown completo (>=600 palabras)",
  "tags": ["3 a 6 etiquetas"],
  "seo_title": "<60 chars",
  "seo_description": "<160 chars",
  "featured_image_alt": "texto alternativo descriptivo"
}`;

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

    const baseSlug = (parsed.slug && slugify(parsed.slug)) || slugify(parsed.title || idea.title);
    const finalSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const insert = {
      title: parsed.title || idea.title,
      slug: finalSlug,
      excerpt: parsed.excerpt || "",
      content: parsed.content || "",
      category: idea.category,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      featured_image_alt: parsed.featured_image_alt || parsed.title || idea.title,
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
          to: "tapizadosnova@gmail.com",
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
          purpose: "transactional",
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
    });

    const { data: post, error: insErr } = await admin
      .from("blog_posts").insert(insert).select().single();
    if (insErr) throw insErr;

    await admin.from("blog_ideas")
      .update({ status: "published", generated_post_id: post.id })
      .eq("id", idea.id);

    // ---- Internal notification email ----
    const postUrl = `https://tapizadosnova.es/blog/${post.slug}`;
    try {
      await admin.functions.invoke("send-transactional-email", {
        body: {
          to: "tapizadosnova@gmail.com",
          templateName: "blog-weekly-published",
          templateData: {
            title: post.title,
            slug: post.slug,
            category: post.category,
            excerpt: post.excerpt,
            weekNumber: idea.week_number,
            postUrl,
          },
          idempotencyKey: `blog-weekly-${post.id}`,
          purpose: "transactional",
        },
      });
    } catch (mailErr) {
      console.error("notification email failed (continuing):", mailErr);
    }

    return jsonRes({
      ok: true,
      post: { id: post.id, slug: post.slug, title: post.title, url: postUrl },
      idea_id: idea.id,
    });
  } catch (e) {
    console.error("weekly-blog-publish error:", e);
    return jsonRes({ error: e instanceof Error ? e.message : "internal_error" }, 500);
  }
});
