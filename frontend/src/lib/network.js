/*
  Le réseau narratif : ce qui relie les fiches entre elles (personnages, lieux, scènes, lore, événements…).
  - item.links : les identifiants reliés (comme avant, rien ne change pour l'existant)
  - item.fields.rel : la nature de chaque lien { [id]: "apparait" | "lieu" | "allie" | … } (sans nature : « lié à »)
  - les @mentions écrites dans un texte deviennent des liens tout seuls (nature « cite »)
*/
export const REL = {
  lie: { t: "lié à", back: "lié à" },
  cite: { t: "cite", back: "cité dans" },
  apparait: { t: "apparaît dans", back: "met en scène" },
  lieu: { t: "se passe à", back: "lieu de" },
  allie: { t: "allié de", back: "allié de", sym: true },
  ennemi: { t: "ennemi de", back: "ennemi de", sym: true },
  famille: { t: "famille de", back: "famille de", sym: true },
  amour: { t: "aime", back: "aimé de" },
  appartient: { t: "appartient à", back: "compte parmi ses membres" },
  avant: { t: "se passe avant", back: "se passe après" },
  apres: { t: "se passe après", back: "se passe avant" },
  inspire: { t: "inspiré de", back: "inspire" },
};
export const relOf = (it, id) => it?.fields?.rel?.[id] || "lie";
// la nature la plus probable d'un nouveau lien, d'après ce que sont les deux fiches
export function guessRel(a, b) {
  const k = (x) => x?.kind;
  if (k(a) === "character" && k(b) === "scene") return "apparait";
  if (k(a) === "scene" && k(b) === "place") return "lieu";
  if (k(a) === "event" && k(b) === "place") return "lieu";
  if (k(a) === "character" && k(b) === "event") return "apparait";
  return "lie";
}
export function withLink(it, id, rel) {
  const links = (it.links || []).includes(id) ? it.links : [...(it.links || []), id];
  const r = { ...(it.fields?.rel || {}) }; if (rel && rel !== "lie") r[id] = rel; else delete r[id];
  return { ...it, links, fields: { ...(it.fields || {}), rel: r } };
}
export function withoutLink(it, id) {
  const r = { ...(it.fields?.rel || {}) }; delete r[id];
  return { ...it, links: (it.links || []).filter((x) => x !== id), fields: { ...(it.fields || {}), rel: r } };
}

// ---- @mentions
export const mentionIds = (html = "") => [...new Set([...String(html).matchAll(/class="nx-mention"[^>]*data-id="([^"]+)"|data-id="([^"]+)"[^>]*class="nx-mention"/g)].map((m) => m[1] || m[2]))];
// un texte modifié : ses nouvelles mentions s'ajoutent aux liens (sans rien retirer)
export function syncMentions(it, html) {
  let out = it;
  mentionIds(html).forEach((id) => { if (id !== it.id && !(out.links || []).includes(id)) out = withLink(out, id, "cite"); });
  return out;
}

// ---- toutes les arêtes, dans les deux sens (une seule par paire)
export function edgesOf(items) {
  const ids = new Set(items.map((i) => i.id)); const seen = new Set(); const out = [];
  items.forEach((a) => (a.links || []).forEach((b) => {
    if (!ids.has(b)) return; const key = a.id < b ? a.id + "|" + b : b + "|" + a.id;
    if (seen.has(key)) return; seen.add(key); out.push({ a: a.id, b, rel: relOf(a, b) });
  }));
  return out;
}
// ce qu'une fiche a autour d'elle : liens sortants et entrants, regroupés par nature
export function neighborhood(items, it) {
  const byId = Object.fromEntries(items.map((x) => [x.id, x])); const groups = {};
  const add = (label, x) => { (groups[label] = groups[label] || []).push(x); };
  (it.links || []).forEach((id) => { const x = byId[id]; if (x) add(REL[relOf(it, id)]?.t || "lié à", x); });
  items.forEach((x) => { if (x.id !== it.id && (x.links || []).includes(it.id) && !(it.links || []).includes(x.id)) add(REL[relOf(x, it.id)]?.back || "lié à", x); });
  return groups;
}

