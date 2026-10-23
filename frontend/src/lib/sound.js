// Sons d'interface synthétisés — un pack par thème (Monolithe, Abysse, Elysium).
let ctx = null;
let noiseBuf = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); }
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
};
const getNoise = (c) => {
  if (noiseBuf) return noiseBuf;
  noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
};

let settings = { pack: "auto", theme: "abysse", muted: false, volume: 0.7 };
export const configureSound = (s) => { settings = { ...settings, ...s }; };
export const primeAudioCtx = () => { getCtx(); };

// sortie avec écho optionnel (profondeur / réverbération)
function out(c, echo) {
  const g = c.createGain(); g.gain.value = (settings.volume ?? 0.7) * 1.6;
  g.connect(c.destination);
  if (echo) {
    const d = c.createDelay(1); d.delayTime.value = echo.time;
    const fb = c.createGain(); fb.gain.value = echo.fb;
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = echo.tone || 2400;
    g.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(c.destination);
    setTimeout(() => { try { g.disconnect(); d.disconnect(); } catch (_) {} }, 3000);
  }
  return g;
}

function tone(c, dest, { type = "sine", f, f2, at = 0, dur, gain, attack = 0.004, lp, mod }) {
  const t = c.currentTime + at;
  const o = c.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (mod) { // FM métallique
    const m = c.createOscillator(); m.frequency.value = f * mod.ratio;
    const mg = c.createGain(); mg.gain.value = f * mod.index;
    m.connect(mg); mg.connect(o.frequency); m.start(t); m.stop(t + dur + 0.05);
  }
  if (lp) { const fl = c.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = lp; node.connect(fl); node = fl; }
  node.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + 0.05);
}

function noise(c, dest, { at = 0, dur, gain, type = "bandpass", f = 2500, q = 1 }) {
  const t = c.currentTime + at;
  const s = c.createBufferSource(); s.buffer = getNoise(c);
  const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(dest);
  s.start(t); s.stop(t + dur + 0.02);
}

const bell = (c, d, f, at, dur, gain) => [1, 2.76, 5.4, 8.93].forEach((r, i) =>
  tone(c, d, { f: f * r, at, dur: dur / (1 + i * 0.6), gain: gain / (1 + i * 1.4), attack: 0.003 }));

const PACKS = {
  monolithe: {
    label: "Monolithe", hint: "Acier · mécanique précise",
    play(c, ev) {
      const d = out(c);
      if (ev === "hover") { noise(c, d, { dur: 0.012, gain: 0.05, type: "highpass", f: 5200 }); tone(c, d, { f: 3200, dur: 0.02, gain: 0.012 }); }
      if (ev === "nav") { noise(c, d, { dur: 0.02, gain: 0.09, f: 2600, q: 4 }); noise(c, d, { at: 0.045, dur: 0.018, gain: 0.07, f: 3400, q: 4 }); tone(c, d, { type: "square", f: 110, dur: 0.04, gain: 0.04, lp: 500 }); }
      if (ev === "select") { tone(c, d, { type: "sawtooth", f: 190, f2: 85, dur: 0.14, gain: 0.07, lp: 900 }); noise(c, d, { at: 0.12, dur: 0.03, gain: 0.12, f: 1800, q: 3 }); tone(c, d, { f: 1180, at: 0.13, dur: 0.32, gain: 0.035, mod: { ratio: 1.43, index: 1.6 } }); }
      if (ev === "back") { tone(c, d, { type: "sawtooth", f: 85, f2: 170, dur: 0.11, gain: 0.06, lp: 800 }); noise(c, d, { at: 0.1, dur: 0.02, gain: 0.08, f: 2200, q: 4 }); }
    },
  },
  abysse: {
    label: "Abysse", hint: "Sonar · profondeurs",
    play(c, ev) {
      const d = out(c, { time: 0.19, fb: 0.38, tone: 1400 });
      if (ev === "hover") tone(c, d, { f: 620, f2: 1080, dur: 0.05, gain: 0.025, lp: 1800 });
      if (ev === "nav") tone(c, d, { f: 540, dur: 0.38, gain: 0.05, attack: 0.008, lp: 2000 });
      if (ev === "select") { tone(c, d, { f: 392, dur: 0.7, gain: 0.06, attack: 0.01 }); tone(c, d, { f: 784, at: 0.04, dur: 0.45, gain: 0.03 }); tone(c, d, { f: 65, dur: 0.5, gain: 0.08, attack: 0.02 }); }
      if (ev === "back") { tone(c, d, { f: 920, f2: 380, dur: 0.16, gain: 0.04, lp: 1600 }); tone(c, d, { f: 300, at: 0.08, dur: 0.3, gain: 0.03 }); }
    },
  },
  elysium: {
    label: "Elysium", hint: "Cristal · divin",
    play(c, ev) {
      const d = out(c, { time: 0.13, fb: 0.32, tone: 5200 });
      if (ev === "hover") tone(c, d, { f: 2637, dur: 0.12, gain: 0.012 });
      if (ev === "nav") bell(c, d, 1318, 0, 0.5, 0.035);
      if (ev === "select") { bell(c, d, 784, 0, 0.9, 0.035); bell(c, d, 1175, 0.035, 0.8, 0.028); bell(c, d, 1568, 0.07, 0.7, 0.024); }
      if (ev === "back") { bell(c, d, 988, 0, 0.35, 0.03); bell(c, d, 659, 0.08, 0.5, 0.03); }
    },
  },
};

// thème -> pack (les thèmes sans pack dédié prennent Abysse)
export const THEME_SOUND = { monolithe: "monolithe", abysse: "abysse", olympe: "elysium" };
export const packForTheme = (theme) => THEME_SOUND[theme] || "abysse";
export const SOUND_PACKS = Object.entries(PACKS).map(([key, v]) => ({ key, label: v.label, hint: v.hint }));
export const isValidPack = (p) => p === "auto" || p === "silence" || !!PACKS[p];

export function playUiSound(event, forcePack) {
  if (settings.muted || (settings.volume ?? 0.7) <= 0) return;
  const key = forcePack || (settings.pack === "auto" ? packForTheme(settings.theme) : settings.pack);
  if (key === "silence") return;
  const c = getCtx(); if (!c) return;
  (PACKS[key] || PACKS.abysse).play(c, event);
}
