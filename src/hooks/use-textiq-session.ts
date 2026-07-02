import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/textiq/deviceId";

export interface TextiqUsage {
  plan: "free" | "pro" | "business" | "agency";
  limit: number;
  used: number;
  businessName: string | null;
  authenticated: boolean;
}

export function useTextiqSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const deviceId = useMemo(() => getDeviceId(), []);
  const [usage, setUsage] = useState<TextiqUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const refreshUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("textiq-usage", {
        body: { deviceId },
      });
      if (!error && data && !data.error) setUsage(data as TextiqUsage);
    } catch (e) {
      console.error("refreshUsage error", e);
    } finally {
      setUsageLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setCheckingSession(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage, session]);

  return { session, checkingSession, deviceId, usage, usageLoading, refreshUsage };
}
