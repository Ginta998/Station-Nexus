import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoAdd, IoCheckmark, IoTrashOutline, IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { todayStr, isOeuvre, stripHtml } from "@/lib/atelier";
import { listJournal } from "@/lib/api";
import { pressMenu, showMenu } from "@/components/atelier/ContextMenu";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";
import BunnySprite from "@/components/atelier/BunnySprite";
import { relLabel, nextSunday } from "@/lib/publish";
import "@/components/atelier/station.css";
import "@/components/atelier/cockpit.css";

/*
  Le Cockpit qui se remplit tout seul : rien à paramétrer.
  - Aujourd'hui : Bunny dit ce qui compte, trois choses à faire, la semaine, ce qui sort bientôt.
  - Tableau (À faire / En cours / Fait), Calendrier (le mois), Liste (tout, filtrable).
  - Modèles : de belles cartes ; un clic, une date de sortie, et les étapes se créent avec leurs dates comptées à rebours.
*/
export const statusOf = (t) => (t.done ? "done" : t.status === "doing" ? "doing" : "todo");
const iso = (d) => d.toLocaleDateString("sv-SE");
const addDays = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return iso(d); };
const fday = (s) => (s ? new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "");

// ---- les modèles fournis (étapes : [titre, jours avant la sortie])
export const TEMPLATES = [
  { k: "sunday", t: "Sortie du dimanche", d: "Un chapitre prêt pour dimanche, sans rush.", kj: "日", tone: "amber", ask: "Quel chapitre ?", def: "Chapitre",
    steps: [["Écrire le premier jet", -6], ["Relire et couper", -3], ["Choisir l'artwork", -2], ["Programmer la sortie dans l'atelier", -1], ["Annoncer sur les réseaux", 0]] },
  { k: "vertical", t: "Épisode vertical", d: "De l'idée au Short programmé : script, tournage, montage.", kj: "縦", tone: "rose", ask: "Quel épisode ?", def: "Épisode",
    steps: [["Écrire le script", -10], ["Préparer le tournage", -8], ["Tourner", -7], ["Monter", -4], ["Sous-titres", -3], ["Miniature et titre", -2], ["Programmer l'épisode", -1], ["Annoncer", 0]] },
  { k: "reel", t: "Reel", d: "Une idée, une accroche, un CTA. En trois jours.", kj: "映", tone: "violet", ask: "Le sujet du Reel ?", def: "Reel",
    steps: [["Trouver l'accroche", -3], ["Tourner", -2], ["Monter", -1], ["Publier avec le CTA", 0], ["Répondre aux commentaires", 1]] },
  { k: "film", t: "Tournage", d: "Un court ou un film : de la préparation à l'export.", kj: "撮", tone: "steel", ask: "Quel projet ?", def: "Tournage",
    steps: [["Découpage technique", -21], ["Repérages", -18], ["Casting", -16], ["Plan de travail", -12], ["Tournage", -7], ["Dérushage", -5], ["Montage", -3], ["Son et étalonnage", -1], ["Export et diffusion", 0]] },
  { k: "chapter", t: "Chapitre de roman", d: "Plan, premier jet, réécriture : à ton rythme.", kj: "章", tone: "green", ask: "Quel chapitre ?", def: "Chapitre",
    steps: [["Faire le plan", -5], ["Premier jet", -3], ["Réécriture", -1], ["Publier", 0]] },
  { k: "week", t: "Semaine d'écriture", d: "Trente minutes d'écriture par jour, cinq jours.", kj: "習", tone: "blue", ask: "Sur quoi ?", def: "Écriture",
    steps: [["Écrire 30 min", -4], ["Écrire 30 min", -3], ["Écrire 30 min", -2], ["Écrire 30 min", -1], ["Écrire 30 min", 0]] },
];

async function runTemplate(at, tpl, name, date, universe_id) {
  const group = `${tpl.t} · ${name}`;
  for (let i = 0; i < tpl.steps.length; i++) {
    const [title, off] = tpl.steps[i];
    await at.saveTask({ title, due: addDays(date, off), group, order: i, universe_id: universe_id || null, status: "todo", priority: off === 0 ? "high" : "normal" });
  }
  toast.success(`${tpl.steps.length} étapes créées · ${group}`);
}

