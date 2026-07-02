import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TEXTIQ } from "@/lib/textiq/brand";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function TextiqAuthDialog({ open, onOpenChange }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pwd,
          options: {
            emailRedirectTo: `${window.location.origin}${TEXTIQ.routes.app}`,
            data: { business_name: businessName },
          },
        });
        if (error) throw error;
        toast({ title: "Cuenta creada", description: "Ya puedes usar tu plan gratuito. Revisa tu email si necesitas confirmarlo." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error de autenticación";
      toast({ title: "No se ha podido continuar", description: message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-navy-deep border-gold/30 text-cream">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-cream">
            {mode === "signup" ? `Crea tu cuenta en ${TEXTIQ.short}` : "Entra en tu cuenta"}
          </DialogTitle>
          <p className="text-cream/60 text-sm">
            {mode === "signup" ? "Empieza gratis, sin tarjeta." : "Accede para ver tu plan y tu uso."}
          </p>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3 mt-2">
          {mode === "signup" && (
            <div>
              <Label className="text-cream/80 text-xs">Nombre del negocio (opcional)</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej. Tapicería García"
                className="mt-1 bg-navy/50 border-cream/20 text-cream"
              />
            </div>
          )}
          <div>
            <Label className="text-cream/80 text-xs">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="mt-1 bg-navy/50 border-cream/20 text-cream"
            />
          </div>
          <div>
            <Label className="text-cream/80 text-xs">Contraseña</Label>
            <Input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              minLength={8}
              className="mt-1 bg-navy/50 border-cream/20 text-cream"
            />
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={busy}>
            {busy ? "..." : mode === "signup" ? "Crear cuenta gratis" : "Entrar"}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="text-xs text-cream/60 hover:text-gold w-full text-center"
          >
            {mode === "signup" ? "¿Ya tienes cuenta? Entra" : "¿No tienes cuenta? Crea una gratis"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
