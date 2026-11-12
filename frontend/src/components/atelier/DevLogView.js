import { useEffect, useState } from "react";
import { IoCheckboxOutline, IoSquareOutline, IoAdd, IoTrashOutline, IoCreateOutline, IoArrowUp, IoArrowDown, IoFlagOutline, IoPricetagOutline, IoSwapHorizontal } from "react-icons/io5";
import data from "@/data/changelog.json";
import { pressMenu, showMenu } from "@/components/atelier/ContextMenu";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";

// Backlog : liste complète enregistrée dans la config de l'Atelier (partagée Mac/téléphone)
// + copie locale. Les anciennes clés (cases cochées, idées perso) servent au premier chargement.
const LKEY = "nexus-backlog-v2", OLD_DONE = "nexus-devlog-done", OLD_USER = "nexus-devlog-user";
const STATUS = [["done", "Fait"], ["wip", "En cours"], ["todo", "À faire"]];
const PRIO = [["p1", "Urgent"], ["p2", "Haute"], ["p3", "Normale"], ["p4", "Basse"]];
const TAGCLASS = { "Nouveau": "nv", "Amélioré": "am", "Corrigé": "fx" };
const rank = (p) => Math.max(0, PRIO.findIndex(([k]) => k === (p || "p3")));
const prioLabel = (p) => PRIO[rank(p)][1];
const isSeed = (id) => data.backlog.some((b) => b.id === id);
const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };

const seed = () => {
  const done = new Set(read(OLD_DONE, []));
  const user = read(OLD_USER, []);
  return [...data.backlog, ...(Array.isArray(user) ? user : [])].map(({ user: _u, ...it }) => ({ ...it, status: done.has(it.id) ? "done" : it.status, prio: it.prio || "p3" }));
};
// Ajoute les nouvelles entrées du code absentes de la liste enregistrée (les supprimées restent supprimées)
const withNew = (list) => { const ids = new Set(list.map((x) => x.id)); return [...list, ...data.backlog.filter((b) => !ids.has(b.id)).map((b) => ({ ...b, prio: b.prio || "p3" }))]; };

