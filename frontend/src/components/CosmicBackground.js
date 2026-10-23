import { useMemo, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";

const rnd = (a, b) => a + Math.random() * (b - a);

/* ====================== FORMES SIGNATURES (SVG premium) ====================== */

/* ABYSSE — géante gazeuse à anneau, qualité Starfield */
const PlanetSVG = () => (
  <svg viewBox="0 0 460 460" className="svgform" aria-hidden="true">
    <defs>
      <radialGradient id="abG" cx="38%" cy="30%" r="82%">
        <stop offset="0%" stopColor="#d6e6ff" /><stop offset="24%" stopColor="#6f9ee8" />
        <stop offset="56%" stopColor="#2c5097" /><stop offset="100%" stopColor="#070f28" />
      </radialGradient>
      <linearGradient id="abRingG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#89aeeb" stopOpacity="0" /><stop offset="0.28" stopColor="#bcd3f7" stopOpacity="0.8" />
        <stop offset="0.5" stopColor="#eaf2ff" stopOpacity="0.95" /><stop offset="0.72" stopColor="#bcd3f7" stopOpacity="0.8" />
        <stop offset="1" stopColor="#89aeeb" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="abAtm" cx="50%" cy="50%" r="50%">
        <stop offset="80%" stopColor="#6ea0ff" stopOpacity="0" /><stop offset="93%" stopColor="#8fb6ff" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#8fb6ff" stopOpacity="0" />
      </radialGradient>
      <clipPath id="abClip"><circle cx="230" cy="230" r="122" /></clipPath>
    </defs>
    <g transform="rotate(-21 230 230)">
      <path d="M22 230 A208 56 0 0 1 438 230" fill="none" stroke="url(#abRingG)" strokeWidth="17" opacity="0.65" />
      <circle cx="230" cy="230" r="122" fill="url(#abG)" />
      <g clipPath="url(#abClip)">
        <ellipse cx="230" cy="198" rx="124" ry="9" fill="#a8caff" opacity="0.16" />
        <ellipse cx="230" cy="222" rx="124" ry="15" fill="#0f2142" opacity="0.4" />
        <ellipse cx="230" cy="250" rx="124" ry="7" fill="#a8caff" opacity="0.12" />
        <ellipse cx="230" cy="272" rx="124" ry="12" fill="#0f2142" opacity="0.34" />
        <ellipse cx="230" cy="230" rx="124" ry="26" fill="#000" opacity="0.16" />
      </g>
      <circle cx="230" cy="230" r="122" fill="url(#abAtm)" />
      <path d="M22 230 A208 56 0 0 0 438 230" fill="none" stroke="url(#abRingG)" strokeWidth="17" />
    </g>
  </svg>
);

/* AURUM — sphère armillaire dorée */
const ArmillarySVG = () => (
  <svg viewBox="0 0 380 380" className="svgform" aria-hidden="true">
    <defs>
      <linearGradient id="auG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff2cf" /><stop offset="0.5" stopColor="#e9c66a" /><stop offset="1" stopColor="#9a7420" />
      </linearGradient>
    </defs>
    <g fill="none" stroke="url(#auG)">
      <circle cx="190" cy="190" r="160" strokeWidth="1.4" opacity="0.5" />
      <circle cx="190" cy="190" r="150" strokeWidth="2" opacity="0.85" />
      <g className="cb-spin" style={{ transformOrigin: "190px 190px" }}>
        <ellipse cx="190" cy="190" rx="150" ry="150" strokeWidth="1.6" />
        <ellipse cx="190" cy="190" rx="150" ry="56" strokeWidth="1.6" />
        <ellipse cx="190" cy="190" rx="56" ry="150" strokeWidth="1.6" />
        <ellipse cx="190" cy="190" rx="112" ry="112" strokeWidth="1" opacity="0.55" />
      </g>
      <g className="cb-spin-rev" style={{ transformOrigin: "190px 190px" }}>
        <ellipse cx="190" cy="190" rx="150" ry="98" strokeWidth="1.3" transform="rotate(34 190 190)" opacity="0.8" />
        <ellipse cx="190" cy="190" rx="150" ry="98" strokeWidth="1.3" transform="rotate(-34 190 190)" opacity="0.8" />
      </g>
    </g>
    <circle cx="190" cy="190" r="13" fill="url(#auG)" />
    <circle cx="190" cy="190" r="25" fill="none" stroke="url(#auG)" strokeWidth="1.4" opacity="0.7" />
  </svg>
);

/* ELYSIUM — halo cosmique doré délicat (Supergirl: Woman of Tomorrow) */
const SPARKS = [[150, 48, 7], [300, 70, 5], [352, 170, 8], [320, 300, 5], [210, 352, 6], [70, 320, 5], [40, 190, 7], [92, 70, 5], [255, 120, 4], [128, 150, 3.5], [285, 250, 4], [120, 288, 4]];
const MandalaSVG = () => (
  <svg viewBox="0 0 400 400" className="svgform" aria-hidden="true">
    <defs>
      <radialGradient id="elG" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fff6e2" /><stop offset="60%" stopColor="#e8d1a0" /><stop offset="100%" stopColor="#b88f44" />
      </radialGradient>
    </defs>
    <g className="cb-spin-slow" style={{ transformOrigin: "200px 200px" }}>
      <circle cx="200" cy="200" r="152" fill="none" stroke="url(#elG)" strokeWidth="1" opacity="0.5" />
      <circle cx="200" cy="200" r="120" fill="none" stroke="url(#elG)" strokeWidth="1.3" opacity="0.7" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="url(#elG)" strokeWidth="1" strokeDasharray="1 7" opacity="0.6" />
      <g stroke="url(#elG)" strokeWidth="1" opacity="0.4">
        {Array.from({ length: 36 }).map((_, i) => { const a = i * 10 * Math.PI / 180; return <line key={i} x1={200 + Math.cos(a) * 158} y1={200 + Math.sin(a) * 158} x2={200 + Math.cos(a) * (i % 3 ? 166 : 172)} y2={200 + Math.sin(a) * (i % 3 ? 166 : 172)} />; })}
      </g>
    </g>
    <g className="cb-spin-rev-slow" style={{ transformOrigin: "200px 200px" }}>
      <circle cx="200" cy="200" r="92" fill="none" stroke="url(#elG)" strokeWidth="0.8" strokeDasharray="2 10" opacity="0.5" />
      <g fill="url(#elG)">
        {SPARKS.map(([x, y, s], i) => <path key={i} transform={`translate(${x} ${y})`} d={`M0 ${-s} L${s * .28} ${-s * .28} L${s} 0 L${s * .28} ${s * .28} L0 ${s} L${-s * .28} ${s * .28} L${-s} 0 L${-s * .28} ${-s * .28} Z`} />)}
      </g>
    </g>
    <circle cx="200" cy="200" r="7" fill="url(#elG)" />
    <circle cx="200" cy="200" r="20" fill="none" stroke="url(#elG)" strokeWidth="0.8" opacity="0.6" />
  </svg>
);

/* MONOLITHE — Marqueur de Dead Space (spire torsadée, base large, glyphes rouges) */
const MARKER_SIL = "M150 422 C90 420 58 390 66 334 C72 296 98 286 90 246 C84 212 110 202 100 160 C94 132 116 118 120 92 C123 68 128 50 138 42 C148 70 150 110 150 155 C150 110 152 70 162 42 C172 50 177 68 180 92 C184 118 206 132 200 160 C190 202 216 212 210 246 C202 286 228 296 234 334 C242 390 210 420 150 422 Z";
const MarkerSVG = () => (
  <svg viewBox="0 0 300 460" className="svgform svgform-marker" aria-hidden="true">
    <defs>
      <linearGradient id="moBody" x1="0" y1="0" x2="1" y2="0.1">
        <stop offset="0" stopColor="#6a3a40" /><stop offset="0.5" stopColor="#3a2024" /><stop offset="1" stopColor="#1c0f12" />
      </linearGradient>
      <linearGradient id="moLit" x1="0" y1="1" x2="0.2" y2="0">
        <stop offset="0" stopColor="#8e1a2c" /><stop offset="0.5" stopColor="#d6253f" /><stop offset="1" stopColor="#ff6076" />
      </linearGradient>
      <linearGradient id="moEdge2" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stopColor="#e9c0c6" /><stop offset="0.5" stopColor="#8a5a62" stopOpacity="0.5" /><stop offset="1" stopColor="#8a5a62" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="moGlow2" cx="50%" cy="46%" r="56%">
        <stop offset="0" stopColor="#ff3346" stopOpacity="0.6" /><stop offset="100%" stopColor="#ff3346" stopOpacity="0" />
      </radialGradient>
      <clipPath id="moClip"><path d={MARKER_SIL} /></clipPath>
    </defs>
    <ellipse cx="150" cy="250" rx="130" ry="215" fill="url(#moGlow2)" className="cb-glow" />
    <path d={MARKER_SIL} fill="url(#moBody)" stroke="#c68690" strokeWidth="2" />
    <g clipPath="url(#moClip)">
      <rect x="0" y="0" width="172" height="460" fill="url(#moLit)" opacity="0.72" />
      <rect x="150" y="0" width="150" height="460" fill="url(#moEdge2)" opacity="0.5" />
      <g stroke="#ffa493" strokeWidth="2" opacity="0.72" className="cb-glyph">
        {Array.from({ length: 14 }).map((_, i) => <line key={i} x1="40" y1={74 + i * 25} x2="260" y2={70 + i * 25} />)}
      </g>
      <g fill="#ffd0c4" opacity="0.6">
        {Array.from({ length: 70 }).map((_, i) => <rect key={i} x={48 + (i % 10) * 22} y={82 + Math.floor(i / 10) * 50} width="8" height="4.5" />)}
      </g>
    </g>
  </svg>
);

/* NEPTUNE — méduse bioluminescente */
const JellySVG = () => (
  <svg viewBox="0 0 300 440" className="svgform svgform-tall" aria-hidden="true">
    <defs>
      <radialGradient id="npBell" cx="50%" cy="34%" r="66%">
        <stop offset="0" stopColor="#c6f4ff" stopOpacity="0.9" /><stop offset="52%" stopColor="#4fd6e0" stopOpacity="0.5" /><stop offset="100%" stopColor="#1f9fe0" stopOpacity="0.12" />
      </radialGradient>
      <linearGradient id="npT" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7fe6f0" stopOpacity="0.75" /><stop offset="100%" stopColor="#1f9fe0" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g className="cb-bob">
      <g className="cb-sway" style={{ transformOrigin: "150px 300px" }}>
        <path d="M74 158 C62 234 96 292 80 372" stroke="url(#npT)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M110 166 C102 244 122 310 110 404" stroke="url(#npT)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M150 170 C148 256 150 330 150 418" stroke="url(#npT)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M190 166 C198 244 178 310 190 404" stroke="url(#npT)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M226 158 C238 234 204 292 220 372" stroke="url(#npT)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M132 166 C126 224 142 262 130 326" stroke="#9fe8f0" strokeOpacity="0.5" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M168 166 C174 224 158 262 170 326" stroke="#9fe8f0" strokeOpacity="0.5" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      <path d="M38 152 C38 72 108 30 150 30 C192 30 262 72 262 152 C262 168 246 174 231 166 C216 158 211 172 197 167 C183 162 178 174 164 168 C150 162 150 174 136 168 C122 162 117 158 103 167 C89 174 84 158 69 166 C54 174 38 168 38 152 Z" fill="url(#npBell)" stroke="#bdf2ff" strokeOpacity="0.5" strokeWidth="1.5" />
      <g stroke="#e4fbff" strokeWidth="1" opacity="0.4" fill="none">
        <path d="M78 142 C84 90 120 60 150 58" /><path d="M150 58 C180 60 216 90 222 142" />
      </g>
    </g>
  </svg>
);

/* ====================== COMPOSANT ====================== */
export default function CosmicBackground() {
  const { theme, reduceMotion } = useApp();

  const F = useMemo(() => {
    const stars = (n, min, max) => Array.from({ length: n }, () => ({ x: rnd(0, 100), y: rnd(0, 100), s: rnd(min, max), d: rnd(0, 8) }));
    const col = (n) => Array.from({ length: n }, () => ({ x: rnd(0, 100), y: rnd(0, 100), delay: rnd(0, 14), dur: rnd(10, 22) }));
    return {
      l1: stars(34, 0.6, 1.1), l2: stars(24, 1, 1.6), l3: stars(13, 1.6, 2.4),
      ash: col(26), ember: col(22),
      bubbles: Array.from({ length: 14 }, () => ({ x: rnd(0, 100), s: rnd(3, 10), dur: rnd(7, 16), delay: rnd(0, 9) })),
      snow: Array.from({ length: 40 }, () => ({ x: rnd(0, 100), s: rnd(2, 6), dur: rnd(5, 12), delay: rnd(0, 7) })),
      dust: Array.from({ length: 22 }, () => ({ x: rnd(0, 100), y: rnd(0, 100), dur: rnd(9, 19), delay: rnd(0, 10) })),
      comets: Array.from({ length: 4 }, (_, i) => ({ top: rnd(2, 40), dur: rnd(7, 12), delay: -i * rnd(5, 9) - rnd(0, 4) })),
    };
  }, []);

  const l1 = useRef(null), l2 = useRef(null), l3 = useRef(null), eye = useRef(null), pupil = useRef(null);

  useEffect(() => {
    let t = false;
    const onScroll = () => {
      if (t) return; t = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (l1.current) l1.current.style.transform = `translateY(${y * 0.03}px)`;
        if (l2.current) l2.current.style.transform = `translateY(${y * 0.07}px)`;
        if (l3.current) l3.current.style.transform = `translateY(${y * 0.13}px)`;
        t = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (theme !== "singularite") { if (pupil.current) pupil.current.style.transform = ""; return; }
    let ex = 0, ey = 0, raf = 0, lx = 0, ly = 0;
    const meas = () => { const e = eye.current; if (!e) return; const r = e.getBoundingClientRect(); ex = r.left + r.width / 2; ey = r.top + r.height / 2; };
    const apply = () => { raf = 0; const dx = lx - ex, dy = ly - ey, d = Math.hypot(dx, dy) || 1, m = Math.min(18, d); if (pupil.current) pupil.current.style.transform = `translate(${(dx / d * m).toFixed(1)}px,${(dy / d * m).toFixed(1)}px)`; };
    const look = (x, y) => { lx = x; ly = y; if (!raf) raf = requestAnimationFrame(apply); };
    const move = (e) => look(e.clientX, e.clientY);
    const touch = (e) => { if (e.touches[0]) look(e.touches[0].clientX, e.touches[0].clientY); };
    meas();
    window.addEventListener("resize", meas, { passive: true });
    window.addEventListener("scroll", meas, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("touchmove", touch, { passive: true });
    return () => { window.removeEventListener("resize", meas); window.removeEventListener("scroll", meas); window.removeEventListener("pointermove", move); window.removeEventListener("touchmove", touch); if (raf) cancelAnimationFrame(raf); };
  }, [theme]);

  const px = (v) => `${v}px`;

  return (
    <div className="cosmic-bg" aria-hidden="true" data-reduced={reduceMotion ? "1" : undefined}>
      <div className="cb-halo" />
      <div className="cb-grid" />

      <div className="fx fx-neb"><b /><b /><b /></div>
      <div className="fx fx-aurora" />
      <div className="fx fx-scan" />
      <div className="fx fx-vortex" />

      <div className="layer l1" ref={l1}>{F.l1.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: px(s.s), height: px(s.s), animationDelay: `-${s.d}s` }} />)}</div>
      <div className="layer l2" ref={l2}>{F.l2.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: px(s.s), height: px(s.s), animationDelay: `-${s.d}s` }} />)}</div>
      <div className="layer l3" ref={l3}>{F.l3.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: px(s.s), height: px(s.s), animationDelay: `-${s.d}s` }} />)}</div>

      <div className="fx fx-ash">{F.ash.map((p, i) => <i key={i} style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `-${p.delay}s`, animationDuration: `${p.dur}s` }} />)}</div>
      <div className="fx fx-ember">{F.ember.map((p, i) => <i key={i} style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `-${p.delay}s`, animationDuration: `${p.dur}s` }} />)}</div>

      {/* comètes */}
      <div className="comets">
        {F.comets.map((c, i) => <span key={i} className="comet" style={{ top: `${c.top}%`, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }} />)}
      </div>

      {/* formes signatures (centrées) */}
      <div className="scene">
        <div className="sform s-aurum"><ArmillarySVG /></div>
        <div className="sform s-olympe"><MandalaSVG /></div>
        <div className="sform s-neptune-jelly"><JellySVG /></div>

        {/* scènes CSS conservées */}
        <div className="sc s-moon"><div className="body" /></div>
        <div className="sc s-sun"><div className="body" /><div className="raysx" /></div>
        <div className="sc s-shock"><span /><span /><span /></div>
        <div className="sc s-greenplanet"><div className="body" /></div>
        <div className="sc s-aurora2" />
        <div className="sc s-blackhole"><div className="disk" /><div className="core" /></div>
        <div className="sc s-akira"><div className="moon" /><div className="g" /></div>
        <div className="sc s-neptune"><div className="body" /><div className="cur" /></div>
        <div className="sc s-yorha"><div className="yg" /><div className="emblem"><span /><span /><span /></div><div className="sun" /><div className="hz" /></div>
        <div className="sc s-megapole"><div className="sky" /><div className="city" /></div>
        <div className="sc s-bunny"><div className="b1" /><div className="b2" /></div>
        <div className="sc s-glacier"><div className="moon" /><div className="aur" /></div>
      </div>

      <div className="sgeye" ref={eye}>
        <span className="eye-aura" />
        <span className="eye-ball"><span className="iris"><span className="fib" /><span className="pupil" ref={pupil}><span className="catch" /></span></span></span>
        <span className="eye-lid" />
      </div>

      <div className="bubbles">{F.bubbles.map((b, i) => <i key={i} style={{ left: `${b.x}%`, width: px(b.s), height: px(b.s), animationDuration: `${b.dur}s`, animationDelay: `-${b.delay}s` }} />)}</div>
      <div className="snow">{F.snow.map((s, i) => <i key={i} style={{ left: `${s.x}%`, width: px(s.s), height: px(s.s), animationDuration: `${s.dur}s`, animationDelay: `-${s.delay}s` }} />)}</div>
      <div className="dust">{F.dust.map((d, i) => <i key={i} style={{ left: `${d.x}%`, top: `${d.y}%`, animationDuration: `${d.dur}s`, animationDelay: `-${d.delay}s` }} />)}</div>
    </div>
  );
}
