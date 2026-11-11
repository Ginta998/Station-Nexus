import { useState } from "react";
import { IoAdd, IoTrashOutline, IoCreateOutline, IoCheckmark, IoMailOutline, IoCallOutline } from "react-icons/io5";
import { toast } from "sonner";
import { todayStr } from "@/lib/atelier";
import TasksView from "@/components/atelier/TasksView";
import RoadmapView from "@/components/atelier/RoadmapView";
import GCalPanel from "@/components/atelier/GCalPanel";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";

const STATUS = [["active", "En cours"], ["done", "Atteint"], ["pause", "En pause"]];
const SPEC = {
  goals: { label: "Objectif", fields: [["title", "Objectif", "text"], ["due", "Échéance", "date"], ["progress", "Avancement %", "number"], ["status", "Statut", "status"], ["universe_id", "Univers", "universe"], ["notes", "Notes", "area"]], req: "title" },
  events: { label: "Rendez-vous", fields: [["title", "Titre", "text"], ["date", "Date", "date"], ["time", "Heure", "time"], ["place", "Lieu / lien visio", "text"], ["universe_id", "Univers", "universe"], ["notes", "Notes", "area"]], req: "title" },
  budget: { label: "Mouvement", fields: [["label", "Libellé", "text"], ["amount", "Montant (€)", "number"], ["type", "Type", "flow"], ["date", "Date", "date"], ["universe_id", "Projet / univers", "universe"], ["notes", "Notes", "area"]], req: "label" },
  contacts: { label: "Collaborateur", fields: [["name", "Nom", "text"], ["role", "Rôle (illustratrice, monteur, éditeur…)", "text"], ["email", "E-mail", "email"], ["phone", "Téléphone", "tel"], ["universe_id", "Projet / univers", "universe"], ["notes", "Notes", "area"]], req: "name" },
};
const eur = (n) => (Number(n) || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const fdate = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "");

function RecordForm({ rk, at, rec, onDone }) {
  const [v, setV] = useState(rec);
  const spec = SPEC[rk];
  const save = async () => {
    if (!String(v[spec.req] || "").trim()) return toast.error("Champ principal requis");
    await at.saveRecord(rk, { ...v, amount: v.amount !== undefined ? Number(v.amount) || 0 : v.amount, progress: v.progress !== undefined ? Math.max(0, Math.min(100, Number(v.progress) || 0)) : v.progress });
    toast.success("Enregistré"); onDone();
  };
  const input = ([k, l, t]) => {
    const common = { value: v[k] ?? "", onChange: (e) => setV({ ...v, [k]: e.target.value }), "data-testid": `cockpit-${rk}-${k}` };
    if (t === "area") return <label key={k} className="wide">{l}<textarea rows={2} {...common} /></label>;
    if (t === "universe") return <label key={k}>{l}<select {...common}><option value="">—</option>{at.universes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>;
    if (t === "status") return <label key={k}>{l}<select {...common}>{STATUS.map(([s, n]) => <option key={s} value={s}>{n}</option>)}</select></label>;
    if (t === "flow") return <label key={k}>{l}<select {...common}><option value="income">Entrée</option><option value="expense">Dépense</option></select></label>;
    return <label key={k}>{l}<input type={t} {...common} /></label>;
  };
  return (
    <div className="at-panel at-recform" data-testid={`cockpit-${rk}-form`}>
      <div className="at-form grid">{spec.fields.map(input)}</div>
      <div className="at-inline"><button className="at-btn" onClick={save} data-testid={`cockpit-${rk}-save`}><IoCheckmark size={15} /> Enregistrer</button><button className="at-btn ghost" onClick={onDone}>Annuler</button></div>
    </div>
  );
}

function Row({ rk, r, at, onEdit }) {
  const u = at.universes.find((x) => x.id === r.universe_id);
  const meta = u && <span style={{ color: u.color }}>{u.name}</span>;
  let main;
  if (rk === "goals") main = <><b>{r.title}</b><div className="at-prog"><span style={{ width: `${r.progress || 0}%` }} /></div><small className="mono">{r.progress || 0}% · {STATUS.find((s) => s[0] === (r.status || "active"))?.[1]}{r.due ? ` · ${fdate(r.due)}` : ""} {meta}</small></>;
  if (rk === "events") main = <><b>{r.title}</b><small className="mono">{fdate(r.date)}{r.time ? ` · ${r.time}` : ""}{r.place ? ` · ${r.place}` : ""} {meta}</small></>;
  if (rk === "budget") main = <><b>{r.label}</b><small className="mono">{fdate(r.date)} {meta}</small></>;
  if (rk === "contacts") main = <><b>{r.name}</b><small className="mono">{r.role} {meta}</small></>;
  return (
    <div className="at-rec" data-testid={`cockpit-${rk}-row-${r.id}`}>
      <div className="tx">{main}</div>
      {rk === "budget" && <span className={"amt " + (r.type === "expense" ? "neg" : "pos")}>{r.type === "expense" ? "−" : "+"}{eur(r.amount)}</span>}
      {rk === "contacts" && <span className="acts">{r.email && <a className="at-icon" href={`mailto:${r.email}`} title={r.email}><IoMailOutline size={15} /></a>}{r.phone && <a className="at-icon" href={`tel:${r.phone}`} title={r.phone}><IoCallOutline size={15} /></a>}</span>}
      <button className="at-icon" onClick={() => onEdit(r)} aria-label="Modifier"><IoCreateOutline size={15} /></button>
      <button className="at-icon danger" onClick={async () => (await labConfirm("Supprimer ?")) && at.removeRecord(rk, r.id)} aria-label="Supprimer"><IoTrashOutline size={15} /></button>
    </div>
  );
}

function RecordTab({ rk, at }) {
  const [edit, setEdit] = useState(null);
  const today = todayStr();
  let list = at.records.filter((r) => r.rk === rk && !(rk === "goals" && r.road));
  if (rk === "events") list = list.sort((a, b) => (a.date || "9").localeCompare(b.date || "9"));
  if (rk === "budget") list = list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  if (rk === "contacts") list = list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "fr"));
  const upcoming = rk === "events" ? list.filter((e) => !e.date || e.date >= today) : list;
  const past = rk === "events" ? list.filter((e) => e.date && e.date < today).reverse() : [];
  const defaults = { goals: { status: "active", progress: 0 }, events: { date: today }, budget: { type: "expense", date: today, amount: 0 }, contacts: {} }[rk];
  const inc = list.filter((r) => r.type !== "expense").reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const exp = list.filter((r) => r.type === "expense").reduce((s, r) => s + (Number(r.amount) || 0), 0);
  return (
    <div className="at-view">
      {rk === "budget" && <div className="at-stats big"><div><b>{eur(inc)}</b><small className="mono">ENTRÉES</small></div><div><b>{eur(exp)}</b><small className="mono">DÉPENSES</small></div><div><b className={inc - exp < 0 ? "neg" : ""}>{eur(inc - exp)}</b><small className="mono">SOLDE</small></div></div>}
      {!edit && <div className="at-newbar"><button className="at-btn" onClick={() => setEdit(defaults)} data-testid={`cockpit-${rk}-new`}><IoAdd size={16} /> {SPEC[rk].label}</button></div>}
      {edit && <RecordForm rk={rk} at={at} rec={edit} onDone={() => setEdit(null)} />}
      <div className="at-panel">
        {upcoming.length === 0 && <p className="at-empty">Rien pour l'instant.</p>}
        {upcoming.map((r) => <Row key={r.id} rk={rk} r={r} at={at} onEdit={setEdit} />)}
      </div>
      {past.length > 0 && <div className="at-panel"><div className="at-panel-h"><h2>Passés</h2></div>{past.map((r) => <Row key={r.id} rk={rk} r={r} at={at} onEdit={setEdit} />)}</div>}
    </div>
  );
}

