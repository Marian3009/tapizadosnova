import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ConversationRow = {
  id: string;
  channel: string;
  contact: string;
  messages: Array<{ role: string; content: string }>;
  created_at: string;
  updated_at: string;
};

type AgentConfig = {
  agent_name: string;
  welcome_message: string;
  system_prompt: string;
  elevenlabs_voice_id: string;
};

const DEFAULT_SYSTEM_PROMPT = `Eres el asistente virtual de Tapizados Nova, empresa familiar de tapicería artesanal en Rubí (Barcelona) con más de 30 años de experiencia desde 1995.

DATOS DE CONTACTO:
- Dirección: Calle Bilbao N1, 1ª planta, 08191 Rubí (Barcelona)
- Teléfono/WhatsApp: +34 611 491 661
- Email: tapizadosnova@gmail.com
- Horario: Lunes-Viernes 9:00-18:00h, Sábados 9:00-14:00h

SERVICIOS Y PRECIOS:
- Asiento silla: desde 55€ | Silla completa: desde 84€
- Butaca: desde 320€ | Sofá 2 plazas: desde 670€ | Sofá 3 plazas: desde 820€
- Telas: Básica 20€/m, Antimanchas 35€/m, Terciopelo 35€/m, Premium 70€/m

INSTRUCCIONES: Responde en español, amable y conciso. Máximo 3 frases para respuestas de voz.`;

export default function AgentAdmin() {
  return (
    <Tabs defaultValue="conversaciones">
      <TabsList className="mb-4">
        <TabsTrigger value="conversaciones">Conversaciones</TabsTrigger>
        <TabsTrigger value="config">Configuración</TabsTrigger>
        <TabsTrigger value="voz">Voz &amp; ElevenLabs</TabsTrigger>
        <TabsTrigger value="guia">Guía de instalación</TabsTrigger>
      </TabsList>
      <TabsContent value="conversaciones"><ConversationsTab /></TabsContent>
      <TabsContent value="config"><ConfigTab /></TabsContent>
      <TabsContent value="voz"><VoiceTab /></TabsContent>
      <TabsContent value="guia"><GuideTab /></TabsContent>
    </Tabs>
  );
}

