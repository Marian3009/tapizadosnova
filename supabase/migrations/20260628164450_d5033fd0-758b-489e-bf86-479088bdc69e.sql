
-- =========================================================
-- SERVICES
-- =========================================================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  titulo_largo TEXT,
  descripcion_corta TEXT,
  descripcion_larga TEXT,
  imagen_principal TEXT,
  imagenes TEXT[] NOT NULL DEFAULT '{}',
  icono TEXT,
  incluye TEXT[] NOT NULL DEFAULT '{}',
  pasos JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  work_type_codigo TEXT,
  fabric_uso_filtro TEXT,
  meta_titulo TEXT,
  meta_descripcion TEXT,
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  publicado BOOLEAN NOT NULL DEFAULT TRUE,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON public.services FOR SELECT
  USING (publicado = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "services_admin_write" ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- TESTIMONIALS
-- =========================================================
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor TEXT NOT NULL,
  ciudad TEXT,
  texto TEXT NOT NULL,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  avatar TEXT,
  fecha DATE,
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  publicado BOOLEAN NOT NULL DEFAULT TRUE,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_public_read" ON public.testimonials FOR SELECT
  USING (publicado = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "testimonials_admin_write" ON public.testimonials FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_testimonials_updated BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- GALLERY ITEMS
-- =========================================================
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo_trabajo TEXT,
  ubicacion TEXT,
  imagen_principal TEXT,
  imagen_antes TEXT,
  imagen_despues TEXT,
  fabric_reference_id UUID,
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  publicado BOOLEAN NOT NULL DEFAULT TRUE,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_public_read" ON public.gallery_items FOR SELECT
  USING (publicado = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "gallery_admin_write" ON public.gallery_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_gallery_updated BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- SITE SETTINGS (key/value JSON)
-- =========================================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "settings_admin_write" ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- LEADS
-- =========================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origen TEXT NOT NULL,
  nombre TEXT,
  email TEXT,
  telefono TEXT,
  mensaje TEXT,
  datos JSONB NOT NULL DEFAULT '{}'::jsonb,
  estado TEXT NOT NULL DEFAULT 'nuevo',
  atendido_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_public_insert" ON public.leads FOR INSERT
  WITH CHECK (TRUE);
CREATE POLICY "leads_admin_read" ON public.leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "leads_admin_update" ON public.leads FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "leads_admin_delete" ON public.leads FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- SEEDS
-- =========================================================
INSERT INTO public.services (slug, nombre, work_type_codigo, fabric_uso_filtro, orden, destacado, descripcion_corta) VALUES
  ('tapizado-sofas',          'Tapizado de sofás',            'sofa',       'tapiceria', 1, TRUE,  'Restauramos y tapizamos sofás de cualquier estilo, devolviéndoles su forma y elegancia originales.'),
  ('tapizado-butacas',        'Butacas',                      'butaca',     'tapiceria', 2, FALSE, 'Renovación integral de butacas clásicas, vintage y de diseño.'),
  ('tapizado-sillas',         'Sillas',                       'silla',      'tapiceria', 3, FALSE, 'Tapizado de sillas de comedor, oficina y conjuntos completos.'),
  ('cojines-medida',          'Cojines a medida',             'cojines',    'tapiceria', 4, TRUE,  'Cojines confeccionados a medida con el tejido y relleno que elijas.'),
  ('cabeceros-tapizados',     'Cabeceros tapizados',          'cabecero',   'tapiceria', 5, TRUE,  'Cabeceros a medida que transforman cualquier dormitorio.'),
  ('cortinas-medida',         'Cortinas a medida',            'cortinas',   'cortinaje', 6, FALSE, 'Cortinas, estores y paneles japoneses a medida.'),
  ('fundas-medida',           'Fundas a medida',              'fundas',     'tapiceria', 7, FALSE, 'Fundas a medida para sofás, butacas y sillas.'),
  ('colchonetas-medida',      'Colchonetas',                  'colchoneta', 'exterior',  8, FALSE, 'Colchonetas para exterior, banco, palé y náutica.'),
  ('proyectos-interioristas', 'Proyectos para interioristas', NULL,         NULL,        9, FALSE, 'Servicio profesional para estudios de interiorismo y decoración.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('whatsapp', '{"numero":"+34611491661","plantilla_general":"Hola, me gustaría más información sobre Tapizados Nova.","plantilla_servicio":"Hola, quiero más información sobre el servicio {{servicio}}.","plantilla_tejido":"Hola, me interesa el tejido {{referencia}} de {{coleccion}}.","plantilla_visualizacion":"Hola, he probado un tejido en el visualizador y me gustaría un presupuesto."}'::jsonb),
  ('empresa', '{"nombre":"Tapizados Nova","telefono":"+34 611 491 661","email":"tapizadosnova@gmail.com","direccion":"Calle Bilbao N1, 1ª planta, 08191 Rubí (Barcelona)","horario":"Lun-Vie: 9:00-18:00 · Sáb: 10:00-14:00","instagram":"https://www.instagram.com/tapizados.nova","zonas":["Barcelona","Vallès Occidental","Vallès Oriental","Baix Llobregat","Maresme","Girona"]}'::jsonb),
  ('home', '{"hero_eyebrow":"Tapicería artesanal · desde 1985","hero_titulo":"Devolvemos la vida a tus muebles","hero_subtitulo":"Tapicería artesanal en Rubí. Servicio en toda Barcelona y Girona.","sobre_nova":"Más de 30 años transformando muebles con dedicación y oficio."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
