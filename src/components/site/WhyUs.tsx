import { Award, Palette, Clock, Truck, ShieldCheck, Heart } from "lucide-react";
import SectionHeader from "./SectionHeader";

const items = [
  { icon: Award, title: "+30 años de experiencia", desc: "Tres décadas perfeccionando el oficio del tapizado artesanal desde 1995." },
  { icon: Palette, title: "Más de 500 telas", desc: "Amplio catálogo de tejidos para cualquier estilo y necesidad." },
  { icon: Clock, title: "Presupuesto en 24h", desc: "Respuesta rápida y sin compromiso para todos tus proyectos." },
  { icon: Truck, title: "Recogida y entrega", desc: "Servicio puerta a puerta para tu mayor comodidad." },
  { icon: ShieldCheck, title: "Garantía de 2 años", desc: "Respaldamos cada trabajo con garantía total." },
  { icon: Heart, title: "Trato personalizado", desc: "Empresa familiar con un trato cercano y humano." },
];

export default function WhyUs() {
  return (
    <section className="section-padding bg-white">
      <div className="container-narrow">
        <SectionHeader eyebrow="Por qué elegirnos" title="La diferencia está en los detalles" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {items.map((it, i) => (
            <div key={it.title} className="reveal flex gap-5" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                <it.icon className="text-gold" size={26} />
              </div>
              <div>
                <h3 className="font-display text-xl text-navy mb-2">{it.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
