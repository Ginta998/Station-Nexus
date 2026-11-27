import { useSyncExternalStore } from "react";
import { BOOKS as BUNDLED } from "@/data/alexandrie";
import VERSIONS_BUNDLED from "@/data/alexandrie/versions.json";

// Alexandrie à jour sans republier la Station : « Actualiser la bibliothèque » va chercher les livres
// sur GitHub (branche main, fichier frontend/public/alexandrie/livres.json écrit par tools/dates_livres.py)
// et les garde dans ce navigateur (IndexedDB). Un livre plus récent remplace celui de la Station ;
// un livre nouveau s'ajoute aux rayons. Rien ne change sur le serveur.
const REPO = "Ginta998/Station-Nexus";
const BRANCH = "main";
const FILE = "frontend/public/alexandrie/livres.json";
const DB = "nx-alexandrie", STORE = "kv", KEY = "livres";

const idb = (mode, fn) => new Promise((res, rej) => {
  try {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onerror = () => rej(r.error);
    r.onsuccess = () => { const tx = r.result.transaction(STORE, mode); const q = fn(tx.objectStore(STORE)); tx.oncomplete = () => res(q?.result); tx.onerror = () => rej(tx.error); };
  } catch (e) { rej(e); }
});

let LIVE = null; // { at, sha, versions, books }
const subs = new Set(); const emit = () => subs.forEach((f) => f());
idb("readonly", (s) => s.get(KEY)).then((v) => { if (v?.books) { LIVE = v; emit(); } }).catch(() => {});

// Le catalogue : les livres de la Station, remplacés par leur version de GitHub quand elle est différente, puis les nouveaux
let cache = { live: undefined, books: BUNDLED, versions: VERSIONS_BUNDLED };
const compute = () => {
  if (cache.live === LIVE) return cache;
  if (!LIVE) { cache = { live: LIVE, books: BUNDLED, versions: VERSIONS_BUNDLED }; return cache; }
  const byId = new Map(LIVE.books.map((b) => [b.id, b]));
  const books = BUNDLED.map((b) => byId.get(b.id) || b);
  const known = new Set(BUNDLED.map((b) => b.id));
  LIVE.books.forEach((b) => { if (!known.has(b.id)) books.push(b); });
  cache = { live: LIVE, books, versions: { ...VERSIONS_BUNDLED, ...(LIVE.versions || {}) } };
  return cache;
};
const sub = (f) => { subs.add(f); return () => subs.delete(f); };
export const useAlexCatalog = () => useSyncExternalStore(sub, compute);
export const alexCatalog = () => compute();
export const liveInfo = () => LIVE && { at: LIVE.at, sha: LIVE.sha };

// Va chercher la dernière version des livres. Renvoie { nouveaux, misAJour, total }.
export async function refreshLibrary() {
  const c = await fetch(`https://api.github.com/repos/${REPO}/commits/${BRANCH}`, { headers: { Accept: "application/vnd.github+json" } });
  if (!c.ok) throw new Error(c.status === 403 ? "GitHub limite les demandes, réessaie dans quelques minutes" : "GitHub ne répond pas");
  const sha = (await c.json()).sha;
  const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/${FILE}`);
  if (!r.ok) throw new Error("Le fichier des livres n'est pas encore sur GitHub");
  const data = await r.json();
  if (!Array.isArray(data.books) || !data.books.length) throw new Error("Fichier des livres vide");
  const before = compute();
  const prevV = before.versions;
  const ids = new Set(before.books.map((b) => b.id));
  const nouveaux = data.books.filter((b) => !ids.has(b.id)).length;
  const misAJour = data.books.filter((b) => ids.has(b.id) && data.versions?.[b.id]?.hash && prevV[b.id]?.hash !== data.versions[b.id].hash).length;
  const v = { at: new Date().toISOString(), sha, versions: data.versions || {}, books: data.books };
  await idb("readwrite", (s) => s.put(v, KEY));
  LIVE = v; emit();
  return { nouveaux, misAJour, total: data.books.length };
}

// Revenir aux livres livrés avec la Station
export async function resetLibrary() { await idb("readwrite", (s) => s.delete(KEY)).catch(() => {}); LIVE = null; emit(); }
