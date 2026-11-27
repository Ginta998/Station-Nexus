import { useSyncExternalStore } from "react";
import { imgSrc } from "@/lib/atelier";

// Sons d'ambiance superposés (canal séparé de la musique et des bruitages)
export const AMBIENTS = [["rain", "Pluie"], ["storm", "Orage"], ["wind", "Vent"], ["fire", "Feu de bois"], ["waves", "Vagues"], ["stream", "Ruisseau"], ["forest", "Forêt"], ["night", "Grillons"], ["cafe", "Café"], ["city", "Ville"], ["space", "Vaisseau"]];
export const ambientLabel = (l) => l.name || AMBIENTS.find((a) => a[0] === l.id)?.[1] || "Son";

const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } };
let st = { muted: read("nx-amb-muted", false), vol: read("nx-amb-vol", 0.6), layers: [], off: read("nx-amb-off", {}) };
const subs = new Set();
const emit = (p) => { st = { ...st, ...p }; subs.forEach((f) => f()); sync(); };
export const useAmbient = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => st);
export const setAmbientMuted = (m) => { localStorage.setItem("nx-amb-muted", JSON.stringify(m)); emit({ muted: m }); };
export const setAmbientVol = (v) => { localStorage.setItem("nx-amb-vol", JSON.stringify(v)); emit({ vol: v }); };
export const toggleLayer = (key) => { const off = { ...st.off, [key]: !st.off[key] }; localStorage.setItem("nx-amb-off", JSON.stringify(off)); emit({ off }); };
export const setAmbientLayers = (layers) => { if (JSON.stringify(layers || []) !== JSON.stringify(st.layers)) emit({ layers: layers || [] }); };
export const holdAmbient = (h) => emit({ hold: !!h }); // lecture d'une œuvre : les sons d'ambiance se taisent
export const layerKey = (l) => l.id === "file" ? l.url : l.id;

