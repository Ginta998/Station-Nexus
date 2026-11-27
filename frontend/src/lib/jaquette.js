import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/api";

// La jaquette d'une œuvre (tranche + couverture) : un style commun à toute la Station (Paramètres › Jaquettes)
// et, œuvre par œuvre, des réglages qui s'en écartent (fiche de la création › Jaquette).
//   style, color, ink, font : la tranche (classique, cuir, toile, poche, moderne ; couleur ; encre ; police)
//   bande : la bande du haut qui dit ce que c'est (LIVRE, SÉRIE, FILM…) — "" (oui) ou "non" ; bandeC : sa couleur
//   titre : le titre sur l'image de couverture — "" (non), "auto", "haut", "milieu", "bas" ; titreFond : "ombre", "bande", "aucun"
export const KIND = { chapters: "LIVRE", episodes: "SÉRIE", film: "FILM", game: "JEU", reader: "LECTURE", link: "LIEN" };
export const kindOfCreation = (it, fmt) => (it?.jaquette?.kind || KIND[it?.launch_type] || ({ vhs: "VHS", vinyle: "ALBUM" })[fmt] || "ŒUVRE");
// Reliures : une famille de jaquettes. La reliure se garde dans la jaquette (reliure, etui « oui », reflet « non »)
// et prend ses autres réglages : couleur (le cuir, la toile, le papier), encre (dorures et titre), police, cartouche de tranche (bandeC).
export const RELIURES = [
  { k: "gaufre", label: "Gaufrée", hint: "Blanche en relief, fenêtre en arche", sw: "#ece6d8" },
  { k: "dore", label: "Dorée", hint: "Feuille d'or, quatre vitraux", sw: "#c9a24a" },
  { k: "nuit", label: "Cuir de nuit", hint: "Cuir sombre, médaillon ovale", sw: "#221a16" },
  { k: "toile", label: "Toile", hint: "Toile brute, titre estampé, planche collée", sw: "#2f4a3a" },
  { k: "grimoire", label: "Grimoire", hint: "Cuir, coins et fermoirs de métal", sw: "#3b2418" },
  { k: "japonaise", label: "Japonaise", hint: "Couture apparente, titre sur étiquette", sw: "#e9e1cf" },
  { k: "deco", label: "Art déco", hint: "Nuit et or, éventail géométrique", sw: "#121212" },
];
// L'ancienne « édition » ({ edition: { style, etui } }) devient une reliure
export const legacyRel = (j) => { if (!j?.edition) return j; const { edition, ...r } = j; return edition?.style && !r.reliure ? { ...r, reliure: edition.style, etui: edition.etui ? "oui" : "" } : r; };
export const relOf = (sp) => (sp?.reliure ? { style: sp.reliure, etui: sp.etui === "oui", reflet: sp.reflet !== "non" } : null);
// Une œuvre reliée devient un livre (même si c'était une série ou un album)
export const edOfIt = (it, def) => { const r = relOf({ ...(def || {}), ...(legacyRel(it?.jaquette) || {}) }); return r ? { edition: r, format: "livre" } : {}; };
export const mergeJaq = (def, own) => { const j = { ...(def || {}), ...(legacyRel(own) || {}) }; Object.keys(j).forEach((k) => (j[k] === "" || j[k] == null) && delete j[k]); return Object.keys(j).length ? j : undefined; };
export function useJaqDefault() {
  const { data } = useQuery({ queryKey: ["settings"], queryFn: getSettings, staleTime: 60000 });
  return data?.jaquette || null;
}

