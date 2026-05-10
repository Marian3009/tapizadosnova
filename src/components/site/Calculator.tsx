import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SectionHeader from "./SectionHeader";
import BudgetDialog from "./BudgetDialog";
import { MUEBLES, TELAS, TELA_LABELS, getMueble, type FabricCategory } from "@/lib/catalog";
import FabricVisualizer from "./FabricVisualizer";
import type { CatalogSelection } from "./FabricCatalogPicker";

export default function Calculator() {
  const [muebleKey, setMuebleKey] = useState<string>("t_sofa3");
  const [telaKey, setTelaKey] = useState<FabricCategory>("antimanchas");
  const [qty, setQty] = useState(1);
  const [catalog, setCatalog] = useState<CatalogSelection | null>(null);
  const [open, setOpen] = useState(false);
  const [composite, setComposite] = useState<string | null>(null);
  const [includeInPdf, setIncludeInPdf] = useState(true);

  const mueble = getMueble(muebleKey);
  const tela = TELAS[telaKey];

  const total = useMemo(() => {
    const base = (mueble.precio + mueble.metraje * tela.price) * qty;
    return Math.round(base);
  }, [mueble, tela, qty]);

  const tapizadoOpts = MUEBLES.filter((m) => m.modalidad === "tapizado");
  const fundaOpts = MUEBLES.filter((m) => m.modalidad === "funda");

  return (
    <section id="presupuesto" className="section-padding bg-navy text-cream relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="container-narrow relative">
        <SectionHeader eyebrow="Presupuesto" title="Calcula tu presupuesto al instante" light />

        <div className="reveal mt-14 grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-7 bg-navy-deep/60 backdrop-blur p-6 md:p-9 rounded-2xl border border-gold/20">
            <div>
              <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">1 · Tipo de mueble</Label>
              <Select value={muebleKey} onValueChange={setMuebleKey}>
                <SelectTrigger className="h-12 bg-navy/50 border-cream/20 text-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectGroup>
                    <SelectLabel className="text-gold">Tapizado</SelectLabel>
                    {tapizadoOpts.map((m) => (
                      <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-gold">Fundas ajustables</SelectLabel>
                    {fundaOpts.map((m) => (
                      <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="mt-3 rounded-md bg-gold/10 border border-gold/20 px-4 py-3">
                <p className="text-gold font-medium text-sm flex items-center gap-2">
                  <span>📐 Metraje estimado de tejido: {mueble.metraje.toFixed(2).replace(".", ",")} metros</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Más información sobre el metraje" className="inline-flex items-center justify-center w-6 h-6 rounded-full text-gold/80 hover:text-gold hover:bg-gold/10 transition-colors">
                        <Info size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs leading-relaxed">
                      El metraje es una estimación basada en modelos estándar. El cálculo final puede variar según el diseño específico y el patrón de la tela elegida.
                    </TooltipContent>
                  </Tooltip>
                </p>
                <p className="text-cream/50 text-xs mt-1">Orientativo. Puede variar según diseño y patrón del tejido.</p>
              </div>
            </div>

            <div>
              <Label className="text-cream mb-3 flex items-center gap-2 uppercase text-xs tracking-widest">
                <span>2 · Tipo de tela</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Más información sobre el tipo de tela" className="inline-flex items-center justify-center w-6 h-6 rounded-full text-cream/60 hover:text-gold hover:bg-cream/10 transition-colors">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs leading-relaxed normal-case tracking-normal">
                    Los precios varían según la composición y resistencia del tejido. Te asesoramos para acertar con tu uso.
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select value={telaKey} onValueChange={(v) => setTelaKey(v as FabricCategory)}>
                <SelectTrigger className="h-12 bg-navy/50 border-cream/20 text-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TELA_LABELS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">3 · Número de unidades</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="bg-navy/50 border-cream/20 text-cream h-12 text-lg"
              />
            </div>

            {catalog && (
              <div className="rounded-md bg-gold/10 border border-gold/30 px-4 py-3 text-sm text-cream">
                <span className="text-gold font-medium">Tejido seleccionado del catálogo: </span>
                {catalog.coleccion} · {catalog.referencia} · {catalog.color}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 lg:sticky lg:top-24 flex flex-col bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/30 rounded-2xl p-7 md:p-9">
            <div className="text-gold uppercase tracking-[0.3em] text-xs mb-3">Precio estimado</div>
            <div className="font-display text-5xl md:text-6xl text-gold leading-none">
              {total.toLocaleString("es-ES")} €
            </div>
            <p className="mt-5 text-cream/70 text-sm leading-relaxed">
              Precio orientativo sin IVA. Sujeto a revisión presencial.
            </p>
          </div>
        </div>

        <FabricVisualizer
          project={{
            muebleLabel: mueble.label,
            telaLabel: tela.label,
            metraje: mueble.metraje,
            base: (mueble.precio + mueble.metraje * tela.price) * qty,
          }}
          onCompositeChange={setComposite}
          includeInPdf={includeInPdf}
          onIncludeChange={setIncludeInPdf}
          catalogSelection={catalog}
          onCatalogChange={setCatalog}
        />

        <div className="reveal mt-8 flex justify-center">
          <Button variant="gold" size="lg" onClick={() => setOpen(true)} className="px-10">
            Solicitar presupuesto detallado
          </Button>
        </div>
      </div>

      <BudgetDialog
        open={open}
        onOpenChange={setOpen}
        context={{
          muebleKey: mueble.key,
          muebleLabel: mueble.label,
          modalidad: mueble.modalidad,
          telaLabel: tela.label,
          tejidoNombre: catalog ? `${catalog.coleccion} · ${catalog.referencia} · ${catalog.color}` : undefined,
          catalogo: catalog ?? undefined,
          metraje: mueble.metraje,
          unidades: qty,
          base: (mueble.precio + mueble.metraje * tela.price) * qty,
          composite: includeInPdf ? composite : null,
        }}
      />
    </section>
  );
}
