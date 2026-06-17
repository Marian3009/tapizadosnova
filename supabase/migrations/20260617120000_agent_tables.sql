-- Tabla de conversaciones del agente (web + WhatsApp)
CREATE TABLE public.agent_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('web', 'whatsapp')),
  contact TEXT NOT NULL DEFAULT 'anonymous',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden leer conversaciones" ON public.agent_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden borrar conversaciones" ON public.agent_conversations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Tabla de configuración del agente (fila única)
CREATE TABLE public.agent_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  agent_name TEXT NOT NULL DEFAULT 'Asistente Nova',
  welcome_message TEXT NOT NULL DEFAULT '¡Hola! Soy el asistente virtual de Tapizados Nova. ¿En qué te puedo ayudar con el tapizado de tu mueble?',
  system_prompt TEXT,
  elevenlabs_voice_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden gestionar config" ON public.agent_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insertar configuración por defecto
INSERT INTO public.agent_config (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- Índice para búsquedas por canal y fecha
CREATE INDEX idx_agent_conversations_channel ON public.agent_conversations (channel, updated_at DESC);
