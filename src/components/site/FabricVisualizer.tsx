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

export default function FabricVisualizer({ presetFabric, project, onCompositeChange, includeInPdf, onIncludeChange }: Props) {
  const [furniture, setFurniture] = useState<string | null>(null);
  const [fabric, setFabric] = useState<string | null>(null);
  const [presetUsed, setPresetUsed] = useState(false);
  const [composite, setComposite] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);
  const fInput = useRef<HTMLInputElement>(null);
  const tInput = useRef<HTMLInputElement>(null);

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

        // Scale base to max 1400px
        const maxW = 1400;
        const scale = imgM.naturalWidth > maxW ? maxW / imgM.naturalWidth : 1;
        const W = Math.round(imgM.naturalWidth * scale);
        const H = Math.round(imgM.naturalHeight * scale);

        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(imgM, 0, 0, W, H);
        const imageData = ctx.getImageData(0, 0, W, H);
        const data = imageData.data;

        // Build tiled fabric pattern at canvas size
        const tileCanvas = document.createElement("canvas");
        tileCanvas.width = W;
        tileCanvas.height = H;
        const tctx = tileCanvas.getContext("2d")!;
        // Scale tile so fabric repeats nicely (target ~ W/4)
        const targetTile = Math.max(160, Math.round(W / 4));
        const ratio = imgT.naturalWidth / imgT.naturalHeight;
        const tileW = targetTile;
        const tileH = Math.round(targetTile / ratio);
        for (let y = 0; y < H; y += tileH) {
          for (let x = 0; x < W; x += tileW) {
            tctx.drawImage(imgT, x, y, tileW, tileH);
          }
        }
        const fabricData = tctx.getImageData(0, 0, W, H).data;

        // Background detection: edge-flood approximation via color similarity to corners
        // Sample corner colors as background reference
        const samples: Array<[number, number, number]> = [];
        const sampleAt = (x: number, y: number) => {
          const i = (y * W + x) * 4;
          samples.push([data[i], data[i + 1], data[i + 2]]);
        };
        const step = 8;
        for (let x = 0; x < W; x += Math.max(1, Math.floor(W / step))) {
          sampleAt(x, 0);
          sampleAt(x, H - 1);
        }
        for (let y = 0; y < H; y += Math.max(1, Math.floor(H / step))) {
          sampleAt(0, y);
          sampleAt(W - 1, y);
        }

        const isBgColor = (r: number, g: number, b: number) => {
          // Bright/white-ish backgrounds
          if (r > 232 && g > 232 && b > 232) return true;
          // Match any sample within tolerance
          for (const [sr, sg, sb] of samples) {
            const dr = r - sr, dg = g - sg, db = b - sb;
            if (dr * dr + dg * dg + db * db < 22 * 22) return true;
          }
          return false;
        };

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (isBgColor(r, g, b)) continue; // keep background untouched

          // Luminosity of furniture pixel (preserves shadows/folds)
          const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          const tr = fabricData[i];
          const tg = fabricData[i + 1];
          const tb = fabricData[i + 2];

          // Apply fabric color modulated by furniture luminosity, with slight boost
          const k = 1.35;
          let nr = tr * lum * k;
          let ng = tg * lum * k;
          let nb = tb * lum * k;

          // Blend a touch of original to preserve highlights/edges
          const mix = 0.18;
          nr = nr * (1 - mix) + r * mix;
          ng = ng * (1 - mix) + g * mix;
          nb = nb * (1 - mix) + b * mix;

          data[i] = Math.max(0, Math.min(255, nr));
          data[i + 1] = Math.max(0, Math.min(255, ng));
          data[i + 2] = Math.max(0, Math.min(255, nb));
        }

        ctx.putImageData(imageData, 0, 0);

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
      {!both && (
        <div className="grid md:grid-cols-2 gap-5">
          <UploadZone
            title="📷 Sube la foto de tu mueble"
            hint="Formatos aceptados: JPG, PNG. Máximo 10MB"
            icon={Camera}
            onFile={handleFile((s) => setFurniture(s))}
            inputId="upload-furniture"
          />
          <div>
            <UploadZone
              title="🎨 Sube una foto del tejido"
              hint="Una muestra o imagen del tejido elegido"
              icon={Palette}
              onFile={handleFile((s) => { setFabric(s); setPresetUsed(false); })}
              inputId="upload-fabric"
            />
            {presetUsed && fabric && (
              <p className="text-gold/80 text-xs mt-2">✓ Tejido del catálogo precargado</p>
            )}
          </div>
        </div>
      )}

      {both && processing && (
        <div className="rounded-2xl bg-navy-deep/80 border-2 border-gold/40 p-10 flex flex-col items-center gap-3 text-cream">
          <Loader2 className="animate-spin text-gold" size={32} />
          <p className="text-sm">⏳ Analizando imágenes y generando visualización...</p>
        </div>
      )}

      {both && failed && !processing && (
        <div className="rounded-xl bg-navy-deep/60 border border-gold/30 p-5 text-center text-cream/80 text-sm">
          No ha sido posible generar la visualización. Puedes continuar con el presupuesto igualmente.
          <div className="mt-3">
            <Button variant="outline-gold" onClick={resetImages}>
              <RotateCcw size={16} className="mr-2" /> Reintentar
            </Button>
          </div>
        </div>
      )}

      {both && composite && !processing && (
        <div className="animate-fade-in mx-auto md:w-[92%]">
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

            {/* Mini thumbnails of originals with "Cambiar" actions */}
            <div className="mt-5 flex items-center gap-4 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fInput.current?.click()}
                className="group flex flex-col items-center gap-1"
                title="Cambiar mueble"
              >
                <img src={furniture!} alt="Mueble" className="w-14 h-14 rounded-md object-cover border border-gold/40 group-hover:border-gold" />
                <span className="text-cream/60 text-[11px] group-hover:text-gold">Cambiar</span>
              </button>
              <button
                type="button"
                onClick={() => tInput.current?.click()}
                className="group flex flex-col items-center gap-1"
                title="Cambiar tejido"
              >
                <img src={fabric!} alt="Tejido" className="w-14 h-14 rounded-md object-cover border border-gold/40 group-hover:border-gold" />
                <span className="text-cream/60 text-[11px] group-hover:text-gold">Cambiar</span>
              </button>
              <input
                ref={fInput}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(setFurniture)(f); }}
              />
              <input
                ref={tInput}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile((s) => { setFabric(s); setPresetUsed(false); })(f); }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button variant="gold" onClick={downloadComposite}>
              <Download size={18} className="mr-2" /> Descargar resultado
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
              <RotateCcw size={18} className="mr-2" /> Repetir
            </Button>
          </div>
          <p className="text-cream/50 text-xs mt-3 text-center sm:text-right">
            Visualización generada por IA. El resultado final en taller puede variar según el tejido y el tipo de tapizado.
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
