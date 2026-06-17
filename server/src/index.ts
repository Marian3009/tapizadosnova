import "dotenv/config";
import { startWhatsApp } from "./whatsapp.js";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("[error] ANTHROPIC_API_KEY no está configurada. Revisa el archivo .env");
  process.exit(1);
}

console.log("[tapizados-nova-agent] Iniciando agente de WhatsApp...");

startWhatsApp().catch((err) => {
  console.error("[fatal] Error iniciando WhatsApp:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => console.error("[uncaughtException]", err));
process.on("unhandledRejection", (err) => console.error("[unhandledRejection]", err));
