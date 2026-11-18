import { useEffect, useState } from "react";
import { useThemeState, saveTheme, deleteTheme, themeDef } from "@/lib/themeStore";

/*
  Thèmes de monde (expérience Nexus) créés dans l'atelier des thèmes de monde.
  Ils sont gardés avec les thèmes de la station (même collection), sous une clé « w-… ».
  Un thème de monde part d'un des douze thèmes (base) et en change ce qu'on veut :
  couleurs, polices, disposition, fenêtre, grain, particules, transition d'entrée, effet de souris…
*/
export const isWorldKey = (k) => typeof k === "string" && k.startsWith("w-");
export const newWorldKey = () => "w-" + Math.random().toString(36).slice(2, 9);

export const WT_BLANK = {
  name: "Mon thème", base: "cinema", ink: "", paper: "", hl: "",
  font_title: "", font_ui: "", font_body: "", title_case: "auto",
  mirror: false, win: true, radius: "auto",
  grain: 0, scan: 0, vignette: 0, bg_dim: null, bg_blur: null,
  pt: "auto", intro: "auto", cursor: "none",
};

// Les polices proposées : uniquement celles hébergées par la Station (rien n'est demandé à Google côté public)
export const WT_FONTS = [
  ["Anton", "Affiche"], ["Bebas Neue", "Affiche étroite"], ["Oswald", "Affiche"], ["Teko", "Affiche"], ["Archivo Black", "Massive"], ["Unbounded", "Ronde"],
  ["Syne", "Éditoriale"], ["Space Grotesk", "Technique"], ["Sora", "Moderne"], ["Outfit", "Moderne"], ["Manrope", "Moderne"], ["Inter", "Neutre"], ["Work Sans", "Neutre"], ["Josefin Sans", "Art déco"], ["Rajdhani", "Tech"], ["Chakra Petch", "Tech"], ["Michroma", "Futuriste"], ["Orbitron", "Futuriste"], ["Audiowide", "Rétro-futur"], ["Monoton", "Néon"],
  ["Cormorant Garamond", "Classique"], ["EB Garamond", "Classique"], ["Playfair Display", "Élégante"], ["DM Serif Display", "Élégante"], ["Bodoni Moda", "Mode"], ["Spectral", "Lecture"], ["IM Fell English", "Ancienne"], ["Cinzel", "Gravée"], ["Marcellus", "Gravée"], ["Shippori Mincho", "Japonaise"], ["Zen Kaku Gothic New", "Japonaise"],
  ["Special Elite", "Machine à écrire"], ["Courier Prime", "Machine à écrire"], ["JetBrains Mono", "Terminal"], ["Azeret Mono", "Terminal"], ["VT323", "Écran cathodique"], ["Press Start 2P", "Pixel"], ["Silkscreen", "Pixel"], ["Major Mono Display", "Bizarre"],
];
export const WT_CURSORS = [
  ["none", "Aucun", "La souris normale"], ["lab", "Laboratoire", "Viseur fin et coordonnées, comme l'atelier"], ["spot", "Lampe", "Une lumière suit la souris dans le noir"],
  ["ring", "Anneau", "Un anneau suit la souris avec un léger retard"], ["trail", "Traînée", "La souris laisse une traînée qui s'efface"], ["glow", "Halo", "Un halo doux autour de la souris"],
  ["dot", "Point", "Un point net, sans flèche"], ["cross", "Réticule", "Un réticule de visée"],
];

// Le brouillon en cours d'édition : le monde l'affiche en direct
let draft = null; const subs = new Set();
export const setWorldDraft = (d) => { draft = d; subs.forEach((f) => f(d)); };
export function useWorldDraft() {
  const [d, setD] = useState(draft);
  useEffect(() => { subs.add(setD); return () => { subs.delete(setD); }; }, []);
  return d;
}

export function useWorldThemes() {
  const s = useThemeState();
  return s.docs.filter((d) => isWorldKey(d.key));
}
export const worldThemeOf = (key) => (isWorldKey(key) ? themeDef(key) : null);
export const saveWorldTheme = (t) => saveTheme({ ...t, kind: "world", public: true, enabled: true });
export const deleteWorldTheme = (key) => deleteTheme(key);

// Ce que le thème change sur le monde : classes et variables CSS
export function wtLook(t) {
  if (!t) return { cls: "", style: {} };
  const style = {};
  if (t.ink) style["--ink"] = t.ink;
  if (t.paper) style["--paper"] = t.paper;
  if (t.hl) { style["--hl"] = t.hl; style["--brand"] = t.hl; }
  if (t.font_title) style["--ft"] = `"${t.font_title}",sans-serif`;
  if (t.font_ui) style["--fu"] = `"${t.font_ui}",sans-serif`;
  if (t.font_body) style["--fb"] = `"${t.font_body}",sans-serif`;
  if (t.grain) style["--wt-grain"] = t.grain;
  if (t.scan) style["--wt-scan"] = t.scan;
  if (t.vignette) style["--wt-vig"] = t.vignette;
  if (t.bg_dim != null) style["--wt-dim"] = t.bg_dim;
  if (t.bg_blur != null) style["--wt-blur"] = `${t.bg_blur}px`;
  if (t.radius !== "auto" && t.radius != null) style["--wt-r"] = `${t.radius}px`;
  const cls = ["wt",
    t.font_title && "wt-ft", t.font_ui && "wt-fu", t.font_body && "wt-fb",
    t.title_case === "upper" && "wt-up", t.title_case === "none" && "wt-low",
    t.mirror && "wt-mirror", t.win === false && "wt-nowin", t.radius !== "auto" && t.radius != null && "wt-rad",
    t.grain && "wt-grain", t.scan && "wt-scan", t.vignette && "wt-vig", (t.bg_dim != null || t.bg_blur != null) && "wt-bgfx",
    t.pt === "none" && "wt-nopt"].filter(Boolean).join(" ");
  return { cls, style };
}
