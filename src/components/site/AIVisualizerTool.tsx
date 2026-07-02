import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FabricCatalogPicker, { type CatalogSelection } from "./FabricCatalogPicker";
import BeforeAfterSlider from "./BeforeAfterSlider";

const PROCESSING_STEPS = [
  { label: "🔍 Analizando el mueble con IA...", pct: 25 },
  { label: "🧵 Estudiando el tejido y su textura...", pct: 50 },
  { label: "🎨 Aplicando el tejido al mueble...", pct: 75 },
  { label: "✨ Finalizando la visualización...", pct: 92 },
];

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

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

export default function AIVisualizerTool() {
  const [furniture, setFurniture] = useState<string | null>(null);
  const [furnitureMime, setFurnitureMime] = useState<string>("image/jpeg");
  const [fabricPhoto, setFabricPhoto] = useState<string | null>(null);
  const [catalogSelection, setCatalogSelection] = useState<CatalogSelection | null>(null);
  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const fabricImage = fabricPhoto ?? catalogSelection?.imagen ?? null;
  const fabricLabel = catalogSelection?.nombre ?? (fabricPhoto ? "Foto de tejido subida" : null);

  useEffect(() => {
    if (!processing) return;
    setStepIdx(0);
    const t1 = setTimeout(() => setStepIdx(1), 3000);
    const t2 = setTimeout(() => setStepIdx(2), 8000);
    const t3 = setTimeout(() => setStepIdx(3), 15000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [processing]);

  const readFile = async (file: File): Promise<{ dataUrl: string; mime: string } | null> => {
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "Imagen demasiado grande", description: "Máximo 20 MB", variant: "destructive" });
      return null;
    }
    try {
      return await resizeImageToJpegDataUrl(file);
    } catch (e) {
      console.error("resize error", e);
      toast({ title: "No se ha podido leer la imagen", description: "Prueba con otra foto (JPG o PNG).", variant: "destructive" });
      return null;
    }
  };

  const handleFurniture = async (file: File) => {
    const r = await readFile(file);
    if (!r) return;
    setFurniture(r.dataUrl);
    setFurnitureMime(r.mime);
  };

  const handleFabricPhoto = async (file: File) => {
    if (catalogSelection) setCatalogSelection(null);
    const r = await readFile(file);
    if (!r) return;
    setFabricPhoto(r.dataUrl);
  };

  const handleCatalogSelect = (s: CatalogSelection) => {
    setFabricPhoto(null);
    setCatalogSelection(s);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setFurniture(null);
    setFabricPhoto(null);
    setCatalogSelection(null);
  };

  const generate = async () => {
    if (!furniture || !fabricImage) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const fab = await urlToDataUrl(fabricImage);
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
        toast({ title: "Herramienta muy solicitada ahora mismo", description: "Inténtalo de nuevo en unos minutos.", variant: "destructive" });
        throw new Error("payment_required");
      }
      if (!data?.imageUrl) throw new Error(data?.error || "no_image");
      setResult(data.imageUrl);
    } catch (e) {
      console.error(e);
      setError("No ha sido posible generar la visualización. Prueba de nuevo o continúa directamente con tu presupuesto.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "visualizacion-tapizados-nova.jpg";
    a.click();
  };

  if (result && furniture) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-6">
          <h3 className="font-display text-3xl md:text-4xl text-cream">🛋️ Así quedaría tu mueble</h3>
          {fabricLabel && <p className="text-cream/60 text-sm mt-2">Tejido: {fabricLabel}</p>}
        </div>
        <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border-[3px] border-gold shadow-[0_30px_60px_-20px_rgba(42,48,60,0.7)]">
          <BeforeAfterSlider before={furniture} after={result} />
        </div>
        <p className="text-center text-cream/50 text-xs mt-3">Arrastra el control para comparar el antes y el después</p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button variant="gold" size="lg" onClick={download}>📥 Descargar imagen</Button>
          <Button asChild variant="outline-gold" size="lg">
            <a href="/#presupuesto">💰 Pedir presupuesto con esta tela</a>
          </Button>
          <Button variant="outline-gold" size="lg" onClick={reset}>🔄 Probar otro tejido</Button>
        </div>
        <p className="text-center text-cream/50 text-xs mt-4 max-w-xl mx-auto">
          Visualización orientativa generada por IA. El resultado final en taller puede variar según el tejido y tipo de tapizado.
        </p>
      </div>
    );
  }

  if (processing) {
    const step = PROCESSING_STEPS[stepIdx];
    return (
      <div className="rounded-2xl border border-gold/30 bg-navy-deep/60 p-10 md:p-14 text-center animate-fade-in max-w-2xl mx-auto">
        <div className="inline-block w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-cream text-lg md:text-xl font-medium mb-2">{step.label}</p>
        <p className="text-cream/50 text-sm mb-6">Paso {stepIdx + 1} de {PROCESSING_STEPS.length} · La IA puede tardar entre 10 y 30 segundos</p>
        <Progress value={step.pct} className="h-2 bg-cream/10 [&>div]:bg-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-5">
        <FurnitureZone value={furniture} onFile={handleFurniture} onClear={() => setFurniture(null)} />
        <FabricZone
          photo={fabricPhoto}
          catalog={catalogSelection}
          onUpload={handleFabricPhoto}
          onPickCatalog={() => setPickerOpen(true)}
          onClearPhoto={() => setFabricPhoto(null)}
          onClearCatalog={() => setCatalogSelection(null)}
        />

        <FabricCatalogPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={handleCatalogSelect} />

        {error && (
          <div className="md:col-span-2 rounded-lg border border-destructive/40 bg-destructive/10 text-cream px-4 py-3 text-sm">
            {error}
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="gold" onClick={generate} disabled={!furniture || !fabricImage}>Reintentar</Button>
            </div>
          </div>
        )}

        {furniture && fabricImage && (
          <div className="md:col-span-2 flex justify-center mt-2">
            <Button variant="gold" size="xl" onClick={generate} className="px-12">
              ✨ Generar visualización
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FurnitureZone({ value, onFile, onClear }: { value: string | null; onFile: (f: File) => void; onClear: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-xl border-2 border-dashed border-gold/40 bg-cream/5 p-5">
      <h4 className="text-cream font-medium mb-3">📷 1. Sube la foto de tu mueble</h4>
      {value ? (
        <div className="relative">
          <img src={value} alt="Mueble" className="w-full h-48 object-cover rounded-lg shadow" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 bg-navy/80 text-cream w-8 h-8 rounded-full hover:bg-destructive transition"
            aria-label="Eliminar"
          >×</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 rounded-lg bg-cream/5 border border-gold/20 hover:bg-cream/10 transition flex flex-col items-center justify-center text-cream/70"
        >
          <span className="text-3xl mb-1">＋</span>
          <span className="text-sm">Formato JPG/PNG · máx 20 MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }}
      />
    </div>
  );
}

function FabricZone({
  photo, catalog, onUpload, onPickCatalog, onClearPhoto, onClearCatalog,
}: {
  photo: string | null;
  catalog: CatalogSelection | null;
  onUpload: (f: File) => void;
  onPickCatalog: () => void;
  onClearPhoto: () => void;
  onClearCatalog: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-xl border-2 border-dashed border-gold/40 bg-cream/5 p-5">
      <h4 className="text-cream font-medium mb-3">🧵 2. Elige el tejido</h4>

      {catalog && !photo && (
        <div className="rounded-lg bg-navy-deep/70 border border-gold/40 p-3 animate-fade-in">
          <div className="text-[11px] uppercase tracking-widest text-gold mb-2">Tejido del catálogo</div>
          <div className="flex gap-3 items-center">
            <div className="relative w-20 h-20 rounded-md overflow-hidden border border-gold/40 flex-shrink-0">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${catalog.imagen})` }} />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-2 border-navy-deep rounded-tl-md" style={{ backgroundColor: catalog.hex }} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 text-cream">
              <div className="text-sm font-display">{catalog.coleccion}</div>
              <div className="text-xs text-cream/70 truncate"><span className="text-gold">Ref:</span> {catalog.referencia}</div>
              <div className="text-xs text-cream/70 truncate"><span className="text-gold">Color:</span> {catalog.color}</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Button size="sm" variant="gold" onClick={onPickCatalog}>Cambiar tejido</Button>
            <Button size="sm" variant="outline-gold" onClick={onClearCatalog}>Quitar selección</Button>
          </div>
        </div>
      )}

      {photo && (
        <div className="relative animate-fade-in">
          <img src={photo} alt="Tejido" className="w-full h-48 object-cover rounded-lg shadow" />
          <button
            type="button"
            onClick={onClearPhoto}
            className="absolute top-2 right-2 bg-navy/80 text-cream w-8 h-8 rounded-full hover:bg-destructive transition"
            aria-label="Eliminar"
          >×</button>
          <div className="absolute bottom-2 left-2 right-2 bg-navy/80 text-cream text-xs px-2 py-1 rounded">
            Foto del tejido subida
          </div>
        </div>
      )}

      {!photo && !catalog && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-32 rounded-lg bg-cream/5 border border-gold/20 hover:bg-cream/10 transition flex flex-col items-center justify-center text-cream/70"
          >
            <span className="text-3xl mb-1">＋</span>
            <span className="text-sm">Subir foto del tejido</span>
          </button>
          <div className="flex items-center gap-3 my-1">
            <span className="h-px flex-1 bg-cream/15" />
            <span className="text-[11px] uppercase tracking-widest text-cream/40">o</span>
            <span className="h-px flex-1 bg-cream/15" />
          </div>
          <Button type="button" variant="outline-gold" size="sm" className="w-full" onClick={onPickCatalog}>
            📚 Elegir de nuestro catálogo
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.currentTarget.value = ""; }}
      />
    </div>
  );
}
