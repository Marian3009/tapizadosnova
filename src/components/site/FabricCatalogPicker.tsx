import { useMemo, useState } from "react";
import { Search, X, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATALOG_FABRICS, type CatalogFabric } from "@/lib/fabricsData";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (f: { nombre: string; imagen: string }) => void;
}

type Tipo = "Todas" | "Visillos" | "Tapicería" | "Accesorios" | "Decoración" | "Cortinas";

// Mapa colección → tipo para filtros (basado en colecciones Güell Lamadrid)
const COLLECTION_TYPE: Record<string, Exclude<Tipo, "Todas">> = {
  ALISIO: "Visillos",
  AMARA: "Decoración",
  ARAN: "Tapicería",
  BAHARI: "Decoración",
  BOSCARA: "Decoración",
  CAMILA: "Decoración",
  CARAVAN: "Decoración",
  CEYLAN: "Decoración",
  CLOTILDE: "Decoración",
  COLETTE: "Tapicería",
  GRIMALDI: "Cortinas",
  KHAN: "Decoración",
};

const TIPOS: Tipo[] = ["Todas", "Visillos", "Tapicería", "Decoración", "Cortinas", "Accesorios"];

export default function FabricCatalogPicker({ open, onOpenChange, onSelect }: Props) {
  const [tipo, setTipo] = useState<Tipo>("Todas");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<CatalogFabric | null>(null);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, CatalogFabric[]>();
    for (const f of CATALOG_FABRICS) {
      const t = COLLECTION_TYPE[f.coleccion] ?? "Decoración";
      if (tipo !== "Todas" && t !== tipo) continue;
      if (q) {
        const hay = `${f.coleccion} ${f.nombre} ${f.referencia} ${t}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      const arr = map.get(f.coleccion) ?? [];
      arr.push(f);
      map.set(f.coleccion, arr);
    }
    return Array.from(map.entries());
  }, [tipo, query]);

  const toggle = (col: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(col) ? n.delete(col) : n.add(col);
      return n;
    });
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setSelected(null);
      setQuery("");
      setTipo("Todas");
      setExpanded(new Set());
    }
    onOpenChange(v);
  };

  const confirm = () => {
    if (!selected) return;
    onSelect({ nombre: selected.nombre, imagen: selected.imagen });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl bg-navy-deep border-gold/30 text-cream max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-gold/15">
          <DialogTitle className="font-display text-2xl text-cream">
            Catálogo Tapizados Nova
          </DialogTitle>
          <p className="text-cream/60 text-sm">Colecciones Güell Lamadrid · explora colores y selecciona tu favorito</p>
        </DialogHeader>

        {/* Búsqueda + filtros */}
        <div className="px-6 py-4 border-b border-gold/15 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar colección, referencia o color…"
              className="pl-9 pr-9 bg-navy/50 border-cream/15 text-cream placeholder:text-cream/40"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cream/50 hover:text-gold"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider transition ${
                  tipo === t
                    ? "bg-gold text-navy font-medium"
                    : "bg-cream/5 text-cream/70 border border-cream/15 hover:border-gold/60 hover:text-gold"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Lista colecciones + colores */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {grouped.length === 0 && (
            <p className="text-cream/50 text-center py-10 text-sm">No hay tejidos que coincidan con tu búsqueda.</p>
          )}
          {grouped.map(([col, fabrics]) => {
            const isOpen = expanded.has(col) || query.trim().length > 0;
            const sample = fabrics[0];
            return (
              <div key={col} className="rounded-lg border border-cream/10 overflow-hidden bg-navy/40">
                <button
                  type="button"
                  onClick={() => toggle(col)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-cream/5 transition text-left"
                  aria-expanded={isOpen}
                >
                  <div
                    className="w-14 h-14 rounded-md bg-cover bg-center flex-shrink-0 border border-gold/20"
                    style={{ backgroundImage: `url(${sample.imagen})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-cream">{col}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gold/80 px-2 py-0.5 rounded-full border border-gold/30">
                        {COLLECTION_TYPE[col] ?? "Decoración"}
                      </span>
                    </div>
                    <p className="text-cream/50 text-xs truncate mt-0.5">{sample.descripcion}</p>
                    <p className="text-cream/40 text-[11px] mt-0.5">{fabrics.length} {fabrics.length === 1 ? "color" : "colores"}</p>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-gold" /> : <ChevronDown size={18} className="text-cream/50" />}
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {fabrics.map((f) => {
                      const isSel = selected?.id === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelected(f)}
                          className={`relative rounded-md overflow-hidden border-2 transition group ${
                            isSel ? "border-gold shadow-[0_0_0_3px_hsl(var(--gold)/0.25)]" : "border-cream/10 hover:border-gold/60"
                          }`}
                          title={f.nombre}
                        >
                          <div
                            className="aspect-square bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                            style={{ backgroundImage: `url(${f.imagen})` }}
                          />
                          {isSel && (
                            <div className="absolute top-1 right-1 bg-gold text-navy rounded-full w-5 h-5 flex items-center justify-center shadow">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                          <div className="px-1.5 py-1 bg-navy-deep">
                            <div className="text-cream text-[10px] font-medium truncate">{f.referencia}</div>
                            <div className="text-cream/50 text-[9px] truncate">
                              {f.nombre.split("·")[1]?.trim() ?? ""}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer con selección */}
        <div className="border-t border-gold/15 px-6 py-4 flex flex-col sm:flex-row items-center gap-3 bg-navy/60">
          {selected ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-12 h-12 rounded-md bg-cover bg-center border border-gold/40 flex-shrink-0"
                style={{ backgroundImage: `url(${selected.imagen})` }}
              />
              <div className="min-w-0">
                <div className="text-cream text-sm font-medium truncate">
                  {selected.coleccion} · {selected.referencia}
                </div>
                <div className="text-cream/60 text-xs truncate">{selected.nombre.split("·")[1]?.trim()}</div>
              </div>
            </div>
          ) : (
            <p className="flex-1 text-cream/50 text-sm">Selecciona un color para continuar.</p>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline-gold" onClick={() => handleClose(false)} className="flex-1 sm:flex-none">
              Cerrar catálogo
            </Button>
            <Button variant="gold" onClick={confirm} disabled={!selected} className="flex-1 sm:flex-none">
              Ver muestra seleccionada
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
