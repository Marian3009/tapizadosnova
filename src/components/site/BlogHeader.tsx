import { Link } from "react-router-dom";
import logo from "@/assets/logo-tapizados-nova.png";
import { Button } from "@/components/ui/button";

export default function BlogHeader() {
  return (
    <header className="border-b border-gold/30" style={{ background: "linear-gradient(180deg, #f3ead9 0%, #ece1c8 100%)" }}>
      <div className="container-narrow py-8 md:py-10 flex flex-col items-center gap-6">
        <Link to="/" className="flex items-center justify-center mx-auto" aria-label="Tapizados Nova - Inicio">
          <span
            className="inline-flex items-center justify-center overflow-hidden shadow-xl"
            style={{
              width: "min(92vw, 360px)",
              height: "min(60vw, 220px)",
              borderRadius: "9999px",
              backgroundColor: "#f3ead9",
              boxShadow:
                "0 0 0 4px #c8a96a, 0 0 0 8px #1f3a2e, 0 0 0 12px #c8a96a, 0 16px 40px -12px rgba(0,0,0,0.4)",
            }}
          >
            <img
              src={logo}
              alt="Tapizados Nova - Tapicería y decoración textil"
              className="w-full h-full object-contain"
              style={{ backgroundColor: "#f3ead9", padding: "10px 18px" }}
              loading="eager"
            />
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-sm uppercase tracking-widest">
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