// Modèles de jaquette : un clic pose tout (tranche, couleurs, police, bande, titre sur la couverture), on affine ensuite
export const JAQ_PRESETS = [
  { k: "poche", label: "Collection poche", hint: "Fond crème, bande rouge, titre en bandeau", v: { style: "poche", color: "#ece3cf", ink: "#211c16", font: "Playfair Display", bande: "oui", bandeC: "#c4472f", titre: "bas", titreFond: "bande", titreC: "#fbf6ec" } },
  { k: "criterion", label: "Cinémathèque", hint: "Noir mat, titre fin en haut", v: { style: "moderne", color: "#121212", ink: "#f1e7d2", font: "Cormorant Garamond", bande: "non", titre: "haut", titreFond: "aucun", titreC: "#fbf6ec" } },
  { k: "manga", label: "Manga", hint: "Blanc, bande rouge, gros titre", v: { style: "moderne", color: "#f6f4ef", ink: "#16130f", font: "Anton", bande: "oui", bandeC: "#d7262f", titre: "haut", titreFond: "bande", titreC: "#fbf6ec" } },
  { k: "pulp", label: "Pulp", hint: "Ocre et rouge, titre qui claque", v: { style: "toile", color: "#d9b45a", ink: "#7a1414", font: "Bebas Neue", bande: "oui", bandeC: "#7a1414", titre: "bas", titreFond: "ombre", titreC: "#ffd54a" } },
  { k: "cuir", label: "Reliure cuir", hint: "Cuir bordeaux, titre doré", v: { style: "cuir", color: "#4a1d14", ink: "#d9b45a", font: "Cinzel", bande: "non", titre: "milieu", titreFond: "ombre", titreC: "#d9b45a" } },
  { k: "minimal", label: "Minimal", hint: "Aplat clair, la couverture parle seule", v: { style: "moderne", color: "#f4f1ea", ink: "#222222", font: "Space Grotesk", bande: "non", titre: "" } },
  { k: "neon", label: "Néon", hint: "Nuit, encre cyan, bande rose", v: { style: "moderne", color: "#0b0b16", ink: "#3fe0ff", font: "Michroma", bande: "oui", bandeC: "#ff4fa3", titre: "auto", titreFond: "ombre", titreC: "#9fe9ff" } },
  { k: "cassette", label: "Cassette", hint: "Plastique noir, bande orange, étiquette", v: { style: "moderne", color: "#1a1a1a", ink: "#f1e7d2", font: "Rajdhani", bande: "oui", bandeC: "#e2a23a", titre: "bas", titreFond: "bande", titreC: "#fbf6ec" } },
];

// Modèles pour les cassettes VHS : boîtiers, pas reliures
export const JAQ_PRESETS_VHS = [
  { k: "videoclub", label: "Vidéoclub 90", hint: "Étiquette de location, bande rouge", v: { style: "location", color: "#1d3f8f", ink: "#ffe14d", font: "Anton", bande: "oui", bandeC: "#e2231a", titre: "bas", titreFond: "bande", titreC: "#ffe14d" } },
  { k: "noir", label: "Boîtier noir", hint: "Plastique noir, titre en haut", v: { style: "boitier", color: "#c4472f", ink: "#f1e7d2", font: "Bebas Neue", bande: "oui", bandeC: "#111111", titre: "haut", titreFond: "ombre", titreC: "#fbf6ec" } },
  { k: "clamshell", label: "Clamshell", hint: "Boîtier blanc des dessins animés", v: { style: "clamshell", color: "#efeae0", ink: "#1b3a8a", font: "Playfair Display", bande: "non", titre: "bas", titreFond: "bande", titreC: "#fbf6ec" } },
  { k: "collector", label: "Collector", hint: "Bande dorée, titre en relief", v: { style: "collector", color: "#b8a06a", ink: "#1a1712", font: "Cinzel", bande: "non", titre: "milieu", titreFond: "ombre", titreC: "#f3e2b0" } },
  { k: "scifi", label: "Science-fiction 80", hint: "Noir profond, néons", v: { style: "boitier", color: "#0b0b16", ink: "#ff4fa3", font: "Michroma", bande: "oui", bandeC: "#3fe0ff", titre: "haut", titreFond: "aucun", titreC: "#9fe9ff" } },
  { k: "horreur", label: "Horreur", hint: "Rouge sang sur noir, étiquette", v: { style: "location", color: "#120808", ink: "#d7262f", font: "Anton", bande: "oui", bandeC: "#d7262f", titre: "haut", titreFond: "ombre", titreC: "#efe6d0" } },
];
