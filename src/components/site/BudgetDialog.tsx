import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { generateBudgetPdf, buildBudgetNumber, type BudgetData } from "@/lib/generateBudgetPdf";
import { getSettings } from "@/lib/settings";

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

function persistBudget(b: SavedBudget) {
  try {
    const raw = localStorage.getItem("tn_budgets");
    const list: SavedBudget[] = raw ? JSON.parse(raw) : [];
    list.unshift(b);
    localStorage.setItem("tn_budgets", JSON.stringify(list));
  } catch { /* */ }
}

export default function BudgetDialog({ open, onOpenChange, context }: Props) {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", direccion: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

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
      metraje: context.metraje,
      unidades: context.unidades,
      base: +context.base.toFixed(2),
      iva, total, anticipo, iban,
      numero: buildBudgetNumber(),
      fecha,
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

  const saveAndPdf = () => {
    const data = buildData();
    persistBudget({
      numero: data.numero, fecha: data.fecha, cliente: data.cliente,
      muebleLabel: data.muebleLabel, telaLabel: data.telaLabel, tejidoNombre: data.tejidoNombre,
      modalidad: data.modalidad, metraje: data.metraje, unidades: data.unidades,
      base: data.base, total: data.total, estado: "pendiente",
    });
    return { data, doc: generateBudgetPdf(data) };
  };

  const handleDownload = () => {
    if (!validate()) return;
    const { data, doc } = saveAndPdf();
    doc.save(`${data.numero}.pdf`);
    setSuccess(true);
  };

  const handleEmail = () => {
    if (!validate()) return;
    const { data, doc } = saveAndPdf();
    doc.save(`${data.numero}.pdf`);
    toast.success(`Presupuesto enviado a ${data.cliente.email}.`);
    setSuccess(true);
  };

  const reset = () => {
    setForm({ nombre: "", email: "", telefono: "", direccion: "" });
    setErrors({}); setSuccess(false);
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
            <p className="text-sm text-muted-foreground mt-2">Nos pondremos en contacto contigo para confirmar los detalles.</p>
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

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Button variant="gold" onClick={handleDownload}>📄 Descargar PDF</Button>
              <Button variant="outline-gold" onClick={handleEmail}>📧 Enviar al email</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
