import { useState } from "react";
import { IoCheckmark, IoTrashOutline, IoAdd, IoDocumentTextOutline } from "react-icons/io5";
import { todayStr, isOeuvre, TASK_CATS, taskCat, setTaskCat } from "@/lib/atelier";

const fmt = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "");

export function TaskRow({ t, at, open, compact }) {
  const today = todayStr();
  const late = !t.done && t.due && t.due < today;
  const u = at.universes.find((x) => x.id === t.universe_id);
  const it = at.items.find((x) => x.id === t.item_id);
  const cat = taskCat(t);
  return (
    <div className={"at-task" + (t.done ? " done" : "") + (late ? " late" : "")} data-testid={`atelier-task-${t.id}`}>
      <button className="chk" onClick={() => at.saveTask({ ...t, done: !t.done })} data-testid={`atelier-task-toggle-${t.id}`} aria-label="Terminer">{t.done && <IoCheckmark size={13} />}</button>
      <div className="tx">
        <span className="tt">{t.priority === "high" && <b className="hi">!</b>}{cat && <em className="tcat" style={{ color: TASK_CATS[cat].color }}>{TASK_CATS[cat].label}</em>}{t.title}</span>
        <span className="meta mono">
          {t.due && <span className={late ? "lt" : ""}>{t.due === today ? "AUJOURD'HUI" : fmt(t.due).toUpperCase()}</span>}
          {u && <span style={{ color: u.color }}>{u.name}</span>}
          {it && <span className="lnk" onClick={() => open(it.id)}><IoDocumentTextOutline size={11} /> {it.title || "Sans titre"}</span>}
        </span>
      </div>
      {!compact && (
        <>
          <input type="date" value={t.due || ""} onChange={(e) => at.saveTask({ ...t, due: e.target.value })} className="due" aria-label="Échéance" />
          <button className="del" onClick={() => at.removeTask(t.id)} aria-label="Supprimer" data-testid={`atelier-task-delete-${t.id}`}><IoTrashOutline size={15} /></button>
        </>
      )}
    </div>
  );
}

export function TaskQuickAdd({ at, defaults = {} }) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [uid, setUid] = useState(defaults.universe_id || "");
  const [oid, setOid] = useState(defaults.item_id || "");
  const [cat, setCat] = useState("");
  const [high, setHigh] = useState(false);
  const scopeUid = uid || defaults.universe_id || "";
  const oeuvres = at.items.filter((x) => isOeuvre(x) && (!scopeUid || x.universe_id === scopeUid));
  const add = async (e) => {
    e.preventDefault(); if (!title.trim()) return;
    await at.saveTask({ ...defaults, title: title.trim(), due, universe_id: uid || defaults.universe_id || null, item_id: oid || null, priority: high ? "high" : "normal", notes: setTaskCat(defaults.notes || "", cat) });
    setTitle(""); setDue(""); setHigh(false); setOid(""); setCat("");
  };
  return (
    <form className="at-tadd" onSubmit={add} data-testid="atelier-task-add">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nouvelle tâche…" data-testid="atelier-task-title" />
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} data-testid="atelier-task-due" />
      <select value={cat} onChange={(e) => setCat(e.target.value)} data-testid="atelier-task-cat">
        <option value="">Catégorie</option>{Object.entries(TASK_CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      {!defaults.universe_id && (
        <select value={uid} onChange={(e) => { setUid(e.target.value); setOid(""); }} data-testid="atelier-task-universe">
          <option value="">Sans univers</option>{at.universes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      )}
      {oeuvres.length > 0 && (
        <select value={oid} onChange={(e) => setOid(e.target.value)} data-testid="atelier-task-oeuvre">
          <option value="">Sans œuvre</option>{oeuvres.map((o) => <option key={o.id} value={o.id}>{o.title || "Œuvre"}</option>)}
        </select>
      )}
      <button type="button" className={"pri" + (high ? " on" : "")} onClick={() => setHigh((h) => !h)} title="Prioritaire">!</button>
      <button type="submit" className="at-btn" data-testid="atelier-task-submit"><IoAdd size={16} /> Ajouter</button>
    </form>
  );
}

export default function TasksView({ at, open }) {
  const [showDone, setShowDone] = useState(false);
  const today = todayStr();
  const open_ = at.tasks.filter((t) => !t.done);
  const groups = [
    ["En retard", open_.filter((t) => t.due && t.due < today)],
    ["Aujourd'hui", open_.filter((t) => t.due === today)],
    ["À venir", open_.filter((t) => t.due > today).sort((a, b) => a.due.localeCompare(b.due))],
    ["Sans date", open_.filter((t) => !t.due)],
  ];
  const done = at.tasks.filter((t) => t.done).sort((a, b) => (b.done_at || "").localeCompare(a.done_at || ""));
  return (
    <section className="at-view" data-testid="atelier-tasks">
      <header className="at-head"><p className="at-eyebrow mono">// COCKPIT</p><h1>Tâches & échéances</h1><p className="at-sub">{open_.length} en cours · {done.length} terminée{done.length > 1 ? "s" : ""}</p></header>
      <TaskQuickAdd at={at} />
      {groups.map(([label, list]) => list.length > 0 && (
        <div className="at-panel" key={label}>
          <div className="at-panel-h"><h2>{label}</h2><small className="mono">{list.length}</small></div>
          {list.map((t) => <TaskRow key={t.id} t={t} at={at} open={open} />)}
        </div>
      ))}
      {open_.length === 0 && <p className="at-empty big">Tout est fait. Prends le temps de respirer.</p>}
      {done.length > 0 && (
        <div className="at-panel">
          <div className="at-panel-h"><h2>Terminées</h2><span className="at-link" onClick={() => setShowDone((s) => !s)} data-testid="atelier-tasks-show-done">{showDone ? "Masquer" : `Afficher (${done.length})`}</span></div>
          {showDone && done.map((t) => <TaskRow key={t.id} t={t} at={at} open={open} />)}
        </div>
      )}
    </section>
  );
}
