-- Textiq AI: planes, suscriptores y contador de uso para la app
-- comercializable de decoración textil con IA (multi-negocio).

create table if not exists textiq_subscribers (
  user_id               uuid        primary key references auth.users(id) on delete cascade,
  email                 text        not null,
  business_name         text,
  plan                  text        not null default 'free' check (plan in ('free', 'pro', 'business', 'agency')),
  status                text        not null default 'active' check (status in ('active', 'past_due', 'canceled')),
  stripe_customer_id    text,
  stripe_subscription_id text,
  current_period_end    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table textiq_subscribers enable row level security;

create policy "read_own_subscriber"
  on textiq_subscribers for select
  using (auth.uid() = user_id);

-- Solo el service role (edge functions) crea/actualiza suscriptores;
-- lo hacemos explícito con una política restrictiva de escritura para el resto.
create policy "no_client_writes_subscriber"
  on textiq_subscribers for all
  using (false)
  with check (false);

create table if not exists textiq_usage (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade,
  device_id   text,
  mode        text        not null,
  category    text        not null,
  created_at  timestamptz not null default now(),
  constraint textiq_usage_identity check (user_id is not null or device_id is not null)
);

create index if not exists textiq_usage_user_period_idx
  on textiq_usage (user_id, created_at);

create index if not exists textiq_usage_device_period_idx
  on textiq_usage (device_id, created_at);

alter table textiq_usage enable row level security;

-- El conteo de uso se hace siempre desde la edge function con service role;
-- no se expone lectura/escritura directa por RLS.
create policy "no_client_access_usage"
  on textiq_usage for all
  using (false)
  with check (false);

-- Reutiliza la función de trigger ya existente en el proyecto (ver
-- migración de blog_posts) si está disponible; si no, la creamos aquí
-- de forma idempotente con el mismo nombre para no duplicar lógica.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

create trigger set_textiq_subscribers_updated_at
  before update on textiq_subscribers
  for each row execute function public.update_updated_at_column();
