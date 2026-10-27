import { useMemo, useState } from "react";
import { IoSend, IoArrowForward, IoPlay } from "react-icons/io5";
import { toast } from "sonner";
import { KINDS, imgSrc, todayStr, stripHtml } from "@/lib/atelier";
import ItemCard from "@/components/atelier/ItemCard";
import { TaskRow } from "@/components/atelier/TasksView";
import BunnyBriefing from "@/components/atelier/BunnyBriefing";

const greet = (h) => (h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir");

// Le Pont : poste de commandement — reprise, capture, cap du jour, univers actifs
export default function QuartierView({ at, go, open }) {
  const [idea, setIdea] = useState("");
  const today = todayStr();
  const focus = at.tasks.filter((t) => !t.done && t.due && t.due <= today).sort((a, b) => a.due.localeCompare(b.due));
  const next = at.tasks.filter((t) => !t.done && (!t.due || t.due > today)).slice(0, Math.max(0, 5 - focus.length));
  const [last, ...recent] = at.items;
  const words = useMemo(() => stripHtml(at.items.map((i) => i.content).join(" ")).split(" ").filter(Boolean).length, [at.items]);
  const active = useMemo(() => {
    const seen = new Set(); const out = at.universes.filter((u) => u.pinned);
    out.forEach((u) => seen.add(u.id));
    at.items.forEach((i) => { const u = at.universes.find((x) => x.id === i.universe_id); if (u && !seen.has(u.id)) { seen.add(u.id); out.push(u); } });
    return out.slice(0, 6);
  }, [at.universes, at.items]);
  const lastU = last && at.universes.find((u) => u.id === last.universe_id);

  const capture = async (e) => {
    e.preventDefault();
    const text = idea.trim(); if (!text) return;
    const [first, ...rest] = text.split("\n");
    await at.createItem({ kind: "note", title: first.slice(0, 120), content: rest.length ? `<p>${rest.join("<br/>")}</p>` : "" });
    setIdea(""); toast.success("Idée capturée dans l'Inbox");
  };
  const stats = [["UNIVERS", at.universes.length], ["ÉLÉMENTS", at.items.length], ["MOTS ÉCRITS", words.toLocaleString("fr-FR")], ["TÂCHES ACTIVES", at.tasks.filter((t) => !t.done).length]];

  return (
    <section className="at-view" data-testid="atelier-home">
      <header className="at-bridge">
        <div className="at-holo" aria-hidden="true"><i /><i /><i /><b>天</b></div>
        <div>
          <p className="at-eyebrow mono">// PONT DE COMMANDEMENT · STATION NEXUS</p>
          <h1>{greet(new Date().getHours())}, Brichel.</h1>
          <p className="at-sub">{focus.length ? `${focus.length} objectif${focus.length > 1 ? "s" : ""} au cap aujourd'hui.` : "Aucune urgence à bord. Le pont est à toi."}</p>
          <div className="at-stats">{stats.map(([l, v]) => <div key={l}><b>{v}</b><small className="mono">{l}</small></div>)}</div>
        </div>
      </header>

      <BunnyBriefing />

      <form className="at-capture" onSubmit={capture} data-testid="atelier-capture">
        <textarea rows={1} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Une idée traverse le pont ? Capture-la…"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) capture(e); }} data-testid="atelier-capture-input" />
        <button type="submit" className="at-btn" data-testid="atelier-capture-btn"><IoSend size={15} /> Capturer</button>
      </form>

      {last && (
        <button className="at-resume" onClick={() => open(last.id)} style={{ "--u": lastU?.color || "var(--brand)" }} data-testid="atelier-resume">
          {last.image ? <img src={imgSrc(last.image)} alt="" /> : <span className="k">{KINDS[last.kind]?.kanji}</span>}
          <span className="tx">
            <small className="mono">REPRENDRE · {KINDS[last.kind]?.label.toUpperCase()}{lastU ? ` · ${lastU.name.toUpperCase()}` : ""}</small>
            <b>{last.title || "Sans titre"}</b>
            <em>{stripHtml(last.content).slice(-160) || "Page encore blanche — c'est le moment."}</em>
          </span>
          <span className="go"><IoPlay size={18} /></span>
        </button>
      )}

      <div className="at-cols">
        <div className="at-panel">
          <div className="at-panel-h"><h2>Cap du jour</h2><span className="at-link" onClick={() => go({ name: "tasks" })}>Cockpit <IoArrowForward size={12} /></span></div>
          {focus.length + next.length === 0 && <p className="at-empty">Aucune tâche. Crée-en depuis une scène ou le cockpit.</p>}
          {[...focus, ...next].map((t) => <TaskRow key={t.id} t={t} at={at} open={open} compact />)}
        </div>
        <div className="at-panel">
          <div className="at-panel-h"><h2>Univers actifs</h2><span className="at-link" onClick={() => go({ name: "universes" })} data-testid="atelier-home-all-universes">Toutes les archives <IoArrowForward size={12} /></span></div>
          {active.length === 0 && <p className="at-empty">Ouvre les archives pour créer ton premier univers.</p>}
          <div className="at-unis">
            {active.map((u) => (
              <button key={u.id} className="at-uni" onClick={() => go({ name: "universe", id: u.id })} style={{ "--u": u.color || "var(--brand)" }} data-testid={`atelier-home-universe-${u.id}`}>
                {u.cover ? <img src={imgSrc(u.cover)} alt="" /> : <span className="k">{u.kanji || u.name[0]}</span>}
                <span className="t"><b>{u.name}</b><small>{at.items.filter((i) => i.universe_id === u.id).length} éléments</small></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="at-panel">
          <div className="at-panel-h"><h2>Journal de bord récent</h2></div>
          <div className="at-grid">{recent.slice(0, 6).map((i) => <ItemCard key={i.id} it={i} at={at} open={open} />)}</div>
        </div>
      )}
    </section>
  );
}
