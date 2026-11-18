/*
  Les sons du magnétophone, fabriqués à la volée (aucun fichier) : doux et feutrés, comme les enregistrements de BioShock.
  - press : la touche « lecture » s'enfonce (petit clac sourd)
  - motor : le moteur démarre, la bande prend de la vitesse puis se fond derrière la voix
  - hiss  : un souffle de bande très bas, tant que la cassette tourne
  - release : la touche remonte (clac plus léger)
*/
let ctx = null;
const ac = () => { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); return ctx; } catch (_) { return null; } };
const noise = (c, sec) => { const b = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * sec)), c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; return s; };

function clack(c, t, vol, soft = 1) {
  const n = noise(c, 0.08); const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100 * soft; const g = c.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.32 * vol * soft, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);
  n.connect(lp).connect(g).connect(c.destination); n.start(t); n.stop(t + 0.09);
  const o = c.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
  const og = c.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(0.28 * vol * soft, t + 0.006); og.gain.exponentialRampToValueAtTime(0.0008, t + 0.14);
  o.connect(og).connect(c.destination); o.start(t); o.stop(t + 0.16);
}

export function tapeStart(vol = 0.6) {
  const c = ac(); if (!c || vol <= 0) return;
  const t = c.currentTime + 0.01;
  clack(c, t, vol);
  // le moteur : un ronronnement grave et la bande qui frotte, qui montent puis se retirent
  const n = noise(c, 1.6); const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(140, t + 0.06); bp.frequency.exponentialRampToValueAtTime(420, t + 0.6);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t + 0.06); g.gain.exponentialRampToValueAtTime(0.09 * vol, t + 0.45); g.gain.exponentialRampToValueAtTime(0.0006, t + 1.5);
  n.connect(bp).connect(g).connect(c.destination); n.start(t + 0.06); n.stop(t + 1.6);
  const m = c.createOscillator(); m.type = "triangle"; m.frequency.setValueAtTime(38, t + 0.06); m.frequency.linearRampToValueAtTime(62, t + 0.55);
  const mg = c.createGain(); mg.gain.setValueAtTime(0.0001, t + 0.06); mg.gain.exponentialRampToValueAtTime(0.05 * vol, t + 0.4); mg.gain.exponentialRampToValueAtTime(0.0006, t + 1.3);
  m.connect(mg).connect(c.destination); m.start(t + 0.06); m.stop(t + 1.35);
}
export function tapeRelease(vol = 0.6) { const c = ac(); if (!c || vol <= 0) return; clack(c, c.currentTime + 0.01, vol, 0.6); }

// Le souffle de bande, en fond pendant la lecture. Rend une fonction pour l'arrêter.
export function tapeHiss(vol = 0.6) {
  const c = ac(); if (!c || vol <= 0) return () => {};
  const n = noise(c, 4); n.loop = true; const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2600;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 9000; const g = c.createGain();
  const t = c.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012 * vol, t + 0.8);
  n.connect(hp).connect(lp).connect(g).connect(c.destination); n.start(t);
  return () => { try { const e = c.currentTime; g.gain.cancelScheduledValues(e); g.gain.setValueAtTime(g.gain.value, e); g.gain.exponentialRampToValueAtTime(0.0001, e + 0.3); n.stop(e + 0.35); } catch (_) {} };
}
