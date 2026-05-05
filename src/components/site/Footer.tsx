import { Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/settings";

export default function Footer() {
  const [s, setS] = useState(getSettings());
  useEffect(() => {
    const update = () => setS(getSettings());
    window.addEventListener("tn_settings_changed", update);
    return () => window.removeEventListener("tn_settings_changed", update);
  }, []);

  return (
    <footer className="bg-navy-deep text-cream/80 pt-16 pb-8 px-6">
      <div className="container-narrow">
        <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-gold/15">
          <div className="md:col-span-2">
            <div className="font-display text-3xl text-gold mb-4">
              Tapizados <span className="italic font-normal">Nova</span>
            </div>
            <p className="text-cream/70 max-w-md leading-relaxed">
              Decoración Textil. Tapicería artesanal de calidad premium en Rubí, Barcelona desde 2003.
            </p>
            <a
              href={s.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-gold hover:text-cream transition-colors"
            >
              <Instagram size={20} />
              <span className="text-sm font-medium">@tapizeando</span>
            </a>
          </div>
          <div>
            <h4 className="font-display text-lg text-gold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              {[["Inicio","inicio"],["Servicios","servicios"],["Galería","galeria"],["Presupuesto","presupuesto"],["FAQ","faq"],["Contacto","contacto"]].map(([l,h]) => (
                <li key={l}>
                  <a href={`#${h}`} className="hover:text-gold transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg text-gold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>{s.address}</li>
              <li><a href={`tel:${s.phone.replace(/\s/g,"")}`} className="hover:text-gold">{s.phone}</a></li>
              <li><a href={`mailto:${s.email}`} className="hover:text-gold">{s.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-cream/50">
          <div>© 2024 Tapizados Nova · <a href="#" className="hover:text-gold">Política de Privacidad</a> · <a href="#" className="hover:text-gold">Aviso Legal</a></div>
          <div>Tapicería artesanal en Rubí, Barcelona desde 2003</div>
        </div>
      </div>
    </footer>
  );
}
