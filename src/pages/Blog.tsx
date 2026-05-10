import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BlogHeader from "@/components/site/BlogHeader";
import Footer from "@/components/site/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applySeo } from "@/lib/seo";
import { SITE_URL, organizationJsonLd, ORG_ID } from "@/lib/orgSchema";
import { BLOG_CATEGORIES } from "@/lib/blogCategories";

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
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>("Todas");
  const [q, setQ] = useState("");

  useEffect(() => {
    applySeo({
      title: "Blog | Tapizados Nova - Tapicería y decoración textil",
      description: "Consejos, tendencias e inspiración sobre tapicería, decoración textil e interiorismo. Aprende a renovar tus muebles con Tapizados Nova.",
      path: "/blog",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          organizationJsonLd,
          {
            "@type": "Blog",
            "@id": `${SITE_URL}/blog#blog`,
            url: `${SITE_URL}/blog`,
            name: "Blog Tapizados Nova",
            publisher: { "@id": ORG_ID },
          },
        ],
      },
    });
  }, []);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,category,featured_image_url,featured_image_alt,published_at,created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as PostRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (cat !== "Todas" && p.category !== cat) return false;
      if (q && !`${p.title} ${p.excerpt ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [posts, cat, q]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BlogHeader />

      <section className="bg-cream py-14 md:py-20">
        <div className="container-narrow text-center">
          <span className="text-gold uppercase tracking-[0.3em] text-xs font-semibold">Blog</span>
          <h1 className="font-display text-4xl md:text-6xl text-navy mt-3">
            Inspiración, consejos y tendencias
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Todo sobre tapicería, decoración textil e interiorismo. Aprende a renovar tus muebles
            y descubre las últimas tendencias del hogar con el equipo de Tapizados Nova.
          </p>
        </div>
      </section>

      <main className="flex-1 section-padding">
        <div className="container-narrow">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
            <Input
              placeholder="Buscar artículos…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="md:max-w-sm"
            />
            <div className="flex flex-wrap gap-2">
              {["Todas", ...BLOG_CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`text-xs uppercase tracking-widest px-3 py-2 rounded-full border transition-colors ${
                    cat === c ? "bg-navy text-cream border-navy" : "border-navy/20 text-navy hover:border-gold hover:text-gold"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Cargando artículos…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">Aún no hay artículos publicados en esta categoría.</p>
              <Button asChild variant="gold"><Link to="/#presupuesto">Pedir presupuesto</Link></Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className="group flex flex-col rounded-xl overflow-hidden bg-cream shadow-[var(--shadow-card)] hover:shadow-xl transition-shadow duration-500"
                >
                  <Link to={`/blog/${p.slug}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-navy/10">
                      {p.featured_image_url ? (
                        <img
                          src={p.featured_image_url}
                          alt={p.featured_image_alt || p.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gold font-display text-3xl">
                          Tapizados Nova
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-gold mb-3">
                      <span className="inline-flex items-center gap-1"><Tag size={14} />{p.category}</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(p.published_at ?? p.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl text-navy leading-snug mb-3">
                      <Link to={`/blog/${p.slug}`} className="hover:text-gold transition-colors">{p.title}</Link>
                    </h2>
                    {p.excerpt && <p className="text-muted-foreground text-sm flex-1">{p.excerpt}</p>}
                    <Link to={`/blog/${p.slug}`} className="inline-flex items-center gap-2 mt-5 text-navy font-semibold hover:text-gold transition-colors">
                      Leer más <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
