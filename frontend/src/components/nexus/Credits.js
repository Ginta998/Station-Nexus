import "@/components/nexus/nexus.css";
// Les crédits d'une œuvre : qui a travaillé dessus, ou l'artiste dont elle utilise le travail.
// Gardés dans la création : credits = [{ name, role, link }]
export const creditsOf = (it) => (it?.credits || []).filter((c) => (c?.name || "").trim());
const href = (l = "") => { const u = l.trim(); if (!u) return ""; if (/^https?:\/\//i.test(u)) return u; if (/^@[\w.]+$/.test(u)) return `https://instagram.com/${u.slice(1)}`; return "https://" + u.replace(/^\/+/, ""); };
const Name = ({ c }) => (c.link ? <a href={href(c.link)} target="_blank" rel="noopener noreferrer">{c.name}</a> : <span>{c.name}</span>);
// Les rôles dans l'ordre où on les a saisis, chacun avec ses noms
const groups = (list) => { const m = new Map(); list.forEach((c) => { const r = (c.role || "").trim() || "Avec"; if (!m.has(r)) m.set(r, []); m.get(r).push(c); }); return [...m.entries()]; };

// Une ligne courte (fiche, accueil d'une œuvre) : « Illustrations · Camila Ramos »
export function CreditLine({ it, max = 2, className = "" }) {
  const g = groups(creditsOf(it)); if (!g.length) return null;
  return (
    <p className={"nx-crl " + className} data-testid="credit-line">
      {g.slice(0, max).map(([r, cs], i) => <span key={r}>{i > 0 && <i aria-hidden="true"> · </i>}<em>{r}</em> {cs.map((c, j) => <span key={j}>{j > 0 && ", "}<Name c={c} /></span>)}</span>)}
      {g.length > max && <i> · …</i>}
    </p>
  );
}

// Le générique complet (monde de l'œuvre)
export function CreditsRoll({ it }) {
  const g = groups(creditsOf(it));
  return (
    <div className="nx-roll" data-testid="credits-roll">
      <p className="mono nx-roll-k">GÉNÉRIQUE</p>
      <h2>{it.title}</h2>
      {g.map(([r, cs]) => (
        <div key={r} className="nx-roll-g"><p className="mono">{r}</p>{cs.map((c, j) => <b key={j}><Name c={c} /></b>)}</div>
      ))}
    </div>
  );
}
