export type Modalidad = "tapizado" | "funda";
export type FabricCategory = "basico" | "antimanchas" | "terciopelo" | "premium";

export type MuebleDef = {
  key: string;
  label: string;
  modalidad: Modalidad;
  precio: number; // mano de obra
  metraje: number; // m
};

export const MUEBLES: MuebleDef[] = [
  // Tapizado
  { key: "t_asiento_silla", label: "Asiento silla", modalidad: "tapizado", precio: 35, metraje: 0.6 },
  { key: "t_silla_as_resp", label: "Silla asiento y respaldo", modalidad: "tapizado", precio: 60, metraje: 1.2 },
  { key: "t_silla_clas_pas", label: "Silla clásica asiento con pasamanería", modalidad: "tapizado", precio: 40, metraje: 0.6 },
  { key: "t_silla_clas_pas_tachas", label: "Silla clásica asiento con pasamanería y tachas", modalidad: "tapizado", precio: 65, metraje: 0.6 },
  { key: "t_silla_clas_resp_pas", label: "Silla clásica asiento y respaldo con pasamanería", modalidad: "tapizado", precio: 70, metraje: 1.2 },
  { key: "t_silla_clas_resp_pas_tachas", label: "Silla clásica asiento y respaldo con pasamanería y tachas", modalidad: "tapizado", precio: 100, metraje: 1.2 },
  { key: "t_descalzadora", label: "Descalzadora", modalidad: "tapizado", precio: 190, metraje: 3.5 },
  { key: "t_butaca", label: "Butaca", modalidad: "tapizado", precio: 230, metraje: 4.5 },
  { key: "t_butaca_xl", label: "Butaca XL", modalidad: "tapizado", precio: 290, metraje: 8.0 },
  { key: "t_orejero", label: "Sillón orejero", modalidad: "tapizado", precio: 290, metraje: 6.0 },
  { key: "t_sofa2", label: "Sofá 2 plazas", modalidad: "tapizado", precio: 450, metraje: 11.0 },
  { key: "t_sofa3", label: "Sofá 3 plazas", modalidad: "tapizado", precio: 540, metraje: 14.0 },
  { key: "t_rinconera", label: "Sofá rinconera", modalidad: "tapizado", precio: 850, metraje: 18.0 },
  { key: "t_chaise", label: "Chaise longue", modalidad: "tapizado", precio: 600, metraje: 10.0 },
  // Fundas
  { key: "f_asiento_silla", label: "Funda asiento silla", modalidad: "funda", precio: 30, metraje: 0.6 },
  { key: "f_silla_as_resp", label: "Funda silla asiento y respaldo", modalidad: "funda", precio: 50, metraje: 1.2 },
  { key: "f_butaca_p", label: "Funda butaca pequeña", modalidad: "funda", precio: 150, metraje: 4.5 },
  { key: "f_butaca_xl", label: "Funda butaca XL", modalidad: "funda", precio: 210, metraje: 8.0 },
  { key: "f_orejero", label: "Funda sillón orejero", modalidad: "funda", precio: 230, metraje: 6.0 },
  { key: "f_sofa2", label: "Funda sofá 2 plazas", modalidad: "funda", precio: 270, metraje: 11.0 },
  { key: "f_sofa3", label: "Funda sofá 3 plazas", modalidad: "funda", precio: 340, metraje: 14.0 },
  { key: "f_rinconera", label: "Funda rinconera", modalidad: "funda", precio: 620, metraje: 18.0 },
  { key: "f_chaise", label: "Funda chaise longue", modalidad: "funda", precio: 250, metraje: 10.0 },
];

export const TELAS: Record<FabricCategory, { label: string; price: number; from: string }> = {
  basico: { label: "Tela Básica", price: 20, from: "desde 20 €/metro" },
  antimanchas: { label: "Tela Anti Manchas", price: 35, from: "desde 35 €/metro" },
  terciopelo: { label: "Tela Terciopelo", price: 35, from: "desde 35 €/metro" },
  premium: { label: "Lino y Premium", price: 70, from: "desde 70 €/metro" },
};

export const TELA_LABELS: { value: FabricCategory; label: string }[] = [
  { value: "basico", label: "Tela Básica — desde 20 €/metro" },
  { value: "antimanchas", label: "Tela Anti Manchas — desde 35 €/metro" },
  { value: "terciopelo", label: "Tela Terciopelo — desde 35 €/metro" },
  { value: "premium", label: "Lino y Premium — desde 70 €/metro" },
];

export function getMueble(key: string) {
  return MUEBLES.find((m) => m.key === key)!;
}
