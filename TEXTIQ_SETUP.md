# NovaTempo AI — activar cobros con Stripe

La app funciona ya con límites de uso reales (planes Gratis/Pro/Negocios/Agencia
contados en `novatempo_usage`), pero el botón de pasar a un plan de pago
necesita una cuenta de Stripe conectada. Hasta entonces, los botones de
upgrade muestran un aviso y el usuario puede escribir por WhatsApp/email para
activarle el plan a mano (ver `NOVATEMPO.contactEmail` en
`src/lib/novatempo/brand.ts`).

## Pasos para activarlo

1. Crea una cuenta en [stripe.com](https://stripe.com) y activa pagos.
2. Crea dos productos con precio recurrente mensual: **NovaTempo Pro** (29€/mes)
   y **NovaTempo Negocios** (79€/mes). Copia el `price_id` de cada uno.
3. En el proyecto de Supabase (`kmiaethuwbmivsoeqxpo`), añade estos secretos
   a las Edge Functions (Dashboard → Edge Functions → Secrets, o
   `supabase secrets set NOMBRE=valor`):
   - `STRIPE_SECRET_KEY` — clave secreta de Stripe (`sk_live_...` o `sk_test_...`)
   - `STRIPE_PRICE_PRO` — price ID del plan Pro
   - `STRIPE_PRICE_BUSINESS` — price ID del plan Negocios
   - `STRIPE_WEBHOOK_SECRET` — se obtiene en el paso 4
4. En Stripe Dashboard → Developers → Webhooks, crea un endpoint apuntando a:
   `https://kmiaethuwbmivsoeqxpo.supabase.co/functions/v1/novatempo-stripe-webhook`
   y suscríbelo a los eventos `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.created` y
   `customer.subscription.deleted`. Copia el "Signing secret" en
   `STRIPE_WEBHOOK_SECRET`.
5. Listo: en `/novatempo/precios`, los botones de Pro y Negocios abrirán
   Stripe Checkout de verdad y `novatempo_subscribers` se actualizará solo.

Si en el futuro quieres cambiar el precio o el límite de generaciones de un
plan, edita `PLAN_LIMITS` en `supabase/functions/novatempo-generate/index.ts`
y `supabase/functions/novatempo-usage/index.ts`, y el objeto `PLANS` en
`src/lib/novatempo/plans.ts` (deben ir sincronizados).
