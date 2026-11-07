import { useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import { THEMES } from "@/lib/themes";

// Bibliothèques de l'Atelier de thèmes
export const FONTS = ["Space Grotesk", "Orbitron", "Rajdhani", "Audiowide", "Exo 2", "Oxanium", "Chakra Petch", "Syncopate", "Michroma", "Unbounded", "Sora", "Outfit", "Manrope", "Cinzel", "Cormorant Garamond", "Playfair Display", "Marcellus", "DM Serif Display", "Shippori Mincho", "Noto Serif JP", "Zen Kaku Gothic New", "Bebas Neue", "Anton", "Righteous", "Monoton", "Major Mono Display", "IBM Plex Mono", "JetBrains Mono", "VT323", "Press Start 2P",
  "Syne", "Lexend", "Teko", "Jura", "Aldrich", "Electrolize", "Quantico", "Zen Dots", "Turret Road", "Share Tech Mono", "Nova Mono", "Bungee", "Staatliches",
  "Fraunces", "Spectral", "EB Garamond", "Cormorant", "Forum", "Italiana", "Gloock",
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
export const PRESETS = [
  { name: "Néon Synthwave", kanji: "電", base: "akira", colors: col(pal("Synthwave")), font_display: "Monoton", font_body: "Outfit", bg: { type: "gradient", g: GRADIENTS[0], angle: 180, dim: 20 }, fx: { stars: 50, particles: 30 }, fx_color: "#05d9e8", key_sound: "laser" },
  { name: "Pluie sur Néo-Tokyo", kanji: "雨", base: "megapole", colors: col(pal("Nuit cobalt")), font_display: "Chakra Petch", font_body: "Rajdhani", bg: { type: "gradient", g: GRADIENTS[1], angle: 200, dim: 30 }, fx: { rain: 70, fog: 30 }, ambient: [{ id: "rain", vol: 0.6 }, { id: "city", vol: 0.3 }], fx_color: "#9fd8ff", key_sound: "mecanique" },
  { name: "Sakura nocturne", kanji: "桜", base: "tengoku", colors: col(pal("Sakura")), font_display: "Shippori Mincho", font_body: "Zen Kaku Gothic New", bg: { type: "gradient", g: GRADIENTS[2], angle: 170, dim: 30 }, fx: { petals: 60, fireflies: 20 }, ambient: [{ id: "stream", vol: 0.5 }], fx_color: "#ffc4d4", key_sound: "cristal" },
  { name: "Forge ardente", kanji: "炎", base: "supernova", colors: col(pal("Forge")), font_display: "Cinzel", font_body: "Manrope", bg: { type: "gradient", g: GRADIENTS[3], angle: 0, dim: 30 }, fx: { embers: 70, fog: 20 }, ambient: [{ id: "fire", vol: 0.7 }], fx_color: "#ffb03a", key_sound: "machine" },
  { name: "Brume nordique", kanji: "霧", base: "glacier", colors: col(pal("Glace")), font_display: "Michroma", font_body: "Sora", bg: { type: "gradient", g: ["#060b10", "#1d3446", "#d6f2ff"], angle: 180, dim: 25 }, fx: { snow: 60, fog: 50 }, ambient: [{ id: "wind", vol: 0.6 }], fx_color: "#ffffff", key_sound: "doux" },
  { name: "Forêt aux lucioles", kanji: "蛍", base: "biome", colors: col(pal("Émeraude")), font_display: "Marcellus", font_body: "Manrope", bg: { type: "gradient", g: GRADIENTS[4], angle: 190, dim: 30 }, fx: { fireflies: 70, fog: 30 }, ambient: [{ id: "forest", vol: 0.6 }, { id: "night", vol: 0.4 }], fx_color: "#d8ff8a", key_sound: "goutte" },
  { name: "Arcade 8-bit", kanji: "遊", base: "neant", colors: col(pal("Améthyste")), font_display: "Press Start 2P", font_body: "VT323", radius: 0, bg: { type: "gradient", g: GRADIENTS[7], angle: 180, dim: 20 }, fx: { stars: 70 }, fx_color: "#ff9e00", key_sound: "8bit" },
  { name: "Opera Rouge", kanji: "紅", base: "akira", colors: col(pal("Opera rouge")), font_display: "Unbounded", font_body: "Outfit", radius: 6, bg: { type: "gradient", g: ["#0a0406", "#3a0716", "#fa1e4e"], angle: 200, dim: 30 }, fx: { particles: 40 }, fx_color: "#fa1e4e", key_sound: "mecanique", blur: 18, shadow: 70 },
];
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
export const themeDef = (key, s = state) => (s.draft?.key === key ? s.draft : s.docs.find((d) => d.key === key)) || null;
export const baseOf = (key) => { const d = themeDef(key); return isCustomKey(key) ? d?.base || "abysse" : key; };
const swatchOf = (d) => [d.colors?.bg, d.colors?.brand, d.colors?.brand2];

// Liste fusionnée pour tous les sélecteurs de thèmes
export function useThemeList() {
  const s = useThemeState();
  const over = (t) => { const d = s.docs.find((x) => x.key === t.key); return d?.colors ? { ...t, name: d.name || t.name, kanji: d.kanji || t.kanji, tagline: d.tagline || t.tagline, swatch: swatchOf(d) } : t; };
  const builtins = THEMES.filter((t) => !s.hidden.includes(t.key)).map(over);
  const customs = s.docs.filter((d) => isCustomKey(d.key) && d.enabled !== false).map((d) => ({ key: d.key, name: d.name, kanji: d.kanji, tagline: d.tagline || "Thème personnalisé", swatch: swatchOf(d) }));
  return [...builtins, ...customs];
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
