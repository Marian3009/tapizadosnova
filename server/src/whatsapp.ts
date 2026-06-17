import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  proto,
  WAMessage,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { chat } from "./agent.js";

const AUTH_DIR = process.env.WHATSAPP_AUTH_DIR ?? "./auth_info_baileys";

// Números a ignorar (grupos, otros bots, etc.)
const IGNORED_PREFIXES = ["status@", "broadcast"];

// Texto que activa el reinicio del historial
const RESET_KEYWORDS = ["reiniciar", "reset", "nueva conversacion", "nueva conversación"];

function shouldIgnore(jid: string): boolean {
  return IGNORED_PREFIXES.some((p) => jid.includes(p)) || jid.includes("@g.us");
}

function extractText(message: WAMessage): string | null {
  const msg = message.message;
  if (!msg) return null;
  return (
    msg.conversation ??
    msg.extendedTextMessage?.text ??
    msg.ephemeralMessage?.message?.extendedTextMessage?.text ??
    null
  );
}

export async function startWhatsApp() {
  const store = makeInMemoryStore({});
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  console.log(`[wa] Using Baileys v${version.join(".")}`);

  let sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  });

  store.bind(sock.ev);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("\n[wa] Escanea el QR con WhatsApp (Ajustes > Dispositivos vinculados):\n");
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log("[wa] Conexión cerrada.", shouldReconnect ? "Reconectando..." : "Sesión cerrada.");
      if (shouldReconnect) {
        setTimeout(() => startWhatsApp(), 5_000);
      }
    } else if (connection === "open") {
      console.log("[wa] ✅ Conectado a WhatsApp. El agente está activo.");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const message of messages) {
      if (!message.key.remoteJid || message.key.fromMe) continue;

      const jid = message.key.remoteJid;
      if (shouldIgnore(jid)) continue;

      const text = extractText(message);
      if (!text?.trim()) continue;

      const phone = jid.replace("@s.whatsapp.net", "");
      console.log(`[wa] Mensaje de ${phone}: ${text}`);

      // Marcar como leído
      await sock.readMessages([message.key]);

      // Reinicio de conversación
      if (RESET_KEYWORDS.some((k) => text.toLowerCase().includes(k))) {
        const { clearHistory } = await import("./agent.js");
        clearHistory(jid);
        await sock.sendMessage(jid, {
          text: "¡De acuerdo! He reiniciado nuestra conversación. ¿En qué puedo ayudarte?",
        });
        continue;
      }

      // Indicar que está escribiendo
      await sock.sendPresenceUpdate("composing", jid);

      try {
        const reply = await chat(jid, text);
        await sock.sendMessage(jid, { text: reply }, { quoted: message });
        console.log(`[wa] Respuesta a ${phone}: ${reply.slice(0, 80)}...`);
      } catch (err) {
        console.error("[wa] Error enviando respuesta:", err);
        await sock.sendMessage(jid, {
          text: "Lo siento, ha habido un problema técnico. Por favor llámanos al +34 611 491 661.",
        });
      } finally {
        await sock.sendPresenceUpdate("paused", jid);
      }
    }
  });

  return sock;
}
