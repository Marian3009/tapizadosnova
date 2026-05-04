import { Star, Quote } from "lucide-react";
import SectionHeader from "./SectionHeader";

const reviews = [
  { text: "Tapizaron mi sofá y quedó como nuevo. Trato excelente y precio justo.", name: "María G.", city: "Rubí" },
  { text: "Restauraron 6 sillas antiguas de mi abuela. Trabajo impecable.", name: "Carlos M.", city: "Terrassa" },
  { text: "El cabecero que me hicieron a medida es perfecto. 100% recomendables.", name: "Ana P.", city: "Sant Cugat" },
];

export default function Testimonials() {
  return (
    <section className="section-padding bg-white">
      <div className="container-narrow">
        <SectionHeader eyebrow="Testimonios" title="Lo que dicen nuestros clientes" />
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {reviews.map((r, i) => (
            <div
              key={r.name}
              className="reveal relative bg-cream p-8 rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-500"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <Quote className="absolute top-6 right-6 text-gold/20" size={48} />
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, k) => (
                  <Star key={k} className="text-gold fill-gold" size={18} />
                ))}
              </div>
              <p className="text-navy/85 leading-relaxed mb-6 relative z-10">"{r.text}"</p>
              <div className="pt-4 border-t border-gold/20">
                <div className="font-display text-lg text-navy">{r.name}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">{r.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
