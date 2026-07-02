import { useEffect, useState } from "react";
import NovaTempoNavbar from "@/components/novatempo/NovaTempoNavbar";
import NovaTempoFooter from "@/components/novatempo/NovaTempoFooter";
import NovaTempoAuthDialog from "@/components/novatempo/NovaTempoAuthDialog";
import NovaTempoVisualizer from "@/components/novatempo/NovaTempoVisualizer";
import SectionHeader from "@/components/site/SectionHeader";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { applySeo } from "@/lib/seo";
import { NOVATEMPO } from "@/lib/novatempo/brand";
import { useNovaTempoSession } from "@/hooks/use-novatempo-session";
import { supabase } from "@/integrations/supabase/client";

export default function NovaTempoApp() {
  useReveal();
  const { session, checkingSession, deviceId, usage, usageLoading, refreshUsage } = useNovaTempoSession();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    applySeo({
      title: `App | ${NOVATEMPO.name}`,
      description: NOVATEMPO.claim,
      path: NOVATEMPO.routes.app,
      noIndex: true,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NovaTempoNavbar />
      <main className="pt-32 pb-24 bg-navy">
        <div className="container-narrow">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <SectionHeader eyebrow="Herramienta" title="Genera tu visualización" light center={false} />
            <div className="pt-2">
              {checkingSession ? null : session ? (
                <div className="text-right text-cream/70 text-sm">
                  <div>{session.user.email}</div>
                  <button
                    type="button"
                    onClick={() => supabase.auth.signOut()}
                    className="text-gold hover:underline text-xs"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Button variant="outline-cream" size="sm" onClick={() => setAuthOpen(true)}>
                  Entrar / Crear cuenta
                </Button>
              )}
            </div>
          </div>

          <div className="reveal mt-12">
            <NovaTempoVisualizer
              deviceId={deviceId}
              isLoggedIn={!!session}
              usage={usage}
              usageLoading={usageLoading}
              onUsageChange={refreshUsage}
              onRequireAuth={() => setAuthOpen(true)}
            />
          </div>
        </div>
      </main>
      <NovaTempoFooter />
      <NovaTempoAuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
