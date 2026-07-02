import { TEXTIQ } from "@/lib/textiq/brand";

export default function TextiqFooter() {
  return (
    <footer className="bg-tq-dark text-tq-sand/60 py-10 text-center text-sm">
      <div className="container-narrow">
        <p className="font-display text-lg text-tq-sand mb-1">
          {TEXTIQ.short} <span className="italic text-tq-terracotta">AI</span>
        </p>
        <p>{TEXTIQ.poweredBy}</p>
        <p className="mt-3">
          <a href={`mailto:${TEXTIQ.contactEmail}`} className="hover:text-tq-terracotta">{TEXTIQ.contactEmail}</a>
          {" · "}
          <a href={TEXTIQ.contactWhatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-tq-terracotta">WhatsApp</a>
          {" · "}
          <a href="/" className="hover:text-tq-terracotta">tapizadosnova.es</a>
        </p>
      </div>
    </footer>
  );
}
