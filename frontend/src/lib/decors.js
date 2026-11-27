import MAN from "@/assets/decors/decors.json";

// Les décors à calques de Nexus OS (packs CraftPix en licence gratuite et Screaming Brain en CC0).
// Chaque calque est une petite image ; la Station les agrandit nettement et les fait bouger en profondeur.
const ctx = require.context("@/assets/decors", true, /\.webp$/);
const url = (p) => { try { const m = ctx(`./${p}`); return m.default || m; } catch (_) { return ""; } };
export const FAMILLES = [["ete", "Été"], ["nuages", "Nuages"], ["ocean", "Océan"], ["hiver", "Hiver"], ["ville", "Ville"], ["peint", "Peints"]];
export const DECORS = MAN.map((d) => ({ ...d, thumb: url(`${d.id}/thumb.webp`), full: url(`${d.id}/full.webp`), layers: d.layers.map((l, i) => ({ ...l, src: url(`${d.id}/${i}.webp`) })) }));
export const decorOf = (id) => DECORS.find((d) => d.id === id) || null;
