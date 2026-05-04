import { Sofa, Armchair, BedDouble, Sparkles } from "lucide-react";
import SectionHeader from "./SectionHeader";

const services = [
  { icon: Sofa, title: "Tapizado de Sofás", desc: "Renovamos sofás de todos los estilos, desde clásicos hasta modernos. Más de 500 telas disponibles." },
  { icon: Armchair, title: "Sillas y Butacas", desc: "Restauración y tapizado completo de sillas de comedor, butacas y sillones." },
  { icon: BedDouble, title: "Cabeceros", desc: "Fabricación a medida e instalación de cabeceros tapizados para dormitorios." },
  { icon: Sparkles, title: "Restauración", desc: "Recuperamos muebles antiguos con técnicas artesanales y materiales de primera calidad." },
];

export default function Services() {
  return (
    <section id="servicios" className="section-padding bg-cream">
      <div className="container-narrow">
        <SectionHeader eyebrow="Nuestros Servicios" title="Maestría artesanal en cada detalle" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="reveal group bg-white p-8 rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-2 transition-all duration-500 border-t-2 border-transparent hover:border-gold"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-14 h-14 rounded-lg bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold transition-colors duration-500">
                <s.icon className="text-gold group-hover:text-navy transition-colors duration-500" size={28} />
              </div>
              <h3 className="font-display text-2xl text-navy mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
