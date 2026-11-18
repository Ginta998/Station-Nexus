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
  // un « clac » de plastique et de métal : sec, court, sans grave qui traîne
  const n = noise(c, 0.05); const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1500 * soft + 400; bp.Q.value = 0.9; const g = c.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.45 * vol * soft, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0006, t + 0.045);
  n.connect(bp).connect(g).connect(c.destination); n.start(t); n.stop(t + 0.06);
  const o = c.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(130, t + 0.04);
  const og = c.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(0.12 * vol * soft, t + 0.003); og.gain.exponentialRampToValueAtTime(0.0006, t + 0.045);
  o.connect(og).connect(c.destination); o.start(t); o.stop(t + 0.05);
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
  // le mécanisme qui se lance : un petit sifflement de moteur (aigu, discret, qui oscille) et la bande qui glisse sur les guides
  const m = c.createOscillator(); m.type = "triangle"; m.frequency.setValueAtTime(260, t + 0.12); m.frequency.exponentialRampToValueAtTime(470, t + 0.6);
  const wob = c.createOscillator(); wob.frequency.value = 9; const wg = c.createGain(); wg.gain.value = 6; wob.connect(wg).connect(m.frequency);
  const mg = c.createGain(); mg.gain.setValueAtTime(0.0001, t + 0.12); mg.gain.exponentialRampToValueAtTime(0.022 * vol, t + 0.4); mg.gain.exponentialRampToValueAtTime(0.0004, t + 1.3);
  m.connect(mg).connect(c.destination); m.start(t + 0.12); m.stop(t + 1.35); wob.start(t + 0.12); wob.stop(t + 1.35);
  const n = noise(c, 1.4); const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 2.2;
  bp.frequency.setValueAtTime(1300, t + 0.12); bp.frequency.exponentialRampToValueAtTime(2800, t + 0.7);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t + 0.12); g.gain.exponentialRampToValueAtTime(0.05 * vol, t + 0.45); g.gain.exponentialRampToValueAtTime(0.0004, t + 1.35);
  n.connect(bp).connect(g).connect(c.destination); n.start(t + 0.12); n.stop(t + 1.4);
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
