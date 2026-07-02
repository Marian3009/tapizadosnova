import { NOVATEMPO } from "@/lib/novatempo/brand";

export default function NovaTempoFooter() {
  return (
    <footer className="bg-navy-deep text-cream/60 py-10 text-center text-sm">
      <div className="container-narrow">
        <p className="font-display text-lg text-cream mb-1">
          {NOVATEMPO.short} <span className="italic text-gold">AI</span>
        </p>
        <p>{NOVATEMPO.poweredBy}</p>
        <p className="mt-3">
          <a href={`mailto:${NOVATEMPO.contactEmail}`} className="hover:text-gold">{NOVATEMPO.contactEmail}</a>
          {" · "}
          <a href={NOVATEMPO.contactWhatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-gold">WhatsApp</a>
          {" · "}
          <a href="/" className="hover:text-gold">tapizadosnova.es</a>
        </p>
      </div>
    </footer>
  );
}
