import { useMemo, useState } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATALOG_FABRICS, CATALOG_TIPOS, type CatalogFabric, type CatalogTipo } from "@/lib/fabricsData";

export type CatalogSelection = {
  coleccion: string;
  referencia: string;
  color: string;
  hex: string;
  imagen: string;
  tipo: CatalogTipo;
  nombre: string;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (f: CatalogSelection) => void;
}

type Filtro = "Todas" | CatalogTipo;
const FILTROS: Filtro[] = ["Todas", ...CATALOG_TIPOS];

export default function FabricCatalogPicker({ open, onOpenChange, onSelect }: Props) {
  const [tipo, setTipo] = useState<Filtro>("Todas");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, CatalogFabric[]>();
    for (const f of CATALOG_FABRICS) {
      if (tipo !== "Todas" && f.tipo !== tipo) continue;
      if (q) {
        const hay = `${f.coleccion} ${f.color} ${f.referencia} ${f.tipo}`.toLowerCase();
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
      setQuery("");
      setTipo("Todas");
      setExpanded(new Set());
    }
    onOpenChange(v);
  };

  const pick = (f: CatalogFabric) => {
    onSelect({
      coleccion: f.coleccion,
      referencia: f.referencia,
      color: f.color,
      hex: f.hex,
      imagen: f.imagen,
      tipo: f.tipo,
      nombre: `${f.coleccion} · ${f.referencia} · ${f.color}`,
    });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl bg-navy-deep border-gold/30 text-cream max-h-[92vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-gold/15">
          <DialogTitle className="font-display text-2xl text-cream">
            Elige un tejido para tu presupuesto
          </DialogTitle>
          <p className="text-cream/60 text-sm">Catálogo interactivo de tejidos · busca, filtra y selecciona la referencia</p>
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
            {FILTROS.map((t) => (
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
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {grouped.length === 0 && (
            <p className="text-cream/50 text-center py-10 text-sm">No hay tejidos que coincidan con tu búsqueda.</p>
          )}
          {grouped.map(([col, fabrics]) => {
            const isOpen = expanded.has(col) || query.trim().length > 0 || tipo !== "Todas";
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-lg text-cream">{col}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gold/80 px-2 py-0.5 rounded-full border border-gold/30">
                        {sample.tipo}
                      </span>
                    </div>
                    <p className="text-cream/50 text-xs mt-0.5 line-clamp-2">{sample.descripcion}</p>
                    <p className="text-cream/40 text-[11px] mt-0.5">{fabrics.length} {fabrics.length === 1 ? "color" : "colores"}</p>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-gold" /> : <ChevronDown size={18} className="text-cream/50" />}
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {fabrics.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => pick(f)}
                        className="text-left rounded-md overflow-hidden border-2 border-cream/10 hover:border-gold transition group focus:outline-none focus:border-gold"
                        title={`${f.coleccion} · ${f.referencia} · ${f.color}`}
                      >
                        <div className="flex items-stretch">
                          <div
                            className="w-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                            style={{ backgroundColor: f.hex }}
                            aria-hidden
                          />
                          <div className="px-2 py-1.5 bg-navy-deep flex-1 min-w-0">
                            <div className="text-cream text-xs font-medium truncate">{f.referencia}</div>
                            <div className="text-cream/60 text-[11px] truncate">{f.color}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-gold/15 px-6 py-3 bg-navy/60 flex justify-end">
          <Button variant="outline-gold" size="sm" onClick={() => handleClose(false)}>
            Cerrar catálogo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
