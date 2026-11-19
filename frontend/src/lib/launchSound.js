/*
  Le petit son du lancement (quand le livre ou la VHS s'ouvre), comme au démarrage d'un jeu sur Steam ou PlayStation.
  Cinq sons fabriqués à la volée, doux et nets, avec une petite réverbération ; le choix est celui de la station (réglé par l'admin).
*/
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/api";

let ctx = null; let verb = null;
const ac = () => { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); return ctx; } catch (_) { return null; } };
// une salle douce : réponse impulsionnelle de bruit qui décroît (stéréo)
function room(c) {
  if (verb) return verb;
  const len = Math.floor(c.sampleRate * 2.4); const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  const conv = c.createConvolver(); conv.buffer = b; const wet = c.createGain(); wet.gain.value = 0.32; conv.connect(wet).connect(c.destination);
  verb = conv; return verb;
}
const out = (c, node, vol, wet = true) => { const g = c.createGain(); g.gain.value = vol; node.connect(g); g.connect(c.destination); if (wet) g.connect(room(c)); return g; };
// une note : oscillateur + enveloppe (attaque, maintien, chute)
function note(c, t, f, { type = "sine", a = 0.01, d = 1.2, v = 0.2, detune = 0, wet = true, glide = 0 } = {}) {
  const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t + d * 0.6); o.detune.value = detune;
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  o.connect(g); out(c, g, 1, wet); o.start(t); o.stop(t + a + d + 0.05);
}
// une cloche douce : deux partiels (fondamentale + octave et quinte, légèrement désaccordés)
const bell = (c, t, f, v = 0.12, d = 1.6) => { note(c, t, f, { v, d, a: 0.004 }); note(c, t, f * 2.01, { v: v * 0.35, d: d * 0.6, a: 0.004 }); note(c, t, f * 3.0, { v: v * 0.12, d: d * 0.35, a: 0.004 }); };
// un souffle filtré qui monte (l'élan)
function whoosh(c, t, d = 0.6, v = 0.12, f0 = 300, f1 = 3200) {
  const n = c.createBufferSource(); const len = Math.floor(c.sampleRate * (d + 0.1)); const b = c.createBuffer(1, len, c.sampleRate); const x = b.getChannelData(0); for (let i = 0; i < len; i++) x[i] = Math.random() * 2 - 1; n.buffer = b;
  const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.2; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + d);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + d * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.08);
  n.connect(bp).connect(g); out(c, g, 1); n.start(t); n.stop(t + d + 0.1);
}
const N = (m) => 440 * Math.pow(2, (m - 69) / 12);

