import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NOVATEMPO } from "@/lib/novatempo/brand";

const links = [
  { href: NOVATEMPO.routes.landing, label: "Inicio" },
  { href: `${NOVATEMPO.routes.landing}#categorias`, label: "Qué genera" },
  { href: NOVATEMPO.routes.pricing, label: "Precios" },
];

export default function NovaTempoNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-navy shadow-lg py-4">
      <div className="container-narrow flex items-center justify-between">
        <a href={NOVATEMPO.routes.landing} className="font-display text-2xl md:text-3xl text-gold tracking-wide">
          {NOVATEMPO.short} <span className="italic font-normal text-cream">AI</span>
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm uppercase tracking-widest text-cream/90 hover:text-gold transition-colors duration-300 whitespace-nowrap">
              {l.label}
            </a>
          ))}
          <Button asChild variant="gold" size="sm">
            <a href={NOVATEMPO.routes.app}>Probar la app</a>
          </Button>
        </nav>

        <button
          className="lg:hidden text-cream inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 rounded-md hover:bg-cream/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-navy-deep border-t border-gold/20 animate-fade-in">
          <div className="container-narrow flex flex-col py-6 gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-cream/90 hover:text-gold py-3 min-h-[44px] flex items-center uppercase tracking-widest text-sm">
                {l.label}
              </a>
            ))}
            <Button asChild variant="gold" className="mt-2">
              <a href={NOVATEMPO.routes.app} onClick={() => setOpen(false)}>Probar la app</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
