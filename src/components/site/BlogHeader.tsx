import { Link } from "react-router-dom";
import logo from "@/assets/logo-tapizados-nova.png";
import { Button } from "@/components/ui/button";

interface BlogHeaderProps {
  compact?: boolean;
}

export default function BlogHeader({ compact = false }: BlogHeaderProps) {
  const ovalW = compact ? "min(70vw, 220px)" : "min(92vw, 360px)";
  const ovalH = compact ? "min(38vw, 130px)" : "min(60vw, 220px)";
  const py = compact ? "py-4 md:py-5" : "py-8 md:py-10";
  const gap = compact ? "gap-3" : "gap-6";
  const background = compact
    ? "linear-gradient(180deg, #1f3a2e 0%, #16291f 100%)"
    : "linear-gradient(180deg, #fbf5ed 0%, #ece1c8 100%)";
  const navTextColor = compact ? "text-cream hover:text-gold" : "text-navy hover:text-gold";

  return (
    <header className="border-b border-gold/30" style={{ background }}>
      <div className={`container-narrow ${py} flex flex-col items-center ${gap}`}>
        <Link to="/" className="flex items-center justify-center mx-auto" aria-label="Tapizados Nova - Inicio">
          <span
            className="inline-flex items-center justify-center overflow-hidden shadow-xl"
            style={{
              width: ovalW,
              height: ovalH,
              borderRadius: "9999px",
              backgroundColor: "#fbf5ed",
              boxShadow:
                "0 0 0 3px #c8a96a, 0 0 0 6px #1f3a2e, 0 0 0 9px #c8a96a, 0 12px 30px -10px rgba(0,0,0,0.4)",
            }}
          >
            <img
              src={logo}
              alt="Tapizados Nova - Tapicería y decoración textil"
              className="w-full h-full object-contain"
              style={{ backgroundColor: "#fbf5ed", padding: compact ? "6px 14px" : "10px 18px" }}
              loading="eager"
            />
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-sm uppercase tracking-widest">
          <Link to="/" className={`${navTextColor} transition-colors`}>Inicio</Link>
          <Link to="/blog" className={`${navTextColor} transition-colors`}>Blog</Link>
          <Link to="/#servicios" className={`hidden md:inline ${navTextColor} transition-colors`}>Servicios</Link>
          <Link to="/#galeria" className={`hidden md:inline ${navTextColor} transition-colors`}>Galería</Link>
          <Button asChild variant="gold" size="sm">
            <Link to="/#presupuesto">Pedir presupuesto</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
