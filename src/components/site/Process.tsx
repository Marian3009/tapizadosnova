import SectionHeader from "./SectionHeader";

const steps = [
  { n: "01", title: "Contacto y medición", desc: "Visitamos tu hogar o nos envías fotos para evaluar el trabajo." },
  { n: "02", title: "Elección de tela", desc: "Te asesoramos entre más de 500 telas disponibles." },
  { n: "03", title: "Tapizado artesanal", desc: "Trabajamos con mimo y técnicas tradicionales en nuestro taller." },
  { n: "04", title: "Entrega en tu domicilio", desc: "Te devolvemos tu mueble como nuevo, listo para disfrutar." },
];

export default function Process() {
  return (
    <section className="section-padding bg-cream">
      <div className="container-narrow">
        <SectionHeader eyebrow="Nuestro Proceso" title="Cuatro pasos hacia un resultado impecable" />
        <div className="relative mt-20 grid md:grid-cols-4 gap-10">
          <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-gold/30" />
          {steps.map((s, i) => (
            <div key={s.n} className="reveal relative text-center" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="relative z-10 mx-auto w-16 h-16 rounded-full bg-gold text-navy flex items-center justify-center font-display text-xl font-bold shadow-[var(--shadow-gold)]">
                {s.n}
              </div>
              <h3 className="font-display text-xl text-navy mt-6 mb-3">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
