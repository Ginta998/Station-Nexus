import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { playKey, playUiSound } from "@/lib/sound";
import { toCss } from "@/lib/uiScale";
import "@/components/atelier/labo.css";

// Glyphes de brouillage : katakana + chiffres, pour l'effet « décodage » façon terminal de laboratoire
const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワ0123456789/#<>";
const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Texte qui se décode lettre par lettre, avec un son de frappe
export function Decode({ text, speed = 34, tick, className, onDone }) {
  const [out, setOut] = useState(text.replace(/\S/g, " "));
  const done = useRef(onDone); done.current = onDone;
  useEffect(() => {
    let i = 0; let f = 0;
    const id = setInterval(() => {
      f++;
      if (f % 2 === 0) i++;
      setOut(text.split("").map((ch, k) => (ch === " " ? " " : k < i ? ch : k < i + 4 ? rnd() : " ")).join(""));
      if (f % 2 === 0 && text[i - 1] && text[i - 1] !== " ") tick?.();
      if (i > text.length) { clearInterval(id); setOut(text); done.current?.(); }
    }, speed);
    return () => clearInterval(id);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span className={className} aria-label={text}>{out}</span>;
}

// Splash de l'Atelier — style « Laboratoire » : anneaux lents, vérification des accès, progression réelle.
// Les couleurs et polices viennent du thème actif. Passable (bouton, Échap, Entrée, Espace).
const ATELIER_WORDS = { word: "ATELIER NEXUS", sub: "ESPACE DE CRÉATION", os: "OS", osSub: "工房", checking: "VÉRIFICATION DES ACCÈS", granted: "ACCÈS AUTORISÉ", smallA: "認証 · SESSION EN COURS", smallB: "許可 · BIENVENUE AU PONT", done: "ACCÈS AUTORISÉ" };
export default function AtelierLoader({ progress, label, steps = [], step = 0, granted, error, leaving, onLeave, onSkip }) {
  const W = ATELIER_WORDS;
  const { muted } = useApp();
  const [canSkip, setCanSkip] = useState(false);
  useEffect(() => { const t = setTimeout(() => setCanSkip(true), 400); return () => clearTimeout(t); }, []);
  useEffect(() => { if (granted && !muted) playUiSound("grant", "laboratoire"); }, [granted]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!onSkip) return undefined;
    const k = (e) => { if (canSkip && ["Escape", "Enter", " "].includes(e.key)) { e.preventDefault(); onSkip(); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onSkip, canSkip]);
  // Une frappe de clavier par lettre affichée
  const tick = () => { if (!muted) playKey(0.9); };
  // Parallaxe douce des anneaux + coordonnées du pointeur
  const root = useRef(null);
  useEffect(() => {
    const el = root.current; if (!el) return undefined;
    let raf = 0;
    const mv = (e) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--px", x.toFixed(3)); el.style.setProperty("--py", y.toFixed(3));
      el.style.setProperty("--mx", toCss(e.clientX) + "px"); el.style.setProperty("--my", toCss(e.clientY) + "px");
      const c = el.querySelector(".lb-coord"); if (c) c.textContent = `X ${String(Math.round(e.clientX)).padStart(4, "0")} · Y ${String(Math.round(e.clientY)).padStart(4, "0")}`;
    }); };
    window.addEventListener("pointermove", mv);
    return () => { window.removeEventListener("pointermove", mv); cancelAnimationFrame(raf); };
  }, []);
  // Flux de données décoratif (colonne de droite)
  const [feed, setFeed] = useState([]);
  useEffect(() => {
    if (error) return undefined;
    const hex = () => Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
    const tags = ["SYNC", "記録", "AUTH", "MOD", "IMG", "許可", "NET", "研究"];
    let n = 0;
    const id = setInterval(() => setFeed((f) => [...f.slice(-9), { id: n++, t: `0x${hex()} · ${tags[Math.floor(Math.random() * tags.length)]} · ${Math.random() > 0.15 ? "OK" : "…"}` }]), 170);
    return () => clearInterval(id);
  }, [error]);

  return (
    <div ref={root} className={"lb-root" + (leaving ? " leaving" : "") + (granted ? " granted" : "")} data-testid="atelier-loader" role="status" aria-live="polite">
      <div className="lb-grid" aria-hidden="true" />
      <div className="lb-spot" aria-hidden="true" />
      <div className="lb-scan" aria-hidden="true" />
      <span className="lb-corner tl" aria-hidden="true" /><span className="lb-corner tr" aria-hidden="true" /><span className="lb-corner bl" aria-hidden="true" /><span className="lb-corner br" aria-hidden="true" />
      <p className="lb-coord" aria-hidden="true">X 0000 · Y 0000</p>
      {!error && <ul className="lb-feed" aria-hidden="true">{feed.map((l) => <li key={l.id}>{l.t}</li>)}</ul>}
      <header className="lb-id">
        <b className="lb-word"><Decode text={W.word} tick={tick} speed={30} /></b>
        <span className="lb-sub"><Decode text={W.sub} tick={tick} speed={20} /></span>
        <span className="lb-os">{W.os} <i>{W.osSub}</i></span>
      </header>
      {onSkip && !error && <button className="lb-skip" onClick={onSkip} data-testid="atelier-skip">PASSER <span aria-hidden="true">↗</span></button>}

      {error ? (
        <div className="lb-center">
          <p className="lb-msg">ACCÈS INTERROMPU</p>
          <p className="lb-small">Le portail n'a pas pu s'ouvrir.</p>
          <button className="lb-btn" onClick={onLeave} data-testid="atelier-load-leave">RETOUR À LA STATION</button>
        </div>
      ) : (
        <div className="lb-center">
          <svg className="lb-rings" viewBox="0 0 400 400" aria-hidden="true">
            <g className="r0">{Array.from({ length: 72 }, (_, k) => <line key={k} x1="200" y1="6" x2="200" y2={k % 6 ? 12 : 18} transform={`rotate(${k * 5} 200 200)`} />)}</g>
            <g className="r1"><circle cx="200" cy="200" r="176" /><circle className="dot" cx="372" cy="238" r="3.5" /></g>
            <g className="r2"><circle cx="200" cy="200" r="146" /><circle className="acc" cx="98" cy="306" r="4.5" /><circle className="acc" cx="300" cy="118" r="4.5" /></g>
            <circle className="r3" cx="200" cy="200" r="58" />
          </svg>
          <div className="lb-core">
            {granted
              ? <Decode key="ok" className="lb-msg" text={W.granted} tick={tick} speed={30} />
              : <Decode key="chk" className="lb-msg" text={W.checking} tick={tick} speed={38} />}
            <span className="lb-small">{granted ? W.smallB : W.smallA}</span>
          </div>
        </div>
      )}

      {!error && (
        <>
          <ol className="lb-steps" aria-label="Étapes">
            {steps.map((s, i) => (
              <li key={s} className={i < step || granted ? "ok" : i === step ? "on" : ""}><span aria-hidden="true">{i < step || granted ? "✓" : i === step ? "●" : "·"}</span>{i <= step || granted ? <Decode text={`${String(i + 1).padStart(2, "0")} ${s.toUpperCase()}`} tick={tick} speed={22} /> : <i>{`${String(i + 1).padStart(2, "0")} ${"·".repeat(Math.min(14, s.length))}`}</i>}</li>
            ))}
          </ol>
          <div className="lb-prog">
            <div className="lb-bar"><span style={{ width: `${progress}%` }} data-testid="atelier-load-bar" /></div>
            <div className="lb-prog-l"><span>{granted ? W.done : label?.toUpperCase()}</span><b data-testid="atelier-load-pct">{progress}%</b></div>
          </div>
        </>
      )}
      <p className="lb-by" aria-hidden="true"><span>PROPULSÉ PAR</span> <b>STATION NEXUS</b> <i /></p>
    </div>
  );
}
