import { TEXTIQ } from "@/lib/textiq/brand";

export default function TextiqFooter() {
  return (
    <footer className="bg-navy-deep text-cream/60 py-10 text-center text-sm">
      <div className="container-narrow">
        <p className="font-display text-lg text-cream mb-1">
          {TEXTIQ.short} <span className="italic text-gold">AI</span>
        </p>
        <p>{TEXTIQ.poweredBy}</p>
        <p className="mt-3">
          <a href={`mailto:${TEXTIQ.contactEmail}`} className="hover:text-gold">{TEXTIQ.contactEmail}</a>
          {" · "}
          <a href={TEXTIQ.contactWhatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-gold">WhatsApp</a>
          {" · "}
          <a href="/" className="hover:text-gold">tapizadosnova.es</a>
        </p>
      </div>
    </footer>
  );
}
