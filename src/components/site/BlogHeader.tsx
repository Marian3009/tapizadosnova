import { Link } from "react-router-dom";
import logo from "@/assets/logo-tapizados-nova.png";
import { Button } from "@/components/ui/button";

export default function BlogHeader() {
  return (
    <header className="bg-cream border-b border-gold/30">
      <div className="container-narrow py-8 md:py-12 flex flex-col md:flex-row items-center md:justify-between gap-6">
        <Link to="/" className="flex items-center gap-3" aria-label="Tapizados Nova - Inicio">
          <img
            src={logo}
            alt="Tapizados Nova - Tapicería y decoración textil"
            className="h-28 md:h-40 lg:h-48 w-auto object-contain drop-shadow-md"
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
