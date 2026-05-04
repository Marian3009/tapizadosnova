import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#galeria", label: "Galería" },
  { href: "#presupuesto", label: "Presupuesto" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-navy/95 backdrop-blur-md shadow-lg py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container-narrow flex items-center justify-between">
        <a href="#inicio" className="font-display text-2xl md:text-3xl text-gold tracking-wide">
          Tapizados <span className="italic font-normal">Nova</span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm uppercase tracking-widest text-cream/90 hover:text-gold transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
          <Button asChild variant="gold" size="sm">
            <a href="#contacto">Pedir presupuesto</a>
          </Button>
        </nav>

        <button
          className="lg:hidden text-cream"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-navy-deep border-t border-gold/20 animate-fade-in">
          <div className="container-narrow flex flex-col py-6 gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-cream/90 hover:text-gold py-2 uppercase tracking-widest text-sm"
              >
                {l.label}
              </a>
            ))}
            <Button asChild variant="gold" className="mt-2">
              <a href="#contacto" onClick={() => setOpen(false)}>Pedir presupuesto</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
