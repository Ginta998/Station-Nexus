import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { KINDS, isOeuvre, isFolder } from "@/lib/atelier";
import { showMenu } from "@/components/atelier/ContextMenu";
import { REL, relOf, edgesOf, neighborhood, coherence, layout, withLink, guessRel } from "@/lib/network";
import "@/components/atelier/network.css";

/*
  Le réseau narratif : la constellation des fiches (qui est relié à quoi, et comment), la chronologie, et la cohérence.
  Relier : glisser une étoile sur une autre (on choisit la nature du lien), « Relier à… » dans le panneau, ou @mention dans un texte.
*/
const SHOWN = ["character", "place", "scene", "lore", "event", "document", "note", "inspiration"];
const W = 1200, H = 760;
const dateOf = (x) => x.date || x.fields?.date || "";

export default function NetworkView({ at, open }) {
  const [scope, setScope] = useState("all"); // all | u:<id> | o:<id>
  const [kinds, setKinds] = useState(() => new Set(["character", "place", "scene", "lore", "event"]));
  const [tab, setTab] = useState("map");
  const [sel, setSel] = useState(null);
  const [pos, setPos] = useState({}); const [vb, setVb] = useState({ x: 0, y: 0, w: W, h: H });
  const drag = useRef(null); const svg = useRef(null);

  const inScope = (x) => scope === "all" || (scope.startsWith("u:") ? x.universe_id === scope.slice(2) : x.fields?.oeuvre_id === scope.slice(2));
  const items = useMemo(() => at.items.filter((x) => !isOeuvre(x) && !isFolder(x) && SHOWN.includes(x.kind) && inScope(x)), [at.items, scope]); // eslint-disable-line react-hooks/exhaustive-deps
  const nodes = items.filter((x) => kinds.has(x.kind));
  const edges = useMemo(() => edgesOf(nodes), [nodes]); // eslint-disable-line react-hooks/exhaustive-deps
  const key = nodes.map((n) => n.id).join(",") + "|" + edges.length;
  const base = useMemo(() => layout(nodes, edges, W, H), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const P = (id) => pos[id] || base[id] || { x: W / 2, y: H / 2 };
  const issues = useMemo(() => coherence(items), [items]);
  const selIt = at.items.find((x) => x.id === sel);
  const near = new Set(selIt ? [...(selIt.links || []), ...at.items.filter((x) => (x.links || []).includes(selIt.id)).map((x) => x.id)] : []);

  const link = async (a, b, rel) => { await at.saveItem(withLink(a, b.id, rel)); toast.success(`${a.title} ${REL[rel].t} ${b.title}`); };
  const askRel = (a, b, x, y) => showMenu(x, y, Object.entries(REL).map(([k, v]) => ({ id: "rel-" + k, label: `${a.title} ${v.t} ${b.title}`, on: k === guessRel(a, b), onClick: () => link(a, b, k) })), "NATURE DU LIEN");

  // glisser une étoile : la déplacer ; la lâcher sur une autre : les relier
  const pt = (e) => { const r = svg.current.getBoundingClientRect(); return { x: vb.x + ((e.clientX - r.left) / r.width) * vb.w, y: vb.y + ((e.clientY - r.top) / r.height) * vb.h }; };
  const down = (e, id) => { e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId); drag.current = { id, moved: false, sx: e.clientX, sy: e.clientY }; };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    if (d.pan) { const r = svg.current.getBoundingClientRect(); setVb((v) => ({ ...v, x: d.vx - ((e.clientX - d.sx) / r.width) * v.w, y: d.vy - ((e.clientY - d.sy) / r.height) * v.h })); return; }
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 4) d.moved = true;
    if (d.moved) { const p = pt(e); setPos((o) => ({ ...o, [d.id]: p })); }
  };
  const up = (e) => {
    const d = drag.current; drag.current = null; if (!d || d.pan) return;
    if (!d.moved) { setSel(d.id === sel ? null : d.id); return; }
    const p = pt(e); const hit = nodes.find((n) => n.id !== d.id && Math.hypot(P(n.id).x - p.x, P(n.id).y - p.y) < 28);
    if (hit) { const a = at.items.find((x) => x.id === d.id); setPos((o) => { const n = { ...o }; delete n[d.id]; return n; }); askRel(a, hit, e.clientX, e.clientY); }
  };
  const wheel = (e) => { const f = e.deltaY > 0 ? 1.1 : 0.9; const p = pt(e); setVb((v) => { const w = Math.max(300, Math.min(W * 2.5, v.w * f)); const h = (w / W) * H; return { x: p.x - ((p.x - v.x) * w) / v.w, y: p.y - ((p.y - v.y) * h) / v.h, w, h }; }); };

  const groups = selIt ? neighborhood(at.items, selIt) : {};
  const timeline = items.filter((x) => (x.kind === "event" || x.kind === "scene") || dateOf(x)).sort((a, b) => (dateOf(a) || "9999").localeCompare(dateOf(b) || "9999") || (a.fields?.order ?? 0) - (b.fields?.order ?? 0));
  const peopleOf = (x) => at.items.filter((c) => c.kind === "character" && ((c.links || []).includes(x.id) || (x.links || []).includes(c.id)));
  const placeOf = (x) => at.items.find((p) => p.kind === "place" && ((x.links || []).includes(p.id) || (p.links || []).includes(x.id)));

  return (
    <section className="at-view nt" data-testid="atelier-network">
      <header className="at-head">
        <p className="at-eyebrow mono">// QUI EST RELIÉ À QUOI</p>
        <h1>Réseau narratif</h1>
        <p className="at-sub">Glisse une étoile sur une autre pour les relier, ou tape @ dans un texte. Les fiches se remplissent toutes seules : un personnage sait dans quelles scènes il apparaît.</p>
      </header>
      <div className="nt-bar">
        <select value={scope} onChange={(e) => { setScope(e.target.value); setSel(null); setPos({}); }} data-testid="network-scope">
          <option value="all">Tous les univers</option>
          {at.universes.map((u) => <option key={u.id} value={"u:" + u.id}>{u.name}</option>)}
          {at.items.filter(isOeuvre).map((o) => <option key={o.id} value={"o:" + o.id}>Œuvre · {o.title}</option>)}
        </select>
        <div className="nt-kinds">{SHOWN.map((k) => <button key={k} className={kinds.has(k) ? "on" : ""} onClick={() => setKinds((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; })}><i>{KINDS[k]?.kanji}</i>{KINDS[k]?.plural}</button>)}</div>
        <div className="nt-tabs">{[["map", "Constellation"], ["time", "Chronologie"], ["check", `Cohérence${issues.filter((i) => i.level === "warn").length ? ` · ${issues.filter((i) => i.level === "warn").length}` : ""}`]].map(([k, t]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} data-testid={`network-tab-${k}`}>{t}</button>)}</div>
      </div>

      {tab === "map" && (
        <div className="nt-map">
          {nodes.length === 0 ? <p className="nt-empty">Aucune fiche ici. Crée des personnages, des lieux, des scènes… puis relie-les.</p> : (
            <svg ref={svg} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} onPointerMove={move} onPointerUp={up} onWheel={wheel} data-testid="network-svg"
              onPointerDown={(e) => { drag.current = { pan: true, sx: e.clientX, sy: e.clientY, vx: vb.x, vy: vb.y }; }}>
              {edges.map((e) => { const a = P(e.a), b = P(e.b); const hot = sel && (e.a === sel || e.b === sel); return (
                <g key={e.a + e.b} className={"nt-e" + (hot ? " hot" : sel ? " dim" : "")}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                  {hot && <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6}>{REL[e.rel]?.t}</text>}
                </g>); })}
              {nodes.map((n) => { const p = P(n.id); const on = n.id === sel; const dim = sel && !on && !near.has(n.id); const r = 14 + Math.min(10, ((n.links || []).length + at.items.filter((x) => (x.links || []).includes(n.id)).length) * 1.5);
                return (
                  <g key={n.id} className={"nt-n k-" + n.kind + (on ? " on" : "") + (dim ? " dim" : "")} transform={`translate(${p.x},${p.y})`} onPointerDown={(e) => down(e, n.id)} onDoubleClick={() => open(n.id)} data-testid={`network-node-${n.id}`}>
                    <circle r={r} /><text className="kj" dy="5">{KINDS[n.kind]?.kanji}</text><text className="lb" dy={r + 16}>{n.title || "Sans titre"}</text>
                  </g>);
              })}
            </svg>
          )}
          {selIt && (
            <aside className="nt-side" data-testid="network-side">
              <p className="mono nt-k">{KINDS[selIt.kind]?.label.toUpperCase()}</p>
              <h3>{selIt.title}</h3>
              {Object.keys(groups).length === 0 && <p className="nt-note">Relié à rien pour l'instant.</p>}
              {Object.entries(groups).map(([g, xs]) => (
                <div key={g} className="nt-g"><p className="mono">{g.toUpperCase()}</p>{xs.map((x) => <button key={x.id} onClick={() => setSel(x.id)}><i>{KINDS[x.kind]?.kanji}</i>{x.title}</button>)}</div>
              ))}
              <div className="nt-acts">
                <button className="at-btn" onClick={() => open(selIt.id)}>Ouvrir la fiche</button>
                <button className="at-btn ghost" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); showMenu(r.left, r.bottom + 4, items.filter((x) => x.id !== selIt.id && !(selIt.links || []).includes(x.id)).slice(0, 60).map((x) => ({ id: "l-" + x.id, label: `${KINDS[x.kind]?.kanji}  ${x.title || "Sans titre"}`, onClick: () => askRel(selIt, x, r.left, r.bottom) })), "RELIER À…"); }} data-testid="network-link">Relier à…</button>
              </div>
            </aside>
          )}
          <p className="nt-help mono">GLISSER UNE ÉTOILE SUR UNE AUTRE : RELIER · DOUBLE-CLIC : OUVRIR · MOLETTE : ZOOM · GLISSER LE FOND : SE DÉPLACER</p>
        </div>
      )}

      {tab === "time" && (
        <ol className="nt-time" data-testid="network-time">
          {timeline.length === 0 && <p className="nt-empty">Pas encore d'événements ni de scènes. Une date sur une fiche la place ici.</p>}
          {timeline.map((x) => { const pl = placeOf(x); const pp = peopleOf(x); return (
            <li key={x.id}><span className="mono d">{dateOf(x) || "—"}</span>
              <button onClick={() => open(x.id)}><i>{KINDS[x.kind]?.kanji}</i><b>{x.title || "Sans titre"}</b>
                <small>{pl && <>à {pl.title}</>}{pl && pp.length > 0 && " · "}{pp.length > 0 && <>avec {pp.map((c) => c.title).join(", ")}</>}</small></button></li>); })}
        </ol>
      )}

      {tab === "check" && (
        <div className="nt-check" data-testid="network-check">
          {issues.length === 0 && <p className="nt-empty">Rien ne cloche. Le réseau tient debout.</p>}
          {issues.map((i, k) => (
            <div key={k} className={"nt-issue " + i.level}><p>{i.t}</p><span>{i.ids.map((id) => { const x = at.items.find((y) => y.id === id); return x ? <button key={id} onClick={() => open(id)}>{x.title}</button> : null; })}</span></div>
          ))}
          <p className="nt-note">Astuce : un personnage dont l'état contient « mort » (ou l'étiquette « mort ») et une date est vérifié contre les scènes datées après.</p>
        </div>
      )}
    </section>
  );
}
