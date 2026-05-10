import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  published_at: string | null;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<PostRow[]>([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,category,featured_image_url,featured_image_alt,published_at,created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setPosts((data as PostRow[]) ?? []));
  }, []);

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="section-padding bg-background">
      <div className="container-narrow">
        <SectionHeader
          eyebrow="Blog"
          title="Consejos e inspiración"
          subtitle="Guías, tendencias y trucos para sacar el máximo partido a tu tapicería."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {posts.map((post, i) => (
            <article
              key={post.id}
              className="reveal group flex flex-col rounded-xl overflow-hidden bg-cream shadow-[var(--shadow-card)] hover:shadow-xl transition-shadow duration-500"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <Link to={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-navy/10">
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.featured_image_alt || post.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gold font-display text-2xl">
                      Tapizados Nova
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-gold mb-3">
                  <span className="inline-flex items-center gap-1"><Tag size={14} />{post.category}</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.published_at ?? post.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <h3 className="font-display text-2xl text-navy leading-snug mb-3">
                  <Link to={`/blog/${post.slug}`} className="hover:text-gold transition-colors">{post.title}</Link>
                </h3>
                {post.excerpt && <p className="text-muted-foreground text-sm flex-1">{post.excerpt}</p>}
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 mt-5 text-navy font-semibold hover:text-gold transition-colors"
                >
                  Leer más <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="reveal text-center mt-14">
          <Button asChild variant="gold" size="lg">
            <Link to="/blog">Ver todos los artículos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
