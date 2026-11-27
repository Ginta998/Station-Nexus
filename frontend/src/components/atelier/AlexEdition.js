import { useEffect } from "react";
import { RELIURES, relOf } from "@/lib/jaquette";
import "@/components/atelier/alexEdition.css";

// Les reliures : une famille de jaquettes (Modifier la jaquette › Reliure). Elles prennent les réglages de la jaquette :
// couleur (le cuir, la toile, le papier), encre (dorures et titre), police du titre, place du titre, cartouche de la tranche.
// Un reflet suit la souris ou l'inclinaison du téléphone. Une tranche à médaillons. Un étui, en option.
export { RELIURES };
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
export const roman = (n) => ROMAN[n] || String(n);
export const edOf = (b) => (b?.edition?.style ? b.edition : relOf(b?.spine));
export const edCls = (b) => { const e = edOf(b); return e ? ` ed ed-${e.style}${e.reflet === false ? " ed-noreflet" : ""}` : ""; };
// Les réglages de la jaquette, en variables CSS (chaque reliure a ses valeurs par défaut)
export const edVars = (sp = {}) => ({
  ...(sp?.color ? { "--ed-base": sp.color } : {}),
  ...(sp?.ink ? { "--ed-ink": sp.ink } : {}),
  ...(sp?.font ? { "--ed-font": `"${sp.font}"` } : {}),
  ...(sp?.bandeC ? { "--ed-lbl": sp.bandeC } : {}),
});

// Le reflet : une seule écoute pour toute la page (souris, ou gyroscope du téléphone), posée en variables CSS
let foilOn = false;
export function useFoil() {
  useEffect(() => {
    if (foilOn || typeof window === "undefined") return; foilOn = true;
    const el = document.documentElement; let raf = 0; let x = 50; let y = 30;
    const paint = () => { raf = 0; el.style.setProperty("--fx", x.toFixed(1) + "%"); el.style.setProperty("--fy", y.toFixed(1) + "%"); };
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener("pointermove", (e) => { x = (e.clientX / innerWidth) * 100; y = (e.clientY / innerHeight) * 100; ask(); }, { passive: true });
    window.addEventListener("deviceorientation", (e) => { if (e.gamma == null) return; x = 50 + Math.max(-45, Math.min(45, e.gamma)) * 1.1; y = 30 + Math.max(-40, Math.min(40, (e.beta || 45) - 45)) * 1.1; ask(); }, { passive: true });
    paint();
  }, []);
}

// La couverture (remplace le dedans habituel de la couverture)
export function EditionCover({ b, cover, em }) {
  useFoil();
  const st = edOf(b).style; const sp = b.spine || {}; const img = cover ? { backgroundImage: `url(${cover})` } : undefined;
  const pos = sp.titre === "bas" ? "t-bas" : sp.titre === "milieu" ? "t-milieu" : "";
  const win = <span className={"ed-win" + (cover ? "" : " blank")} style={img}>{!cover && <i>{em}</i>}</span>;
  const title = (cls = "") => <span className={"ed-title " + cls}>{b.title}</span>;
  const sub = b.sub && <span className="ed-sub">{b.sub}</span>;
  let inner;
  if (st === "dore") inner = (<>
    <span className="ed-arches top">{[0, 1].map((i) => <span key={i} className={"ed-arch a" + i + (cover ? "" : " blank")} style={img}>{!cover && <i>{em}</i>}</span>)}</span>
    {title("spaced")}{sub}
    <span className="ed-arches bot">{[2, 3].map((i) => <span key={i} className={"ed-arch a" + i + (cover ? "" : " blank")} style={img}>{!cover && <i>{em}</i>}</span>)}</span>
  </>);
  else if (st === "nuit") inner = (<><span className="ed-rings" />{title()}<span className="ed-frame oval">{win}</span>{sub}<span className="ed-emb">{em}</span></>);
  else if (st === "toile") inner = (<><span className="ed-rule" />{title("stamp")}{sub}<span className="ed-frame plate">{win}</span><span className="ed-emb">{em}</span><span className="ed-rule" /></>);
  else if (st === "grimoire") inner = (<>
    <i className="ed-corner tl" /><i className="ed-corner tr" /><i className="ed-corner bl" /><i className="ed-corner br" />
    <i className="ed-clasp c1" /><i className="ed-clasp c2" />
    {title("gothic")}<span className="ed-frame round">{win}</span>{sub}
  </>);
  else if (st === "japonaise") inner = (<>
    <span className="ed-stitch" />
    <span className="ed-frame jp">{win}</span>
    <span className="ed-daisen"><b>{b.title}</b>{b.sub && <small>{b.sub}</small>}</span>
  </>);
  else if (st === "deco") inner = (<><span className="ed-fan" />{title("spaced")}<span className="ed-frame step">{win}</span>{sub}<span className="ed-emb">{em}</span></>);
  else inner = (<>{title("engraved")}<span className="ed-frame arch">{win}</span>{sub}</>);
  return (
    <span className={"ed-cv " + pos} style={edVars(sp)} aria-hidden="true">
      <span className="ed-pat" />
      {inner}
      <span className="ed-foil" />
    </span>
  );
}

// La tranche à médaillons : l'emblème en haut, le titre dans son cartouche, le nombre de grandes parties en bas
export function EditionSpine({ b, em, children }) {
  const n = (b.chapters || b.it?.chapters || b.it?.episodes)?.length || 0;
  return (
    <span className="ed-sp" style={edVars(b.spine)} aria-hidden="true">
      <i className="ed-md">{em}</i>
      <span className="ed-lbl">{children}</span>
      <i className="ed-md sm">✦</i>
      <i className="ed-md">{n ? roman(Math.min(20, n)) : "§"}</i>
    </span>
  );
}

// L'étui : sombre, un grand dessin au trait doré (cercles, rayons, l'emblème au centre)
export function Etui({ b, em }) {
  return (
    <span className={"ed-etui ed-" + (edOf(b)?.style || "gaufre")} style={edVars(b.spine)} aria-hidden="true">
      <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" strokeWidth=".8">
          <circle cx="100" cy="150" r="88" opacity=".55" /><circle cx="100" cy="150" r="62" /><circle cx="100" cy="150" r="30" opacity=".8" />
          <circle cx="70" cy="190" r="64" opacity=".35" /><circle cx="130" cy="190" r="64" opacity=".35" />
          {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return <line key={i} x1={100 + Math.cos(a) * 34} y1={150 + Math.sin(a) * 34} x2={100 + Math.cos(a) * (i % 2 ? 58 : 84)} y2={150 + Math.sin(a) * (i % 2 ? 58 : 84)} opacity={i % 2 ? 0.5 : 0.9} />; })}
          <path d="M20 20h160v260H20z" opacity=".5" /><path d="M28 28h144v244H28z" opacity=".3" />
        </g>
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 47) % 196 + 2} cy={(i * 83) % 296 + 2} r={i % 5 ? 0.6 : 1.1} fill="currentColor" opacity=".7" />)}
      </svg>
      <b>{em}</b>
      <small>{b.title}</small>
      <span className="ed-foil" />
    </span>
  );
}

// L'ouverture d'un livre relié avec étui : le livre sort de son étui, puis la lecture commence
export function EtuiLaunch({ b, em, children }) {
  return (
    <div className="ed-launch">
      <div className="ed-l-book">{children}</div>
      <div className="ed-l-case"><Etui b={b} em={em} /></div>
    </div>
  );
}
