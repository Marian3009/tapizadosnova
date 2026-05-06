import { useEffect, useRef, useState } from "react";
import { Camera, Download, Palette, FileText, RotateCcw, Loader2, Sparkles } from "lucide-react";
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
  preview,
}: {
  title: string;
  hint: string;
  icon: typeof Camera;
  onFile: (f: File) => void;
  inputId: string;
  preview?: string | null;
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
        className={`relative flex flex-col items-center justify-center text-center cursor-pointer rounded-xl bg-cream py-8 px-4 border-2 border-dashed transition-colors min-h-[200px] ${drag ? "border-gold bg-gold/10" : "border-gold/60 hover:border-gold"}`}
      >
        {preview ? (
          <img src={preview} alt="" className="max-h-44 rounded-md object-contain" />
        ) : (
          <>
            <Icon className="text-gold mb-3" size={36} />
            <p className="text-navy font-medium text-sm">Arrastra tu foto aquí o haz clic</p>
            <p className="text-navy/50 text-xs mt-1">{hint}</p>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </label>
      {preview && (
        <p className="text-cream/60 text-xs mt-2 text-center">Haz clic para cambiar</p>
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

// Try AI segmentation via backend (graceful fallback if not available)
async function requestFurnitureMask(imageDataUrl: string): Promise<HTMLImageElement | null> {
  try {
    const res = await fetch("/api/segment-furniture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageDataUrl }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const url = json.maskBase64 || json.maskUrl;
    if (!url) return null;
    return await loadImg(url);
  } catch {
    return null;
  }
}

// Build a mask canvas from luminance/background detection (fallback)
function buildFallbackMask(furniture: HTMLImageElement, W: number, H: number): HTMLCanvasElement {
  const src = document.createElement("canvas");
  src.width = W; src.height = H;
  const sctx = src.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(furniture, 0, 0, W, H);
  const { data } = sctx.getImageData(0, 0, W, H);

  // Sample edge colors as background reference
  const samples: Array<[number, number, number]> = [];
  const sampleAt = (x: number, y: number) => {
    const i = (y * W + x) * 4;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  };
  const stepX = Math.max(1, Math.floor(W / 16));
  const stepY = Math.max(1, Math.floor(H / 16));
  for (let x = 0; x < W; x += stepX) { sampleAt(x, 0); sampleAt(x, H - 1); }
  for (let y = 0; y < H; y += stepY) { sampleAt(0, y); sampleAt(W - 1, y); }

  const mask = document.createElement("canvas");
  mask.width = W; mask.height = H;
  const mctx = mask.getContext("2d")!;
  const maskData = mctx.createImageData(W, H);
  const md = maskData.data;

  const isBg = (r: number, g: number, b: number) => {
    if (r > 232 && g > 232 && b > 232) return true;
    for (const [sr, sg, sb] of samples) {
      const dr = r - sr, dg = g - sg, db = b - sb;
      if (dr * dr + dg * dg + db * db < 26 * 26) return true;
    }
    return false;
  };

  for (let i = 0; i < data.length; i += 4) {
    const isBackground = isBg(data[i], data[i + 1], data[i + 2]);
    md[i] = 255; md[i + 1] = 255; md[i + 2] = 255;
    md[i + 3] = isBackground ? 0 : 255;
  }
  mctx.putImageData(maskData, 0, 0);

  // Slight blur for softer edges
  try {
    const blurred = document.createElement("canvas");
    blurred.width = W; blurred.height = H;
    const bctx = blurred.getContext("2d")!;
    bctx.filter = "blur(1.5px)";
    bctx.drawImage(mask, 0, 0);
    return blurred;
  } catch {
    return mask;
  }
}

async function composeVisualization(furnitureSrc: string, fabricSrc: string): Promise<string> {
  const [imgM, imgT] = await Promise.all([loadImg(furnitureSrc), loadImg(fabricSrc)]);

  const maxW = 1400;
  const scale = imgM.naturalWidth > maxW ? maxW / imgM.naturalWidth : 1;
  const W = Math.round(imgM.naturalWidth * scale);
  const H = Math.round(imgM.naturalHeight * scale);

  // 1. Try AI mask, otherwise fallback
  let maskCanvas: HTMLCanvasElement | HTMLImageElement;
  const aiMask = await requestFurnitureMask(furnitureSrc);
  if (aiMask) {
    maskCanvas = aiMask;
  } else {
    maskCanvas = buildFallbackMask(imgM, W, H);
  }

  // Main canvas: draw furniture as base
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imgM, 0, 0, W, H);

  // 2. Build tiled fabric layer
  const fabricLayer = document.createElement("canvas");
  fabricLayer.width = W; fabricLayer.height = H;
  const fctx = fabricLayer.getContext("2d")!;
  const targetTile = Math.max(180, Math.round(W / 4));
  const ratio = imgT.naturalWidth / imgT.naturalHeight || 1;
  const tileW = targetTile;
  const tileH = Math.round(targetTile / ratio);
  for (let y = 0; y < H; y += tileH) {
    for (let x = 0; x < W; x += tileW) {
      fctx.drawImage(imgT, x, y, tileW, tileH);
    }
  }

  // 3. Mask the fabric layer (only inside furniture)
  const maskedFabric = document.createElement("canvas");
  maskedFabric.width = W; maskedFabric.height = H;
  const mfctx = maskedFabric.getContext("2d")!;
  mfctx.drawImage(fabricLayer, 0, 0);
  mfctx.globalCompositeOperation = "destination-in";
  mfctx.drawImage(maskCanvas, 0, 0, W, H);

  // 4. Apply fabric over furniture with multiply
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.88;
  ctx.drawImage(maskedFabric, 0, 0);

  // 5. Recover shadows/highlights from original — masked to furniture only
  const maskedFurniture = document.createElement("canvas");
  maskedFurniture.width = W; maskedFurniture.height = H;
  const mfu = maskedFurniture.getContext("2d")!;
  mfu.drawImage(imgM, 0, 0, W, H);
  mfu.globalCompositeOperation = "destination-in";
  mfu.drawImage(maskCanvas, 0, 0, W, H);

  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.45;
  ctx.drawImage(maskedFurniture, 0, 0);

  // Light pass to recover bright highlights inside the mask
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.35;
  ctx.drawImage(maskedFurniture, 0, 0);

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/jpeg", 0.94);
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

  const handleFile = (setter: (s: string) => void) => (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error("La imagen supera el límite de 10MB");
      return;
    }
    if (!/^image\/(jpe?g|png|webp)$/.test(f.type)) {
      toast.error("Formato no admitido. Usa JPG, PNG o WebP.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
      setComposite(null);
      setFailed(false);
      onCompositeChange?.(null);
    };
    reader.readAsDataURL(f);
  };

  const generate = async () => {
    if (!furniture || !fabric) return;
    setProcessing(true);
    setFailed(false);
    try {
      const url = await composeVisualization(furniture, fabric);
      setComposite(url);
      onCompositeChange?.(url);
    } catch {
      setFailed(true);
    } finally {
      setProcessing(false);
    }
  };

  const downloadComposite = () => {
    if (!composite) return;
    const link = document.createElement("a");
    link.download = "tapizados-nova-visualizacion.jpg";
    link.href = composite;
    link.click();
  };

  const resetAll = () => {
    setFurniture(null);
    setFabric(null);
    setPresetUsed(false);
    setComposite(null);
    setFailed(false);
    onCompositeChange?.(null);
  };

  const both = !!(furniture && fabric);
  const showUploads = !composite && !processing;

  return (
    <div className="mt-10 space-y-6 reveal">
      <div className="text-center">
        <h3 className="font-display text-2xl md:text-3xl text-gold">✨ Visualizador IA de tapizado</h3>
        <p className="text-cream/60 text-sm mt-1">Sube tu mueble y el tejido elegido para ver cómo quedará</p>
      </div>

      {showUploads && (
        <>
          <div className="grid md:grid-cols-2 gap-5">
            <UploadZone
              title="📷 Sube foto del mueble"
              hint="JPG, PNG o WebP. Máx 10MB"
              icon={Camera}
              onFile={handleFile(setFurniture)}
              inputId="upload-furniture"
              preview={furniture}
            />
            <div>
              <UploadZone
                title="🎨 Sube foto del tejido"
                hint="Una muestra o imagen del tejido"
                icon={Palette}
                onFile={handleFile((s) => { setFabric(s); setPresetUsed(false); })}
                inputId="upload-fabric"
                preview={fabric}
              />
              {presetUsed && fabric && (
                <p className="text-gold/80 text-xs mt-2">✓ Tejido del catálogo precargado</p>
              )}
            </div>
          </div>

          {both && (
            <div className="flex justify-center pt-2">
              <Button variant="gold" size="lg" onClick={generate} className="px-10">
                <Sparkles size={18} className="mr-2" />
                Generar visualización IA
              </Button>
            </div>
          )}
        </>
      )}

      {processing && (
        <div className="rounded-2xl bg-navy-deep/80 border-2 border-gold/40 p-12 flex flex-col items-center gap-4 text-cream">
          <Loader2 className="animate-spin text-gold" size={40} />
          <p className="text-base">⏳ Analizando imágenes y generando visualización...</p>
        </div>
      )}

      {failed && !processing && (
        <div className="rounded-xl bg-navy-deep/60 border border-gold/30 p-5 text-center text-cream/80 text-sm">
          No ha sido posible generar la visualización. Puedes continuar con el presupuesto igualmente.
          <div className="mt-3 flex justify-center gap-3">
            <Button variant="gold" onClick={generate}>
              <RotateCcw size={16} className="mr-2" /> Reintentar
            </Button>
            <Button variant="outline-gold" onClick={resetAll}>
              Reiniciar
            </Button>
          </div>
        </div>
      )}

      {composite && !processing && (
        <div className="animate-fade-in mx-auto md:w-[92%]">
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
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleFile(setFurniture)(f); } }}
              />
              <input
                ref={tInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleFile((s) => { setFabric(s); setPresetUsed(false); })(f); } }}
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
            <Button variant="outline-gold" onClick={generate}>
              <RotateCcw size={18} className="mr-2" /> Regenerar
            </Button>
            <Button variant="outline-cream" onClick={resetAll}>
              Empezar de nuevo
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
