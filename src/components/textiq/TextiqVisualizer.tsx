import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BeforeAfterSlider from "@/components/site/BeforeAfterSlider";
import { CATEGORIES, SPACES, STYLES, categoriesForMode, type Mode } from "@/lib/textiq/catalog";
import { resizeImageToJpegDataUrl, dataUrlToBase64, applyWatermark } from "@/lib/textiq/imageUtils";
import type { TextiqUsage } from "@/hooks/use-textiq-session";
import { TEXTIQ } from "@/lib/textiq/brand";

const PROCESSING_STEPS = [
  { label: "🔍 Analizando la imagen con IA...", pct: 22 },
  { label: "🎨 Componiendo la propuesta...", pct: 50 },
  { label: "🧵 Ajustando texturas y materiales...", pct: 75 },
  { label: "✨ Finalizando la visualización...", pct: 92 },
];

interface Props {
  deviceId: string;
  isLoggedIn: boolean;
  usage: TextiqUsage | null;
  usageLoading: boolean;
  onUsageChange: () => void;
  onRequireAuth: () => void;
}

export default function TextiqVisualizer({
  deviceId,
  isLoggedIn,
  usage,
  usageLoading,
  onUsageChange,
  onRequireAuth,
}: Props) {
  const [mode, setMode] = useState<Mode>("retapizar");
  const [category, setCategory] = useState<string>("sofa");
  const [spaceType, setSpaceType] = useState<string>("salon");
  const [style, setStyle] = useState<string>("minimalista");

  const [itemImage, setItemImage] = useState<{ dataUrl: string; mime: string } | null>(null);
  const [referenceImage, setReferenceImage] = useState<{ dataUrl: string; mime: string } | null>(null);

  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState(false);

  const availableCategories = categoriesForMode(mode);

  useEffect(() => {
    if (!availableCategories.find((c) => c.id === category)) {
      setCategory(availableCategories[0]?.id ?? "sofa");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (!processing) return;
    setStepIdx(0);
    const timers = [
      setTimeout(() => setStepIdx(1), 3000),
      setTimeout(() => setStepIdx(2), 8000),
      setTimeout(() => setStepIdx(3), 15000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [processing]);

  const readFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "Imagen demasiado grande", description: "Máximo 20 MB", variant: "destructive" });
      return null;
    }
    try {
      return await resizeImageToJpegDataUrl(file);
    } catch {
      toast({ title: "No se ha podido leer la imagen", description: "Prueba con otra foto (JPG o PNG).", variant: "destructive" });
      return null;
    }
  };

  const handleItemFile = async (file: File) => {
    const r = await readFile(file);
    if (r) setItemImage(r);
  };
  const handleReferenceFile = async (file: File) => {
    const r = await readFile(file);
    if (r) setReferenceImage(r);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setLimitError(false);
    setItemImage(null);
    setReferenceImage(null);
  };

  const canGenerate = !!itemImage && (mode === "proponer" || !!referenceImage);
  const limitReached = !!usage && usage.used >= usage.limit;

  const generate = async () => {
    if (!itemImage) return;
    if (mode === "retapizar" && !referenceImage) return;
    if (limitReached) {
      setLimitError(true);
      return;
    }
    setProcessing(true);
    setError(null);
    setLimitError(false);
    setResult(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("textiq-generate", {
        body: {
          mode,
          category,
          spaceType: mode === "proponer" ? spaceType : undefined,
          style: mode === "proponer" ? style : undefined,
          itemBase64: dataUrlToBase64(itemImage.dataUrl),
          itemMime: itemImage.mime,
          referenceBase64: referenceImage ? dataUrlToBase64(referenceImage.dataUrl) : undefined,
          referenceMime: referenceImage?.mime,
          deviceId,
        },
      });
      if (fnErr) throw fnErr;
      if (data?.error === "limit_reached") {
        setLimitError(true);
        onUsageChange();
        return;
      }
      if (data?.error === "rate_limit") {
        toast({ title: "Demasiadas solicitudes", description: "Inténtalo en unos segundos.", variant: "destructive" });
        throw new Error("rate_limit");
      }
      if (data?.error === "payment_required") {
        toast({ title: "Herramienta muy solicitada ahora mismo", description: "Inténtalo de nuevo en unos minutos.", variant: "destructive" });
        throw new Error("payment_required");
      }
      if (!data?.imageUrl) throw new Error(data?.error || "no_image");

      const finalPlan = data?.usage?.plan ?? usage?.plan ?? "free";
      const finalImage = finalPlan === "free" ? await applyWatermark(data.imageUrl, TEXTIQ.short) : data.imageUrl;
      setResult(finalImage);
      onUsageChange();
    } catch (e) {
      console.error(e);
      setError("No ha sido posible generar la visualización. Prueba de nuevo en unos segundos.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "textiq-ai.jpg";
    a.click();
  };

  const usagePct = usage ? Math.min(100, Math.round((usage.used / Math.max(usage.limit, 1)) * 100)) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Contador de uso */}
      {!usageLoading && usage && (
        <div className="mb-8 rounded-xl border border-gold/20 bg-navy-deep/60 px-5 py-4">
          <div className="flex items-center justify-between text-sm text-cream/80 mb-2">
            <span>
              Plan <strong className="text-gold capitalize">{usage.plan}</strong> · {usage.used} / {usage.limit} generaciones este mes
            </span>
            {!isLoggedIn && (
              <button type="button" onClick={onRequireAuth} className="text-gold hover:underline text-xs">
                Crear cuenta gratis →
              </button>
            )}
          </div>
          <Progress value={usagePct} className="h-1.5 bg-cream/10 [&>div]:bg-gold" />
        </div>
      )}

      {result && itemImage ? (
        <div className="animate-fade-in">
          <div className="text-center mb-6">
            <h3 className="font-display text-3xl md:text-4xl text-cream">✨ Tu propuesta con IA</h3>
          </div>
          <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border-[3px] border-gold shadow-[0_30px_60px_-20px_rgba(42,48,60,0.7)]">
            <BeforeAfterSlider before={itemImage.dataUrl} after={result} />
          </div>
          <p className="text-center text-cream/50 text-xs mt-3">Arrastra el control para comparar el antes y el después</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button variant="gold" size="lg" onClick={download}>📥 Descargar imagen</Button>
            <Button variant="outline-gold" size="lg" onClick={reset}>🔄 Nueva generación</Button>
          </div>
        </div>
      ) : processing ? (
        <div className="rounded-2xl border border-gold/30 bg-navy-deep/60 p-10 md:p-14 text-center animate-fade-in max-w-2xl mx-auto">
          <div className="inline-block w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-cream text-lg md:text-xl font-medium mb-2">{PROCESSING_STEPS[stepIdx].label}</p>
          <p className="text-cream/50 text-sm mb-6">Paso {stepIdx + 1} de {PROCESSING_STEPS.length} · 10-30 segundos</p>
          <Progress value={PROCESSING_STEPS[stepIdx].pct} className="h-2 bg-cream/10 [&>div]:bg-gold" />
        </div>
      ) : (
        <>
          {/* Modo */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <ModeCard
              active={mode === "retapizar"}
              icon="🪑"
              title="Retapizar un elemento"
              desc="Tengo el mueble/cortina y una tela o material de referencia"
              onClick={() => setMode("retapizar")}
            />
            <ModeCard
              active={mode === "proponer"}
              icon="✨"
              title="Proponer decoración"
              desc="Tengo una foto del espacio y quiero propuestas en tendencia"
              onClick={() => setMode("proponer")}
            />
          </div>

          {/* Categoría */}
          <ChipGroup
            label={mode === "retapizar" ? "¿Qué quieres retapizar?" : "¿Qué quieres proponer?"}
            options={availableCategories.map((c) => ({ id: c.id, label: `${c.icon} ${c.label}` }))}
            value={category}
            onChange={setCategory}
          />

          {mode === "proponer" && (
            <>
              <ChipGroup
                label="Tipo de espacio"
                options={SPACES.map((s) => ({ id: s.id, label: `${s.icon} ${s.label}` }))}
                value={spaceType}
                onChange={setSpaceType}
              />
              <ChipGroup
                label="Estilo / tendencia"
                options={STYLES.map((s) => ({ id: s.id, label: s.label }))}
                value={style}
                onChange={setStyle}
              />
            </>
          )}

          {/* Imágenes */}
          <div className="grid md:grid-cols-2 gap-5 mt-6">
            <UploadZone
              title={mode === "retapizar" ? "📷 1. Sube la foto del elemento" : "📷 1. Sube la foto del espacio"}
              value={itemImage?.dataUrl ?? null}
              onFile={handleItemFile}
              onClear={() => setItemImage(null)}
            />
            <UploadZone
              title={mode === "retapizar" ? "🧵 2. Foto del tejido o material" : "🖼️ 2. Inspiración (opcional)"}
              value={referenceImage?.dataUrl ?? null}
              onFile={handleReferenceFile}
              onClear={() => setReferenceImage(null)}
              optional={mode === "proponer"}
            />
          </div>

          {(error || limitError) && (
            <div className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 text-cream px-4 py-4 text-sm">
              {limitError ? (
                <>
                  <p className="font-medium mb-1">Has alcanzado el límite de tu plan {usage?.plan ?? "gratuito"} este mes.</p>
                  <p className="text-cream/70 mb-3">Actualiza de plan para seguir generando visualizaciones sin esperar al mes que viene.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="gold">
                      <a href={TEXTIQ.routes.pricing}>Ver planes</a>
                    </Button>
                    {!isLoggedIn && (
                      <Button size="sm" variant="outline-gold" onClick={onRequireAuth}>Crear cuenta</Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {error}
                  <div className="mt-2">
                    <Button size="sm" variant="gold" onClick={generate} disabled={!canGenerate}>Reintentar</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {canGenerate && !limitError && (
            <div className="flex justify-center mt-6">
              <Button variant="gold" size="xl" onClick={generate} className="px-12">
                ✨ Generar con IA
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ModeCard({ active, icon, title, desc, onClick }: { active: boolean; icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border-2 p-5 transition ${
        active ? "border-gold bg-gold/10" : "border-cream/15 bg-cream/5 hover:border-gold/50"
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-display text-lg text-cream">{title}</div>
      <div className="text-cream/60 text-sm mt-1">{desc}</div>
    </button>
  );
}

function ChipGroup({
  label, options, value, onChange,
}: { label: string; options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-5">
      <p className="text-cream/70 text-xs uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`px-3.5 py-2 rounded-full text-sm transition border ${
              value === o.id
                ? "bg-gold text-navy font-medium border-gold"
                : "bg-cream/5 text-cream/80 border-cream/15 hover:border-gold/60 hover:text-gold"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadZone({
  title, value, onFile, onClear, optional,
}: { title: string; value: string | null; onFile: (f: File) => void; onClear: () => void; optional?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-xl border-2 border-dashed border-gold/40 bg-cream/5 p-5">
      <h4 className="text-cream font-medium mb-3">
        {title} {optional && <span className="text-cream/40 text-xs font-normal">(opcional)</span>}
      </h4>
      {value ? (
        <div className="relative">
          <img src={value} alt="" className="w-full h-48 object-cover rounded-lg shadow" />
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
