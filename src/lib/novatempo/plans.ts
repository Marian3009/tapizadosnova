export type PlanId = "free" | "pro" | "business" | "agency";

export interface PlanDef {
  id: PlanId;
  name: string;
  priceMonthly: number | null; // null = "a medida" / contactar
  generationsPerMonth: number;
  seats: number;
  highlight?: boolean;
  features: string[];
}

// Mantener sincronizado con PLAN_LIMITS en las edge functions
// novatempo-generate y novatempo-usage.
export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    name: "Gratis",
    priceMonthly: 0,
    generationsPerMonth: 5,
    seats: 1,
    features: [
      "5 generaciones IA al mes",
      "Modo retapizar mueble",
      "Modo proponer decoración",
      "Marca de agua NovaTempo",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 29,
    generationsPerMonth: 150,
    seats: 1,
    highlight: true,
    features: [
      "150 generaciones IA al mes",
      "Todas las categorías y espacios",
      "Sin marca de agua",
      "Soporte por email",
    ],
  },
  business: {
    id: "business",
    name: "Negocios",
    priceMonthly: 79,
    generationsPerMonth: 500,
    seats: 5,
    features: [
      "500 generaciones IA al mes",
      "Hasta 5 usuarios del equipo",
      "Sin marca de agua",
      "Soporte prioritario",
    ],
  },
  agency: {
    id: "agency",
    name: "Agencia / Multi-tienda",
    priceMonthly: null,
    generationsPerMonth: 2000,
    seats: 20,
    features: [
      "Volumen a medida",
      "Varias tiendas o delegaciones",
      "Marca blanca en el resultado",
      "Onboarding dedicado",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "business", "agency"];
