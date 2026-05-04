import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SectionHeader from "./SectionHeader";

const types = {
  sofa2: { label: "Sofá 2 plazas", base: 1 },
  sofa3: { label: "Sofá 3 plazas", base: 1.4 },
  chaise: { label: "Sofá chaise longue", base: 1.8 },
  silla: { label: "Silla / Butaca", base: 0.18 },
  cabecero: { label: "Cabecero", base: 0.6 },
};
const qualities = {
  basica: { label: "Básica", price: 45 },
  estandar: { label: "Estándar", price: 75 },
  premium: { label: "Premium", price: 120 },
};

const M2_PER_UNIT = 6; // baseline m² for "1.0" coefficient

export default function Calculator() {
  const [type, setType] = useState<keyof typeof types>("sofa3");
  const [quality, setQuality] = useState<keyof typeof qualities>("estandar");
  const [qty, setQty] = useState(1);

  const total = useMemo(() => {
    const m2 = types[type].base * M2_PER_UNIT;
    return Math.round(m2 * qualities[quality].price * qty);
  }, [type, quality, qty]);

  return (
    <section id="presupuesto" className="section-padding bg-navy text-cream relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="container-narrow relative">
        <SectionHeader eyebrow="Presupuesto" title="Calcula tu presupuesto al instante" light />

        <div className="reveal mt-16 grid lg:grid-cols-5 gap-10 items-stretch">
          <div className="lg:col-span-3 bg-navy-deep/60 backdrop-blur p-8 md:p-10 rounded-2xl border border-gold/20">
            <div className="space-y-7">
              <div>
                <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">Tipo de trabajo</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(types).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => setType(k as keyof typeof types)}
                      className={`px-4 py-3 rounded-lg text-sm transition-all border ${
                        type === k
                          ? "bg-gold text-navy border-gold font-semibold"
                          : "bg-transparent border-cream/20 text-cream hover:border-gold"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">Calidad de tela</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(qualities).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => setQuality(k as keyof typeof qualities)}
                      className={`px-4 py-4 rounded-lg text-sm transition-all border text-left ${
                        quality === k
                          ? "bg-gold text-navy border-gold"
                          : "bg-transparent border-cream/20 text-cream hover:border-gold"
                      }`}
                    >
                      <div className="font-semibold">{v.label}</div>
                      <div className="text-xs opacity-70 mt-1">desde {v.price}€/m²</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">Cantidad de unidades</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="bg-navy/50 border-cream/20 text-cream h-12 text-lg"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-between bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/30 rounded-2xl p-8 md:p-10">
            <div>
              <div className="text-gold uppercase tracking-[0.3em] text-xs mb-3">Precio estimado</div>
              <div className="font-display text-6xl md:text-7xl text-gold leading-none">
                {total.toLocaleString("es-ES")}€
              </div>
              <p className="mt-6 text-cream/70 text-sm leading-relaxed">
                Los precios incluyen mano de obra y materiales.
                <br />IVA no incluido.
              </p>
            </div>
            <Button asChild variant="gold" size="lg" className="mt-8 w-full">
              <a href="#contacto">Solicitar presupuesto exacto</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