let ctx, master, noise, pink, brown; const live = new Map();
const R = Math.random;
// Trois bruits de base, en stéréo (deux canaux différents : le son a de l'espace, il ne sonne plus comme une télé)
function mk(kind, secs = 8) {
  const n = ctx.sampleRate * secs; const f = Math.floor(ctx.sampleRate * 0.25); const b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = new Float32Array(n + f); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < n + f; i++) {
      const w = R() * 2 - 1;
      if (kind === "white") d[i] = w * 0.5;
      else if (kind === "pink") { b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; }
      else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    }
    // boucle sans couture : la fin se fond dans le début (ni clic, ni trou à chaque tour)
    for (let i = 0; i < f; i++) { const k = i / f; d[i] = d[i] * Math.sqrt(k) + d[n + i] * Math.sqrt(1 - k); }
    b.getChannelData(c).set(d.subarray(0, n));
  }
  return b;
}
function boot() {
  if (ctx) return true;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return false; }
  master = ctx.createGain(); master.connect(ctx.destination);
  noise = mk("white", 4); pink = mk("pink"); brown = mk("brown");
  const wake = () => ctx.state === "suspended" && ctx.resume();
  ["pointerdown", "keydown", "touchstart"].forEach((e) => window.addEventListener(e, wake, { passive: true }));
  return true;
}
const src = (out, buf) => { const s = ctx.createBufferSource(); s.buffer = buf || noise; s.loop = true; s.connect(out); s.start(0, R() * (s.buffer.duration - 1)); return s; };
const filt = (type, f, q = 0.7) => { const x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; };
const lfo = (rate, depth, param) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.value = rate; g.gain.value = depth; o.connect(g).connect(param); o.start(); return o; };
const chain = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[0]; };
function blip(out, { type = "sine", f1, f2, dur, a, delay = 0 }) {
  const t = ctx.currentTime + delay; const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = type;
  o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
}
function burst(out, { f, type = "highpass", dur, a, q = 0.7 }) {
  const t = ctx.currentTime; const s = ctx.createBufferSource(); s.buffer = noise; const x = filt(type, f, q); const g = ctx.createGain();
  g.gain.setValueAtTime(a, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(x).connect(g).connect(out); s.start(t, R() * 3); s.stop(t + dur + 0.05);
}
const every = (min, max, fn, T) => { const go = () => { fn(); T.push(setTimeout(go, min + R() * (max - min))); }; T.push(setTimeout(go, R() * max)); };

const pan = (out, v) => { if (!ctx.createStereoPanner) return out; const p = ctx.createStereoPanner(); p.pan.value = v; p.connect(out); return p; };
// Un réglage qui dérive lentement au hasard (vent, intensité de la pluie) : plus naturel qu'une oscillation régulière
const drift = (param, min, max, tmin, tmax, T) => { const go = () => { param.setTargetAtTime(min + R() * (max - min), ctx.currentTime, (tmin + R() * (tmax - tmin)) / 3000); T.push(setTimeout(go, tmin + R() * (tmax - tmin))); }; go(); };
// Une goutte : petite note qui retombe très vite (l'eau qui frappe), placée quelque part à gauche ou à droite
function drop(out, f, a, d = 0.03) {
  const t = ctx.currentTime + R() * 0.02; const o = ctx.createOscillator(); const g = ctx.createGain(); const p = pan(out, R() * 1.6 - 0.8);
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.55, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(p); o.start(t); o.stop(t + d + 0.02);
}
// Une bulle de ruisseau : la note MONTE (c'est ce qui fait « glou »)
function bubble(out, f, a) {
  const t = ctx.currentTime; const d = 0.03 + R() * 0.06; const o = ctx.createOscillator(); const g = ctx.createGain(); const p = pan(out, R() * 1.4 - 0.7);
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (1.6 + R() * 0.8), t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(p); o.start(t); o.stop(t + d + 0.02);
}
// Un clic très court (braise qui éclate) : 1 à 4 millisecondes, jamais un souffle
function click(out, a, f = 2500) {
  const t = ctx.currentTime; const s = ctx.createBufferSource(); s.buffer = noise; const x = filt("highpass", f + R() * 2500, 0.8); const g = ctx.createGain(); const p = pan(out, R() * 1.2 - 0.6);
  const d = 0.001 + R() * 0.004; g.gain.setValueAtTime(a, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(x).connect(g).connect(p); s.start(t, R() * 3); s.stop(t + d + 0.01);
}
// Le tonnerre : un craquement, puis un grondement grave qui roule plusieurs secondes, de plus en plus sourd
function thunder(out) {
  const t = ctx.currentTime; const near = R() > 0.5; const p = pan(out, R() * 1.4 - 0.7);
  const s = ctx.createBufferSource(); s.buffer = brown; const lp = filt("lowpass", near ? 900 : 380, 0.6); const g = ctx.createGain();
  lp.frequency.setValueAtTime(near ? 900 : 380, t); lp.frequency.exponentialRampToValueAtTime(70, t + 7);
  g.gain.setValueAtTime(0.0001, t); let tt = t + 0.04;
  g.gain.exponentialRampToValueAtTime(near ? 1.3 : 0.6, tt);
  for (let i = 0; i < 6; i++) { tt += 0.4 + R() * 1.1; g.gain.exponentialRampToValueAtTime((near ? 0.9 : 0.45) * (1 - i / 7) * (0.5 + R() * 0.5) + 0.01, tt); }
  g.gain.exponentialRampToValueAtTime(0.0001, tt + 2.5);
  s.connect(lp).connect(g).connect(p); s.start(t, R() * 4); s.stop(tt + 2.6);
  if (near) { const c = g; for (let i = 0; i < 5; i++) setTimeout(() => click(c, 0.5, 600), i * 25 + R() * 30); }
}
// Une vague : elle monte, se brise, puis le ressac se retire en chuintant sur le sable
function wave(out) {
  const t = ctx.currentTime; const up = 2 + R() * 1.5; const back = 4 + R() * 2.5; const p = pan(out, R() * 0.8 - 0.4);
  const s = ctx.createBufferSource(); s.buffer = pink; const lp = filt("lowpass", 300, 0.5); const g = ctx.createGain();
  lp.frequency.setValueAtTime(260, t); lp.frequency.linearRampToValueAtTime(2400 + R() * 1200, t + up); lp.frequency.exponentialRampToValueAtTime(500, t + up + back);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.55 + R() * 0.35, t + up); g.gain.exponentialRampToValueAtTime(0.12, t + up + back * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + up + back);
  s.connect(lp).connect(g).connect(p); s.start(t, R() * 6); s.stop(t + up + back + 0.1);
  const s2 = ctx.createBufferSource(); s2.buffer = noise; const hp = filt("bandpass", 4200, 0.6); const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.0001, t + up - 0.2); g2.gain.exponentialRampToValueAtTime(0.06, t + up + 0.4); g2.gain.exponentialRampToValueAtTime(0.0001, t + up + back);
  s2.connect(hp).connect(g2).connect(p); s2.start(t + up - 0.2, R() * 3); s2.stop(t + up + back + 0.1);
}

