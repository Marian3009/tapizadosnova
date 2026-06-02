import { Instagram, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getSettings } from "@/lib/settings";
import { addUtms, logEvent } from "@/lib/tracking";

export default function Footer() {
  const [s, setS] = useState(getSettings());
  useEffect(() => {
    const update = () => setS(getSettings());
    window.addEventListener("tn_settings_changed", update);
    return () => window.removeEventListener("tn_settings_changed", update);
  }, []);

  const whatsappUrl = useMemo(() => addUtms(s.whatsapp, "website", "footer_whatsapp"), [s.whatsapp]);
  const instagramUrl = useMemo(() => addUtms(s.instagram, "website", "footer_instagram"), [s.instagram]);
  const instagramBtnUrl = useMemo(() => addUtms(s.instagram, "website", "footer_button_instagram"), [s.instagram]);

  return (
    <footer className="bg-navy-deep text-cream/80 pt-16 pb-8 px-6">
      <div className="container-narrow">
        <div className="grid md:grid-cols-3 gap-10 pb-12 border-b border-gold/15">
          <div>
            <div className="font-display text-3xl text-gold mb-4">
              Tapizados <span className="italic font-normal">Nova</span>
            </div>
            <p className="text-cream/70 leading-relaxed">
              Decoración Textil. Tapicería artesanal de calidad premium con más de 30 años de experiencia.
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
              <li className="flex items-start gap-2"><MessageCircle size={16} className="text-gold mt-0.5 shrink-0" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold"
                  onClick={() => logEvent("click_whatsapp", { url: s.whatsapp, location: "footer" })}
                >
                  WhatsApp: {s.phone}
                </a>
              </li>
              <li className="flex items-start gap-2"><Instagram size={16} className="text-gold mt-0.5 shrink-0" />
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold"
                  onClick={() => logEvent("click_instagram", { url: s.instagram, location: "footer_link" })}
                >
                  @tapizados.nova
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex justify-center">
          <a
            href={instagramBtnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white text-sm font-medium shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy-deep"
            aria-label="Ver perfil de Tapizados Nova en Instagram (se abre en nueva pestaña)"
            onClick={() => logEvent("click_instagram", { url: s.instagram, location: "footer_button" })}
          >
            <Instagram size={18} />
            Ver en Instagram
          </a>
        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-cream/50">
          <div>© 2024 Tapizados Nova · <a href="/privacidad" className="hover:text-gold">Política de Privacidad</a> · <a href="/aviso-legal" className="hover:text-gold">Aviso Legal</a></div>
          <div>Tapicería artesanal · Más de 30 años de experiencia</div>
        </div>
      </div>
    </footer>
  );
}
