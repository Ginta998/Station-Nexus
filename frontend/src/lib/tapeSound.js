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

// un « tic » mécanique sec (plastique, métal) : bruit très court filtré autour d'une fréquence
function tick(c, t, vol, f = 2600, len = 0.014, q = 1.6) {
  const n = noise(c, len + 0.01); const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = q; const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.55 * vol, t + 0.0015); g.gain.exponentialRampToValueAtTime(0.0006, t + len);
  n.connect(bp).connect(g).connect(c.destination); n.start(t); n.stop(t + len + 0.01);
}
export function tapeStart(vol = 0.6) {
  const c = ac(); if (!c || vol <= 0) return;
  const t = c.currentTime + 0.01;
  // la touche « lecture » : clic de la touche, verrou qui accroche, tête qui se pose (clac sourd)
  tick(c, t, vol, 3400, 0.012); tick(c, t + 0.035, vol * 0.8, 1900, 0.018); clack(c, t + 0.06, vol * 1.15);
  // les pignons qui s'engrènent : une petite rafale de tics de plus en plus rapprochés
  [0.13, 0.17, 0.2, 0.225, 0.245, 0.262, 0.277, 0.29].forEach((d, i) => tick(c, t + d, vol * (0.35 - i * 0.03), 2200 + (i % 2) * 700, 0.008, 2.5));
  // le moteur : un ronflement qui monte en régime, et la bande qui frotte sur les guides
  const m = c.createOscillator(); m.type = "sawtooth"; m.frequency.setValueAtTime(55, t + 0.1); m.frequency.exponentialRampToValueAtTime(150, t + 0.55);
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520;
  const mg = c.createGain(); mg.gain.setValueAtTime(0.0001, t + 0.1); mg.gain.exponentialRampToValueAtTime(0.07 * vol, t + 0.35); mg.gain.exponentialRampToValueAtTime(0.0006, t + 1.4);
  m.connect(lp).connect(mg).connect(c.destination); m.start(t + 0.1); m.stop(t + 1.45);
  const n = noise(c, 1.5); const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(180, t + 0.1); bp.frequency.exponentialRampToValueAtTime(900, t + 0.6);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t + 0.1); g.gain.exponentialRampToValueAtTime(0.08 * vol, t + 0.45); g.gain.exponentialRampToValueAtTime(0.0006, t + 1.5);
  n.connect(bp).connect(g).connect(c.destination); n.start(t + 0.1); n.stop(t + 1.55);
}
export function tapeRelease(vol = 0.6) { const c = ac(); if (!c || vol <= 0) return; const t = c.currentTime + 0.01; clack(c, t, vol, 0.7); tick(c, t + 0.05, vol * 0.7, 3000, 0.012); }
// la cassette qu'on glisse dans le lecteur : frottement du plastique, puis elle s'enclenche
export function tapeInsert(vol = 0.6) {
  const c = ac(); if (!c || vol <= 0) return; const t = c.currentTime + 0.01;
  const n = noise(c, 0.3); const hp = c.createBiquadFilter(); hp.type = "bandpass"; hp.Q.value = 0.8; hp.frequency.setValueAtTime(1800, t); hp.frequency.exponentialRampToValueAtTime(900, t + 0.25);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06 * vol, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0006, t + 0.26);
  n.connect(hp).connect(g).connect(c.destination); n.start(t); n.stop(t + 0.3);
  tick(c, t + 0.27, vol, 2800, 0.012); clack(c, t + 0.29, vol * 0.9);
}

// Le souffle de bande, en fond pendant la lecture. Rend une fonction pour l'arrêter.
export function tapeHiss(vol = 0.6) {
  const c = ac(); if (!c || vol <= 0) return () => {};
  const n = noise(c, 4); n.loop = true; const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2600;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 9000; const g = c.createGain();
  const t = c.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012 * vol, t + 0.8);
  n.connect(hp).connect(lp).connect(g).connect(c.destination); n.start(t);
  return () => { try { const e = c.currentTime; g.gain.cancelScheduledValues(e); g.gain.setValueAtTime(g.gain.value, e); g.gain.exponentialRampToValueAtTime(0.0001, e + 0.3); n.stop(e + 0.35); } catch (_) {} };
}
