import { ExternalLink, Instagram, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const ARTEMPO_URL = "https://www.artempohomedesign.es";
const INSTAGRAM_URL = "https://www.instagram.com/tapizados.nova";

const FEATURES = [
  { icon: "🪑", label: "Telas para tapicería", desc: "Más de 200 referencias en stock" },
  { icon: "✂️", label: "Venta por metros", desc: "Pedido mínimo desde 1 metro" },
  { icon: "🚚", label: "Envío a toda España", desc: "Entrega en 24-48 h" },
  { icon: "🎨", label: "Asesoramiento online", desc: "Te ayudamos a elegir" },
];

export default function ArtempoSection() {
  return (
    <section className="section-padding bg-[#1a1410] text-cream relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            hsl(39 44% 59% / 0.3) 40px,
            hsl(39 44% 59% / 0.3) 41px
          )`,
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gold/5 blur-[80px]" />

      <div className="container-narrow relative">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-gold uppercase tracking-[0.4em] text-xs mb-4 font-medium">Nuestra tienda online</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream mb-4 leading-tight">
            Artempo<br />
            <span className="text-gold italic font-normal">Home Design</span>
          </h2>
          <p className="text-cream/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Descubre nuestra colección de tejidos premium para tapicería. Calidad artesanal,
            directamente a tu puerta.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-gold/15 bg-cream/5 p-5 text-center hover:border-gold/40 hover:bg-cream/10 transition-all duration-300"
            >
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <p className="text-cream text-sm font-medium mb-1">{f.label}</p>
              <p className="text-cream/50 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button
            asChild
            variant="gold"
            size="lg"
            className="px-8 gap-2 text-base"
          >
            <a href={ARTEMPO_URL} target="_blank" rel="noopener noreferrer">
              <ShoppingBag size={18} />
              Visitar la tienda
              <ExternalLink size={14} className="opacity-70" />
            </a>
          </Button>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-cream/20 text-cream/80 text-sm hover:border-gold/40 hover:text-cream transition-all duration-300"
          >
            <Instagram size={16} />
            @tapizados.nova en Instagram
          </a>
        </div>

        {/* Domain hint */}
        <p className="text-center text-cream/30 text-xs tracking-widest uppercase">
          artempohomedesign.es
        </p>
      </div>
    </section>
  );
}
