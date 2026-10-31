import { fontHref } from "@/lib/themeStore";

// Styles de documents (« Actuel » = rendu d'origine, inchangé)
export const DOC_STYLES = [
  { key: "actuel", name: "Actuel" },
  { key: "editorial", name: "Éditorial", ft: "Playfair Display", fb: "Cormorant Garamond", bg: "#f7f2e8", ink: "#1d1a16", ac: "#a3342b", mu: "#8a7f70", deco: "drop" },
  { key: "suisse", name: "Minimal suisse", ft: "Manrope", fb: "Manrope", bg: "#ffffff", ink: "#111111", ac: "#e5251f", mu: "#8b8b8b", deco: "rule" },
  { key: "neon", name: "Nuit néon", ft: "Unbounded", fb: "Outfit", bg: "#0b0618", ink: "#efe9ff", ac: "#ff2a6d", ac2: "#05d9e8", mu: "#9a8fc0", deco: "glow" },
  { key: "manuscrit", name: "Manuscrit", ft: "Cinzel", fb: "Cormorant Garamond", bg: "#efe3c8", ink: "#2b2116", ac: "#7a4b1e", mu: "#8d7757", deco: "frame" },
  { key: "kyoto", name: "Kyoto", ft: "Shippori Mincho", fb: "Zen Kaku Gothic New", bg: "#f4efe6", ink: "#231f1c", ac: "#c0392b", mu: "#9a8f84", deco: "seal" },
  { key: "hud", name: "Cyber HUD", ft: "Chakra Petch", fb: "Rajdhani", bg: "#05080a", ink: "#d8ffe9", ac: "#3dff9a", mu: "#5f8f78", deco: "hud" },
  { key: "magazine", name: "Magazine", ft: "Bebas Neue", fb: "Manrope", bg: "#fffdf6", ink: "#0e0e0e", ac: "#ffcc00", mu: "#6d6d6d", deco: "block" },
  { key: "aurore", name: "Aurore", ft: "Sora", fb: "Sora", bg: "#fbf7ff", ink: "#1e1830", ac: "#8a5cff", ac2: "#ff8fb1", mu: "#8a83a0", deco: "grad" },
  { key: "foret", name: "Forêt d'or", ft: "Marcellus", fb: "Manrope", bg: "#0d1a14", ink: "#e9efe6", ac: "#d6b25e", mu: "#8ea596", deco: "frame" },
  { key: "brut", name: "Brutaliste", ft: "Space Grotesk", fb: "IBM Plex Mono", bg: "#e9e9e4", ink: "#000000", ac: "#000000", mu: "#555555", deco: "brut" },
  { key: "galaxie", name: "Galaxie", ft: "Michroma", fb: "Exo 2", bg: "#060a1c", ink: "#e6ecff", ac: "#4fd6ff", ac2: "#8a5cff", mu: "#7d8ab8", deco: "glow" },
  { key: "tengoku", name: "Tengoku", ft: "Shippori Mincho", fb: "Outfit", bg: "#0a0609", ink: "#ffeef3", ac: "#ff2f5f", ac2: "#ffc4d4", mu: "#b58a97", deco: "seal" },
];
export const DOC_FORMATS = [["a4", "Document A4"], ["slides", "Diaporama 16:9"], ["web", "Page web"], ["mood", "Moodboard"]];
export const styleOf = (k) => DOC_STYLES.find((s) => s.key === k) || DOC_STYLES[0];
export const docFonts = () => fontHref(DOC_STYLES.flatMap((s) => [s.ft, s.fb]).filter(Boolean));
export const styleVars = (s) => (s.bg ? { "--dz-bg": s.bg, "--dz-ink": s.ink, "--dz-ac": s.ac, "--dz-ac2": s.ac2 || s.ac, "--dz-mu": s.mu, "--dz-ft": `"${s.ft}",serif`, "--dz-fb": `"${s.fb}",serif` } : {});
export const varsCss = (s) => Object.entries(styleVars(s)).map(([k, v]) => `${k}:${v}`).join(";");

// Découpe le contenu en sections (une par grand titre ou séparateur) pour diapos et moodboard
export function sections(html = "") {
  const body = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html").body.firstChild;
  const out = []; let cur = null;
  for (const n of [...body.childNodes]) {
    const tag = n.nodeName;
    if (tag === "H1" || tag === "H2" || tag === "HR" || !cur) { cur = { title: tag === "H1" || tag === "H2" ? n.textContent : "", html: "" }; out.push(cur); if (tag === "H1" || tag === "H2" || tag === "HR") continue; }
    cur.html += n.outerHTML || (n.textContent.trim() ? `<p>${n.textContent}</p>` : "");
  }
  return out.filter((s) => s.title || s.html.replace(/<[^>]+>/g, "").trim() || /<img/.test(s.html));
}

