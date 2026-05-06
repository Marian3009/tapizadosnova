import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Project = {
  muebleLabel: string;
  telaLabel: string;
  metraje: number;
  base: number;
};

interface Props {
  presetFabric?: { nombre: string; imagen: string } | null;
  project: Project;
  onCompositeChange?: (data: string | null) => void;
  includeInPdf?: boolean;
  onIncludeChange?: (v: boolean) => void;
}

type AIAnalysis = {
  tipo_mueble?: string;
  zona_tapizable: {
    descripcion?: string;
    porcentaje_x_inicio: number;
    porcentaje_x_fin: number;
    porcentaje_y_inicio: number;
    porcentaje_y_fin: number;
  };
};

const PROCESSING_STEPS = [
  "🔍 Analizando el mueble con IA...",
  "🎨 Aplicando el tejido seleccionado...",
  "✨ Finalizando la visualización...",
];

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function dataUrlToBase64(d: string) {
  const i = d.indexOf(",");
  return i >= 0 ? d.slice(i + 1) : d;
}

// Fallback: detección por luminosidad / bordes para construir bounding box
async function fallbackBoundingBox(furnitureSrc: string): Promise<AIAnalysis> {
  const img = await loadImg(furnitureSrc);
  const W = Math.min(img.naturalWidth, 600);
  const H = Math.round((img.naturalHeight / img.naturalWidth) * W);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  // muestrear color de las 4 esquinas como fondo
  const samples: number[][] = [];
  const corners = [
    [2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3],
  ];
  for (const [x, y] of corners) {
    const i = (y * W + x) * 4;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  }
  const avg = samples.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [0, 0, 0]).map((v) => v / samples.length);

  let minX = W, minY = H, maxX = 0, maxY = 0;
  const thr = 38;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const dr = data[i] - avg[0];
      const dg = data[i + 1] - avg[1];
      const db = data[i + 2] - avg[2];
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist > thr) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) {
    minX = Math.round(W * 0.1);
    minY = Math.round(H * 0.15);
    maxX = Math.round(W * 0.9);
    maxY = Math.round(H * 0.85);
  }
  return {
    zona_tapizable: {
      porcentaje_x_inicio: (minX / W) * 100,
      porcentaje_x_fin: (maxX / W) * 100,
      porcentaje_y_inicio: (minY / H) * 100,
      porcentaje_y_fin: (maxY / H) * 100,
    },
  };
}

