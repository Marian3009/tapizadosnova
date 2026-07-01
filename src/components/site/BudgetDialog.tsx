import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { generateBudgetPdf, buildBudgetNumber, type BudgetData, type CatalogoInfo } from "@/lib/generateBudgetPdf";
import { getSettings } from "@/lib/settings";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  nombre: z.string().trim().min(2, "Indica tu nombre").max(100),
  email: z.string().trim().email("Email no válido").max(255),
  telefono: z.string().trim().max(30).optional().or(z.literal("")),
  direccion: z.string().trim().max(200).optional().or(z.literal("")),
});

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  context: {
    muebleKey: string;
    muebleLabel: string;
    modalidad: "tapizado" | "funda";
    telaLabel: string;
    tejidoNombre?: string;
    catalogo?: CatalogoInfo;
    metraje: number;
    unidades: number;
    base: number;
    composite?: string | null;
  };
};

export type SavedBudget = {
  numero: string;
  fecha: string;
  cliente: { nombre: string; email: string; telefono?: string; direccion?: string };
  muebleLabel: string;
  telaLabel: string;
  tejidoNombre?: string;
  modalidad: "tapizado" | "funda";
  metraje: number;
  unidades: number;
  base: number;
  total: number;
  estado: "pendiente" | "contactado" | "confirmado";
};

function persistBudgetLocal(b: SavedBudget) {
  try {
    const raw = localStorage.getItem("tn_budgets");
    const list: SavedBudget[] = raw ? JSON.parse(raw) : [];
    list.unshift(b);
    localStorage.setItem("tn_budgets", JSON.stringify(list));
  } catch { /* */ }
}

async function persistBudgetSupabase(data: BudgetData, hasComposite: boolean) {
  try {
    await (supabase as any).from("budget_requests").insert({
      numero: data.numero,
      fecha: data.fecha,
      nombre: data.cliente.nombre,
      email: data.cliente.email,
      telefono: data.cliente.telefono ?? null,
      direccion: data.cliente.direccion ?? null,
      mueble_label: data.muebleLabel,
      tela_label: data.telaLabel,
      tejido_nombre: data.tejidoNombre ?? null,
      modalidad: data.modalidad,
      metraje: data.metraje,
      unidades: data.unidades,
      base: data.base,
      iva: data.iva,
      total: data.total,
      anticipo: data.anticipo,
      estado: "pendiente",
      has_composite: hasComposite,
    });
  } catch (err) {
    console.warn("Budget Supabase save failed (non-critical):", err);
  }
}


async function sendBudgetEmails(data: BudgetData) {
  const templateData = {
    numero: data.numero,
    fecha: data.fecha,
    nombre: data.cliente.nombre,
    email: data.cliente.email,
    telefono: data.cliente.telefono,
    direccion: data.cliente.direccion,
    muebleLabel: data.muebleLabel,
    telaLabel: data.telaLabel,
    tejidoNombre: data.tejidoNombre,
    modalidad: data.modalidad,
    metraje: String(data.metraje),
    unidades: String(data.unidades),
    base: data.base.toFixed(2),
    iva: data.iva.toFixed(2),
    total: data.total.toFixed(2),
    anticipo: data.anticipo.toFixed(2),
    iban: data.iban,
  };

  // Notification to business (fixed recipient in the template)
  const notifPromise = supabase.functions.invoke("send-transactional-email", {
    body: {
      templateName: "budget-notification",
      templateData,
    },
  });

  // Confirmation to client
  const confirmPromise = supabase.functions.invoke("send-transactional-email", {
    body: {
      templateName: "budget-confirmation",
      recipientEmail: data.cliente.email,
      templateData,
    },
  });

  const [notif, confirm] = await Promise.allSettled([notifPromise, confirmPromise]);

  if (notif.status === "rejected" || confirm.status === "rejected") {
    console.warn("One or more budget emails failed:", { notif, confirm });
  }
}

