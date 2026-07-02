const STORAGE_KEY = "textiq_device_id";

// Identificador anónimo persistente en este navegador, usado para aplicar
// el límite del plan Gratis a usuarios que todavía no se han registrado.
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}
