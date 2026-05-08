import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CATALOG_FABRICS, type CatalogFabric } from "@/lib/fabricsData";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (f: { nombre: string; imagen: string }) => void;
}

export default function FabricCatalogPicker({ open, onOpenChange, onSelect }: Props) {
  const [coleccion, setColeccion] = useState<string | null>(null);

  const colecciones = useMemo(() => {
    const map = new Map<string, CatalogFabric>();
    for (const f of CATALOG_FABRICS) if (!map.has(f.coleccion)) map.set(f.coleccion, f);
    return Array.from(map.values());
  }, []);

  const colores = useMemo(
    () => CATALOG_FABRICS.filter((f) => f.coleccion === coleccion),
    [coleccion],
  );

  const handleClose = (v: boolean) => {
    if (!v) setColeccion(null);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl bg-navy-deep border-gold/30 text-cream max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-cream">
            {coleccion ? `Catálogo · ${coleccion}` : "Catálogo de tejidos"}
          </DialogTitle>
        </DialogHeader>

        {!coleccion ? (
          <>
            <p className="text-cream/60 text-sm">Elige una colección Güell Lamadrid:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {colecciones.map((c) => (
                <button
                  key={c.coleccion}
                  type="button"
                  onClick={() => setColeccion(c.coleccion)}
                  className="rounded-lg overflow-hidden border-2 border-cream/15 hover:border-gold transition group text-left"
                >
                  <div
                    className="aspect-square bg-cover bg-center"
                    style={{ backgroundImage: `url(${c.imagen})` }}
                  />
                  <div className="px-2 py-2 bg-navy">
                    <div className="text-cream font-medium text-sm">{c.coleccion}</div>
                    <div className="text-cream/50 text-[11px]">
                      {CATALOG_FABRICS.filter((x) => x.coleccion === c.coleccion).length} colores
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-cream/60 text-sm">{colores[0]?.descripcion}</p>
              <Button variant="outline-gold" size="sm" onClick={() => setColeccion(null)}>
                ← Colecciones
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
              {colores.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    onSelect({ nombre: f.nombre, imagen: f.imagen });
                    handleClose(false);
                  }}
                  className="rounded-lg overflow-hidden border-2 border-cream/15 hover:border-gold transition text-left"
                >
                  <div
                    className="aspect-square bg-cover bg-center"
                    style={{ backgroundImage: `url(${f.imagen})` }}
                  />
                  <div className="px-2 py-1.5 bg-navy">
                    <div className="text-cream text-[12px] font-medium truncate">{f.referencia}</div>
                    <div className="text-cream/60 text-[10px] truncate">
                      {f.nombre.split("·")[1]?.trim()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
