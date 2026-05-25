-- Tabla para guardar solicitudes de contacto recibidas desde el formulario web
create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  email       text not null,
  telefono    text,
  tipo        text not null,
  descripcion text not null,
  origen      text,
  leido       boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Solo los admins pueden leer/actualizar; nadie puede insertar directamente (solo via Edge Function con service_role)
alter table public.contact_submissions enable row level security;

create policy "admins can read contact submissions"
  on public.contact_submissions for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "admins can update contact submissions"
  on public.contact_submissions for update
  using (public.has_role(auth.uid(), 'admin'));
