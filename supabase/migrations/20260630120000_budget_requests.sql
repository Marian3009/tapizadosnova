create table if not exists budget_requests (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  numero      text        not null,
  fecha       text        not null,
  nombre      text        not null,
  email       text        not null,
  telefono    text,
  direccion   text,
  mueble_key  text,
  mueble_label text       not null,
  tela_label  text,
  tejido_nombre text,
  modalidad   text        not null default 'tapizado',
  metraje     numeric,
  unidades    integer     default 1,
  base        numeric     not null,
  iva         numeric,
  total       numeric     not null,
  anticipo    numeric,
  estado      text        not null default 'pendiente',
  has_composite boolean   default false
);

alter table budget_requests enable row level security;

-- Cualquiera puede insertar (formulario público)
create policy "insert_budget_requests"
  on budget_requests for insert
  with check (true);

-- Solo usuarios autenticados (admin) pueden leer
create policy "read_budget_requests"
  on budget_requests for select
  using (auth.role() = 'authenticated');

-- Solo admin puede actualizar el estado
create policy "update_budget_requests"
  on budget_requests for update
  using (auth.role() = 'authenticated');
