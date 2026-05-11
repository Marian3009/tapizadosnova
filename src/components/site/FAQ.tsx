import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export type FaqItem = { id: string; q: string; a: string };

export const DEFAULT_FAQS: FaqItem[] = [
  { id: "1", q: "¿Hacéis presupuesto sin compromiso?", a: "Sí, el presupuesto es completamente gratuito y sin compromiso. Podéis solicitarlo online a través de nuestra calculadora o contactarnos directamente por teléfono o WhatsApp." },
  { id: "2", q: "¿Recogéis y entregáis el mueble a domicilio?", a: "Sí, ofrecemos servicio de recogida y entrega a domicilio en Rubí y alrededores. Consultadnos disponibilidad para otras localidades." },
  { id: "3", q: "¿Cuánto tarda el tapizado de un sofá?", a: "El plazo habitual es de 7 a 15 días laborables dependiendo del tipo de trabajo. Os informaremos del plazo exacto al confirmar el encargo." },
  { id: "4", q: "¿Puedo traer mi propia tela?", a: "Sí, aceptamos tela del cliente. En ese caso el presupuesto incluirá solo la mano de obra. Consultadnos el metraje necesario antes de comprarla." },
  { id: "5", q: "¿Qué garantía tienen los trabajos?", a: "Todos nuestros trabajos tienen una garantía de 2 años en mano de obra. Trabajamos con materiales de primera calidad para asegurar la durabilidad." },
  { id: "6", q: "¿Hacéis fundas ajustables además de tapizado?", a: "Sí, ofrecemos fundas ajustables como alternativa más económica al tapizado completo. Son perfectas para renovar el aspecto del mueble sin necesidad de taller." },
  { id: "7", q: "¿Cuánto se paga de anticipo?", a: "Para confirmar el encargo solicitamos un anticipo del 50% del presupuesto mediante transferencia bancaria. El resto se abona a la entrega del mueble." },
  { id: "8", q: "¿Trabajáis con empresas y comunidades de vecinos?", a: "Sí, realizamos trabajos para hoteles, restaurantes, oficinas y comunidades. Consultadnos para presupuestos de grandes volúmenes." },
];

export default function FAQ() {
  const [items, setItems] = useState<FaqItem[]>(DEFAULT_FAQS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tn_faqs");
      if (raw) setItems(JSON.parse(raw));
    } catch { /* */ }
  }, []);

  return (
    <section id="faq" className="section-padding pb-10 md:pb-14 bg-cream">
      <div className="container-narrow max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Preguntas frecuentes" subtitle="Resolvemos las dudas más habituales sobre nuestros servicios." />
        <Accordion type="single" collapsible className="mt-12">
          {items.map((it) => (
            <AccordionItem key={it.id} value={it.id} className="border-b border-gold/30">
              <AccordionTrigger className="text-left font-display text-lg text-navy hover:text-gold hover:no-underline py-5">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-[15px] pb-5">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
