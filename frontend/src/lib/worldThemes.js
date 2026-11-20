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
  // structure : ce qui change vraiment l'allure du monde
  title_size: "auto", title_fx: "none", frame: "none", deco: "none", img: "auto", menu_style: "auto",
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
    t.pt === "none" && "wt-nopt",
    t.title_size && t.title_size !== "auto" && "wt-tz", t.title_fx && t.title_fx !== "none" && "wt-tfx-" + t.title_fx,
    t.img && t.img !== "auto" && "wt-img-" + t.img, t.menu_style && t.menu_style !== "auto" && "wt-mn-" + t.menu_style].filter(Boolean).join(" ");
  if (t.title_size && t.title_size !== "auto") style["--wt-tz"] = t.title_size;
  return { cls, style };
}

// Ce que chaque thème de base utilise quand on ne change rien (pour l'aperçu)
export const WT_BASE = {
  cinema: { paper: "#000000", ink: "#f3f3f3", hl: "#e8473f", ft: "Bebas Neue", fu: "Manrope" },
  vhs: { paper: "#0b0b0d", ink: "#d9e6ff", hl: "#e8f1ff", ft: "VT323", fu: "VT323" },
  arcade: { paper: "#000000", ink: "#f4f4f4", hl: "#ffd400", ft: "Press Start 2P", fu: "Press Start 2P" },
  yorha: { paper: "#cdc8b0", ink: "#4e4b42", hl: "#4e4b42", ft: "Zen Kaku Gothic New", fu: "Zen Kaku Gothic New" },
  eve: { paper: "#04060b", ink: "#eaf1f8", hl: "#8fdcff", ft: "Outfit", fu: "Outfit" },
  hero: { paper: "#e8edf3", ink: "#1c2333", hl: "#f99e1a", ft: "Anton", fu: "Rajdhani" },
  cathedrale: { paper: "#070506", ink: "#e6dccd", hl: "#b3121e", ft: "Cormorant Garamond", fu: "Cinzel" },
  couronne: { paper: "#08070a", ink: "#efe6cf", hl: "#d4b062", ft: "Cinzel", fu: "Marcellus" },
  trait: { paper: "#f2ead9", ink: "#141414", hl: "#e8473f", ft: "Anton", fu: "Unbounded" },
  sengoku: { paper: "#0d0c0a", ink: "#ece5d6", hl: "#c0262d", ft: "Shippori Mincho", fu: "Shippori Mincho" },
  survivance: { paper: "#11130e", ink: "#e4e0d2", hl: "#a9b97a", ft: "Work Sans", fu: "Work Sans" },
  cristal: { paper: "#070a12", ink: "#eef3ff", hl: "#8fd3ff", ft: "Cormorant Garamond", fu: "Sora" },
  dock: { paper: "#07060d", ink: "#f3eefe", hl: "#ff3fa4", ft: "Unbounded", fu: "Space Grotesk" },
  panorama: { paper: "#06090e", ink: "#dfe8f2", hl: "#ffb340", ft: "Rajdhani", fu: "Space Grotesk" },
  sommaire: { paper: "#ece6d6", ink: "#151311", hl: "#b3261e", ft: "Playfair Display", fu: "Courier Prime" },
};
// Palettes toutes prêtes : [nom, fond, encre, accent]
export const WT_PALETTES = [
  ["Jazz ambré", "#120d09", "#f1e4cc", "#e0a24a"], ["Terminal", "#050a06", "#a8ffb0", "#39ff6a"], ["Dossier", "#e9e1cf", "#2a2620", "#b3261e"],
  ["Néon de minuit", "#07051a", "#f2eaff", "#ff3fa4"], ["Encre", "#efe7d6", "#1b1712", "#c0262d"], ["Sang", "#0a0405", "#eadbd6", "#c21d2e"],
  ["Or noir", "#0b0a08", "#efe6cf", "#d4b062"], ["Givre", "#08101a", "#eaf4ff", "#8fd3ff"], ["Forêt", "#0e130e", "#e2e6d6", "#8fb46a"],
  ["Rouille", "#16100c", "#eadfd2", "#d0652c"], ["Papier crème", "#f3ecdf", "#24201a", "#3b5bdb"], ["Brume", "#1a1d22", "#d8dde3", "#9fb4c8"],
];
// Cinq modèles pour démarrer : chacun part d'une base différente et change la structure, pas seulement les couleurs
export const WT_PRESETS = [
  { name: "Shibuya", about: "La ville la nuit : néons qui bavent sous la pluie, enseigne verticale, barre de verre en bas comme sur un téléphone.", base: "dock", paper: "#07060d", ink: "#f3eefe", hl: "#ff3fa4",
    font_title: "Unbounded", font_ui: "Space Grotesk", font_body: "Space Grotesk", title_case: "upper", title_size: 1, title_fx: "neon", frame: "none", deco: "none", img: "auto", menu_style: "auto",
    grain: 0.25, vignette: 0.6, scan: 0, pt: "none", intro: "auto", cursor: "glow", win: false, mirror: false, radius: 16 },
  { name: "Hangar", about: "La baie d'un vaisseau : sol quadrillé, balayage de scanner, modules cerclés de repères de visée, télémétrie ambre.", base: "panorama", paper: "#06090e", ink: "#dfe8f2", hl: "#ffb340",
    font_title: "Rajdhani", font_ui: "Space Grotesk", font_body: "Space Grotesk", title_case: "upper", title_size: 1.15, title_fx: "none", frame: "corners", deco: "hud", img: "auto", menu_style: "auto",
    grain: 0.15, vignette: 0.55, scan: 0.15, pt: "none", intro: "auto", cursor: "cross", win: false, mirror: false, radius: 0 },
  { name: "Gazette", about: "Un journal des années 30 : manchette, colonnes, photos en trame, tampon rouge « Édition spéciale ». Se lit en défilant.", base: "sommaire", paper: "#ece6d6", ink: "#151311", hl: "#b3261e",
    font_title: "Playfair Display", font_ui: "Courier Prime", font_body: "EB Garamond", title_case: "none", title_size: 1.25, title_fx: "none", frame: "none", deco: "none", img: "auto", menu_style: "underline",
    grain: 0.35, vignette: 0.15, scan: 0, pt: "none", intro: "auto", cursor: "none", win: false, mirror: false, radius: 0 },
  { name: "Jazz bar 2499", about: "Lumière ambrée, titre en néon chaud, double filet, photo sépia. Rétro-futur feutré.", base: "cathedrale", paper: "#120d09", ink: "#f1e4cc", hl: "#e0a24a",
    font_title: "DM Serif Display", font_ui: "Josefin Sans", font_body: "EB Garamond", title_case: "none", title_size: 1.15, title_fx: "neon", frame: "double", deco: "none", img: "sepia", menu_style: "underline",
    grain: 0.5, vignette: 0.6, scan: 0, pt: "couronne", intro: "cinema", cursor: "spot", win: true, mirror: false, radius: "auto" },
  { name: "Terminal 1999", about: "Écran cathodique vert, titre qui glitche, HUD, image en noir et blanc.", base: "vhs", paper: "#030805", ink: "#a8ffb0", hl: "#39ff6a",
    font_title: "VT323", font_ui: "Courier Prime", font_body: "Courier Prime", title_case: "upper", title_size: 1.3, title_fx: "glitch", frame: "screen", deco: "hud", img: "bw", menu_style: "block",
    grain: 0.3, scan: 0.7, vignette: 0.5, pt: "vhs", intro: "vhs", cursor: "lab", win: true, mirror: false, radius: 0 },
  { name: "Dossier classé", about: "Papier, machine à écrire, titre tamponné, coins de visée, menu à droite.", base: "yorha", paper: "#e9e1cf", ink: "#2a2620", hl: "#b3261e",
    font_title: "Special Elite", font_ui: "Courier Prime", font_body: "Courier Prime", title_case: "upper", title_size: 1, title_fx: "stamp", frame: "corners", deco: "lines", img: "bw", menu_style: "box",
    grain: 0.45, vignette: 0.3, scan: 0, pt: "yorha", intro: "yorha", cursor: "cross", win: true, mirror: true, radius: 0 },
  { name: "Néon de minuit", about: "Ville la nuit : grille, bichromie rose, boutons en pilule, halo sous la souris.", base: "eve", paper: "#07051a", ink: "#f2eaff", hl: "#ff3fa4",
    font_title: "Audiowide", font_ui: "Orbitron", font_body: "Sora", title_case: "upper", title_size: 1.1, title_fx: "neon", frame: "none", deco: "grid", img: "duo", menu_style: "pill",
    grain: 0.15, scan: 0.2, vignette: 0.5, pt: "eve", intro: "eve", cursor: "glow", win: true, mirror: false, radius: 14 },
  { name: "Encre et papier", about: "Washi clair, grand titre vertical, sans fenêtre ni image : le texte et le sceau.", base: "sengoku", paper: "#efe7d6", ink: "#1b1712", hl: "#c0262d",
    font_title: "Shippori Mincho", font_ui: "Zen Kaku Gothic New", font_body: "Shippori Mincho", title_case: "none", title_size: 1.4, title_fx: "none", frame: "none", deco: "none", img: "none", menu_style: "underline",
    grain: 0.35, vignette: 0.15, scan: 0, pt: "sengoku", intro: "sengoku", cursor: "trail", win: false, mirror: false, radius: 0 },
];
