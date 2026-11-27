import { useApp } from "@/context/AppContext";
import { useThemeState, themeDef } from "@/lib/themeStore";

// Nexus OS : l'accueil est une suite de blocs. Chaque thème choisit leur ordre, ceux qu'il montre,
// la présentation de chacun et son habillage (largeur, fond, titre, entrée, espacement).
// Sans réglage, on retrouve exactement la Station d'origine.
// v : [clé, nom, description] ; la première présentation est celle d'origine.
export const BLOCS = [
  { key: "entete", label: "En-tête", kj: "頭", v: [["titre", "Titre", "Le nom du thème et sa devise"], ["geant", "Géant", "Le nom du thème en très grand, sur toute la largeur"], ["discret", "Discret", "Une ligne fine, alignée à gauche"]] },
  { key: "une", label: "La une", kj: "一", v: [["ecran", "Écran", "L'image et le texte côte à côte, comme aujourd'hui"], ["cadre", "Encadrée", "Tirage encadré sous une lampe à tableau"], ["affiche", "Affiche", "Plein écran : bande de couleur, titre géant, l'objet appuyé contre l'affiche"]] },
  { key: "sortie", label: "Compte à rebours", kj: "次", v: [["carte", "Carte", "L'affiche et le compte à rebours"], ["geant", "Géant", "Les chiffres en très grand, comme au cinéma"], ["bandeau", "Bandeau", "Une ligne fine qui ne prend pas de place"]] },
  { key: "rapide", label: "Accès rapide", kj: "続", v: [["cartes", "Cartes", "Les œuvres commencées, en cartes"], ["comptoir", "Comptoir", "Posées comme des objets, avec leur étiquette"], ["vitrines", "Vitrines", "Chaque œuvre tourne sous sa lampe, avec sa fiche"], ["carnet", "Carnet", "Une liste douce, avec la progression de chaque œuvre"]] },
  { key: "explorer", label: "Explorer et rayons", kj: "探", v: [["rayons", "Rayons", "Recherche, coups de cœur, rayons, carte et arcade"]] },
  { key: "univers", label: "Les univers", kj: "世界", off: true, v: [["accordeon", "Accordéon", "Des panneaux côte à côte qui s'ouvrent, chacun mène à son univers"], ["galerie", "Galerie", "Une carte par univers, ses œuvres en éventail"]] },
  { key: "journal", label: "Journal de bord", kj: "録", v: [["cartes", "Cartes", "Les derniers billets en cartes"], ["liste", "Liste", "Une ligne par billet, avec sa date"], ["polaroids", "Polaroïds", "Des photos posées de travers, comme sur un bureau"]] },
  { key: "vision", label: "La vision", kj: "志", v: [["manifeste", "Manifeste", "Le texte dans sa carte"], ["citation", "Citation", "Le titre en très grand, centré, sans cadre"], ["lettre", "Lettre", "Une feuille de papier posée sur la page"]] },
  { key: "embarquement", label: "Carte d'embarquement", kj: "搭乗", v: [["billet", "Billet", "Le profil du visiteur en billet"], ["membre", "Carte de membre", "Une carte plastifiée, plus sobre"]] },
  { key: "soutien", label: "Soutien", kj: "援", v: [["appel", "Appel", "Grand titre et bouton"], ["lettre", "Lettre", "Un mot sur papier, plus doux"], ["bandeau", "Bandeau", "Une ligne discrète avec le bouton"]] },
];
// Habillage commun à tous les blocs ("" = comme à l'origine)
export const HAB = {
  largeur: { label: "Largeur", o: [["", "Colonne"], ["plein", "Plein écran"]] },
  fond: { label: "Fond", o: [["", "Aucun"], ["verre", "Verre"], ["plein", "Surface"], ["couleur", "Couleur"], ["papier", "Papier"]] },
  titre: { label: "Titre", o: [["", "Discret"], ["geant", "Géant"], ["kanji", "Kanji"], ["barre", "Barré"], ["centre", "Centré"]] },
  entree: { label: "Entrée", o: [["", "Aucune"], ["fondu", "Fondu"], ["glisse", "Glisse"], ["zoom", "Zoom"]] },
  espace: { label: "Espace", o: [["serre", "Serré"], ["", "Normal"], ["aere", "Aéré"]] },
};
export const OBJ_REPOS = [["", "Immobile"], ["balance", "Balancement"], ["flotte", "Flottement"], ["incline", "Incliné"]];
export const OBJ_SURVOL = [["", "Se lève"], ["eclaire", "S'éclaire"], ["tourne", "Tourne"], ["bascule", "Bascule"]];
export const ETAGERES = [["", "D'origine"], ["bois", "Bois"], ["verre", "Verre"], ["metal", "Métal"], ["papier", "Papier"], ["aucune", "Aucune"]];
// Le cadre de la Station (toutes les pages)
export const MENU = {
  pos: { label: "Position", o: [["", "En haut"], ["fixe", "En haut, fixé"], ["cote", "Sur le côté"], ["dock", "Dock en bas"]] },
  mat: { label: "Matière", o: [["", "D'origine"], ["verre", "Verre"], ["plein", "Plein"], ["papier", "Papier"], ["transparent", "Transparent"]] },
  icones: { label: "Icônes", o: [["", "D'origine"], ["arrondi", "Arrondi"], ["pixel", "Pixel"], ["cyber", "Cyber"], ["carnet", "Carnet"], ["8bit", "8-bit"], ["bloc", "Bloc"], ["hud", "HUD"], ["hexa", "Hexa"], ["kanji", "Kanji"], ["texte", "Texte"]] },
  cadre: { label: "Boutons", o: [["", "Avec cadre"], ["sans", "Sans cadre"], ["rond", "Ronds"]] },
  tiroir: { label: "Tiroir du menu · matière", o: [["", "Techno"], ["verre", "Verre"], ["papier", "Papier"], ["plein", "Plein"], ["minimal", "Minimal"]] },
  tiroir_pos: { label: "Tiroir du menu · apparition", o: [["", "Glisse du côté"], ["haut", "Tombe du haut"], ["centre", "S'ouvre au centre"], ["plein", "Plein écran"]] },
  voile: { label: "Voile derrière le menu", o: [["", "Flou"], ["sombre", "Sombre"], ["trame", "Trame"], ["aucun", "Rien"]] },
};
// Les fenêtres par-dessus la Station (profil, connexion, partage, lecture, planning…)
export const FENETRES = {
  mat: { label: "Matière des fenêtres", o: [["", "D'origine"], ["techno", "Techno"], ["verre", "Verre"], ["papier", "Papier"], ["plein", "Plein"], ["minimal", "Minimal"]] },
  voile: { label: "Voile derrière les fenêtres", o: [["", "D'origine"], ["flou", "Flou"], ["sombre", "Sombre"], ["trame", "Trame"], ["aucun", "Rien"]] },
  anim: { label: "Apparition des fenêtres", o: [["", "D'origine"], ["monte", "Monte du bas"], ["zoom", "Zoom"], ["fondu", "Fondu"], ["glisse", "Glisse du côté"]] },
};
// Les autres pages (Journal, Planning, Soutien, À propos…)
export const PAGES = {
  panneaux: { label: "Panneaux", o: [["", "D'origine"], ["verre", "Verre"], ["papier", "Papier"], ["plein", "Plein"]] },
  titres: { label: "Titres", o: [["", "D'origine"], ["geant", "Géants"], ["centre", "Centrés"], ["barre", "Barrés"]] },
  transition: { label: "Passage d'une page à l'autre", o: [["", "Direct"], ["fondu", "Fondu"], ["voile", "Voile"], ["iris", "Iris"]] },
};
// Le mouvement de la page
export const ANIM = {
  defile: { label: "Défilement", o: [["", "Libre"], ["sections", "Section par section"]] },
  parallaxe: { label: "Parallaxe", o: [["", "Aucune"], ["leger", "Légère"], ["forte", "Forte"]] },
  lancement: { label: "Entrée dans une œuvre (toujours autour de l'objet)", o: [["", "Il s'ouvre"], ["tour", "Il tourne, puis s'ouvre"], ["plongee", "On entre dedans"], ["envol", "Il vient vers toi"], ["feuillette", "On le feuillette"], ["ejecte", "Il s'éjecte"]] },
};
export const DEFAULT_ORDER = BLOCS.map((b) => b.key);
export const blocOf = (k) => BLOCS.find((b) => b.key === k);

