// Mantener las claves sincronizadas con CATEGORY_LABELS / SPACE_LABELS /
// STYLE_LABELS en supabase/functions/novatempo-generate/index.ts.
export type Mode = "retapizar" | "proponer";

export interface CategoryDef {
  id: string;
  label: string;
  icon: string;
  modes: Mode[];
}

export const CATEGORIES: CategoryDef[] = [
  { id: "sofa", label: "Sofás y sillones", icon: "🛋️", modes: ["retapizar", "proponer"] },
  { id: "silla", label: "Sillas", icon: "🪑", modes: ["retapizar", "proponer"] },
  { id: "cabecero", label: "Cabeceros", icon: "🛏️", modes: ["retapizar", "proponer"] },
  { id: "cama", label: "Camas y ropa de cama", icon: "🛌", modes: ["retapizar", "proponer"] },
  { id: "cortinas", label: "Cortinas", icon: "🪟", modes: ["retapizar", "proponer"] },
  { id: "pouf", label: "Poufs y banquetas", icon: "🧺", modes: ["retapizar", "proponer"] },
  { id: "exterior", label: "Exterior y chill-out", icon: "🌿", modes: ["retapizar", "proponer"] },
  { id: "decoracion_completa", label: "Propuesta de decoración completa", icon: "✨", modes: ["proponer"] },
];

export interface SpaceDef {
  id: string;
  label: string;
  icon: string;
}

export const SPACES: SpaceDef[] = [
  { id: "salon", label: "Salón", icon: "🛋️" },
  { id: "dormitorio", label: "Dormitorio", icon: "🛏️" },
  { id: "cocina", label: "Cocina", icon: "🍳" },
  { id: "bano", label: "Baño", icon: "🛁" },
  { id: "recibidor", label: "Recibidor", icon: "🚪" },
  { id: "jardin", label: "Jardín", icon: "🌳" },
  { id: "piscina", label: "Zona de piscina", icon: "🏊" },
  { id: "barbacoa", label: "Barbacoa / chill-out exterior", icon: "🔥" },
];

export interface StyleDef {
  id: string;
  label: string;
}

export const STYLES: StyleDef[] = [
  { id: "minimalista", label: "Minimalista" },
  { id: "boho", label: "Bohemio" },
  { id: "escandinavo", label: "Escandinavo" },
  { id: "industrial", label: "Industrial" },
  { id: "clasico_renovado", label: "Clásico renovado" },
  { id: "mediterraneo", label: "Mediterráneo" },
];

export function categoriesForMode(mode: Mode): CategoryDef[] {
  return CATEGORIES.filter((c) => c.modes.includes(mode));
}
