// Shared organization / LocalBusiness data for JSON-LD reuse across pages.

export const SITE_URL = "https://tapizadosnova.es";
export const ORG_ID = `${SITE_URL}/#organization`;

export const organizationJsonLd = {
  "@type": ["Organization", "LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": ORG_ID,
  name: "Tapizados Nova",
  alternateName: "Nova Tapicería",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/logo.png`,
  email: "tapizadosnova@gmail.com",
  telephone: "+34611491661",
  priceRange: "€€",
  description:
    "Tapicería artesanal en Rubí (Barcelona). Tapizado de sofás, sillas, cabeceros y mobiliario a medida con tejidos de alta calidad.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle Bilbao N1, 1ª planta",
    postalCode: "08191",
    addressLocality: "Rubí",
    addressRegion: "Barcelona",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.4926,
    longitude: 2.0327,
  },
  areaServed: [
    { "@type": "City", name: "Rubí" },
    { "@type": "City", name: "Barcelona" },
    { "@type": "AdministrativeArea", name: "Cataluña" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+34611491661",
      email: "tapizadosnova@gmail.com",
      areaServed: "ES",
      availableLanguage: ["es", "ca"],
    },
  ],
  sameAs: [
    "https://www.instagram.com/tapizados.nova",
    "https://www.facebook.com/tapizadosnova",
    "https://wa.me/34611491661",
  ],
};

export function buildBreadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function buildPageGraph(
  pageNode: Record<string, unknown>,
  breadcrumb?: { name: string; path: string }[],
) {
  const graph: Record<string, unknown>[] = [organizationJsonLd];
  if (breadcrumb && breadcrumb.length) graph.push(buildBreadcrumb(breadcrumb));
  graph.push({ ...pageNode, publisher: { "@id": ORG_ID }, isPartOf: { "@id": ORG_ID } });
  return { "@context": "https://schema.org", "@graph": graph };
}