// ---- cohérence : ce qui cloche dans le réseau
const isDead = (c) => /mort|décéd|deced|dead|†/i.test(`${c.fields?.status || ""} ${(c.tags || []).join(" ")}`);
const when = (x) => x.date || x.fields?.date || "";
export function coherence(items) {
  const byId = Object.fromEntries(items.map((x) => [x.id, x])); const out = [];
  const linked = (a, b) => (a.links || []).includes(b.id) || (b.links || []).includes(a.id);
  const relBetween = (a, b) => [a.fields?.rel?.[b.id], b.fields?.rel?.[a.id]].filter(Boolean);
  // un personnage mort qui apparaît dans une scène datée après sa mort
  items.filter((c) => c.kind === "character" && isDead(c)).forEach((c) => {
    const death = c.fields?.death_date || c.date; if (!death) return;
    items.filter((s) => (s.kind === "scene" || s.kind === "event") && when(s) && when(s) > death && linked(c, s)).forEach((s) =>
      out.push({ k: "mort", level: "warn", ids: [c.id, s.id], t: `${c.title} est mort (${death}) mais apparaît dans « ${s.title} » (${when(s)}).` }));
  });
  // deux natures contradictoires entre les mêmes fiches
  const seen = new Set();
  items.forEach((a) => (a.links || []).forEach((bid) => { const b = byId[bid]; if (!b) return; const key = [a.id, b.id].sort().join("|"); if (seen.has(key)) return; seen.add(key);
    const r = relBetween(a, b); if (r.includes("allie") && r.includes("ennemi")) out.push({ k: "contra", level: "warn", ids: [a.id, b.id], t: `${a.title} et ${b.title} sont à la fois alliés et ennemis.` });
    if (["avant", "apres"].includes(a.fields?.rel?.[b.id]) && a.fields?.rel?.[b.id] === b.fields?.rel?.[a.id]) out.push({ k: "temps", level: "warn", ids: [a.id, b.id], t: `« ${a.title} » et « ${b.title} » se passent chacun avant l'autre.` });
  }));
  // une scène sans lieu
  items.filter((s) => s.kind === "scene").forEach((s) => { const hasPlace = items.some((p) => p.kind === "place" && linked(s, p)); if (!hasPlace) out.push({ k: "lieu", level: "info", ids: [s.id], t: `La scène « ${s.title || "Sans titre"} » n'a pas de lieu.` }); });
  // les fiches isolées (personnages, lieux, lore) que rien ne relie
  items.filter((x) => ["character", "place", "lore"].includes(x.kind) && !(x.links || []).length && !items.some((y) => (y.links || []).includes(x.id)))
    .forEach((x) => out.push({ k: "seul", level: "info", ids: [x.id], t: `« ${x.title || "Sans titre"} » n'est relié à rien.` }));
  return out;
}

// ---- disposition en constellation : un petit moteur de forces (répulsion, ressorts, gravité vers le centre)
export function layout(nodes, edges, w = 1000, h = 700, prev = {}) {
  const P = {}; const n = nodes.length || 1;
  nodes.forEach((x, i) => { const a = (i / n) * Math.PI * 2; P[x.id] = prev[x.id] ? { ...prev[x.id] } : { x: w / 2 + Math.cos(a) * w * 0.3 + (i % 7) * 3, y: h / 2 + Math.sin(a) * h * 0.3 + (i % 5) * 3 }; });
  const deg = {}; edges.forEach((e) => { deg[e.a] = (deg[e.a] || 0) + 1; deg[e.b] = (deg[e.b] || 0) + 1; });
  const k = Math.sqrt((w * h) / n) * 0.55;
  for (let it = 0; it < 260; it++) {
    const temp = 18 * (1 - it / 260) + 0.6; const D = {}; nodes.forEach((x) => { D[x.id] = { x: 0, y: 0 }; });
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const A = P[nodes[i].id], B = P[nodes[j].id]; let dx = A.x - B.x, dy = A.y - B.y; let d = Math.hypot(dx, dy) || 0.01; const f = (k * k) / d;
      dx /= d; dy /= d; D[nodes[i].id].x += dx * f; D[nodes[i].id].y += dy * f; D[nodes[j].id].x -= dx * f; D[nodes[j].id].y -= dy * f;
    }
    edges.forEach((e) => { const A = P[e.a], B = P[e.b]; if (!A || !B) return; let dx = A.x - B.x, dy = A.y - B.y; const d = Math.hypot(dx, dy) || 0.01; const f = (d * d) / k; dx /= d; dy /= d; D[e.a].x -= dx * f; D[e.a].y -= dy * f; D[e.b].x += dx * f; D[e.b].y += dy * f; });
    nodes.forEach((x) => { const p = P[x.id], d = D[x.id]; d.x += (w / 2 - p.x) * 0.02 * (deg[x.id] ? 1 : 3); d.y += (h / 2 - p.y) * 0.02 * (deg[x.id] ? 1 : 3); const m = Math.hypot(d.x, d.y) || 1; p.x += (d.x / m) * Math.min(m, temp); p.y += (d.y / m) * Math.min(m, temp); p.x = Math.max(40, Math.min(w - 40, p.x)); p.y = Math.max(40, Math.min(h - 40, p.y)); });
  }
  return P;
}