export const LAUNCH_SOUNDS = [
  { k: "halo", t: "Halo", d: "Un accord qui s'ouvre, lumineux" },
  { k: "elan", t: "Élan", d: "Un souffle qui monte puis se pose" },
  { k: "cle", t: "Clé", d: "Deux notes de confirmation, comme une console" },
  { k: "aurore", t: "Aurore", d: "Quatre notes qui montent, légères" },
  { k: "seuil", t: "Seuil", d: "Une porte grave qui s'ouvre sur l'air" },
  { k: "velours", t: "Velours", d: "Une nappe chaude qui s'ouvre, un battement doux" },
  { k: "prisme", t: "Prisme", d: "Trois éclats de verre, puis une lueur" },
  { k: "horizon", t: "Horizon", d: "Une montée de cinéma qui éclôt en accord" },
];
const PLAY = {
  halo(c, t, v) { [N(60), N(67), N(71), N(74)].forEach((f, i) => note(c, t + i * 0.035, f, { type: "triangle", a: 0.18, d: 1.5, v: v * 0.09, detune: (i - 1.5) * 4 })); bell(c, t + 0.22, N(86), v * 0.08, 1.8); },
  elan(c, t, v) { whoosh(c, t, 0.55, v * 0.1); note(c, t + 0.55, N(43), { v: v * 0.22, d: 0.9, a: 0.008 }); [N(67), N(74), N(79)].forEach((f, i) => note(c, t + 0.56 + i * 0.02, f, { type: "triangle", v: v * 0.07, d: 1.3, a: 0.02 })); },
  cle(c, t, v) { bell(c, t, N(76), v * 0.13, 1.1); bell(c, t + 0.16, N(83), v * 0.13, 1.6); note(c, t + 0.16, N(52), { v: v * 0.08, d: 1.2, a: 0.05 }); },
  aurore(c, t, v) { [N(64), N(68), N(71), N(76)].forEach((f, i) => bell(c, t + i * 0.085, f, v * 0.085, 1.3 + i * 0.15)); note(c, t + 0.26, N(52), { type: "triangle", v: v * 0.06, d: 1.4, a: 0.25 }); },
  velours(c, t, v) {
    // nappe : dents de scie désaccordées dans un filtre qui s'ouvre
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 0.7; lp.frequency.setValueAtTime(380, t); lp.frequency.exponentialRampToValueAtTime(2600, t + 0.9); lp.frequency.exponentialRampToValueAtTime(900, t + 2);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.07, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
    lp.connect(g); out(c, g, 1);
    [N(57), N(64), N(69), N(73)].forEach((f, i) => [-7, 7].forEach((dt) => { const o = c.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = dt + i; o.connect(lp); o.start(t); o.stop(t + 2.2); }));
    note(c, t + 0.02, N(33), { v: v * 0.22, d: 0.7, a: 0.01, wet: false });
  },
  prisme(c, t, v) {
    // éclats de verre : sinus aigus brefs, l'un après l'autre, puis une lueur tenue
    [N(88), N(84), N(91)].forEach((f, i) => { note(c, t + i * 0.07, f, { v: v * 0.08, d: 0.5, a: 0.002 }); note(c, t + i * 0.07, f * 1.5, { v: v * 0.03, d: 0.3, a: 0.002 }); });
    [N(64), N(71), N(76)].forEach((f, i) => note(c, t + 0.24, f, { type: "sine", a: 0.3, d: 1.5, v: v * 0.05, detune: (i - 1) * 5 }));
  },
  horizon(c, t, v) {
    // une montée (souffle et note qui glissent vers le haut), puis l'accord s'ouvre en grand
    whoosh(c, t, 0.85, v * 0.08, 200, 5200);
    note(c, t, N(45), { type: "triangle", v: v * 0.1, d: 0.85, a: 0.6, glide: 2 });
    [N(57), N(64), N(69), N(76), N(81)].forEach((f, i) => note(c, t + 0.86, f, { type: i % 2 ? "sine" : "triangle", a: 0.04, d: 1.8, v: v * 0.075, detune: (i - 2) * 3 }));
    note(c, t + 0.86, N(33), { v: v * 0.2, d: 1.2, a: 0.01, wet: false });
  },
  seuil(c, t, v) { note(c, t, N(36), { v: v * 0.28, d: 1.1, a: 0.02, glide: 0.92, wet: false }); whoosh(c, t + 0.05, 0.9, v * 0.06, 600, 6000); [N(62), N(69), N(76)].forEach((f, i) => note(c, t + 0.3, f, { type: "sine", a: 0.35, d: 1.4, v: v * 0.06, detune: (i - 1) * 6 })); },
};

// un son par format : le livre, la VHS et le vinyle ont chacun le leur.
// C'est l'admin qui choisit, dans les paramètres de la station ; tous les visiteurs entendent ce choix.
export const LAUNCH_FORMATS = [["livre", "Livre"], ["vhs", "VHS"], ["vinyle", "Vinyle"]];
const DEF = { livre: "aurore", vhs: "elan", vinyle: "velours" };
let STATION = {};
export const setStationLaunchSounds = (m) => { STATION = m || {}; };
export const getLaunchSound = (fmt = "livre") => STATION[fmt] || DEF[fmt] || "halo";
export const launchFormatOf = (f) => (f === "vhs" || f === "vinyle" ? f : "livre");
// à appeler là où une œuvre peut se lancer : garde le choix de la station à jour
export function useLaunchSync() {
  const { data } = useQuery({ queryKey: ["settings"], queryFn: getSettings, staleTime: 60000 });
  useEffect(() => { setStationLaunchSounds(data?.launch_sounds); }, [data]);
  return data;
}
export function playLaunch(vol = 0.7, k = getLaunchSound()) {
  if (!k || k === "none" || vol <= 0) return; const c = ac(); if (!c || !PLAY[k]) return;
  PLAY[k](c, c.currentTime + 0.02, Math.min(1, vol));
}
