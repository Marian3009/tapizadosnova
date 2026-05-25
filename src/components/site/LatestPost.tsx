import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,content,category,featured_image_url,featured_image_alt,published_at,created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPost((data as PostRow) ?? null));
  }, []);

  if (!post) return null;

  const date = new Date(post.published_at ?? post.created_at).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <section id="ultimo-articulo" className="section-padding bg-background">
      <div className="container-narrow max-w-4xl">
        <SectionHeader
          eyebrow="Artículo de la semana"
          title="Lo último del blog"
          subtitle="Cada semana publicamos nuevos consejos, tendencias e inspiración sobre tapicería."
        />

        <article className="reveal mt-12 rounded-xl overflow-hidden bg-cream shadow-[var(--shadow-card)]">
          {post.featured_image_url && (
            <Link to={`/blog/${post.slug}`} className="block">
              <div className="relative aspect-[16/9] overflow-hidden bg-navy/10">
                <img
                  src={post.featured_image_url}
                  alt={post.featured_image_alt || post.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </Link>
          )}

          <div className="p-6 md:p-10">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-gold mb-3">
              <span className="inline-flex items-center gap-1"><Tag size={14} />{post.category}</span>
              <span className="inline-flex items-center gap-1"><Calendar size={14} />{date}</span>
            </div>

            <h3 className="font-display text-2xl md:text-3xl text-navy leading-snug mb-4">
              <Link to={`/blog/${post.slug}`} className="hover:text-gold transition-colors">
                {post.title}
              </Link>
            </h3>

            {post.excerpt && (
              <p className="text-muted-foreground leading-relaxed mb-2">{post.excerpt}</p>
            )}

            {post.content && (
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="content" className="border-b-0">
                  <AccordionTrigger className="font-display text-base text-navy hover:text-gold hover:no-underline py-4">
                    Leer artículo completo
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div
                      className="prose-blog text-foreground/90 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="gold">
                <Link to={`/blog/${post.slug}`}>Ver artículo completo <ArrowRight size={16} /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/blog">Ver todos los artículos</Link>
              </Button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
