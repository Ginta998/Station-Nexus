import { useEffect, useState } from "react";
import { PiImageSquare } from "react-icons/pi";
import { decorList, useDecorCourant, setDecorPick, useDecorPick } from "@/lib/lumiere";
import { decorOf } from "@/lib/decors";
import { themeDef, useThemeState } from "@/lib/themeStore";

// Le bouton « Décor » de l'accueil : le visiteur choisit un des décors du thème (gardé dans son navigateur),
// ou laisse le thème choisir. Il n'apparaît que si le thème a une collection et le permet.
export default function LumierePastille({ theme }) {
  const st = useThemeState();
  const d = themeDef(theme, st);
  const L = d?.bg?.type === "compose" ? d.bg.layers : null;
  const cur = useDecorCourant(theme, L);
  const picked = useDecorPick(theme);
  const [open, setOpen] = useState(false);
  useEffect(() => { document.body.classList.toggle("sx-picking", open); return () => document.body.classList.remove("sx-picking"); }, [open]);
  if (!L || L.decorPublic === false) return null;
  const list = decorList(L);
  if (list.length < 2) return null;
  const cd = decorOf(cur);
  return (
    <div className="nx-dec">
      <button type="button" className="sx-tool nx-dec-cur" onClick={() => setOpen((o) => !o)} aria-expanded={open} title="Changer de décor" data-testid="home-decor"
        onContextMenu={(e) => { e.preventDefault(); setOpen(true); }}>
        {cd ? <img src={cd.thumb} alt="" /> : <PiImageSquare size={20} />}
        <span><b>Décor</b><small>{picked ? "ton choix" : (cd?.label.split(" · ")[1] || cd?.label || "")}</small></span>
      </button>
      {open && <><div className="nx-dec-bk" onClick={() => setOpen(false)} /><div className="nx-dec-pop" role="listbox" aria-label="Décors du thème">
        {list.map((id) => { const x = decorOf(id); return x && <button key={id} type="button" role="option" aria-selected={id === cur} className={id === cur ? "on" : ""} onClick={() => { setDecorPick(theme, id); setOpen(false); }} data-testid={"home-decor-" + id}><img src={x.thumb} alt="" /><span>{x.label.split(" · ")[1] || x.label}</span></button>; })}
        <button type="button" className={"auto" + (!picked ? " on" : "")} onClick={() => { setDecorPick(theme, ""); setOpen(false); }}>Laisser le thème choisir</button>
      </div></>}
    </div>
  );
}
