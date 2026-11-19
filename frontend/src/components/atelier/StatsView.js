import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/lib/api";
import "@/components/atelier/stats.css";

/*
  Tes chiffres : ce qui est ouvert, lu, terminé, où les lecteurs décrochent, combien de temps on lit, d'où l'on vient.
  Les visites sont anonymes (un identifiant au hasard par navigateur), comptées par la station elle-même ; les tiennes ne comptent pas.
*/
const REF_NAME = (r) => (/instagram/.test(r) ? "Instagram" : /youtube|youtu\.be/.test(r) ? "YouTube" : /tiktok/.test(r) ? "TikTok" : /facebook|fb\./.test(r) ? "Facebook" : /google/.test(r) ? "Google" : /t\.co|twitter|x\.com/.test(r) ? "X (Twitter)" : /discord/.test(r) ? "Discord" : r);
const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`);
const short = (d) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export default function StatsView() {
  const [days, setDays] = useState(30);
  const { data, isLoading, error } = useQuery({ queryKey: ["stats", days], queryFn: () => getStats(days) });
  const [sel, setSel] = useState(null);
  const works = data?.works || [];
  const cur = works.find((w) => w.id === sel) || works.find((w) => w.units.length > 1) || works[0];
  const totals = useMemo(() => ({ opens: works.reduce((a, w) => a + w.opens, 0), readers: works.reduce((a, w) => a + w.readers, 0), minutes: works.reduce((a, w) => a + w.minutes, 0) }), [works]);
  // la plus grosse chute d'un chapitre au suivant
  const drop = useMemo(() => {
    const u = cur?.units || []; let best = null;
    for (let i = 1; i < u.length; i++) { const a = u[i - 1].readers, b = u[i].readers; if (a >= 3 && b < a) { const p = Math.round((1 - b / a) * 100); if (!best || p > best.p) best = { from: u[i - 1].index + 1, to: u[i].index + 1, p }; } }
    return best;
  }, [cur]);

  return (
    <section className="at-view stx" data-testid="atelier-stats">
      <header className="at-head">
        <p className="at-eyebrow mono">// CE QUI MARCHE</p>
        <h1>Tes chiffres</h1>
        <p className="at-sub">Les visites de la station, comptées par elle-même, sans pistage extérieur. Tes propres visites ne comptent pas.</p>
      </header>
      <div className="stx-bar">{[[7, "7 jours"], [30, "30 jours"], [90, "3 mois"], [365, "1 an"]].map(([d, t]) => <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)} data-testid={`stats-days-${d}`}>{t}</button>)}</div>
      {error && <p className="stx-empty">{error?.response?.status === 404 ? "Le serveur de la station n'a pas encore cette mise à jour (à déployer sur Emergent)." : "Chiffres indisponibles pour l'instant."}</p>}
      {isLoading && <p className="stx-empty">Chargement…</p>}
      {data && (<>
        <div className="stx-tiles">
          <Tile k="Visiteurs" v={data.visitors} s="navigateurs différents" />
          <Tile k="Œuvres ouvertes" v={totals.opens} s="ouvertures uniques" />
          <Tile k="Lecteurs" v={totals.readers} s="ont lu ou regardé" />
          <Tile k="Temps de lecture" v={fmtMin(totals.minutes)} s="au total" />
        </div>

        <div className="stx-card">
          <h3>Visiteurs par jour</h3>
          <Bars rows={data.daily.map((d) => ({ k: d.day, label: short(d.day), v: d.visitors, tip: `${short(d.day)} · ${d.visitors} visiteur${d.visitors > 1 ? "s" : ""} · ${d.reads} lecture${d.reads > 1 ? "s" : ""}` }))} empty="Pas encore de visite sur la période." />
        </div>

        <div className="stx-grid">
          <div className="stx-card">
            <h3>Les œuvres</h3>
            {works.length === 0 ? <p className="stx-empty">Aucune œuvre ouverte sur la période.</p> : (
              <div className="stx-tw"><table className="stx-t">
                <thead><tr><th>Œuvre</th><th>Ouvertures</th><th>Lecteurs</th><th>Passage</th><th>Temps moyen</th></tr></thead>
                <tbody>{works.map((w) => (
                  <tr key={w.id} className={cur?.id === w.id ? "on" : ""} onClick={() => setSel(w.id)} data-testid={`stats-work-${w.id}`}>
                    <td><b>{w.title}</b></td><td>{w.opens}</td><td>{w.readers}</td>
                    <td title="Part des visiteurs qui, après avoir ouvert l'œuvre, l'ont lue ou regardée">{w.opens ? Math.round((w.readers / w.opens) * 100) : 0} %</td>
                    <td>{w.avg_minutes} min</td>
                  </tr>))}</tbody>
              </table></div>
            )}
          </div>
          <div className="stx-card">
            <h3>D'où viennent les gens</h3>
            {data.refs.length === 0 ? <p className="stx-empty">Pas encore de provenance connue. Astuce : ajoute <code>?utm_source=instagram</code> au lien de ta bio pour le reconnaître à coup sûr.</p>
              : <HBars rows={data.refs.map((r) => ({ label: REF_NAME(r.ref), v: r.visitors }))} />}
          </div>
        </div>

        {cur && (
          <div className="stx-card" data-testid="stats-retention">
            <h3>Où l'on décroche · {cur.title}</h3>
            {cur.units.length < 2 ? <p className="stx-empty">Il faut au moins deux chapitres ou épisodes lus pour voir où l'on décroche.</p> : (<>
              {drop && <p className="stx-drop">Le passage du {drop.from} au {drop.to} perd <b>{drop.p} %</b> des lecteurs : c'est là que ça décroche le plus.</p>}
              <Bars rows={cur.units.map((u) => ({ k: u.index, label: String(u.index + 1), v: u.readers, tip: `${u.index + 1} · ${u.readers} lecteur${u.readers > 1 ? "s" : ""} · ${u.ends} l'ont fini` }))} />
              <p className="stx-note">Chaque barre : les lecteurs qui ont ouvert ce chapitre ou cet épisode. Une barre qui tombe d'un coup, c'est l'endroit où l'on arrête.</p>
            </>)}
          </div>
        )}
      </>)}
    </section>
  );
}

