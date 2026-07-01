DROP POLICY IF EXISTS "leads_public_insert" ON public.leads;

CREATE POLICY "leads_public_insert"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(coalesce(origen, '')) BETWEEN 1 AND 60
    AND (nombre IS NULL OR length(nombre) BETWEEN 1 AND 200)
    AND (
      email IS NULL
      OR (length(email) BETWEEN 3 AND 320
          AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
    )
    AND (telefono IS NULL OR length(telefono) <= 40)
    AND (mensaje IS NULL OR length(mensaje) <= 4000)
    AND length(coalesce(estado, '')) BETWEEN 1 AND 40
  );