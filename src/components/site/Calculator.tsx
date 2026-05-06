import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import SectionHeader from "./SectionHeader";
import BudgetDialog from "./BudgetDialog";
import { MUEBLES, TELAS, TELA_LABELS, getMueble, type FabricCategory } from "@/lib/catalog";
import FabricVisualizer from "./FabricVisualizer";

type Fabric = { id: string; nombre: string; categoria: FabricCategory; color: string; imagen: string; descripcion: string };

export default function Calculator() {
  const [muebleKey, setMuebleKey] = useState<string>("t_sofa3");
  const [telaKey, setTelaKey] = useState<FabricCategory>("antimanchas");
  const [qty, setQty] = useState(1);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [selectedFabricId, setSelectedFabricId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tn_fabrics");
      if (raw) setFabrics(JSON.parse(raw));
    } catch { /* */ }
  }, []);

  useEffect(() => { setSelectedFabricId(null); }, [telaKey]);

  const mueble = getMueble(muebleKey);
  const tela = TELAS[telaKey];

  const total = useMemo(() => {
    const base = (mueble.precio + mueble.metraje * tela.price) * qty;
    return Math.round(base);
  }, [mueble, tela, qty]);

  const tapizadoOpts = MUEBLES.filter((m) => m.modalidad === "tapizado");
  const fundaOpts = MUEBLES.filter((m) => m.modalidad === "funda");

  const filteredFabrics = fabrics.filter((f) => f.categoria === telaKey);
  const selectedFabric = filteredFabrics.find((f) => f.id === selectedFabricId);

  return (
    <section id="presupuesto" className="section-padding bg-navy text-cream relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="container-narrow relative">
        <SectionHeader eyebrow="Presupuesto" title="Calcula tu presupuesto al instante" light />

        <div className="reveal mt-14 grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-7 bg-navy-deep/60 backdrop-blur p-6 md:p-9 rounded-2xl border border-gold/20">
            {/* 1. Tipo de mueble */}
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
                <p className="text-gold font-medium text-sm">📐 Metraje estimado de tejido: {mueble.metraje.toFixed(2).replace(".", ",")} metros</p>
                <p className="text-cream/50 text-xs mt-1">Orientativo. Puede variar según diseño y patrón del tejido.</p>
              </div>
            </div>

            {/* 2. Tipo de tela */}
            <div>
              <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">2 · Tipo de tela</Label>
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

            {/* 3. Cantidad */}
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

            {/* 4. Tejidos del catálogo (visualización) */}
            {filteredFabrics.length > 0 && (
              <div>
                <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">4 · Visualiza un tejido (opcional)</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {filteredFabrics.map((f) => {
                    const sel = selectedFabricId === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFabricId(sel ? null : f.id)}
                        className={`rounded-lg overflow-hidden border-2 transition-all ${sel ? "border-gold shadow-[var(--shadow-gold)]" : "border-cream/15 hover:border-gold/60"}`}
                        title={f.nombre}
                      >
                        <div className="aspect-square bg-cover bg-center" style={{ backgroundImage: `url(${f.imagen})`, backgroundColor: f.color }} />
                        <div className="px-2 py-1 text-[11px] truncate bg-navy-deep text-cream/80">{f.nombre}</div>
                      </button>
                    );
                  })}
                </div>
                {selectedFabric && (
                  <div className="mt-3 text-xs text-gold">Tejido seleccionado: {selectedFabric.nombre}</div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
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

        {/* Visualizador de mueble + tejido */}
        <FabricVisualizer presetFabric={selectedFabric ? { nombre: selectedFabric.nombre, imagen: selectedFabric.imagen } : null} />

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
          tejidoNombre: selectedFabric?.nombre,
          metraje: mueble.metraje,
          unidades: qty,
          base: (mueble.precio + mueble.metraje * tela.price) * qty,
        }}
      />
    </section>
  );
}
