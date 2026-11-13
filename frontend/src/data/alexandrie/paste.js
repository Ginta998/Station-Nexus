// Livres collés : un bloc de texte (réglages en tête, puis les chapitres) devient un volume d'Alexandrie,
// sans passer par le code. Le même format sert à modifier un livre existant et à exporter ses livres.
import { ROOMS, TYPES, BOOKS, parseBook } from "./index";
import { THEMES, TEXTURES, hasLook } from "./looks";

export const SEP = /^\s*={5,}\s*$/m; // plusieurs livres collés d'un coup, séparés par une ligne de =====
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

const KEYS = {
  titre: "title", "sous-titre": "sub", "sous titre": "sub", salle: "room", genre: "type", format: "format", cote: "cote",
  embleme: "emblem", couleur: "color", steamgrid: "art", steamgriddb: "art", artwork: "art", artworks: "art", theme: "theme",
  police: "d", "police titre": "d", "police des titres": "d", "police texte": "r", "police lecture": "r", "police de lecture": "r",
  papier: "p", tranche: "p2", ombre: "p3", encre: "ink", "encre 2": "ink2", accent: "acc", ornement: "orn", texture: "tex",
  statut: "status", auteur: "author", par: "author", "a propos": "about", resume: "about", lien: "link", liens: "link",
  couverture: "cover", "createurs": "credits", credits: "credits",
};
const ROOM_ALIAS = { philosophie: "philo", cinema: "cinema", litterature: "lettres", "mes livres": "atelier", mathematiques: "sciences", "lore & mondes": "lore", "art & illustration": "art", illustration: "art" };
const roomOf = (v) => { const n = norm(v); return ROOMS.find((r) => r.key === n || norm(r.label) === n)?.key || ROOM_ALIAS[n] || ROOMS.find((r) => n && norm(r.label).startsWith(n))?.key || ""; };
const typeOf = (v) => { const n = norm(v); return Object.keys(TYPES).find((k) => k === n || norm(TYPES[k].label) === n) || ""; };
const fmtOf = (v) => { const n = norm(v); return /vhs|cassette/.test(n) ? "vhs" : /vinyle|disque|vinyl/.test(n) ? "vinyle" : /livre|book/.test(n) ? "livre" : ""; };
const hueOf = (v) => { const s = String(v || "").trim(); if (/^\d{1,3}$/.test(s)) return Number(s) % 360; const m = s.match(/^#?([0-9a-f]{6})$/i); if (!m) return undefined;
  const n = parseInt(m[1], 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx === mn) return 0;
  const d = mx - mn; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return Math.round(((h * 60) + 360) % 360); };
// « gothique », « comme Bloodborne », « comme bloodborne » : une ambiance, ou le look d'un livre de la bibliothèque
export function themeOf(v) {
  const n = norm(v); if (!n) return null;
  const like = n.match(/^comme (.+)$/);
  if (like) { const q = like[1]; const b = BOOKS.find((x) => x.id === q || norm(x.title) === q) || BOOKS.find((x) => norm(x.title).includes(q)); return b && hasLook(b.id) ? { like: b.id } : null; }
  const key = Object.keys(THEMES).find((k) => norm(k) === n);
  return key ? { theme: key } : null;
}
const STATUS = (v) => { const n = norm(v); return n.includes("coup") ? "fav" : /a lire|veux|envie/.test(n) ? "want" : /lu|fini|termine/.test(n) ? "read" : ""; };

// Un bloc → { meta, body, errors }
export function parsePaste(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n").filter((l) => !/^\s*\/\//.test(l));
  const meta = { links: [], over: {} }; let i = 0; let last = null;
  for (; i < lines.length; i++) {
    const l = lines[i]; const t = l.trim();
    if (t.startsWith("# ")) break;
    if (/^-{3,}$/.test(t)) { i++; break; }
    if (!t) { last = null; continue; }
    const m = t.match(/^([^:]{2,24}?)\s*:\s*(.*)$/); const k = m && KEYS[norm(m[1])];
    if (k) {
      const v = m[2].trim(); last = k;
      if (k === "link") { const [label, a, b] = v.split(" | ").map((x) => (x || "").trim()); if (label) meta.links.push(/^https?:/.test(a || "") ? { label, url: a, note: b || undefined } : { label, note: a || undefined }); }
      else meta[k] = v;
    } else if (last && last !== "link") meta[last] += " " + t; // une valeur longue sur plusieurs lignes
  }
  const body = lines.slice(i).join("\n").trim();
  const errors = [];
  if (!meta.title) errors.push("Il manque la ligne TITRE.");
  const room = meta.room ? roomOf(meta.room) : "atelier"; if (meta.room && !room) errors.push(`Salle inconnue : « ${meta.room} ».`);
  const type = meta.type ? typeOf(meta.type) : "recit"; if (meta.type && !type) errors.push(`Genre inconnu : « ${meta.type} » (récit, pensée ou apprentissage).`);
  const format = meta.format ? fmtOf(meta.format) : ""; if (meta.format && !format) errors.push(`Format inconnu : « ${meta.format} » (livre, VHS ou vinyle).`);
  const th = meta.theme ? themeOf(meta.theme) : null; if (meta.theme && !th) errors.push(`Thème inconnu : « ${meta.theme} ».`);
  const over = {}; ["d", "r", "p", "p2", "p3", "ink", "ink2", "acc", "orn"].forEach((k) => { if (meta[k]) over[k] = meta[k]; });
  if (meta.tex) { const tx = norm(meta.tex); if (TEXTURES.includes(tx)) over.tex = tx; else errors.push(`Texture inconnue : « ${meta.tex} ».`); }
  return {
    meta: { title: meta.title || "", sub: meta.sub || "", room: room || "atelier", type: type || "recit", format: format || undefined, cote: meta.cote || "", emblem: meta.emblem || undefined,
      color: hueOf(meta.color), art: meta.art || undefined, about: meta.about || "", author: meta.author || "", links: meta.links, cover: meta.cover || "", status: STATUS(meta.status),
      look: th || Object.keys(over).length ? { ...(th || {}), over } : undefined },
    body, errors,
  };
}

// Un bloc → un livre lisible (le même rendu que les livres du code)
export function pasteToBook(text, extra = {}) {
  const { meta, body } = parsePaste(text);
  const about = meta.about || (meta.author ? `De ${meta.author}.` : "");
  const b = parseBook({ id: extra.id || "paste", title: meta.title || "Sans titre", sub: meta.sub || (meta.author ? meta.author : ""), room: meta.room, type: meta.type, format: meta.format, cote: meta.cote || "PERS.",
    color: meta.color, emblem: meta.emblem, art: meta.art, about, links: meta.links, look: meta.look, text: body || "" });
  if (!b.chapters.length) b.chapters = [{ title: "", blocks: [{ t: "p", x: about || "Ce livre n'a pas encore de chapitres." }] }];
  return { ...b, ...extra, src: text, status: meta.status, coverUrl: meta.cover };
}

// Prochaine cote libre d'une salle (HI-015, LO-031…)
const PREFIX = { histoire: "HI", lore: "LO", musique: "MU", philo: "PH", japon: "JA", sciences: "SC", art: "AR", lettres: "LI", cinema: "CI", atelier: "PERS" };
export function nextCote(room, books) {
  const p = PREFIX[room] || "PERS"; let max = 0;
  books.forEach((b) => { const m = String(b.cote || "").match(new RegExp(`^${p}-(\\d+)`)); if (m) max = Math.max(max, Number(m[1])); });
  return `${p}-${String(max + 1).padStart(3, "0")}`;
}
// Pose la cote dans le texte (juste après le titre) pour qu'elle reste la même
export const withCote = (text, cote) => (/^\s*cote\s*:/im.test(text) ? text : text.replace(/^(\s*titre\s*:.*)$/im, `$1\nCOTE : ${cote}`));

// Un livre de la bibliothèque → son bloc (pour le modifier par copier-coller)
export function bookToPaste(b) {
  const R = ROOMS.find((r) => r.key === b.room); const T = TYPES[b.type];
  const L = [`TITRE : ${b.title}`, b.sub && `SOUS-TITRE : ${b.sub}`, `SALLE : ${R?.key || b.room}`, `GENRE : ${T ? T.label.toLowerCase() : b.type}`,
    b.format && `FORMAT : ${b.format}`, b.cote && `COTE : ${b.cote}`, b.emblem && `EMBLÈME : ${b.emblem}`, Number.isFinite(b.color) && `COULEUR : ${b.color}`,
    b.art && `STEAMGRID : ${b.art}`, hasLook(b.id) && `THÈME : comme ${b.id}`, b.about && `À PROPOS : ${b.about}`,
    ...(b.links || []).map((l) => `LIEN : ${l.label}${l.url ? ` | ${l.url}` : ""}${l.note ? ` | ${l.note}` : ""}`)].filter(Boolean);
  return `${L.join("\n")}\n---\n\n${String(b.text || "").trim()}\n`;
}

// Modèles vierges, un par format
const HEAD = (o) => `// Les lignes qui commencent par // sont des commentaires : elles sont ignorées.
TITRE : ${o.title}
SOUS-TITRE : ${o.sub}
SALLE : ${o.room}
GENRE : ${o.type}
FORMAT : ${o.format}
EMBLÈME : ${o.em}
${o.art ? "STEAMGRID : Nom du jeu ou du film, en anglais\n" : ""}THÈME : ${o.theme}
// Retouches facultatives : POLICE, POLICE TEXTE, PAPIER, ENCRE, ACCENT, ORNEMENT, TEXTURE
À PROPOS : Deux ou trois phrases qui donnent envie d'ouvrir le volume. Les créateurs y sont nommés.
LIEN : Un livre, un film, une vidéo pour aller plus loin | https://… | Pourquoi ça vaut le détour.
// STATUT : lu, à lire ou coup de cœur (facultatif)
---
`;
export const TEMPLATES = {
  livre: { label: "Livre", text: HEAD({ title: "Titre du livre", sub: "Le sous-titre", room: "histoire", type: "récit", format: "livre", em: "史", theme: "papyrus" }) + `
# Premier chapitre

Un paragraphe. Une ligne vide sépare les paragraphes. Les mots en *italique* ou en **gras** se gardent.

> Une citation réelle, jamais inventée. | Son auteur, sa source

!! À RETENIR :: Un encadré pour l'essentiel.

## Un intertitre dans le chapitre

@yt IDYOUTUBE | Ce que montre la vidéo

# Deuxième chapitre

Chaque ligne qui commence par # ouvre un chapitre.
` },
  vhs: { label: "VHS", text: HEAD({ title: "Nom de l'œuvre", sub: "Ce que la cassette raconte", room: "lore", type: "récit", format: "vhs", em: "伝", theme: "cendre", art: true }) + `
# Le monde

Le texte du chapitre. Les créateurs (studio, auteurs, compositeurs) sont cités dès le début.

@art 1 | Une grande illustration (bannière SteamGridDB n° 1)

# Les personnages

@art g 2 | Une affiche verticale (n° 2)

Le texte continue après l'image.
` },
  vinyle: { label: "Vinyle", text: HEAD({ title: "Nom de l'artiste", sub: "Ce que le disque raconte", room: "musique", type: "récit", format: "vinyle", em: "音", theme: "peinture" }) + `
# Face A, premier titre

Le texte du chapitre.

@yt IDYOUTUBE | Le morceau, l'album, l'année

# Face B, la suite

Le texte continue.
` },
};
