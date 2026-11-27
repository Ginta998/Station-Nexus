import { api } from "@/lib/api";

// Nexus Arcade : la ludothèque de l'Atelier (admin). Le serveur garde les jeux en morceaux de 8 Mo
// et les sauvegardes (SRAM et états) ; le navigateur garde une copie des jeux pour relancer sans attendre.
export const CHUNK = 8 * 1024 * 1024;
const long = { timeout: 180000 };

export const arcadeApi = {
  list: () => api.get("/arcade/games").then((r) => r.data),
  create: (g) => api.post("/arcade/games", g).then((r) => r.data),
  patch: (id, p) => api.put(`/arcade/games/${id}`, p).then((r) => r.data),
  remove: (id) => api.delete(`/arcade/games/${id}`).then((r) => r.data),
  importUrl: (b) => api.post("/arcade/import-url", b).then((r) => r.data),
  job: (id) => api.get(`/arcade/jobs/${id}`).then((r) => r.data),
  launch: (id) => api.post(`/arcade/games/${id}/launch`).then((r) => r.data),
  session: (id, duration) => api.post(`/arcade/games/${id}/session`, { duration: Math.round(duration), started_at: new Date(Date.now() - duration * 1000).toISOString() }).then((r) => r.data),
  saves: (gid) => api.get("/arcade/saves", { params: gid ? { game_id: gid } : {} }).then((r) => r.data),
  delSave: (gid, kind, slot) => api.delete(`/arcade/saves/${gid}/${kind}/${slot}`).then((r) => r.data),
  async getSave(gid, kind, slot, previous = false) {
    const r = await api.get(`/arcade/saves/${gid}/${kind}/${slot}`, { ...long, responseType: "arraybuffer", params: previous ? { previous: 1 } : {} });
    return { data: new Uint8Array(r.data), rev: Number(r.headers?.["x-rev"] || 0) };
  },
  // base : la révision chargée par cet appareil (le serveur répond 409 si un autre appareil a sauvegardé depuis)
  async putSave(gid, kind, slot, data, { base = null, force = false, core = "" } = {}) {
    const headers = { "Content-Type": "application/octet-stream", "X-Core": core, "X-Engine": "emulatorjs", "X-Device": deviceName() };
    if (base !== null && base !== undefined) headers["X-Base-Rev"] = String(base);
    if (force) headers["X-Force"] = "1";
    return api.put(`/arcade/saves/${gid}/${kind}/${slot}`, data, { ...long, headers, transformRequest: [(d) => d] }).then((r) => r.data);
  },
};

export function deviceName() {
  const ua = navigator.userAgent || "";
  const kind = /iPad|Tablet/i.test(ua) ? "Tablette" : /Mobi|Android|iPhone/i.test(ua) ? "Téléphone" : "Ordinateur";
  const br = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "";
  return br ? `${kind} · ${br}` : kind;
}

