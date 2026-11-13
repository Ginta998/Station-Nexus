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

let settings = { pack: "auto", theme: "abysse", muted: false, volume: 0.7, zone: "" };
export const configureSound = (s) => { settings = { ...settings, ...s }; };
export const primeAudioCtx = () => { getCtx(); };

// sortie avec écho optionnel — un bus partagé par réglage d'écho
const buses = new Map();
function out(c, echo) {
  const vol = (settings.volume ?? 0.7) * 1.6;
  const id = echo ? `${echo.time}|${echo.fb}|${echo.tone}` : "dry";
  let bus = buses.get(id);
  if (!bus) {
    bus = c.createGain(); bus.connect(c.destination);
    if (echo) {
      const d = c.createDelay(1); d.delayTime.value = echo.time;
      const fb = c.createGain(); fb.gain.value = echo.fb;
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = echo.tone || 2400;
      bus.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(c.destination);
    }
    buses.set(id, bus);
  }
  bus.gain.value = vol;
  return bus;
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

function noise(c, dest, { at = 0, dur, gain, type = "bandpass", f = 2500, q = 1, attack = 0 }) {
  const t = c.currentTime + at;
  const s = c.createBufferSource(); s.buffer = getNoise(c);
  const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = c.createGain();
  if (attack) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); } else g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(dest);
  s.start(t); s.stop(t + dur + 0.02);
}

// souffle filtré qui balaie une plage de fréquences (ouverture / fermeture de panneau)
function sweep(c, dest, { at = 0, dur, gain, from, to, q = 0.9 }) {
  const t = c.currentTime + at;
  const s = c.createBufferSource(); s.buffer = getNoise(c);
  const fl = c.createBiquadFilter(); fl.type = "bandpass"; fl.Q.value = q;
  fl.frequency.setValueAtTime(from, t); fl.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.02);
}
const jitter = (f, amt = 0.06) => f * (1 + (Math.random() - 0.5) * amt);

