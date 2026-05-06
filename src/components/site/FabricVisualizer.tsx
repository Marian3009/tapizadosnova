import { useEffect, useRef, useState } from "react";
import { Camera, X, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  presetFabric?: { nombre: string; imagen: string } | null;
}

function UploadZone({
  title,
  hint,
  icon: Icon,
  image,
  onFile,
  onClear,
  inputId,
}: {
  title: string;
  hint: string;
  icon: typeof Camera;
  image: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
  inputId: string;
}) {
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <h4 className="font-display text-xl text-cream mb-3">{title}</h4>
      {!image ? (
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
      ) : (
        <div className="relative rounded-xl overflow-hidden shadow-md border border-gold/30">
          <img src={image} alt="Preview" className="w-full max-h-64 object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-navy/80 hover:bg-navy text-cream flex items-center justify-center transition-colors"
            aria-label="Eliminar"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function FabricVisualizer({ presetFabric }: Props) {
  const [furniture, setFurniture] = useState<string | null>(null);
  const [fabric, setFabric] = useState<string | null>(null);
  const [presetUsed, setPresetUsed] = useState(false);
  const composedRef = useRef<HTMLDivElement>(null);

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
    if (!/^image\/(jpe?g|png)$/.test(f.type)) {
      toast.error("Formato no admitido. Usa JPG o PNG.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(f);
  };

  const downloadComposite = async () => {
    if (!furniture || !fabric) return;
    try {
      const [img1, img2] = await Promise.all([
        loadImg(furniture),
        loadImg(fabric),
      ]);
      const canvas = document.createElement("canvas");
      canvas.width = img1.naturalWidth;
      canvas.height = img1.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img1, 0, 0);
      ctx.globalAlpha = 0.75;
      ctx.globalCompositeOperation = "multiply";
      // Tile fabric to cover
      const pattern = ctx.createPattern(img2, "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const link = document.createElement("a");
      link.download = "tapizados-nova-visualizacion.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      toast.error("No se pudo generar la imagen");
    }
  };

  const both = furniture && fabric;
  const onlyOne = (furniture && !fabric) || (!furniture && fabric);

  return (
    <div className="mt-8 space-y-6 reveal">
      <div className="grid md:grid-cols-2 gap-5">
        <UploadZone
          title="📷 Sube la foto de tu mueble"
          hint="Formatos aceptados: JPG, PNG. Máximo 10MB"
          icon={Camera}
          image={furniture}
          onFile={handleFile(setFurniture)}
          onClear={() => setFurniture(null)}
          inputId="upload-furniture"
        />
        <div>
          <UploadZone
            title="🎨 Sube una foto del tejido elegido"
            hint="Puedes subir una muestra o una imagen del tejido que te guste"
            icon={Palette}
            image={fabric}
            onFile={handleFile(setFabric)}
            onClear={() => { setFabric(null); setPresetUsed(false); }}
            inputId="upload-fabric"
          />
          {presetUsed && fabric && (
            <p className="text-gold/80 text-xs mt-2">✓ Tejido del catálogo aplicado automáticamente</p>
          )}
        </div>
      </div>

      {onlyOne && (
        <div className="rounded-xl bg-navy-deep/60 border border-gold/20 p-5 text-center text-cream/70 text-sm">
          Sube también la foto del {!fabric ? "tejido" : "mueble"} para ver la visualización completa
        </div>
      )}

      {both && (
        <div className="rounded-2xl bg-navy-deep/80 border-2 border-gold p-5 md:p-7 animate-fade-in">
          <h4 className="font-display text-xl text-gold mb-4">✨ Así quedará tu mueble</h4>
          <div ref={composedRef} className="relative rounded-xl overflow-hidden shadow-lg max-h-[480px]">
            <img src={furniture!} alt="Tu mueble" className="w-full block" />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${fabric})`,
                backgroundRepeat: "repeat",
                backgroundSize: "200px",
                mixBlendMode: "multiply",
                opacity: 0.75,
              }}
            />
          </div>
          <p className="text-cream/60 text-xs mt-3">
            🔍 Visualización orientativa. El resultado final puede variar según el tejido y el trabajo de tapizado.
          </p>
          <Button variant="gold" className="mt-4" onClick={downloadComposite}>
            <Download size={18} className="mr-2" /> Descargar visualización
          </Button>
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
