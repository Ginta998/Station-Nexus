import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/api";

// Expérience de la station publique : « classique » ou « nexus » (objets physiques, façon console).
// Choisie par l'admin pour tous les visiteurs (réglages du site) ; Nexus par défaut.
const KEY = "sx_experience"; // dernier choix connu, pour éviter un flash au démarrage
export const EXPERIENCES = [
  { key: "classique", label: "Classique", kanji: "典", desc: "La station d'origine : affiches, rails, carte et arcade." },
  { key: "nexus", label: "Nexus", kanji: "核", desc: "Les œuvres deviennent des objets : livres, cassettes, vinyles. On les prend, on les lance, comme sur une console." },
];
const get = () => { try { return localStorage.getItem(KEY) === "classique" ? "classique" : "nexus"; } catch (_) { return "nexus"; } };
const apply = (v) => { try { localStorage.setItem(KEY, v === "classique" ? "classique" : "nexus"); } catch (_) {} window.dispatchEvent(new CustomEvent("sx-experience", { detail: v })); };
getSettings().then((s) => { if (s?.experience && s.experience !== get()) apply(s.experience); }).catch(() => {});
// Admin uniquement : enregistré dans les réglages du site
export async function setExperience(v) {
  const s = await getSettings(); await updateSettings({ ...s, experience: v }); apply(v);
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
