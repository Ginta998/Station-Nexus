import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IoAdd, IoTrashOutline, IoCreateOutline, IoCheckmark, IoLogoGoogle, IoOpenOutline } from "react-icons/io5";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";

const get = (u, p) => api.get(u, { params: p }).then((r) => r.data);
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = (iso) => (iso && iso.length > 10 ? new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "");
const dayLabel = (iso) => new Date(iso.length > 10 ? iso : iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const err = (e) => toast.error(e?.response?.data?.detail || "Google Agenda ne répond pas");

function EventForm({ ev, onDone }) {
  const qc = useQueryClient();
  const s = ev.start || ymd(new Date());
  const [v, setV] = useState({ title: ev.title || "", date: s.slice(0, 10), from: hm(ev.start) || "10:00", to: hm(ev.end) || "11:00", allDay: !!ev.allDay, location: ev.location || "", description: ev.description || "" });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const save = async () => {
    if (!v.title.trim()) return toast.error("Donne un titre à l'événement");
    const next = new Date(v.date + "T12:00:00"); next.setDate(next.getDate() + 1);
    const b = { title: v.title.trim(), location: v.location, description: v.description, allDay: v.allDay, tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      start: v.allDay ? v.date : `${v.date}T${v.from}:00`, end: v.allDay ? ymd(next) : `${v.date}T${v.to}:00` };
    try { ev.id ? await api.patch(`/atelier/calendar/events/${ev.id}`, b) : await api.post("/atelier/calendar/events", b); toast.success("Agenda mis à jour"); qc.invalidateQueries({ queryKey: ["gcal"] }); onDone(); } catch (e) { err(e); }
  };
  return (
    <div className="at-panel at-recform" data-testid="gcal-form">
      <div className="at-form grid">
        <label className="wide">Titre<input autoFocus value={v.title} onChange={set("title")} data-testid="gcal-title" /></label>
        <label>Date<input type="date" value={v.date} onChange={set("date")} data-testid="gcal-date" /></label>
        <label className="at-check"><input type="checkbox" checked={v.allDay} onChange={set("allDay")} data-testid="gcal-allday" /> Toute la journée</label>
        {!v.allDay && <><label>Début<input type="time" value={v.from} onChange={set("from")} data-testid="gcal-from" /></label><label>Fin<input type="time" value={v.to} onChange={set("to")} data-testid="gcal-to" /></label></>}
        <label className="wide">Lieu / lien visio<input value={v.location} onChange={set("location")} data-testid="gcal-location" /></label>
        <label className="wide">Notes<textarea rows={2} value={v.description} onChange={set("description")} /></label>
      </div>
      <div className="at-inline"><button className="at-btn" onClick={save} data-testid="gcal-save"><IoCheckmark size={15} /> Enregistrer</button><button className="at-btn ghost" onClick={onDone}>Annuler</button></div>
    </div>
  );
}

// Google Agenda dans le Pont (compact, 7 jours) et le Cockpit (30 jours)
export default function GCalPanel({ days = 7, compact = false }) {
  const qc = useQueryClient();
  const [edit, setEdit] = useState(null);
  const st = useQuery({ queryKey: ["gcal", "status"], queryFn: () => get("/atelier/calendar/status"), retry: 0 });
  const on = !!st.data?.connected;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setDate(end.getDate() + days);
  const evs = useQuery({ queryKey: ["gcal", "events", days], enabled: on, retry: 0, queryFn: () => get("/atelier/calendar/events", { start: now.toISOString(), end: end.toISOString() }) });
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("gcal"); if (!p) return;
    p === "ok" ? toast.success("Google Agenda connecté") : toast.error("Connexion Google Agenda refusée");
    window.history.replaceState(window.history.state, "", window.location.pathname);
  }, []);
  const connect = async () => { try { window.location.href = (await get("/atelier/calendar/connect")).url; } catch (e) { err(e); } };
  const del = async (e) => { if (!(await labConfirm(`Supprimer « ${e.title} » de ton agenda ?`))) return; try { await api.delete(`/atelier/calendar/events/${e.id}`); qc.invalidateQueries({ queryKey: ["gcal"] }); toast.success("Supprimé"); } catch (x) { err(x); } };

  const list = evs.data || [];
  const groups = []; list.forEach((e) => { const d = e.start.slice(0, 10); const g = groups.find((x) => x.d === d); g ? g.items.push(e) : groups.push({ d, items: [e] }); });
  return (
    <div className="at-panel" data-testid="gcal-panel">
      <div className="at-panel-h">
        <h2>Google Agenda</h2>
        {on && !edit && <button className="at-btn ghost" onClick={() => setEdit({})} data-testid="gcal-new"><IoAdd size={15} /> Événement</button>}
      </div>
      {!on ? (
        <div className="at-inline"><p className="at-empty">{st.isLoading ? "…" : "Connecte ton agenda pour voir et gérer tes événements ici."}</p>{!st.isLoading && <button className="at-btn" onClick={connect} data-testid="gcal-connect"><IoLogoGoogle size={15} /> Connecter</button>}</div>
      ) : (
        <>
          {edit && <EventForm ev={edit} onDone={() => setEdit(null)} />}
          {evs.isError && <p className="at-empty">{evs.error?.response?.data?.detail || "Agenda indisponible."} <button className="at-link" onClick={connect}>Reconnecter</button></p>}
          {evs.isSuccess && !list.length && <p className="at-empty">Rien de prévu sur les {days} prochains jours.</p>}
          {groups.map((g) => (
            <div key={g.d} data-testid={`gcal-day-${g.d}`}>
              <p className="at-eyebrow mono" style={{ marginTop: 10, textTransform: "uppercase" }}>{dayLabel(g.d)}</p>
              {(compact ? g.items.slice(0, 4) : g.items).map((e) => (
                <div className="at-rec" key={e.id} data-testid={`gcal-ev-${e.id}`}>
                  <div className="tx"><b>{e.title}</b><small className="mono">{e.allDay ? "Toute la journée" : `${hm(e.start)} – ${hm(e.end)}`}{e.location ? ` · ${e.location}` : ""}</small></div>
                  {e.link && <a className="at-icon" href={e.link} target="_blank" rel="noreferrer" aria-label="Ouvrir dans Google Agenda"><IoOpenOutline size={15} /></a>}
                  <button className="at-icon" onClick={() => setEdit(e)} aria-label="Modifier" data-testid={`gcal-edit-${e.id}`}><IoCreateOutline size={15} /></button>
                  <button className="at-icon danger" onClick={() => del(e)} aria-label="Supprimer" data-testid={`gcal-del-${e.id}`}><IoTrashOutline size={15} /></button>
                </div>
              ))}
            </div>
          ))}
          {!compact && <p className="at-sub mono" style={{ marginTop: 10 }}>{st.data.email} · <button className="at-link" onClick={async () => { await api.delete("/atelier/calendar"); qc.invalidateQueries({ queryKey: ["gcal"] }); }} data-testid="gcal-disconnect">Déconnecter</button></p>}
        </>
      )}
    </div>
  );
}
