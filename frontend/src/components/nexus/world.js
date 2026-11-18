import { useEffect, useState } from "react";
import { fmtOfCreation } from "@/components/nexus/NexusHome";

// Chaque œuvre a son propre « menu de jeu » : une ambiance choisie d'après ce qu'elle est.
export const WORLD_STYLES = {
  cinema: "Salle de cinéma", vhs: "Magnétoscope", arcade: "Borne d'arcade", manga: "Planche de manga", vinyle: "Platine", roman: "Bibliothèque",
};
export function worldStyleOf(item, catLabel = "") {
  if (item.launch_type === "game") return "arcade";
  const f = fmtOfCreation(item, catLabel);
  if (f === "vinyle") return "vinyle";
  if (item.launch_type === "film") return "cinema";
  if (item.launch_type === "episodes") return "vhs";
  if (/manga|bd|comic|webtoon|manhwa/i.test(`${item.category} ${catLabel}`)) return "manga";
  return "roman";
}

// La couleur de l'œuvre, tirée de son affiche (la teinte la plus vive). Sans affiche lisible : la couleur du thème.
export function usePosterAccent(src) {
  const [c, setC] = useState(null);
  useEffect(() => {
    setC(null); if (!src) return;
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const k = 32; const cv = document.createElement("canvas"); cv.width = k; cv.height = k;
        const g = cv.getContext("2d"); g.drawImage(img, 0, 0, k, k); const d = g.getImageData(0, 0, k, k).data;
        let best = null; let bs = -1;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i] / 255, gr = d[i + 1] / 255, b = d[i + 2] / 255; const mx = Math.max(r, gr, b), mn = Math.min(r, gr, b); const l = (mx + mn) / 2; const s = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
          const score = s * (1 - Math.abs(l - 0.55) * 1.6);
          if (score > bs) { bs = score; best = [d[i], d[i + 1], d[i + 2]]; }
        }
        if (best && bs > 0.25) { const [r, gr, b] = best.map((v) => Math.round(Math.min(255, v * 1.08))); setC(`rgb(${r},${gr},${b})`); }
      } catch (_) { /* image d'un autre site sans autorisation : on garde la couleur du thème */ }
    };
    img.src = src;
  }, [src]);
  return c;
}
