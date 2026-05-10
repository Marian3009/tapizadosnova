// Generates a blog post draft using the Lovable AI Gateway.
// Admins call this from the panel to turn a weekly idea into a draft post.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").slice(0, 80);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { title, category, idea_id } = await req.json();
    if (!title) throw new Error("title is required");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    // Verify caller is admin
    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const supaSrv = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supaUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const adminClient = createClient(supaUrl, supaSrv);
    const { data: roleRow } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const system = `Eres redactor profesional para Tapizados Nova, tapicería artesanal en Rubí (Barcelona). Escribes en español, tono cercano, profesional y cálido. Devuelves JSON estricto.`;
    const userPrompt = `Genera un artículo de blog para Tapizados Nova.
Título base: "${title}"
Categoría: "${category}"

Estructura el artículo así (markdown en el campo content):
- Introducción cercana
- Varios subtítulos H2
- Consejos prácticos en listas cuando proceda
- Mención natural a Tapizados Nova
- CTA final invitando a pedir presupuesto en /#presupuesto o WhatsApp

Devuelve SOLO un JSON válido con estas claves:
{
  "title": "título SEO definitivo (<60 chars)",
  "slug": "slug-amigable",
  "excerpt": "extracto breve (<160 chars)",
  "content": "markdown completo del artículo (>=600 palabras)",
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
      throw new Error(`AI gateway error ${aiRes.status}: ${t}`);
    }
    const aiJson = await aiRes.json();
    const raw = aiJson.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    const slug = (parsed.slug && slugify(parsed.slug)) || slugify(parsed.title || title);
    const finalSlug = `${slug}-${Date.now().toString(36)}`;

    const insert = {
      title: parsed.title || title,
      slug: finalSlug,
      excerpt: parsed.excerpt || "",
      content: parsed.content || "",
      category,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      featured_image_alt: parsed.featured_image_alt || parsed.title || title,
      seo_title: parsed.seo_title || parsed.title || title,
      seo_description: parsed.seo_description || parsed.excerpt || "",
      status: "draft" as const,
    };

    const { data: post, error: insErr } = await adminClient.from("blog_posts").insert(insert).select().single();
    if (insErr) throw insErr;

    if (idea_id) {
      await adminClient.from("blog_ideas")
        .update({ status: "generated", generated_post_id: post.id })
        .eq("id", idea_id);
    }

    return new Response(JSON.stringify({ post }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog-post error:", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
