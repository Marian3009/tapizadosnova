import { useEffect } from "react";
import NovaTempoNavbar from "@/components/novatempo/NovaTempoNavbar";
import NovaTempoFooter from "@/components/novatempo/NovaTempoFooter";
import SectionHeader from "@/components/site/SectionHeader";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { applySeo } from "@/lib/seo";
import { NOVATEMPO } from "@/lib/novatempo/brand";
import { CATEGORIES, SPACES } from "@/lib/novatempo/catalog";
import heroImg from "@/assets/hero-sofa.jpg";

const AUDIENCES = [
  { icon: "🧵", title: "Tapicerías", text: "Muestra a tus clientes el resultado antes de tapizar. Cierra más presupuestos, con menos dudas." },
  { icon: "🏠", title: "Estudios de interiorismo", text: "Genera propuestas de decoración en segundos para presentar a tus clientes en la primera reunión." },
  { icon: "🛍️", title: "Tiendas de mobiliario y textil", text: "Deja que tus clientes prueben tus telas y productos sobre su propio espacio antes de comprar." },
  { icon: "✨", title: "Particulares", text: "¿Reformas tu casa? Visualiza cortinas, sofás o el jardín antes de gastar un euro." },
];

export default function NovaTempoLanding() {
  useReveal();

  useEffect(() => {
    applySeo({
      title: `${NOVATEMPO.name} — Decoración textil e interiorismo con IA`,
      description: NOVATEMPO.claim,
      path: NOVATEMPO.routes.landing,
      image: "/logo.png",
      imageAlt: NOVATEMPO.name,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NovaTempoNavbar />
      <main>
        {/* Hero */}
        <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-navy-deep">
          <img src={heroImg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy" />
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />

          <div className="container-narrow relative text-center">
            <div className="flex items-center justify-center gap-3 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <span className="h-px w-10 bg-gold" />
              <span className="text-gold uppercase tracking-[0.3em] text-xs font-medium">Para negocios de interiorismo y tapicería</span>
              <span className="h-px w-10 bg-gold" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-cream leading-[1.08] mb-6 opacity-0 animate-fade-in max-w-4xl mx-auto" style={{ animationDelay: "0.3s" }}>
              La IA que <span className="italic text-gold">visualiza</span> cualquier espacio o mueble en segundos
            </h1>
            <p className="text-lg md:text-xl text-cream/75 max-w-2xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: "0.45s" }}>
              Sofás, cortinas, cabeceros, camas, terrazas y jardines. Sube una foto y {NOVATEMPO.short} genera el resultado
              retapizado o una propuesta de decoración en tendencia, lista para enseñar al cliente.
            </p>
            <div className="flex flex-wrap gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <Button asChild variant="gold" size="xl">
                <a href={NOVATEMPO.routes.app}>✨ Probar gratis</a>
              </Button>
              <Button asChild variant="outline-cream" size="xl">
                <a href={NOVATEMPO.routes.pricing}>Ver planes y precios</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Para quién es */}
        <section className="section-padding bg-cream">
          <div className="container-narrow">
            <SectionHeader eyebrow="Para quién es" title="Una herramienta, muchos negocios" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {AUDIENCES.map((a, i) => (
                <div key={a.title} className="reveal bg-white rounded-xl p-6 shadow-[var(--shadow-card)] text-center" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="text-3xl mb-3">{a.icon}</div>
                  <h3 className="font-display text-lg text-navy mb-2">{a.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section id="categorias" className="section-padding bg-navy text-cream">
          <div className="container-narrow">
            <SectionHeader eyebrow="Qué genera" title="Del mueble al jardín, todo lo textil" light />
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-14">
              {CATEGORIES.map((c, i) => (
                <div key={c.id} className="reveal rounded-xl border border-gold/20 bg-navy-deep/60 p-5 text-center" style={{ transitionDelay: `${i * 60}ms` }}>
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="text-sm text-cream/85">{c.label}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-cream/60 text-sm mt-10 uppercase tracking-widest">También reconoce espacios</p>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {SPACES.map((s) => (
                <span key={s.id} className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-gold/30 text-gold/90">
                  {s.icon} {s.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="section-padding bg-cream">
          <div className="container-narrow">
            <SectionHeader eyebrow="Cómo funciona" title="Dos modos, un mismo resultado: convencer al cliente" />
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              <div className="reveal rounded-2xl border border-gold/20 p-8 bg-white shadow-[var(--shadow-card)]">
                <div className="text-3xl mb-3">🪑</div>
                <h3 className="font-display text-2xl text-navy mb-2">Retapizar un elemento</h3>
                <p className="text-muted-foreground leading-relaxed">
                  El cliente tiene un mueble, cortina o cabecero y una tela candidata. Subís las dos fotos y {NOVATEMPO.short}
                  {" "}genera el resultado realista al instante.
                </p>
              </div>
              <div className="reveal rounded-2xl border border-gold/20 p-8 bg-white shadow-[var(--shadow-card)]" style={{ transitionDelay: "100ms" }}>
                <div className="text-3xl mb-3">✨</div>
                <h3 className="font-display text-2xl text-navy mb-2">Proponer decoración</h3>
                <p className="text-muted-foreground leading-relaxed">
                  El espacio está vacío o incompleto. Subís una foto, elegís tipo de espacio y estilo, y la IA propone
                  mobiliario y textiles en tendencia, integrados en la foto real.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="section-padding bg-navy-deep text-center">
          <div className="container-narrow">
            <h2 className="font-display text-3xl md:text-4xl text-cream mb-4">Empieza gratis, sin tarjeta</h2>
            <p className="text-cream/70 max-w-xl mx-auto mb-8">5 generaciones al mes incluidas. Amplía cuando lo necesites.</p>
            <Button asChild variant="gold" size="xl">
              <a href={NOVATEMPO.routes.app}>Crear mi cuenta gratis</a>
            </Button>
          </div>
        </section>
      </main>
      <NovaTempoFooter />
    </div>
  );
}
