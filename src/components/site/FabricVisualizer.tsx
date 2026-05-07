import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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

const PROCESSING_STEPS = [
  "🔍 Analizando el mueble con IA...",
  "🎨 Aplicando el tejido al mueble...",
  "✨ Finalizando la visualización...",
];

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Redimensiona y convierte a JPEG (máx 1600px lado largo) en el navegador.
// Soluciona fotos enormes de móvil (4-12MB) y HEIC de iPhone (vía decodificación nativa).
async function resizeImageToJpegDataUrl(file: File, maxSide = 1600, quality = 0.85): Promise<{ dataUrl: string; mime: string }> {
  const dataUrl = await fileToDataUrl(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image_decode_failed"));
      img.src = dataUrl;
    });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) throw new Error("invalid_image");
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);
    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_unsupported");
    ctx.drawImage(img, 0, 0, tw, th);
    const out = canvas.toDataURL("image/jpeg", quality);
    return { dataUrl: out, mime: "image/jpeg" };
  } catch {
    // Fallback: devuelve original
    return { dataUrl, mime: file.type || "image/jpeg" };
  }
}

async function urlToDataUrl(url: string): Promise<{ data: string; mime: string }> {
  if (url.startsWith("data:")) {
    const mime = url.slice(5, url.indexOf(";")) || "image/jpeg";
    return { data: url, mime };
  }
  const res = await fetch(url);
  const blob = await res.blob();
  const mime = blob.type || "image/jpeg";
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
  return { data, mime };
}

function dataUrlToBase64(d: string) {
  const i = d.indexOf(",");
  return i >= 0 ? d.slice(i + 1) : d;
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

  useEffect(() => {
    if (presetFabric?.imagen) setFabric(presetFabric.imagen);
  }, [presetFabric]);

  useEffect(() => {
    onCompositeChange?.(result);
  }, [result, onCompositeChange]);

  useEffect(() => {
    if (!processing) return;
    setStepIdx(0);
    const t1 = setTimeout(() => setStepIdx(1), 2500);
    const t2 = setTimeout(() => setStepIdx(2), 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [processing]);

  const handleFile = async (file: File, kind: "furniture" | "fabric") => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "Imagen demasiado grande", description: "Máximo 20 MB", variant: "destructive" });
      return;
    }
    try {
      const { dataUrl, mime } = await resizeImageToJpegDataUrl(file);
      if (kind === "furniture") {
        setFurniture(dataUrl);
        setFurnitureMime(mime);
      } else {
        setFabric(dataUrl);
      }
    } catch (e) {
      console.error("resize error", e);
      toast({
        title: "No se ha podido leer la imagen",
        description: "Prueba con otra foto (JPG o PNG).",
        variant: "destructive",
      });
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setFurniture(null);
    setFabric(null);
  };

  const generate = async () => {
    if (!furniture || !fabric) return;
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const fab = await urlToDataUrl(fabric);
      const { data, error: fnErr } = await supabase.functions.invoke("analyze-furniture", {
        body: {
          furnitureBase64: dataUrlToBase64(furniture),
          furnitureMime,
          fabricBase64: dataUrlToBase64(fab.data),
          fabricMime: fab.mime,
        },
      });

      if (fnErr) throw fnErr;

      if (data?.error === "rate_limit") {
        toast({ title: "Demasiadas solicitudes", description: "Inténtalo en unos segundos.", variant: "destructive" });
        throw new Error("rate_limit");
      }
      if (data?.error === "payment_required") {
        toast({ title: "Sin créditos de IA", description: "Añade créditos en Lovable Cloud.", variant: "destructive" });
        throw new Error("payment_required");
      }
      if (!data?.imageUrl) throw new Error(data?.error || "no_image");

      setResult(data.imageUrl);
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

        <div className="rounded-2xl overflow-hidden border-[3px] border-gold shadow-[0_30px_60px_-20px_rgba(42,48,60,0.7)] bg-navy-deep max-w-3xl mx-auto">
          <img src={result} alt="Mueble tapizado con el tejido elegido" className="w-full h-auto block" />
        </div>

        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <Button variant="gold" onClick={download}>📥 Descargar resultado</Button>
          <Button
            variant={includeInPdf ? "gold" : "outline-gold"}
            onClick={() => onIncludeChange?.(!includeInPdf)}
          >
            📄 {includeInPdf ? "Incluida en PDF" : "Incluir en PDF"}
          </Button>
          <Button variant="outline-gold" onClick={reset}>🔄 Nueva visualización</Button>
        </div>

        <p className="text-center text-cream/50 text-xs mt-4 max-w-xl mx-auto">
          Visualización orientativa generada por IA. El resultado final en taller puede variar según el tejido y tipo de tapizado.
        </p>
      </div>
    );
  }

  // ESTADO 2: procesando
  if (processing) {
    return (
      <div className="reveal mt-12 rounded-2xl border border-gold/30 bg-navy-deep/60 p-12 text-center animate-fade-in">
        <div className="inline-block w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-5" />
        <p className="text-cream text-lg">{PROCESSING_STEPS[stepIdx]}</p>
        <p className="text-cream/50 text-sm mt-2">La IA puede tardar entre 10 y 30 segundos</p>
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
