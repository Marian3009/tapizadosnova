import SectionHeader from "./SectionHeader";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

const items = [
  { img: g1, title: "Sofá Chester Restaurado", cat: "Sofás" },
  { img: g2, title: "Sillas de Comedor Rústico", cat: "Sillas" },
  { img: g3, title: "Cabecero Acolchado Velvet", cat: "Cabeceros" },
  { img: g4, title: "Sofá Chaise Longue Moderno", cat: "Sofás" },
  { img: g5, title: "Butaca Vintage Mostaza", cat: "Sillas" },
  { img: g6, title: "Cabecero Boucle a Medida", cat: "Cabeceros" },
];

export default function Gallery() {
  return (
    <section id="galeria" className="section-padding bg-cream">
      <div className="container-narrow">
        <SectionHeader eyebrow="Galería" title="Trabajos que hablan por sí solos" subtitle="Una selección de proyectos que hemos transformado para nuestros clientes." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {items.map((it, i) => (
            <article
              key={it.title}
              className="reveal group relative overflow-hidden rounded-xl shadow-[var(--shadow-card)] aspect-[4/5] cursor-pointer"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <img
                src={it.img}
                alt={it.title}
                loading="lazy"
                width={800}
                height={800}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
              <span className="absolute top-4 left-4 bg-gold text-navy text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {it.cat}
              </span>
              <div className="absolute bottom-0 inset-x-0 p-6 text-cream translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="font-display text-2xl">{it.title}</h3>
                <div className="h-px w-10 bg-gold mt-2 group-hover:w-20 transition-all duration-500" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
