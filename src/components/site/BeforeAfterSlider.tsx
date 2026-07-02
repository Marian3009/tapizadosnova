import { useCallback, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

interface Props {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel = "Antes",
  afterLabel = "Después",
}: Props) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none touch-none cursor-ew-resize"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <img src={after} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
      <img
        src={before}
        alt={beforeLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
      />

      <span className="absolute top-3 left-3 bg-navy/80 text-cream text-[11px] uppercase tracking-widest px-3 py-1 rounded-full pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 bg-gold text-navy text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold pointer-events-none">
        {afterLabel}
      </span>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gold pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gold text-navy flex items-center justify-center shadow-lg border-2 border-cream">
          <MoveHorizontal size={18} />
        </div>
      </div>
    </div>
  );
}
