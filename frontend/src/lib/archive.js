import { isOeuvre, stripHtml } from "@/lib/atelier";

// Codes d'archive stables, communs à tout l'Atelier (Index des archives, fiches, Drive) :
// U-01 pour les univers (ordre), O-005 / E-012 pour les œuvres / éléments (ordre de création).
export const pad = (n, l = 3) => String(n).padStart(l, "0");
export function archiveCodes(items) {
  return Object.fromEntries([...items].sort((a, b) => (a.created_at || "").localeCompare(b.created_at || "")).map((it, i) => [it.id, `${isOeuvre(it) ? "O" : "E"}-${pad(i + 1)}`]));
}
export const uniCode = (universes, id) => { const i = universes.findIndex((u) => u.id === id); return i < 0 ? "—" : `U-${pad(i + 1, 2)}`; };
export const words = (html) => stripHtml(html || "").trim().split(/\s+/).filter(Boolean).length;
export const fmtDate = (d, long) => {
  if (!d) return "—"; const x = new Date(d); if (isNaN(x)) return "—";
  return x.toLocaleDateString("fr-FR", long ? { day: "2-digit", month: "short", year: "numeric" } : { day: "2-digit", month: "2-digit", year: "2-digit" }).toUpperCase();
};