function build(kind, out) {
  const S = []; const T = []; const g = (v) => { const x = ctx.createGain(); x.gain.value = v; x.connect(out); return x; };
  if (kind === "rain" || kind === "storm") {
    const heavy = kind === "storm";
    // le rideau de pluie (bruit rose, doux) dont l'intensité varie lentement
    const bed = g(heavy ? 0.42 : 0.3); S.push(src(chain(filt("highpass", 350), filt("lowpass", heavy ? 6000 : 4800), filt("peaking", 2500, 1), bed), pink)); drift(bed.gain, heavy ? 0.3 : 0.18, heavy ? 0.5 : 0.34, 3000, 8000, T);
    // les gouttes, une à une, sur les feuilles, le toit, les flaques
    const dr = g(heavy ? 0.22 : 0.18);
    every(heavy ? 15 : 30, heavy ? 60 : 120, () => drop(dr, 1800 + R() * 3500, 0.15 + R() * 0.4, 0.015 + R() * 0.02), T);
    const big = g(0.16); every(300, 1400, () => drop(big, 500 + R() * 700, 0.3 + R() * 0.3, 0.05), T);
    if (heavy) { const th = g(0.9); every(12000, 32000, () => thunder(th), T); S.push(src(chain(filt("lowpass", 160), g(0.18)), brown)); }
  } else if (kind === "wind" || kind === "forest") {
    // deux souffles doux, un de chaque côté, qui changent lentement de hauteur et de force (pas de sirène)
    const gain = kind === "forest" ? 0.16 : 0.32;
    [-0.6, 0.6].forEach((pv) => { const bp = filt("bandpass", 380, 0.7); const gg = ctx.createGain(); gg.gain.value = gain * 0.6; S.push(src(chain(bp, filt("lowpass", 1100), gg, pan(out, pv)), brown)); drift(bp.frequency, 220, 620, 2500, 6000, T); drift(gg.gain, gain * 0.25, gain, 2500, 7000, T); });
    if (kind === "forest") { const bird = g(0.07); every(1800, 7000, () => { const b = 2200 + R() * 1800; const n = 2 + Math.floor(R() * 3); const p = pan(bird, R() * 1.6 - 0.8); for (let i = 0; i < n; i++) blip(p, { f1: b, f2: b * 1.5, dur: 0.09, a: 0.6, delay: i * 0.13 }); }, T); }
  } else if (kind === "fire") {
    // le feu : un grondement sourd, stable, et des braises qui éclatent (des clics brefs, parfois en rafale)
    S.push(src(chain(filt("lowpass", 160), g(0.35)), brown));
    S.push(src(chain(filt("bandpass", 900, 0.6), g(0.025)), pink));
    const cr = g(0.5);
    every(40, 320, () => { click(cr, 0.15 + R() * 0.5); if (R() < 0.12) for (let i = 1; i < 2 + R() * 5; i++) setTimeout(() => click(cr, 0.1 + R() * 0.4), i * (8 + R() * 30)); }, T);
    const pop = g(0.35); every(2500, 9000, () => { click(pop, 0.9, 800); drop(pop, 180 + R() * 120, 0.25, 0.06); }, T);
  } else if (kind === "waves") {
    // la mer : un fond grave, et des vagues qui arrivent une à une, se brisent et se retirent
    S.push(src(chain(filt("lowpass", 220), g(0.22)), brown)); S.push(src(chain(filt("lowpass", 700), g(0.05)), pink));
    const wv = g(0.8); wave(wv); every(5500, 10000, () => wave(wv), T);
  } else if (kind === "stream") {
    // le ruisseau : un murmure clair et plein de petites bulles
    const bed = g(0.1); S.push(src(chain(filt("bandpass", 1400, 0.6), filt("highpass", 500), bed), pink)); drift(bed.gain, 0.06, 0.12, 1500, 4000, T);
    const bb = g(0.4); every(12, 70, () => bubble(bb, 350 + R() * R() * 1600, 0.12 + R() * 0.35), T);
  } else if (kind === "night") {
    S.push(src(chain(filt("lowpass", 300), g(0.1)), brown));
    const cr = g(0.05); every(500, 1500, () => { const p = pan(cr, R() * 1.4 - 0.7); for (let i = 0; i < 3; i++) blip(p, { type: "square", f1: 4400, f2: 4300, dur: 0.04, a: 0.5, delay: i * 0.06 }); }, T);
  } else if (kind === "cafe") {
    const gg = g(0.3); S.push(src(chain(filt("bandpass", 520, 1.2), gg), pink)); drift(gg.gain, 0.2, 0.34, 1500, 4000, T);
    const cl = g(0.07); every(2500, 8000, () => blip(pan(cl, R() * 1.4 - 0.7), { f1: 2900 + R() * 900, f2: 2800, dur: 0.35, a: 0.5 }), T);
  } else if (kind === "city") {
    const gg = g(0.5); S.push(src(chain(filt("lowpass", 260), gg), brown)); drift(gg.gain, 0.35, 0.6, 3000, 9000, T);
  } else if (kind === "space") {
    S.push(src(chain(filt("lowpass", 180), g(0.35)), brown));
    [55, 82.4].forEach((f) => { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(g(0.05)); o.start(); S.push(o); });
  }
  return () => { T.forEach(clearTimeout); S.forEach((n) => { try { n.stop(); } catch (_) {} }); };
}

