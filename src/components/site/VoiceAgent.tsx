import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME: Message = {
  role: "assistant",
  content: "¡Hola! Soy el asistente virtual de Tapizados Nova. Puedo ayudarte con información sobre nuestros servicios, precios y presupuestos. ¿En qué te puedo ayudar?",
};

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function VoiceAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpeech, setHasSpeech] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setHasSpeech(!!SR);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setInput("");
      setIsLoading(true);
      stopSpeaking();

      try {
        const { data, error } = await supabase.functions.invoke("voice-agent", {
          body: {
            message: trimmed,
            history: messages.slice(-8),
          },
        });

        if (error) throw error;

        const reply: string =
          data?.reply ||
          "Lo siento, ha habido un problema. Puedes contactarnos al +34 611 491 661.";

        const botMsg: Message = { role: "assistant", content: reply };
        setMessages([...updatedHistory, botMsg]);
        speak(reply);
      } catch {
        const errMsg: Message = {
          role: "assistant",
          content:
            "Lo siento, ha habido un error técnico. Puedes contactarnos directamente al +34 611 491 661 o por WhatsApp.",
        };
        setMessages([...updatedHistory, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, speak, stopSpeaking]
  );

  const toggleListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = "es-ES";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [isListening, sendMessage]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([WELCOME]);
      speak(WELCOME.content);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [messages.length, speak]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    stopSpeaking();
    recognitionRef.current?.stop();
    setIsListening(false);
  }, [stopSpeaking]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Panel de chat */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-5 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxHeight: "500px" }}
        >
          {/* Header */}
          <div className="bg-navy px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold fill-current">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                </div>
                {isSpeaking && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-cream text-sm font-semibold leading-none">Asistente Nova</p>
                <p className="text-cream/60 text-xs mt-0.5">Tapizados Nova · Rubí, Barcelona</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-cream/70 hover:text-cream transition-colors p-1"
              aria-label="Cerrar asistente"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-navy text-cream rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              {hasSpeech && (
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  aria-label={isListening ? "Detener escucha" : "Hablar"}
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                </button>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Escuchando..." : "Escribe tu pregunta..."}
                disabled={isLoading || isListening}
                className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-navy/40 disabled:opacity-50 bg-gray-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                aria-label="Enviar"
                className="flex-shrink-0 w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center hover:bg-navy/80 disabled:opacity-40 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="mt-1.5 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                  <path d="M6 6h12v12H6z" />
                </svg>
                Detener voz
              </button>
            )}
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        aria-label="Abrir asistente virtual"
        className="group fixed bottom-5 left-5 z-50"
      >
        <span className="absolute inset-0 rounded-full bg-navy animate-ping opacity-30" />
        <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-navy text-white shadow-lg hover:scale-110 transition-transform">
          {isOpen ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          )}
        </span>
        {!isOpen && (
          <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-navy text-cream text-xs px-3 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Asistente virtual
          </span>
        )}
      </button>
    </>
  );
}
