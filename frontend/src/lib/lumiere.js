import { useEffect, useState, useSyncExternalStore } from "react";

// La lumière d'un décor : la même scène au jour, à l'aube, à l'heure dorée ou la nuit.
// Le thème la fixe (Nexus OS › Fond › Lumière). Elle ne suit plus l'heure : c'est le décor qui change avec le moment
// de la journée (collection en mode « Suit l'heure »), sinon les deux bougeaient en même temps et ça faisait trop.
export const LUMIERES = [["jour", "Jour", "☀"], ["aube", "Aube", "◐"], ["or", "Heure dorée", "◒"], ["nuit", "Nuit", "☾"]];
export const LUM_MODES = [["", "Jour"], ["aube", "Aube"], ["or", "Heure dorée"], ["nuit", "Nuit"]];

// Les moments de la journée : le cadran de l'accueil et les décors qui suivent l'heure parlent la même langue
export const PERIODES = [["matin", "Matin", 6], ["journee", "Journée", 11], ["crepuscule", "Crépuscule", 18], ["nuit", "Nuit", 21]];
export const periodeOf = (h = new Date().getHours()) => (h >= 6 && h < 11 ? "matin" : h >= 11 && h < 18 ? "journee" : h >= 18 && h < 21 ? "crepuscule" : "nuit");

const subs = new Set(); const emit = () => subs.forEach((f) => f());
// La lumière à afficher pour ce thème (un ancien réglage « Suit l'heure » vaut Jour)
export function useLumiere(themeKey, mode) { return !mode || mode === "heure" ? "jour" : mode; }

// ---------- Collection de décors d'un thème ----------
// Un thème peut porter plusieurs décors (layers.decors) : il garde sa personnalité (couleurs, typo, menu, blocs)
// et change de décor selon layers.decorMode : "" fixe (le premier), "visite" (un au hasard à chaque visite),
// "minutes" (toutes les layers.decorMin minutes, en fondu), "heure" (un décor par moment de la journée :
// le 1er au matin, le 2e en journée, le 3e au crépuscule, le 4e la nuit — comme le cadran de l'accueil).
// Le visiteur peut aussi en choisir un lui-même (pastille de l'accueil), si le thème le permet (layers.decorPublic).
export const DECOR_MODES = [["", "Fixe"], ["visite", "À chaque visite"], ["minutes", "Toutes les X minutes"], ["heure", "Suit l'heure"]];
const dkey = (t) => "nx-dec-" + (t || "");
const readDec = (t) => { try { return localStorage.getItem(dkey(t)) || ""; } catch (_) { return ""; } };
export const setDecorPick = (t, v) => { try { if (v) localStorage.setItem(dkey(t), v); else localStorage.removeItem(dkey(t)); } catch (_) {} emit(); };
export const useDecorPick = (t) => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => readDec(t));
export const decorList = (L) => { const l = [...new Set([L?.decor, ...(L?.decors || [])].filter(Boolean))]; return l; };
const visitPick = (t, n) => { try { const k = "nx-decv-" + t; let v = sessionStorage.getItem(k); if (v == null || +v >= n) { v = String(Math.floor(Math.random() * n)); sessionStorage.setItem(k, v); } return +v; } catch (_) { return 0; } };
export function useDecorCourant(themeKey, L) {
  const list = decorList(L); const mode = L?.decorMode || ""; const min = Math.max(1, +L?.decorMin || 10);
  const pick = useDecorPick(themeKey);
  const [tick, setTick] = useState(0);
  useEffect(() => { if (list.length < 2 || (mode !== "minutes" && mode !== "heure")) return undefined; const t = setInterval(() => setTick((x) => x + 1), mode === "minutes" ? 30000 : 60000); return () => clearInterval(t); }, [mode, list.length]);
  if (list.length < 2) return list[0] || "";
  if (L?.decorPublic !== false && pick && list.includes(pick)) return pick;
  void tick;
  if (mode === "visite") return list[visitPick(themeKey, list.length)];
  if (mode === "minutes") return list[Math.floor(Date.now() / (min * 60000)) % list.length];
  if (mode === "heure") return list[PERIODES.findIndex((p) => p[0] === periodeOf()) % list.length];
  return list[0];
}