// Les consoles de l'Arcade. core : cœur EmulatorJS ; ext : extensions reconnues ; box : la boîte sur l'étagère (carton, plastique, DS, CD, affiche) ;
// media : ce qui entre dans la console au lancement (cartouche, carte, disque) ;
// family : la console qui lance le jeu ; level : ok (fluide partout), good (fluide sur ordinateur, correct sur téléphone),
// beta (exigeant, ordinateur conseillé). hh : nom de la plateforme sur Homebrew Hub (catalogue libre).
export const PLATFORMS = [
  { k: "gba", label: "Game Boy Advance", short: "GBA", core: "gba", ext: ["gba"], media: "cart-gba", box: "carton", family: "h", color: "#7c5cff", gen: "Portable · 2001", level: "ok", hh: "GBA" },
  { k: "gbc", label: "Game Boy Color", short: "GBC", core: "gb", ext: ["gbc"], media: "cart-gb", box: "carton", family: "v", color: "#2bb3a3", gen: "Portable · 1998", level: "ok", hh: "GBC" },
  { k: "gb", label: "Game Boy", short: "GB", core: "gb", ext: ["gb"], media: "cart-gb", box: "carton", family: "v", color: "#8a9a5b", gen: "Portable · 1989", level: "ok", hh: "GB" },
  { k: "nes", label: "NES / Famicom", short: "NES", core: "nes", ext: ["nes", "fds", "unf"], media: "cart-big", box: "carton-l", family: "salon", color: "#d9463b", gen: "Salon · 1983", level: "ok", hh: "NES" },
  { k: "snes", label: "Super Nintendo", short: "SNES", core: "snes", ext: ["sfc", "smc"], media: "cart-big", box: "carton-l", family: "salon", color: "#8f7ad8", gen: "Salon · 1990", level: "ok" },
  { k: "segaMD", label: "Mega Drive / Genesis", short: "MD", core: "segaMD", ext: ["md", "gen", "smd"], media: "boite", box: "plastique", family: "salon", color: "#2f6fd6", gen: "Salon · 1988", level: "ok" },
  { k: "segaMS", label: "Master System", short: "SMS", core: "segaMS", ext: ["sms"], media: "cart-big", box: "plastique", family: "salon", color: "#c23a3a", gen: "Salon · 1985", level: "ok" },
  { k: "segaGG", label: "Game Gear", short: "GG", core: "segaGG", ext: ["gg"], media: "cart-gb", box: "carton", family: "h", color: "#3a3f4a", gen: "Portable · 1990", level: "ok" },
  { k: "nds", label: "Nintendo DS", short: "DS", core: "nds", ext: ["nds"], media: "card", box: "ds", family: "ds", color: "#9aa3b2", gen: "Portable · 2004", level: "good" },
  { k: "psx", label: "PlayStation", short: "PS1", core: "psx", ext: ["chd", "pbp", "cue"], media: "cd", box: "cd", family: "disque", color: "#6b7385", gen: "Salon · 1994", level: "good" },
  { k: "n64", label: "Nintendo 64", short: "N64", core: "n64", ext: ["n64", "z64", "v64"], media: "cart-big", box: "carton-l", family: "salon", color: "#2e9a54", gen: "Salon · 1996", level: "beta" },
  { k: "arcade", label: "Arcade (FBNeo)", short: "ARC", core: "arcade", ext: [], media: "flyer", box: "flyer", family: "borne", color: "#f0a030", gen: "Bornes · 1978–2000s", level: "good" },
];
export const PF = Object.fromEntries(PLATFORMS.map((p) => [p.k, p]));
export const pf = (k) => PF[k] || PF.gba;
export const ARCHIVES = ["zip", "7z"];
export const ACCEPT = [...PLATFORMS.flatMap((p) => p.ext), ...ARCHIVES].map((e) => "." + e).join(",");
// Console déduite du fichier ; null pour une archive (.zip, .7z) dont il faut demander la console
export function detectPlatform(name = "") {
  const e = (name.split(".").pop() || "").toLowerCase();
  if (ARCHIVES.includes(e)) return null;
  const p = PLATFORMS.find((x) => x.ext.includes(e));
  return p ? p.k : undefined; // undefined : format inconnu
}
export const platformOf = (name = "") => detectPlatform(name) || "gba";
export const coreOf = (g) => pf(g.platform).core;
export const PLATFORM_LABEL = Object.fromEntries(PLATFORMS.map((p) => [p.k, p.label]));
export const hasFile = (g) => !!g.ready;

export const cleanTitle = (name = "") => name.replace(/\.[a-z0-9]{1,4}$/i, "").replace(/[_.]+/g, " ").replace(/\s*[([][^)\]]*[)\]]/g, "").replace(/\s+/g, " ").trim() || "Sans titre";

