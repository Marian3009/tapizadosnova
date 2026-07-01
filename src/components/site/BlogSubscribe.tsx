import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Introduce un email válido").max(255),
});

export default function BlogSubscribe() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "already" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setState("loading");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("blog-subscribe", {
        body: { email: parsed.data.email, source: "blog_page" },
      });
      if (fnErr) throw fnErr;
      if ((data as any)?.already_subscribed) setState("already");
      else setState("ok");
      setEmail("");
    } catch (err: any) {
      setState("error");
      setError("No hemos podido procesar tu suscripción. Inténtalo de nuevo.");
    }
  }

  if (state === "ok" || state === "already") {
    return (
      <div className="rounded-2xl bg-cream border border-gold/20 p-8 text-center">
        <CheckCircle2 className="mx-auto text-gold mb-3" size={36} />
        <h3 className="font-display text-2xl text-navy mb-2">
          {state === "already" ? "Ya estás suscrito" : "¡Casi listo!"}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {state === "already"
            ? "Ya recibes nuestras novedades del blog en tu email."
            : "Te hemos enviado un email para confirmar tu suscripción. Revisa tu bandeja de entrada."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-cream border border-navy/10 p-8">
      <div className="flex items-center gap-3 mb-3">
        <Mail className="text-gold" size={22} />
        <h3 className="font-display text-2xl text-navy">Recibe nuestras novedades</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-5">
        Suscríbete y te avisaremos por email cada vez que publiquemos un nuevo
        artículo con consejos e inspiración sobre tapicería.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="flex-1"
          aria-label="Tu email"
        />
        <Button type="submit" variant="gold" disabled={state === "loading"}>
          {state === "loading" ? "Enviando…" : "Suscribirme"}
        </Button>
      </form>
      {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      <p className="text-xs text-muted-foreground mt-4">
        Sin spam. Puedes darte de baja en cualquier momento.
      </p>
    </div>
  );
}
