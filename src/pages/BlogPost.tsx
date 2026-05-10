import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BlogHeader from "@/components/site/BlogHeader";
import Footer from "@/components/site/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import BlogCTA from "@/components/site/BlogCTA";
import { Calendar, Tag, ArrowLeft } from "lucide-react";
import { applySeo } from "@/lib/seo";
import { SITE_URL, organizationJsonLd, ORG_ID } from "@/lib/orgSchema";
import { markdownToHtml } from "@/lib/markdown";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  tags: string[] | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setPost(data as Post);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const url = `${SITE_URL}/blog/${post.slug}`;
    const date = post.published_at ?? post.created_at;
    applySeo({
      title: (post.seo_title || post.title) + " | Tapizados Nova",
      description: post.seo_description || post.excerpt || "",
      path: `/blog/${post.slug}`,
      ogType: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          organizationJsonLd,
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
          {
            "@type": "Article",
            "@id": `${url}#article`,
            headline: post.title,
            description: post.excerpt,
            image: post.featured_image_url ? [post.featured_image_url] : undefined,
            datePublished: date,
            dateModified: post.updated_at,
            mainEntityOfPage: url,
            articleSection: post.category,
            keywords: post.tags?.join(", "),
            author: { "@id": ORG_ID },
            publisher: { "@id": ORG_ID },
          },
        ],
      },
    });
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader compact />
        <div className="container-narrow py-20 text-center text-muted-foreground">Cargando artículo…</div>
      </div>
    );
  }
  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader compact />
        <div className="container-narrow py-20 text-center">
          <h1 className="font-display text-3xl text-navy mb-4">Artículo no encontrado</h1>
          <Link to="/blog" className="text-gold hover:underline">← Volver al blog</Link>
        </div>
      </div>
    );
  }

  const html = markdownToHtml(post.content || "");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BlogHeader compact />
      <main className="flex-1">
        <article className="section-padding">
          <div className="container-narrow max-w-3xl">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-navy hover:text-gold mb-6">
              <ArrowLeft size={16} /> Volver al blog
            </Link>

            <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-gold mb-4">
              <span className="inline-flex items-center gap-1"><Tag size={14} />{post.category}</span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} />
                {new Date(post.published_at ?? post.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-navy leading-tight mb-6">
              {post.title}
            </h1>
            {post.excerpt && <p className="text-lg text-muted-foreground mb-8">{post.excerpt}</p>}

            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt || post.title}
                className="w-full rounded-xl shadow-[var(--shadow-card)] mb-10 aspect-[16/9] object-cover"
              />
            )}

            <div
              className="prose-blog max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <BlogCTA variant="presupuesto" />

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {post.tags.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-cream text-navy border border-navy/10">#{t}</span>
                ))}
              </div>
            )}

            <BlogCTA variant="renueva" />
          </div>
        </article>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