const PACKS = {
  laboratoire: {
    label: "Laboratoire", hint: "Doux · net · salle blanche",
    // Sons courts, doux et feutrés : sinusoïdes filtrées, aucun aigu perçant, aucun écho métallique
    play(c, ev) {
      const room = out(c, { time: 0.09, fb: 0.12, tone: 1800 });
      const dry = out(c);
      if (ev === "hover") tone(c, dry, { f: 1046.5, dur: 0.03, gain: 0.012, attack: 0.002, lp: 1800 });
      if (ev === "type") playKeyOn(c, dry, 0.6);
      if (ev === "nav") { tone(c, room, { type: "triangle", f: 784, dur: 0.09, gain: 0.03, attack: 0.003, lp: 1800 }); tone(c, room, { f: 1174.7, at: 0.05, dur: 0.12, gain: 0.016, attack: 0.004, lp: 2000 }); }
      if (ev === "select") {
        tone(c, room, { f: 523.25, dur: 0.22, gain: 0.03, attack: 0.004, lp: 1600 });
        tone(c, room, { f: 783.99, at: 0.04, dur: 0.26, gain: 0.022, attack: 0.004, lp: 1800 });
        tone(c, dry, { f: 92, f2: 70, dur: 0.1, gain: 0.06, attack: 0.003, lp: 300 });
      }
      if (ev === "back") tone(c, room, { type: "triangle", f: 784, f2: 523.25, dur: 0.12, gain: 0.025, attack: 0.003, lp: 1600 });
      if (ev === "open") { sweep(c, dry, { dur: 0.32, gain: 0.018, from: 300, to: 1600, q: 0.7 }); tone(c, room, { f: 659.25, at: 0.18, dur: 0.2, gain: 0.018, lp: 1600 }); }
      if (ev === "close") sweep(c, dry, { dur: 0.26, gain: 0.016, from: 1500, to: 300, q: 0.7 });
      if (ev === "grant") {
        [523.25, 659.25, 783.99, 987.77].forEach((f, i) => tone(c, room, { f, at: i * 0.06, dur: 1.6, gain: 0.018, attack: 0.04, lp: 2200 }));
        tone(c, dry, { f: 65.4, dur: 1.4, gain: 0.07, attack: 0.08, lp: 220 });
      }
    },
  },
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
    label: "Elysium", hint: "Halo · futuriste feutré",
    play(c, ev) {
      const d = out(c, { time: 0.16, fb: 0.26, tone: 2600 });
      if (ev === "hover") tone(c, d, { f: 1180, f2: 1420, dur: 0.06, gain: 0.012, lp: 2200 });
      if (ev === "nav") { tone(c, d, { f: 660, dur: 0.2, gain: 0.03, attack: 0.012, lp: 2400 }); tone(c, d, { f: 990, at: 0.02, dur: 0.16, gain: 0.014, attack: 0.012, lp: 2400 }); }
      if (ev === "select") { tone(c, d, { type: "triangle", f: 523, f2: 587, dur: 0.34, gain: 0.035, attack: 0.015, lp: 2000 }); tone(c, d, { f: 784, at: 0.05, dur: 0.3, gain: 0.02, attack: 0.02, lp: 2400 }); noise(c, d, { dur: 0.18, gain: 0.006, type: "highpass", f: 6000 }); }
      if (ev === "back") tone(c, d, { f: 784, f2: 494, dur: 0.22, gain: 0.03, attack: 0.01, lp: 2000 });
    },
  },
  neant: {
    label: "Néant", hint: "Souffle · présence sourde",
    play(c, ev) {
      const d = out(c, { time: 0.24, fb: 0.3, tone: 700 });
      if (ev === "hover") tone(c, d, { f: 140, dur: 0.08, gain: 0.03, attack: 0.01, lp: 400 });
      if (ev === "nav") { noise(c, d, { dur: 0.28, gain: 0.03, type: "lowpass", f: 600, attack: 0.08 }); tone(c, d, { f: 98, dur: 0.22, gain: 0.04, attack: 0.03, lp: 300 }); }
      if (ev === "select") { tone(c, d, { f: 73, dur: 0.6, gain: 0.07, attack: 0.04, lp: 300 }); tone(c, d, { f: 110, at: 0.02, dur: 0.55, gain: 0.03, attack: 0.05, lp: 420 }); tone(c, d, { f: 111.6, at: 0.02, dur: 0.55, gain: 0.025, attack: 0.05, lp: 420 }); }
      if (ev === "back") { tone(c, d, { f: 147, f2: 92, dur: 0.3, gain: 0.04, attack: 0.02, lp: 400 }); noise(c, d, { dur: 0.2, gain: 0.015, type: "lowpass", f: 500, attack: 0.05 }); }
    },
  },
  glacier: {
    label: "Glacier", hint: "Givre · cristal feutré",
    play(c, ev) {
      const d = out(c, { time: 0.11, fb: 0.22, tone: 3800 });
      if (ev === "hover") tone(c, d, { f: 1760, dur: 0.05, gain: 0.008, lp: 3200 });
      if (ev === "nav") { tone(c, d, { type: "triangle", f: 880, dur: 0.12, gain: 0.02, attack: 0.006, lp: 3000 }); noise(c, d, { at: 0.01, dur: 0.06, gain: 0.006, type: "highpass", f: 7000 }); }
      if (ev === "select") { tone(c, d, { f: 659, f2: 988, dur: 0.22, gain: 0.03, attack: 0.008, lp: 3000 }); tone(c, d, { f: 1318, at: 0.06, dur: 0.18, gain: 0.01, lp: 3400 }); noise(c, d, { at: 0.04, dur: 0.1, gain: 0.008, f: 4200, q: 6 }); }
      if (ev === "back") tone(c, d, { type: "triangle", f: 988, f2: 659, dur: 0.18, gain: 0.022, attack: 0.006, lp: 2800 });
    },
  },
  neptune: {
    label: "Neptune", hint: "Bulles · sous la surface",
    play(c, ev) {
      const d = out(c, { time: 0.22, fb: 0.3, tone: 900 });
      if (ev === "hover") tone(c, d, { f: 380, f2: 680, dur: 0.035, gain: 0.025, lp: 1200 });
      if (ev === "nav") { tone(c, d, { f: 420, f2: 760, dur: 0.04, gain: 0.03, lp: 1300 }); tone(c, d, { f: 520, f2: 900, at: 0.06, dur: 0.035, gain: 0.02, lp: 1300 }); }
      if (ev === "select") { tone(c, d, { f: 220, f2: 440, dur: 0.16, gain: 0.06, attack: 0.01, lp: 900 }); tone(c, d, { f: 110, dur: 0.35, gain: 0.04, attack: 0.02, lp: 500 }); }
      if (ev === "back") tone(c, d, { f: 600, f2: 250, dur: 0.12, gain: 0.04, lp: 1000 });
    },
  },
  singularite: {
    label: "Singularité", hint: "Distorsion · infini",
    play(c, ev) {
      const d = out(c, { time: 0.18, fb: 0.35, tone: 1800 });
      if (ev === "hover") tone(c, d, { f: 900, f2: 860, dur: 0.07, gain: 0.012, lp: 2000, mod: { ratio: 0.5, index: 0.3 } });
      if (ev === "nav") { tone(c, d, { f: 330, f2: 495, dur: 0.18, gain: 0.03, attack: 0.02, lp: 1600 }); tone(c, d, { f: 333, f2: 498, dur: 0.18, gain: 0.02, attack: 0.02, lp: 1600 }); }
      if (ev === "select") { tone(c, d, { f: 220, f2: 660, dur: 0.4, gain: 0.04, attack: 0.03, lp: 1800 }); tone(c, d, { f: 440, at: 0.12, dur: 0.35, gain: 0.018, lp: 2000, mod: { ratio: 1.5, index: 0.6 } }); }
      if (ev === "back") tone(c, d, { f: 660, f2: 220, dur: 0.28, gain: 0.03, attack: 0.01, lp: 1500 });
    },
  },
  blackhole: {
    label: "Black Hole", hint: "Gravité · aspiration",
    play(c, ev) {
      const d = out(c, { time: 0.3, fb: 0.28, tone: 800 });
      if (ev === "hover") tone(c, d, { f: 220, f2: 160, dur: 0.07, gain: 0.025, lp: 700 });
      if (ev === "nav") { noise(c, d, { dur: 0.25, gain: 0.02, type: "lowpass", f: 900, attack: 0.15 }); tone(c, d, { f: 180, f2: 90, dur: 0.25, gain: 0.04, attack: 0.03, lp: 600 }); }
      if (ev === "select") { tone(c, d, { f: 400, f2: 55, dur: 0.55, gain: 0.06, attack: 0.02, lp: 900 }); tone(c, d, { f: 55, at: 0.4, dur: 0.4, gain: 0.06, attack: 0.02, lp: 300 }); }
      if (ev === "back") tone(c, d, { f: 90, f2: 200, dur: 0.22, gain: 0.04, attack: 0.02, lp: 700 });
    },
  },
  supernova: {
    label: "Supernova", hint: "Braise · souffle chaud",
    play(c, ev) {
      const d = out(c, { time: 0.14, fb: 0.2, tone: 2200 });
      if (ev === "hover") noise(c, d, { dur: 0.05, gain: 0.015, f: 1800, q: 2, attack: 0.01 });
      if (ev === "nav") { tone(c, d, { type: "triangle", f: 294, f2: 392, dur: 0.14, gain: 0.03, attack: 0.008, lp: 1800 }); noise(c, d, { dur: 0.12, gain: 0.012, f: 2500, q: 1.5, attack: 0.02 }); }
      if (ev === "select") { noise(c, d, { dur: 0.4, gain: 0.03, type: "lowpass", f: 1600, attack: 0.04 }); tone(c, d, { f: 196, f2: 392, dur: 0.35, gain: 0.05, attack: 0.02, lp: 1400 }); }
      if (ev === "back") tone(c, d, { type: "triangle", f: 392, f2: 220, dur: 0.18, gain: 0.03, attack: 0.008, lp: 1500 });
    },
  },
  helios: {
    label: "Hélios", hint: "Or chaud · halo solaire",
    play(c, ev) {
      const d = out(c, { time: 0.15, fb: 0.24, tone: 2400 });
      if (ev === "hover") tone(c, d, { f: 1047, dur: 0.07, gain: 0.01, attack: 0.01, lp: 2200 });
      if (ev === "nav") { tone(c, d, { f: 523, dur: 0.2, gain: 0.025, attack: 0.015, lp: 2000 }); tone(c, d, { f: 784, at: 0.03, dur: 0.18, gain: 0.014, attack: 0.015, lp: 2000 }); }
      if (ev === "select") { [523, 659, 784].forEach((f, i) => tone(c, d, { type: "triangle", f, at: i * 0.04, dur: 0.4, gain: 0.022, attack: 0.02, lp: 1800 })); }
      if (ev === "back") tone(c, d, { f: 659, f2: 440, dur: 0.22, gain: 0.025, attack: 0.012, lp: 1800 });
    },
  },
  akira: {
    label: "Akira", hint: "Néo-Tokyo · impulsions",
    play(c, ev) {
      const d = out(c, { time: 0.09, fb: 0.18, tone: 3000 });
      if (ev === "hover") tone(c, d, { type: "square", f: 1600, dur: 0.018, gain: 0.006, lp: 2500 });
      if (ev === "nav") { tone(c, d, { type: "sawtooth", f: 440, dur: 0.05, gain: 0.02, lp: 1600 }); tone(c, d, { type: "sawtooth", f: 660, at: 0.05, dur: 0.05, gain: 0.016, lp: 1600 }); }
      if (ev === "select") { tone(c, d, { type: "sawtooth", f: 110, f2: 220, dur: 0.14, gain: 0.04, lp: 900 }); tone(c, d, { type: "square", f: 880, at: 0.1, dur: 0.08, gain: 0.012, lp: 2200 }); noise(c, d, { dur: 0.04, gain: 0.03, f: 3000, q: 3 }); }
      if (ev === "back") tone(c, d, { type: "sawtooth", f: 660, f2: 330, dur: 0.1, gain: 0.02, lp: 1400 });
    },
  },
  tengoku: {
    label: "Tengoku", hint: "Koto cyber · lame de cerisier",
    play(c, ev) {
      const d = out(c, { time: 0.19, fb: 0.3, tone: 2800 });
      if (ev === "hover") tone(c, d, { type: "triangle", f: 1760, dur: 0.05, gain: 0.008, attack: 0.002, lp: 3000 });
      if (ev === "nav") { tone(c, d, { type: "triangle", f: 880, dur: 0.16, gain: 0.024, attack: 0.002, lp: 2600 }); tone(c, d, { type: "triangle", f: 1175, at: 0.06, dur: 0.14, gain: 0.016, attack: 0.002, lp: 2600 }); }
      if (ev === "select") { [587, 698, 880, 1047].forEach((f, i) => tone(c, d, { type: "triangle", f, at: i * 0.045, dur: 0.42, gain: 0.02, attack: 0.002, lp: 2400 })); noise(c, d, { dur: 0.06, gain: 0.018, f: 5200, q: 4 }); tone(c, d, { type: "sawtooth", f: 73, dur: 0.22, gain: 0.025, lp: 500 }); }
      if (ev === "back") tone(c, d, { type: "triangle", f: 1047, f2: 698, dur: 0.2, gain: 0.02, attack: 0.002, lp: 2400 });
    },
  },
  aurum: {
    label: "Aurum", hint: "Or forgé · résonance",
    play(c, ev) {
      const d = out(c, { time: 0.17, fb: 0.26, tone: 2000 });
      if (ev === "hover") tone(c, d, { f: 1320, dur: 0.08, gain: 0.008, lp: 2000, mod: { ratio: 2.01, index: 0.2 } });
      if (ev === "nav") tone(c, d, { f: 587, dur: 0.28, gain: 0.025, attack: 0.008, lp: 1800, mod: { ratio: 2.01, index: 0.5 } });
      if (ev === "select") { tone(c, d, { f: 392, dur: 0.55, gain: 0.035, attack: 0.01, lp: 1600, mod: { ratio: 2.01, index: 0.7 } }); tone(c, d, { f: 98, dur: 0.4, gain: 0.04, attack: 0.02, lp: 400 }); }
      if (ev === "back") tone(c, d, { f: 587, f2: 440, dur: 0.24, gain: 0.022, attack: 0.008, lp: 1600, mod: { ratio: 2.01, index: 0.4 } });
    },
  },
  megapole: {
    label: "Mégapole", hint: "Interface urbaine · néon",
    play(c, ev) {
      const d = out(c, { time: 0.12, fb: 0.2, tone: 2600 });
      if (ev === "hover") tone(c, d, { f: 1200, dur: 0.025, gain: 0.01, lp: 2600 });
      if (ev === "nav") { tone(c, d, { type: "triangle", f: 740, dur: 0.06, gain: 0.022, lp: 2400 }); tone(c, d, { type: "triangle", f: 988, at: 0.06, dur: 0.06, gain: 0.018, lp: 2400 }); }
      if (ev === "select") { tone(c, d, { type: "triangle", f: 494, dur: 0.08, gain: 0.03, lp: 2000 }); tone(c, d, { type: "triangle", f: 740, at: 0.07, dur: 0.08, gain: 0.025, lp: 2200 }); tone(c, d, { f: 988, at: 0.14, dur: 0.2, gain: 0.02, lp: 2400 }); }
      if (ev === "back") { tone(c, d, { type: "triangle", f: 988, dur: 0.06, gain: 0.02, lp: 2200 }); tone(c, d, { type: "triangle", f: 740, at: 0.06, dur: 0.08, gain: 0.018, lp: 2200 }); }
    },
  },
  biome: {
    label: "Biome", hint: "Bois · gouttes · nature",
    play(c, ev) {
      const d = out(c, { time: 0.13, fb: 0.22, tone: 2000 });
      if (ev === "hover") tone(c, d, { f: 1400, f2: 1800, dur: 0.03, gain: 0.012, lp: 2600 });
      if (ev === "nav") { noise(c, d, { dur: 0.03, gain: 0.04, f: 900, q: 6 }); tone(c, d, { f: 620, dur: 0.09, gain: 0.025, lp: 1400 }); }
      if (ev === "select") { tone(c, d, { f: 880, f2: 1320, dur: 0.06, gain: 0.025, lp: 2400 }); tone(c, d, { f: 330, at: 0.03, dur: 0.3, gain: 0.03, attack: 0.01, lp: 1000 }); noise(c, d, { at: 0.02, dur: 0.05, gain: 0.03, f: 700, q: 5 }); }
      if (ev === "back") { noise(c, d, { dur: 0.03, gain: 0.035, f: 800, q: 6 }); tone(c, d, { f: 520, f2: 390, dur: 0.12, gain: 0.02, lp: 1300 }); }
    },
  },
  bunny: {
    label: "Bunny", hint: "Doux · pétillant",
    play(c, ev) {
      const d = out(c, { time: 0.12, fb: 0.2, tone: 3000 });
      if (ev === "hover") tone(c, d, { f: 1568, f2: 1760, dur: 0.05, gain: 0.01, lp: 3000 });
      if (ev === "nav") tone(c, d, { f: 784, f2: 1047, dur: 0.1, gain: 0.025, attack: 0.008, lp: 2600 });
      if (ev === "select") { tone(c, d, { f: 784, dur: 0.1, gain: 0.022, lp: 2600 }); tone(c, d, { f: 1047, at: 0.08, dur: 0.1, gain: 0.02, lp: 2600 }); tone(c, d, { f: 1319, at: 0.16, dur: 0.16, gain: 0.016, lp: 2800 }); }
      if (ev === "back") tone(c, d, { f: 1047, f2: 784, dur: 0.12, gain: 0.02, lp: 2400 });
      if (ev === "chirp") { [1047, 1319, 1568, 2093].forEach((f, i) => tone(c, d, { f, f2: f * 1.02, at: i * 0.06, dur: 0.14, gain: 0.018 - i * 0.003, attack: 0.006, lp: 3400 })); tone(c, d, { f: 523, f2: 784, at: 0.02, dur: 0.32, gain: 0.012, attack: 0.02, lp: 1800 }); }
      if (ev === "oops") { tone(c, d, { f: 784, f2: 523, dur: 0.18, gain: 0.02, lp: 2200 }); tone(c, d, { f: 622, f2: 466, at: 0.14, dur: 0.22, gain: 0.016, lp: 2000 }); }
    },
  },
  albatre: {
    label: "Albâtre", hint: "Pierre · écho mat",
    play(c, ev) {
      const d = out(c, { time: 0.2, fb: 0.22, tone: 1400 });
      if (ev === "hover") noise(c, d, { dur: 0.02, gain: 0.025, f: 1800, q: 4 });
      if (ev === "nav") { noise(c, d, { dur: 0.035, gain: 0.05, f: 1100, q: 5 }); tone(c, d, { f: 280, dur: 0.12, gain: 0.025, lp: 900 }); }
      if (ev === "select") { noise(c, d, { dur: 0.05, gain: 0.06, f: 800, q: 4 }); tone(c, d, { f: 196, dur: 0.35, gain: 0.04, attack: 0.008, lp: 800 }); tone(c, d, { f: 392, at: 0.02, dur: 0.2, gain: 0.015, lp: 1000 }); }
      if (ev === "back") { noise(c, d, { dur: 0.03, gain: 0.04, f: 1300, q: 5 }); tone(c, d, { f: 330, f2: 247, dur: 0.14, gain: 0.02, lp: 900 }); }
    },
  },
  yorha: {
    label: "YoRHa", hint: "Terminal androïde",
    play(c, ev) {
      const d = out(c, { time: 0.1, fb: 0.15, tone: 2400 });
      if (ev === "hover") tone(c, d, { type: "square", f: 2093, dur: 0.012, gain: 0.005, lp: 2400 });
      if (ev === "nav") { tone(c, d, { f: 1175, dur: 0.04, gain: 0.02, lp: 2200 }); tone(c, d, { f: 1175, at: 0.06, dur: 0.03, gain: 0.014, lp: 2200 }); }
      if (ev === "select") { tone(c, d, { f: 880, dur: 0.05, gain: 0.025, lp: 2200 }); tone(c, d, { f: 1319, at: 0.05, dur: 0.12, gain: 0.02, lp: 2400 }); noise(c, d, { dur: 0.025, gain: 0.015, type: "highpass", f: 5000 }); }
      if (ev === "back") tone(c, d, { f: 1319, f2: 880, dur: 0.08, gain: 0.018, lp: 2200 });
    },
  },
};

