export const DEFAULT_SETTINGS = {
  iban: "",
  phone: "+34 611 491 661",
  email: "tapizadosnova@gmail.com",
  address: "Calle Bilbao N1, 1ª planta, 08191 Rubí (Barcelona)",
  hours: "Lun-Vie: 9:00-18:00 · Sáb: 10:00-14:00",
  instagram: "https://www.instagram.com/tapizeando",
  whatsapp: "https://wa.me/34611491661",
};

export type Settings = typeof DEFAULT_SETTINGS;

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem("tn_settings");
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* */ }
  return DEFAULT_SETTINGS;
}

export function saveSettings(s: Settings) {
  localStorage.setItem("tn_settings", JSON.stringify(s));
  window.dispatchEvent(new Event("tn_settings_changed"));
}
