import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, mediaUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const get = (u) => api.get(u).then((r) => r.data);
const send = (m, u, b) => api[m](u, b).then((r) => r.data);
// Bunny répond en tâche de fond : on interroge le serveur jusqu'à ce que la réponse soit prête
const pollJob = async (start) => {
  const { job_id: id } = await start;
  for (let i = 0; i < 150; i++) {
    await new Promise((r) => setTimeout(r, 1600));
    const j = await get(`/atelier/bunny/jobs/${id}`).catch((e) => {
      if (e?.response?.status === 404) return { status: "error", error: "Bunny a été interrompue par un redémarrage de la station. Réessaie !" };
      throw e;
    });
    if (j.status === "done") return j.result;
    if (j.status === "error") throw Object.assign(new Error(j.error), { response: { data: { detail: j.error } } });
  }
  throw Object.assign(new Error("timeout"), { response: { data: { detail: "Bunny met trop de temps à répondre, réessaie dans un instant." } } });
};

export const atelierApi = {
  bootstrap: () => get("/atelier/bootstrap"),
  config: () => get("/atelier/config"),
  ytTitles: (ids) => get(`/atelier/yt-titles?ids=${ids}`),
  ytPlaylist: (l) => get(`/atelier/yt-playlist?list=${l}`),
  setConfig: (b) => send("put", "/atelier/config", b),
  createUniverse: (b) => send("post", "/atelier/universes", b),
  updateUniverse: (id, b) => send("put", `/atelier/universes/${id}`, b),
  deleteUniverse: (id) => send("delete", `/atelier/universes/${id}`),
  createItem: (b) => send("post", "/atelier/items", b),
  updateItem: (id, b) => send("put", `/atelier/items/${id}`, b),
  deleteItem: (id) => send("delete", `/atelier/items/${id}`),
  versions: (id) => get(`/atelier/items/${id}/versions`),
  restore: (id, vid) => send("post", `/atelier/items/${id}/versions/${vid}/restore`),
  createTask: (b) => send("post", "/atelier/tasks", b),
  updateTask: (id, b) => send("put", `/atelier/tasks/${id}`, b),
  deleteTask: (id) => send("delete", `/atelier/tasks/${id}`),
  exportAll: () => get("/atelier/export"),
  bunnySessions: () => get("/atelier/bunny/sessions"),
  bunnySession: (id) => get(`/atelier/bunny/sessions/${id}`),
  bunnyDelete: (id) => send("delete", `/atelier/bunny/sessions/${id}`),
  bunnyBriefing: () => get("/atelier/bunny/briefing"),
  bunnyMakeBriefing: () => pollJob(send("post", "/atelier/bunny/briefing", {})),
  brains: () => get("/atelier/bunny/brains"),
  addBrain: (b) => send("post", "/atelier/bunny/brains", b),
  patchBrain: (id, b) => send("put", `/atelier/bunny/brains/${id}`, b),
  orderBrains: (ids) => send("put", "/atelier/bunny/brains/order", ids),
  deleteBrain: (id) => send("delete", `/atelier/bunny/brains/${id}`),
  testBrain: (id) => api.post(`/atelier/bunny/brains/${id}/test`, {}, { timeout: 60000 }).then((r) => r.data),
  bunnyMind: () => get("/atelier/bunny/mind"),
  saveProfile: (profile) => send("put", "/atelier/bunny/mind/profile", { profile }),
  addMemory: (text) => send("post", "/atelier/bunny/mind/memories", { text }),
  deleteMemory: (id) => send("delete", `/atelier/bunny/mind/memories/${id}`),
  resolveProposal: (b) => send("post", "/atelier/bunny/mind/proposal", b),
  bunnyChat: (b) => pollJob(send("post", "/atelier/bunny/chat", b)),
  createLink: (b) => send("post", "/atelier/links", b),
  updateLink: (id, b) => send("put", `/atelier/links/${id}`, b),
  deleteLink: (id) => send("delete", `/atelier/links/${id}`),
  upload: (file, onProgress) => { const fd = new FormData(); fd.append("file", file); return api.post("/atelier/files", fd, { onUploadProgress: (e) => onProgress?.(e.total ? e.loaded / e.total : 0) }).then((r) => r.data); },
  importDoc: (file, { universe_id, kind }, onProgress) => {
    const fd = new FormData(); fd.append("file", file); fd.append("universe_id", universe_id || ""); fd.append("kind", kind); fd.append("split", "1");
    return api.post("/atelier/import", fd, { onUploadProgress: (e) => onProgress?.(e.total ? e.loaded / e.total : 0) }).then((r) => r.data.items);
  },
  share: (id, mode) => send("post", `/atelier/items/${id}/share`, { mode }),
  delComment: (id, cid) => send("delete", `/atelier/items/${id}/comments/${cid}`),
  ytSearch: (q) => get(`/atelier/yt-search?q=${encodeURIComponent(q)}`),
  sgdbSearch: (q, game) => get(`/atelier/sgdb/search?q=${encodeURIComponent(q)}${game ? `&game=${game}` : ""}`),
  unshare: (id) => send("delete", `/atelier/items/${id}/share`),
  downloadPptx: async (id, title, s) => {
    const r = await api.get(`/atelier/items/${id}/pptx`, { responseType: "blob", params: { bg: s.bg || "#0b0b12", ink: s.ink || "#f1f1f4", ac: s.ac || "#3f86ff", ft: s.ft || "Calibri", fb: s.fb || "Calibri" } });
    const a = document.createElement("a"); a.href = URL.createObjectURL(r.data); a.download = `${(title || "presentation").replace(/[^\w\- ]/g, "_")}.pptx`; a.click();
  },
  downloadDocx: async (id, title) => {
    const r = await api.get(`/atelier/items/${id}/docx`, { responseType: "blob" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(r.data); a.download = `${(title || "document").replace(/[^\w\- ]/g, "_")}.docx`; a.click();
  },
};

export const isImportable = (f) => /\.(pdf|docx|txt|md)$/i.test(f.name);
export const ytId = (u) => (u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/) || [])[1];
export const mediaFromUpload = (up) => {
  const m = up.mime || ""; const type = m.startsWith("image/") ? "image" : m.startsWith("audio/") ? "audio" : m.startsWith("video/") ? "video" : m === "application/pdf" ? "pdf" : "file";
  return { id: up.id, type, url: up.url, name: up.name, mime: m };
};
export const mediaFromText = (text) => {
  const t = (text || "").trim(); if (!/^https?:\/\//i.test(t)) return null;
  const y = ytId(t);
  return y ? { id: "yt-" + y + Date.now(), type: "youtube", url: t, yt: y, name: "YouTube" } : { id: "ln-" + Date.now(), type: "link", url: t, name: t.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] };
};

export const KINDS = {
  note: { label: "Note", plural: "Notes", kanji: "記" },
  scene: { label: "Scène", plural: "Scènes", kanji: "場" },
  character: { label: "Personnage", plural: "Personnages", kanji: "人" },
  place: { label: "Lieu", plural: "Lieux", kanji: "地" },
  lore: { label: "Lore", plural: "Lore", kanji: "伝" },
  event: { label: "Événement", plural: "Chronologie", kanji: "時" },
  document: { label: "Document", plural: "Documents", kanji: "書" },
  inspiration: { label: "Inspiration", plural: "Inspirations", kanji: "想" },
  file: { label: "Fichier", plural: "Fichiers", kanji: "档" },
  moodboard: { label: "Moodboard", plural: "Moodboards", kanji: "板" },
  table: { label: "Tableau", plural: "Tableaux", kanji: "表" },
  checklist: { label: "Checklist", plural: "Checklists", kanji: "列" },
  board: { label: "Board", plural: "Boards", kanji: "盤" },
};

// Œuvres : une création concrète développée dans un univers (série, film, livre…), avec son propre espace.
// Modélisé sur un élément porteur (fields.oeuvre = true) ; ses éléments pointent vers lui via fields.oeuvre_id.
export const OEUVRE_FORMATS = {
  serie: { label: "Série", kanji: "連", unit: "Épisode", units: "Épisodes" },
  film: { label: "Film", kanji: "映", unit: "Séquence", units: "Séquences" },
  court: { label: "Court-métrage", kanji: "短", unit: "Séquence", units: "Séquences" },
  livre: { label: "Livre", kanji: "書", unit: "Chapitre", units: "Chapitres" },
  bd: { label: "BD / Manga", kanji: "画", unit: "Planche", units: "Planches" },
  autre: { label: "Œuvre", kanji: "作", unit: "Partie", units: "Parties" },
};
export const isOeuvre = (it) => !!(it && it.fields && it.fields.oeuvre);
export const oeuvreFmt = (it) => OEUVRE_FORMATS[it?.fields?.format] || OEUVRE_FORMATS.autre;

// Dossiers Nexus Drive : modélisés comme les œuvres (élément porteur fields.folder = true,
// imbriqués via fields.parent). Les éléments rangés dedans pointent via fields.folder_id.
export const isFolder = (it) => !!(it && it.fields && it.fields.folder);

// Catégories de tâches (pipeline créatif). Stockées dans le champ libre `notes` (préfixe "cat:")
// pour ne rien changer au backend — le reste de `notes` reste disponible pour des notes libres.
export const TASK_CATS = {
  ecriture: { label: "Écriture", color: "#c9a86a" },
  prod: { label: "Production", color: "#5fb0d9" },
  montage: { label: "Montage", color: "#b98cff" },
  diffusion: { label: "Diffusion", color: "#6ad98c" },
  admin: { label: "Admin", color: "#d98c8c" },
};
export const taskCat = (t) => { const k = (t?.notes || "").match(/^cat:(\w+)/)?.[1]; return k && TASK_CATS[k] ? k : ""; };
export const setTaskCat = (notes, cat) => { const rest = (notes || "").replace(/^cat:\w+\n?/, ""); return cat ? "cat:" + cat + (rest ? "\n" + rest : "") : rest; };

// Playlist (YouTube ou autre) par univers — stockée en local (le modèle univers du backend est figé).
// Pour une œuvre, la playlist vit dans fields.playlist (persisté côté serveur).
export const getUniPlaylists = () => { try { return JSON.parse(localStorage.getItem("nexus-uni-pl") || "{}"); } catch { return {}; } };
export const getUniPlaylist = (id) => (id ? getUniPlaylists()[id] || "" : "");
export const setUniPlaylist = (id, url) => { if (!id) return; const m = getUniPlaylists(); if (url && url.trim()) m[id] = url.trim(); else delete m[id]; try { localStorage.setItem("nexus-uni-pl", JSON.stringify(m)); } catch (_) {} };

// Type d'aperçu d'un fichier déposé (image, pdf, office, vidéo, audio, texte, lien, drive)
export const fileType = (m) => {
  if (!m) return "none";
  if (m.type === "drive") return "drive";
  if (m.type === "link" || m.type === "youtube") return "link";
  const n = (m.name || m.url || "").toLowerCase(); const mt = m.mime || "";
  if (m.type === "image" || mt.startsWith("image/")) return "image";
  if (m.type === "pdf" || mt === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (m.type === "video" || mt.startsWith("video/")) return "video";
  if (m.type === "audio" || mt.startsWith("audio/")) return "audio";
  if (/\.(docx?|xlsx?|pptx?|odt|ods|odp)$/.test(n)) return "office";
  if (/\.(txt|md|csv|json|srt)$/.test(n) || mt.startsWith("text/")) return "text";
  return "other";
};

// Libellé lisible de la NATURE d'un fichier, pour l'identifier d'un coup d'œil (badge).
// (Distinct de fileType, qui sert au RENDU dans la visionneuse.)
export const fileNature = (m) => {
  if (!m) return "";
  const n = (m.name || m.url || "").toLowerCase();
  const mt = m.mime || "";
  if (m.type === "youtube" || /(?:youtube\.com|youtu\.be)/.test(n)) return "YOUTUBE";
  if (m.type === "drive" || /drive\.google\.com/.test(n)) return "DRIVE";
  if (/docs\.google\.com\/document/.test(n)) return "GOOGLE DOC";
  if (/docs\.google\.com\/spreadsheets/.test(n)) return "GOOGLE SHEET";
  if (/docs\.google\.com\/presentation/.test(n)) return "GOOGLE SLIDES";
  if (m.type === "image" || mt.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/.test(n)) return "IMAGE";
  if (m.type === "video" || mt.startsWith("video/") || /\.(mp4|webm|mov|m4v|avi|mkv)$/.test(n)) return "VIDÉO";
  if (m.type === "audio" || mt.startsWith("audio/") || /\.(mp3|wav|ogg|flac|m4a)$/.test(n)) return "AUDIO";
  if (m.type === "pdf" || mt === "application/pdf" || n.endsWith(".pdf")) return "PDF";
  if (/\.(xlsx?|ods|csv)$/.test(n) || mt.includes("spreadsheet")) return "EXCEL";
  if (/\.(docx?|odt|rtf)$/.test(n) || mt.includes("word")) return "WORD";
  if (/\.(pptx?|odp)$/.test(n) || mt.includes("presentation")) return "POWERPOINT";
  if (/\.(txt|md|json|srt)$/.test(n) || mt.startsWith("text/")) return "TEXTE";
  if (m.type === "link" || /^https?:/i.test(n)) { try { return new URL(m.url).hostname.replace(/^www\./, "").toUpperCase(); } catch { return "LIEN"; } }
  return "FICHIER";
};

export const KIND_FIELDS = {
  character: [["role", "Rôle"], ["age", "Âge"], ["look", "Apparence"], ["personality", "Personnalité"], ["goal", "Motivation"]],
  place: [["region", "Région"], ["mood", "Ambiance"]],
  event: [["era", "Époque / arc"]],
  scene: [["pov", "Point de vue"], ["status", "Statut"]],
};

export const ITEM_FIELDS = ["kind", "title", "content", "universe_id", "fields", "tags", "links", "image", "date", "pinned", "media"];
export const pickItem = (it) => Object.fromEntries(ITEM_FIELDS.map((k) => [k, it[k]]));
export const UNIVERSE_FIELDS = ["name", "kanji", "color", "cover", "description", "creation_ids", "order", "group", "pinned"];
export const TASK_FIELDS = ["title", "universe_id", "item_id", "due", "priority", "done", "notes"];
const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k]]));

