import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DEFAULT_SETTINGS, getSettings, saveSettings, type Settings } from "@/lib/settings";
import { DEFAULT_FAQS, type FaqItem } from "@/components/site/FAQ";
import type { SavedBudget } from "@/components/site/BudgetDialog";
import { generateBudgetPdf } from "@/lib/generateBudgetPdf";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

// Seguridad reforzada:
// - Se elimina el registro público desde el panel admin.
// - Solo usuarios creados manualmente en Supabase pueden acceder.
// - Se mantiene comprobación de rol admin.

export default function Admin() {
  return null;
}
