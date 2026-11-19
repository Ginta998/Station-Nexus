/*
  Le petit son du lancement (quand le livre ou la VHS s'ouvre), comme au démarrage d'un jeu sur Steam ou PlayStation.
  Cinq sons fabriqués à la volée, doux et nets, avec une petite réverbération ; le choix se garde dans le navigateur.
*/
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
];
const PLAY = {
  halo(c, t, v) { [N(60), N(67), N(71), N(74)].forEach((f, i) => note(c, t + i * 0.035, f, { type: "triangle", a: 0.18, d: 1.5, v: v * 0.09, detune: (i - 1.5) * 4 })); bell(c, t + 0.22, N(86), v * 0.08, 1.8); },
  elan(c, t, v) { whoosh(c, t, 0.55, v * 0.1); note(c, t + 0.55, N(43), { v: v * 0.22, d: 0.9, a: 0.008 }); [N(67), N(74), N(79)].forEach((f, i) => note(c, t + 0.56 + i * 0.02, f, { type: "triangle", v: v * 0.07, d: 1.3, a: 0.02 })); },
  cle(c, t, v) { bell(c, t, N(76), v * 0.13, 1.1); bell(c, t + 0.16, N(83), v * 0.13, 1.6); note(c, t + 0.16, N(52), { v: v * 0.08, d: 1.2, a: 0.05 }); },
  aurore(c, t, v) { [N(64), N(68), N(71), N(76)].forEach((f, i) => bell(c, t + i * 0.085, f, v * 0.085, 1.3 + i * 0.15)); note(c, t + 0.26, N(52), { type: "triangle", v: v * 0.06, d: 1.4, a: 0.25 }); },
  seuil(c, t, v) { note(c, t, N(36), { v: v * 0.28, d: 1.1, a: 0.02, glide: 0.92, wet: false }); whoosh(c, t + 0.05, 0.9, v * 0.06, 600, 6000); [N(62), N(69), N(76)].forEach((f, i) => note(c, t + 0.3, f, { type: "sine", a: 0.35, d: 1.4, v: v * 0.06, detune: (i - 1) * 6 })); },
};

const KEY = "nx-launch-snd";
export const getLaunchSound = () => { try { return localStorage.getItem(KEY) || "halo"; } catch (_) { return "halo"; } };
export const setLaunchSound = (k) => { try { localStorage.setItem(KEY, k); } catch (_) {} };
export function playLaunch(vol = 0.7, k = getLaunchSound()) {
  if (!k || k === "none" || vol <= 0) return; const c = ac(); if (!c || !PLAY[k]) return;
  PLAY[k](c, c.currentTime + 0.02, Math.min(1, vol));
}
