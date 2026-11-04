// Blocs <-> HTML : un seul éditeur pour le journal et les chapitres.
import { mediaUrl } from "@/lib/api";

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const ytId = (url = "") => { const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ""; };

// **gras** et *italique* -> HTML (texte échappé d'abord)
export const inlineMd = (t = "") => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/\n/g, "<br/>");
const paras = (t = "") => String(t).split(/\n{2,}/).filter((p) => p.trim()).map((p) => `<p>${inlineMd(p)}</p>`).join("");
const cap = (c) => (c ? `<figcaption>${esc(c)}</figcaption>` : "");

export function blocksToHtml(blocks = []) {
  return blocks.map((b) => {
    switch (b.type) {
      case "text": return paras(b.text);
      case "heading": return b.text ? `<h2>${esc(b.text)}</h2>` : "";
      case "quote": return b.text ? `<blockquote><p>${inlineMd(b.text)}</p>${b.author ? `<cite>— ${esc(b.author)}</cite>` : ""}</blockquote>` : "";
      case "image": return b.url ? `<figure class="jr-fig${b.wide ? " wide" : ""}"><img src="${esc(mediaUrl(b.url))}" class="sx-rich-img" alt=""/>${cap(b.caption)}</figure>` : "";
      case "sketch": return b.url ? `<figure class="jr-sketch"><span class="tape"></span><img src="${esc(mediaUrl(b.url))}" alt=""/>${cap(b.caption)}</figure>` : "";
      case "gallery": return (b.urls || []).length ? `<figure class="jr-gal"><div class="g">${b.urls.map((u) => `<img src="${esc(mediaUrl(u))}" alt=""/>`).join("")}</div>${cap(b.caption)}</figure>` : "";
      case "youtube": { const id = ytId(b.url); return id ? `<figure class="jr-yt"><div class="r"><iframe src="https://www.youtube.com/embed/${id}" allowfullscreen loading="lazy"></iframe></div>${cap(b.caption)}</figure>` : ""; }
      case "music": { const t = esc(b.caption || "Musique"); return b.url ? `<p class="jr-music-p"><span class="sx-music-cue" contenteditable="false" data-track="${esc(mediaUrl(b.url))}" data-title="${t}">${t}</span></p>` : ""; }
      default: return "";
    }
  }).join("");
}

// HTML existant (ancien éditeur) -> blocs
const toMd = (node) => {
  let out = "";
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) out += n.textContent;
    else if (n.nodeName === "BR") out += "\n";
    else if (/^(B|STRONG)$/.test(n.nodeName)) out += `**${toMd(n)}**`;
    else if (/^(I|EM)$/.test(n.nodeName)) out += `*${toMd(n)}*`;
    else if (n.nodeName === "LI") out += `• ${toMd(n)}\n`;
    else if (!(n.classList && n.classList.contains("sx-music-cue"))) out += toMd(n);
  });
  return out;
};
const k = () => Math.random().toString(36).slice(2);

export function htmlToBlocks(html = "") {
  if (!html.trim()) return [{ type: "text", text: "", _k: k() }];
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const blocks = [];
  const pushText = (t) => {
    if (!t.trim()) return;
    const last = blocks[blocks.length - 1];
    if (last && last.type === "text") last.text += `\n\n${t.trim()}`; else blocks.push({ type: "text", text: t.trim(), _k: k() });
  };
  const src = (img) => img.getAttribute("src") || "";
  const caption = (el) => el.querySelector("figcaption")?.textContent || "";
  doc.body.firstChild.childNodes.forEach((n) => {
    if (n.nodeType === 3) return pushText(n.textContent);
    if (n.nodeType !== 1) return;
    const cls = n.classList;
    if (/^H[1-6]$/.test(n.nodeName)) return blocks.push({ type: "heading", text: n.textContent, _k: k() });
    if (n.nodeName === "BLOCKQUOTE") return blocks.push({ type: "quote", text: toMd(n.querySelector("p") || n).trim(), author: (n.querySelector("cite")?.textContent || "").replace(/^—\s*/, ""), _k: k() });
    if (n.nodeName === "FIGURE") {
      if (cls.contains("jr-gal")) return blocks.push({ type: "gallery", urls: [...n.querySelectorAll("img")].map(src), caption: caption(n), _k: k() });
      if (cls.contains("jr-sketch")) return blocks.push({ type: "sketch", url: src(n.querySelector("img") || n), caption: caption(n), _k: k() });
      if (cls.contains("jr-yt")) return blocks.push({ type: "youtube", url: n.querySelector("iframe")?.getAttribute("src") || "", caption: caption(n), _k: k() });
      const img = n.querySelector("img");
      if (img) return blocks.push({ type: "image", url: src(img), wide: cls.contains("wide"), caption: caption(n), _k: k() });
    }
    if (n.nodeName === "IMG") return blocks.push({ type: "image", url: src(n), _k: k() });
    if (n.nodeName === "IFRAME" && ytId(n.getAttribute("src"))) return blocks.push({ type: "youtube", url: n.getAttribute("src"), _k: k() });
    // paragraphe : images et repères musicaux qu'il contient deviennent des blocs
    n.querySelectorAll?.("img").forEach((img) => blocks.push({ type: "image", url: src(img), _k: k() }));
    const cues = [...(n.querySelectorAll?.(".sx-music-cue") || [])];
    if (cls?.contains("sx-music-cue")) cues.push(n);
    pushText(toMd(n));
    cues.forEach((c) => blocks.push({ type: "music", url: c.getAttribute("data-track") || "", caption: c.getAttribute("data-title") || "Musique", _k: k() }));
  });
  return blocks.length ? blocks : [{ type: "text", text: "", _k: k() }];
}
