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
import BlogAdmin from "@/components/site/BlogAdmin";
import AgentAdmin from "@/components/site/AgentAdmin";
import { applySeo } from "@/lib/seo";

type FabricCategory = "basico" | "antimanchas" | "terciopelo" | "premium";
type Fabric = { id: string; nombre: string; categoria: FabricCategory; color: string; imagen: string; descripcion: string };
type GalleryItem = { id: string; titulo: string; categoria: string; imagen: string };
type Testimonio = { id: string; nombre: string; ciudad: string; texto: string; estrellas: number; activo: boolean };

const CATEGORIES: { value: FabricCategory; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "antimanchas", label: "Anti manchas" },
  { value: "terciopelo", label: "Terciopelo" },
  { value: "premium", label: "Lino y Premium" },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    applySeo({
      title: "Panel de administración | Tapizados Nova",
      description: "Área privada de gestión de Tapizados Nova: contenidos del blog, catálogo de telas, galería, testimonios y configuración del sitio.",
      path: "/admin",
      noIndex: true,
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setIsAdmin(false);
        setChecking(false);
      } else {
        // Defer role check to avoid deadlock
        setTimeout(async () => {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", s.user.id)
            .eq("role", "admin")
            .maybeSingle();
          setIsAdmin(!error && !!data);
          setChecking(false);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!s) setChecking(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pwd,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Pide a un admin que te asigne permisos.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err?.message || "Error de autenticación");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center text-cream">
        Cargando…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <form onSubmit={submitLogin} className="w-full max-w-sm bg-cream rounded-xl p-8 shadow-xl">
          <h1 className="font-display text-2xl text-navy mb-1">Panel de administración</h1>
          <p className="text-sm text-muted-foreground mb-6">Tapizados Nova</p>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 mb-3" required autoFocus />
          <Label>Contraseña</Label>
          <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1" required minLength={8} />
          <Button type="submit" variant="gold" className="w-full mt-5" disabled={busy}>
            {busy ? "..." : mode === "signin" ? "Entrar" : "Crear cuenta"}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs text-muted-foreground mt-3 w-full text-center hover:underline"
          >
            {mode === "signin" ? "¿No tienes cuenta? Crear cuenta" : "¿Ya tienes cuenta? Entrar"}
          </button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-cream rounded-xl p-8 shadow-xl text-center">
          <h1 className="font-display text-2xl text-navy mb-2">Acceso denegado</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Tu cuenta ({session.user.email}) no tiene permisos de administrador.
          </p>
          <Button variant="outline" onClick={logout}>Cerrar sesión</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy text-cream py-5 px-6 flex items-center justify-between">
        <h1 className="font-display text-xl text-gold">Tapizados Nova · Admin</h1>
        <Button variant="outline-cream" size="sm" onClick={logout}>
          Cerrar sesión
        </Button>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="presupuestos">
          <TabsList className="mb-6 flex flex-wrap h-auto">
            <TabsTrigger value="presupuestos">Presupuestos</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="catalogo">Tejidos</TabsTrigger>
            <TabsTrigger value="galeria">Galería</TabsTrigger>
            <TabsTrigger value="testimonios">Testimonios</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="agente">Agente IA</TabsTrigger>
          </TabsList>

          <TabsContent value="presupuestos"><BudgetsAdmin /></TabsContent>
          <TabsContent value="blog"><BlogAdmin /></TabsContent>
          <TabsContent value="catalogo"><FabricsAdmin /></TabsContent>
          <TabsContent value="galeria"><GalleryAdmin /></TabsContent>
          <TabsContent value="testimonios"><TestimoniosAdmin /></TabsContent>
          <TabsContent value="faq"><FaqAdmin /></TabsContent>
          <TabsContent value="config"><ConfigAdmin /></TabsContent>
          <TabsContent value="agente"><AgentAdmin /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* -------------------- Presupuestos -------------------- */
function BudgetsAdmin() {
  const [list, setList] = useState<SavedBudget[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tn_budgets");
      if (raw) setList(JSON.parse(raw));
    } catch { /* */ }
  }, []);

  const persist = (next: SavedBudget[]) => {
    setList(next);
    localStorage.setItem("tn_budgets", JSON.stringify(next));
  };

  const setEstado = (numero: string, estado: SavedBudget["estado"]) => {
    persist(list.map((b) => b.numero === numero ? { ...b, estado } : b));
  };

  const remove = (numero: string) => persist(list.filter((b) => b.numero !== numero));

  const downloadPdf = (b: SavedBudget) => {
    const iva = +(b.base * 0.21).toFixed(2);
    const total = +(b.base + iva).toFixed(2);
    const doc = generateBudgetPdf({
      cliente: b.cliente, modalidad: b.modalidad, muebleLabel: b.muebleLabel,
      telaLabel: b.telaLabel, tejidoNombre: b.tejidoNombre, metraje: b.metraje,
      unidades: b.unidades, base: b.base, iva, total, anticipo: +(total/2).toFixed(2),
      iban: getSettings().iban || "Consultar con el taller", numero: b.numero, fecha: b.fecha,
    });
    doc.save(`${b.numero}.pdf`);
  };

  const colorEstado = (e: SavedBudget["estado"]) =>
    e === "pendiente" ? "bg-amber-100 text-amber-800" :
    e === "contactado" ? "bg-blue-100 text-blue-800" :
    "bg-green-100 text-green-800";

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <h2 className="font-display text-xl text-navy mb-4">Presupuestos recibidos ({list.length})</h2>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no se ha generado ningún presupuesto.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left border-b">
              <tr className="text-navy">
                <th className="py-2 pr-3">Nº</th>
                <th className="pr-3">Cliente</th>
                <th className="pr-3">Mueble</th>
                <th className="pr-3">Tela</th>
                <th className="pr-3">Total</th>
                <th className="pr-3">Fecha</th>
                <th className="pr-3">Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.numero} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-mono text-xs">{b.numero}</td>
                  <td className="pr-3">
                    <div className="font-medium text-navy">{b.cliente.nombre}</div>
                    <div className="text-xs text-muted-foreground">{b.cliente.email}</div>
                  </td>
                  <td className="pr-3">{b.muebleLabel}</td>
                  <td className="pr-3">{b.telaLabel}</td>
                  <td className="pr-3 font-semibold">{b.total.toLocaleString("es-ES")} €</td>
                  <td className="pr-3">{b.fecha}</td>
                  <td className="pr-3">
                    <button
                      className={`text-xs px-2 py-1 rounded ${colorEstado(b.estado)}`}
                      onClick={() => {
                        const next = b.estado === "pendiente" ? "contactado" : b.estado === "contactado" ? "confirmado" : "pendiente";
                        setEstado(b.numero, next);
                      }}
                    >
                      {b.estado}
                    </button>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(b)}>PDF</Button>
                    <Button size="sm" variant="destructive" className="ml-2" onClick={() => remove(b.numero)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* -------------------- Tejidos -------------------- */
function FabricsAdmin() {
  const [list, setList] = useState<Fabric[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Fabric, "id">>({
    nombre: "", categoria: "basico", color: "#c6a564", imagen: "", descripcion: "",
  });

  useEffect(() => {
    try {
      const r = localStorage.getItem("tn_fabrics");
      if (r) setList(JSON.parse(r));
    } catch { /* */ }
  }, []);

  const persist = (next: Fabric[]) => { setList(next); localStorage.setItem("tn_fabrics", JSON.stringify(next)); };
  const reset = () => { setEditingId(null); setForm({ nombre: "", categoria: "basico", color: "#c6a564", imagen: "", descripcion: "" }); };
  const onFile = async (f?: File) => { if (!f) return; const data = await fileToDataUrl(f); setForm((p) => ({ ...p, imagen: data })); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return toast.error("Nombre obligatorio");
    if (!form.imagen) return toast.error("Sube una imagen del tejido");
    if (editingId) {
      persist(list.map((it) => it.id === editingId ? { ...form, id: editingId } : it));
      toast.success("Tejido actualizado");
    } else {
      persist([...list, { ...form, id: crypto.randomUUID() }]);
      toast.success("Tejido añadido");
    }
    reset();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-display text-xl text-navy">{editingId ? "Editar tejido" : "Añadir tejido"}</h2>
        <div>
          <Label>Nombre *</Label>
          <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} maxLength={80} />
        </div>
        <div>
          <Label>Categoría</Label>
          <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as FabricCategory })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Color principal</Label>
            <div className="flex gap-2 mt-1">
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-14 h-10 p-1" />
              <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Imagen</Label>
            <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="mt-1" />
          </div>
        </div>
        {form.imagen && <img src={form.imagen} alt="preview" className="h-24 w-24 object-cover rounded border" />}
        <div>
          <Label>Descripción corta</Label>
          <Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} maxLength={100} rows={2} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="gold">{editingId ? "Guardar cambios" : "Añadir"}</Button>
          {editingId && <Button type="button" variant="outline" onClick={reset}>Cancelar</Button>}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-display text-xl text-navy mb-4">Tejidos en catálogo ({list.length})</h2>
        {list.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay tejidos.</p> : (
          <ul className="divide-y">
            {list.map((f) => (
              <li key={f.id} className="py-3 flex items-center gap-3">
                <img src={f.imagen} alt={f.nombre} className="h-12 w-12 rounded object-cover border" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy truncate">{f.nombre}</div>
                  <div className="text-xs text-muted-foreground">{CATEGORIES.find(c => c.value === f.categoria)?.label}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setEditingId(f.id); const { id, ...rest } = f; setForm(rest); }}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => persist(list.filter((x) => x.id !== f.id))}>Eliminar</Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* -------------------- Galería -------------------- */
function GalleryAdmin() {
  const [list, setList] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState<Omit<GalleryItem, "id">>({ titulo: "", categoria: "Sofás", imagen: "" });

  useEffect(() => {
    try {
      const r = localStorage.getItem("tn_gallery");
      if (r) setList(JSON.parse(r));
    } catch { /* */ }
  }, []);

  const persist = (next: GalleryItem[]) => { setList(next); localStorage.setItem("tn_gallery", JSON.stringify(next)); };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imagen || !form.titulo.trim()) return toast.error("Título e imagen obligatorios");
    persist([...list, { ...form, id: crypto.randomUUID() }]);
    setForm({ titulo: "", categoria: "Sofás", imagen: "" });
    toast.success("Foto añadida");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={add} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-display text-xl text-navy">Añadir trabajo</h2>
        <div>
          <Label>Título</Label>
          <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        </div>
        <div>
          <Label>Categoría</Label>
          <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Sofás","Sillas","Cabeceros","Fundas","Otros"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Imagen</Label>
          <Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const data = await fileToDataUrl(f); setForm((p) => ({ ...p, imagen: data })); }} />
        </div>
        {form.imagen && <img src={form.imagen} className="h-32 w-32 object-cover rounded border" alt="" />}
        <Button type="submit" variant="gold">Añadir a la galería</Button>
      </form>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-display text-xl text-navy mb-4">Galería ({list.length})</h2>
        {list.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay fotos.</p> : (
          <div className="grid grid-cols-2 gap-3">
            {list.map((g) => (
              <div key={g.id} className="relative group rounded overflow-hidden border">
                <img src={g.imagen} alt={g.titulo} className="aspect-square object-cover w-full" />
                <div className="absolute bottom-0 inset-x-0 bg-navy/80 text-cream text-xs p-2">
                  <div className="font-medium truncate">{g.titulo}</div>
                  <div className="text-cream/70">{g.categoria}</div>
                </div>
                <button onClick={() => persist(list.filter((x) => x.id !== g.id))} className="absolute top-2 right-2 bg-destructive text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">Eliminar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- Testimonios -------------------- */
function TestimoniosAdmin() {
  const [list, setList] = useState<Testimonio[]>([]);
  const [form, setForm] = useState<Omit<Testimonio, "id">>({ nombre: "", ciudad: "", texto: "", estrellas: 5, activo: true });

  useEffect(() => {
    try { const r = localStorage.getItem("tn_testimonios"); if (r) setList(JSON.parse(r)); } catch { /* */ }
  }, []);

  const persist = (next: Testimonio[]) => { setList(next); localStorage.setItem("tn_testimonios", JSON.stringify(next)); };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.texto) return toast.error("Nombre y texto obligatorios");
    persist([...list, { ...form, id: crypto.randomUUID() }]);
    setForm({ nombre: "", ciudad: "", texto: "", estrellas: 5, activo: true });
    toast.success("Testimonio añadido");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={add} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-display text-xl text-navy">Añadir testimonio</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
          <div><Label>Ciudad</Label><Input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} /></div>
        </div>
        <div><Label>Texto</Label><Textarea value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })} rows={3} /></div>
        <div>
          <Label>Estrellas (1-5)</Label>
          <Input type="number" min={1} max={5} value={form.estrellas} onChange={(e) => setForm({ ...form, estrellas: Math.min(5, Math.max(1, +e.target.value || 5)) })} />
        </div>
        <Button type="submit" variant="gold">Añadir</Button>
      </form>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-display text-xl text-navy mb-4">Testimonios ({list.length})</h2>
        {list.length === 0 ? <p className="text-sm text-muted-foreground">Sin testimonios.</p> : (
          <ul className="space-y-3">
            {list.map((t) => (
              <li key={t.id} className="border rounded p-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-medium text-navy">{t.nombre} · <span className="text-xs text-muted-foreground">{t.ciudad}</span></div>
                    <div className="text-gold text-xs">{"★".repeat(t.estrellas)}{"☆".repeat(5 - t.estrellas)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => persist(list.map((x) => x.id === t.id ? { ...x, activo: !x.activo } : x))}>
                      {t.activo ? "Ocultar" : "Mostrar"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => persist(list.filter((x) => x.id !== t.id))}>Eliminar</Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">"{t.texto}"</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* -------------------- FAQ -------------------- */
function FaqAdmin() {
  const [list, setList] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [form, setForm] = useState<Omit<FaqItem, "id">>({ q: "", a: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    try { const r = localStorage.getItem("tn_faqs"); if (r) setList(JSON.parse(r)); } catch { /* */ }
  }, []);

  const persist = (next: FaqItem[]) => { setList(next); localStorage.setItem("tn_faqs", JSON.stringify(next)); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.q || !form.a) return toast.error("Pregunta y respuesta obligatorias");
    if (editingId) {
      persist(list.map((x) => x.id === editingId ? { ...form, id: editingId } : x));
      toast.success("FAQ actualizada");
    } else {
      persist([...list, { ...form, id: crypto.randomUUID() }]);
      toast.success("FAQ añadida");
    }
    setForm({ q: "", a: "" }); setEditingId(null);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-display text-xl text-navy">{editingId ? "Editar pregunta" : "Añadir pregunta"}</h2>
        <div><Label>Pregunta</Label><Input value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} /></div>
        <div><Label>Respuesta</Label><Textarea rows={4} value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })} /></div>
        <div className="flex gap-2">
          <Button type="submit" variant="gold">{editingId ? "Guardar" : "Añadir"}</Button>
          {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ q: "", a: "" }); }}>Cancelar</Button>}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-display text-xl text-navy mb-4">Preguntas ({list.length})</h2>
        <ul className="space-y-3">
          {list.map((f) => (
            <li key={f.id} className="border-b border-gold/20 pb-3">
              <div className="flex justify-between gap-2">
                <div className="font-medium text-navy text-sm">{f.q}</div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(f.id); setForm({ q: f.q, a: f.a }); }}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => persist(list.filter((x) => x.id !== f.id))}>X</Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{f.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------- Configuración -------------------- */
function ConfigAdmin() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => { setS(getSettings()); }, []);

  const save = () => { saveSettings(s); toast.success("Configuración guardada"); };

  const field = (k: keyof Settings, label: string, isTextarea = false) => (
    <div>
      <Label>{label}</Label>
      {isTextarea ? (
        <Textarea value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} className="mt-1" rows={2} />
      ) : (
        <Input value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} className="mt-1" />
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-4">
      <h2 className="font-display text-xl text-navy">Configuración general</h2>
      {field("iban", "IBAN para transferencias")}
      {field("phone", "Teléfono")}
      {field("email", "Email")}
      {field("address", "Dirección completa", true)}
      {field("hours", "Horarios")}
      {field("instagram", "Enlace Instagram")}
      {field("whatsapp", "Enlace WhatsApp (https://wa.me/...)")}
      <Button variant="gold" onClick={save}>Guardar cambios</Button>
    </div>
  );
}
