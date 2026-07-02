import { useEffect } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import SectionHeader from "@/components/site/SectionHeader";
import AIVisualizerTool from "@/components/site/AIVisualizerTool";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useReveal } from "@/hooks/use-reveal";
import { applySeo } from "@/lib/seo";
import { buildPageGraph, SITE_URL } from "@/lib/orgSchema";
import heroImg from "@/assets/hero-sofa.jpg";

const STEPS = [
  { icon: "📷", title: "Sube una foto", text: "Haz una foto a tu sofá, silla, cabecero o butaca desde casa, sin necesidad de traerlo al taller." },
  { icon: "🧵", title: "Elige el tejido", text: "Sube una foto de una tela que te guste o elige entre cientos de referencias de nuestro catálogo real." },
  { icon: "✨", title: "Visualiza el resultado", text: "Nuestra IA genera en segundos una imagen realista de tu mueble tapizado con ese tejido." },
];

const BENEFITS = [
  { icon: "🎯", title: "Decide sin dudas", text: "Ve el resultado antes de encargar el trabajo, sin imaginar cómo quedará." },
  { icon: "⚡", title: "Resultado en segundos", text: "Sin esperas: nuestra IA procesa la imagen en menos de 30 segundos." },
  { icon: "🆓", title: "100% gratis", text: "Es una herramienta gratuita de Tapizados Nova, sin registro ni compromiso." },
  { icon: "🧵", title: "Catálogo real", text: "Prueba tejidos de nuestro catálogo real disponibles para tu presupuesto." },
];

const VISUALIZER_FAQS = [
  { q: "¿Es gratis usar el visualizador IA?", a: "Sí, totalmente gratis. Es una herramienta de Tapizados Nova pensada para ayudarte a decidir el tejido antes de pedir presupuesto, sin ningún coste ni registro." },
  { q: "¿Qué tan fiel es el resultado a la realidad?", a: "La imagen generada es orientativa: la IA respeta la forma y textura del mueble aplicando el color y patrón del tejido elegido, pero el acabado final en taller puede variar ligeramente según el tipo de tapizado." },
  { q: "¿Puedo usar una foto de una tela que no es vuestra?", a: "Sí, puedes subir la foto de cualquier tejido que te guste (de una tienda, una revista, Pinterest...) para ver cómo quedaría en tu mueble. También puedes elegir directamente de nuestro catálogo real." },
  { q: "¿Qué hago después de generar la visualización?", a: "Puedes descargar la imagen, guardarla, o pulsar en «Pedir presupuesto con esta tela» para que preparemos tu presupuesto real con ese tejido." },
  { q: "¿Qué tipo de muebles puedo visualizar?", a: "Sofás, sillas, butacas, cabeceros, puffs y la mayoría de mobiliario tapizable. Cuanto más clara y bien iluminada sea la foto, mejor será el resultado." },
];

