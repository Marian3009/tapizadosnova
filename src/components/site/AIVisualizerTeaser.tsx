import { Button } from "@/components/ui/button";

export default function AIVisualizerTeaser() {
  return (
    <section className="section-padding bg-cream">
      <div className="container-narrow">
        <div className="reveal relative overflow-hidden rounded-2xl bg-navy px-6 py-14 md:px-16 md:py-16 text-center shadow-[var(--shadow-card)]">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />
          <div className="relative">
            <span className="inline-block text-gold uppercase tracking-[0.3em] text-xs font-medium mb-4">
              Nuevo · Con inteligencia artificial
            </span>
            <h2 className="font-display text-3xl md:text-5xl text-cream mb-4 max-w-2xl mx-auto leading-tight">
              ¿Cómo quedaría tu sofá con esa tela? <span className="italic text-gold">Descúbrelo en segundos.</span>
            </h2>
            <p className="text-cream/70 max-w-xl mx-auto mb-8">
              Sube una foto de tu mueble y visualiza el resultado con IA antes de pedir presupuesto. Gratis y sin registro.
            </p>
            <Button asChild variant="gold" size="xl">
              <a href="/visualizador-ia">✨ Probar el Visualizador IA</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