// thème -> pack (les thèmes sans pack dédié prennent Abysse)
export const THEME_SOUND = { tengoku: "tengoku", monolithe: "monolithe", abysse: "abysse", olympe: "elysium", olympia: "elysium", neant: "neant", glacier: "glacier", neptune: "neptune", singularite: "singularite", blackhole: "blackhole", supernova: "supernova", helios: "helios", akira: "akira", aurum: "aurum", megapole: "megapole", biome: "biome", albatre: "albatre", yorha: "yorha", aincrad: "elysium", aincradnight: "glacier", frontiere: "supernova", terra: "biome", labo: "laboratoire", laboclair: "laboratoire" };
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


// Frappe de clavier mécanique feutrée (indépendante du pack) : « thock » grave + clic doux
function playKeyOn(c, dest, k = 1) {
  tone(c, dest, { f: jitter(150, 0.15), f2: 95, dur: 0.035, gain: 0.07 * k, attack: 0.001, lp: 700 });
  noise(c, dest, { dur: 0.012, gain: 0.06 * k, f: jitter(1900, 0.2), q: 1.4 });
}
// Claviers du démarrage (Réglages de l'Atelier → Ambiance du portail)
export const PORTAL_KEYS = [
  { key: "feutre", label: "Mécanique feutré", hint: "Thock grave, clic doux" },
  { key: "machine", label: "Machine à écrire", hint: "Frappe sèche, ruban" },
  { key: "verre", label: "Touches de verre", hint: "Tapotement cristallin, doux" },
  { key: "goutte", label: "Gouttes", hint: "Petites gouttes d'eau" },
];
function keyVariant(c, dest, kind, k) {
  if (kind === "machine") { noise(c, dest, { dur: 0.022, gain: 0.11 * k, f: jitter(2400, 0.15), q: 1.4 }); tone(c, dest, { type: "square", f: jitter(900, 0.1), f2: 600, dur: 0.02, gain: 0.012 * k, lp: 2600 }); tone(c, dest, { f: 120, dur: 0.03, gain: 0.05 * k, lp: 400 }); }
  else if (kind === "verre") { tone(c, dest, { f: jitter(1318.5, 0.04), dur: 0.09, gain: 0.022 * k, attack: 0.002, lp: 2600 }); noise(c, dest, { dur: 0.006, gain: 0.02 * k, f: 3800, q: 3 }); }
  else if (kind === "goutte") tone(c, dest, { f: jitter(1250, 0.12), f2: 420, dur: 0.09, gain: 0.05 * k, attack: 0.002, lp: 2200 });
  else playKeyOn(c, dest, k);
}
let lastKey = 0;
export function playKey(k = 1, kind) {
  if (settings.muted || (settings.volume ?? 0.7) <= 0) return;
  const n = performance.now(); if (n - lastKey < 28) return; lastKey = n;
  const c = getCtx(); if (!c) return;
  let v = kind; if (!v) { try { v = localStorage.getItem("nx-portal-key") || "feutre"; } catch (_) { v = "feutre"; } }
  keyVariant(c, out(c), v, k);
}

