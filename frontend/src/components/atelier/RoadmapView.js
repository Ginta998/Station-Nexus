import { useMemo, useState } from "react";
import { IoAdd, IoClose, IoCheckmark, IoCreateOutline, IoTrashOutline, IoFlagOutline, IoSparklesOutline, IoEllipseOutline, IoCheckmarkCircle } from "react-icons/io5";
import { toast } from "sonner";
import { todayStr } from "@/lib/atelier";

const COLORS = ["#ff2f5f", "#ffb340", "#3ff0ff", "#7c5cff", "#00e5a0", "#ff7ad9", "#e8e1cf"];
const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toLocaleDateString("sv-SE"); };
const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000));
const fdate = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—");
const fshort = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—");

// Rétroplanning : on part de la date limite et on répartit les étapes à rebours jusqu'à aujourd'hui.
function Retro({ at, onDone }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [uni, setUni] = useState("");
  const [color, setColor] = useState(COLORS[1]);
  const [steps, setSteps] = useState("");
  const [busy, setBusy] = useState(false);

  const gen = async () => {
    const list = steps.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!title.trim() || !deadline) return toast.error("Donne un cap et une date limite");
    if (!list.length) return toast.error("Ajoute au moins une étape");
    setBusy(true);
    try {
      const start = todayStr();
      const span = Math.max(list.length, daysBetween(start, deadline));
      const phase = await at.saveRecord("goals", { road: true, kind: "phase", title: title.trim(), start, due: deadline, color, universe_id: uni, status: "active" });
      for (let i = 0; i < list.length; i++) {
        const due = i === list.length - 1 ? deadline : addDays(start, Math.round(span * (i + 1) / list.length));
        await at.saveRecord("goals", { road: true, kind: "milestone", title: list[i], due, phase: phase.id, universe_id: uni, status: "active" });
      }
      toast.success("Rétroplanning créé — les jalons sont placés à rebours");
      onDone();
    } catch { toast.error("Création impossible"); setBusy(false); }
  };

  return (
    <div className="at-panel rm-retro" data-testid="roadmap-retro">
      <div className="at-panel-h"><h2><IoSparklesOutline size={16} /> Nouveau rétroplanning</h2></div>
      <p className="rm-hint">Dis où tu veux arriver et pour quand. Les étapes se placent toutes seules, de maintenant jusqu'à l'échéance.</p>
      <div className="at-form grid">
        <label className="wide">Cap à atteindre<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sortir l'épisode 1 de S.A.M" data-testid="roadmap-retro-title" /></label>
        <label>Date limite<input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} data-testid="roadmap-retro-deadline" /></label>
        <label>Univers / œuvre<select value={uni} onChange={(e) => setUni(e.target.value)}><option value="">—</option>{at.universes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
      </div>
      <div className="lbl">Couleur</div>
      <div className="at-colors">{COLORS.map((c) => <button key={c} className={color === c ? "on" : ""} style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />)}</div>
      <label className="rm-steps">Étapes (une par ligne, dans l'ordre)
        <textarea rows={5} value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={"Écriture du scénario\nStoryboard\nTournage\nMontage\nÉtalonnage & son"} data-testid="roadmap-retro-steps" />
      </label>
      <div className="at-inline"><button className="at-btn" disabled={busy} onClick={gen} data-testid="roadmap-retro-gen"><IoSparklesOutline size={15} /> Générer le rétroplanning</button><button className="at-btn ghost" onClick={onDone}>Annuler</button></div>
    </div>
  );
}

