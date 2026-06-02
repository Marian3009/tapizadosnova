// Tracking helper: UTM params + GA4-compatible event dispatch
// Falls back to console.log when no gtag is present (e.g. preview iframe).

const SITE_SOURCE = "tapizadosnova.es";

function getGtag(): any {
  return (window as any).gtag;
}

function logEvent(name: string, params: Record<string, any>) {
  const gtag = getGtag();
  if (typeof gtag === "function") {
    try {
      gtag("event", name, params);
    } catch {
      // ignore
    }
  }
  // Always log to console so we can verify clicks in the preview
  // eslint-disable-next-line no-console
  console.log(`[Tracking] ${name}`, params);
}

/**
 * Append UTM parameters to an external URL so conversions can be measured
 * in the destination analytics (Instagram/WhatsApp don't read them, but
 * any intermediate landing page or future redirect hub will).
 */
export function addUtms(
  url: string,
  medium: string,
  campaign: string
): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", SITE_SOURCE);
    u.searchParams.set("utm_medium", medium);
    u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Call this on click for any external CTA.
 * It fires a tracking event and returns the UTM-enriched URL.
 */
export function trackOutboundClick(
  baseUrl: string,
  medium: string,
  campaign: string,
  eventName: string
): string {
  logEvent(eventName, {
    url: baseUrl,
    medium,
    campaign,
  });
  return addUtms(baseUrl, medium, campaign);
}

/** Specific wrappers for the two CTAs we care about */
export function trackWhatsappClick(baseUrl: string, location: "floating" | "footer"): string {
  return trackOutboundClick(baseUrl, "website", `${location}_whatsapp`, "click_whatsapp");
}

export function trackInstagramClick(baseUrl: string, location: "footer_button" | "footer_link"): string {
  return trackOutboundClick(baseUrl, "website", location, "click_instagram");
}