// Page Dev : patch notes datés (façon Overwatch) + backlog éditable, priorisé
export default function DevLogView({ at }) {
  const server = at?.config?.backlog;
  const [list, setList] = useState(() => withNew(Array.isArray(server) ? server : (Array.isArray(read(LKEY, null)) ? read(LKEY, null) : seed())));
  const [nt, setNt] = useState(""); const [np, setNp] = useState("p3");
  const [tab, setTab] = useState("patch");
  const [edit, setEdit] = useState(null);
  useEffect(() => { if (Array.isArray(server)) setList(withNew(server)); }, [server]);

  const save = (n) => { setList(n); try { localStorage.setItem(LKEY, JSON.stringify(n)); } catch (_) {} at?.saveConfig?.({ backlog: n })?.catch?.(() => {}); };
  const upd = (id, p) => save(list.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const del = async (it) => { if (!(await labConfirm(`Supprimer « ${it.t} » du backlog ?`))) return; save(isSeed(it.id) ? list.map((x) => (x.id === it.id ? { id: x.id, del: true } : x)) : list.filter((x) => x.id !== it.id)); };
  const add = () => { const t = nt.trim(); if (!t) return; save([...list, { id: "u" + Date.now(), t, cat: "Perso", status: "todo", prio: np }]); setNt(""); };
  const commit = (it, v) => { setEdit(null); const t = v.trim(); if (t && t !== it.t) upd(it.id, { t }); };

  const live = list.filter((x) => !x.del);
  const col = (st) => live.map((x, i) => [x, i]).filter(([x]) => x.status === st).sort((a, b) => rank(a[0].prio) - rank(b[0].prio) || a[1] - b[1]).map(([x]) => x);
  const cats = [...new Set(live.map((x) => x.cat).filter(Boolean))].sort();
  const doneCount = live.filter((x) => x.status === "done").length;

  // Monter / descendre : passe devant (ou derrière) le voisin et prend sa priorité
  const move = (it, dir) => {
    const c = col(it.status); const nb = c[c.findIndex((x) => x.id === it.id) + dir]; if (!nb) return;
    const n = list.filter((x) => x.id !== it.id); const b = n.findIndex((x) => x.id === nb.id);
    n.splice(dir < 0 ? b : b + 1, 0, { ...it, prio: nb.prio || "p3" }); save(n);
  };
  const prioMenu = (it) => PRIO.map(([k, l]) => ({ id: `prio-${k}`, label: l, on: (it.prio || "p3") === k, onClick: () => upd(it.id, { prio: k }) }));
  const menu = (it) => [
    { id: "edit", label: "Modifier le texte", icon: <IoCreateOutline size={14} />, onClick: () => setEdit(it.id) },
    { id: "prio", label: `Priorité · ${prioLabel(it.prio)}`, icon: <IoFlagOutline size={14} />, sub: prioMenu(it) },
    { id: "status", label: "Statut", icon: <IoSwapHorizontal size={14} />, sub: STATUS.map(([k, l]) => ({ id: `st-${k}`, label: l, on: it.status === k, onClick: () => upd(it.id, { status: k }) })) },
    { id: "cat", label: `Catégorie · ${it.cat || "—"}`, icon: <IoPricetagOutline size={14} />, sub: [...cats.map((c) => ({ id: `cat-${c}`, label: c, on: it.cat === c, onClick: () => upd(it.id, { cat: c }) })), "-", { id: "cat-new", label: "Nouvelle catégorie…", onClick: async () => { const c = (await labPrompt("Nom de la catégorie", it.cat || "")); if (c && c.trim()) upd(it.id, { cat: c.trim() }); } }] },
    "-",
    { id: "up", label: "Monter", icon: <IoArrowUp size={14} />, onClick: () => move(it, -1) },
    { id: "down", label: "Descendre", icon: <IoArrowDown size={14} />, onClick: () => move(it, 1) },
    "-",
    { id: "del", label: "Supprimer", icon: <IoTrashOutline size={14} />, danger: true, onClick: () => del(it) },
  ];

  return (
    <section className="at-view" data-testid="atelier-devlog">
      <header className="at-head"><p className="at-eyebrow mono">// JOURNAL DE DÉVELOPPEMENT · v{data.version}</p><h1>Dev & Patch notes</h1><p className="at-sub">Tout ce qu'on a fait et ce qui reste. {doneCount}/{live.length} au backlog.</p></header>
      <nav className="at-tabs">
        <button className={tab === "patch" ? "on" : ""} onClick={() => setTab("patch")}>Patch notes<small>{data.patches.length}</small></button>
        <button className={tab === "backlog" ? "on" : ""} onClick={() => setTab("backlog")}>Backlog<small>{live.length - doneCount}</small></button>
      </nav>

      {tab === "patch" ? (
        <div className="dl-patches">
          {data.patches.map((p) => (
            <article key={p.v} className="dl-patch" data-testid={`devlog-patch-${p.v}`}>
              <div className="dl-ph"><span className="dl-v mono">v{p.v}</span><b>{p.title}</b><time className="mono">{p.date}</time></div>
              {Object.entries(p.groups).map(([g, items]) => (
                <div key={g} className="dl-grp">
                  <span className={"dl-tag " + (TAGCLASS[g] || "")}>{g}</span>
                  <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              ))}
            </article>
          ))}
        </div>
      ) : (
        <>
          <form className="at-tadd dl-add" onSubmit={(e) => { e.preventDefault(); add(); }}>
            <input value={nt} onChange={(e) => setNt(e.target.value)} placeholder="Ajouter une idée au backlog…" data-testid="devlog-add-input" />
            <select value={np} onChange={(e) => setNp(e.target.value)} aria-label="Priorité" data-testid="devlog-add-prio">{PRIO.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <button className="at-btn" type="submit"><IoAdd size={15} /> Ajouter</button>
          </form>
          <p className="dl-hint mono">Touche un texte pour le modifier · clic droit / appui long pour la priorité, le statut, la catégorie, l'ordre ou supprimer.</p>
          <div className="dl-backlog">
            {STATUS.map(([st, label]) => {
              const items = col(st);
              if (!items.length) return null;
              return (
                <div key={st} className="dl-col">
                  <h2 className={"dl-coltitle " + st}>{label}<small>{items.length}</small></h2>
                  {items.map((it) => (
                    <div key={it.id} className={`dl-item ${it.status} ${it.prio || "p3"}`} data-testid={`devlog-item-${it.id}`} {...(edit === it.id ? {} : pressMenu(() => ({ title: it.t.slice(0, 42), entries: menu(it) })))}>
                      <button className="chk" onClick={() => upd(it.id, { status: it.status === "done" ? "todo" : "done" })} aria-label="Cocher">{it.status === "done" ? <IoCheckboxOutline size={18} /> : <IoSquareOutline size={18} />}</button>
                      {edit === it.id
                        ? <input className="ed" autoFocus defaultValue={it.t} onBlur={(e) => commit(it, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setEdit(null); }} data-testid={`devlog-edit-${it.id}`} />
                        : <span className="t" onClick={() => setEdit(it.id)} title="Modifier">{it.t}</span>}
                      <button className={`pr mono ${it.prio || "p3"}`} onClick={(e) => { e.stopPropagation(); showMenu(e.clientX, e.clientY, prioMenu(it), "Priorité"); }} title="Changer la priorité" data-testid={`devlog-prio-${it.id}`}>{prioLabel(it.prio)}</button>
                      <span className="cat mono">{it.cat}</span>
                      <button className="del" onClick={() => del(it)} aria-label="Supprimer" title="Supprimer"><IoTrashOutline size={14} /></button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
