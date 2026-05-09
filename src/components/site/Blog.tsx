import SectionHeader from "./SectionHeader";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";

const BLOG_POSTS = [
  {
    id: 1,
    title: "Tendencias en Tapicería 2026",
    excerpt:
      "Descubre cómo los tejidos naturales y las telas inteligentes están transformando los hogares este año.",
    date: "8 de Mayo, 2026",
    image: g1,
    slug: "tendencias-tapiceria-2026",
  },
  {
    id: 2,
    title: "Cómo elegir la tela perfecta para tu sofá",
    excerpt:
      "Resistencia, textura y color: claves para acertar con el tejido que vestirá tu salón durante años.",
    date: "22 de Abril, 2026",
    image: g2,
    slug: "elegir-tela-sofa",
  },
  {
    id: 3,
    title: "Restaurar o tapizar de nuevo: ¿qué te conviene?",
    excerpt:
      "Te explicamos cuándo merece la pena restaurar un mueble antiguo y cuándo conviene un tapizado completo.",
    date: "5 de Abril, 2026",
    image: g3,
    slug: "restaurar-o-tapizar",
  },
];

export default function Blog() {
  return (
    <section id="blog" className="section-padding bg-background">
      <div className="container-narrow">
        <SectionHeader
          eyebrow="Blog"
          title="Consejos e inspiración"
          subtitle="Guías, tendencias y trucos para sacar el máximo partido a tu tapicería."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {BLOG_POSTS.map((post, i) => (
            <article
              key={post.id}
              className="reveal group flex flex-col rounded-xl overflow-hidden bg-cream shadow-[var(--shadow-card)] hover:shadow-xl transition-shadow duration-500"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-3">
                  <Calendar size={14} />
                  <span>{post.date}</span>
                </div>
                <h3 className="font-display text-2xl text-navy leading-snug mb-3">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm flex-1">{post.excerpt}</p>
                <a
                  href={`#blog`}
                  className="inline-flex items-center gap-2 mt-5 text-navy font-semibold hover:text-gold transition-colors"
                >
                  Leer más <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="reveal text-center mt-14">
          <Button asChild variant="gold" size="lg">
            <a href="#contacto">Ver todos los artículos</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
