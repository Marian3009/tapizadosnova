import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { applySeo } from "@/lib/seo";

type Status = "loading" | "valid" | "already" | "invalid" | "done" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    applySeo({
      title: "Cancelar suscripción | Tapizados Nova",
      description: "Gestiona tus preferencias de comunicación y cancela la suscripción a los correos de Tapizados Nova en un solo clic.",
      path: "/unsubscribe",
      noIndex: true,
    });
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
    fetch(url, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) return setStatus("invalid");
        if (data.valid) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    setBusy(false);
    if (error) return setStatus("error");
    if (data?.success) setStatus("done");
    else if (data?.reason === "already_unsubscribed") setStatus("already");
    else setStatus("error");
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-16">
      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] max-w-md w-full p-8 md:p-10 text-center">
        <h1 className="font-display text-2xl text-navy mb-4">Cancelar suscripción</h1>

        {status === "loading" && <p className="text-muted-foreground">Verificando enlace…</p>}

        {status === "valid" && (
          <>
            <p className="text-foreground/80 mb-6">
              ¿Confirmas que deseas dejar de recibir correos de Tapizados Nova?
            </p>
            <Button variant="gold" size="lg" onClick={confirm} disabled={busy} className="w-full">
              {busy ? "Procesando…" : "Confirmar cancelación"}
            </Button>
          </>
        )}

        {status === "done" && (
          <p className="text-foreground/80">Has sido dado de baja correctamente. No volverás a recibir correos.</p>
        )}

        {status === "already" && (
          <p className="text-foreground/80">Esta dirección ya estaba dada de baja.</p>
        )}

        {status === "invalid" && (
          <p className="text-foreground/80">El enlace no es válido o ha expirado.</p>
        )}

        {status === "error" && (
          <p className="text-foreground/80">No se pudo procesar la solicitud. Inténtalo de nuevo más tarde.</p>
        )}

        <Link to="/" className="inline-block mt-8 text-sm text-gold hover:underline">
          Volver a la web
        </Link>
      </div>
    </main>
  );
}
