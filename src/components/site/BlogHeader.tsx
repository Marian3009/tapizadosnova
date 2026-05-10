import { Link } from "react-router-dom";
import logo from "@/assets/logo-tapizados-nova.png";
import { Button } from "@/components/ui/button";

export default function BlogHeader() {
  return (
    <header className="bg-[hsl(var(--cream-warm,40_45%_92%))] border-b border-gold/30" style={{ background: "linear-gradient(180deg, #f3ead9 0%, #ece1c8 100%)" }}>
      <div className="container-narrow py-8 md:py-12 flex flex-col md:flex-row items-center md:justify-between gap-6">
        <Link to="/" className="flex items-center gap-3" aria-label="Tapizados Nova - Inicio">
          <span className="inline-flex items-center justify-center rounded-full bg-cream ring-2 ring-gold/40 shadow-lg p-3 md:p-4">
            <img
              src={logo}
              alt="Tapizados Nova - Tapicería y decoración textil"
              className="h-24 md:h-36 lg:h-40 w-24 md:w-36 lg:w-40 object-contain rounded-full"
              loading="eager"
            />
          </span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-6 text-sm uppercase tracking-widest">
          <Link to="/" className="text-navy hover:text-gold transition-colors">Inicio</Link>
          <Link to="/blog" className="text-navy hover:text-gold transition-colors">Blog</Link>
          <Link to="/#servicios" className="hidden md:inline text-navy hover:text-gold transition-colors">Servicios</Link>
          <Link to="/#galeria" className="hidden md:inline text-navy hover:text-gold transition-colors">Galería</Link>
          <Button asChild variant="gold" size="sm">
            <Link to="/#presupuesto">Pedir presupuesto</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
