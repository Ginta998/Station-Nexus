// UI sound engine: built-in synthesized packs + optional custom uploaded sounds.
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

// pack definitions: per event -> {type, freq, dur, glide}
const PACKS = {
  zen: {
    label: "Zen", emoji: "🕊️",
    hover: { type: "sine", freq: 660, dur: 0.06, gain: 0.05 },
    nav: { type: "sine", freq: 520, dur: 0.09, gain: 0.08 },
    select: { type: "sine", freq: 784, dur: 0.18, gain: 0.1, glide: 1046 },
    back: { type: "sine", freq: 392, dur: 0.14, gain: 0.08, glide: 294 },
  },
  retro: {
    label: "Rétro 8-bit", emoji: "👾",
    hover: { type: "square", freq: 880, dur: 0.03, gain: 0.03 },
    nav: { type: "square", freq: 440, dur: 0.05, gain: 0.05 },
    select: { type: "square", freq: 660, dur: 0.12, gain: 0.06, glide: 1320 },
    back: { type: "square", freq: 330, dur: 0.1, gain: 0.05, glide: 165 },
  },
  neo: {
    label: "Neo Cyber", emoji: "🌆",
    hover: { type: "triangle", freq: 1200, dur: 0.04, gain: 0.04 },
    nav: { type: "sawtooth", freq: 300, dur: 0.07, gain: 0.05, glide: 500 },
    select: { type: "sawtooth", freq: 400, dur: 0.2, gain: 0.07, glide: 1600 },
    back: { type: "sawtooth", freq: 600, dur: 0.16, gain: 0.06, glide: 200 },
  },
  koto: {
    label: "Koto", emoji: "🎐",
    hover: { type: "triangle", freq: 988, dur: 0.05, gain: 0.04 },
    nav: { type: "triangle", freq: 740, dur: 0.1, gain: 0.06, glide: 660 },
    select: { type: "triangle", freq: 587, dur: 0.25, gain: 0.08, glide: 880 },
    back: { type: "triangle", freq: 494, dur: 0.2, gain: 0.06, glide: 330 },
  },
  arcade: {
    label: "Arcade", emoji: "🕹️",
    hover: { type: "square", freq: 1046, dur: 0.02, gain: 0.03 },
    nav: { type: "square", freq: 523, dur: 0.04, gain: 0.05, glide: 784 },
    select: { type: "square", freq: 392, dur: 0.16, gain: 0.06, glide: 1568 },
    back: { type: "square", freq: 784, dur: 0.12, gain: 0.05, glide: 262 },
  },
  glass: {
    label: "Verre", emoji: "🔷",
    hover: { type: "sine", freq: 1568, dur: 0.05, gain: 0.03 },
    nav: { type: "sine", freq: 1318, dur: 0.08, gain: 0.05, glide: 1760 },
    select: { type: "sine", freq: 1046, dur: 0.22, gain: 0.06, glide: 2093 },
    back: { type: "sine", freq: 880, dur: 0.16, gain: 0.05, glide: 587 },
  },
  vapor: {
    label: "Vaporwave", emoji: "🌴",
    hover: { type: "sine", freq: 440, dur: 0.08, gain: 0.04 },
    nav: { type: "triangle", freq: 349, dur: 0.14, gain: 0.06, glide: 440 },
    select: { type: "sine", freq: 261, dur: 0.3, gain: 0.07, glide: 523 },
    back: { type: "triangle", freq: 349, dur: 0.22, gain: 0.06, glide: 220 },
  },
  taiko: {
    label: "Taiko", emoji: "🥁",
    hover: { type: "sine", freq: 160, dur: 0.05, gain: 0.06 },
    nav: { type: "sine", freq: 120, dur: 0.1, gain: 0.1, glide: 80 },
    select: { type: "sine", freq: 100, dur: 0.18, gain: 0.14, glide: 60 },
    back: { type: "sine", freq: 90, dur: 0.16, gain: 0.1, glide: 55 },
  },
  crystal: {
    label: "Cristal", emoji: "💎",
    hover: { type: "triangle", freq: 2093, dur: 0.04, gain: 0.03 },
    nav: { type: "triangle", freq: 1760, dur: 0.07, gain: 0.05, glide: 2637 },
    select: { type: "triangle", freq: 1568, dur: 0.2, gain: 0.06, glide: 3136 },
    back: { type: "triangle", freq: 1318, dur: 0.15, gain: 0.05, glide: 880 },
  },
};

export const SOUND_PACKS = Object.entries(PACKS).map(([key, v]) => ({ key, label: v.label, emoji: v.emoji }));

let settings = { pack: "zen", muted: false, custom: null };

export const configureSound = (s) => { settings = { ...settings, ...s }; };

function beep(spec) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = spec.type;
  const t = c.currentTime;
  osc.frequency.setValueAtTime(spec.freq, t);
  if (spec.glide) osc.frequency.exponentialRampToValueAtTime(spec.glide, t + spec.dur);
  gain.gain.setValueAtTime(spec.gain, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + spec.dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + spec.dur + 0.02);
}

export function playUiSound(event) {
  if (settings.muted || settings.pack === "silence") return;
  // custom uploaded pack
  if (settings.pack === "custom" && settings.custom && settings.custom[event]) {
    try {
      const a = new Audio(settings.custom[event]);
      a.volume = 0.5;
      a.play().catch(() => {});
    } catch (_) {}
    return;
  }
  const pack = PACKS[settings.pack] || PACKS.zen;
  const spec = pack[event] || pack.nav;
  beep(spec);
}
