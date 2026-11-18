import { useEffect, useState } from "react";

// Expérience de la station publique : « classique » (la version d'origine) ou « nexus » (objets physiques, façon console).
// Choix propre à chaque visiteur, gardé dans son navigateur ; Classique par défaut.
const KEY = "sx_experience";
export const EXPERIENCES = [
  { key: "classique", label: "Classique", kanji: "典", desc: "La station d'origine : affiches, rails, carte et arcade." },
  { key: "nexus", label: "Nexus", kanji: "核", desc: "Les œuvres deviennent des objets : livres, cassettes, vinyles. On les prend, on les lance, comme sur une console." },
];
const get = () => { try { return localStorage.getItem(KEY) === "nexus" ? "nexus" : "classique"; } catch (_) { return "classique"; } };
export function setExperience(v) {
  try { localStorage.setItem(KEY, v); } catch (_) {}
  window.dispatchEvent(new CustomEvent("sx-experience", { detail: v }));
}
export function useExperience() {
  const [v, setV] = useState(get);
  useEffect(() => { const on = () => setV(get()); window.addEventListener("sx-experience", on); window.addEventListener("storage", on); return () => { window.removeEventListener("sx-experience", on); window.removeEventListener("storage", on); }; }, []);
  return v;
}

// Nexus : l'ambiance sonore d'une œuvre démarre seule en entrant dans son monde (oui par défaut)
const AMB = "sx_world_amb_auto";
export const worldAmbientAuto = () => { try { return localStorage.getItem(AMB) !== "0"; } catch (_) { return true; } };
export function setWorldAmbientAuto(on) { try { localStorage.setItem(AMB, on ? "1" : "0"); } catch (_) {} window.dispatchEvent(new CustomEvent("sx-experience")); }