// Pour la page d'écoute : joue un seul son pendant quelques secondes
export function previewAmbient(kind, vol = 0.7) {
  if (!boot()) return () => {};
  ctx.resume?.(); const gn = ctx.createGain(); gn.gain.value = vol; gn.connect(ctx.destination);
  const stop = build(kind, gn); return () => { stop(); gn.disconnect(); };
}

function sync() {
  const want = st.muted || st.hold ? [] : st.layers.filter((l) => !st.off[layerKey(l)]);
  const keys = new Set(want.map(layerKey));
  for (const [k, v] of live) if (!keys.has(k)) { v.stop(); live.delete(k); }
  if (!want.length) return;
  if (!boot()) return;
  master.gain.value = st.vol;
  for (const l of want) {
    const k = layerKey(l); const vol = l.vol ?? 0.7;
    const cur = live.get(k);
    if (cur) { cur.set(vol); continue; }
    if (l.id === "file") {
      const a = new Audio(imgSrc(l.url)); a.loop = true; a.crossOrigin = "anonymous"; a.volume = Math.min(1, vol * st.vol); a.play().catch(() => {});
      const resume = () => a.paused && a.play().catch(() => {}); window.addEventListener("pointerdown", resume, { once: true });
      live.set(k, { stop: () => a.pause(), set: (v) => { a.volume = Math.min(1, v * st.vol); } });
    } else {
      const gn = ctx.createGain(); gn.gain.value = vol; gn.connect(master);
      const stop = build(l.id, gn);
      live.set(k, { stop: () => { stop(); gn.disconnect(); }, set: (v) => { gn.gain.value = v; } });
    }
  }
}