// ---- ce que le Cockpit sait tout seul (sans rien paramétrer)
function useSignals(at) {
  const today = todayStr();
  const { data: jall = [] } = useQuery({ queryKey: ["journal", "atelier"], queryFn: () => listJournal({ limit: 500 }) });
  return useMemo(() => {
    const tasks = at.tasks.filter((t) => !t.done);
    const late = tasks.filter((t) => t.due && t.due < today);
    const now = tasks.filter((t) => t.due === today);
    const doing = tasks.filter((t) => t.status === "doing");
    const releases = at.items.flatMap((it) => [it.fields?.published].filter(Boolean).filter((p) => p.release_at && new Date(p.release_at) > new Date()).map((p) => ({ it, p })))
      .sort((a, b) => a.p.release_at.localeCompare(b.p.release_at));
    const linkedOf = (it) => at.items.find((o) => o.id === it.fields?.oeuvre_id)?.fields?.creation_id;
    const ready = at.items.filter((it) => !isOeuvre(it) && it.kind !== "file" && !it.fields?.published && !it.fields?.published_j && linkedOf(it) && stripHtml(it.content || "").trim().length > 200);
    const drafts = jall.filter((e) => !e.published);
    const events = at.records.filter((r) => r.rk === "events" && r.date >= today).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    return { today, late, now, doing, releases, ready, drafts, events };
  }, [at.tasks, at.items, at.records, jall, today]);
}

// trois choses, pas quarante : en retard d'abord, puis aujourd'hui, puis ce qui prépare la prochaine sortie, puis ce qui est prêt
function picks(sg) {
  const out = [];
  sg.late.slice(0, 2).forEach((t) => out.push({ k: "task", t, why: `En retard depuis ${fday(t.due)}` }));
  sg.now.forEach((t) => out.length < 3 && out.push({ k: "task", t, why: "Prévu aujourd'hui" }));
  sg.doing.forEach((t) => out.length < 3 && !out.some((x) => x.t?.id === t.id) && out.push({ k: "task", t, why: "En cours" }));
  if (out.length < 3 && sg.ready.length) out.push({ k: "ready", it: sg.ready[0], why: `${sg.ready.length} document${sg.ready.length > 1 ? "s" : ""} prêt${sg.ready.length > 1 ? "s" : ""} à partir` });
  if (out.length < 3 && sg.drafts.length) out.push({ k: "draft", e: sg.drafts[0], why: `${sg.drafts.length} brouillon${sg.drafts.length > 1 ? "s" : ""} dans le journal` });
  return out.slice(0, 3);
}
function bunnyLine(sg) {
  const h = new Date().getHours(); const hi = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  if (sg.late.length) return `${hi}. ${sg.late.length} chose${sg.late.length > 1 ? "s ont" : " a"} glissé. On commence par là, doucement.`;
  if (sg.releases.length) { const r = sg.releases[0]; return `${hi}. Prochaine sortie : « ${r.it.title} », ${relLabel(r.p.release_at)}. Tout est en place ?`; }
  if (sg.now.length) return `${hi}. ${sg.now.length} chose${sg.now.length > 1 ? "s" : ""} prévue${sg.now.length > 1 ? "s" : ""} aujourd'hui. Le reste peut attendre.`;
  if (sg.ready.length) return `${hi}. « ${sg.ready[0].title} » a l'air prêt. Tu le programmes pour dimanche ?`;
  return `${hi}. Rien d'urgent. Bon moment pour créer, ou pour lancer un modèle.`;
}