// Ambiances du portail (démarrage de l'Atelier). Renvoie { stop(ms) }.
export const PORTAL_AMBIENCES = [
  { key: "archives", label: "Salle des archives", hint: "Nappe chaude, souffle de la salle" },
  { key: "pluie", label: "Pluie sur le labo", hint: "Pluie douce derrière la vitre" },
  { key: "orbite", label: "Orbite", hint: "Nappe aérienne, carillon lointain" },
];
export function startPortalAmbience(kind = "archives") {
  if (settings.muted || (settings.volume ?? 0.7) <= 0) return { stop() {} };
  const c = getCtx(); if (!c) return { stop() {} };
  const wake = () => { if (c.state === "suspended") c.resume().catch(() => {}); };
  ["pointerdown", "keydown", "touchstart"].forEach((e) => window.addEventListener(e, wake, { passive: true }));
  const master = c.createGain(); master.gain.value = 0.0001; master.connect(c.destination);
  master.gain.setTargetAtTime(Math.min(1, (settings.volume ?? 0.7) * 1.4) * 0.45, c.currentTime, 1.4);
  const nodes = []; const timers = []; let alive = true;
  const osc = (f, type, g, dest, det = 0) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det; const gg = c.createGain(); gg.gain.value = g; o.connect(gg); gg.connect(dest); o.start(); nodes.push(o); return o; };
  const lfo = (rate, depth, param) => { const o = c.createOscillator(); o.frequency.value = rate; const g = c.createGain(); g.gain.value = depth; o.connect(g); g.connect(param); o.start(); nodes.push(o); };
  const noiseLoop = (type, f, q, g, dest) => { const s = c.createBufferSource(); s.buffer = getNoise(c); s.loop = true; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const gg = c.createGain(); gg.gain.value = g; s.connect(fl); fl.connect(gg); gg.connect(dest); s.start(); nodes.push(s); return { fl, gg }; };
  const lowpass = (f, dest = master) => { const l = c.createBiquadFilter(); l.type = "lowpass"; l.frequency.value = f; l.connect(dest); return l; };
  if (kind === "archives") {
    const lp = lowpass(520); lfo(0.05, 140, lp.frequency);
    osc(110, "triangle", 0.09, lp); osc(164.81, "triangle", 0.05, lp, 4); osc(220, "sine", 0.04, lp, -5); osc(55, "sine", 0.08, lp);
    noiseLoop("lowpass", 900, 0.4, 0.03, master);
  } else if (kind === "pluie") {
    const rain = noiseLoop("bandpass", 2600, 0.35, 0.09, master); lfo(0.13, 0.025, rain.gg.gain);
    noiseLoop("lowpass", 380, 0.5, 0.06, master);
    const lp = lowpass(360); osc(73.42, "triangle", 0.07, lp); osc(110, "sine", 0.035, lp, 3);
    const drop = () => { if (!alive) return; noise(c, master, { dur: 0.02, gain: 0.04 + Math.random() * 0.04, f: 1800 + Math.random() * 2600, q: 6 }); timers.push(setTimeout(drop, 60 + Math.random() * 260)); };
    timers.push(setTimeout(drop, 400));
  } else {
    const lp = lowpass(1400); lfo(0.04, 500, lp.frequency);
    osc(146.83, "sine", 0.06, lp); osc(220, "sine", 0.045, lp, 6); osc(329.63, "sine", 0.03, lp, -6); osc(440, "sine", 0.012, lp, 3);
    const wind = noiseLoop("bandpass", 600, 0.7, 0.03, master); lfo(0.07, 350, wind.fl.frequency);
    const chime = () => { if (!alive) return; tone(c, master, { f: [587.33, 659.25, 880, 987.77][Math.floor(Math.random() * 4)], dur: 2.4, gain: 0.014, attack: 0.02, lp: 1800 }); timers.push(setTimeout(chime, 2600 + Math.random() * 3200)); };
    timers.push(setTimeout(chime, 1500));
  }
  return {
    stop(ms = 1200) {
      if (!alive) return; alive = false; timers.forEach(clearTimeout);
      ["pointerdown", "keydown", "touchstart"].forEach((e) => window.removeEventListener(e, wake));
      const t = c.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + ms / 1000);
      setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch (_) {} }); master.disconnect(); }, ms + 100);
    },
  };
}


