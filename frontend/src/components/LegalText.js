import { Link } from "react-router-dom";
import { LEGAL_LABELS } from "@/lib/legal";
import { useLegal } from "@/lib/useLegal";
import { useApp } from "@/context/AppContext";

// Rendu des textes légaux : {{cle}} → valeur légale · [[ … ]] → passage affiché seulement si ses valeurs existent
// · [texte](/lien) → lien. Pour le public, une ligne dont une valeur manque est masquée ; l'admin voit « À COMPLÉTER ».
const RX = /(\{\{[a-z_]+\}\}|\[[^\]]+\]\([^)]+\))/g;
const keysIn = (s) => [...s.matchAll(/\{\{([a-z_]+)\}\}/g)].map((m) => m[1]);

export function visibleLines(lines, v, admin) {
  return lines
    .map((s) => s.replace(/\[\[(.*?)\]\]/g, (_, inner) => (admin || keysIn(inner).every((k) => v[k]) ? inner : "")))
    .filter((s) => admin || keysIn(s).every((k) => v[k]));
}

export function Fill({ k }) {
  const v = useLegal();
  if (v[k]) return <>{v[k]}</>;
  return <mark className="lg-fill" title="À compléter dans Paramètres → Admin → Informations légales">À COMPLÉTER : {LEGAL_LABELS[k] || k}</mark>;
}

export function Txt({ s }) {
  return s.split(RX).filter(Boolean).map((part, i) => {
    const m = part.match(/^\{\{([a-z_]+)\}\}$/);
    if (m) return <Fill key={i} k={m[1]} />;
    const l = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (l) return l[2].startsWith("/") ? <Link key={i} to={l[2]}>{l[1]}</Link> : <a key={i} href={l[2]} target="_blank" rel="noopener noreferrer">{l[1]}</a>;
    return <span key={i}>{part}</span>;
  });
}

// Paragraphes ; les lignes commençant par « • » sont regroupées en liste
export function Paras({ lines }) {
  const v = useLegal();
  const { isAdmin } = useApp();
  const out = []; let ul = null;
  visibleLines(lines, v, isAdmin).forEach((s, i) => {
    if (s.startsWith("• ")) { if (!ul) { ul = []; out.push(<ul key={"u" + i}>{ul}</ul>); } ul.push(<li key={i}><Txt s={s.slice(2)} /></li>); }
    else { ul = null; out.push(<p key={i}><Txt s={s} /></p>); }
  });
  return out;
}
