import { useEffect, useMemo, useState } from "react";

const LINES = [
  "Chaque univers est une étoile. L'Atelier est le pont d'où tu les fais naître.",
  "Une idée notée aujourd'hui peut devenir la scène qui changera tout demain.",
  "Angélie, les ruines, les chroniques : tout ce que tu crées reste relié.",
  "Ici, rien ne se perd. Chaque version de tes textes est conservée.",
  "Tape ton code n'importe où dans la Station pour revenir au pont.",
  "Les grandes sagas naissent d'une discipline : un peu, chaque jour.",
];

// Voyage vers l'Atelier : traversée d'un champ d'étoiles et de nuées, textes de lore, progression réelle
export default function AtelierLoader({ progress, label, error, leaving, onLeave }) {
  const [line, setLine] = useState(() => Math.floor(Math.random() * LINES.length));
  useEffect(() => { const t = setInterval(() => setLine((l) => (l + 1) % LINES.length), 4200); return () => clearInterval(t); }, []);
  const stars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ a: Math.random() * 360, d: Math.random() * 3.2, s: 0.6 + Math.random() * 1.8, l: 30 + Math.random() * 60, k: i })), []);

  return (
    <div className={"atl" + (leaving ? " leaving" : "")} data-testid="atelier-loader">
      <div className="atl-sky" />
      <div className="atl-neb n1" /><div className="atl-neb n2" /><div className="atl-neb n3" />
      <div className="atl-stars">{stars.map((s) => <i key={s.k} style={{ "--a": `${s.a}deg`, "--l": `${s.l}vmax`, width: s.s, animationDelay: `-${s.d}s` }} />)}</div>
      <div className="atl-gate"><span /><span /><span /><b>工房</b></div>
      <div className="atl-clouds"><i /><i /><i /></div>
      <div className="atl-vig" />

      <div className="atl-title">
        <p className="mono">// SAUT EN COURS · SECTEUR 天-00</p>
        <h1>ATELIER <b>NEXUS</b></h1>
      </div>

      {error ? (
        <div className="atl-err">
          <p data-testid="atelier-load-error">Le portail n'a pas pu s'ouvrir.</p>
          <button className="at-btn" onClick={onLeave} data-testid="atelier-load-leave">Retour à la Station</button>
        </div>
      ) : (
        <>
          <p className="atl-lore" key={line}>{LINES[line]}</p>
          <div className="atl-prog">
            <div className="atl-prog-l mono"><span>{label}</span><b data-testid="atelier-load-pct">{progress}%</b></div>
            <div className="atl-bar"><span style={{ width: `${progress}%` }} data-testid="atelier-load-bar" /></div>
          </div>
          <div className="atl-spin" aria-hidden="true"><i /><b>天</b></div>
        </>
      )}
    </div>
  );
}
