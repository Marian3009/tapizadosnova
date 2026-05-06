// Lightweight SEO helper: sets title, meta tags, Open Graph, canonical and JSON-LD
// without adding extra dependencies.

type SeoOptions = {
  title: string;
  description: string;
  path: string; // e.g. "/privacidad"
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogType?: string;
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const JSONLD_ID = "seo-jsonld";

export function applySeo({ title, description, path, jsonLd, ogType = "website" }: SeoOptions) {
  const url = `${window.location.origin}${path}`;

  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta("name", "robots", "index,follow");

  // Open Graph
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:type", ogType);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:site_name", "Tapizados Nova");
  upsertMeta("property", "og:locale", "es_ES");

  // Twitter
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);

  // Canonical
  upsertLink("canonical", url);

  // JSON-LD
  const existing = document.getElementById(JSONLD_ID);
  if (existing) existing.remove();
  if (jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = JSONLD_ID;
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}
