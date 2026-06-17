import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./context.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ChatMessage = { role: "user" | "assistant"; content: string };

// Historial de conversación por número de teléfono (máx. 20 mensajes / número)
const conversations = new Map<string, ChatMessage[]>();
const MAX_HISTORY = 20;

export async function chat(phoneNumber: string, userMessage: string): Promise<string> {
  const history = conversations.get(phoneNumber) ?? [];

  history.push({ role: "user", content: userMessage });

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: history.slice(-MAX_HISTORY),
    });

    const reply =
      response.content[0].type === "text"
        ? response.content[0].text
        : "Lo siento, no pude procesar tu consulta. Llámanos al +34 611 491 661.";

    history.push({ role: "assistant", content: reply });

    // Mantener solo los últimos MAX_HISTORY mensajes
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    conversations.set(phoneNumber, history);

    return reply;
  } catch (err) {
    console.error("[agent] Error calling Claude:", err);
    return "Lo siento, ha habido un error técnico. Por favor llámanos al +34 611 491 661 o escríbenos por email a tapizadosnova@gmail.com.";
  }
}

export function clearHistory(phoneNumber: string) {
  conversations.delete(phoneNumber);
}
