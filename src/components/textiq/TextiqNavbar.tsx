import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEXTIQ } from "@/lib/textiq/brand";

const links = [
  { href: TEXTIQ.routes.landing, label: "Inicio" },
  { href: `${TEXTIQ.routes.landing}#categorias`, label: "Qué genera" },
  { href: TEXTIQ.routes.pricing, label: "Precios" },
];

export default function TextiqNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-tq-dark shadow-lg py-4">
      <div className="container-narrow flex items-center justify-between">
        <a href={TEXTIQ.routes.landing} className="font-display text-2xl md:text-3xl text-tq-terracotta tracking-wide">
          {TEXTIQ.short} <span className="italic font-normal text-tq-sand">AI</span>
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm uppercase tracking-widest text-tq-sand/90 hover:text-tq-terracotta transition-colors duration-300 whitespace-nowrap">
              {l.label}
            </a>
          ))}
          <Button asChild variant="terracotta" size="sm">
            <a href={TEXTIQ.routes.app}>Probar la app</a>
          </Button>
        </nav>

        <button
          className="lg:hidden text-tq-sand inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 rounded-md hover:bg-tq-sand/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-tq-black border-t border-tq-terracotta/20 animate-fade-in">
          <div className="container-narrow flex flex-col py-6 gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-tq-sand/90 hover:text-tq-terracotta py-3 min-h-[44px] flex items-center uppercase tracking-widest text-sm">
                {l.label}
              </a>
            ))}
            <Button asChild variant="terracotta" className="mt-2">
              <a href={TEXTIQ.routes.app} onClick={() => setOpen(false)}>Probar la app</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
