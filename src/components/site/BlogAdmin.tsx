import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BLOG_CATEGORIES } from "@/lib/blogCategories";

type Status = "draft" | "scheduled" | "published";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  tags: string[];
  featured_image_url: string | null;
  featured_image_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: Status;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface BlogIdea {
  id: string;
  week_number: number;
  title: string;
  category: string;
  notes: string | null;
  status: "pending" | "generated" | "published" | "skipped";
  generated_post_id: string | null;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").slice(0, 80);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Tapicería" as string,
  tags: "" as string,
  featured_image_url: "",
  featured_image_alt: "",
  seo_title: "",
  seo_description: "",
  status: "draft" as Status,
  published_at: "",
};

export default function BlogAdmin() {
  return (
    <Tabs defaultValue="posts">
      <TabsList className="mb-4">
        <TabsTrigger value="posts">Artículos</TabsTrigger>
        <TabsTrigger value="ideas">Generador semanal</TabsTrigger>
      </TabsList>
      <TabsContent value="posts"><PostsManager /></TabsContent>
      <TabsContent value="ideas"><IdeasManager /></TabsContent>
    </Tabs>
  );
}

/* ---------------- Posts ---------------- */
function PostsManager() {
  const [list, setList] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setList((data as BlogPost[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setEditingId(null); setForm({ ...EMPTY_FORM }); };

  const startEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      content: p.content ?? "",
      category: p.category,
      tags: (p.tags ?? []).join(", "),
      featured_image_url: p.featured_image_url ?? "",
      featured_image_alt: p.featured_image_alt ?? "",
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
      status: p.status,
      published_at: p.published_at ? p.published_at.slice(0, 16) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onImage = async (f?: File) => {
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) return toast.error("Imagen demasiado pesada (máx 1.5MB)");
    const data = await fileToDataUrl(f);
    setForm((p) => ({ ...p, featured_image_url: data }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Título obligatorio");
    setBusy(true);
    try {
      const slug = (form.slug.trim() || slugify(form.title));
      const payload = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        content: form.content,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        featured_image_url: form.featured_image_url || null,
        featured_image_alt: form.featured_image_alt || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        status: form.status,
        published_at:
          form.status === "published" && !form.published_at
            ? new Date().toISOString()
            : form.published_at
              ? new Date(form.published_at).toISOString()
              : null,
      };
      if (editingId) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Artículo actualizado");
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        toast.success("Artículo creado");
      }
      reset();
      load();
    } catch (err: any) {
      toast.error(err.message || "Error guardando");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminado");
    load();
  };

  const setStatus = async (p: BlogPost, status: Status) => {
    const update: any = { status };
    if (status === "published" && !p.published_at) update.published_at = new Date().toISOString();
    const { error } = await supabase.from("blog_posts").update(update).eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  const statusBadge = (s: Status) =>
    s === "draft" ? "bg-amber-100 text-amber-800" :
    s === "scheduled" ? "bg-blue-100 text-blue-800" :
    "bg-green-100 text-green-800";

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-display text-xl text-navy">{editingId ? "Editar artículo" : "Nuevo artículo"}</h2>

        <div>
          <Label>Título *</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={140} />
        </div>
        <div>
          <Label>Slug (opcional)</Label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="se genera del título" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Categoría</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOG_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estado</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="scheduled">Programado</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Fecha de publicación (programado/publicado)</Label>
          <Input type="datetime-local" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
        </div>

        <div>
          <Label>Etiquetas (separadas por coma)</Label>
          <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>

        <div>
          <Label>Extracto</Label>
          <Textarea rows={2} maxLength={200} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </div>

        <div>
          <Label>Contenido (Markdown)</Label>
          <Textarea rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="font-mono text-sm" />
          <p className="text-xs text-muted-foreground mt-1">Usa ## para subtítulos H2, listas con - y enlaces [texto](url).</p>
        </div>

        <div>
          <Label>Imagen destacada</Label>
          <Input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} />
          <Input className="mt-2" placeholder="o pega una URL" value={form.featured_image_url.startsWith("data:") ? "" : form.featured_image_url} onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })} />
          {form.featured_image_url && <img src={form.featured_image_url} alt="" className="mt-2 h-32 rounded border object-cover" />}
        </div>
        <div>
          <Label>Texto alternativo de la imagen</Label>
          <Input value={form.featured_image_alt} onChange={(e) => setForm({ ...form, featured_image_alt: e.target.value })} />
        </div>

        <div className="border-t pt-4 space-y-3">
          <h3 className="font-display text-navy">SEO</h3>
          <div>
            <Label>Meta title</Label>
            <Input maxLength={70} value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
          </div>
          <div>
            <Label>Meta description</Label>
            <Textarea rows={2} maxLength={170} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="gold" disabled={busy}>{busy ? "Guardando…" : (editingId ? "Guardar cambios" : "Crear artículo")}</Button>
          {editingId && <Button type="button" variant="outline" onClick={reset}>Cancelar</Button>}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-display text-xl text-navy mb-4">Artículos ({list.length})</h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay artículos.</p>
        ) : (
          <ul className="divide-y">
            {list.map((p) => (
              <li key={p.id} className="py-3">
                <div className="flex items-start gap-3">
                  {p.featured_image_url && (
                    <img src={p.featured_image_url} alt="" className="w-16 h-16 rounded object-cover border shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${statusBadge(p.status)}`}>{p.status}</span>
                      <span className="text-xs text-muted-foreground">{p.category}</span>
                    </div>
                    <div className="font-medium text-navy mt-1 truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground truncate">/blog/{p.slug}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Editar</Button>
                  {p.status !== "published" && (
                    <Button size="sm" variant="gold" onClick={() => setStatus(p, "published")}>Publicar</Button>
                  )}
                  {p.status === "published" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(p, "draft")}>Despublicar</Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">Ver</a>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>Eliminar</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Ideas / generator ---------------- */
function IdeasManager() {
  const [list, setList] = useState<BlogIdea[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [autoBusy, setAutoBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("blog_ideas").select("*").order("week_number");
    setList((data as BlogIdea[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const generate = async (idea: BlogIdea) => {
    setBusyId(idea.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: { title: idea.title, category: idea.category, idea_id: idea.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Borrador generado. Revísalo en la pestaña Artículos.");
      load();
    } catch (e: any) {
      toast.error(e.message || "Error generando");
    } finally {
      setBusyId(null);
    }
  };

  const runAuto = async (publish: boolean) => {
    const msg = publish
      ? "Esto generará y PUBLICARÁ directamente la siguiente idea pendiente, y enviará un aviso a tapizadosnova@gmail.com. ¿Continuar?"
      : "Esto generará un BORRADOR de la siguiente idea pendiente (no se publicará). Recibirás un aviso en tapizadosnova@gmail.com para revisarlo. ¿Continuar?";
    if (!confirm(msg)) return;
    const secret = prompt("Introduce el secret de automatización (BLOG_AUTOMATION_SECRET):");
    if (!secret) return;
    setAutoBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("weekly-blog-publish", {
        body: { publish },
        headers: { "x-automation-secret": secret },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.message) {
        toast.info(data.message);
      } else if (data?.mode === "draft") {
        toast.success(`Borrador creado: ${data?.post?.title || "artículo"}. Revísalo en Artículos.`);
      } else {
        toast.success(`Publicado: ${data?.post?.title || "artículo"}`);
      }
      load();
    } catch (e: any) {
      toast.error(e.message || "Error en la automatización");
    } finally {
      setAutoBusy(false);
    }
  };

  const skip = async (id: string) => {
    await supabase.from("blog_ideas").update({ status: "skipped" }).eq("id", id);
    load();
  };
  const reopen = async (id: string) => {
    await supabase.from("blog_ideas").update({ status: "pending", generated_post_id: null }).eq("id", id);
    load();
  };

  const statusBadge = (s: BlogIdea["status"]) =>
    s === "pending" ? "bg-amber-100 text-amber-800" :
    s === "generated" ? "bg-blue-100 text-blue-800" :
    s === "published" ? "bg-green-100 text-green-800" :
    "bg-gray-100 text-gray-700";

  return (
    <div className="space-y-6">
      <div className="bg-navy text-cream rounded-lg p-5 md:p-6">
        <h2 className="font-display text-xl text-gold mb-2">🤖 Publicación automática semanal</h2>
        <p className="text-sm text-cream/80 leading-relaxed">
          Cada <strong>lunes a las 09:00 (hora de Madrid, ±1h por horario de verano)</strong>,
          el sistema toma la siguiente idea pendiente, genera el artículo con IA, lo publica en el blog
          y envía un aviso a <strong>tapizadosnova@gmail.com</strong>.
        </p>
        <p className="text-xs text-cream/60 mt-3">
          También puedes lanzarla manualmente para probar — usará la siguiente idea pendiente y te pedirá el secret de automatización.
        </p>
        <Button
          variant="gold"
          size="sm"
          className="mt-4"
          onClick={runAutoPublish}
          disabled={autoBusy}
        >
          {autoBusy ? "Ejecutando…" : "Ejecutar publicación ahora"}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl text-navy">Ideas semanales · Calendario editorial</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cada semana tienes una idea preparada. La automatización publica directamente la siguiente <strong>pending</strong>.
            También puedes <strong>generar un borrador</strong> manualmente para revisar antes de publicar.
          </p>
        </div>

      <ul className="divide-y">
        {list.map((idea) => (
          <li key={idea.id} className="py-3 flex items-start gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-full bg-navy text-cream flex items-center justify-center font-display text-sm shrink-0">
              S{idea.week_number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${statusBadge(idea.status)}`}>{idea.status}</span>
                <span className="text-xs text-muted-foreground">{idea.category}</span>
              </div>
              <div className="font-medium text-navy">{idea.title}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              {idea.status === "pending" && (
                <>
                  <Button size="sm" variant="gold" disabled={busyId === idea.id} onClick={() => generate(idea)}>
                    {busyId === idea.id ? "Generando…" : "Generar borrador"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => skip(idea.id)}>Saltar</Button>
                </>
              )}
              {idea.status === "generated" && (
                <Button size="sm" variant="outline" onClick={() => reopen(idea.id)}>Regenerar</Button>
              )}
              {idea.status === "skipped" && (
                <Button size="sm" variant="outline" onClick={() => reopen(idea.id)}>Reabrir</Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