export default function BudgetDialog({ open, onOpenChange, context }: Props) {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", direccion: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [includeImage, setIncludeImage] = useState(true);

  const iva = +(context.base * 0.21).toFixed(2);
  const total = +(context.base + iva).toFixed(2);
  const anticipo = +(total / 2).toFixed(2);

  const buildData = (): BudgetData => {
    const iban = getSettings().iban || "Consultar con el taller";
    const fecha = new Date().toLocaleDateString("es-ES");
    return {
      cliente: {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
      },
      modalidad: context.modalidad,
      muebleLabel: context.muebleLabel,
      telaLabel: context.telaLabel,
      tejidoNombre: context.tejidoNombre,
      catalogo: context.catalogo,
      metraje: context.metraje,
      unidades: context.unidades,
      base: +context.base.toFixed(2),
      iva, total, anticipo, iban,
      numero: buildBudgetNumber(),
      fecha,
      composite: includeImage && context.composite ? context.composite : undefined,
    };
  };

  const validate = () => {
    const r = schema.safeParse(form);
    if (!r.success) {
      const e: Record<string, string> = {};
      r.error.issues.forEach((i) => { e[i.path[0] as string] = i.message; });
      setErrors(e);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleDownload = () => {
    if (!validate()) return;
    const data = buildData();
    persistBudgetLocal({
      numero: data.numero, fecha: data.fecha, cliente: data.cliente,
      muebleLabel: data.muebleLabel, telaLabel: data.telaLabel, tejidoNombre: data.tejidoNombre,
      modalidad: data.modalidad, metraje: data.metraje, unidades: data.unidades,
      base: data.base, total: data.total, estado: "pendiente",
    });
    persistBudgetSupabase(data, !!(includeImage && context.composite));
    const doc = generateBudgetPdf(data);
    doc.save(`${data.numero}.pdf`);
    setSuccess(true);
  };

  const handleEmail = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      const data = buildData();
      persistBudgetLocal({
        numero: data.numero, fecha: data.fecha, cliente: data.cliente,
        muebleLabel: data.muebleLabel, telaLabel: data.telaLabel, tejidoNombre: data.tejidoNombre,
        modalidad: data.modalidad, metraje: data.metraje, unidades: data.unidades,
        base: data.base, total: data.total, estado: "pendiente",
      });
      await persistBudgetSupabase(data, !!(includeImage && context.composite));
      await sendBudgetEmails(data);
      // Also generate and download the PDF
      const doc = generateBudgetPdf(data);
      doc.save(`${data.numero}.pdf`);
      setSuccess(true);
    } catch (err) {
      console.error("handleEmail error:", err);
      toast.error("No se pudo enviar el email. Descarga el PDF e inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setForm({ nombre: "", email: "", telefono: "", direccion: "" });
    setErrors({}); setSuccess(false); setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg bg-cream">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-navy">Solicita tu presupuesto</DialogTitle>
          <DialogDescription>Rellena tus datos y genera el documento PDF al instante.</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="rounded-lg border border-gold/40 bg-white p-5 text-center">
            <p className="text-green-700 font-medium">✅ Presupuesto generado correctamente.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Te hemos enviado una confirmación por email. Nos pondremos en contacto contigo
              en menos de 24 h para confirmar los detalles.
            </p>
            <Button className="mt-4" variant="gold" onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Nombre completo *</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Teléfono</Label>
                <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>
              <div>
                <Label>Dirección</Label>
                <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              </div>
            </div>

            <div className="rounded-lg border border-gold/30 bg-white p-4 text-sm">
              <div className="flex justify-between"><span>Total estimado (IVA inc.)</span><strong className="text-navy">{total.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €</strong></div>
              <div className="flex justify-between text-muted-foreground"><span>Anticipo (50%)</span><span>{anticipo.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €</span></div>
            </div>

            {context.composite && (
              <label className="flex items-center gap-2 text-sm text-navy cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeImage}
                  onChange={(e) => setIncludeImage(e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
                Incluir visualización del mueble con el tejido en el PDF
              </label>
            )}

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Button variant="gold" onClick={handleDownload} disabled={sending}>
                📄 Descargar PDF
              </Button>
              <Button variant="outline-gold" onClick={handleEmail} disabled={sending}>
                {sending ? "⏳ Enviando..." : "📧 Enviar al email"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
