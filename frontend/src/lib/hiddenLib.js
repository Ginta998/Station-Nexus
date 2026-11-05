import { useSyncExternalStore } from "react";

// Masquage par l'utilisateur d'éléments par défaut des bibliothèques de l'atelier de thèmes
// (polices, effets, palettes, sons clavier). Local au navigateur ; ne supprime rien du code,
// retire juste l'élément des listes — réaffichable à tout moment.
const KEY = "nx-hidden-lib";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) { return {}; } };
let st = read();
const subs = new Set();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) {} subs.forEach((f) => f()); };

export const useHiddenLib = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => st);
export const isHidden = (kind, id) => (st[kind] || []).includes(String(id));
export const hiddenCount = (kind) => (st[kind] || []).length;
export const hideItem = (kind, id) => { const a = new Set(st[kind] || []); a.add(String(id)); st = { ...st, [kind]: [...a] }; save(); };
export const showItem = (kind, id) => { st = { ...st, [kind]: (st[kind] || []).filter((x) => x !== String(id)) }; save(); };