// Feuille de style partagée : éditeur, aperçu et PDF
export const DOC_CSS = `
.dz{--dz-bg:var(--bg-secondary,#fff);--dz-ink:var(--text-primary,#111);--dz-ac:var(--brand,#333);--dz-ac2:var(--brand-2,#555);--dz-mu:var(--text-secondary,#777);--dz-ft:var(--font-display,serif);--dz-fb:var(--font-body,serif)}
.dz{background:var(--dz-bg);color:var(--dz-ink);font-family:var(--dz-fb);}
.dz h1,.dz h2,.dz h3,.dz .dz-title,.dz .at-ed-title{font-family:var(--dz-ft)!important;color:var(--dz-ink)!important;letter-spacing:-.01em}
.dz p,.dz li{font-family:var(--dz-fb);font-size:1.06em;line-height:1.75;color:var(--dz-ink)}
.dz a{color:var(--dz-ac)}
.dz blockquote{border-left:3px solid var(--dz-ac);margin:1.4em 0;padding:.3em 0 .3em 1.2em;font-size:1.25em;font-style:italic;color:var(--dz-ink)}
.dz hr{border:0;height:1px;background:linear-gradient(90deg,transparent,var(--dz-ac),transparent);margin:2.4em 0}
.dz img{border-radius:6px;max-width:100%}
.dz .dz-eye,.dz .at-eyebrow{color:var(--dz-ac)!important;letter-spacing:.24em;font-family:var(--dz-fb)}
.dz h2{border:0;padding-bottom:.2em}
.dz[data-deco=drop] .dz-body>p:first-of-type::first-letter,.dz[data-deco=drop] .ProseMirror>p:first-of-type::first-letter,.dz[data-deco=drop] [contenteditable]>p:first-of-type::first-letter{float:left;font-family:var(--dz-ft);font-size:4.2em;line-height:.8;padding:.06em .1em 0 0;color:var(--dz-ac)}
.dz[data-deco=rule] h2{border-top:4px solid var(--dz-ac);padding-top:.5em}
.dz[data-deco=glow] h1,.dz[data-deco=glow] h2,.dz[data-deco=glow] .dz-title{text-shadow:0 0 24px color-mix(in srgb,var(--dz-ac) 55%,transparent);background:linear-gradient(90deg,var(--dz-ac),var(--dz-ac2));-webkit-background-clip:text;background-clip:text;color:transparent!important}
.dz[data-deco=frame]{box-shadow:inset 0 0 0 10px var(--dz-bg),inset 0 0 0 11px var(--dz-ac)}
.dz[data-deco=frame] h2{text-align:center;font-variant:small-caps}
.dz[data-deco=seal] h2::before{content:"";display:inline-block;width:.55em;height:.55em;background:var(--dz-ac);border-radius:2px;margin-right:.5em;vertical-align:.12em}
.dz[data-deco=hud] h2{text-transform:uppercase;letter-spacing:.12em;border-left:3px solid var(--dz-ac);padding-left:.6em}
.dz[data-deco=hud] h2::after{content:" //";color:var(--dz-ac)}
.dz[data-deco=block] h1,.dz[data-deco=block] .dz-title{text-transform:uppercase;font-size:3.4em;line-height:.92}
.dz[data-deco=block] h2{display:inline-block;background:var(--dz-ac);padding:.05em .35em;text-transform:uppercase}
.dz[data-deco=grad] h2{background:linear-gradient(90deg,var(--dz-ac),var(--dz-ac2));-webkit-background-clip:text;background-clip:text;color:transparent!important}
.dz[data-deco=brut] h2{border:3px solid var(--dz-ink);padding:.2em .5em;display:inline-block;box-shadow:5px 5px 0 var(--dz-ink)}
.dz-cover{position:relative;min-height:46vh;display:flex;flex-direction:column;justify-content:flex-end;padding:8% 7%;background:var(--dz-bg) center/cover;color:var(--dz-ink);overflow:hidden}
.dz-cover.img{color:#fff}.dz-cover.img::before{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.78),rgba(0,0,0,.1) 70%)}
.dz-cover>*{position:relative}
.dz-cover .dz-title{font-size:clamp(34px,6vw,76px);line-height:1;margin:.15em 0 .2em}
.dz-cover.img .dz-title{color:#fff!important;-webkit-text-fill-color:#fff}
.dz-body{max-width:760px;margin:0 auto;padding:6% 7%}
.f-a4{max-width:820px;margin:0 auto;box-shadow:0 30px 80px -30px #000}
.f-web .dz-cover{min-height:70vh}
.f-web .dz-body{max-width:720px;font-size:1.08em}
.dz-slides{display:grid;gap:28px}
.dz-slide{position:relative;aspect-ratio:16/9;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:5% 7%;box-shadow:0 20px 60px -24px #000;border-radius:10px}
.dz-slide h2{font-size:2.6em;margin:0 0 .4em}
.dz-slide .dz-sb{font-size:1.25em;columns:auto 22em;column-gap:2em}
.dz-slide img{max-height:52%;object-fit:cover;width:auto}
.dz-slide .dz-num{position:absolute;right:3%;bottom:4%;font-size:.8em;color:var(--dz-mu);letter-spacing:.2em}
.dz-slide.cover{justify-content:flex-end}
.dz-mood{columns:3 260px;column-gap:16px;padding:4%}
.dz-tile{break-inside:avoid;margin:0 0 16px;padding:22px;border-radius:12px;background:color-mix(in srgb,var(--dz-ink) 6%,var(--dz-bg));border:1px solid color-mix(in srgb,var(--dz-ink) 12%,transparent)}
.dz-tile.pic{padding:0;overflow:hidden}.dz-tile.pic img{display:block;width:100%;border-radius:0}
.dz-tile.ttl{background:var(--dz-ac);color:var(--dz-bg)}.dz-tile.ttl h2,.dz-tile.ttl .dz-title{color:var(--dz-bg)!important;-webkit-text-fill-color:var(--dz-bg);margin:0;font-size:2em;background:none}
.dz-tile h2{font-size:1.4em;margin:0 0 .4em}
`;