/* ─── Conversaciones ─── */
function ConversationsTab() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "web" | "whatsapp">("all");

  const load = async () => {
    setLoading(true);
    const q = supabase
      .from("agent_conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (filter !== "all") q.eq("channel", filter);
    const { data } = await q;
    setRows((data as ConversationRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const remove = async (id: string) => {
    await supabase.from("agent_conversations").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
    if (expanded === id) setExpanded(null);
    toast.success("Conversación eliminada");
  };

  const channelBadge = (ch: string) =>
    ch === "whatsapp"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-xl text-navy">
          Conversaciones del agente ({rows.length})
        </h2>
        <div className="flex gap-2">
          {(["all", "web", "whatsapp"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === f
                  ? "bg-navy text-cream border-navy"
                  : "border-gray-300 text-gray-600 hover:border-navy"
              }`}
            >
              {f === "all" ? "Todos" : f === "web" ? "Web" : "WhatsApp"}
            </button>
          ))}
          <button
            onClick={load}
            className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:border-navy transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay conversaciones aún. El agente guardará automáticamente los chats cuando los usuarios interactúen.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === row.id ? null : row.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${channelBadge(row.channel)}`}>
                    {row.channel === "whatsapp" ? "WhatsApp" : "Web"}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{row.contact}</span>
                  <span className="text-xs text-muted-foreground">
                    {row.messages.length} mensajes
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(row.updated_at).toLocaleString("es-ES", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-4 h-4 fill-current text-gray-400 transition-transform ${expanded === row.id ? "rotate-180" : ""}`}
                  >
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                  </svg>
                </div>
              </button>

              {expanded === row.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                    {row.messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                            msg.role === "user"
                              ? "bg-navy text-cream"
                              : "bg-white border border-gray-200 text-gray-700"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => remove(row.id)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Eliminar conversación
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Configuración del agente ─── */
function ConfigTab() {
  const [cfg, setCfg] = useState<AgentConfig>({
    agent_name: "Asistente Nova",
    welcome_message: "¡Hola! Soy el asistente virtual de Tapizados Nova. ¿En qué te puedo ayudar?",
    system_prompt: DEFAULT_SYSTEM_PROMPT,
    elevenlabs_voice_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("agent_config")
      .select("*")
      .eq("id", "default")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCfg({
            agent_name: data.agent_name ?? cfg.agent_name,
            welcome_message: data.welcome_message ?? cfg.welcome_message,
            system_prompt: data.system_prompt ?? DEFAULT_SYSTEM_PROMPT,
            elevenlabs_voice_id: data.elevenlabs_voice_id ?? "",
          });
        }
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("agent_config")
      .upsert({ id: "default", ...cfg, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error("Error al guardar: " + error.message);
    else toast.success("Configuración guardada correctamente");
  };

  if (loading) return <p className="text-sm text-muted-foreground p-4">Cargando...</p>;

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-5">
      <h2 className="font-display text-xl text-navy">Configuración del agente</h2>
      <p className="text-sm text-muted-foreground">
        Personaliza cómo responde tu asistente. Los cambios se aplican inmediatamente a la web y al agente de WhatsApp.
      </p>

      <div>
        <Label>Nombre del asistente</Label>
        <Input
          className="mt-1"
          value={cfg.agent_name}
          onChange={(e) => setCfg({ ...cfg, agent_name: e.target.value })}
          placeholder="Asistente Nova"
        />
      </div>

      <div>
        <Label>Mensaje de bienvenida</Label>
        <Textarea
          className="mt-1"
          rows={2}
          value={cfg.welcome_message}
          onChange={(e) => setCfg({ ...cfg, welcome_message: e.target.value })}
          placeholder="¡Hola! ¿En qué puedo ayudarte?"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Primer mensaje que ve el cliente al abrir el chat.
        </p>
      </div>

      <div>
        <Label>Prompt del sistema (instrucciones del agente)</Label>
        <Textarea
          className="mt-1 font-mono text-xs"
          rows={14}
          value={cfg.system_prompt}
          onChange={(e) => setCfg({ ...cfg, system_prompt: e.target.value })}
          placeholder={DEFAULT_SYSTEM_PROMPT}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Define la personalidad, conocimiento y comportamiento del agente. Si lo dejas vacío, usará el prompt por defecto.
        </p>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => setCfg({ ...cfg, system_prompt: DEFAULT_SYSTEM_PROMPT })}
          className="text-xs text-muted-foreground hover:text-navy underline"
        >
          Restaurar prompt por defecto
        </button>
        <Button variant="gold" onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Voz y ElevenLabs ─── */
function VoiceTab() {
  const [voiceId, setVoiceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    supabase
      .from("agent_config")
      .select("elevenlabs_voice_id")
      .eq("id", "default")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.elevenlabs_voice_id) setVoiceId(data.elevenlabs_voice_id);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("agent_config")
      .upsert({ id: "default", elevenlabs_voice_id: voiceId, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error("Error: " + error.message);
    else toast.success("Voice ID guardado. El widget usará ElevenLabs al recargar.");
  };

  const testVoice = async () => {
    if (!voiceId) { toast.error("Introduce primero el Voice ID"); return; }
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
        body: { text: "Hola, soy el asistente de Tapizados Nova. ¿En qué puedo ayudarte?", voice_id: voiceId },
      });
      if (error || !data?.audio) throw new Error(error?.message || "No se recibió audio");
      const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      await audio.play();
      toast.success("¡Voz reproducida correctamente!");
    } catch (e: any) {
      toast.error("Error probando la voz: " + e.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-6">
      <h2 className="font-display text-xl text-navy">Voz con ElevenLabs</h2>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800 font-medium mb-1">Requisito previo</p>
        <p className="text-sm text-amber-700">
          Necesitas configurar <code className="bg-amber-100 px-1 rounded">ELEVENLABS_API_KEY</code> en los secretos de Supabase (Dashboard → Edge Functions → Secrets).
        </p>
      </div>

      <div>
        <Label>Voice ID de ElevenLabs</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="21m00Tcm4TlvDq8ikWAM"
            className="font-mono text-sm"
          />
          <Button variant="outline" onClick={testVoice} disabled={testing || !voiceId}>
            {testing ? "..." : "Probar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Encuéntralo en ElevenLabs → Voices. La voz "Rachel" (ID: 21m00Tcm4TlvDq8ikWAM) funciona bien en español.
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-navy mb-3">Cómo clonar tu propia voz</p>
        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
          <li>Entra en <strong>ElevenLabs → Voice Lab → Add Voice → Instant Voice Clone</strong></li>
          <li>Graba o sube <strong>5-30 minutos</strong> de tu voz hablando con claridad</li>
          <li>Dale un nombre (ej: "Mi voz - Tapizados Nova")</li>
          <li>Copia el <strong>Voice ID</strong> que aparece tras crearla</li>
          <li>Pégalo aquí arriba y pulsa <strong>Guardar</strong></li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3">
          Con la voz clonada, el asistente hablará con tu misma voz. Requiere plan Starter de ElevenLabs (~$5/mes).
        </p>
      </div>

      <div className="flex justify-end">
        <Button variant="gold" onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Voice ID"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Guía de instalación ─── */
function GuideTab() {
  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-6">
      <h2 className="font-display text-xl text-navy">Guía completa de activación</h2>

      {/* Paso 1: Agente web */}
      <Section title="1. Activar el agente de chat web" color="blue">
        <p className="text-sm text-gray-700 mb-3">
          El widget ya está activo en la web. Para que tenga inteligencia, añade el secreto en Supabase:
        </p>
        <CodeBlock>
          {`# Supabase Dashboard → Edge Functions → Secrets → New Secret
ANTHROPIC_API_KEY = sk-ant-...
# Obtén tu clave en: console.anthropic.com`}
        </CodeBlock>
        <p className="text-sm text-gray-700 mt-3">
          Luego despliega la función: <code className="bg-gray-100 px-1 rounded text-xs">supabase functions deploy voice-agent</code>
        </p>
      </Section>

      {/* Paso 2: Voz de calidad */}
      <Section title="2. Activar voz de alta calidad (ElevenLabs)" color="purple">
        <p className="text-sm text-gray-700 mb-3">
          Añade también en Supabase Secrets:
        </p>
        <CodeBlock>
          {`ELEVENLABS_API_KEY = tu_clave_de_elevenlabs
ELEVENLABS_VOICE_ID = 21m00Tcm4TlvDq8ikWAM  # o el ID de tu voz clonada`}
        </CodeBlock>
        <p className="text-sm text-gray-700 mt-3">
          Despliega: <code className="bg-gray-100 px-1 rounded text-xs">supabase functions deploy elevenlabs-tts</code>
          <br/>El widget activará automáticamente ElevenLabs cuando detecte el Voice ID.
        </p>
      </Section>

      {/* Paso 3: WhatsApp */}
      <Section title="3. Activar agente de WhatsApp" color="green">
        <p className="text-sm text-gray-700 mb-3">
          El servidor de WhatsApp está en la carpeta <code className="bg-gray-100 px-1 rounded text-xs">server/</code>.
          Necesitas un VPS (servidor Linux en la nube).
        </p>
        <div className="text-sm text-gray-700 space-y-2 mb-3">
          <p><strong>¿Qué es un VPS?</strong> Un ordenador en la nube siempre encendido. Hetzner CX22 cuesta ~4€/mes y es suficiente.</p>
          <p><strong>¿Qué es PM2?</strong> Un programa que mantiene tu app Node.js encendida para siempre, incluso si hay errores o reinicios.</p>
        </div>
        <CodeBlock>
          {`# En el VPS (Ubuntu/Debian):
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2

# Sube la carpeta server/ al VPS (con scp o git)
cd server
cp .env.example .env
nano .env  # Añade tu ANTHROPIC_API_KEY

npm install
npm run dev
# → Aparece un QR en la terminal. Escanéalo con WhatsApp:
# WhatsApp → Ajustes → Dispositivos vinculados → Vincular dispositivo

# Una vez escaneado, en producción:
npm run build
pm2 start dist/index.js --name "tapizados-whatsapp"
pm2 startup   # Para que arranque al reiniciar el VPS
pm2 save`}
        </CodeBlock>
      </Section>

      {/* Paso 4: Llamadas telefónicas */}
      <Section title="4. Llamadas telefónicas con IA (Avanzado)" color="orange">
        <p className="text-sm text-gray-700 mb-3">
          Para que la IA conteste llamadas a tu teléfono, hay dos opciones:
        </p>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="bg-gray-50 rounded p-3">
            <p className="font-medium mb-1">Opción A: ElevenLabs Conversational AI (más fácil)</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Ve a ElevenLabs → Conversational AI → Create Agent</li>
              <li>Configura la voz, el prompt del sistema y las capacidades</li>
              <li>En "Phone Numbers" compra un número o configura el desvío</li>
              <li>Activa el desvío de llamadas en tu móvil: <code className="bg-gray-100 px-1 rounded">**21*NUMERO_ELEVENLABS#</code></li>
            </ol>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="font-medium mb-1">Opción B: Twilio + Claude (más control)</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Crea cuenta en Twilio, consigue un número español</li>
              <li>Configura desvío de tu móvil al número Twilio</li>
              <li>Twilio envía el audio a tu servidor, Claude responde, Twilio habla</li>
            </ol>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50",
    purple: "border-purple-200 bg-purple-50",
    green: "border-green-200 bg-green-50",
    orange: "border-orange-200 bg-orange-50",
  };
  return (
    <div className={`border rounded-lg p-4 ${colors[color] ?? "border-gray-200 bg-gray-50"}`}>
      <p className="font-semibold text-navy mb-3">{title}</p>
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
      {children}
    </pre>
  );
}
