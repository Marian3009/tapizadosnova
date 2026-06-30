import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { markdownToHtml } from "@/lib/markdown";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  published_at: string | null;
  created_at: string;
}

export default function LatestPost() {
  const [post, setPost] = useState<PostRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,content,category,featured_image_url,featured_image_alt,published_at,created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setPost((data as PostRow) ?? null);
        setLoading(false);
      });
  }, []);

  if (loading || !post) return null;

  const date = new Date(post.published_at ?? post.created_at).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  });

  const html = markdownToHtml(post.content || "");

  return (
    <section id="ultimo-articulo" className="section-padding bg-background">
      <div className="container-narrow max-w-4xl">
        <SectionHeader
          eyebrow="Artículo de la semana"
          title="Lo último del blog"
          subtitle="Cada lunes publicamos nuevos consejos, tendencias e inspiración sobre tapicería."
        />

        <article className="reveal mt-12">
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-gold mb-4">
            <span className="inline-flex items-center gap-1.5"><Tag size={13} />{post.category}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar size={13} />{date}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-navy leading-snug mb-5">
            <Link to={`/blog/${post.slug}`} className="hover:text-gold transition-colors duration-300">
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              {post.excerpt}
            </p>
          )}

          {/* Featured image */}
          {post.featured_image_url && (
            <Link to={`/blog/${post.slug}`} className="block mb-10">
              <div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-navy/10 shadow-[var(--shadow-elegant)]">
                <img
                  src={post.featured_image_url}
                  alt={post.featured_image_alt || post.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover hover:scale-103 transition-transform duration-700"
                />
              </div>
            </Link>
          )}

          {/* Full article content with inline images */}
          {html && (
            <div
              className="prose-blog max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          {/* CTA buttons */}
          <div className="mt-10 flex flex-wrap gap-3 pt-8 border-t border-border">
            <Button asChild variant="gold">
              <Link to={`/blog/${post.slug}`}>
                Leer en el blog <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/blog">Ver todos los artículos</Link>
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}
