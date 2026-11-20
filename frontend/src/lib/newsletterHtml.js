import { posterUrl, mediaUrl } from "@/lib/api";
import { THEMES as LOOKS, THEME_INFO as LOOK_INFO } from "@/data/alexandrie/looks";
/*
  L'email de la newsletter, composé ici : le même HTML sert à l'aperçu du studio et à l'envoi.
  Des tableaux et des styles en ligne, parce que les messageries (Gmail, Outlook, Apple Mail) n'acceptent que ça.
  %%UNSUB%% est remplacé par le serveur par le lien de désinscription de chaque abonné.
*/
const BASE = {
  nuit: { t: "Nuit", info: "Sobre, sombre, la station", bg: "#0b0c10", card: "#14161c", ink: "#f1f2f5", soft: "#b7bcc8", line: "#262a33", acc: "#7fb2ff", btnInk: "#0b0c10", head: "Georgia,'Times New Roman',serif" },
  papier: { t: "Papier", info: "Clair, une lettre qu'on lit", bg: "#ece6d6", card: "#f7f3e8", ink: "#151311", soft: "#4a4540", line: "#d6cdb8", acc: "#b3261e", btnInk: "#ffffff", head: "Georgia,'Times New Roman',serif" },
  neon: { t: "Néon", info: "Nuit urbaine, rose et cyan", bg: "#07060d", card: "#110d1c", ink: "#f3eefe", soft: "#c3b8de", line: "#2b2140", acc: "#ff3fa4", btnInk: "#12020b", head: "Arial Black,Arial,sans-serif" },
};
// Les ambiances d'Alexandrie (gothique, washi, presse, cosmos…) deviennent aussi des habillages de lettre
const lum = (h = "#000") => { const n = parseInt(h.slice(1), 16); const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
const cap = (k) => k.charAt(0).toUpperCase() + k.slice(1);
export const NL_THEMES = { ...BASE, ...Object.fromEntries(Object.entries(LOOKS).filter(([k]) => !BASE[k]).map(([k, v]) => [k, {
  t: cap(k), info: LOOK_INFO[k] || "", alex: true, bg: v.p3, card: v.p, ink: v.ink, soft: v.ink2, line: v.p2, acc: v.acc, btnInk: lum(v.acc) > 0.6 ? "#111111" : "#ffffff",
  head: `'${v.d}',Georgia,'Times New Roman',serif`, font: v.d, orn: v.orn,
}])) };
export const NL_BLOCKS = [["heading", "Titre"], ["text", "Texte"], ["image", "Image"], ["oeuvre", "Une œuvre"], ["button", "Bouton"], ["divider", "Séparateur"]];

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (u = "") => { if (!u) return ""; const m = mediaUrl(u); try { return new URL(m, window.location.origin).href; } catch (_) { return m; } };
// texte : paragraphes séparés par une ligne vide, **gras**, *italique*, et les liens collés deviennent cliquables
const rich = (t = "", c) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>").replace(/(https?:\/\/[^\s<]+)/g, `<a href="$1" style="color:${c.acc}">$1</a>`);
const site = () => window.location.origin;

function block(b, c, creations) {
  const pad = "padding:0 32px";
  switch (b.type) {
    case "heading": return `<tr><td style="${pad};padding-top:26px;font-family:${c.head};font-size:${b.size === "s" ? 20 : 28}px;line-height:1.2;font-weight:bold;color:${c.ink}">${esc(b.t)}</td></tr>`;
    case "text": return (b.t || "").split(/\n\s*\n/).map((p) => `<tr><td style="${pad};padding-top:14px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:${c.soft}">${rich(p, c).replace(/\n/g, "<br>")}</td></tr>`).join("");
    case "image": { if (!b.url) return ""; const img = `<img src="${esc(abs(b.url))}" width="536" alt="${esc(b.caption || "")}" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:6px">`; return `<tr><td style="${pad};padding-top:22px">${b.link ? `<a href="${esc(b.link)}">${img}</a>` : img}${b.caption ? `<p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:13px;color:${c.soft}">${esc(b.caption)}</p>` : ""}</td></tr>`; }
    case "oeuvre": {
      const o = creations.find((x) => x.id === b.id); if (!o) return "";
      const url = `${site()}/oeuvre/${o.id}`; const img = o.has_poster ? abs(posterUrl(o.id, o.updated_at, 480)) : "";
      return `<tr><td style="${pad};padding-top:22px"><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${c.line};border-radius:8px;background:${c.bg}"><tr>
        ${img ? `<td width="150" valign="top" style="padding:14px"><a href="${url}"><img src="${esc(img)}" width="130" alt="" style="display:block;width:130px;height:auto;border:0;border-radius:4px"></a></td>` : ""}
        <td valign="top" style="padding:16px 16px 16px ${img ? 4 : 16}px;font-family:Arial,Helvetica,sans-serif">
          <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${c.acc}">${esc(b.kicker || "Sur la station")}</p>
          <p style="margin:6px 0 0;font-family:${c.head};font-size:22px;line-height:1.2;font-weight:bold;color:${c.ink}">${esc(o.title)}</p>
          ${o.tagline || o.synopsis ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:${c.soft}">${esc((b.t || o.tagline || o.synopsis || "").slice(0, 220))}</p>` : ""}
          <p style="margin:14px 0 0"><a href="${url}" style="display:inline-block;padding:10px 18px;background:${c.acc};color:${c.btnInk};font-weight:bold;font-size:14px;text-decoration:none;border-radius:4px">${esc(b.label || "Entrer dans l'univers")}</a></p>
        </td></tr></table></td></tr>`;
    }
    case "button": return b.url ? `<tr><td align="${b.align || "left"}" style="${pad};padding-top:22px"><a href="${esc(b.url)}" style="display:inline-block;padding:13px 24px;background:${c.acc};color:${c.btnInk};font-family:Arial,sans-serif;font-weight:bold;font-size:15px;text-decoration:none;border-radius:4px">${esc(b.label || "Découvrir")}</a></td></tr>` : "";
    case "divider": return c.orn
      ? `<tr><td align="center" style="${pad};padding-top:24px;font-family:Georgia,serif;font-size:18px;letter-spacing:12px;color:${c.acc}">${c.orn} ${c.orn} ${c.orn}</td></tr>`
      : `<tr><td style="${pad};padding-top:26px"><div style="height:1px;background:${c.line};line-height:1px;font-size:1px">&nbsp;</div></td></tr>`;
    default: return "";
  }
}

export function newsletterHtml(n, creations = []) {
  const c = NL_THEMES[n.theme] || NL_THEMES.nuit;
  const body = (n.blocks || []).map((b) => block(b, c, creations)).join("");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(n.subject || "Station Nexus")}</title>${c.font ? `<link href="https://fonts.googleapis.com/css2?family=${c.font.replace(/ /g, "+")}&display=swap" rel="stylesheet">` : ""}</head>
<body style="margin:0;padding:0;background:${c.bg}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(n.preheader || "")}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};padding:28px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${c.card};border-radius:10px;overflow:hidden">
<tr><td style="padding:26px 32px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:4px;color:${c.acc}"><a href="${site()}" style="color:${c.acc};text-decoration:none">STATION NEXUS</a></td></tr>
${body}
<tr><td style="padding:34px 32px 28px"><div style="border-top:1px solid ${c.line};padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${c.soft}">Tu reçois cet email parce que tu es abonné·e à la newsletter de Station Nexus.<br><a href="%%UNSUB%%" style="color:${c.soft}">Se désinscrire en un clic</a> · <a href="${site()}" style="color:${c.soft}">Ouvrir la station</a></div></td></tr>
</table></td></tr></table></body></html>`;
}
