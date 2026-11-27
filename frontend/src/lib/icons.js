import { useEffect, useState } from "react";

// Les icônes du menu (Nexus OS › Menu › Icônes) et de l'Atelier, dans le dessin d'un pack d'artiste.
// Elles prennent la couleur du thème (jamais multicolores). D'origine : l'icône habituelle du composant.
export const ICON_STYLES = [["", "D'origine"], ["arrondi", "Arrondi"], ["pixel", "Pixel"], ["cyber", "Cyber"], ["carnet", "Carnet"], ["8bit", "8-bit"], ["bloc", "Bloc"], ["hud", "HUD"], ["hexa", "Hexa"], ["kanji", "Kanji"], ["texte", "Texte"]];
// Packs d'artistes (voir Paramètres › Apparence › Crédits) : chaque icône est un masque, colorée par le thème.
//   arrondi : Game Icon Pack · pixel : 1-bit Pixel Icons (Nikoichu, CC0) · cyber : Skill Icons Cyberpunk (CraftPix), complété en pixel
//   carnet : Hand Drawn Icon Pack (Limofeus, CC0) — des objets de carnet de donjon, choisis pour évoquer chaque rubrique
const IMG = {};
try { const ctx = require.context("../assets/iconpacks", true, /\.(png|webp)$/); ctx.keys().forEach((k) => { const m = k.match(/\.\/([^/]+)\/(.+)\.(png|webp)$/); if (m) (IMG[m[1]] = IMG[m[1]] || {})[m[2]] = ctx(k); }); } catch (_) { /* rien */ }
export const IMG_PACKS = ["arrondi", "pixel", "cyber", "carnet", "8bit", "bloc", "hud", "hexa"];
const PACKS = new Set(IMG_PACKS);

export function useIconStyle() {
  const read = () => (typeof document === "undefined" ? "" : document.documentElement.getAttribute("data-icones") || "");
  const [v, setV] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setV(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-icones"] });
    setV(read()); // l'attribut a pu être posé entre le premier rendu et cet abonnement
    return () => mo.disconnect();
  }, []);
  return v;
}

export function PackIcon({ pack, name, size = 18, style }) {
  const src = IMG[pack]?.[name]; if (!src) return null;
  return <span className={"nx-ic nxi-img nxi-" + pack} aria-hidden="true" style={{ width: size, height: size, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`, ...style }} />;
}

// <NxIcon name="profil" size={18}>{icône d'origine}</NxIcon>
// pack : forcer un pack (l'Atelier a son propre réglage) ; sinon celui du thème
export function NxIcon({ name, size = 18, style, children, pack }) {
  const st0 = useIconStyle(); const st = pack !== undefined ? pack : st0;
  return PACKS.has(st) && IMG[st]?.[name] ? <PackIcon pack={st} name={name} size={size} style={style} /> : children;
}

// L'Atelier a son propre pack d'icônes (Réglages de l'Atelier › Icônes), gardé dans le navigateur
const atSubs = new Set();
export const setAtelierIconPack = (v) => { try { localStorage.setItem("nx-at-icons", v || ""); } catch (_) {} atSubs.forEach((f) => f()); };
export function useAtelierIconPack() {
  const read = () => { try { return localStorage.getItem("nx-at-icons") || ""; } catch (_) { return ""; } };
  const [v, setV] = useState(read);
  useEffect(() => { const f = () => setV(read()); atSubs.add(f); return () => atSubs.delete(f); }, []);
  return v;
}
