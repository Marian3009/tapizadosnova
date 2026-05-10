export const BLOG_CATEGORIES = [
  "Tapicería",
  "Decoración textil",
  "Interiorismo",
  "Tendencias",
  "Consejos de mantenimiento",
  "Inspiración para el hogar",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
