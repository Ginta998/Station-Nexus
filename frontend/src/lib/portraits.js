import MAN from "@/data/portraits.json";

// Portraits de profil : chaque visiteur en choisit un à la création de son compte (ou garde sa photo).
// Ils s'affichent dans l'animation d'arrivée (« Amuse-toi bien, … »), sur le profil, au Salon, chez les Membres.
// Seulement des packs que la Station peut utiliser alors qu'elle vend des abonnements (voir data/credits.js).
export const PORTRAIT_FAMILLES = [
  { key: "noir", label: "Noir", hint: "Polar : costumes, chapeaux, lunettes noires", ext: "webp" },
  { key: "illustre", label: "Illustré", hint: "Pilotes et mercenaires en couleur", ext: "webp" },
  { key: "aventure", label: "Aventuriers", hint: "Héros et voyageurs en pixel art", ext: "png" },
  { key: "bestiaire", label: "Bestiaire", hint: "Créatures, monstres et drôles de bêtes en pixel art", ext: "png" },
  { key: "retro", label: "Rétro", hint: "Visages 32 px et portraits à lunettes", ext: "png" },
  { key: "mono", label: "1-bit", hint: "Noir et blanc, Game Boy, et un robot qui bouge", ext: "webp" },
];
const FAMS = PORTRAIT_FAMILLES.map((f) => f.key).join("|");
const BASE = typeof window !== "undefined" && window.__NX_PREVIEW ? "" : "/";
export const portraitUrl = (fam, id) => `${BASE}portraits/${fam}/${id}.${PORTRAIT_FAMILLES.find((f) => f.key === fam)?.ext || "webp"}`;
export const portraitsOf = (fam) => (MAN[fam] || []).map((id) => ({ id, fam, url: portraitUrl(fam, id) }));
export const isPortrait = (u) => new RegExp(`(^|/)portraits/(${FAMS})/`).test(u || "");
export const portraitFam = (u) => (String(u || "").match(new RegExp(`portraits/(${FAMS})/`)) || [])[1] || "";
