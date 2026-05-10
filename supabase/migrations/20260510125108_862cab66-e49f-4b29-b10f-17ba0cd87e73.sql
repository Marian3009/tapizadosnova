
-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Tapicería',
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured_image_url TEXT,
  featured_image_alt TEXT,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read only published posts that are due
CREATE POLICY "Public can view published posts"
ON public.blog_posts FOR SELECT
USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

-- Admins full access
CREATE POLICY "Admins can view all posts"
ON public.blog_posts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts"
ON public.blog_posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
ON public.blog_posts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Weekly editorial ideas
CREATE TABLE public.blog_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','generated','published','skipped')),
  generated_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ideas"
ON public.blog_ideas FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger function (reuse pattern)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_ideas_updated_at
BEFORE UPDATE ON public.blog_ideas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 12-week editorial calendar
INSERT INTO public.blog_ideas (week_number, title, category) VALUES
(1,  'Cómo elegir la tela perfecta para renovar tu sofá', 'Tapicería'),
(2,  'Tendencias en decoración textil para hogares actuales', 'Tendencias'),
(3,  'Cuándo merece la pena retapizar una silla o butaca', 'Tapicería'),
(4,  'Colores y texturas que transforman un salón', 'Decoración textil'),
(5,  'Cómo cuidar y limpiar tus tapizados para que duren más', 'Consejos de mantenimiento'),
(6,  'Cabeceros tapizados: elegancia y confort para el dormitorio', 'Interiorismo'),
(7,  'Telas antimanchas: ventajas para hogares con niños o mascotas', 'Tapicería'),
(8,  'Cómo combinar cortinas, cojines y tapicería', 'Decoración textil'),
(9,  'Renovar un sofá antiguo: ideas antes de comprar uno nuevo', 'Inspiración para el hogar'),
(10, 'Tapicería a medida para negocios, locales y espacios profesionales', 'Tapicería'),
(11, 'Estilo clásico, moderno o natural: qué tejido elegir para cada ambiente', 'Interiorismo'),
(12, 'Errores comunes al elegir una tela para tapizar', 'Consejos de mantenimiento');
