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
export const layerKey = (l) => l.id === "file" ? l.url : l.id;

let ctx, master, noise; const live = new Map();
const R = Math.random;
function boot() {
  if (ctx) return true;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return false; }
  master = ctx.createGain(); master.connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate); const d = noise.getChannelData(0); let b = 0;
  for (let i = 0; i < d.length; i++) { const w = R() * 2 - 1; b = (b + 0.02 * w) / 1.02; d[i] = w * 0.5 + b * 3; }
  const wake = () => ctx.state === "suspended" && ctx.resume();
  ["pointerdown", "keydown", "touchstart"].forEach((e) => window.addEventListener(e, wake, { passive: true }));
  return true;
}
const src = (out) => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; s.loopStart = R() * 3; s.connect(out); s.start(0, R() * 3); return s; };
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

function build(kind, out) {
  const S = []; const T = []; const g = (v) => { const x = ctx.createGain(); x.gain.value = v; x.connect(out); return x; };
  if (kind === "rain" || kind === "storm") {
    S.push(src(chain(filt("highpass", 900), filt("lowpass", 7000), g(kind === "storm" ? 0.5 : 0.35))));
    const drops = g(0.12); every(25, 110, () => burst(drops, { f: 2500 + R() * 4000, type: "bandpass", dur: 0.03, a: 0.4 * R(), q: 2 }), T);
    if (kind === "storm") { const th = g(1); every(9000, 26000, () => burst(th, { f: 110, type: "lowpass", dur: 3.5, a: 1.2 }), T); }
  } else if (kind === "wind" || kind === "forest") {
    const bp = filt("bandpass", 500, 0.9); const gg = g(kind === "forest" ? 0.25 : 0.55); S.push(src(chain(bp, gg)));
    S.push(lfo(0.07, 280, bp.frequency), lfo(0.11, 0.2, gg.gain));
    if (kind === "forest") { const bird = g(0.08); every(1800, 7000, () => { const b = 2200 + R() * 1800; const n = 2 + Math.floor(R() * 3); for (let i = 0; i < n; i++) blip(bird, { f1: b, f2: b * 1.5, dur: 0.09, a: 0.6, delay: i * 0.13 }); }, T); }
  } else if (kind === "fire") {
    S.push(src(chain(filt("lowpass", 480), g(0.45))));
    const cr = g(0.25); every(35, 260, () => burst(cr, { f: 1800 + R() * 3000, dur: 0.015 + R() * 0.03, a: R() }), T);
  } else if (kind === "waves") {
    const gg = g(0.35); S.push(src(chain(filt("lowpass", 750), gg))); S.push(lfo(0.08, 0.3, gg.gain));
  } else if (kind === "stream") {
    const bp = filt("bandpass", 1700, 0.5); S.push(src(chain(bp, g(0.4)))); S.push(lfo(5.5, 220, bp.frequency));
  } else if (kind === "night") {
    S.push(src(chain(filt("lowpass", 300), g(0.12))));
    const cr = g(0.05); every(500, 1500, () => { for (let i = 0; i < 3; i++) blip(cr, { type: "square", f1: 4400, f2: 4300, dur: 0.04, a: 0.5, delay: i * 0.06 }); }, T);
  } else if (kind === "cafe") {
    const gg = g(0.3); S.push(src(chain(filt("bandpass", 520, 1.2), gg))); S.push(lfo(0.45, 0.12, gg.gain));
    const cl = g(0.07); every(2500, 8000, () => blip(cl, { f1: 2900 + R() * 900, f2: 2800, dur: 0.35, a: 0.5 }), T);
  } else if (kind === "city") {
    const gg = g(0.55); S.push(src(chain(filt("lowpass", 260), gg))); S.push(lfo(0.05, 0.15, gg.gain));
  } else if (kind === "space") {
    S.push(src(chain(filt("lowpass", 180), g(0.35))));
    [55, 82.4].forEach((f) => { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(g(0.05)); o.start(); S.push(o); });
  }
  return () => { T.forEach(clearTimeout); S.forEach((n) => { try { n.stop(); } catch (_) {} }); };
}

function sync() {
  const want = st.muted ? [] : st.layers.filter((l) => !st.off[layerKey(l)]);
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
