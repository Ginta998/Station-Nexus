import { useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import { THEMES } from "@/lib/themes";

// Bibliothèques de l'Atelier de thèmes
export const FONTS = ["Space Grotesk", "Orbitron", "Rajdhani", "Audiowide", "Exo 2", "Oxanium", "Chakra Petch", "Syncopate", "Michroma", "Unbounded", "Sora", "Outfit", "Manrope", "Cinzel", "Cormorant Garamond", "Playfair Display", "Marcellus", "DM Serif Display", "Shippori Mincho", "Noto Serif JP", "Zen Kaku Gothic New", "Bebas Neue", "Anton", "Righteous", "Monoton", "Major Mono Display", "IBM Plex Mono", "JetBrains Mono", "VT323", "Press Start 2P",
  "Syne", "Lexend", "Teko", "Jura", "Aldrich", "Electrolize", "Quantico", "Zen Dots", "Turret Road", "Share Tech Mono", "Nova Mono", "Bungee", "Staatliches",
  "Fraunces", "Spectral", "EB Garamond", "IM Fell English", "Bodoni Moda", "Cormorant", "Forum", "Italiana", "Gloock",
  "Dela Gothic One", "Yuji Syuku", "RocknRoll One", "Reggae One", "Hina Mincho", "Caveat", "Fredoka"];
export const FX = [["stars", "Étoiles"], ["particles", "Particules"], ["snow", "Neige"], ["rain", "Pluie"], ["petals", "Pétales"], ["embers", "Braises"], ["fireflies", "Lucioles"], ["fog", "Brouillard"]];
// Curseurs personnalisés d'un thème (les formes custom prennent la couleur d'accent au runtime).
export const CURSORS = [["default", "Système"], ["crosshair", "Viseur"], ["glow", "Halo"], ["ring", "Anneau"], ["dot", "Point"]];
export const KEY_SOUNDS = [["none", "Aucun"], ["mecanique", "Clavier mécanique"], ["machine", "Machine à écrire"], ["bulle", "Bulle"], ["cristal", "Cristal"], ["laser", "Laser"], ["doux", "Feutré"], ["8bit", "Rétro 8-bit"], ["goutte", "Goutte d'eau"]];
export const PALETTES = [
  ["Nuit cobalt", ["#04060d", "#070b15", "#3f86ff", "#4fd6ff", "#eaf1ff", "#8392a8"]],
  ["Synthwave", ["#0d0221", "#150535", "#ff2a6d", "#05d9e8", "#f6e8ff", "#a48fc7"]],
  ["Sakura", ["#0a0609", "#140a10", "#ff4f7b", "#ffc4d4", "#ffeef3", "#b58a97"]],
  ["Forge", ["#0b0604", "#170c07", "#ff6a1a", "#ffc14a", "#fff1e0", "#b4937a"]],
  ["Émeraude", ["#030906", "#07140d", "#3ddc84", "#a6f4c5", "#e8fff1", "#86a895"]],
  ["Améthyste", ["#08040f", "#110a1e", "#a35cff", "#e0b3ff", "#f4eaff", "#9b8bb0"]],
  ["Glace", ["#060b10", "#0b141c", "#8fd4f0", "#d6f2ff", "#eef9ff", "#89a4b4"]],
  ["Or noir", ["#050505", "#0d0c0a", "#e6be6e", "#f5d98a", "#f7f1e3", "#9c927e"]],
  ["Papier", ["#efe9dc", "#e5ddcb", "#1a1611", "#8c7a46", "#1a1611", "#6c6150"]],
  ["Opera rouge", ["#0a0406", "#16080c", "#fa1e4e", "#ff7a93", "#ffecef", "#b08b93"]],
];
export const GRADIENTS = [["#0d0221", "#ff2a6d", "#05d9e8"], ["#04060d", "#14306b", "#4fd6ff"], ["#0a0609", "#5a1030", "#ffc4d4"], ["#0b0604", "#6a1d05", "#ffb03a"], ["#030906", "#0d4a2a", "#a6f4c5"], ["#08040f", "#3a1470", "#e0b3ff"], ["#000000", "#1a1a1a", "#555555"], ["#10002b", "#240046", "#ff9e00"]];
const VAR_MAP = { bg: "--bg-primary", bg2: "--bg-secondary", brand: "--brand", brand2: "--brand-2", text: "--text-primary", text2: "--text-secondary", border: "--border-c" };
const BLANK = {
  name: "Nouveau thème", kanji: "新", tagline: "", base: "abysse", enabled: true, public: false,
  colors: { bg: "#04060d", bg2: "#070b15", brand: "#3f86ff", brand2: "#4fd6ff", text: "#eaf1ff", text2: "#8392a8", border: "rgba(170,195,235,.16)" },
  font_display: "Space Grotesk", font_body: "Space Grotesk", transform: "none", spacing: 0.01,
  radius: 10, border_w: 1, blur: 12, shadow: 40, cursor: "default",
  bg: { type: "scene", url: "", g: ["#04060d", "#14306b", "#4fd6ff"], angle: 160, dim: 30 },
  fx: {}, fx_color: "#ffffff", sfx_pack: "auto", click_url: "", key_sound: "none", key_url: "", ambience_id: "",
};
const pal = (n) => PALETTES.find((p) => p[0] === n)[1];
const col = (c) => ({ bg: c[0], bg2: c[1], brand: c[2], brand2: c[3], text: c[4], text2: c[5], border: "rgba(255,255,255,.12)" });
// Modèles Nexus OS : des univers complets (scène composée, blocs, menu, mouvement, polices, sons), pas seulement des couleurs.
const KEYS = ["entete", "une", "sortie", "rapide", "explorer", "univers", "journal", "vision", "embarquement", "soutien"];
const hab = (all = {}, per = {}) => Object.fromEntries(KEYS.map((k) => [k, { ...all, ...(per[k] || {}) }]));
const compose = (layers) => ({ type: "compose", layers, g: layers.ciel || ["#0b1530", "#3b4a7a", "#e9a37a"], angle: 180, dim: 0 });
export const PRESETS = [
  { key: "os-ciel", name: "Grand Large", kanji: "夏", tagline: "L'été n'a pas de fin ici", base: "albatre", sfx_pack: "albatre",
    colors: { bg: "#eaf1f4", bg2: "#fbf8f1", brand: "#cf4f36", brand2: "#2f7fa8", text: "#1f2a33", text2: "#5a6873", border: "rgba(31,42,51,.14)" },
    font_display: "Playfair Display", font_body: "Manrope", radius: 14, blur: 10, shadow: 18, souris: "profondeur",
    bg: compose({ decor: "ocean-plage", decors: ["ocean-baie", "ocean-falaises", "ete-plaine", "ocean-calme"], decorMode: "visite", nuages: 0, brume: 0, grain: 0, vignette: 0 }),
    fx: {}, key_sound: "doux",
    blocs: { v: { entete: "discret", une: "cadre", rapide: "comptoir", univers: "galerie", journal: "polaroids", vision: "lettre", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu" }, { vision: { espace: "aere" }, soutien: { espace: "aere" }, journal: { titre: "centre" }, univers: { titre: "centre" } }), repos: "flotte", survol: "", etagere: "papier" },
    menu: { pos: "fixe", mat: "papier", icones: "pixel" }, anim: { parallaxe: "leger", lancement: "" } },
  { key: "os-salon", name: "Lanterne", kanji: "灯", tagline: "La dernière lampe encore allumée", base: "aurum", sfx_pack: "aurum",
    colors: { bg: "#17110d", bg2: "#231a13", brand: "#e2a45c", brand2: "#c9775b", text: "#f3e6d2", text2: "#b9a58c", border: "rgba(243,230,210,.12)" },
    font_display: "Cormorant Garamond", font_body: "Manrope", radius: 10, blur: 10, shadow: 50, souris: "lampe",
    bg: compose({ decor: "", ciel: ["#110b08", "#291a11", "#5b3722"], astre: { f: "soleil", c: "#ffb66c", x: 18, y: 78, t: 260, h: 95 }, brume: 20, grain: 28, vignette: 60 }),
    fx: { particles: 12 }, fx_color: "#ffcf8a", key_sound: "machine",
    blocs: { v: { une: "cadre", rapide: "comptoir", univers: "accordeon", journal: "liste", vision: "lettre", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu", titre: "barre" }), repos: "balance", survol: "eclaire", etagere: "bois" },
    menu: { icones: "bloc", mat: "plein" }, anim: { lancement: "" } },
  { key: "os-brume", name: "Heure mauve", kanji: "霞", tagline: "Juste avant que le monde se réveille", base: "albatre", sfx_pack: "albatre",
    colors: { bg: "#f1ecf3", bg2: "#fbf8fb", brand: "#8f63a8", brand2: "#df907f", text: "#2c2433", text2: "#6c6274", border: "rgba(44,36,51,.12)" },
    font_display: "Shippori Mincho", font_body: "Zen Kaku Gothic New", radius: 18, blur: 10, shadow: 14, souris: "profondeur",
    bg: compose({ decor: "nuages-rose", decors: ["nuages-turquoise", "nuages-blanc", "nuages-blanc-or"], decorMode: "minutes", decorMin: 8, brume: 45, grain: 0, vignette: 0, lum: 108, sat: 85 }),
    fx: { petals: 18 }, fx_color: "#f4c3cf", key_sound: "cristal",
    blocs: { v: { entete: "geant", une: "ecran", rapide: "carnet", univers: "galerie", journal: "polaroids", vision: "citation", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu", titre: "centre" }, { vision: { espace: "aere" } }), repos: "flotte", survol: "eclaire", etagere: "verre" },
    menu: { pos: "dock", mat: "verre", icones: "arrondi" }, anim: { parallaxe: "leger", lancement: "envol" } },
  { key: "os-royaume", name: "Citadelle de givre", kanji: "城", tagline: "Les sommets gardent les vieilles histoires", base: "aurum", sfx_pack: "aurum",
    colors: { bg: "#141a24", bg2: "#1e2633", brand: "#c9a24d", brand2: "#9a3a2f", text: "#efe7d4", text2: "#aab0bb", border: "rgba(201,162,77,.22)" },
    font_display: "IM Fell English", font_body: "EB Garamond", radius: 4, blur: 10, shadow: 45, souris: "profondeur",
    bg: compose({ decor: "sommet", decors: ["hiver-sapins", "hiver-banquise", "hiver-plaine", "hiver-sapins-aube"], decorMode: "visite", lum: 62, sat: 90, brume: 25, grain: 10, vignette: 55 }),
    fx: { snow: 25 }, fx_color: "#ffffff", key_sound: "machine",
    blocs: { v: { une: "cadre", rapide: "vitrines", univers: "accordeon", journal: "liste", vision: "lettre", soutien: "lettre", embarquement: "membre" }, off: [], hab: hab({ entree: "glisse", titre: "barre" }), repos: "incline", survol: "eclaire", etagere: "bois" },
    menu: { pos: "fixe", mat: "plein", icones: "carnet" }, anim: { parallaxe: "leger", lancement: "tour" } },
  { key: "os-maudites", name: "Akatsuki", kanji: "暁", tagline: "Quand la lune rougit, la mer se tait", base: "neant", sfx_pack: "neant",
    colors: { bg: "#08070a", bg2: "#120f14", brand: "#c0302f", brand2: "#d7c3a0", text: "#ece4dc", text2: "#9b8f88", border: "rgba(192,48,47,.22)" },
    font_display: "Cinzel", font_body: "Spectral", radius: 2, blur: 8, shadow: 60, souris: "profondeur",
    bg: compose({ decor: "ocean-nuit", decors: ["ocean-gris", "ete-pic-nuit"], decorMode: "visite", teinte: 150, sat: 120, lum: 70, brume: 35, grain: 18, vignette: 75 }),
    fx: { embers: 30 }, fx_color: "#ff6a3a", key_sound: "mecanique",
    blocs: { v: { une: "affiche", rapide: "vitrines", univers: "accordeon", journal: "liste", vision: "citation" }, off: [], hab: hab({ entree: "fondu", titre: "kanji" }), repos: "incline", survol: "tourne", etagere: "metal" },
    menu: { pos: "cote", mat: "transparent", icones: "cyber" }, anim: { parallaxe: "forte", lancement: "plongee" } },
  { key: "os-seance", name: "Dernière séance", kanji: "映", tagline: "La salle s'éteint, l'affiche s'allume", base: "akira", sfx_pack: "akira",
    colors: { bg: "#0d0d0d", bg2: "#171717", brand: "#e5432d", brand2: "#f0b51e", text: "#f6eee2", text2: "#a89f94", border: "rgba(246,238,226,.14)" },
    font_display: "Bebas Neue", font_body: "Inter", transform: "uppercase", radius: 0, blur: 6, shadow: 40, souris: "ondes",
    bg: compose({ decor: "", ciel: ["#0a0a0a", "#141010", "#24110f"], astre: { f: "", c: "#fff1d0", x: 50, y: -8, t: 100, h: 0 }, rayons: 35, grain: 30, vignette: 70 }),
    fx: {}, key_sound: "mecanique",
    blocs: { v: { une: "affiche", sortie: "geant", rapide: "comptoir", univers: "accordeon", journal: "cartes", vision: "citation" }, off: ["entete"], hab: hab({ entree: "glisse", titre: "geant" }), repos: "", survol: "tourne", etagere: "aucune" },
    menu: { pos: "cote", mat: "transparent", icones: "8bit" }, anim: { parallaxe: "leger", lancement: "tour" } },
  { key: "os-tokyo", name: "Ville néon", kanji: "雨", tagline: "Les flaques gardent la couleur des enseignes", base: "megapole", colors: col(pal("Nuit cobalt")), font_display: "Chakra Petch", font_body: "Rajdhani", radius: 6, blur: 10, shadow: 50, souris: "profondeur",
    bg: compose({ decor: "ville-nuit", decors: ["ville-minuit", "ville-violette", "ville-bleue", "ville-rose"], decorMode: "minutes", decorMin: 10, brume: 25, grain: 10, vignette: 40 }),
    fx: { rain: 60 }, fx_color: "#9fd8ff", key_sound: "mecanique",
    blocs: { v: { une: "ecran", rapide: "comptoir", univers: "galerie" }, off: [], hab: hab({ entree: "glisse" }, { journal: { fond: "verre" }, vision: { fond: "verre" } }), survol: "eclaire", etagere: "verre" },
    menu: { pos: "fixe", mat: "verre", icones: "hud" }, anim: { parallaxe: "leger", lancement: "plongee" } },
  { key: "os-foret", name: "Hotaru", kanji: "蛍", tagline: "Les lucioles connaissent le chemin", base: "biome", colors: col(pal("Émeraude")), font_display: "Marcellus", font_body: "Manrope", radius: 14, blur: 10, shadow: 30, souris: "lucioles",
    bg: compose({ decor: "foret-peinte", decors: ["ete-foret", "ete-sapins"], decorMode: "visite", lum: 42, sat: 80, teinte: 0, brume: 30, grain: 8, vignette: 55 }),
    fx: {}, fx_color: "#d8ff8a", key_sound: "goutte",
    blocs: { v: { une: "cadre", rapide: "carnet", univers: "galerie", journal: "polaroids", vision: "lettre", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu" }), repos: "flotte", survol: "eclaire", etagere: "bois" },
    menu: { mat: "verre", icones: "carnet" }, anim: { parallaxe: "leger", lancement: "" } },
  { key: "os-labo", name: "Protocole", kanji: "研", tagline: "Rien n'entre ici sans être mesuré", base: "labo", sfx_pack: "laboratoire", souris: "labo",
    bg: { type: "scene" }, fx: {},
    blocs: { v: { une: "ecran", rapide: "vitrines", univers: "galerie", journal: "liste", vision: "manifeste", embarquement: "membre", soutien: "bandeau" }, off: [], hab: hab({ entree: "glisse", titre: "barre" }), repos: "", survol: "tourne", etagere: "metal" },
    menu: { pos: "cote", mat: "plein", icones: "8bit" }, anim: { lancement: "tour" } },
  { key: "os-ocean", name: "Marée d'ambre", kanji: "海", tagline: "Le soleil fond dans l'eau", base: "neptune", sfx_pack: "neptune",
    colors: { bg: "#151826", bg2: "#1f2335", brand: "#f2a36b", brand2: "#9ec5e8", text: "#f4ede6", text2: "#a7a9b8", border: "rgba(244,237,230,.14)" },
    font_display: "DM Serif Display", font_body: "Manrope", radius: 16, blur: 10, shadow: 30, souris: "profondeur",
    bg: compose({ decor: "ocean-couchant", decors: ["ocean-baie-aube", "ocean-calme", "ete-plaine-or", "ocean-nuit"], decorMode: "heure", brume: 0, grain: 0, vignette: 25 }),
    fx: {}, key_sound: "doux",
    blocs: { v: { une: "ecran", rapide: "comptoir", univers: "accordeon", journal: "polaroids", vision: "citation", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu" }), repos: "flotte", survol: "eclaire", etagere: "verre" },
    menu: { icones: "arrondi", pos: "dock", mat: "verre" }, anim: { parallaxe: "leger", lancement: "envol" } },
];
// Modèles pour démarrer un thème à soi : pas des copies des 10 thèmes, des univers qui vivent avec le temps.
// Chacun porte une collection de décors (matin, journée, crépuscule, nuit — ou au hasard, ou en boucle),
// son effet de souris, ses particules, son pack d'icônes, son lancement, ses blocs et ses sons.
const vie = (decors, mode = "heure", over = {}) => compose({ decor: decors[0], decors: decors.slice(1), decorMode: mode, decorPublic: true, ...over });
export const MODELES = [
  { key: "m-cote", name: "Côte sauvage", kanji: "潮", tagline: "La marée suit l'horloge", base: "neptune", sfx_pack: "neptune",
    colors: { bg: "#0f1c2b", bg2: "#16283b", brand: "#ffb27a", brand2: "#7fd3e6", text: "#f3f1ea", text2: "#a9b8c4", border: "rgba(243,241,234,.14)" },
    font_display: "DM Serif Display", font_body: "Manrope", radius: 18, blur: 14, shadow: 30, souris: "profondeur",
    bg: vie(["ocean-baie-aube", "ocean-plage", "ocean-couchant", "ocean-plage-nuit"], "heure", { brume: 10, vignette: 25 }),
    fx: { particles: 10 }, fx_color: "#fff4dc", key_sound: "goutte",
    blocs: { v: { entete: "geant", une: "ecran", rapide: "carnet", univers: "galerie", journal: "polaroids", vision: "citation", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu", fond: "verre" }, { vision: { espace: "aere" } }), repos: "flotte", survol: "eclaire", etagere: "verre" },
    menu: { pos: "dock", mat: "verre", icones: "arrondi" }, anim: { parallaxe: "forte", lancement: "envol" }, pages: { panneaux: "verre", titres: "centre", transition: "fondu" } },
  { key: "m-col", name: "Col des neiges", kanji: "雪", tagline: "Le refuge s'allume quand le soleil tombe", base: "aurum", sfx_pack: "glacier",
    colors: { bg: "#121722", bg2: "#1b2230", brand: "#9fd0ff", brand2: "#e8b06a", text: "#eef3fa", text2: "#a2adbd", border: "rgba(159,208,255,.2)" },
    font_display: "Cinzel", font_body: "EB Garamond", radius: 6, blur: 12, shadow: 45, souris: "lampe",
    bg: vie(["hiver-sapins-aube", "hiver-sapins", "hiver-lac", "hiver-nuit"], "heure", { brume: 20, grain: 8, vignette: 45 }),
    fx: { snow: 35 }, fx_color: "#ffffff", key_sound: "machine",
    blocs: { v: { entete: "titre", une: "cadre", sortie: "bandeau", rapide: "vitrines", univers: "accordeon", journal: "liste", vision: "lettre", soutien: "bandeau", embarquement: "membre" }, off: [], hab: hab({ entree: "glisse", titre: "barre" }), repos: "incline", survol: "eclaire", etagere: "bois" },
    menu: { pos: "fixe", mat: "plein", icones: "carnet" }, anim: { parallaxe: "leger", lancement: "tour" }, pages: { panneaux: "plein", titres: "barre", transition: "voile" } },
  { key: "m-boulevard", name: "Boulevard néon", kanji: "街", tagline: "La ville change d'humeur toutes les heures", base: "megapole", sfx_pack: "megapole",
    colors: { bg: "#0b0b16", bg2: "#141427", brand: "#ff4fa3", brand2: "#3fe0ff", text: "#f4f0ff", text2: "#9d98b8", border: "rgba(255,79,163,.22)" },
    font_display: "Oxanium", font_body: "Rajdhani", transform: "uppercase", radius: 4, blur: 10, shadow: 55, souris: "labo",
    bg: vie(["ville-rose", "ville-bleue", "ville-crepuscule", "ville-minuit"], "heure", { grain: 12, vignette: 45 }),
    fx: { rain: 45 }, fx_color: "#9fe9ff", key_sound: "mecanique",
    blocs: { v: { entete: "discret", une: "affiche", sortie: "geant", rapide: "comptoir", univers: "galerie", journal: "cartes", vision: "manifeste" }, off: [], hab: hab({ entree: "glisse", titre: "geant", fond: "verre" }), repos: "", survol: "tourne", etagere: "metal" },
    menu: { pos: "cote", mat: "transparent", icones: "hexa" }, anim: { parallaxe: "forte", lancement: "plongee" }, pages: { panneaux: "verre", titres: "geant", transition: "iris" } },
  { key: "m-vacances", name: "Grandes vacances", kanji: "夏", tagline: "Des lucioles quand la nuit tombe sur la plaine", base: "biome", sfx_pack: "biome",
    colors: { bg: "#13201a", bg2: "#1b2c23", brand: "#ffd45c", brand2: "#7ee08a", text: "#f6f4e8", text2: "#b4bda9", border: "rgba(255,212,92,.2)" },
    font_display: "Righteous", font_body: "Lexend", radius: 20, blur: 10, shadow: 25, souris: "lucioles",
    bg: vie(["ete-plaine", "ete-pic", "ete-plaine-or", "ete-pic-nuit"], "heure", { vignette: 20 }),
    fx: { fireflies: 18 }, fx_color: "#fff3a0", key_sound: "doux",
    blocs: { v: { entete: "geant", une: "cadre", rapide: "cartes", univers: "galerie", journal: "polaroids", vision: "lettre", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu", titre: "centre" }), repos: "balance", survol: "eclaire", etagere: "papier" },
    menu: { pos: "dock", mat: "verre", icones: "pixel" }, anim: { parallaxe: "leger", lancement: "ejecte" }, pages: { panneaux: "papier", titres: "centre", transition: "fondu" } },
  { key: "m-nuages", name: "Mer de nuages", kanji: "雲", tagline: "Au-dessus de tout, le ciel tourne", base: "albatre", sfx_pack: "albatre",
    colors: { bg: "#1d1a2b", bg2: "#28243a", brand: "#f6a6c1", brand2: "#a9c7ff", text: "#f7f2fa", text2: "#b8b0c6", border: "rgba(246,166,193,.2)" },
    font_display: "Shippori Mincho", font_body: "Zen Kaku Gothic New", radius: 22, blur: 16, shadow: 20, souris: "profondeur",
    bg: vie(["nuages-rose", "nuages-blanc", "nuages-blanc-or", "nuages-lune"], "heure", { brume: 30, lum: 104 }),
    fx: { petals: 14 }, fx_color: "#ffd1e0", key_sound: "cristal",
    blocs: { v: { entete: "geant", une: "ecran", rapide: "carnet", univers: "accordeon", journal: "polaroids", vision: "citation", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu", titre: "kanji" }, { vision: { espace: "aere" } }), repos: "flotte", survol: "eclaire", etagere: "verre" },
    menu: { pos: "dock", mat: "verre", icones: "kanji" }, anim: { parallaxe: "leger", lancement: "feuillette" }, pages: { panneaux: "verre", titres: "centre", transition: "iris" } },
  { key: "m-lointain", name: "Terres lointaines", kanji: "旅", tagline: "Chaque visite, un autre bout du monde", base: "aurum", sfx_pack: "aurum",
    colors: { bg: "#1a140f", bg2: "#251c15", brand: "#e9a25a", brand2: "#7fb0a6", text: "#f2e8da", text2: "#b5a591", border: "rgba(233,162,90,.2)" },
    font_display: "IM Fell English", font_body: "Spectral", radius: 8, blur: 10, shadow: 40, souris: "lampe",
    bg: vie(["desert", "sommet", "foret-peinte", "ete-orage", "ocean-falaises"], "visite", { grain: 18, vignette: 50 }),
    fx: { embers: 14 }, fx_color: "#ffb36b", key_sound: "machine",
    blocs: { v: { entete: "titre", une: "affiche", rapide: "carnet", univers: "accordeon", journal: "liste", vision: "lettre", soutien: "lettre" }, off: [], hab: hab({ entree: "glisse", titre: "barre" }), repos: "incline", survol: "eclaire", etagere: "bois" },
    menu: { pos: "fixe", mat: "papier", icones: "carnet" }, anim: { parallaxe: "leger", lancement: "feuillette" }, pages: { panneaux: "papier", titres: "barre", transition: "voile" } },
  { key: "m-archipel", name: "Archipel", kanji: "島", tagline: "On change d'île toutes les six minutes", base: "neptune", sfx_pack: "neptune",
    colors: { bg: "#f0f4f1", bg2: "#fbfbf7", brand: "#1f8a8a", brand2: "#e0794c", text: "#1c2a2a", text2: "#5b6b69", border: "rgba(28,42,42,.14)" },
    font_display: "Fraunces", font_body: "Manrope", radius: 16, blur: 10, shadow: 16, souris: "profondeur",
    bg: vie(["ocean-falaises", "ocean-baie", "ete-maison", "ocean-calme", "ete-ciel"], "minutes", { decorMin: 6, vignette: 0 }),
    fx: {}, key_sound: "doux",
    blocs: { v: { entete: "discret", une: "cadre", rapide: "comptoir", univers: "galerie", journal: "polaroids", vision: "lettre", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu" }, { journal: { titre: "centre" } }), repos: "flotte", survol: "eclaire", etagere: "papier" },
    menu: { pos: "fixe", mat: "papier", icones: "bloc" }, anim: { parallaxe: "leger", lancement: "" }, pages: { panneaux: "papier", titres: "centre", transition: "fondu" } },
  { key: "m-orage", name: "Avant l'orage", kanji: "嵐", tagline: "Le ciel gronde, on clique, il répond", base: "neant", sfx_pack: "neant",
    colors: { bg: "#0d1014", bg2: "#161b21", brand: "#d9e45a", brand2: "#8aa0b8", text: "#e9edf1", text2: "#97a3ae", border: "rgba(217,228,90,.18)" },
    font_display: "Bebas Neue", font_body: "Inter", transform: "uppercase", radius: 2, blur: 8, shadow: 60, souris: "ondes",
    bg: vie(["ete-orage", "ocean-gris", "hiver-glace", "nuages-lune"], "visite", { lum: 82, sat: 85, brume: 25, grain: 20, vignette: 70 }),
    fx: { rain: 70, fog: 25 }, fx_color: "#cfd9e6", key_sound: "mecanique",
    blocs: { v: { entete: "discret", une: "affiche", sortie: "geant", rapide: "vitrines", univers: "accordeon", journal: "liste", vision: "manifeste" }, off: [], hab: hab({ entree: "glisse", titre: "geant" }), repos: "", survol: "tourne", etagere: "metal" },
    menu: { pos: "cote", mat: "plein", icones: "8bit" }, anim: { parallaxe: "forte", lancement: "plongee" }, pages: { panneaux: "plein", titres: "geant", transition: "voile" } },
  // Les scènes animées des thèmes classiques, habillées autrement
  { key: "m-glacier", name: "Glacier éternel", kanji: "氷", tagline: "Le froid garde tout intact", base: "glacier", sfx_pack: "glacier", souris: "lampe",
    colors: { bg: "#070d12", bg2: "#0f1a22", brand: "#8fd4f0", brand2: "#d6f2ff", text: "#eaf6fb", text2: "#9bb3c0", border: "rgba(143,212,240,.18)" },
    bg: { type: "scene", scene: "glacier", tune: { lum: 105, vit: 70 } }, fx: { snow: 30 }, fx_color: "#e8f6ff", key_sound: "cristal", font_display: "Cinzel", font_body: "Spectral",
    blocs: { v: { entete: "titre", une: "cadre", rapide: "vitrines", univers: "accordeon", journal: "liste", vision: "lettre", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu", titre: "barre" }), repos: "incline", survol: "eclaire", etagere: "verre" },
    menu: { pos: "fixe", mat: "verre", icones: "bloc" }, anim: { parallaxe: "leger", lancement: "tour" }, pages: { panneaux: "verre", titres: "barre", transition: "voile" } },
  { key: "m-abysse", name: "Grand fond", kanji: "淵", tagline: "Plus on descend, plus ça brille", base: "abysse", sfx_pack: "neptune", souris: "profondeur",
    colors: { bg: "#04060d", bg2: "#0b1222", brand: "#4fd6ff", brand2: "#3f86ff", text: "#e8f0ff", text2: "#93a3c0", border: "rgba(79,214,255,.18)" },
    bg: { type: "scene", scene: "abysse", tune: { vit: 80 } }, fx: { particles: 22 }, fx_color: "#7ff0ff", key_sound: "goutte", font_display: "Unbounded", font_body: "Manrope",
    blocs: { v: { entete: "geant", une: "ecran", rapide: "cartes", univers: "galerie", journal: "polaroids", vision: "citation", soutien: "bandeau" }, off: [], hab: hab({ entree: "zoom", fond: "verre" }), repos: "flotte", survol: "eclaire", etagere: "verre" },
    menu: { pos: "dock", mat: "verre", icones: "hexa" }, anim: { parallaxe: "forte", lancement: "plongee" }, pages: { panneaux: "verre", titres: "centre", transition: "iris" } },
  { key: "m-elysium", name: "Champs Élysées", kanji: "楽", tagline: "Le jardin des héros au repos", base: "olympe", sfx_pack: "albatre", souris: "lucioles",
    colors: { bg: "#0b0b0d", bg2: "#16161a", brand: "#e8d9a8", brand2: "#9aa3b1", text: "#f1eee6", text2: "#a9a69c", border: "rgba(232,217,168,.18)" },
    bg: { type: "scene", scene: "olympe" }, fx: { petals: 16 }, fx_color: "#ffe9a8", key_sound: "doux", font_display: "Cormorant Garamond", font_body: "EB Garamond",
    blocs: { v: { entete: "titre", une: "affiche", rapide: "carnet", univers: "accordeon", journal: "polaroids", vision: "lettre", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu", titre: "centre" }), repos: "balance", survol: "eclaire", etagere: "papier" },
    menu: { pos: "fixe", mat: "papier", icones: "carnet" }, anim: { parallaxe: "leger", lancement: "feuillette" }, pages: { panneaux: "papier", titres: "centre", transition: "fondu" } },
  { key: "m-supernova", name: "Supernova", kanji: "爆", tagline: "Une étoile meurt, une Station naît", base: "supernova", sfx_pack: "akira", souris: "ondes",
    colors: { bg: "#0a0503", bg2: "#170b06", brand: "#ff5a1a", brand2: "#ffab4a", text: "#fff0e2", text2: "#c09a80", border: "rgba(255,90,26,.22)" },
    bg: { type: "scene", scene: "supernova" }, fx: { embers: 26 }, fx_color: "#ffb36b", key_sound: "mecanique", font_display: "Anton", font_body: "Inter", transform: "uppercase",
    blocs: { v: { entete: "geant", une: "ecran", sortie: "geant", rapide: "comptoir", univers: "galerie", journal: "cartes", vision: "manifeste" }, off: [], hab: hab({ entree: "glisse", titre: "geant" }), repos: "", survol: "tourne", etagere: "metal" },
    menu: { pos: "cote", mat: "plein", icones: "cyber" }, anim: { parallaxe: "forte", lancement: "plongee" }, pages: { panneaux: "plein", titres: "geant", transition: "iris" } },
  { key: "m-yorha", name: "Unité 2B", kanji: "機", tagline: "Gloire à l'humanité", base: "yorha", sfx_pack: "laboratoire", souris: "labo",
    colors: { bg: "#d9d2c0", bg2: "#e6e0d0", brand: "#4a4436", brand2: "#8c1d1d", text: "#1a1712", text2: "#5a5446", border: "rgba(26,23,18,.2)" },
    bg: { type: "scene", scene: "yorha" }, fx: {}, key_sound: "machine", font_display: "Michroma", font_body: "Rajdhani",
    blocs: { v: { entete: "discret", une: "cadre", rapide: "vitrines", univers: "galerie", journal: "liste", vision: "manifeste", embarquement: "membre", soutien: "bandeau" }, off: [], hab: hab({ entree: "glisse", titre: "barre" }), repos: "", survol: "tourne", etagere: "metal" },
    menu: { pos: "fixe", mat: "plein", icones: "hud" }, anim: { parallaxe: "leger", lancement: "tour" }, pages: { panneaux: "plein", titres: "barre", transition: "voile" } },
  { key: "m-aincrad", name: "Château flottant", kanji: "城", tagline: "Cent étages, une seule vie", base: "aincradnight", sfx_pack: "aurum", souris: "lucioles",
    colors: { bg: "#050a16", bg2: "#0c1426", brand: "#39a8ff", brand2: "#ff9a3c", text: "#eaf2ff", text2: "#94a6c4", border: "rgba(57,168,255,.2)" },
    bg: { type: "scene", scene: "aincradnight" }, fx: { fireflies: 16 }, fx_color: "#bfe6ff", key_sound: "cristal", font_display: "Marcellus", font_body: "Lexend",
    blocs: { v: { entete: "titre", une: "ecran", rapide: "vitrines", univers: "galerie", journal: "polaroids", vision: "citation", soutien: "lettre" }, off: [], hab: hab({ entree: "zoom" }), repos: "flotte", survol: "eclaire", etagere: "bois" },
    menu: { pos: "dock", mat: "verre", icones: "pixel" }, anim: { parallaxe: "forte", lancement: "envol" }, pages: { panneaux: "verre", titres: "centre", transition: "fondu" } },
  { key: "m-frontiere", name: "Frontière", kanji: "境", tagline: "Au bord de la carte, il reste à écrire", base: "frontiere", sfx_pack: "biome", souris: "lampe",
    colors: { bg: "#0d0806", bg2: "#1a110c", brand: "#e8692a", brand2: "#4fd6c6", text: "#f6ece2", text2: "#b39c88", border: "rgba(232,105,42,.2)" },
    bg: { type: "scene", scene: "frontiere" }, fx: { particles: 8 }, fx_color: "#ffd8a0", key_sound: "machine", font_display: "IM Fell English", font_body: "Spectral",
    blocs: { v: { entete: "titre", une: "affiche", rapide: "carnet", univers: "accordeon", journal: "liste", vision: "lettre", soutien: "lettre" }, off: [], hab: hab({ entree: "fondu", titre: "barre" }), repos: "incline", survol: "eclaire", etagere: "bois" },
    menu: { pos: "fixe", mat: "papier", icones: "carnet" }, anim: { parallaxe: "leger", lancement: "feuillette" }, pages: { panneaux: "papier", titres: "barre", transition: "voile" } },
  { key: "m-helios", name: "Hélios", kanji: "陽", tagline: "Tout tourne autour d'une seule lumière", base: "helios", sfx_pack: "aurum", souris: "profondeur",
    colors: { bg: "#0a0806", bg2: "#17120c", brand: "#d9a62e", brand2: "#e8524a", text: "#f7efe0", text2: "#b5a58a", border: "rgba(217,166,46,.2)" },
    bg: { type: "scene", scene: "helios" }, fx: { embers: 12 }, fx_color: "#ffd36a", key_sound: "doux", font_display: "Bodoni Moda", font_body: "Manrope",
    blocs: { v: { entete: "geant", une: "cadre", rapide: "comptoir", univers: "galerie", journal: "cartes", vision: "citation", soutien: "bandeau" }, off: [], hab: hab({ entree: "zoom", titre: "centre" }), repos: "flotte", survol: "eclaire", etagere: "verre" },
    menu: { pos: "dock", mat: "verre", icones: "bloc" }, anim: { parallaxe: "forte", lancement: "envol" }, pages: { panneaux: "verre", titres: "centre", transition: "iris" } },
];
// Comment chaque thème habille les autres pages
const PAGES_OF = { "os-ciel": ["papier", "centre", "fondu"], "os-salon": ["plein", "barre", "fondu"], "os-brume": ["verre", "centre", "iris"], "os-royaume": ["plein", "barre", "voile"], "os-maudites": ["verre", "geant", "iris"],
  "os-seance": ["plein", "geant", "voile"], "os-tokyo": ["verre", "barre", "voile"], "os-foret": ["verre", "centre", "fondu"], "os-labo": ["plein", "barre", "voile"], "os-ocean": ["verre", "centre", "fondu"] };
PRESETS.forEach((p) => { const g = PAGES_OF[p.key]; if (g) p.pages = { panneaux: g[0], titres: g[1], transition: g[2] }; });
// Les 10 thèmes Nexus OS, intégrés au code : on peut les retoucher (la retouche est enregistrée par-dessus)
export const isOsKey = (k) => typeof k === "string" && k.startsWith("os-");
const OS_BY_KEY = Object.fromEntries(PRESETS.map((p) => [p.key, p]));
export const osTheme = (k) => OS_BY_KEY[k] || null;
export const newTheme = (over = {}) => ({ ...BLANK, ...over, colors: { ...BLANK.colors, ...(over.colors || {}) }, bg: { ...BLANK.bg, ...(over.bg || {}) }, fx: { ...(over.fx || {}) } });

// Store partagé (thèmes en base + brouillon d'aperçu)
// Cache local : le thème retouché s'applique dès le démarrage, sans flash du thème d'origine
const CACHE = "nx-themes-cache";
let state = { docs: [], hidden: [], draft: null };
try { const c = JSON.parse(localStorage.getItem(CACHE)); if (c?.docs) state = { ...state, docs: c.docs, hidden: c.hidden || [] }; } catch (_) {}
const subs = new Set();
const emit = (p) => {
  state = { ...state, ...p }; subs.forEach((f) => f());
  if (p.docs) try { localStorage.setItem(CACHE, JSON.stringify({ docs: state.docs, hidden: state.hidden })); } catch (_) {}
};
const sub = (f) => { subs.add(f); return () => subs.delete(f); };
export const useThemeState = () => useSyncExternalStore(sub, () => state);
export const setDraft = (draft) => emit({ draft });
export async function loadThemes(admin) {
  try {
    if (admin) { const docs = (await api.get("/admin/themes")).data; emit({ docs, hidden: docs.filter((d) => d.enabled === false).map((d) => d.key) }); }
    else { const d = (await api.get("/themes")).data; emit({ docs: d.themes, hidden: d.hidden }); }
  } catch (_) {}
}
export const saveTheme = async (t) => { const d = (await api.put(`/admin/themes/${t.key}`, t)).data; emit({ docs: [...state.docs.filter((x) => x.key !== t.key), d] }); return d; };
export const deleteTheme = async (key) => { await api.delete(`/admin/themes/${key}`); emit({ docs: state.docs.filter((x) => x.key !== key) }); };
export const isCustomKey = (k) => typeof k === "string" && k.startsWith("c-");
export const themeDef = (key, s = state) => {
  const d = s.draft?.key === key ? s.draft : s.docs.find((x) => x.key === key);
  if (isOsKey(key)) return d ? { ...OS_BY_KEY[key], ...d } : OS_BY_KEY[key] || null;
  return d || null;
};
export const baseOf = (key) => { const d = themeDef(key); return isCustomKey(key) || isOsKey(key) ? d?.base || "abysse" : key; };
// Scène animée du fond : celle choisie dans l'éditeur, sinon celle du thème de base
export const sceneOf = (key) => { const d = themeDef(key); return (d?.bg?.type || "scene") === "scene" && d?.bg?.scene ? d.bg.scene : baseOf(key); };
const swatchOf = (d) => [d.colors?.bg, d.colors?.brand, d.colors?.brand2];

// Liste fusionnée pour tous les sélecteurs de thèmes
// Les thèmes d'origine sont masqués par défaut : les 10 thèmes Nexus OS montrent ce que la Station sait faire.
// Un thème d'origine redevient visible quand on l'active dans Nexus OS.
export const DEFAULT_MASKED = THEMES.map((t) => t.key);
export const osList = (s = state) => PRESETS.map((p) => { const d = s.docs.find((x) => x.key === p.key); const t = d ? { ...p, ...d } : p; return { key: p.key, name: t.name, kanji: t.kanji, tagline: t.tagline, swatch: t.colors ? swatchOf(t) : THEMES.find((x) => x.key === t.base)?.swatch || [], enabled: d?.enabled !== false && !d?.deleted, deleted: !!d?.deleted }; });
export function useThemeList() {
  const s = useThemeState();
  const over = (t) => { const d = s.docs.find((x) => x.key === t.key); return d?.colors ? { ...t, name: d.name || t.name, kanji: d.kanji || t.kanji, tagline: d.tagline || t.tagline, swatch: swatchOf(d) } : t; };
  const masked = (t) => DEFAULT_MASKED.includes(t.key) && !s.docs.some((d) => d.key === t.key && d.enabled === true);
  const os = osList(s).filter((t) => t.enabled && !s.hidden.includes(t.key));
  const gone = (k) => s.docs.some((d) => d.key === k && d.deleted);
  const builtins = THEMES.filter((t) => !s.hidden.includes(t.key) && !masked(t) && !gone(t.key)).map(over);
  const customs = s.docs.filter((d) => isCustomKey(d.key) && d.enabled !== false).map((d) => ({ key: d.key, name: d.name, kanji: d.kanji, tagline: d.tagline || "Thème personnalisé", swatch: swatchOf(d) }));
  return [...os, ...builtins, ...customs];
}

// Valeurs CSS d'un thème
export function cssVars(d) {
  const v = {};
  Object.entries(VAR_MAP).forEach(([k, n]) => { if (d.colors?.[k]) v[n] = d.colors[k]; });
  if (d.font_display) v["--font-display"] = `"${d.font_display}",sans-serif`;
  if (d.font_body) v["--font-body"] = `"${d.font_body}",sans-serif`;
  if (d.transform) v["--display-transform"] = d.transform;
  if (d.spacing != null) v["--display-spacing"] = d.spacing + "em";
  if (d.radius != null) v["--radius-base"] = d.radius + "px";
  if (d.border_w != null) v["--border-width"] = d.border_w + "px";
  if (d.shadow != null) v["--shadow-1"] = `0 10px ${Math.round(d.shadow * 0.7)}px color-mix(in srgb,${d.colors?.brand || "var(--brand)"} ${Math.round(d.shadow * 0.5)}%,transparent)`;
  if (d.blur != null) v["--nx-blur"] = d.blur + "px";
  return v;
}
export const fontHref = (fs) => `https://fonts.googleapis.com/css2?${[...new Set(fs.filter(Boolean))].map((f) => `family=${f.replace(/ /g, "+")}:wght@400;600;700`).join("&")}&display=swap`;

// Sons du clavier synthétisés (façon Opera GX)
let ctx;
export function keySound(kind, vol = 0.5, enter = false) {
  if (!kind || kind === "none") return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime; const g = ctx.createGain(); g.connect(ctx.destination);
    const osc = (type, f1, f2, d, a = 0.3) => { const o = ctx.createOscillator(); const og = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d); og.gain.setValueAtTime(a * vol, t); og.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(og).connect(g); o.start(t); o.stop(t + d + 0.02); };
    const noise = (d, f, a = 0.4, q = 1) => { const b = ctx.createBuffer(1, ctx.sampleRate * d, ctx.sampleRate); const ch = b.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length) ** 3; const s = ctx.createBufferSource(); s.buffer = b; const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = q; const ng = ctx.createGain(); ng.gain.value = a * vol; s.connect(bp).connect(ng).connect(g); s.start(t); };
    const j = 0.92 + Math.random() * 0.16;
    if (kind === "mecanique") { noise(0.035, 3200 * j, 0.9, 0.8); osc("triangle", 180 * j, 90, 0.05, 0.25); }
    else if (kind === "machine") { noise(0.03, 2400 * j, 1, 1.4); osc("square", 900 * j, 600, 0.02, 0.06); if (enter) osc("sine", 2100, 2090, 0.6, 0.18); }
    else if (kind === "bulle") osc("sine", 700 * j, 1400 * j, 0.08, 0.35);
    else if (kind === "cristal") { osc("sine", 2600 * j, 2550, 0.25, 0.12); osc("sine", 3900 * j, 3850, 0.18, 0.05); }
    else if (kind === "laser") osc("sawtooth", 1800 * j, 120, 0.09, 0.08);
    else if (kind === "doux") noise(0.05, 1200 * j, 0.6, 0.5);
    else if (kind === "8bit") osc("square", 880 * j * (enter ? 1.5 : 1), 880 * j, 0.05, 0.08);
    else if (kind === "goutte") osc("sine", 1300 * j, 400, 0.12, 0.3);
  } catch (_) {}
}
