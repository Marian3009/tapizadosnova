import { type FabricCategory } from "./catalog";

import img_alisio from "@/assets/fabrics/alisio.jpg";
import img_colette from "@/assets/fabrics/colette.jpg";
import img_ceylan from "@/assets/fabrics/ceylan.jpg";
import img_aran from "@/assets/fabrics/aran.jpg";
import img_grimaldi from "@/assets/fabrics/grimaldi.jpg";
import img_camila from "@/assets/fabrics/camila.jpg";

export type CatalogTipo = "Lisos" | "Lino" | "Estampados" | "FibreGuard" | "Rayas" | "Flores";

export type CatalogFabric = {
  id: string;
  coleccion: string;
  referencia: string;
  color: string;          // nombre del color
  hex: string;            // muestra puntual
  imagen: string;         // imagen general de la colección
  descripcion: string;
  tipo: CatalogTipo;
  categoria: FabricCategory; // compatibilidad con calculadora
  nombre: string;         // texto compuesto para búsquedas y compatibilidad
};

const make = (
  base: Omit<CatalogFabric, "id" | "nombre" | "hex" | "color" | "referencia"> & { hex?: string },
  refs: { ref: string; color: string; hex: string }[],
): CatalogFabric[] =>
  refs.map((r) => ({
    ...base,
    id: `${base.coleccion}-${r.ref}`.toLowerCase().replace(/\s+/g, "_"),
    referencia: r.ref,
    color: r.color,
    hex: r.hex,
    nombre: `${base.coleccion} · ${r.color}`,
  }));

export const CATALOG_FABRICS: CatalogFabric[] = [
  ...make(
    {
      coleccion: "MORNING",
      tipo: "Lisos",
      categoria: "basico",
      imagen: img_alisio,
      descripcion: "Tejido liso de tacto suave y caída elegante. Una base versátil para cualquier estilo decorativo.",
    },
    [
      { ref: "M-01", color: "Marfil", hex: "#ece4d3" },
      { ref: "M-02", color: "Arena", hex: "#d8c5a3" },
      { ref: "M-03", color: "Topo", hex: "#b29d80" },
      { ref: "M-04", color: "Verde salvia", hex: "#8a9b85" },
      { ref: "M-05", color: "Azul niebla", hex: "#8a9aa8" },
      { ref: "M-06", color: "Carbón", hex: "#4a4a4a" },
    ],
  ),
  ...make(
    {
      coleccion: "PURE LINEN",
      tipo: "Lino",
      categoria: "premium",
      imagen: img_colette,
      descripcion: "Lino 100% natural, transpirable y de textura noble. Aporta autenticidad artesanal.",
    },
    [
      { ref: "PL-01", color: "Natural", hex: "#d9cdb6" },
      { ref: "PL-02", color: "Crudo", hex: "#ede6d3" },
      { ref: "PL-03", color: "Mostaza", hex: "#b69347" },
      { ref: "PL-04", color: "Terracota", hex: "#b56a4a" },
      { ref: "PL-05", color: "Verde oliva", hex: "#788559" },
      { ref: "PL-06", color: "Antracita", hex: "#3e3e3e" },
    ],
  ),
  ...make(
    {
      coleccion: "CEYLAN",
      tipo: "Estampados",
      categoria: "antimanchas",
      imagen: img_ceylan,
      descripcion: "Estampado botánico de hojas anchas sobre base de lino. Carácter contemporáneo y orgánico.",
    },
    [
      { ref: "CY-01", color: "Verde botánico", hex: "#4f6e4a" },
      { ref: "CY-02", color: "Azul océano", hex: "#3a5a78" },
      { ref: "CY-03", color: "Tierra", hex: "#8b6a4a" },
      { ref: "CY-04", color: "Crema", hex: "#e6dcc4" },
    ],
  ),
  ...make(
    {
      coleccion: "LECH",
      tipo: "FibreGuard",
      categoria: "antimanchas",
      imagen: img_aran,
      descripcion: "Tejido FibreGuard antimanchas, fácil de limpiar con agua. Ideal para uso diario y familias.",
    },
    [
      { ref: "LE-01", color: "Beige", hex: "#c5b094" },
      { ref: "LE-02", color: "Gris claro", hex: "#b0b0ad" },
      { ref: "LE-03", color: "Gris oscuro", hex: "#5a5a5a" },
      { ref: "LE-04", color: "Azul piedra", hex: "#6e7d8a" },
      { ref: "LE-05", color: "Verde musgo", hex: "#6a7a52" },
      { ref: "LE-06", color: "Tabaco", hex: "#8a6c4a" },
    ],
  ),
  ...make(
    {
      coleccion: "RAYAS ATELIER",
      tipo: "Rayas",
      categoria: "basico",
      imagen: img_grimaldi,
      descripcion: "Rayas tejidas en tonos contrastados sobre base natural. Un clásico atemporal con espíritu mediterráneo.",
    },
    [
      { ref: "RA-01", color: "Marino y crudo", hex: "#2c3e54" },
      { ref: "RA-02", color: "Burdeos y crudo", hex: "#6e2a2a" },
      { ref: "RA-03", color: "Verde y crudo", hex: "#4a6b4a" },
      { ref: "RA-04", color: "Mostaza y crudo", hex: "#b69347" },
    ],
  ),
  ...make(
    {
      coleccion: "FLORES BOTÁNICAS",
      tipo: "Flores",
      categoria: "premium",
      imagen: img_camila,
      descripcion: "Estampados florales pintados a mano sobre base de algodón y lino. Romántico y sofisticado.",
    },
    [
      { ref: "FB-01", color: "Verde primavera", hex: "#6b8a5a" },
      { ref: "FB-02", color: "Rosa antiguo", hex: "#b58a8a" },
      { ref: "FB-03", color: "Azul porcelana", hex: "#6a8aa8" },
      { ref: "FB-04", color: "Multicolor crema", hex: "#d4c8a8" },
    ],
  ),
];

export const CATALOG_TIPOS: CatalogTipo[] = ["Lisos", "Lino", "Estampados", "FibreGuard", "Rayas", "Flores"];
