// NovaTempo AI — webhook de Stripe. Mantiene novatempo_subscribers al día
// con el plan y estado reales de cada suscripción. Requiere STRIPE_SECRET_KEY
// y STRIPE_WEBHOOK_SECRET configurados; si faltan, responde 501 sin tocar datos.
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17?target=denonext";

const PRICE_ENV_TO_PLAN: [string, string][] = [
  ["STRIPE_PRICE_PRO", "pro"],
  ["STRIPE_PRICE_BUSINESS", "business"],
];

function resolvePlanFromPriceId(priceId: string | undefined): string | null {
  if (!priceId) return null;
  for (const [envName, plan] of PRICE_ENV_TO_PLAN) {
    if (Deno.env.get(envName) === priceId) return plan;
  }
  return null;
}

Deno.serve(async (req) => {
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeSecret || !webhookSecret) {
    return new Response(JSON.stringify({ error: "not_configured" }), { status: 501 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "internal_error" }), { status: 500 });
  }
  const admin = createClient(supabaseUrl, serviceKey);

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("missing_signature");
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (e) {
    console.error("stripe signature verification failed", e);
    return new Response(JSON.stringify({ error: "invalid_signature" }), { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan;
        if (userId && plan && session.customer) {
          await admin.from("novatempo_subscribers").upsert({
            user_id: userId,
            email: session.customer_details?.email ?? "",
            plan,
            status: "active",
            stripe_customer_id: String(session.customer),
            stripe_subscription_id: session.subscription ? String(session.subscription) : null,
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = resolvePlanFromPriceId(priceId) ?? subscription.metadata?.plan ?? "free";
        const status = subscription.status === "active" || subscription.status === "trialing" ? "active" : "past_due";
        if (userId) {
          await admin.from("novatempo_subscribers").update({
            plan,
            status,
            stripe_subscription_id: subscription.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq("user_id", userId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId) {
          await admin.from("novatempo_subscribers").update({
            plan: "free",
            status: "canceled",
          }).eq("user_id", userId);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("novatempo-stripe-webhook handling error", e);
    return new Response(JSON.stringify({ error: "internal_error" }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