// ---------------------------------------------------------------- les vues
export function CockpitToday({ at, open, go, setTab }) {
  const sg = useSignals(at); const ps = picks(sg);
  const week = Array.from({ length: 7 }, (_, i) => addDays(sg.today, i));
  const toggle = (t) => at.saveTask({ ...t, done: !t.done, status: t.done ? "todo" : "done" });
  return (
    <div className="ck" data-testid="cockpit-today">
      <div className="ck-bunny"><BunnySprite pose={sg.late.length ? "sad" : sg.releases.length ? "excited" : "wave"} size={74} /><p data-testid="cockpit-bunny">{bunnyLine(sg)}</p></div>
      <p className="ck-k mono">AUJOURD'HUI · TROIS CHOSES</p>
      <div className="ck-picks">
        {ps.length === 0 && <div className="ck-pick calm"><b>Rien d'imposé aujourd'hui.</b><small>Lance un modèle, ou écris sans objectif.</small><button className="at-btn ghost" onClick={() => setTab("templates")}>Voir les modèles</button></div>}
        {ps.map((x, i) => (
          <div key={i} className={"ck-pick" + (x.k === "task" && x.t.due < sg.today ? " late" : "")} data-testid={`cockpit-pick-${i}`}>
            <small className="mono">{x.why.toUpperCase()}</small>
            {x.k === "task" && <><b>{x.t.title}</b>{x.t.group && <em>{x.t.group}</em>}<button className="at-btn" onClick={() => toggle(x.t)}><IoCheckmark size={15} /> C'est fait</button></>}
            {x.k === "ready" && <><b>{x.it.title}</b><em>Prêt à partir sur la station</em><button className="at-btn" onClick={() => go({ name: "publish" })}>Ouvrir Publication</button></>}
            {x.k === "draft" && <><b>{x.e.title}</b><em>Brouillon du journal</em><button className="at-btn" onClick={() => go({ name: "journal", edit: x.e.id })}>Le finir</button></>}
          </div>
        ))}
      </div>
      <p className="ck-k mono">CETTE SEMAINE</p>
      <div className="ck-week">
        {week.map((d) => { const ts = at.tasks.filter((t) => t.due === d); const rs = sg.releases.filter((r) => iso(new Date(r.p.release_at)) === d); const ev = sg.events.filter((e) => e.date === d); return (
          <div key={d} className={"ck-day" + (d === sg.today ? " now" : "")}>
            <p className="mono">{fday(d).toUpperCase()}</p>
            {rs.map((r) => <span key={r.it.id} className="ck-rel">▶ {r.it.title}</span>)}
            {ev.map((e) => <span key={e.id} className="ck-ev">{e.time ? e.time + " · " : ""}{e.title}</span>)}
            {ts.slice(0, 4).map((t) => <button key={t.id} className={"ck-t" + (t.done ? " done" : "")} onClick={() => toggle(t)} title={t.group}>{t.title}</button>)}
            {ts.length > 4 && <small>+{ts.length - 4}</small>}
          </div>); })}
      </div>
      {(sg.releases.length > 0 || sg.ready.length > 0 || sg.drafts.length > 0) && <>
        <p className="ck-k mono">CE QUI ARRIVE SUR LA STATION</p>
        <div className="ck-feed">
          {sg.releases.slice(0, 4).map((r) => <button key={r.it.id + r.p.chapter_id} onClick={() => go({ name: "publish" })}><i>▶</i><b>{r.it.title}</b><small>{relLabel(r.p.release_at)}</small></button>)}
          {sg.ready.slice(0, 3).map((it) => <button key={it.id} onClick={() => open(it.id)}><i>✓</i><b>{it.title}</b><small>prêt à partir</small></button>)}
          {sg.drafts.slice(0, 3).map((e) => <button key={e.id} onClick={() => go({ name: "journal", edit: e.id })}><i>✎</i><b>{e.title}</b><small>brouillon du journal</small></button>)}
        </div>
      </>}
    </div>
  );
}

function TaskCard({ at, t, onEdit }) {
  const menu = () => ({ title: t.title, entries: [
    { id: "doing", label: "En cours", onClick: () => at.saveTask({ ...t, status: "doing", done: false }) },
    { id: "done", label: "Fait", onClick: () => at.saveTask({ ...t, status: "done", done: true }) },
    { id: "todo", label: "À faire", onClick: () => at.saveTask({ ...t, status: "todo", done: false }) },
    { id: "edit", label: "Modifier…", onClick: () => onEdit(t) },
    "-", { id: "del", label: "Supprimer", danger: true, onClick: async () => (await labConfirm(`Supprimer « ${t.title} » ?`)) && at.removeTask(t.id) },
  ] });
  return (
    <div className={"ck-card" + (t.due && t.due < todayStr() && !t.done ? " late" : "")} draggable onDragStart={(e) => e.dataTransfer.setData("text/ck-task", t.id)} {...pressMenu(menu)} onClick={() => onEdit(t)} data-testid={`cockpit-card-${t.id}`}>
      <b>{t.title}</b>
      <small className="mono">{[t.group, t.due && fday(t.due)].filter(Boolean).join(" · ")}</small>
    </div>
  );
}

export function CockpitBoard({ at, onEdit }) {
  const cols = [["todo", "À faire"], ["doing", "En cours"], ["done", "Fait"]];
  const drop = (st) => (e) => { const id = e.dataTransfer.getData("text/ck-task"); const t = at.tasks.find((x) => x.id === id); if (t && statusOf(t) !== st) at.saveTask({ ...t, status: st, done: st === "done" }); };
  return (
    <div className="ck-board" data-testid="cockpit-board">
      {cols.map(([st, label]) => { const ts = at.tasks.filter((t) => statusOf(t) === st).sort((a, b) => (a.due || "9").localeCompare(b.due || "9")); const shown = st === "done" ? ts.slice(-20).reverse() : ts; return (
        <div key={st} className={"ck-col c-" + st} onDragOver={(e) => e.preventDefault()} onDrop={drop(st)}>
          <p className="mono">{label.toUpperCase()} <i>{ts.length}</i></p>
          {shown.map((t) => <TaskCard key={t.id} at={at} t={t} onEdit={onEdit} />)}
          {st === "todo" && <button className="ck-add" onClick={() => onEdit({ title: "", due: "", status: "todo" })} data-testid="cockpit-add"><IoAdd /> Ajouter</button>}
        </div>); })}
    </div>
  );
}

export function CockpitCalendar({ at, onEdit }) {
  const [m, setM] = useState(() => todayStr().slice(0, 7));
  const first = new Date(m + "-01T12:00:00"); const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return iso(d); });
  const rels = at.items.flatMap((it) => [it.fields?.published].filter((p) => p?.release_at).map((p) => ({ it, d: iso(new Date(p.release_at)) })));
  const shift = (n) => { const d = new Date(m + "-01T12:00:00"); d.setMonth(d.getMonth() + n); setM(iso(d).slice(0, 7)); };
  return (
    <div className="ck-cal" data-testid="cockpit-calendar">
      <div className="ck-cal-h"><button className="at-icon" onClick={() => shift(-1)}><IoChevronBack /></button><b>{first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</b><button className="at-icon" onClick={() => shift(1)}><IoChevronForward /></button></div>
      <div className="ck-grid">
        {["lun", "mar", "mer", "jeu", "ven", "sam", "dim"].map((d) => <p key={d} className="mono">{d.toUpperCase()}</p>)}
        {days.map((d) => { const ts = at.tasks.filter((t) => t.due === d); const rs = rels.filter((r) => r.d === d); const ev = at.records.filter((r) => r.rk === "events" && r.date === d); return (
          <div key={d} className={"ck-cell" + (d.slice(0, 7) !== m ? " out" : "") + (d === todayStr() ? " now" : "")} onDoubleClick={() => onEdit({ title: "", due: d, status: "todo" })}
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const t = at.tasks.find((x) => x.id === e.dataTransfer.getData("text/ck-task")); if (t) at.saveTask({ ...t, due: d }); }}>
            <span className="mono n">{+d.slice(8)}</span>
            {rs.map((r) => <span key={r.it.id} className="ck-rel">▶ {r.it.title}</span>)}
            {ev.map((e) => <span key={e.id} className="ck-ev">{e.title}</span>)}
            {ts.slice(0, 3).map((t) => <button key={t.id} className={"ck-t" + (t.done ? " done" : "")} draggable onDragStart={(e) => e.dataTransfer.setData("text/ck-task", t.id)} onClick={() => onEdit(t)}>{t.title}</button>)}
            {ts.length > 3 && <small>+{ts.length - 3}</small>}
          </div>); })}
      </div>
      <p className="ck-hint mono">DOUBLE-CLIC SUR UN JOUR : NOUVELLE TÂCHE · GLISSER UNE TÂCHE : CHANGER SA DATE</p>
    </div>
  );
}

