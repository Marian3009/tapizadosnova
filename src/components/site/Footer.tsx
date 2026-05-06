import { Instagram, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
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
        <div className="grid md:grid-cols-3 gap-10 pb-12 border-b border-gold/15">
          <div>
            <div className="font-display text-3xl text-gold mb-4">
              Tapizados <span className="italic font-normal">Nova</span>
            </div>
            <p className="text-cream/70 leading-relaxed">
              Decoración Textil. Tapicería artesanal de calidad premium en Rubí, Barcelona desde 2003.
            </p>
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
            <ul className="space-y-3 text-sm text-cream/80">
              <li className="flex items-start gap-2"><Phone size={16} className="text-gold mt-0.5 shrink-0" /><a href={`tel:${s.phone.replace(/\s/g,"")}`} className="hover:text-gold">{s.phone}</a></li>
              <li className="flex items-start gap-2"><Mail size={16} className="text-gold mt-0.5 shrink-0" /><a href={`mailto:${s.email}`} className="hover:text-gold break-all">{s.email}</a></li>
              <li className="flex items-start gap-2"><MapPin size={16} className="text-gold mt-0.5 shrink-0" /><span>Calle Bilbao N1, 1ª planta<br/>08191 Rubí (Barcelona)</span></li>
              <li className="flex items-start gap-2"><Clock size={16} className="text-gold mt-0.5 shrink-0" /><span>Lun-Vie: 9:00 - 18:00<br/>Sáb: 10:00 - 14:00</span></li>
              <li className="flex items-start gap-2"><MessageCircle size={16} className="text-gold mt-0.5 shrink-0" /><a href={s.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-gold">WhatsApp: {s.phone}</a></li>
              <li className="flex items-start gap-2"><Instagram size={16} className="text-gold mt-0.5 shrink-0" /><a href={s.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold">@tapizeando</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-cream/50">
          <div>© 2024 Tapizados Nova · <a href="/privacidad" className="hover:text-gold">Política de Privacidad</a> · <a href="/aviso-legal" className="hover:text-gold">Aviso Legal</a></div>
          <div>Tapicería artesanal en Rubí, Barcelona desde 2003</div>
        </div>
      </div>
    </footer>
  );
}
