import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BLOG_CATEGORIES } from "@/lib/blogCategories";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").slice(0, 80);
}

interface Parsed {
  fileName: string;
  title: string;
  excerpt: string;
  content: string; // markdown
}

// Extract frontmatter (--- title: ... ---) from markdown
function parseMarkdown(raw: string, fileName: string): Parsed {
  let title = fileName.replace(/\.(md|markdown)$/i, "");
  let excerpt = "";
  let content = raw;

  const fm = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (fm) {
    const block = fm[1];
    const t = block.match(/^title:\s*(.+)$/m);
    const e = block.match(/^(excerpt|description|summary):\s*(.+)$/m);
    if (t) title = t[1].trim().replace(/^["']|["']$/g, "");
    if (e) excerpt = e[2].trim().replace(/^["']|["']$/g, "");
    content = raw.slice(fm[0].length);
  } else {
    // First # heading as title
    const h1 = content.match(/^#\s+(.+)$/m);
    if (h1) {
      title = h1[1].trim();
      content = content.replace(h1[0], "").trimStart();
    }
  }
  if (!excerpt) {
    const firstPara = content.split(/\n\s*\n/).find((p) => p.trim() && !p.startsWith("#"));
    if (firstPara) excerpt = firstPara.replace(/[#*_`>]/g, "").trim().slice(0, 180);
  }
  return { fileName, title: title.slice(0, 140), excerpt: excerpt.slice(0, 180), content: content.trim() };
}

async function parseDocx(file: File): Promise<Parsed> {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });
  // Lightweight HTML → Markdown
  let md = html
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return parseMarkdown(md, file.name);
}

export default function BlogImporter() {
  const [items, setItems] = useState<Parsed[]>([]);
  const [category, setCategory] = useState<string>("Tapicería");
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const parsed: Parsed[] = [];
    for (const f of Array.from(files)) {
      try {
        const name = f.name.toLowerCase();
        if (name.endsWith(".md") || name.endsWith(".markdown") || name.endsWith(".txt")) {
          const text = await f.text();
          parsed.push(parseMarkdown(text, f.name));
        } else if (name.endsWith(".docx")) {
          parsed.push(await parseDocx(f));
        } else {
          toast.error(`${f.name}: formato no soportado (usa .md o .docx)`);
        }
      } catch (e: any) {
        toast.error(`${f.name}: ${e.message || "error al leer"}`);
      }
    }
    setItems((prev) => [...prev, ...parsed]);
  };

  const updateItem = (i: number, patch: Partial<Parsed>) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const importAll = async (status: "draft" | "published") => {
    if (items.length === 0) return toast.error("No hay archivos para importar");
    setBusy(true);
    try {
      const rows = items.map((it) => ({
        title: it.title.trim(),
        slug: `${slugify(it.title)}-${Math.random().toString(36).slice(2, 6)}`,
        excerpt: it.excerpt.trim() || null,
        content: it.content,
        category,
        tags: [],
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        seo_title: it.title.trim().slice(0, 60),
        seo_description: it.excerpt.trim().slice(0, 160) || null,
      }));
      const { error } = await supabase.from("blog_posts").insert(rows);
      if (error) throw error;
      toast.success(`${rows.length} artículo(s) importado(s) como ${status === "draft" ? "borrador" : "publicado"}`);
      setItems([]);
    } catch (e: any) {
      toast.error(e.message || "Error importando");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-5">
      <div>
        <h2 className="font-display text-xl text-navy">Importar artículos desde archivos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sube uno o varios archivos <strong>.md</strong>, <strong>.markdown</strong>, <strong>.txt</strong> o <strong>.docx</strong>.
          El título se toma del frontmatter <code>title:</code> o del primer <code># Heading</code>. Revisa cada
          artículo antes de importar.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Archivos</Label>
          <Input
            type="file"
            multiple
            accept=".md,.markdown,.txt,.docx"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
        <div>
          <Label>Categoría para todos</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BLOG_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="gold" disabled={busy} onClick={() => importAll("draft")}>
              {busy ? "Importando…" : `Importar ${items.length} como borrador`}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => importAll("published")}>
              Importar y publicar directamente
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => setItems([])}>Limpiar</Button>
          </div>

          <ul className="divide-y border rounded-md">
            {items.map((it, i) => (
              <li key={i} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground truncate">{it.fileName}</span>
                  <Button size="sm" variant="ghost" onClick={() => removeItem(i)}>Quitar</Button>
                </div>
                <div>
                  <Label className="text-xs">Título</Label>
                  <Input value={it.title} onChange={(e) => updateItem(i, { title: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Extracto</Label>
                  <Input value={it.excerpt} onChange={(e) => updateItem(i, { excerpt: e.target.value })} />
                </div>
                <details className="text-xs">
                  <summary className="cursor-pointer text-navy">Ver contenido ({it.content.length} chars)</summary>
                  <pre className="mt-2 max-h-48 overflow-auto bg-cream p-3 rounded whitespace-pre-wrap font-mono">
                    {it.content.slice(0, 2000)}{it.content.length > 2000 ? "\n…" : ""}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
