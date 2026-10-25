// Boot intro definitions + synthesized boot sounds (Web Audio, no files needed).
export const INTROS = [
  { key: "hud", label: "Réticule HUD", kanji: "天", tagline: "Le réticule du favicon s'assemble (premium)", duration: 3600 },
  { key: "warp", label: "Hyperespace", kanji: "翔", tagline: "Saut en vitesse lumière vers la station (premium)", duration: 3600 },
  { key: "eclipse", label: "Éclipse", kanji: "蝕", tagline: "Couronne solaire et anneau de diamant (premium)", duration: 3800 },
  { key: "tengoku", label: "Tengoku", kanji: "天", tagline: "Soleil levant", duration: 3200 },
  { key: "kanji", label: "Kanji Storm", kanji: "嵐", tagline: "Tempête d'idéogrammes", duration: 3200 },
  { key: "pulse", label: "Pulse", kanji: "波", tagline: "Onde lumineuse (façon Steam)", duration: 3200 },
  { key: "towers", label: "Colonnes", kanji: "光", tagline: "Colonnes de lumière (façon PS2)", duration: 3600 },
  { key: "slash", label: "Anime Slash", kanji: "閃", tagline: "Sabre & lignes de vitesse", duration: 3400 },
  { key: "hanabi", label: "Hanabi", kanji: "華", tagline: "Explosion de particules", duration: 3400 },
];

let ctx = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
};

function note(c, { type = "sine", freq, dur, gain = 0.1, glide, delay = 0, vol = 1 }) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  const t = c.currentTime + delay;
  osc.frequency.setValueAtTime(freq, t);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * vol), t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(c.destination);
  osc.start(t); osc.stop(t + dur + 0.05);
}