// Tourner une page d'Alexandrie : papier pour un livre, mécanique de cassette pour une VHS, saphir et craquements pour un vinyle.
// Indépendant du pack du thème, mais coupé avec les autres sons d'interface.
function band(c, dest, { at = 0, dur, gain, from, to, q = 1.1, attack = 0.05, type = "bandpass" }) {
  const t = c.currentTime + at;
  const s = c.createBufferSource(); s.buffer = getNoise(c); s.loop = true;
  const fl = c.createBiquadFilter(); fl.type = type; fl.Q.value = q;
  fl.frequency.setValueAtTime(from, t); fl.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.03);
}
export function playPageTurn(kind = "livre", dir = 1) {
  if (settings.muted || (settings.volume ?? 0.7) <= 0 || settings.pack === "silence") return;
  const c = getCtx(); if (!c) return;
  const d = out(c);
  const r = () => Math.random();
  if (kind === "vhs") {
    // le boîtier en plastique qui s'ouvre : deux petits déclics feutrés et un souffle de bande très discret
    noise(c, d, { dur: 0.022, gain: 0.05, type: "lowpass", f: 1400, q: 0.7 });
    tone(c, d, { f: 210, f2: 150, dur: 0.03, gain: 0.02, attack: 0.001, lp: 900 });
    band(c, d, { at: 0.03, dur: 0.24, gain: 0.006, from: 2600, to: 3400, q: 0.6, attack: 0.08 });
    noise(c, d, { at: 0.2, dur: 0.018, gain: 0.035, type: "lowpass", f: 1100, q: 0.7 });
    return;
  }
  if (kind === "vinyle") {
    // le saphir se pose, un léger frottement, des craquements
    tone(c, d, { f: 72, f2: 44, dur: 0.09, gain: 0.06, attack: 0.002, lp: 300 });
    band(c, d, { at: 0.03, dur: 0.2, gain: 0.025, from: dir > 0 ? 500 : 1300, to: dir > 0 ? 1300 : 500, q: 2.2, attack: 0.03 });
    for (let i = 0; i < 11; i++) noise(c, d, { at: 0.02 + r() * 0.42, dur: 0.004 + r() * 0.005, gain: 0.015 + r() * 0.035, f: 2200 + r() * 3200, q: 1.5 });
    return;
  }
  // papier : la feuille se soulève, glisse, retombe
  band(c, d, { dur: 0.3, gain: 0.06, from: 650, to: 3400, q: 0.8, attack: 0.07 });
  band(c, d, { at: 0.05, dur: 0.22, gain: 0.02, from: 4200, to: 7000, type: "highpass", attack: 0.05 });
  for (let i = 0; i < 4; i++) noise(c, d, { at: 0.03 + r() * 0.2, dur: 0.006 + r() * 0.006, gain: 0.012 + r() * 0.015, f: 4200 + r() * 2200, q: 2 });
  tone(c, d, { f: 140, f2: 70, at: 0.25, dur: 0.07, gain: 0.025, attack: 0.004, lp: 400 });
}
