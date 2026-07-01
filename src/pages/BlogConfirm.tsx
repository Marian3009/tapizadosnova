import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BlogHeader from "@/components/site/BlogHeader";
import Footer from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function BlogConfirm() {
  const [params] = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setState("error"); return; }
    supabase.functions
      .invoke("blog-subscribe-confirm", { body: { token } })
      .then(({ data, error }) => {
        if (error || !(data as any)?.ok) { setState("error"); return; }
        setEmail((data as any).email ?? null);
        setState("ok");
      })
      .catch(() => setState("error"));
  }, [params]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BlogHeader />
      <main className="flex-1 flex items-center justify-center section-padding">
        <div className="container-narrow max-w-lg text-center">
          {state === "loading" && (
            <>
              <Loader2 className="mx-auto animate-spin text-gold mb-4" size={40} />
              <p className="text-muted-foreground">Confirmando tu suscripción…</p>
            </>
          )}
          {state === "ok" && (
            <>
              <CheckCircle2 className="mx-auto text-gold mb-4" size={48} />
              <h1 className="font-display text-3xl md:text-4xl text-navy mb-3">
                ¡Suscripción confirmada!
              </h1>
              <p className="text-muted-foreground mb-6">
                {email ? <>Hemos confirmado <strong>{email}</strong>. </> : null}
                Te avisaremos por email cuando publiquemos un nuevo artículo en el blog.
              </p>
              <Button asChild variant="gold"><Link to="/blog">Ver el blog</Link></Button>
            </>
          )}
          {state === "error" && (
            <>
              <XCircle className="mx-auto text-destructive mb-4" size={48} />
              <h1 className="font-display text-3xl md:text-4xl text-navy mb-3">
                Enlace no válido
              </h1>
              <p className="text-muted-foreground mb-6">
                El enlace de confirmación no es válido o ha caducado. Vuelve a suscribirte desde el blog.
              </p>
              <Button asChild variant="gold"><Link to="/blog">Volver al blog</Link></Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
