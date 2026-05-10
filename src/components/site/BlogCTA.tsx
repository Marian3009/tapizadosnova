import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  variant?: "presupuesto" | "telas" | "renueva";
}

const COPY = {
  presupuesto: {
    title: "Solicita tu presupuesto sin compromiso",
    text: "Te respondemos en menos de 24 h con un precio claro y honesto.",
    label: "Solicitar presupuesto",
    to: "/#presupuesto",
  },
  telas: {
    title: "Consulta nuestro catálogo de telas y acabados",
    text: "Más de 500 referencias: lisos, lino, estampados, antimanchas y más.",
    label: "Ver catálogo de telas",
    to: "/#presupuesto",
  },
  renueva: {
    title: "Renueva tu sofá con Tapizados Nova",
    text: "Tapicería artesanal en Rubí (Barcelona). Más de 20 años de experiencia.",
    label: "Empezar mi proyecto",
    to: "/#contacto",
  },
} as const;

export default function BlogCTA({ variant = "presupuesto" }: Props) {
  const c = COPY[variant];
  return (
    <aside className="my-10 rounded-xl bg-navy text-cream p-6 md:p-8 shadow-[var(--shadow-card)]">
      <h3 className="font-display text-2xl md:text-3xl text-gold mb-2">{c.title}</h3>
      <p className="text-cream/80 mb-5">{c.text}</p>
      <Button asChild variant="gold" size="lg">
        <Link to={c.to}>{c.label}</Link>
      </Button>
    </aside>
  );
}
