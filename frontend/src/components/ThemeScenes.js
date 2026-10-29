// Décors SVG des thèmes Frontière et Terra 4099 (courbes douces, brume, végétation organique)
const R = (d, fill, cls = "") => <path className={cls} d={d} fill={fill} />;

export function FrontiereRidges() {
  return (
    <svg className="fr-svg" viewBox="0 0 1440 620" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="frR1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a3a24" /><stop offset="1" stopColor="#4a1c12" stopOpacity=".2" /></linearGradient>
        <linearGradient id="frR2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a2216" /><stop offset="1" stopColor="#2a0f09" /></linearGradient>
        <linearGradient id="frR3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#30130c" /><stop offset="1" stopColor="#140806" /></linearGradient>
        <linearGradient id="frR4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a0b07" /><stop offset="1" stopColor="#070302" /></linearGradient>
        <linearGradient id="frRim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffb46a" stopOpacity="0" /><stop offset=".3" stopColor="#ffc07a" stopOpacity=".7" /><stop offset=".6" stopColor="#ff8a40" stopOpacity=".25" /><stop offset="1" stopColor="#ff8a40" stopOpacity="0" /></linearGradient>
      </defs>
      <g className="far">{R("M0 330 C120 300 190 250 290 262 C380 272 420 220 520 200 C610 182 660 236 760 230 C860 224 900 170 1010 160 C1110 152 1170 214 1270 226 C1350 236 1400 214 1440 206 L1440 620 L0 620Z", "url(#frR1)")}</g>
      {R("M0 392 C90 372 160 330 250 336 C340 342 380 300 470 292 C560 284 610 330 700 326 C800 322 850 268 950 262 C1050 256 1100 314 1200 318 C1290 322 1360 296 1440 290 L1440 620 L0 620Z", "url(#frR2)", "mid")}
      <path d="M0 392 C90 372 160 330 250 336 C340 342 380 300 470 292 C560 284 610 330 700 326 C800 322 850 268 950 262 C1050 256 1100 314 1200 318 C1290 322 1360 296 1440 290" fill="none" stroke="url(#frRim)" strokeWidth="2" />
      {R("M0 470 C110 446 180 420 280 428 C380 436 440 400 540 396 C640 392 700 436 800 440 C900 444 980 404 1080 398 C1180 392 1250 430 1340 432 C1390 433 1420 426 1440 422 L1440 620 L0 620Z", "url(#frR3)")}
      {R("M0 540 C140 520 240 500 360 512 C480 524 560 496 680 494 C800 492 880 526 1000 528 C1120 530 1220 500 1340 502 C1390 503 1420 508 1440 510 L1440 620 L0 620Z", "url(#frR4)")}
    </svg>
  );
}

export function TerraFlora() {
  const leafCluster = (cx, cy, r, n, fill, seed = 1) => Array.from({ length: n }, (_, i) => {
    const a = (i * 137.5 + seed * 40) * (Math.PI / 180); const d = r * Math.sqrt((i + 1) / n);
    return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.7} r={r * (0.22 + ((i * 7 + seed) % 5) * 0.04)} fill={fill} />;
  });
  return (
    <svg className="tr-svg" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <filter id="trOrg" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="18" /></filter>
        <linearGradient id="trVine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4f7a36" /><stop offset="1" stopColor="#2c4420" stopOpacity=".2" /></linearGradient>
        <linearGradient id="trFg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f3018" /><stop offset="1" stopColor="#0a100a" /></linearGradient>
      </defs>
      <g filter="url(#trOrg)" opacity=".9">
        <g className="canopy">{leafCluster(170, 250, 120, 26, "#3d5e2b", 1)}{leafCluster(1250, 190, 140, 30, "#3a5a29", 3)}</g>
        <g opacity=".85">{leafCluster(120, 300, 90, 18, "#557f3a", 2)}{leafCluster(1300, 240, 100, 20, "#4f7a36", 5)}</g>
      </g>
      <g className="vines" fill="none" stroke="url(#trVine)" strokeLinecap="round">
        <path d="M150 260 C160 340 130 400 150 480 C165 540 140 590 150 640" strokeWidth="5" />
        <path d="M220 270 C235 330 210 380 228 440" strokeWidth="3" />
        <path d="M1220 210 C1205 300 1240 360 1222 440 C1210 500 1236 560 1226 620" strokeWidth="5" />
        <path d="M1300 230 C1316 290 1290 340 1306 410" strokeWidth="3" />
      </g>
      <g filter="url(#trOrg)">
        <path d="M0 800 L0 640 C60 600 120 620 170 590 C230 556 280 600 340 610 C420 624 470 596 540 612 C640 636 700 600 780 616 C880 636 950 604 1040 620 C1120 634 1180 590 1260 600 C1330 608 1390 580 1440 590 L1440 800Z" fill="url(#trFg)" />
        {leafCluster(80, 640, 70, 14, "#26391d", 6)}{leafCluster(1370, 620, 80, 16, "#26391d", 7)}{leafCluster(700, 660, 60, 12, "#1e2f17", 8)}
      </g>
    </svg>
  );
}