// Un lien Google Drive vers un FICHIER (image) ne s'affiche proprement qu'en passant par
// l'endpoint "thumbnail" (sinon : visionneuse Drive encombrante). Les dossiers sont laissés
// tels quels (gérés par l'embed), car ils ne sont pas des images.
const DRIVE_FILE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]*&)*id=|thumbnail\?(?:[^&]*&)*id=)([\w-]{10,})/;
export const driveImg = (u) => { const m = typeof u === "string" && u.match(DRIVE_FILE); return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600` : u; };
export const imgSrc = (u) => (u ? mediaUrl(driveImg(u)) : "");
export const todayStr = () => new Date().toLocaleDateString("sv-SE");
export const stripHtml = (h) => (h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

// Données de l'Atelier : chargées une fois par l'écran de chargement, puis mises à jour localement
export function useAtelier() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["atelier"], queryFn: atelierApi.bootstrap, staleTime: Infinity });
  const patch = (fn) => qc.setQueryData(["atelier"], (d) => (d ? fn(d) : d));
  const up = (list, doc) => (list.some((x) => x.id === doc.id) ? list.map((x) => (x.id === doc.id ? doc : x)) : [doc, ...list]);

  return {
    data,
    universes: data?.universes || [],
    items: data?.items || [],
    tasks: data?.tasks || [],
    config: data?.config || {},
    async saveUniverse(u) {
      const doc = u.id ? await atelierApi.updateUniverse(u.id, pick(u, UNIVERSE_FIELDS)) : await atelierApi.createUniverse(pick({ creation_ids: [], order: (data?.universes || []).length, ...u }, UNIVERSE_FIELDS));
      patch((d) => ({ ...d, universes: up(d.universes, doc) }));
      return doc;
    },
    async removeUniverse(id) {
      await atelierApi.deleteUniverse(id);
      patch((d) => ({ ...d, universes: d.universes.filter((x) => x.id !== id), items: d.items.map((i) => (i.universe_id === id ? { ...i, universe_id: null } : i)), tasks: d.tasks.map((t) => (t.universe_id === id ? { ...t, universe_id: null } : t)) }));
    },
    async createItem(b) {
      const doc = await atelierApi.createItem({ kind: "note", title: "", content: "", universe_id: null, fields: {}, tags: [], links: [], image: "", date: "", pinned: false, media: [], ...b });
      patch((d) => ({ ...d, items: [doc, ...d.items] }));
      return doc;
    },
    addItems(docs) { patch((d) => ({ ...d, items: [...docs, ...d.items] })); },
    links: data?.links || [],
    records: data?.records || [],
    async saveRecord(rk, rec) {
      const doc = rec.id ? await send("put", `/atelier/records/${rk}/${rec.id}`, rec) : await send("post", `/atelier/records/${rk}`, rec);
      patch((d) => ({ ...d, records: up(d.records || [], doc) }));
      return doc;
    },
    async removeRecord(rk, id) { await send("delete", `/atelier/records/${rk}/${id}`); patch((d) => ({ ...d, records: (d.records || []).filter((x) => x.id !== id) })); },
    async saveLink(l) {
      const body = { kind: "watch", color: "", cover: "", universe_id: null, order: 0, ...l };
      const fields = ["title", "url", "kind", "color", "cover", "universe_id", "order"];
      const b = Object.fromEntries(fields.map((k) => [k, body[k]]));
      const doc = l.id ? await atelierApi.updateLink(l.id, b) : await atelierApi.createLink(b);
      patch((d) => ({ ...d, links: up(d.links || [], doc) }));
      return doc;
    },
    async removeLink(id) { await atelierApi.deleteLink(id); patch((d) => ({ ...d, links: (d.links || []).filter((x) => x.id !== id) })); },
    async saveItem(it) {
      const doc = await atelierApi.updateItem(it.id, pickItem({ media: [], ...it }));
      patch((d) => ({ ...d, items: [doc, ...d.items.filter((x) => x.id !== doc.id)] }));
      return doc;
    },
    async removeItem(id) {
      await atelierApi.deleteItem(id);
      patch((d) => ({ ...d, items: d.items.filter((x) => x.id !== id).map((x) => ({ ...x, links: (x.links || []).filter((l) => l !== id) })) }));
    },
    async saveTask(t) {
      const body = pick({ universe_id: null, item_id: null, due: "", priority: "normal", done: false, notes: "", ...t }, TASK_FIELDS);
      const doc = t.id ? await atelierApi.updateTask(t.id, body) : await atelierApi.createTask(body);
      patch((d) => ({ ...d, tasks: up(d.tasks, doc) }));
      return doc;
    },
    applyTasks(docs, deleted = []) { patch((d) => ({ ...d, tasks: docs.reduce((l, t) => up(l, t), d.tasks).filter((t) => !deleted.includes(t.id)) })); },
    async removeTask(id) {
      await atelierApi.deleteTask(id);
      patch((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) }));
    },
    async saveConfig(b) {
      const cfg = await atelierApi.setConfig(b);
      patch((d) => ({ ...d, config: cfg }));
      qc.setQueryData(["atelier-config"], cfg);
      return cfg;
    },
  };
}

// Raccourci clavier secret (admin) : taper le code n'importe où dans la Station ouvre le portail
export function usePortalCode(enabled, onMatch) {
  const { data: cfg } = useQuery({ queryKey: ["atelier-config"], queryFn: atelierApi.config, enabled, staleTime: 60000 });
  useEffect(() => {
    const code = cfg?.code;
    if (!enabled || !code) return;
    let buf = "";
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (!/^\d$/.test(e.key)) { buf = ""; return; }
      buf = (buf + e.key).slice(-code.length);
      if (buf === code) { buf = ""; onMatch(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, cfg?.code, onMatch]);
}

// Une seule musique à la fois : tant qu'un média de l'Atelier joue, l'ambiance de la Station s'estompe
let mediaClaims = 0;
export function useMediaClaim(active) {
  const { enterMediaMode, exitMediaMode } = useApp();
  useEffect(() => {
    if (!active) return;
    if (mediaClaims++ === 0) enterMediaMode();
    return () => { if (--mediaClaims === 0) exitMediaMode(); };
  }, [active]); // eslint-disable-line
}
