import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-sofa.jpg";

export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      <img
        src={hero}
        alt="Sofá tapizado elegante de Tapizados Nova en Rubí, Barcelona"
        width={1920}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover animate-scale-in"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy/80 to-navy/40" />
      <div className="absolute inset-0 bg-navy/30" />

      <div className="container-narrow relative z-10 py-32">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <span className="h-px w-12 bg-gold" />
            <span className="text-gold uppercase tracking-[0.3em] text-xs font-medium">
              Tapicería Artesanal · Rubí, Barcelona
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[1.05] mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Transforma tu hogar con <span className="italic text-gold">tapicería</span> de calidad
          </h1>
          <p className="text-lg md:text-xl text-cream/80 max-w-2xl mb-10 leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            Especialistas en tapizado de sofás, sillas, cabeceros y más.
            Más de 20 años de experiencia artesanal en Rubí, Barcelona.
          </p>
          <div className="flex flex-wrap gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <Button asChild variant="gold" size="xl">
              <a href="#contacto">Solicitar presupuesto gratuito</a>
            </Button>
            <Button asChild variant="outline-cream" size="xl">
              <a href="#galeria">Ver nuestros trabajos</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/60 text-xs uppercase tracking-widest animate-fade-in-slow" style={{ animationDelay: "1.4s" }}>
        Desde 2003
      </div>
    </section>
  );
}