export function CockpitList({ at, onEdit }) {
  const [q, setQ] = useState(""); const [st, setSt] = useState("open"); const [u, setU] = useState("");
  const ts = at.tasks.filter((t) => (st === "all" || (st === "open" ? !t.done : t.done)) && (!u || t.universe_id === u) && (!q || `${t.title} ${t.group}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
  const groups = {}; ts.forEach((t) => { (groups[t.group || "Sans lot"] = groups[t.group || "Sans lot"] || []).push(t); });
  return (
    <div className="ck-list" data-testid="cockpit-list">
      <div className="ck-filters">
        <input placeholder="Chercher…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={st} onChange={(e) => setSt(e.target.value)}><option value="open">À faire</option><option value="done">Faites</option><option value="all">Toutes</option></select>
        <select value={u} onChange={(e) => setU(e.target.value)}><option value="">Tous les univers</option>{at.universes.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <button className="at-btn" onClick={() => onEdit({ title: "", due: "", status: "todo" })}><IoAdd /> Tâche</button>
      </div>
      {Object.entries(groups).map(([g, xs]) => (
        <div key={g} className="ck-lg"><p className="mono">{g.toUpperCase()} <i>{xs.filter((t) => t.done).length}/{xs.length}</i></p>
          {xs.map((t) => <div key={t.id} className={"ck-row" + (t.done ? " done" : "") + (t.due && t.due < todayStr() && !t.done ? " late" : "")} {...pressMenu(() => ({ title: t.title, entries: [{ id: "edit", label: "Modifier…", onClick: () => onEdit(t) }, { id: "del", label: "Supprimer", danger: true, onClick: () => at.removeTask(t.id) }] }))}>
            <button className="ck-cb" onClick={() => at.saveTask({ ...t, done: !t.done, status: t.done ? "todo" : "done" })} aria-label="Fait">{t.done && <IoCheckmark />}</button>
            <button className="ck-rt" onClick={() => onEdit(t)}><b>{t.title}</b>{t.status === "doing" && !t.done && <em>EN COURS</em>}</button>
            <small className="mono">{fday(t.due)}</small>
          </div>)}
        </div>
      ))}
      {ts.length === 0 && <p className="at-empty">Rien ici.</p>}
    </div>
  );
}

export function CockpitTemplates({ at }) {
  const [pick, setPick] = useState(null); const [name, setName] = useState(""); const [date, setDate] = useState(nextSunday().slice(0, 10)); const [u, setU] = useState("");
  const mine = at.records.filter((r) => r.rk === "tpl").map((r) => ({ ...r, mine: true }));
  const all = [...TEMPLATES, ...mine];
  const go = async () => { if (!pick) return; await runTemplate(at, pick, name.trim() || pick.def, date, u); setPick(null); setName(""); };
  // créer son propre modèle : un nom, puis une étape par ligne (« Monter -3 » = trois jours avant la sortie)
  const makeOwn = async () => {
    const t = await labPrompt("Nom du modèle", "Mon modèle"); if (!t) return;
    const raw = await labPrompt("Une étape par ligne, avec le nombre de jours avant la sortie (ex. « Écrire -5 », « Publier 0 »)", "Écrire -5\nRelire -2\nPublier 0"); if (!raw) return;
    const steps = raw.split(/\n|;/).map((l) => l.trim()).filter(Boolean).map((l) => { const m = l.match(/^(.*?)\s*(-?\d+)\s*$/); return m ? [m[1].trim(), +m[2]] : [l, 0]; });
    await at.saveRecord("tpl", { k: "own-" + Date.now(), t, d: `${steps.length} étapes`, kj: t.slice(0, 1).toUpperCase(), tone: "steel", ask: "Pour quoi ?", def: t, steps });
    toast.success("Modèle enregistré");
  };
  return (
    <div className="ck-tpls" data-testid="cockpit-templates">
      <div className="ck-tgrid">
        {all.map((tp) => (
          <button key={tp.k || tp.id} className={"ck-tpl t-" + (tp.tone || "steel") + (pick === tp ? " on" : "")} onClick={() => { setPick(tp); setName(""); setTimeout(() => document.querySelector(".ck-run")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60); }} {...(tp.mine ? pressMenu(() => ({ title: tp.t, entries: [{ id: "del", label: "Supprimer le modèle", danger: true, onClick: () => at.removeRecord("tpl", tp.id) }] })) : {})} data-testid={`cockpit-tpl-${tp.k}`}>
            <span className="kj">{tp.kj}</span><b>{tp.t}</b><small>{tp.d}</small><em className="mono">{tp.steps.length} ÉTAPES{tp.mine ? " · À TOI" : ""}</em>
          </button>
        ))}
        <button className="ck-tpl own" onClick={makeOwn} data-testid="cockpit-tpl-new"><span className="kj">＋</span><b>Créer un modèle</b><small>Tes propres étapes, réutilisables.</small></button>
      </div>
      {pick && (
        <div className="ck-run" data-testid="cockpit-run">
          <header><b>{pick.t}</b><button className="at-icon" onClick={() => setPick(null)}><IoClose /></button></header>
          <div className="ck-run-f">
            <label>{pick.ask}<input value={name} onChange={(e) => setName(e.target.value)} placeholder={pick.def} autoFocus data-testid="cockpit-run-name" /></label>
            <label>Date de sortie<input type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="cockpit-run-date" /></label>
            <label>Univers<select value={u} onChange={(e) => setU(e.target.value)}><option value="">—</option>{at.universes.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          </div>
          <ol className="ck-steps">{pick.steps.map(([t, off], i) => <li key={i}><span className="mono">{fday(addDays(date, off))}</span>{t}</li>)}</ol>
          <button className="at-btn" onClick={go} data-testid="cockpit-run-go"><IoAdd /> Créer les {pick.steps.length} étapes</button>
        </div>
      )}
    </div>
  );
}

// une tâche : titre, date, état, lot, notes (rien d'obligatoire à part le titre)
export function TaskEditor({ at, t, onClose }) {
  const [v, setV] = useState({ ...t, status: statusOf(t) });
  const save = async () => { if (!v.title.trim()) return toast.error("Un titre"); await at.saveTask({ ...v, done: v.status === "done" }); onClose(); };
  return (
    <div className="st-dlg-wrap" onClick={onClose}>
      <div className="st-dlg ck-ed" onClick={(e) => e.stopPropagation()} data-testid="cockpit-task-editor">
        <header><p className="mono st-k">{t.id ? "TÂCHE" : "NOUVELLE TÂCHE"}</p><input className="ck-ed-t" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="Ce qu'il faut faire" autoFocus data-testid="cockpit-task-title" /></header>
        <div className="st-row">
          <label>Date<input type="date" value={v.due || ""} onChange={(e) => setV({ ...v, due: e.target.value })} /></label>
          <label>État<select value={v.status} onChange={(e) => setV({ ...v, status: e.target.value })}><option value="todo">À faire</option><option value="doing">En cours</option><option value="done">Fait</option></select></label>
          <label>Lot<input value={v.group || ""} onChange={(e) => setV({ ...v, group: e.target.value })} placeholder="ex. Épisode 4" /></label>
        </div>
        <label>Notes<textarea rows={3} value={v.notes || ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></label>
        <footer>{t.id && <button className="at-btn ghost" onClick={async () => { if (await labConfirm("Supprimer cette tâche ?")) { await at.removeTask(t.id); onClose(); } }}><IoTrashOutline /> Supprimer</button>}<span style={{ flex: 1 }} /><button className="at-btn ghost" onClick={onClose}>Annuler</button><button className="at-btn" onClick={save} data-testid="cockpit-task-save">Enregistrer</button></footer>
      </div>
    </div>
  );
}
