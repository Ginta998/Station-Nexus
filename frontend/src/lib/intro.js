// Boot intro definitions + synthesized boot sounds (Web Audio, no files needed).
export const INTROS = [
  { key: "tengoku", label: "Tengoku", kanji: "天", tagline: "Soleil levant", duration: 3200 },
  { key: "kanji", label: "Kanji Storm", kanji: "嵐", tagline: "Tempête d'idéogrammes", duration: 3200 },
  { key: "neon", label: "Neo Boot", kanji: "電", tagline: "Démarrage cyber", duration: 3000 },
  { key: "ink", label: "Sumi-e", kanji: "墨", tagline: "Encre & silence", duration: 3400 },
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
  } else if (type === "neon") {
    // cyber sweep + zap
    note(c, { type: "sawtooth", freq: 120, glide: 900, dur: 0.7, gain: 0.1, vol: v });
    note(c, { type: "square", freq: 1200, glide: 300, dur: 0.18, gain: 0.06, delay: 0.7, vol: v });
    note(c, { type: "sawtooth", freq: 300, glide: 1400, dur: 0.9, gain: 0.08, delay: 0.95, vol: v });
  } else if (type === "ink") {
    // soft koto pluck + slow swell
    note(c, { type: "triangle", freq: 392, dur: 1.2, gain: 0.12, delay: 0.1, vol: v });
    note(c, { type: "triangle", freq: 587, dur: 1.4, gain: 0.1, delay: 0.5, vol: v });
    note(c, { type: "sine", freq: 294, glide: 392, dur: 2.0, gain: 0.08, delay: 0.2, vol: v });
  }
}
