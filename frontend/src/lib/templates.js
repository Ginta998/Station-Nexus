import data from "@/data/templates.json";

// Bibliothèque de templates. Les templates intégrés viennent du JSON ; plus tard, les templates
// personnels de l'utilisateur viendront s'ajouter ici (même forme), pour une vraie bibliothèque.
export const BUILTIN_TEMPLATES = data.templates || [];
export const TEMPLATE_CATS = { scenario: "Écriture", personnage: "Personnage", monde: "Monde", production: "Production", pitch: "Pitch deck", dossier: "Dossier narratif", contenu: "Contenu", perso: "Mes templates" };
export const CAT_ORDER = ["scenario", "personnage", "monde", "production", "pitch", "dossier", "contenu", "perso"];

// Un template personnel = un élément porteur fields.template = true (catégorie dans fields.tcat).
// Un override d'un template intégré porte en plus fields.tbase = <id du template intégré>.
export const isTemplate = (it) => !!(it && it.fields && it.fields.template);
const strip = (h) => (h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

// Templates intégrés masqués par l'utilisateur (local, car ne concerne que l'affichage).
const HIDE_KEY = "nexus-tpl-hidden";
export const hiddenBuiltins = () => { try { return JSON.parse(localStorage.getItem(HIDE_KEY) || "[]"); } catch (_) { return []; } };
export const hideBuiltin = (id) => { try { const s = new Set(hiddenBuiltins()); s.add(id); localStorage.setItem(HIDE_KEY, JSON.stringify([...s])); } catch (_) {} };

const userShape = (it, base) => ({ id: it.id, cat: it.fields?.tcat || base?.cat || "perso", name: it.title || "Template", kanji: it.fields?.kanji || base?.kanji || "書", desc: strip(it.content).slice(0, 90) || base?.desc, kind: it.fields?.tkind || base?.kind || "note", user: true, item: it, base: base?.id });

// Tous les templates : intégrés (JSON) + personnels (éléments) + overrides des intégrés.
export function allTemplates(at) {
  const hidden = new Set(hiddenBuiltins());
  const users = (at?.items || []).filter(isTemplate);
  const overrides = {}; users.forEach((it) => { if (it.fields?.tbase) overrides[it.fields.tbase] = it; });
  const built = BUILTIN_TEMPLATES.filter((t) => !hidden.has(t.id)).map((t) => overrides[t.id] ? userShape(overrides[t.id], t) : ({ id: t.id, cat: t.cat, name: t.name, kanji: t.kanji, desc: t.desc, kind: t.kind, builtin: true, tpl: t }));
  const standalone = users.filter((it) => !it.fields?.tbase).map((it) => userShape(it));
  return [...built, ...standalone];
}
export const templateHtml = (t) => (t.builtin ? templateToHtml(t.tpl) : (t.item?.content || ""));
// Fork d'un template intégré en override éditable.
export const forkBuiltin = (at, t, title) => at.createItem({ universe_id: null, kind: "note", title: title || t.name, content: templateToHtml(t.tpl), fields: { template: true, tbase: t.id, tcat: t.cat, tkind: t.kind || "note", kanji: t.kanji || "書" } });

// Types dédiés créables dans le Drive (comme « Nouveau » de Google Drive).
// kind = type reconnu par le backend ; c'est le contenu (grille, cases, colonnes) qui distingue
// Tableau / Checklist / Board. fields.dtype garde l'étiquette du type pour l'affichage.
export const DRIVE_TYPES = [
  { id: "document", label: "Document", kanji: "書", kind: "document" },
  { id: "personnage", label: "Personnage", kanji: "人", kind: "character", tplId: "fiche-personnage" },
  { id: "lieu", label: "Lieu", kanji: "地", kind: "place", tplId: "fiche-lieu" },
  { id: "scene", label: "Scène", kanji: "場", kind: "scene", tplId: "scene" },
  { id: "lore", label: "Lore / Worldbuilding", kanji: "伝", kind: "lore" },
  { id: "moodboard", label: "Moodboard", kanji: "板", kind: "inspiration", dtype: "moodboard", html: "<p class=\"tpl-hint\"><em>Dépose ou colle des images (même des liens Google Drive) pour composer ton moodboard. Passe en vue Moodboard pour le mur d'images.</em></p>" },
  { id: "tableau", label: "Tableau", kanji: "表", kind: "document", dtype: "table", html: "<table class=\"at-table\"><thead><tr><th>Colonne A</th><th>Colonne B</th><th>Colonne C</th></tr></thead><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>" },
  { id: "checklist", label: "Checklist", kanji: "列", kind: "note", dtype: "checklist", html: "<ul class=\"at-check\"><li>☐ Première tâche</li><li>☐ Deuxième tâche</li><li>☐ Troisième tâche</li></ul>" },
  { id: "board", label: "Board (kanban)", kanji: "盤", kind: "document", dtype: "board", html: "<h3>À faire</h3><ul><li>…</li></ul><h3>En cours</h3><ul><li>…</li></ul><h3>Fait</h3><ul><li>…</li></ul>" },
  { id: "evenement", label: "Événement", kanji: "時", kind: "event", html: "<p class=\"tpl-hint\"><em>Donne une date (même « An 312 » ou « Chapitre 4 ») dans le champ Date de la fiche pour l'afficher dans la chronologie.</em></p>" },
];
export const typeContent = (type) => (type.tplId ? templateToHtml(BUILTIN_TEMPLATES.find((b) => b.id === type.tplId) || {}) : (type.html || ""));
export const typeMenuEntries = (onPick) => DRIVE_TYPES.map((t) => ({ id: t.id, label: `${t.kanji}  ${t.label}`, onClick: () => onPick(t) }));

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Transforme un template en document HTML pré-rempli (sections + amorces à remplacer).
export function templateToHtml(tpl) {
  let h = "";
  for (const s of (tpl.sections || [])) {
    h += `<h2>${esc(s.h)}</h2>`;
    if (s.intro) h += `<p class="tpl-hint"><em>${esc(s.intro)}</em></p>`;
    if (s.fields) for (const f of s.fields) h += `<p><strong>${esc(f)} :</strong>&nbsp;</p>`;
    if (s.sub) for (const u of s.sub) {
      h += `<h3>${esc(u.h)}</h3>`;
      if (u.hint) h += `<p class="tpl-hint"><em>${esc(u.hint)}</em></p>`;
      h += "<p><br/></p>";
    }
    if (s.questions) for (const q of s.questions) {
      h += `<h4>${esc(q.q)}</h4>`;
      const meta = [q.type && ("Type : " + q.type), q.effet && ("Effet : " + q.effet)].filter(Boolean).join(" · ");
      if (meta) h += `<p class="tpl-hint"><em>${esc(meta)}</em></p>`;
      h += "<p><br/></p>";
    }
    if (s.gallery) h += `<p class="tpl-hint"><em>Dépose ici tes images, décors et ambiances — ton moodboard du monde.</em></p>`;
    if (!s.fields && !s.sub && !s.questions && !s.gallery && !s.intro) h += "<p><br/></p>";
  }
  return h;
}

// Entrées de menu « Depuis un template » (regroupées par catégorie/thème).
export function templateMenuEntries(onPick, templates) {
  const list = templates || BUILTIN_TEMPLATES.map((t) => ({ ...t, tpl: t, builtin: true }));
  const cats = [...new Set(list.map((t) => t.cat))].sort((a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b));
  if (cats.length <= 1) return list.map((t) => ({ id: t.id, label: `${t.kanji || ""} ${t.name}`.trim(), onClick: () => onPick(t) }));
  return cats.map((c) => ({
    id: "tc-" + c, label: TEMPLATE_CATS[c] || c,
    sub: list.filter((t) => t.cat === c).map((t) => ({ id: t.id, label: `${t.kanji || ""} ${t.name}`.trim(), onClick: () => onPick(t) })),
  }));
}
