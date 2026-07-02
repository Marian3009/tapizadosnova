import { useEffect, useState } from "react";
import TextiqNavbar from "@/components/textiq/TextiqNavbar";
import TextiqFooter from "@/components/textiq/TextiqFooter";
import TextiqAuthDialog from "@/components/textiq/TextiqAuthDialog";
import TextiqVisualizer from "@/components/textiq/TextiqVisualizer";
import SectionHeader from "@/components/site/SectionHeader";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { applySeo } from "@/lib/seo";
import { TEXTIQ } from "@/lib/textiq/brand";
import { useTextiqSession } from "@/hooks/use-textiq-session";
import { supabase } from "@/integrations/supabase/client";

export default function TextiqApp() {
  useReveal();
  const { session, checkingSession, deviceId, usage, usageLoading, refreshUsage } = useTextiqSession();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    applySeo({
      title: `App | ${TEXTIQ.name}`,
      description: TEXTIQ.claim,
      path: TEXTIQ.routes.app,
      noIndex: true,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TextiqNavbar />
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
            <TextiqVisualizer
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
      <TextiqFooter />
      <TextiqAuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
