import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  IoArrowBack, IoAdd, IoCalendarOutline, IoCreateOutline, IoTrashOutline,
  IoClose, IoSaveOutline, IoChevronForward, IoDownloadOutline, IoLogoGoogle,
  IoRocketOutline, IoImageOutline,
} from "react-icons/io5";
import { listRoadmap, createRoadmap, updateRoadmap, deleteRoadmap, listCreations, posterUrl, getSettings, updateSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/TopBar";

const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };
const primary = { background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" };

const pad = (n) => String(n).padStart(2, "0");
const calDate = (e) => (e.date_type === "approx" ? e.approx_date : e.release_date);
const icsDay = (iso) => { const d = new Date(iso); return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`; };
const nextDay = (iso) => { const d = new Date(iso); d.setDate(d.getDate() + 1); return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`; };

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); } catch { return ""; }
}
function relative(dt) {
  if (!dt) return "";
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dt); d.setHours(0, 0, 0, 0);
  const days = Math.round((d - now) / 86400000);
  if (isNaN(days)) return "";
  if (days < 0) return "Déjà sorti ✓";
  if (days === 0) return "Aujourd'hui ! 🎉";
  if (days === 1) return "Demain";
  if (days < 30) return `Dans ${days} jours`;
  const months = Math.round(days / 30);
  if (months < 12) return `Dans ${months} mois`;
  const years = Math.round(days / 365);
  return `Dans ${years} an${years > 1 ? "s" : ""}`;
}
function downloadICS(e, title) {
  const dt = calDate(e); if (!dt) return toast.error("Cette sortie n'a pas de date pour l'agenda");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Stationexus//Planning//FR", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:${e.id}@stationexus`, `DTSTAMP:${icsDay(new Date().toISOString())}T000000Z`,
    `DTSTART;VALUE=DATE:${icsDay(dt)}`, `DTEND;VALUE=DATE:${nextDay(dt)}`,
    `SUMMARY:Sortie — ${title}`, (e.description || e.subtitle) ? `DESCRIPTION:${String(e.description || e.subtitle).replace(/\n/g, " ")}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = `sortie-${title.replace(/\s+/g, "_")}.ics`; a.click();
  URL.revokeObjectURL(url);
  toast.success("Événement ajouté à ton agenda 📅");
}
function googleCal(e, title) {
  const dt = calDate(e); if (!dt) return "#";
  const params = new URLSearchParams({ action: "TEMPLATE", text: `Sortie — ${title}`, dates: `${icsDay(dt)}/${nextDay(dt)}`, details: e.description || e.subtitle || "Sortie sur Stationexus 🚀" });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function Planning() {
  const nav = useNavigate();
  const { sfx, isAdmin } = useApp();
  const { data: entries = [], isLoading, refetch } = useQuery({ queryKey: ["roadmap"], queryFn: listRoadmap });
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: settings, refetch: refetchSettings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const byId = useMemo(() => Object.fromEntries(creations.map((c) => [c.id, c])), [creations]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editIntro, setEditIntro] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftIntro, setDraftIntro] = useState("");

  const title = settings?.planning_title || "Planning des sorties";
  const intro = settings?.planning_intro || "";

  const posterSrc = (e) => {
    if (e.poster && e.poster.length > 4) return e.poster;
    if (e.creation_id && byId[e.creation_id]) { const c = byId[e.creation_id]; return c.has_poster ? posterUrl(c.id, c.updated_at) : null; }
    return null;
  };
  const entryTitle = (e) => e.title || (e.creation_id && byId[e.creation_id]?.title) || "Sortie à venir";
  const dateChip = (e) => (e.date_type === "approx" ? (e.approx_label || "À venir") : fmtDate(e.release_date));

  const openAdd = () => { sfx("nav"); setEditing(null); setEditorOpen(true); };
  const openEdit = (e) => { sfx("nav"); setEditing(e); setEditorOpen(true); };
  const onGo = (e) => { if (e.creation_id && byId[e.creation_id]) { sfx("select"); nav(`/oeuvre/${e.creation_id}`); } };
  const onDelete = async (e) => {
    if (!window.confirm("Supprimer cette sortie du planning ?")) return;
    await deleteRoadmap(e.id); toast.success("Sortie supprimée"); refetch();
  };

  const startEditIntro = () => { setDraftTitle(title); setDraftIntro(intro); setEditIntro(true); };
  const saveIntro = async () => {
    const s = await getSettings();
    await updateSettings({ ...s, planning_title: draftTitle, planning_intro: draftIntro });
    setEditIntro(false); refetchSettings(); toast.success("Intro du planning enregistrée ✓");
  };

  const Dot = ({ today }) => (
    <div className="flex flex-col items-center self-stretch flex-none w-6">
      <div className={`rounded-full ${today ? "w-4 h-4" : "w-3.5 h-3.5"} mt-1.5`} style={{ background: "var(--brand)", boxShadow: today ? "0 0 0 5px color-mix(in srgb, var(--brand) 22%, transparent)" : "0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent)" }} />
      <div className="w-0.5 flex-1 mt-1" style={{ background: "var(--border-c)" }} />
    </div>
  );

  const Card = ({ e }) => {
    const src = posterSrc(e);
    const linked = !!(e.creation_id && byId[e.creation_id]);
    return (
      <div className="flex-1 min-w-0 pb-6" data-testid={`roadmap-card-${e.id}`}>
        <div className="flex gap-3 sm:gap-4 p-3 border" style={{ ...fs, background: "var(--bg-secondary)" }}>
          <button onClick={() => onGo(e)} className="relative flex-none w-24 sm:w-28 aspect-[2/3] overflow-hidden group" style={{ borderRadius: "var(--radius-base)", background: "var(--bg-primary)", cursor: linked ? "pointer" : "default" }} data-testid={`roadmap-poster-${e.id}`}>
            {src
              ? <img src={src} alt={entryTitle(e)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              : <div className="w-full h-full flex items-center justify-center font-display text-4xl" style={{ color: "var(--brand)" }}>{entryTitle(e)[0]}</div>}
            {linked && <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 py-1 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.72)", color: "#fff" }}>Voir la fiche <IoChevronForward size={10} /></span>}
          </button>

          <div className="min-w-0 flex-1 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full" style={{ background: "var(--brand)", color: "var(--bg-primary)" }} data-testid={`roadmap-countdown-${e.id}`}>{relative(calDate(e))}</span>
              <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{dateChip(e)}</span>
            </div>
            <p className="font-display text-xl sm:text-2xl leading-tight" style={{ color: "var(--text-primary)" }} data-testid={`roadmap-title-${e.id}`}>{entryTitle(e)}</p>
            {e.subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--brand)" }} data-testid={`roadmap-subtitle-${e.id}`}>{e.subtitle}</p>}
            {e.description && <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }} data-testid={`roadmap-desc-${e.id}`}>{e.description}</p>}

            <div className="mt-auto pt-3">
              <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--text-secondary)" }}>Ajouter à mon agenda</p>
              <div className="flex flex-wrap items-center gap-2">
                <button data-testid={`roadmap-ics-${e.id}`} onClick={() => downloadICS(e, entryTitle(e))} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-transform hover:scale-105" style={primary}>
                  <IoDownloadOutline size={16} /> .ics
                </button>
                <a data-testid={`roadmap-google-${e.id}`} href={googleCal(e, entryTitle(e))} target="_blank" rel="noopener noreferrer" onClick={() => sfx("nav")} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold border transition-transform hover:scale-105" style={fs}>
                  <IoLogoGoogle size={16} style={{ color: "var(--brand)" }} /> Google
                </a>
                {isAdmin && (
                  <>
                    <button data-testid={`roadmap-edit-${e.id}`} onClick={() => openEdit(e)} className="ml-auto p-2 border" style={fs} title="Modifier"><IoCreateOutline size={16} style={{ color: "var(--brand)" }} /></button>
                    <button data-testid={`roadmap-delete-${e.id}`} onClick={() => onDelete(e)} className="p-2 border" style={fs} title="Supprimer"><IoTrashOutline size={16} style={{ color: "#ff6b6b" }} /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full" style={{ background: "var(--bg-primary)" }}>
      <TopBar />
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <button data-testid="planning-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2 border mb-8" style={fs}><IoArrowBack /> <span className="text-sm">Retour</span></button>

        {editIntro ? (
          <div className="mb-8 p-4 border" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="planning-intro-editor">
            <input data-testid="planning-title-input" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="w-full font-display text-2xl mb-3 px-3 py-2 border outline-none" style={fs} placeholder="Titre du planning" />
            <textarea data-testid="planning-intro-input" value={draftIntro} onChange={(e) => setDraftIntro(e.target.value)} rows={3} className="w-full px-3 py-2 border outline-none text-sm resize-y" style={fs} placeholder="Petit texte qui décrit le planning de sortie…" />
            <div className="flex gap-2 mt-3">
              <button data-testid="planning-intro-save" onClick={saveIntro} className="flex items-center gap-2 px-4 py-2 font-semibold text-sm" style={primary}><IoSaveOutline /> Enregistrer</button>
              <button onClick={() => setEditIntro(false)} className="px-4 py-2 border text-sm" style={fs}>Annuler</button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <IoRocketOutline size={30} style={{ color: "var(--brand)" }} />
              <h1 className="font-display text-4xl md:text-5xl" style={{ color: "var(--text-primary)" }} data-testid="planning-title">{title}</h1>
            </div>
            {intro && <p className="max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }} data-testid="planning-intro">{intro}</p>}
            {isAdmin && (
              <button data-testid="planning-edit-intro" onClick={startEditIntro} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 border text-xs" style={fs}><IoCreateOutline size={13} /> Modifier l'intro</button>
            )}
          </div>
        )}

        {isLoading ? (
          <p style={{ color: "var(--text-secondary)" }}>Chargement du planning…</p>
        ) : (
          <div data-testid="planning-timeline">
            {/* Aujourd'hui */}
            <div className="flex gap-3 sm:gap-4">
              <Dot today />
              <div className="flex-1 min-w-0 pb-6">
                <div className="inline-flex flex-col px-4 py-2.5 border" style={{ ...fs, background: "var(--bg-secondary)" }}>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--brand)" }}>Nous sommes le</span>
                  <span className="font-display text-lg" style={{ color: "var(--text-primary)" }} data-testid="planning-today">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Les sorties à venir, dans l'ordre ↓</span>
                </div>
              </div>
            </div>

            {entries.map((e) => (
              <div key={e.id} className="flex gap-3 sm:gap-4">
                <Dot />
                <Card e={e} />
              </div>
            ))}

            {entries.length === 0 && !isAdmin && (
              <p className="py-4 pl-9" style={{ color: "var(--text-secondary)" }} data-testid="planning-empty">Aucune sortie annoncée pour le moment. Reviens bientôt ! ✨</p>
            )}

            {isAdmin && (
              <div className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center flex-none w-6">
                  <div className="w-3.5 h-3.5 rounded-full mt-1.5" style={{ background: "var(--border-c)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <button data-testid="roadmap-add" onClick={openAdd} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed transition-transform hover:scale-[1.01]" style={{ borderColor: "var(--brand)", borderRadius: "var(--radius-base)", background: "var(--bg-secondary)", color: "var(--brand)" }}>
                    <IoAdd size={26} /> <span className="font-semibold">Ajouter une sortie</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {editorOpen && (
        <RoadmapEditor
          initial={editing}
          creations={creations}
          onClose={() => setEditorOpen(false)}
          onSaved={() => { setEditorOpen(false); refetch(); }}
        />
      )}
    </div>
  );
}

const empty = { creation_id: "", title: "", subtitle: "", description: "", poster: "", date_type: "exact", release_date: "", approx_label: "", approx_date: "" };

function RoadmapEditor({ initial, creations, onClose, onSaved }) {
  const { sfx } = useApp();
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty);
  const [saving, setSaving] = useState(false);
  const posterInput = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onPoster = (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error("Affiche trop lourde (max 3 Mo)");
    const r = new FileReader(); r.onload = () => set("poster", r.result); r.readAsDataURL(file);
  };
  const onPickCreation = (id) => {
    const c = creations.find((x) => x.id === id);
    setForm((f) => ({ ...f, creation_id: id, title: f.title || (c ? c.title : "") }));
  };

  const linkedC = creations.find((c) => c.id === form.creation_id);
  const previewSrc = form.poster && form.poster.length > 4
    ? form.poster
    : (linkedC && linkedC.has_poster ? posterUrl(linkedC.id, linkedC.updated_at) : null);

  const save = async () => {
    if (!form.title.trim() && !form.creation_id) return toast.error("Donne un titre ou lie une création");
    if (form.date_type === "exact" && !form.release_date) return toast.error("Choisis une date de sortie");
    if (form.date_type === "approx" && !form.approx_label.trim()) return toast.error("Indique la période (ex: Printemps 2026)");
    setSaving(true);
    try {
      const payload = { ...form };
      if (initial && initial.id) await updateRoadmap(initial.id, payload);
      else await createRoadmap(payload);
      sfx("select"); toast.success("Sortie enregistrée dans le planning ✓");
      onSaved();
    } catch (e) { toast.error("Erreur d'enregistrement"); } finally { setSaving(false); }
  };

  const Label = ({ children }) => <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-secondary)" }}>{children}</label>;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} onClick={onClose} data-testid="roadmap-editor">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto border" style={{ ...fs, background: "var(--bg-secondary)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b sticky top-0 z-10" style={{ borderColor: "var(--border-c)", background: "var(--bg-secondary)" }}>
          <h3 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>{initial ? "Modifier la sortie" : "Nouvelle sortie"}</h3>
          <button onClick={onClose} data-testid="roadmap-editor-close" className="p-1.5"><IoClose size={22} style={{ color: "var(--text-secondary)" }} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-4">
            <div className="w-24 flex-none aspect-[2/3] border overflow-hidden flex items-center justify-center" style={{ ...fs, background: "var(--bg-primary)" }}>
              {previewSrc ? <img src={previewSrc} alt="" className="w-full h-full object-cover" /> : <IoImageOutline size={28} style={{ color: "var(--text-secondary)" }} />}
            </div>
            <div className="flex-1">
              <Label>Affiche</Label>
              <input ref={posterInput} type="file" accept="image/*" className="hidden" onChange={(e) => onPoster(e.target.files?.[0])} data-testid="roadmap-poster-input" />
              <button onClick={() => posterInput.current?.click()} className="px-3 py-2 border text-sm w-full" style={fs} data-testid="roadmap-poster-btn">Choisir une affiche…</button>
              {form.poster && <button onClick={() => set("poster", "")} className="mt-2 text-xs" style={{ color: "#ff6b6b" }}>Retirer l'affiche</button>}
              <p className="text-[11px] mt-2" style={{ color: "var(--text-secondary)" }}>Si tu lies une création, son affiche est utilisée automatiquement.</p>
            </div>
          </div>

          <div>
            <Label>Lier à une création (optionnel)</Label>
            <select data-testid="roadmap-creation-select" value={form.creation_id || ""} onChange={(e) => onPickCreation(e.target.value)} className="w-full px-3 py-2 border outline-none text-sm" style={fs}>
              <option value="">— Sortie personnalisée (pas encore de fiche) —</option>
              {creations.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <Label>Titre</Label>
            <input data-testid="roadmap-title-input" value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-3 py-2 border outline-none text-sm" style={fs} placeholder="Titre de la sortie" />
          </div>
          <div>
            <Label>Sous-titre (optionnel)</Label>
            <input data-testid="roadmap-subtitle-input" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="w-full px-3 py-2 border outline-none text-sm" style={fs} placeholder="ex: Tome 2 · Le grand final" />
          </div>
          <div>
            <Label>Description — de quoi il s'agit (optionnel)</Label>
            <textarea data-testid="roadmap-description-input" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="w-full px-3 py-2 border outline-none text-sm resize-y" style={fs} placeholder="Décris ce qui arrive : l'histoire, ce que les gens vont découvrir…" />
          </div>

          <div>
            <Label>Type de date</Label>
            <div className="flex gap-2">
              <button data-testid="roadmap-datetype-exact" onClick={() => set("date_type", "exact")} className="flex-1 px-3 py-2 border text-sm" style={{ ...fs, outline: form.date_type === "exact" ? "2px solid var(--brand)" : "none" }}>Date précise</button>
              <button data-testid="roadmap-datetype-approx" onClick={() => set("date_type", "approx")} className="flex-1 px-3 py-2 border text-sm" style={{ ...fs, outline: form.date_type === "approx" ? "2px solid var(--brand)" : "none" }}>Période approx.</button>
            </div>
          </div>

          {form.date_type === "exact" ? (
            <div>
              <Label>Date de sortie</Label>
              <input data-testid="roadmap-date-input" type="date" value={form.release_date || ""} onChange={(e) => set("release_date", e.target.value)} className="w-full px-3 py-2 border outline-none text-sm" style={fs} />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Période affichée</Label>
                <input data-testid="roadmap-approx-label-input" value={form.approx_label} onChange={(e) => set("approx_label", e.target.value)} className="w-full px-3 py-2 border outline-none text-sm" style={fs} placeholder="ex: Printemps 2026, Fin 2026…" />
              </div>
              <div>
                <Label>Date approximative (sert au classement chronologique)</Label>
                <input data-testid="roadmap-approx-date-input" type="date" value={form.approx_date || ""} onChange={(e) => set("approx_date", e.target.value)} className="w-full px-3 py-2 border outline-none text-sm" style={fs} />
              </div>
            </div>
          )}

          <button data-testid="roadmap-save" onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold disabled:opacity-50" style={primary}>
            <IoSaveOutline /> {saving ? "Enregistrement…" : "Enregistrer la sortie"}
          </button>
        </div>
      </div>
    </div>
  );
}
