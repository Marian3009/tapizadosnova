import { useEffect, useState } from "react";
import TextiqNavbar from "@/components/textiq/TextiqNavbar";
import TextiqFooter from "@/components/textiq/TextiqFooter";
import TextiqAuthDialog from "@/components/textiq/TextiqAuthDialog";
import SectionHeader from "@/components/site/SectionHeader";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { applySeo } from "@/lib/seo";
import { TEXTIQ } from "@/lib/textiq/brand";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/textiq/plans";
import { useTextiqSession } from "@/hooks/use-textiq-session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function TextiqPricing() {
  useReveal();
  const { session, usage, refreshUsage } = useTextiqSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);
  const [checkingOutPlan, setCheckingOutPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    applySeo({
      title: `Precios | ${TEXTIQ.name}`,
      description: `Planes de ${TEXTIQ.name} para tapicerías, estudios de interiorismo y particulares. Empieza gratis.`,
      path: TEXTIQ.routes.pricing,
    });
  }, []);

  const startCheckout = async (plan: PlanId) => {
    setCheckingOutPlan(plan);
    try {
      const { data, error } = await supabase.functions.invoke("textiq-create-checkout", {
        body: {
          plan,
          successUrl: `${window.location.origin}${TEXTIQ.routes.pricing}?checkout=success`,
          cancelUrl: `${window.location.origin}${TEXTIQ.routes.pricing}?checkout=cancel`,
        },
      });
      if (error) throw error;
      if (data?.error === "not_configured" || data?.error === "invalid_plan_or_not_configured") {
        toast({
          title: "El pago con tarjeta llega muy pronto",
          description: "Mientras tanto escríbenos por WhatsApp o email y activamos tu plan a mano.",
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("no_checkout_url");
    } catch (e) {
      console.error(e);
      toast({ title: "No se ha podido iniciar el pago", description: "Escríbenos y lo activamos manualmente.", variant: "destructive" });
    } finally {
      setCheckingOutPlan(null);
    }
  };

  useEffect(() => {
    if (session && pendingPlan) {
      const plan = pendingPlan;
      setPendingPlan(null);
      refreshUsage();
      startCheckout(plan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, pendingPlan]);

  const handleChoosePlan = (plan: PlanId) => {
    if (plan === "free") {
      window.location.href = TEXTIQ.routes.app;
      return;
    }
    if (plan === "agency") {
      window.location.href = `mailto:${TEXTIQ.contactEmail}?subject=Textiq%20AI%20-%20Plan%20Agencia`;
      return;
    }
    if (!session) {
      setPendingPlan(plan);
      setAuthOpen(true);
      return;
    }
    startCheckout(plan);
  };

  return (
    <div className="min-h-screen bg-tq-cream textiq-scope">
      <TextiqNavbar />
      <main className="pt-32 pb-24">
        <div className="container-narrow">
          <SectionHeader eyebrow="Precios" title="Un plan para cada tamaño de negocio" subtitle="Sin permanencia. Cambia o cancela cuando quieras." />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {PLAN_ORDER.map((id, i) => {
              const plan = PLANS[id];
              const isCurrent = usage?.plan === id;
              return (
                <div
                  key={id}
                  className={`reveal rounded-2xl p-7 border-2 flex flex-col ${
                    plan.highlight ? "border-tq-terracotta bg-tq-black text-tq-sand shadow-[var(--shadow-tq)] md:-translate-y-2" : "border-tq-sand/30 bg-white"
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  {plan.highlight && (
                    <span className="self-start mb-3 text-[11px] uppercase tracking-widest bg-tq-terracotta text-white px-3 py-1 rounded-full font-semibold">
                      Más popular
                    </span>
                  )}
                  <h3 className={`font-display text-2xl mb-1 ${plan.highlight ? "text-tq-sand" : "text-tq-black"}`}>{plan.name}</h3>
                  <div className="mb-4">
                    {plan.priceMonthly === null ? (
                      <span className={`text-2xl font-display ${plan.highlight ? "text-tq-terracotta" : "text-tq-black"}`}>A medida</span>
                    ) : (
                      <>
                        <span className={`text-4xl font-display ${plan.highlight ? "text-tq-terracotta" : "text-tq-black"}`}>{plan.priceMonthly}€</span>
                        <span className={plan.highlight ? "text-tq-sand/60" : "text-muted-foreground"}> /mes</span>
                      </>
                    )}
                  </div>
                  <ul className={`space-y-2 text-sm mb-6 flex-1 ${plan.highlight ? "text-tq-sand/80" : "text-muted-foreground"}`}>
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className={plan.highlight ? "text-tq-terracotta" : "text-tq-black"}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.highlight ? "terracotta" : "outline-terracotta"}
                    className={!plan.highlight ? "border-tq-black text-tq-black hover:bg-tq-black hover:text-tq-sand" : ""}
                    disabled={checkingOutPlan === id}
                    onClick={() => handleChoosePlan(id)}
                  >
                    {isCurrent
                      ? "Tu plan actual"
                      : checkingOutPlan === id
                        ? "Redirigiendo…"
                        : id === "free"
                          ? "Empezar gratis"
                          : id === "agency"
                            ? "Contactar"
                            : `Pasar a ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-muted-foreground text-sm mt-12 max-w-xl mx-auto">
            ¿Prefieres gestionarlo a mano mientras activamos el pago con tarjeta? Escríbenos a{" "}
            <a href={`mailto:${TEXTIQ.contactEmail}`} className="text-tq-terracotta hover:underline">{TEXTIQ.contactEmail}</a>.
          </p>
        </div>
      </main>
      <TextiqFooter />
      <TextiqAuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
