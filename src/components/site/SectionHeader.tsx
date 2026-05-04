interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
}
export default function SectionHeader({ eyebrow, title, subtitle, light, center = true }: Props) {
  return (
    <div className={`reveal ${center ? "text-center max-w-3xl mx-auto" : ""}`}>
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-4 ${center ? "justify-center" : ""}`}>
          <span className="h-px w-8 bg-gold" />
          <span className="text-gold uppercase tracking-[0.3em] text-xs font-semibold">{eyebrow}</span>
          <span className="h-px w-8 bg-gold" />
        </div>
      )}
      <h2 className={`font-display text-4xl md:text-5xl lg:text-6xl leading-tight ${light ? "text-cream" : "text-navy"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-5 text-lg ${light ? "text-cream/70" : "text-muted-foreground"}`}>{subtitle}</p>
      )}
    </div>
  );
}