async function composeWithAIData(
  furnitureSrc: string,
  fabricSrc: string,
  ai: AIAnalysis,
): Promise<string> {
  const [imgM, imgT] = await Promise.all([loadImg(furnitureSrc), loadImg(fabricSrc)]);

  // limitar tamaño para rendimiento
  const maxW = 1400;
  const scale = Math.min(1, maxW / imgM.naturalWidth);
  const W = Math.round(imgM.naturalWidth * scale);
  const H = Math.round(imgM.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 1. Mueble base
  ctx.drawImage(imgM, 0, 0, W, H);

  const z = ai.zona_tapizable;
  const x = Math.max(0, Math.round((z.porcentaje_x_inicio / 100) * W));
  const y = Math.max(0, Math.round((z.porcentaje_y_inicio / 100) * H));
  const w = Math.min(W - x, Math.round(((z.porcentaje_x_fin - z.porcentaje_x_inicio) / 100) * W));
  const h = Math.min(H - y, Math.round(((z.porcentaje_y_fin - z.porcentaje_y_inicio) / 100) * H));

  // 2. Capa tileada del tejido
  const fabricCanvas = document.createElement("canvas");
  fabricCanvas.width = W;
  fabricCanvas.height = H;
  const fctx = fabricCanvas.getContext("2d")!;
  const tileSize = Math.max(80, Math.round(W / 4));
  const tileH = Math.round((imgT.naturalHeight / imgT.naturalWidth) * tileSize);
  for (let yy = 0; yy < H; yy += tileH) {
    for (let xx = 0; xx < W; xx += tileSize) {
      fctx.drawImage(imgT, xx, yy, tileSize, tileH);
    }
  }

  // 3. Aplicar tejido SOLO en la bounding box con bordes redondeados
  ctx.save();
  ctx.beginPath();
  const radio = Math.min(w, h) * 0.06;
  // roundRect fallback
  if ((ctx as any).roundRect) {
    (ctx as any).roundRect(x, y, w, h, radio);
  } else {
    ctx.moveTo(x + radio, y);
    ctx.arcTo(x + w, y, x + w, y + h, radio);
    ctx.arcTo(x + w, y + h, x, y + h, radio);
    ctx.arcTo(x, y + h, x, y, radio);
    ctx.arcTo(x, y, x + w, y, radio);
  }
  ctx.clip();

  // 3a. Tejido en multiply para integrar color con sombras del mueble
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.9;
  ctx.drawImage(fabricCanvas, 0, 0, W, H);

  // 3b. Recuperar volumen / pliegues con soft-light del mueble original
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.45;
  ctx.drawImage(imgM, 0, 0, W, H);

  ctx.restore();

  // 4. Reforzar sombras profundas en toda la imagen muy ligeramente
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.12;
  ctx.drawImage(imgM, 0, 0, W, H);
  ctx.restore();

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/jpeg", 0.94);
}

export default function FabricVisualizer({
  presetFabric,
  project,
  onCompositeChange,
  includeInPdf = true,
  onIncludeChange,
}: Props) {
  const [furniture, setFurniture] = useState<string | null>(null);
  const [fabric, setFabric] = useState<string | null>(null);
  const [furnitureMime, setFurnitureMime] = useState<string>("image/jpeg");
  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const furnitureInput = useRef<HTMLInputElement>(null);
  const fabricInput = useRef<HTMLInputElement>(null);

  // Si seleccionan un tejido del catálogo, lo precargamos
  useEffect(() => {
    if (presetFabric?.imagen) {
      setFabric(presetFabric.imagen);
    }
  }, [presetFabric]);

  useEffect(() => {
    onCompositeChange?.(result);
  }, [result, onCompositeChange]);

  // Avance de mensajes durante procesamiento
  useEffect(() => {
    if (!processing) return;
    setStepIdx(0);
    const t1 = setTimeout(() => setStepIdx(1), 1800);
    const t2 = setTimeout(() => setStepIdx(2), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [processing]);

  const handleFile = async (file: File, kind: "furniture" | "fabric") => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Imagen demasiado grande", description: "Máximo 8 MB", variant: "destructive" });
      return;
    }
    const url = await fileToDataUrl(file);
    if (kind === "furniture") {
      setFurniture(url);
      setFurnitureMime(file.type || "image/jpeg");
    } else {
      setFabric(url);
    }
  };

  const reset = (full = true) => {
    setResult(null);
    setError(null);
    setUsedFallback(false);
    if (full) {
      setFurniture(null);
      setFabric(null);
    }
  };

  const generate = async () => {
    if (!furniture || !fabric) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    setUsedFallback(false);

    try {
      let analysis: AIAnalysis | null = null;
      try {
        const { data, error: fnErr } = await supabase.functions.invoke("analyze-furniture", {
          body: { imageBase64: dataUrlToBase64(furniture), mimeType: furnitureMime },
        });
        if (fnErr) throw fnErr;
        if (data?.error === "rate_limit") {
          toast({ title: "Demasiadas solicitudes", description: "Inténtalo en unos segundos.", variant: "destructive" });
        } else if (data?.error === "payment_required") {
          toast({ title: "Sin créditos de IA", description: "Añade créditos en Lovable Cloud.", variant: "destructive" });
        }
        if (data?.analysis) analysis = data.analysis as AIAnalysis;
      } catch (e) {
        console.warn("AI analysis failed, using fallback", e);
      }

      if (!analysis) {
        analysis = await fallbackBoundingBox(furniture);
        setUsedFallback(true);
      }

      const composite = await composeWithAIData(furniture, fabric, analysis);
      setResult(composite);
    } catch (e) {
      console.error(e);
      setError(
        "No ha sido posible generar la visualización. Puedes continuar con el presupuesto igualmente.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "visualizacion-tapizado-nova.jpg";
    a.click();
  };

  // ESTADO 3: resultado
  if (result) {
    return (
      <div className="reveal mt-12 animate-fade-in">
        <div className="text-center mb-6">
          <h3 className="font-display text-3xl md:text-4xl text-cream">🛋️ Vista final de tu proyecto</h3>
          <p className="text-cream/60 text-sm mt-2">{project.muebleLabel} · {project.telaLabel}</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-[3px] border-gold shadow-[0_30px_60px_-20px_rgba(42,48,60,0.7)] bg-navy-deep">
          <img src={result} alt="Visualización del mueble tapizado" className="w-full h-auto block" />

          {/* miniaturas integradas */}
          <TooltipProvider>
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => furnitureInput.current?.click()}
                    className="w-[60px] h-[60px] rounded-md overflow-hidden border-2 border-gold/80 shadow-lg hover:scale-105 transition"
                    aria-label="Cambiar mueble"
                  >
                    <img src={furniture!} alt="" className="w-full h-full object-cover" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Cambiar mueble</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => fabricInput.current?.click()}
                    className="w-[60px] h-[60px] rounded-md overflow-hidden border-2 border-gold/80 shadow-lg hover:scale-105 transition"
                    aria-label="Cambiar tejido"
                  >
                    <img src={fabric!} alt="" className="w-full h-full object-cover" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Cambiar tejido</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {usedFallback && (
          <p className="text-center text-cream/50 text-xs mt-3">Usando modo estándar de visualización.</p>
        )}

        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <Button variant="gold" onClick={download}>📥 Descargar resultado</Button>
          <Button
            variant={includeInPdf ? "gold" : "outline-gold"}
            onClick={() => onIncludeChange?.(!includeInPdf)}
          >
            📄 {includeInPdf ? "Incluida en PDF" : "Incluir en PDF"}
          </Button>
          <Button variant="outline-gold" onClick={() => reset(true)}>🔄 Nueva visualización</Button>
        </div>

        <p className="text-center text-cream/50 text-xs mt-4 max-w-xl mx-auto">
          Visualización orientativa generada por IA. El resultado final en taller puede variar según el tejido y tipo de tapizado.
        </p>

        {/* hidden inputs para el cambio rápido */}
        <input
          ref={furnitureInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              handleFile(f, "furniture").then(() => {
                setResult(null);
              });
            }
          }}
        />
        <input
          ref={fabricInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              handleFile(f, "fabric").then(() => {
                setResult(null);
              });
            }
          }}
        />
      </div>
    );
  }

  // ESTADO 2: procesando
  if (processing) {
    return (
      <div className="reveal mt-12 rounded-2xl border border-gold/30 bg-navy-deep/60 p-12 text-center animate-fade-in">
        <div className="inline-block w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-5" />
        <p className="text-cream text-lg">{PROCESSING_STEPS[stepIdx]}</p>
        <p className="text-cream/50 text-sm mt-2">Esto puede tardar unos segundos</p>
      </div>
    );
  }

  // ESTADO 1: subir imágenes
  return (
    <div className="reveal mt-12 grid md:grid-cols-2 gap-5">
      <UploadZone
        title="📷 Sube la foto de tu mueble"
        hint="Formato JPG/PNG · máx 8 MB"
        value={furniture}
        onFile={(f) => handleFile(f, "furniture")}
        onClear={() => setFurniture(null)}
      />
      <UploadZone
        title="🧵 Sube la foto del tejido"
        hint={presetFabric ? `Precargado: ${presetFabric.nombre}` : "O elige uno del catálogo"}
        value={fabric}
        onFile={(f) => handleFile(f, "fabric")}
        onClear={() => setFabric(null)}
      />

      {error && (
        <div className="md:col-span-2 rounded-lg border border-destructive/40 bg-destructive/10 text-cream px-4 py-3 text-sm">
          {error}
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="gold" onClick={generate} disabled={!furniture || !fabric}>Reintentar</Button>
          </div>
        </div>
      )}

      {furniture && fabric && (
        <div className="md:col-span-2 flex justify-center mt-2">
          <Button variant="gold" size="lg" onClick={generate} className="px-10">
            ✨ Generar visualización
          </Button>
        </div>
      )}
    </div>
  );
}

function UploadZone({
  title,
  hint,
  value,
  onFile,
  onClear,
}: {
  title: string;
  hint: string;
  value: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-xl border-2 border-dashed border-gold/40 bg-cream/5 p-5">
      <h4 className="text-cream font-medium mb-3">{title}</h4>
      {value ? (
        <div className="relative">
          <img src={value} alt="" className="w-full h-48 object-cover rounded-lg shadow" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 bg-navy/80 text-cream w-8 h-8 rounded-full hover:bg-destructive transition"
            aria-label="Eliminar"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 rounded-lg bg-cream/5 border border-gold/20 hover:bg-cream/10 transition flex flex-col items-center justify-center text-cream/70"
        >
          <span className="text-3xl mb-2">＋</span>
          <span className="text-sm">{hint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}
