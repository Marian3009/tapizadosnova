import { useEffect, useRef, useState } from "react";
import { Camera, X, Download, Palette, FileText, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProjectInfo {
  muebleLabel: string;
  telaLabel: string;
  metraje: number;
  base: number;
}

interface Props {
  presetFabric?: { nombre: string; imagen: string } | null;
  project?: ProjectInfo;
  onCompositeChange?: (dataUrl: string | null) => void;
  includeInPdf?: boolean;
  onIncludeChange?: (v: boolean) => void;
}

function UploadZone({
  title,
  hint,
  icon: Icon,
  onFile,
  inputId,
}: {
  title: string;
  hint: string;
  icon: typeof Camera;
  onFile: (f: File) => void;
  inputId: string;
}) {
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <h4 className="font-display text-xl text-cream mb-3">{title}</h4>
      <label
        htmlFor={inputId}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={`flex flex-col items-center justify-center text-center cursor-pointer rounded-xl bg-cream py-10 px-4 border-2 border-dashed transition-colors ${drag ? "border-gold bg-gold/10" : "border-gold/60 hover:border-gold"}`}
      >
        <Icon className="text-gold mb-3" size={36} />
        <p className="text-navy font-medium text-sm">Arrastra tu foto aquí o haz clic para seleccionar</p>
        <p className="text-navy/50 text-xs mt-1">{hint}</p>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </label>
    </div>
  );
}