export function playTime(s = 0) {
  if (!s || s < 60) return s ? "moins d'une minute" : "jamais lancé";
  const h = Math.floor(s / 3600); const m = Math.round((s % 3600) / 60);
  return h ? `${h} h${m ? " " + String(m).padStart(2, "0") : ""}` : `${m} min`;
}
export function ago(iso) {
  if (!iso) return "";
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 90) return "à l'instant";
  if (d < 3600) return `il y a ${Math.round(d / 60)} min`;
  if (d < 86400) return `il y a ${Math.round(d / 3600)} h`;
  if (d < 86400 * 30) return `il y a ${Math.round(d / 86400)} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

async function sha1Hex(blob) {
  try {
    if (!crypto?.subtle || blob.size > 256 * 1024 * 1024) return "";
    const h = await crypto.subtle.digest("SHA-1", await blob.arrayBuffer());
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (_) { return ""; }
}

// Envoi d'un jeu en morceaux de 8 Mo (chaque morceau retenté trois fois). onProgress(0..1)
export async function uploadGame(file, meta = {}, onProgress = () => {}) {
  const sha1 = await sha1Hex(file);
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const g = await arcadeApi.create({ title: meta.title || cleanTitle(file.name), platform: meta.platform || platformOf(file.name), kind: "game",
    file_name: file.name, file_format: ext, file_size: file.size, sha1, cover: meta.cover || "", description: "", year: "", publisher: "" });
  const n = Math.max(1, Math.ceil(file.size / CHUNK));
  for (let i = 0; i < n; i++) {
    const part = file.slice(i * CHUNK, Math.min(file.size, (i + 1) * CHUNK));
    for (let t = 0; ; t++) {
      try {
        await api.put(`/arcade/games/${g.id}/chunks/${i}`, part, { ...long, headers: { "Content-Type": "application/octet-stream" }, transformRequest: [(d) => d],
          onUploadProgress: (e) => onProgress((i + (e.total ? e.loaded / e.total : 0)) / n) });
        break;
      } catch (e) { if (t >= 2) { await arcadeApi.remove(g.id).catch(() => {}); throw e; } await new Promise((r) => setTimeout(r, 800 * (t + 1))); }
    }
    onProgress((i + 1) / n);
  }
  await api.post(`/arcade/games/${g.id}/complete`, { chunks: n, size: file.size, sha1 });
  try { await cachePut(g.id, file, sha1 || String(file.size)); } catch (_) { /* le cache est un confort */ }
  return { ...g, ready: true, chunks: n, file_size: file.size, sha1 };
}

// Ajouter le fichier à une fiche existante (jeu ajouté sans fichier depuis la recherche officielle)
export async function uploadInto(g, file, onProgress = () => {}) {
  const sha1 = await sha1Hex(file);
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const n = Math.max(1, Math.ceil(file.size / CHUNK));
  for (let i = 0; i < n; i++) {
    const part = file.slice(i * CHUNK, Math.min(file.size, (i + 1) * CHUNK));
    for (let t = 0; ; t++) {
      try {
        await api.put(`/arcade/games/${g.id}/chunks/${i}`, part, { ...long, headers: { "Content-Type": "application/octet-stream" }, transformRequest: [(d) => d],
          onUploadProgress: (e) => onProgress((i + (e.total ? e.loaded / e.total : 0)) / n) });
        break;
      } catch (e) { if (t >= 2) throw e; await new Promise((r) => setTimeout(r, 800 * (t + 1))); }
    }
    onProgress((i + 1) / n);
  }
  await api.post(`/arcade/games/${g.id}/complete`, { chunks: n, size: file.size, sha1 });
  const ng = await arcadeApi.patch(g.id, { file_name: file.name, file_format: ext }).catch(() => g);
  try { await cachePut(g.id, file, sha1 || String(file.size)); } catch (_) { /* rien */ }
  return { ...g, ...ng, ready: true, chunks: n, file_size: file.size, sha1 };
}

// Installer depuis un lien : le serveur télécharge lui-même ; on suit l'avancement
export async function importFromUrl(body, onProgress = () => {}) { // body.game_id : remplir une fiche existante
  const { job_id, game_id } = await arcadeApi.importUrl(body);
  for (;;) {
    await new Promise((r) => setTimeout(r, 1200));
    const j = await arcadeApi.job(job_id);
    onProgress(j.total ? j.done / j.total : null, j.done);
    if (j.status === "done") return game_id;
    if (j.status === "error") throw new Error(j.error || "envoi impossible");
  }
}

// ---------- cache des jeux dans le navigateur (IndexedDB)
const DB = "nx-arcade";
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("roms");
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function cacheGet(id) {
  const d = await idb();
  return new Promise((res) => { const q = d.transaction("roms").objectStore("roms").get(id); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); });
}
async function cachePut(id, blob, tag) {
  const d = await idb();
  return new Promise((res) => { const t = d.transaction("roms", "readwrite"); t.objectStore("roms").put({ blob, tag, at: Date.now() }, id); t.oncomplete = () => res(true); t.onerror = () => res(false); });
}
export async function cacheDrop(id) {
  try { const d = await idb(); d.transaction("roms", "readwrite").objectStore("roms").delete(id); } catch (_) { /* rien */ }
}

// Le fichier du jeu : depuis le cache s'il est à jour, sinon morceau par morceau depuis le serveur
export async function loadRom(g, onProgress = () => {}) {
  const tag = g.sha1 || String(g.file_size || "");
  try { const c = await cacheGet(g.id); if (c && c.blob && (!tag || c.tag === tag)) { onProgress(1); return c.blob; } } catch (_) { /* rien */ }
  const n = g.chunks || 1; const parts = [];
  for (let i = 0; i < n; i++) {
    const r = await api.get(`/arcade/games/${g.id}/chunks/${i}`, { ...long, responseType: "arraybuffer",
      onDownloadProgress: (e) => onProgress((i + (e.total ? e.loaded / e.total : 0)) / n) });
    parts.push(r.data); onProgress((i + 1) / n);
  }
  const blob = new Blob(parts, { type: "application/octet-stream" });
  try { await cachePut(g.id, blob, tag); } catch (_) { /* rien */ }
  return blob;
}

// Empreinte rapide d'une sauvegarde (savoir si elle a changé avant de l'envoyer)
export function fnv(u8) {
  let h = 0x811c9dc5;
  for (let i = 0; i < u8.length; i++) { h ^= u8[i]; h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16) + ":" + u8.length;
}

// Jeux de test : des homebrews GBA gratuits, sous licence libre, hébergés par GameBrew. Pour vérifier l'émulateur,
// les manettes et les sauvegardes. À retirer quand tu n'en as plus besoin (clic droit › Retirer).
export const TEST_GAMES = [
  { title: "Butano Fighter", url: "https://dlhb.gamebrew.org/gbahomebrews/butanofighter.7z", file_name: "butanofighter.7z", by: "GValiente", lic: "zlib", note: "Shoot'em up, sauvegarde les meilleurs scores." },
  { title: "Raven X", url: "https://dlhb.gamebrew.org/gbahomebrews/ravenxgba.7z", file_name: "ravenxgba.7z", by: "David Idol", lic: "CC", note: "Shoot'em up à défilement horizontal." },
  { title: "Arcade Mania", url: "https://dlhb.gamebrew.org/gbahomebrews/arcademaniagba.7z", file_name: "arcademaniagba.7z", by: "Davi Silva", lic: "MIT", note: "Petits jeux d'arcade." },
];

// ---------- Catalogue libre : Homebrew Hub (homebrews GB, GBC, GBA, NES, avec licence). Le serveur relaie la recherche ;
// s'il n'est pas encore à jour, on tente l'API directement.
const HH = "https://hh3.gbdev.io/api";
export const hhFile = (slug, f) => `${HH}/entry/${encodeURIComponent(slug)}/${encodeURIComponent(f)}`;
export async function catalogSearch({ title = "", platform = "", page = 1 } = {}) {
  let d;
  try { d = (await api.get("/arcade/catalog", { params: { title, platform, page } })).data; }
  catch (e) {
    const q = new URLSearchParams({ page: String(page), page_elements: "24" }); if (title) q.set("title", title); if (platform) q.set("platform", platform);
    const r = await fetch(`${HH}/search?${q}`); if (!r.ok) throw e; d = await r.json();
  }
  const list = d.entries || d.results || d.data || (Array.isArray(d) ? d : []);
  return {
    total: d.results ?? d.total ?? list.length, pages: d.page_total || 1, page: d.page_current || page,
    items: list.filter((x) => x && x.slug).map((x) => {
      const f = (x.files || []).find((y) => y.default) || (x.files || []).find((y) => y.playable) || (x.files || [])[0];
      const plat = { GB: "gb", GBC: "gbc", GBA: "gba", NES: "nes" }[String(x.platform || "").toUpperCase()] || "gba";
      return { slug: x.slug, title: x.title || x.slug, dev: x.developer || "", license: x.license || "", tags: x.tags || [], platform: plat,
        shot: x.screenshots?.length ? hhFile(x.slug, x.screenshots[0]) : "", file: f?.filename || "", url: f ? hhFile(x.slug, f.filename) : "", repo: x.repository || "" };
    }),
  };
}

// ---------- Jeux officiels : chercher n'importe quel jeu pour le ranger dans la ludothèque (fiche, artwork), sans le télécharger.
// SteamGridDB (titres + jaquettes, clé sur le serveur) ; Wikipédia en complément (sans clé).
export async function officialSearch(q) {
  const out = []; const seen = new Set();
  try {
    const r = (await api.get("/atelier/sgdb/search", { params: { q } })).data;
    (r.games || []).forEach((g) => { const k = g.name.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push({ src: "sgdb", id: g.id, title: g.name, cover: g.id === r.game ? r.items?.[0]?.thumb || "" : "" }); } });
  } catch (_) { /* clé absente ou serveur pas à jour */ }
  try {
    const u = `https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=8&gsrsearch=${encodeURIComponent(q + " jeu vidéo")}&prop=pageimages|description&piprop=thumbnail&pithumbsize=300`;
    const d = await (await fetch(u)).json();
    Object.values(d.query?.pages || {}).sort((a, b) => a.index - b.index).forEach((p) => {
      const t = p.title.replace(/\s*\((jeu vidéo|jeu)[^)]*\)\s*$/i, ""); const k = t.toLowerCase();
      if (!/jeu|game/i.test(p.description || "") || seen.has(k)) return; seen.add(k);
      out.push({ src: "wiki", id: p.pageid, title: t, desc: p.description || "", cover: p.thumbnail?.source || "", wiki: `https://fr.wikipedia.org/?curid=${p.pageid}` });
    });
  } catch (_) { /* hors ligne */ }
  return out;
}
export async function officialCovers(game) {
  if (game.src !== "sgdb") return game.cover ? [game.cover] : [];
  try { const r = (await api.get("/atelier/sgdb/search", { params: { q: game.title, game: game.id } })).data; return (r.items || []).map((a) => a.url); } catch (_) { return []; }
}
