import { Link } from "react-router-dom";
import logo from "@/assets/logo-tapizados-nova.png";
import { Button } from "@/components/ui/button";

export default function BlogHeader() {
  return (
    <header className="bg-cream border-b border-gold/30">
      <div className="container-narrow py-6 md:py-8 flex flex-col md:flex-row items-center md:justify-between gap-4">
        <Link to="/" className="flex items-center gap-3" aria-label="Tapizados Nova - Inicio">
          <img
            src={logo}
            alt="Tapizados Nova - Tapicería y decoración textil"
            className="h-16 md:h-24 w-auto object-contain"
            loading="eager"
          />
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
