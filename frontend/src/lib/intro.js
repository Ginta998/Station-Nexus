// Boot intro definitions + synthesized boot sounds (Web Audio, no files needed).
export const INTROS = [
  { key: "tengoku", label: "Tengoku", kanji: "天", tagline: "Soleil levant", duration: 3200 },
  { key: "kanji", label: "Kanji Storm", kanji: "嵐", tagline: "Tempête d'idéogrammes", duration: 3200 },
  { key: "pulse", label: "Pulse", kanji: "波", tagline: "Onde lumineuse (façon Steam)", duration: 3200 },
  { key: "towers", label: "Colonnes", kanji: "光", tagline: "Colonnes de lumière (façon PS2)", duration: 3600 },
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
  }
}