// Formulaire court d'un jalon ou d'une phase
function NodeForm({ at, rec, onDone }) {
  const [v, setV] = useState(rec);
  const isPhase = v.kind === "phase";
  const save = async () => {
    if (!String(v.title || "").trim()) return toast.error("Donne un titre");
    await at.saveRecord("goals", { ...v, title: v.title.trim() });
    toast.success("Enregistré"); onDone();
  };
  return (
    <div className="at-panel at-recform" data-testid="roadmap-form">
      <div className="at-form grid">
        <label className="wide">{isPhase ? "Nom de la phase" : "Jalon"}<input autoFocus value={v.title || ""} onChange={(e) => setV({ ...v, title: e.target.value })} data-testid="roadmap-form-title" /></label>
        {isPhase && <label>Début<input type="date" value={v.start || ""} onChange={(e) => setV({ ...v, start: e.target.value })} /></label>}
        <label>{isPhase ? "Fin" : "Date"}<input type="date" value={v.due || ""} onChange={(e) => setV({ ...v, due: e.target.value })} data-testid="roadmap-form-due" /></label>
        <label>Univers / œuvre<select value={v.universe_id || ""} onChange={(e) => setV({ ...v, universe_id: e.target.value })}><option value="">—</option>{at.universes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
        <label className="wide">Notes<textarea rows={2} value={v.notes || ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></label>
      </div>
      <div className="at-inline"><button className="at-btn" onClick={save}><IoCheckmark size={15} /> Enregistrer</button><button className="at-btn ghost" onClick={onDone}>Annuler</button></div>
    </div>
  );
}

// Roadmap & rétroplanning — une frise claire, lisible, par phases et jalons
export default function RoadmapView({ at }) {
  const [retro, setRetro] = useState(false);
  const [edit, setEdit] = useState(null); // {rk fields} en cours d'édition/création
  const today = todayStr();
  const records = at.records || [];
  const phases = useMemo(() => records.filter((r) => r.rk === "goals" && r.road && r.kind === "phase").sort((a, b) => (a.start || a.due || "").localeCompare(b.start || b.due || "")), [records]);
  const milestones = useMemo(() => records.filter((r) => r.rk === "goals" && r.road && r.kind === "milestone"), [records]);
  const forPhase = (pid) => milestones.filter((m) => m.phase === pid).sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
  const loose = milestones.filter((m) => !m.phase || !phases.some((p) => p.id === m.phase)).sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
  const uni = (id) => at.universes.find((u) => u.id === id);

  const toggle = (m) => at.saveRecord("goals", { ...m, status: m.status === "done" ? "active" : "done" });
  const del = (m) => window.confirm(`Supprimer « ${m.title} » ?`) && at.removeRecord("goals", m.id);
  const delPhase = (p) => { if (!window.confirm(`Supprimer la phase « ${p.title} » et ses jalons ?`)) return; forPhase(p.id).forEach((m) => at.removeRecord("goals", m.id)); at.removeRecord("goals", p.id); };

  const Node = ({ m }) => {
    const u = uni(m.universe_id);
    const done = m.status === "done";
    const late = !done && m.due && m.due < today;
    return (
      <div className={"rm-node" + (done ? " done" : "") + (late ? " late" : "")} data-testid={`roadmap-node-${m.id}`}>
        <button className="rm-dot" onClick={() => toggle(m)} title={done ? "Marquer à faire" : "Marquer atteint"}>{done ? <IoCheckmarkCircle size={22} /> : <IoEllipseOutline size={22} />}</button>
        <div className="rm-body">
          <div className="rm-when mono">{fdate(m.due)}{late && <span className="rm-late">EN RETARD</span>}</div>
          <b>{m.title}</b>
          {(u || m.notes) && <small>{u && <span style={{ color: u.color }}>{u.name}</span>}{u && m.notes ? " · " : ""}{m.notes}</small>}
        </div>
        <div className="rm-acts">
          <button className="at-icon" onClick={() => setEdit(m)} aria-label="Modifier"><IoCreateOutline size={15} /></button>
          <button className="at-icon danger" onClick={() => del(m)} aria-label="Supprimer"><IoTrashOutline size={15} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="at-view" data-testid="roadmap">
      <div className="at-newbar rm-bar">
        <button className="at-btn" onClick={() => setRetro((r) => !r)} data-testid="roadmap-new-retro"><IoSparklesOutline size={16} /> Rétroplanning</button>
        <button className="at-btn ghost" onClick={() => setEdit({ kind: "phase", start: today, due: "", color: COLORS[2] })} data-testid="roadmap-new-phase"><IoAdd size={16} /> Phase</button>
        <button className="at-btn ghost" onClick={() => setEdit({ kind: "milestone", due: "", status: "active" })} data-testid="roadmap-new-milestone"><IoFlagOutline size={15} /> Jalon</button>
      </div>

      {retro && <Retro at={at} onDone={() => setRetro(false)} />}
      {edit && <NodeForm at={at} rec={edit} onDone={() => setEdit(null)} />}

      {phases.length === 0 && loose.length === 0 && !retro && (
        <p className="at-empty big">Trace ta route. Lance un <b>rétroplanning</b> depuis un objectif et une date limite, ou pose tes phases et tes jalons à la main. Mieux qu'un tableau de tâches : une vraie ligne de temps.</p>
      )}

      {phases.map((p) => {
        const ms = forPhase(p.id); const done = ms.filter((m) => m.status === "done").length;
        const u = uni(p.universe_id); const pct = ms.length ? Math.round(done / ms.length * 100) : 0;
        const col = p.color || u?.color || "var(--brand)";
        return (
          <section key={p.id} className="rm-phase" style={{ "--u": col }} data-testid={`roadmap-phase-${p.id}`}>
            <header className="rm-phase-h">
              <div className="rm-phase-t">
                <h2>{p.title}</h2>
                <small className="mono">{fshort(p.start)} → {fshort(p.due)}{u ? ` · ${u.name.toUpperCase()}` : ""} · {done}/{ms.length} JALONS</small>
              </div>
              <div className="rm-phase-acts">
                <button className="at-icon" onClick={() => setEdit({ kind: "milestone", phase: p.id, universe_id: p.universe_id || "", due: p.due || "", status: "active" })} title="Ajouter un jalon"><IoAdd size={16} /></button>
                <button className="at-icon" onClick={() => setEdit(p)} title="Modifier la phase"><IoCreateOutline size={15} /></button>
                <button className="at-icon danger" onClick={() => delPhase(p)} title="Supprimer la phase"><IoTrashOutline size={15} /></button>
              </div>
            </header>
            <div className="rm-prog"><span style={{ width: pct + "%" }} /></div>
            <div className="rm-track">
              {ms.length ? ms.map((m) => <Node key={m.id} m={m} />) : <p className="at-empty">Aucun jalon. Ajoute la première étape.</p>}
            </div>
          </section>
        );
      })}

      {loose.length > 0 && (
        <section className="rm-phase" style={{ "--u": "var(--warm)" }}>
          <header className="rm-phase-h"><div className="rm-phase-t"><h2>Jalons libres</h2><small className="mono">SANS PHASE</small></div></header>
          <div className="rm-track">{loose.map((m) => <Node key={m.id} m={m} />)}</div>
        </section>
      )}
    </div>
  );
}