export default function VisualizadorIA() {
  useReveal();

  useEffect(() => {
    const title = "Visualizador IA · Prueba tu tapizado antes de decidir | Tapizados Nova";
    const description =
      "Sube una foto de tu sofá o silla y visualiza en segundos, con inteligencia artificial, cómo quedaría con el tejido que elijas. Herramienta gratuita de Tapizados Nova.";

    const softwareNode = {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/visualizador-ia#app`,
      name: "Visualizador IA Tapizados Nova",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      url: `${SITE_URL}/visualizador-ia`,
      description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    };

    const faqPage = {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/visualizador-ia#faq`,
      mainEntity: VISUALIZER_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const jsonLd = buildPageGraph(softwareNode, [
      { name: "Inicio", path: "/" },
      { name: "Visualizador IA", path: "/visualizador-ia" },
    ]);
    (jsonLd["@graph"] as unknown[]).push(faqPage);

    applySeo({
      title,
      description,
      path: "/visualizador-ia",
      jsonLd,
      image: "/logo.png",
      imageAlt: "Visualizador IA de tapicería — Tapizados Nova",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-navy-deep">
          <img
            src={heroImg}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy" />
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />

          <div className="container-narrow relative text-center">
            <div className="flex items-center justify-center gap-3 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <span className="h-px w-10 bg-gold" />
              <span className="text-gold uppercase tracking-[0.3em] text-xs font-medium">Nuevo · Con inteligencia artificial</span>
              <span className="h-px w-10 bg-gold" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-cream leading-[1.08] mb-6 opacity-0 animate-fade-in max-w-4xl mx-auto" style={{ animationDelay: "0.3s" }}>
              Visualiza tu mueble <span className="italic text-gold">retapizado</span> antes de decidir
            </h1>
            <p className="text-lg md:text-xl text-cream/75 max-w-2xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: "0.45s" }}>
              Sube una foto de tu sofá, silla o cabecero y descubre en segundos cómo quedaría con el tejido que
              más te gusta. Gratis, sin registro y creado por Tapizados Nova.
            </p>
            <div className="flex flex-wrap gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <Button asChild variant="gold" size="xl">
                <a href="#herramienta">✨ Probar el visualizador gratis</a>
              </Button>
              <Button asChild variant="outline-cream" size="xl">
                <a href="#como-funciona">¿Cómo funciona?</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="section-padding bg-cream">
          <div className="container-narrow">
            <SectionHeader eyebrow="Cómo funciona" title="Tres pasos, resultado al instante" subtitle="La misma tecnología que usan las mejores apps de diseño de interiores, adaptada a tapicería." />
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {STEPS.map((s, i) => (
                <div key={s.title} className="reveal text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="w-16 h-16 mx-auto rounded-full bg-navy flex items-center justify-center text-3xl mb-5 shadow-[var(--shadow-card)]">
                    {s.icon}
                  </div>
                  <h3 className="font-display text-2xl text-navy mb-2">{i + 1}. {s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Herramienta */}
        <section id="herramienta" className="section-padding bg-navy text-cream relative overflow-hidden">
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
          <div className="container-narrow relative">
            <SectionHeader eyebrow="Herramienta gratuita" title="Prueba tu tejido ahora" light />
            <div className="reveal mt-14">
              <AIVisualizerTool />
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="section-padding bg-cream">
          <div className="container-narrow">
            <SectionHeader eyebrow="Por qué usarlo" title="Decide con seguridad, no a ciegas" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {BENEFITS.map((b, i) => (
                <div key={b.title} className="reveal bg-white rounded-xl p-6 shadow-[var(--shadow-card)] text-center" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="text-3xl mb-3">{b.icon}</div>
                  <h3 className="font-display text-lg text-navy mb-2">{b.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ específico */}
        <section className="section-padding pb-24 bg-cream">
          <div className="container-narrow max-w-3xl">
            <SectionHeader eyebrow="FAQ" title="Preguntas sobre el visualizador" />
            <Accordion type="single" collapsible className="mt-12">
              {VISUALIZER_FAQS.map((it, i) => (
                <AccordionItem key={it.q} value={String(i)} className="border-b border-gold/30">
                  <AccordionTrigger className="text-left font-display text-lg text-navy hover:text-gold hover:no-underline py-5">
                    {it.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-[15px] pb-5">
                    {it.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA final */}
        <section className="section-padding bg-navy-deep text-center">
          <div className="container-narrow">
            <h2 className="font-display text-3xl md:text-4xl text-cream mb-4">¿Ya sabes qué tejido quieres?</h2>
            <p className="text-cream/70 max-w-xl mx-auto mb-8">Pide tu presupuesto gratuito y sin compromiso. Te responderemos en menos de 24 horas.</p>
            <Button asChild variant="gold" size="xl">
              <a href="/#presupuesto">Calcular mi presupuesto</a>
            </Button>
          </div>
        </section>

        {/* Cross-promo B2B */}
        <section className="py-10 bg-cream border-t border-gold/20 text-center">
          <div className="container-narrow">
            <p className="text-muted-foreground text-sm">
              ¿Tienes un negocio de tapicería, interiorismo o mobiliario?{" "}
              <a href="/textiq" className="text-gold font-medium hover:underline">
                Descubre Textiq AI →
              </a>{" "}
              y ofrece esta misma tecnología a tus clientes con tu marca.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
