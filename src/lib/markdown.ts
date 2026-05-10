// Minimal, dependency-free markdown to HTML for blog content.
// Supports: H1-H3, paragraphs, bold, italic, links, unordered + ordered lists.
function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s: string) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-gold underline hover:text-navy">$1</a>');
}

export function markdownToHtml(md: string): string {
  if (!md) return "";
  const lines = escape(md).split(/\r?\n/);
  const out: string[] = [];
  let inUl = false, inOl = false, paraBuf: string[] = [];

  const flushPara = () => {
    if (paraBuf.length) {
      out.push(`<p>${inline(paraBuf.join(" "))}</p>`);
      paraBuf = [];
    }
  };
  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flushPara(); closeLists(); continue; }

    let m;
    if ((m = line.match(/^###\s+(.*)$/))) { flushPara(); closeLists(); out.push(`<h3>${inline(m[1])}</h3>`); continue; }
    if ((m = line.match(/^##\s+(.*)$/)))  { flushPara(); closeLists(); out.push(`<h2>${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^#\s+(.*)$/)))   { flushPara(); closeLists(); out.push(`<h2>${inline(m[1])}</h2>`); continue; }

    if ((m = line.match(/^[-*]\s+(.*)$/))) {
      flushPara();
      if (!inUl) { closeLists(); out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(m[1])}</li>`); continue;
    }
    if ((m = line.match(/^\d+\.\s+(.*)$/))) {
      flushPara();
      if (!inOl) { closeLists(); out.push("<ol>"); inOl = true; }
      out.push(`<li>${inline(m[1])}</li>`); continue;
    }

    closeLists();
    paraBuf.push(line);
  }
  flushPara(); closeLists();
  return out.join("\n");
}
