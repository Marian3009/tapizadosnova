import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  WAMessage,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { chat, clearHistory } from "./agent.js";
import { createClient } from "@supabase/supabase-js";

const AUTH_DIR = process.env.WHATSAPP_AUTH_DIR ?? "./auth_info_baileys";

const IGNORED_PREFIXES = ["status@", "broadcast"];
const RESET_KEYWORDS = ["reiniciar", "reset", "nueva conversacion", "nueva conversación"];

// Cliente Supabase para guardar conversaciones (opcional)
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

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

async function saveToSupabase(jid: string, phone: string, messages: Array<{ role: string; content: string }>) {
  if (!supabase) return;
  try {
    await supabase.from("agent_conversations").upsert(
      {
        id: jid, // usamos el JID como ID único por conversación
        channel: "whatsapp",
        contact: phone,
        messages,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  } catch (e) {
    console.error("[wa] Failed to save conversation to Supabase:", e);
  }
}

export async function startWhatsApp() {
  const store = makeInMemoryStore({});
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  console.log(`[wa] Baileys v${version.join(".")}`);

  const sock = makeWASocket({
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
      console.log("\n[wa] Escanea el QR con WhatsApp: Ajustes → Dispositivos vinculados → Vincular dispositivo\n");
    }
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("[wa] Conexión cerrada.", shouldReconnect ? "Reconectando en 5s..." : "Sesión cerrada.");
      if (shouldReconnect) setTimeout(() => startWhatsApp(), 5_000);
    } else if (connection === "open") {
      console.log("[wa] ✅ Conectado. El agente está activo en tu número de WhatsApp.");
    }
  });

  // Historial local en memoria por JID (para pasar a saveToSupabase)
  const localHistory = new Map<string, Array<{ role: string; content: string }>>();

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const message of messages) {
      if (!message.key.remoteJid || message.key.fromMe) continue;
      const jid = message.key.remoteJid;
      if (shouldIgnore(jid)) continue;

      const text = extractText(message);
      if (!text?.trim()) continue;

      const phone = jid.replace("@s.whatsapp.net", "");
      console.log(`[wa] ${phone}: ${text}`);

      await sock.readMessages([message.key]);

      if (RESET_KEYWORDS.some((k) => text.toLowerCase().includes(k))) {
        clearHistory(jid);
        localHistory.delete(jid);
        await sock.sendMessage(jid, {
          text: "¡De acuerdo! He reiniciado nuestra conversación. ¿En qué puedo ayudarte?",
        });
        continue;
      }

      await sock.sendPresenceUpdate("composing", jid);

      try {
        const reply = await chat(jid, text);

        await sock.sendMessage(jid, { text: reply }, { quoted: message });
        console.log(`[wa] → ${phone}: ${reply.slice(0, 80)}...`);

        // Actualizar historial local y guardar en Supabase
        const history = localHistory.get(jid) ?? [];
        history.push({ role: "user", content: text });
        history.push({ role: "assistant", content: reply });
        if (history.length > 40) history.splice(0, history.length - 40);
        localHistory.set(jid, history);
        saveToSupabase(jid, phone, history);
      } catch (err) {
        console.error("[wa] Error:", err);
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