// distinct boot sound per intro. vol in 0..1 (ui volume), skip if muted.
export function playBoot(type, { muted = false, volume = 0.8 } = {}) {
  if (muted || volume <= 0) return;
  const c = getCtx();
  if (!c) return;
  const v = volume;
  if (type === "hud") {
    // HUD : bips de verrouillage, balayage montant, accord d'arrivée
    [0.15, 0.5, 0.85].forEach((d, i) => note(c, { type: "square", freq: 1760 + i * 220, dur: 0.05, gain: 0.03, delay: d, vol: v }));
    note(c, { type: "sawtooth", freq: 110, glide: 440, dur: 1.2, gain: 0.05, delay: 0.2, vol: v });
    note(c, { type: "sine", freq: 55, dur: 0.7, gain: 0.25, delay: 1.35, vol: v });
    [392, 587, 784, 1175].forEach((f, i) => note(c, { type: "triangle", freq: f, dur: 1.8, gain: 0.06, delay: 1.4 + i * 0.05, vol: v }));
    return;
  }
  if (type === "warp") {
    // hyperespace : montée tendue puis impact et nappe lumineuse
    note(c, { type: "sawtooth", freq: 60, glide: 1400, dur: 1.1, gain: 0.07, vol: v });
    note(c, { type: "sine", freq: 220, glide: 1760, dur: 1.05, gain: 0.06, vol: v });
    note(c, { type: "sine", freq: 48, dur: 0.9, gain: 0.32, delay: 1.05, vol: v });
    [330, 494, 659, 988].forEach((f, i) => note(c, { type: "triangle", freq: f, dur: 2, gain: 0.06, delay: 1.1 + i * 0.07, vol: v }));
    return;
  }
  if (type === "eclipse") {
    // éclipse : nappe grave qui s'ouvre, scintillement du diamant
    note(c, { type: "sine", freq: 65, glide: 98, dur: 2.2, gain: 0.16, vol: v });
    note(c, { type: "triangle", freq: 196, glide: 294, dur: 1.8, gain: 0.06, delay: 0.3, vol: v });
    [2093, 2637, 3136].forEach((f, i) => note(c, { type: "sine", freq: f, dur: 0.6, gain: 0.03, delay: 1.5 + i * 0.08, vol: v }));
    [262, 392, 523, 784].forEach((f, i) => note(c, { type: "sine", freq: f, dur: 2, gain: 0.06, delay: 1.7 + i * 0.06, vol: v }));
    return;
  }
  if (type === "tengoku") {
    // deep taiko impact + rising hopeful swell
    note(c, { type: "sine", freq: 90, glide: 55, dur: 0.5, gain: 0.28, vol: v });
    note(c, { type: "triangle", freq: 220, glide: 660, dur: 1.4, gain: 0.12, delay: 0.25, vol: v });
    note(c, { type: "sine", freq: 523, dur: 1.6, gain: 0.1, delay: 0.9, vol: v });
    note(c, { type: "sine", freq: 784, dur: 1.8, gain: 0.08, delay: 1.1, vol: v });
  } else if (type === "kanji") {
    // shimmering ascending arpeggio
    [523, 659, 784, 988, 1319].forEach((f, i) =>
      note(c, { type: "triangle", freq: f, dur: 0.5, gain: 0.09, delay: i * 0.18, vol: v }));
    note(c, { type: "sine", freq: 1568, dur: 1.4, gain: 0.07, delay: 1.0, vol: v });
  } else if (type === "pulse") {
    // Steam-like: warm swell + soft low pulses + bright arrival
    note(c, { type: "sine", freq: 174, glide: 349, dur: 1.6, gain: 0.14, vol: v });
    note(c, { type: "sine", freq: 110, dur: 0.3, gain: 0.16, delay: 0.15, vol: v });
    note(c, { type: "sine", freq: 110, dur: 0.3, gain: 0.14, delay: 0.75, vol: v });
    note(c, { type: "triangle", freq: 659, dur: 1.6, gain: 0.09, delay: 1.2, vol: v });
    note(c, { type: "sine", freq: 988, dur: 1.6, gain: 0.07, delay: 1.5, vol: v });
  } else if (type === "towers") {
    // PS2-like: rising shimmering pads building up
    [130, 196, 261, 329, 392, 523].forEach((f, i) =>
      note(c, { type: "triangle", freq: f, glide: f * 1.5, dur: 1.6, gain: 0.07, delay: i * 0.25, vol: v }));
    note(c, { type: "sine", freq: 784, dur: 1.8, gain: 0.08, delay: 1.6, vol: v });
  } else if (type === "slash") {
    // anime slash: metallic swipe(s) → deep impact → hopeful tail
    note(c, { type: "sawtooth", freq: 2200, glide: 500, dur: 0.16, gain: 0.09, delay: 0.7, vol: v });
    note(c, { type: "sawtooth", freq: 2600, glide: 600, dur: 0.16, gain: 0.09, delay: 0.95, vol: v });
    note(c, { type: "sine", freq: 80, glide: 48, dur: 0.5, gain: 0.3, delay: 1.05, vol: v });
    note(c, { type: "triangle", freq: 660, glide: 990, dur: 1.3, gain: 0.09, delay: 1.2, vol: v });
    note(c, { type: "sine", freq: 988, dur: 1.4, gain: 0.07, delay: 1.5, vol: v });
  } else if (type === "hanabi") {
    // firework: launch whistle → boom → sparkling descent
    note(c, { type: "sine", freq: 400, glide: 1200, dur: 0.5, gain: 0.06, delay: 0.05, vol: v });
    note(c, { type: "sine", freq: 70, dur: 0.35, gain: 0.3, delay: 0.45, vol: v });
    [1046, 1318, 1568, 2093, 2637].forEach((f, i) =>
      note(c, { type: "triangle", freq: f, dur: 0.55, gain: 0.06, delay: 0.55 + i * 0.06, vol: v }));
    note(c, { type: "sine", freq: 784, dur: 1.5, gain: 0.07, delay: 1.3, vol: v });
  }
}