function MiniPreview({ image, label, onClear }: { image: string; label: string; onClear: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-cream/95 border border-gold/40 px-3 py-2">
      <img src={image} alt={label} className="w-12 h-12 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-navy text-sm font-medium truncate">✅ {label}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="w-7 h-7 rounded-full bg-navy/80 hover:bg-navy text-cream flex items-center justify-center"
        aria-label="Eliminar"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function FabricVisualizer({ presetFabric, project, onCompositeChange, includeInPdf, onIncludeChange }: Props) {
  const [furniture, setFurniture] = useState<string | null>(null);
  const [fabric, setFabric] = useState<string | null>(null);
  const [presetUsed, setPresetUsed] = useState(false);
  const [composite, setComposite] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (presetFabric?.imagen && !fabric) {
      setFabric(presetFabric.imagen);
      setPresetUsed(true);
    }
  }, [presetFabric, fabric]);

  useEffect(() => {
    let cancelled = false;
    if (!furniture || !fabric) {
      setComposite(null);
      setFailed(false);
      onCompositeChange?.(null);
      return;
    }
    setProcessing(true);
    setFailed(false);
    (async () => {
      try {
        const [imgM, imgT] = await Promise.all([loadImg(furniture), loadImg(fabric)]);
        const canvas = document.createElement("canvas");
        const maxW = 1200;
        const scale = imgM.naturalWidth > maxW ? maxW / imgM.naturalWidth : 1;
        canvas.width = Math.round(imgM.naturalWidth * scale);
        canvas.height = Math.round(imgM.naturalHeight * scale);
        const ctx = canvas.getContext("2d")!;

        // Base furniture
        ctx.drawImage(imgM, 0, 0, canvas.width, canvas.height);

        // Tile fabric onto an offscreen canvas at canvas size
        const fabricCanvas = document.createElement("canvas");
        fabricCanvas.width = canvas.width;
        fabricCanvas.height = canvas.height;
        const fctx = fabricCanvas.getContext("2d")!;
        const tile = Math.max(180, Math.round(canvas.width / 5));
        const ratio = imgT.naturalWidth / imgT.naturalHeight;
        const tileW = tile;
        const tileH = Math.round(tile / ratio);
        for (let y = 0; y < canvas.height; y += tileH) {
          for (let x = 0; x < canvas.width; x += tileW) {
            fctx.drawImage(imgT, x, y, tileW, tileH);
          }
        }

        // Overlay blend
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = 0.55;
        ctx.drawImage(fabricCanvas, 0, 0);
        ctx.restore();

        // Soft-light second pass
        ctx.save();
        ctx.globalCompositeOperation = "soft-light";
        ctx.globalAlpha = 0.35;
        ctx.drawImage(fabricCanvas, 0, 0);
        ctx.restore();

        // Recover shadows/volume from original
        ctx.save();
        ctx.globalCompositeOperation = "luminosity";
        ctx.globalAlpha = 0.25;
        ctx.drawImage(imgM, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        const url = canvas.toDataURL("image/jpeg", 0.92);
        if (!cancelled) {
          setComposite(url);
          onCompositeChange?.(url);
          setProcessing(false);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setProcessing(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [furniture, fabric, onCompositeChange]);

  const handleFile = (setter: (s: string) => void) => (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error("La imagen supera el límite de 10MB");
      return;
    }
    if (!/^image\/(jpe?g|png)$/.test(f.type)) {
      toast.error("Formato no admitido. Usa JPG o PNG.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(f);
  };

  const downloadComposite = () => {
    if (!composite) return;
    const link = document.createElement("a");
    link.download = "tapizados-nova-visualizacion.jpg";
    link.href = composite;
    link.click();
  };

  const resetImages = () => {
    setFurniture(null);
    setFabric(null);
    setPresetUsed(false);
    setComposite(null);
    setFailed(false);
    onCompositeChange?.(null);
  };

  const both = !!(furniture && fabric);

  return (
    <div className="mt-8 space-y-6 reveal">
      {!both ? (
        <div className="grid md:grid-cols-2 gap-5">
          {furniture ? (
            <MiniPreview image={furniture} label="Mueble subido" onClear={() => setFurniture(null)} />
          ) : (
            <UploadZone
              title="📷 Sube la foto de tu mueble"
              hint="Formatos aceptados: JPG, PNG. Máximo 10MB"
              icon={Camera}
              onFile={handleFile(setFurniture)}
              inputId="upload-furniture"
            />
          )}
          {fabric ? (
            <div>
              <MiniPreview image={fabric} label="Tejido subido" onClear={() => { setFabric(null); setPresetUsed(false); }} />
              {presetUsed && (
                <p className="text-gold/80 text-xs mt-2">✓ Tejido del catálogo aplicado automáticamente</p>
              )}
            </div>
          ) : (
            <UploadZone
              title="🎨 Sube una foto del tejido elegido"
              hint="Puedes subir una muestra o una imagen del tejido que te guste"
              icon={Palette}
              onFile={handleFile(setFabric)}
              inputId="upload-fabric"
            />
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center text-cream/70 text-xs">
          <span className="px-3 py-1 rounded-full bg-navy-deep/60 border border-gold/30">✅ Mueble cargado</span>
          <span className="px-3 py-1 rounded-full bg-navy-deep/60 border border-gold/30">✅ Tejido cargado</span>
        </div>
      )}

      {(furniture && !fabric) || (!furniture && fabric) ? (
        <div className="rounded-xl bg-navy-deep/60 border border-gold/20 p-5 text-center text-cream/70 text-sm">
          Sube también la foto del {!fabric ? "tejido" : "mueble"} para ver la visualización
        </div>
      ) : null}

      {both && processing && (
        <div className="rounded-2xl bg-navy-deep/80 border-2 border-gold/40 p-10 flex flex-col items-center gap-3 text-cream">
          <Loader2 className="animate-spin text-gold" size={32} />
          <p className="text-sm">⏳ Generando visualización...</p>
        </div>
      )}

      {both && failed && !processing && (
        <div className="rounded-xl bg-navy-deep/60 border border-gold/30 p-5 text-center text-cream/80 text-sm">
          No ha sido posible generar la visualización. Puedes continuar con el presupuesto igualmente.
        </div>
      )}

      {both && composite && !processing && (
        <div className="animate-fade-in mx-auto md:w-[90%]">
          <div className="text-center mb-5">
            <h3 className="font-display text-2xl md:text-3xl text-gold">🛋️ Vista final de tu proyecto</h3>
            <p className="text-cream/60 text-sm mt-1">Así quedará tu mueble con el tejido seleccionado</p>
          </div>

          <div className="rounded-2xl bg-navy p-5 md:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-gold/20">
            <div className="rounded-xl overflow-hidden border-[3px] border-gold shadow-xl bg-black">
              <img src={composite} alt="Vista final del proyecto" className="w-full block" />
            </div>

            {project && (
              <div className="mt-5 rounded-lg bg-cream text-navy p-4 md:p-5 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div><span className="text-navy/70">Mueble:</span> <strong className="text-gold">{project.muebleLabel}</strong></div>
                <div><span className="text-navy/70">Tejido:</span> <strong className="text-gold">{project.telaLabel}</strong></div>
                <div><span className="text-navy/70">Metraje estimado:</span> <strong className="text-gold">{project.metraje.toFixed(2).replace(".", ",")} m</strong></div>
                <div><span className="text-navy/70">Precio estimado:</span> <strong className="text-gold">{Math.round(project.base).toLocaleString("es-ES")} € (sin IVA)</strong></div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button variant="gold" onClick={downloadComposite}>
              <Download size={18} className="mr-2" /> Descargar
            </Button>
            {onIncludeChange && (
              <Button
                variant={includeInPdf ? "gold" : "outline-gold"}
                onClick={() => onIncludeChange(!includeInPdf)}
              >
                <FileText size={18} className="mr-2" />
                {includeInPdf ? "✓ Incluida en el PDF" : "Incluir en PDF"}
              </Button>
            )}
            <Button variant="outline-gold" onClick={resetImages}>
              <RotateCcw size={18} className="mr-2" /> Cambiar imagen
            </Button>
          </div>
          <p className="text-cream/50 text-xs mt-3 text-center sm:text-right">
            Visualización orientativa. El resultado final puede variar según el tejido y el trabajo de tapizado en taller.
          </p>
        </div>
      )}
    </div>
  );
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