function Overview({ at, setTab }) {
  const today = todayStr();
  const ev = at.records.filter((r) => r.rk === "events" && r.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const goals = at.records.filter((r) => r.rk === "goals" && !r.road && r.status !== "done").slice(0, 5);
  const late = at.tasks.filter((t) => !t.done && t.due && t.due < today).length;
  const month = today.slice(0, 7);
  const bm = at.records.filter((r) => r.rk === "budget" && (r.date || "").startsWith(month));
  const sold = bm.reduce((s, r) => s + (r.type === "expense" ? -1 : 1) * (Number(r.amount) || 0), 0);
  return (
    <div className="at-view">
      <div className="at-stats big">
        <div onClick={() => setTab("tasks")}><b className={late ? "neg" : ""}>{late}</b><small className="mono">TÂCHES EN RETARD</small></div>
        <div onClick={() => setTab("events")}><b>{ev.length}</b><small className="mono">RENDEZ-VOUS À VENIR</small></div>
        <div onClick={() => setTab("goals")}><b>{goals.length}</b><small className="mono">OBJECTIFS ACTIFS</small></div>
        <div onClick={() => setTab("budget")}><b className={sold < 0 ? "neg" : ""}>{eur(sold)}</b><small className="mono">SOLDE DU MOIS</small></div>
      </div>
      <div className="at-cols">
        <div className="at-panel"><div className="at-panel-h"><h2>Prochains rendez-vous</h2></div>{ev.length ? ev.map((r) => <Row key={r.id} rk="events" r={r} at={at} onEdit={() => setTab("events")} />) : <p className="at-empty">Agenda libre.</p>}</div>
        <div className="at-panel"><div className="at-panel-h"><h2>Objectifs en cours</h2></div>{goals.length ? goals.map((r) => <Row key={r.id} rk="goals" r={r} at={at} onEdit={() => setTab("goals")} />) : <p className="at-empty">Fixe-toi un cap : un objectif, une échéance.</p>}</div>
      </div>
    </div>
  );
}

const TABS = [["overview", "Vue d'ensemble"], ["tasks", "Tâches"], ["roadmap", "Roadmap"], ["goals", "Objectifs"], ["events", "Agenda"], ["budget", "Budget"], ["contacts", "Collaborations"]];

// Cockpit de carrière : savoir ce qui avance, ce qui bloque, ce qui approche
export default function CockpitView(props) {
  const [tab, setTab] = useState("overview");
  return (
    <section className="at-view" data-testid="atelier-cockpit">
      <header className="at-head"><p className="at-eyebrow mono">// COCKPIT DE CARRIÈRE</p><h1>Cockpit</h1></header>
      <nav className="at-tabs">{TABS.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} data-testid={`cockpit-tab-${k}`}>{l}</button>)}</nav>
      {tab === "overview" && <Overview at={props.at} setTab={setTab} />}
      {tab === "tasks" && <TasksView {...props} />}
      {tab === "roadmap" && <RoadmapView at={props.at} />}
      {tab === "events" && <div className="at-view"><GCalPanel days={30} /></div>}
      {["goals", "events", "budget", "contacts"].includes(tab) && <RecordTab key={tab} rk={tab} at={props.at} />}
    </section>
  );
}
