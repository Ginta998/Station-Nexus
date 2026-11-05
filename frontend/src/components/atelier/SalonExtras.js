import { useState } from "react";
import { IoSearch, IoAdd, IoPlay, IoCheckmark, IoClose } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi, imgSrc } from "@/lib/atelier";
import { toEmbed } from "@/lib/embed";
import { vidOf } from "@/components/atelier/Cinema";
import "@/components/atelier/salonExtras.css";

const pos = (u) => { try { return [+localStorage.getItem("nx-pos:" + u) || 0, +localStorage.getItem("nx-dur:" + u) || 0]; } catch (_) { return [0, 0]; } };
const thumbOf = (l) => { const v = vidOf(l.url); if (v) return `https://i.ytimg.com/vi/${v}/mqdefault.jpg`; const e = toEmbed(l.url); return e?.video ? "" : l.image ? imgSrc(l.image) : ""; };

// Rangée « Reprendre la lecture » : les vidéos commencées, avec leur progression
export function ContinueRow({ links, launch }) {
  const [, tick] = useState(0);
  const list = links.map((l) => ({ l, p: pos(l.url) })).filter(({ p }) => p[0] > 5).slice(0, 12);
  if (!list.length) return null;
  const forget = (l) => { try { localStorage.removeItem("nx-pos:" + l.url); } catch (_) {} tick((x) => x + 1); };
  return (
    <section className="sx-row sx-cont" data-testid="atelier-salon-continue">
      <h3 className="sx-cont-h">Reprendre la lecture</h3>
      <div className="sx-cont-rail">{list.map(({ l, p }) => (
        <div key={l.id} className="sx-cont-card" onClick={() => launch({ title: l.title, url: l.url })} data-testid={`atelier-continue-${l.id}`}>
          <span className="th" style={{ backgroundImage: thumbOf(l) ? `url(${thumbOf(l)})` : undefined }}><span className="pl"><IoPlay size={22} /></span>
            <span className="bar"><i style={{ width: p[1] ? Math.min(100, (p[0] / p[1]) * 100) + "%" : "30%" }} /></span></span>
          <b>{l.title}</b>
          <small>{p[1] ? `Reste ${Math.max(1, Math.round((p[1] - p[0]) / 60))} min` : `Arrêté à ${Math.floor(p[0] / 60)} min`}</small>
          <button className="x" onClick={(e) => { e.stopPropagation(); forget(l); }} title="Retirer de la rangée"><IoClose size={14} /></button>
        </div>))}
      </div>
    </section>
  );
}

// Recherche YouTube : ajoute une vidéo au Salon en un clic
export function YtSearch({ at, launch }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState(null); const [busy, setBusy] = useState(false);
  const have = new Set(at.links.map((l) => vidOf(l.url)).filter(Boolean));
  const go = async (e) => { e.preventDefault(); if (!q.trim()) return; setBusy(true); try { setRes(await atelierApi.ytSearch(q.trim())); } catch (_) { toast.error("Recherche impossible"); } setBusy(false); };
  const add = async (v) => { await at.saveLink({ title: v.title, url: `https://www.youtube.com/watch?v=${v.id}`, kind: "watch" }); toast.success("Ajouté au Salon"); };
  return (
    <section className="sx-yt" data-testid="atelier-salon-ytsearch">
      <form onSubmit={go}><IoSearch size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher sur YouTube…" data-testid="atelier-ytsearch-input" />{res && <button type="button" className="clr" onClick={() => { setRes(null); setQ(""); }}><IoClose size={16} /></button>}<button className="at-btn" type="submit" disabled={busy} data-testid="atelier-ytsearch-submit">{busy ? "…" : "Chercher"}</button></form>
      {res && <div className="sx-yt-grid">{res.map((v) => (
        <div key={v.id} className="sx-yt-card" data-testid={`atelier-ytres-${v.id}`}>
          <span className="th" style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/mqdefault.jpg)` }} onClick={() => launch({ title: v.title, url: `https://www.youtube.com/watch?v=${v.id}` })}>{v.length && <em>{v.length}</em>}<span className="pl"><IoPlay size={20} /></span></span>
          <b title={v.title}>{v.title}</b><small>{v.author}{v.views ? ` · ${v.views} vues` : ""}{v.date ? ` · ${v.date}` : ""}</small>
          <button className={"add" + (have.has(v.id) ? " on" : "")} disabled={have.has(v.id)} onClick={() => add(v)} data-testid={`atelier-ytadd-${v.id}`}>{have.has(v.id) ? <><IoCheckmark size={14} /> Dans le Salon</> : <><IoAdd size={14} /> Ajouter</>}</button>
        </div>))}
        {!res.length && <p className="at-empty">Aucun résultat.</p>}
      </div>}
    </section>
  );
}
