import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type FabricCategory = "basico" | "antimanchas" | "terciopelo" | "premium";
type Fabric = { id: string; nombre: string; categoria: FabricCategory; color: string; imagen: string; descripcion: string };

const CATEGORIES: { value: FabricCategory; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "antimanchas", label: "Anti manchas" },
  { value: "terciopelo", label: "Terciopelo" },
  { value: "premium", label: "Lino y Premium" },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("tn_admin") === "1") setAuthed(true);
    document.title = "Admin · Tapizados Nova";
  }, []);

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === "admin2024") {
      sessionStorage.setItem("tn_admin", "1");
      setAuthed(true);
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <form onSubmit={submitLogin} className="w-full max-w-sm bg-cream rounded-xl p-8 shadow-xl">
          <h1 className="font-display text-2xl text-navy mb-1">Panel de administración</h1>
          <p className="text-sm text-muted-foreground mb-6">Tapizados Nova</p>
          <Label>Contraseña</Label>
          <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1" autoFocus />
          <Button type="submit" variant="gold" className="w-full mt-5">Entrar</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy text-cream py-5 px-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-gold">Tapizados Nova · Admin</h1>
        </div>
        <Button
          variant="outline-cream"
          size="sm"
          onClick={() => { sessionStorage.removeItem("tn_admin"); setAuthed(false); }}
        >Cerrar sesión</Button>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <Tabs defaultValue="catalogo">
          <TabsList className="mb-6">
            <TabsTrigger value="catalogo">Catálogo de tejidos</TabsTrigger>
            <TabsTrigger value="iban">Configuración IBAN</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogo"><FabricsAdmin /></TabsContent>
          <TabsContent value="iban"><IbanAdmin /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

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

  const persist = (next: Fabric[]) => {
    setList(next);
    localStorage.setItem("tn_fabrics", JSON.stringify(next));
  };

  const reset = () => {
    setEditingId(null);
    setForm({ nombre: "", categoria: "basico", color: "#c6a564", imagen: "", descripcion: "" });
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    const data = await fileToDataUrl(f);
    setForm((p) => ({ ...p, imagen: data }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error("Nombre obligatorio"); return; }
    if (!form.imagen) { toast.error("Sube una imagen del tejido"); return; }
    if (editingId) {
      persist(list.map((it) => it.id === editingId ? { ...form, id: editingId } : it));
      toast.success("Tejido actualizado");
    } else {
      persist([...list, { ...form, id: crypto.randomUUID() }]);
      toast.success("Tejido añadido");
    }
    reset();
  };

  const edit = (f: Fabric) => {
    setEditingId(f.id);
    const { id, ...rest } = f;
    setForm(rest);
  };

  const remove = (id: string) => {
    persist(list.filter((f) => f.id !== id));
    if (editingId === id) reset();
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
        {form.imagen && (
          <img src={form.imagen} alt="preview" className="h-24 w-24 object-cover rounded border" />
        )}
        <div>
          <Label>Descripción corta</Label>
          <Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} maxLength={100} rows={2} />
          <p className="text-xs text-muted-foreground mt-1">{form.descripcion.length}/100</p>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="gold">{editingId ? "Guardar cambios" : "Añadir al catálogo"}</Button>
          {editingId && <Button type="button" variant="outline" onClick={reset}>Cancelar</Button>}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-display text-xl text-navy mb-4">Tejidos en catálogo ({list.length})</h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay tejidos.</p>
        ) : (
          <ul className="divide-y">
            {list.map((f) => (
              <li key={f.id} className="py-3 flex items-center gap-3">
                <img src={f.imagen} alt={f.nombre} className="h-12 w-12 rounded object-cover border" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy truncate">{f.nombre}</div>
                  <div className="text-xs text-muted-foreground capitalize">{CATEGORIES.find(c => c.value === f.categoria)?.label}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => edit(f)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(f.id)}>Eliminar</Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function IbanAdmin() {
  const [iban, setIban] = useState("");
  useEffect(() => { setIban(localStorage.getItem("tn_iban") || ""); }, []);
  const save = () => {
    localStorage.setItem("tn_iban", iban.trim());
    toast.success("IBAN guardado correctamente");
  };
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-xl">
      <h2 className="font-display text-xl text-navy mb-4">Configuración bancaria</h2>
      <Label>IBAN para transferencias bancarias</Label>
      <Input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="ES00 0000 0000 0000 0000 0000" className="mt-1 font-mono" />
      <p className="text-xs text-muted-foreground mt-2">Este IBAN aparecerá en los presupuestos PDF generados desde la web.</p>
      <Button variant="gold" className="mt-5" onClick={save}>Guardar IBAN</Button>
    </div>
  );
}
