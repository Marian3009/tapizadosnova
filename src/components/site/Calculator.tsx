import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SectionHeader from "./SectionHeader";
import BudgetDialog from "./BudgetDialog";

type FabricCategory = "basico" | "antimanchas" | "terciopelo" | "premium";

const muebles: Record<string, { label: string; m: number }> = {
  sillon_orejero: { label: "Sillón orejero", m: 6.0 },
  descalzadora: { label: "Descalzadora", m: 3.5 },
  butaca_pequena: { label: "Butaca pequeña", m: 4.5 },
  butaca_xl: { label: "Butaca XL", m: 8.0 },
  sofa2: { label: "Sofá 2 plazas", m: 11.0 },
  sofa3: { label: "Sofá 3 plazas", m: 14.0 },
  chaise: { label: "Chaise longue", m: 10.0 },
  silla_asiento: { label: "Silla (solo asiento)", m: 0.6 },
  silla_asiento_respaldo: { label: "Silla (asiento + respaldo)", m: 1.2 },
  cabezal_individual: { label: "Cabezal individual", m: 1.5 },
  cabezal_135: { label: "Cabezal 135 cm", m: 2.0 },
  cabezal_150: { label: "Cabezal 150 cm", m: 2.4 },
  cabezal_200: { label: "Cabezal 200 cm", m: 3.5 },
};

const telas: Record<FabricCategory, { label: string; icon: string; desc: string; price: number; from: string }> = {
  basico: { label: "Tela Básica", icon: "🟤", desc: "Perfecta para uso diario", price: 20, from: "desde 20 €/metro" },
  antimanchas: { label: "Tela Anti Manchas", icon: "🛡️", desc: "Ideal para familias con niños o mascotas", price: 35, from: "desde 35 €/metro" },
  terciopelo: { label: "Tela Terciopelo", icon: "✨", desc: "Elegante y suave al tacto", price: 35, from: "desde 35 €/metro" },
  premium: { label: "Lino y Premium", icon: "🌿", desc: "Máxima calidad y durabilidad", price: 70, from: "desde 70 €/metro" },
};

type Fabric = { id: string; nombre: string; categoria: FabricCategory; color: string; imagen: string; descripcion: string };

export default function Calculator() {
  const [muebleKey, setMuebleKey] = useState<string>("sofa3");
  const [telaKey, setTelaKey] = useState<FabricCategory>("antimanchas");
  const [qty, setQty] = useState(1);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [selectedFabricId, setSelectedFabricId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tn_fabrics");
      if (raw) setFabrics(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { setSelectedFabricId(null); }, [telaKey]);

  const mueble = muebles[muebleKey];
  const tela = telas[telaKey];

  const total = useMemo(() => {
    return Math.round(mueble.m * tela.price * 1.4 * qty);
  }, [mueble, tela, qty]);

  const filteredFabrics = fabrics.filter((f) => f.categoria === telaKey);
  const selectedFabric = filteredFabrics.find((f) => f.id === selectedFabricId);

  return (
    <section id="presupuesto" className="section-padding bg-navy text-cream relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="container-narrow relative">
        <SectionHeader eyebrow="Presupuesto" title="Calcula tu presupuesto al instante" light />

        <div className="reveal mt-14 grid lg:grid-cols-5 gap-8 items-start">
          {/* LEFT: form */}
          <div className="lg:col-span-3 space-y-8 bg-navy-deep/60 backdrop-blur p-6 md:p-9 rounded-2xl border border-gold/20">
            {/* 1. Tipo de mueble */}
            <div>
              <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">1 · Tipo de mueble</Label>
              <Select value={muebleKey} onValueChange={setMuebleKey}>
                <SelectTrigger className="h-12 bg-navy/50 border-cream/20 text-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(muebles).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-3 rounded-md bg-gold/10 border border-gold/20 px-4 py-3">
                <p className="text-gold font-medium text-sm">📐 Metraje estimado de tejido: {mueble.m.toFixed(2).replace(".", ",")} metros</p>
                <p className="text-cream/50 text-xs mt-1">Estimación orientativa. Puede variar según diseño y patrón del tejido.</p>
              </div>
            </div>

            {/* 2. Tipo de tela */}
            <div>
              <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">2 · Tipo de tela</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(telas) as FabricCategory[]).map((k) => {
                  const t = telas[k];
                  const sel = telaKey === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setTelaKey(k)}
                      className={`text-left rounded-lg p-4 border-2 transition-all ${
                        sel ? "border-gold bg-cream text-navy shadow-[var(--shadow-gold)]" : "border-cream/15 bg-transparent text-cream hover:border-gold/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{t.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold">{t.label}</div>
                          <div className={`text-xs ${sel ? "text-navy/70" : "text-cream/60"}`}>{t.desc}</div>
                        </div>
                      </div>
                      <div className={`mt-2 text-xs font-medium ${sel ? "text-navy" : "text-gold"}`}>{t.from}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Cantidad */}
            <div>
              <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">3 · Número de unidades</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="bg-navy/50 border-cream/20 text-cream h-12 text-lg"
              />
            </div>

            {/* 4. Tejidos */}
            <div>
              <Label className="text-cream mb-3 block uppercase text-xs tracking-widest">4 · Elige tu tejido</Label>
              {filteredFabrics.length === 0 ? (
                <div className="rounded-lg border border-dashed border-cream/20 px-4 py-6 text-center text-cream/60 text-sm">
                  El catálogo de tejidos estará disponible próximamente.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {filteredFabrics.map((f) => {
                      const sel = selectedFabricId === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFabricId(f.id)}
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
                    <div className="mt-4 rounded-lg overflow-hidden border border-gold/30">
                      <div
                        className="h-40 bg-cover bg-center flex items-end p-4"
                        style={{ backgroundImage: `url(${selectedFabric.imagen})`, backgroundColor: selectedFabric.color }}
                      >
                        <div className="bg-navy/80 backdrop-blur px-3 py-1.5 rounded text-cream text-sm">
                          {mueble.label} · {selectedFabric.nombre}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT: total */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 flex flex-col bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/30 rounded-2xl p-7 md:p-9">
            <div className="text-gold uppercase tracking-[0.3em] text-xs mb-3">Precio estimado</div>
            <div className="font-display text-5xl md:text-6xl text-gold leading-none">
              {total.toLocaleString("es-ES")}€
            </div>
            <p className="mt-5 text-cream/70 text-sm leading-relaxed">
              Precio orientativo. Incluye mano de obra y materiales.
              <br />Sujeto a revisión presencial.
            </p>
            <Button variant="gold" size="lg" className="mt-6 w-full" onClick={() => setOpen(true)}>
              Solicitar presupuesto detallado
            </Button>
          </div>
        </div>
      </div>

      <BudgetDialog
        open={open}
        onOpenChange={setOpen}
        context={{
          muebleLabel: mueble.label,
          telaLabel: tela.label,
          tejidoNombre: selectedFabric?.nombre,
          metraje: mueble.m,
          unidades: qty,
          base: mueble.m * tela.price * 1.4 * qty,
        }}
      />
    </section>
  );
}
