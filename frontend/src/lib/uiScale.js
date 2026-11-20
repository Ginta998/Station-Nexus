// Taille de l'interface (bouton aA) : sur ordinateur, toute l'interface est agrandie (zoom CSS),
// pas seulement le texte — utile sur les grands écrans. Sur téléphone, seul le texte change.
// zoom : ordinateur ; mzoom : téléphone (écran plus petit, l'interface y est déjà plus serrée)
export const UI_SCALES = [
  { v: "petit", label: "Petit", pct: "90 %", zoom: 0.9, mzoom: 0.68 },
  { v: "normal", label: "Normal", pct: "100 %", zoom: 1, mzoom: 0.76 },
  { v: "grand", label: "Grand", pct: "112 %", zoom: 1.12, mzoom: 0.85 },
  { v: "xl", label: "Très grand", pct: "125 %", zoom: 1.25, mzoom: 0.94 },
  { v: "max", label: "Maximum", pct: "140 %", zoom: 1.4, mzoom: 1.04 },
  { v: "ultra", label: "Écran géant", pct: "160 %", zoom: 1.6, mzoom: 1.16 },
];
export const zoomOf = (v, phone) => { const s = UI_SCALES.find((x) => x.v === v) || UI_SCALES[1]; return phone ? s.mzoom : s.zoom; };

// Rapport entre les coordonnées de la souris et les pixels CSS (mesuré, quel que soit le navigateur).
let ratio = null;
export const resetUiRatio = () => { ratio = null; };
export function uiRatio() {
  if (ratio) return ratio;
  if (typeof document === "undefined") return 1;
  const p = document.createElement("div");
  p.style.cssText = "position:fixed;left:100px;top:0;width:1px;height:1px;visibility:hidden;pointer-events:none";
  document.body.appendChild(p);
  const r = p.getBoundingClientRect().left / 100; p.remove();
  ratio = r > 0.3 && r < 4 ? r : 1;
  return ratio;
}
// Convertit une coordonnée d'événement (clientX/innerWidth…) en pixels CSS pour style.left/top
export const toCss = (n) => n / uiRatio();