function Tile({ k, v, s }) { return <div className="stx-tile"><small>{k}</small><b>{v}</b><span>{s}</span></div>; }

// des barres verticales d'une seule couleur, avec la valeur au survol (et au toucher)
function Bars({ rows, empty }) {
  const [hov, setHov] = useState(null);
  if (!rows.length) return <p className="stx-empty">{empty || "Rien à montrer."}</p>;
  const max = Math.max(1, ...rows.map((r) => r.v));
  const every = Math.ceil(rows.length / 12);
  return (
    <div className="stx-bars" onMouseLeave={() => setHov(null)}>
      <div className="stx-tip">{hov != null ? rows[hov].tip : " "}</div>
      <div className="stx-plot" role="img" aria-label={rows.map((r) => `${r.label} : ${r.v}`).join(", ")}>
        {rows.map((r, i) => (
          <button key={r.k} className={"stx-b" + (hov === i ? " on" : "")} onMouseEnter={() => setHov(i)} onFocus={() => setHov(i)} onClick={() => setHov(i)} aria-label={r.tip}>
            <i style={{ height: `${Math.max(2, (r.v / max) * 100)}%` }} />
            <small>{i % every === 0 ? r.label : ""}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
function HBars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.v));
  return <div className="stx-h">{rows.map((r) => <div key={r.label} className="stx-hr"><span>{r.label}</span><i><b style={{ width: `${(r.v / max) * 100}%` }} /></i><em>{r.v}</em></div>)}</div>;
}
