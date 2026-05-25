import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SectionHeader from "./SectionHeader";

const schema = z.object({
  nombre: z.string().trim().min(2, "Nombre demasiado corto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  telefono: z.string().trim().max(30).optional().or(z.literal("")),
  tipo: z.string().min(1, "Selecciona un tipo"),
  descripcion: z.string().trim().min(10, "Cuéntanos un poco más (mín. 10 caracteres)").max(1000),
  origen: z.string().optional(),
});

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact", {
        body: parsed.data,
      });
      if (error) throw error;
      toast.success("¡Mensaje enviado! Te contactaremos en menos de 24h.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error("No se pudo enviar el mensaje. Inténtalo de nuevo o llámanos directamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contacto" className="section-padding bg-cream">
      <div className="container-narrow max-w-3xl">
        <SectionHeader eyebrow="Contacto" title="Pide tu presupuesto sin compromiso" subtitle="Cuéntanos tu proyecto y te responderemos en menos de 24 horas." />

        <form onSubmit={onSubmit} className="reveal mt-16 bg-white p-8 md:p-10 rounded-2xl shadow-[var(--shadow-card)] space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input id="nombre" name="nombre" required maxLength={100} className="mt-2 h-11" />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required maxLength={255} className="mt-2 h-11" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" type="tel" maxLength={30} className="mt-2 h-11" />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de trabajo *</Label>
              <select id="tipo" name="tipo" required defaultValue="" className="mt-2 w-full h-11 rounded-md border border-input bg-white px-3 text-sm">
                <option value="" disabled>Selecciona...</option>
                <option>Sofá</option>
                <option>Silla / Butaca</option>
                <option>Cabecero</option>
                <option>Restauración</option>
                <option>Otro</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción del trabajo *</Label>
            <Textarea id="descripcion" name="descripcion" required maxLength={1000} rows={5} className="mt-2" placeholder="Describe el mueble, medidas aproximadas, estado actual..." />
          </div>
          <div>
            <Label htmlFor="origen">¿Cómo nos conociste?</Label>
            <select id="origen" name="origen" defaultValue="" className="mt-2 w-full h-11 rounded-md border border-input bg-white px-3 text-sm">
              <option value="">Selecciona...</option>
              <option>Google</option>
              <option>Recomendación</option>
              <option>Redes sociales</option>
              <option>Cliente anterior</option>
              <option>Otro</option>
            </select>
          </div>
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </form>
      </div>
    </section>
  );
}
