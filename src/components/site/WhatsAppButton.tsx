import { useEffect, useState, useMemo } from "react";
import { getSettings } from "@/lib/settings";
import { addUtms, logEvent } from "@/lib/tracking";

function normalizeWhatsapp(url: string) {
  if (!url) return "https://wa.me/34611491661";
  try {
    const u = new URL(url);
    if (u.hostname.includes("api.whatsapp.com")) {
      const phone = u.searchParams.get("phone") || "";
      const text = u.searchParams.get("text");
      const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
      return text ? `${base}?text=${encodeURIComponent(text)}` : base;
    }
    return url;
  } catch {
    return url;
  }
}

export default function WhatsAppButton() {
  const rawHref = normalizeWhatsapp(getSettings().whatsapp);
  const [href, setHref] = useState(rawHref);
  useEffect(() => {
    const update = () => setHref(normalizeWhatsapp(getSettings().whatsapp));
    window.addEventListener("tn_settings_changed", update);
    return () => window.removeEventListener("tn_settings_changed", update);
  }, []);

  const trackedHref = useMemo(() => addUtms(href, "website", "floating_whatsapp"), [href]);

  return (
    <a
      href={trackedHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatea con nosotros por WhatsApp"
      className="group fixed bottom-5 right-5 z-50"
      onClick={() => logEvent("click_whatsapp", { url: href, location: "floating" })}
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform">
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current" aria-hidden="true">
          <path d="M19.11 17.41c-.29-.14-1.7-.84-1.97-.94-.26-.1-.46-.14-.65.14-.19.29-.74.94-.91 1.13-.17.19-.34.22-.62.07-.29-.14-1.21-.45-2.31-1.42-.85-.76-1.43-1.7-1.6-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.14-.65-1.57-.89-2.15-.23-.56-.47-.49-.65-.5l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.39s1.03 2.77 1.17 2.96c.14.19 2.02 3.08 4.89 4.32.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34zM16.02 5.33c-5.89 0-10.67 4.78-10.67 10.66 0 1.88.49 3.71 1.42 5.32L5 27l5.86-1.71a10.6 10.6 0 0 0 5.16 1.32h.01c5.88 0 10.66-4.78 10.66-10.66 0-2.85-1.11-5.53-3.12-7.54a10.6 10.6 0 0 0-7.55-3.08zm0 19.51h-.01c-1.6 0-3.17-.43-4.55-1.25l-.33-.19-3.48 1.01.93-3.39-.21-.35a8.85 8.85 0 0 1-1.36-4.7c0-4.89 3.98-8.86 8.86-8.86 2.36 0 4.59.92 6.26 2.6a8.81 8.81 0 0 1 2.59 6.26c.01 4.88-3.96 8.87-8.7 8.87z"/>
        </svg>
      </span>
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-navy text-cream text-xs px-3 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chatea con nosotros
      </span>
    </a>
  );
}
