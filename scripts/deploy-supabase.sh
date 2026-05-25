#!/usr/bin/env bash
# Despliega todo en Supabase: migraciones + Edge Functions
# Uso: bash scripts/deploy-supabase.sh
set -e

PROJECT_ID="kmiaethuwbmivsoeqxpo"
# Pega aquí tu Personal Access Token de https://supabase.com/dashboard/account/tokens
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"

if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: define SUPABASE_ACCESS_TOKEN antes de ejecutar este script."
  echo "  export SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxx"
  exit 1
fi

echo "==> Autenticando con Supabase..."
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN npx supabase login --token "$ACCESS_TOKEN" 2>/dev/null || true

echo "==> Enlazando proyecto..."
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN npx supabase link --project-ref "$PROJECT_ID"

echo "==> Aplicando migraciones de base de datos..."
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN npx supabase db push

echo "==> Desplegando Edge Function: send-contact..."
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN npx supabase functions deploy send-contact --project-ref "$PROJECT_ID"

echo "==> Desplegando Edge Function: analyze-furniture..."
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN npx supabase functions deploy analyze-furniture --project-ref "$PROJECT_ID"

echo ""
echo "✓ Despliegue completado."
echo ""
echo "PRÓXIMO PASO: configura los secrets en Supabase Dashboard"
echo "  https://supabase.com/dashboard/project/$PROJECT_ID/settings/functions"
echo ""
echo "  Secrets necesarios:"
echo "  - RESEND_API_KEY      → tu clave de resend.com (gratis en https://resend.com)"
echo "  - CONTACT_TO_EMAIL    → tapizadosnova@gmail.com"
echo "  - CONTACT_FROM_EMAIL  → noreply@tapizadosnova.com (dominio verificado en Resend)"
echo "  - LOVABLE_API_KEY     → ya debería estar configurado para analyze-furniture"