// Réglage complet (avec les valeurs par défaut) à partir de ce qui est stocké dans le thème
export function resolveBlocs(raw = {}) {
  const known = (raw.order || []).filter((k) => blocOf(k));
  const order = [...known, ...DEFAULT_ORDER.filter((k) => !known.includes(k))];
  const off = new Set((raw.off || BLOCS.filter((b) => b.off).map((b) => b.key)).filter((k) => blocOf(k)));
  const v = Object.fromEntries(BLOCS.map((b) => [b.key, b.v.some(([k]) => k === raw.v?.[b.key]) ? raw.v[b.key] : b.v[0][0]]));
  // anciens réglages lourds retirés : rideau → glisse, flou → fondu
  const OLD = { rideau: "glisse", flou: "fondu" };
  const hab = Object.fromEntries(BLOCS.map((b) => { const h = { ...(raw.hab?.[b.key] || {}) }; if (OLD[h.entree]) h.entree = OLD[h.entree]; return [b.key, h]; }));
  return { order, off, v, hab, repos: raw.repos || "", survol: raw.survol || "", etagere: raw.etagere || "" };
}
export const toRaw = (r) => ({ order: r.order, off: [...r.off], v: r.v, hab: r.hab, repos: r.repos, survol: r.survol, etagere: r.etagere });

// Les blocs du thème actif
export function useBlocs() {
  const { theme } = useApp();
  const s = useThemeState();
  return resolveBlocs(themeDef(theme, s)?.blocs || {});
}
