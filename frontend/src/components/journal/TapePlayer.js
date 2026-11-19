import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { IoClose, IoPlay, IoPause, IoPlayBack, IoPlayForward, IoStop, IoCreateOutline, IoMusicalNotes } from "react-icons/io5";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePick, ArtSearch, FilePick, BlocksEditor } from "@/components/journal/BlocksEditor";
import { listJournalCategories, listCreations } from "@/lib/api";
import MicRecorder from "@/components/journal/MicRecorder";
import { useApp } from "@/context/AppContext";
import { mediaUrl, getJournalEntry, updateJournalEntry } from "@/lib/api";
import { JournalBlocks } from "@/components/journal/JournalParts";
import { tapeStart, tapeRelease, tapeHiss, tapeInsert } from "@/lib/tapeSound";
import { Cassette } from "@/components/journal/TapeObject";
import "@/components/journal/tape.css";

/*
  Une entrée du journal au format « cassette » : un enregistrement qu'on écoute, comme les journaux audio de BioShock.
  On appuie sur lecture : la touche s'enfonce, le moteur démarre, la bande prend de la vitesse, puis la voix arrive.
  Les bobines tournent et se vident d'un côté pour se remplir de l'autre ; le texte de l'entrée sert de transcription.
*/
const mmss = (s) => { if (!isFinite(s)) return "--:--"; const m = Math.floor(s / 60); return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };

export default function TapePlayer({ entry: saved, onClose }) {
  const { uiVolume = 0.5, muted, pauseReading, isAdmin } = useApp();
  const qc = useQueryClient();
  // modifier la cassette directement dessus (admin) : étiquette, voix, image, enregistrement
  const [edit, setEdit] = useState(false); const [draft, setDraft] = useState(saved); const [busy, setBusy] = useState(false); const [over, setOver] = useState(null); // ce qui vient d'être enregistré
  const base = over ? { ...saved, ...over } : saved;
  const e = edit ? draft : base;
  const setD = (p) => setDraft((o) => ({ ...o, ...p }));
  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...draft }; ["id", "created_at", "updated_at"].forEach((k) => delete payload[k]);
      const r = await updateJournalEntry(saved.id, payload);
      qc.setQueryData(["journal-entry", saved.id], r && r.id ? r : { ...saved, ...payload }); qc.invalidateQueries({ queryKey: ["journal"] });
      setOver(payload); toast.success("Cassette enregistrée"); setEdit(false);
    } catch (err) { toast.error(err?.response?.data?.detail || "Enregistrement impossible"); }
    setBusy(false);
  };
  const a = useRef(null); const hiss = useRef(null); const startT = useRef(null);
  const [on, setOn] = useState(false); const [pos, setPos] = useState(0); const [dur, setDur] = useState(0); const [starting, setStarting] = useState(false);
  const vol = muted ? 0 : Math.min(1, (uiVolume ?? 0.5) * 1.1);
  const p = dur ? pos / dur : 0;
  const stopFx = () => { clearTimeout(startT.current); hiss.current?.(); hiss.current = null; };

  const play = () => {
    const el = a.current; if (!el || !e.tape_url) return;
    pauseReading?.(); setStarting(true); setOn(true); tapeStart(vol);
    startT.current = setTimeout(() => { // la voix arrive quand la bande a pris sa vitesse
      el.volume = 0; el.play().then(() => { let v = 0; const f = setInterval(() => { v = Math.min(1, v + 0.1); el.volume = v; if (v >= 1) clearInterval(f); }, 40); }).catch(() => { setOn(false); });
      hiss.current = tapeHiss(vol); setStarting(false);
    }, 650);
  };
  const pause = () => { a.current?.pause(); stopFx(); tapeRelease(vol); setOn(false); setStarting(false); };
  const toggle = () => (on ? pause() : play());
  const seek = (d) => { const el = a.current; if (!el) return; el.currentTime = Math.max(0, Math.min(dur || 0, el.currentTime + d)); setPos(el.currentTime); tapeRelease(vol * 0.6); };
  const stop = () => { pause(); if (a.current) a.current.currentTime = 0; setPos(0); };
  const close = () => { if (edit) { setEdit(false); return; } a.current?.pause(); stopFx(); onClose(); };

  useEffect(() => {
    const k = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); close(); } if (ev.key === " " && !edit && !/INPUT|TEXTAREA|BUTTON/.test(ev.target?.tagName)) { ev.preventDefault(); toggle(); } };
    window.addEventListener("keydown", k, true); return () => window.removeEventListener("keydown", k, true);
  });
  useEffect(() => () => { a.current?.pause(); stopFx(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // à l'ouverture, la cassette glisse dans le lecteur et s'enclenche
  useEffect(() => { const t = setTimeout(() => tapeInsert(vol), 650); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // bobines : la gauche se vide, la droite se remplit
  const label = e.tape_label || e.title;
  // un enregistrement n'a pas forcément de texte : alors seule la cassette s'affiche, au centre
  const hasText = (e.blocks || []).some((b) => (b.text || "").trim() || b.url || (b.urls || []).length) || (e.body || "").trim();
  return createPortal(
    <div className={"tp" + (on ? " on" : "") + (starting ? " starting" : "") + (hasText ? "" : " solo")} role="dialog" aria-label={`Cassette : ${e.title}`} data-testid="tape-player">
      {e.cover && <span className="tp-bgimg" style={{ backgroundImage: `url(${mediaUrl(e.cover)})` }} aria-hidden="true" />}
      <button className="tp-x" onClick={close} aria-label={edit ? "Annuler les modifications" : "Fermer"} data-testid="tape-close"><IoClose size={18} /></button>
      {isAdmin && !edit && <button className="tp-x tp-ed-btn" onClick={() => { pause(); setDraft(base); setEdit(true); }} aria-label="Modifier la cassette" title="Modifier la cassette" data-testid="tape-edit"><IoCreateOutline size={18} /></button>}
      <div className="tp-deck">
        <div className={"tp-cassw" + (edit ? " editing" : "")} onContextMenu={isAdmin && !edit ? (ev) => { ev.preventDefault(); pause(); setDraft(base); setEdit(true); } : undefined}><Cassette title={label} sub={[e.tape_voice && `Voix : ${e.tape_voice}`, e.date && new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })].filter(Boolean).join(" · ")} p={p} spinning={on && !starting} starting={starting} img={e.cover} /></div>
        {edit && <TapeEditPanel d={draft} set={setD} onSave={save} onCancel={() => setEdit(false)} busy={busy} />}
        {!edit && <><div className="tp-ctl">
          <span className="tp-count mono" aria-label="Compteur">{String(Math.floor(pos)).padStart(3, "0").slice(-3)}</span>
          <div className="tp-keys">
            <button onClick={() => seek(-10)} aria-label="Reculer de 10 secondes" title="Reculer (10 s)"><IoPlayBack /></button>
            <button className={"play" + (on ? " down" : "")} onClick={toggle} aria-label={on ? "Pause" : "Lecture"} data-testid="tape-play">{on ? <IoPause /> : <IoPlay />}</button>
            <button onClick={() => seek(10)} aria-label="Avancer de 10 secondes" title="Avancer (10 s)"><IoPlayForward /></button>
            <button onClick={stop} aria-label="Stop" title="Stop, retour au début"><IoStop /></button>
          </div>
          <span className="tp-time mono">{mmss(pos)} / {mmss(dur)}</span>
        </div>
        <div className="tp-bar" onClick={(ev) => { const r = ev.currentTarget.getBoundingClientRect(); const el = a.current; if (el && dur) { el.currentTime = ((ev.clientX - r.left) / r.width) * dur; setPos(el.currentTime); } }} role="slider" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(pos)} aria-label="Position"><i style={{ width: `${p * 100}%` }} /></div>
        {!e.tape_url && <p className="tp-none">Pas encore d'enregistrement sur cette cassette.</p>}</>}
      </div>
      {(!hasText || edit) && <p className="tp-solo-t"><b>{e.title}</b>{e.subtitle && <small>{e.subtitle}</small>}</p>}
      {hasText && !edit && <article className="tp-script">
        <p className="mono tp-k">TRANSCRIPTION</p>
        <h1>{e.title}</h1>
        {e.subtitle && <p className="tp-sub">{e.subtitle}</p>}
        <div className="tp-text"><JournalBlocks blocks={e.blocks || []} /></div>
      </article>}
      {e.tape_url && <audio ref={a} src={mediaUrl(e.tape_url)} preload="metadata" onLoadedMetadata={(ev) => setDur(ev.currentTarget.duration)} onTimeUpdate={(ev) => setPos(ev.currentTarget.currentTime)} onEnded={() => { stopFx(); tapeRelease(vol); setOn(false); }} />}
    </div>,
    document.body
  );
}

// Ouvre une cassette depuis une liste (journal, accueil, fiche d'une création) sans quitter la page :
// la croix ramène exactement là où on était.
function TapeEditPanel({ d, set, onSave, onCancel, busy }) {
  const { data: cats = [] } = useQuery({ queryKey: ["journal-cats"], queryFn: listJournalCategories });
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  return (
    <div className="tp-edit" data-testid="tape-edit-panel">
      <p className="tp-edit-k mono">MODIFIER L'ENREGISTREMENT</p>
      <div className="tp-edit-row">
        <label>Titre<input value={d.title || ""} onChange={(ev) => set({ title: ev.target.value })} data-testid="tape-edit-title" /></label>
        <label>Sous-titre<input value={d.subtitle || ""} onChange={(ev) => set({ subtitle: ev.target.value })} placeholder="Facultatif" /></label>
      </div>
      <p className="tp-edit-s mono">L'ÉTIQUETTE</p>
      <div className="tp-edit-row">
        <label>Étiquette<input value={d.tape_label || ""} onChange={(ev) => set({ tape_label: ev.target.value })} placeholder={d.title} data-testid="tape-edit-label" autoFocus /></label>
        <label>Voix<input value={d.tape_voice || ""} onChange={(ev) => set({ tape_voice: ev.target.value })} placeholder="Qui parle ?" data-testid="tape-edit-voice" /></label>
      </div>
      <p className="tp-edit-s mono">IMAGE (ÉTIQUETTE ET FOND)</p>
      <div className="tp-edit-acts">
        <ImagePick label={d.cover ? "Changer l'image" : "Ajouter une image"} onDone={([u]) => set({ cover: u })} testid="tape-edit-img" />
        <ArtSearch term={d.tape_label || d.title} label="Chercher un artwork" onPick={(u) => set({ cover: u })} />
        {d.cover && <button type="button" className="jr-pick" onClick={() => set({ cover: "" })}>Retirer</button>}
      </div>
      <p className="tp-edit-s mono">ENREGISTREMENT</p>
      <div className="tp-edit-acts">
        <MicRecorder onDone={(u) => set({ tape_url: u })} testid="tape-edit-mic" />
        <FilePick accept="audio/*" icon={<IoMusicalNotes />} label={d.tape_url ? "Remplacer par un fichier" : "Déposer un fichier"} onDone={([u]) => set({ tape_url: u })} testid="tape-edit-file" />
      </div>
      {d.tape_url && <audio controls preload="none" src={mediaUrl(d.tape_url)} className="tp-edit-au" />}
      <p className="tp-edit-s mono">RANGEMENT</p>
      <div className="tp-edit-row three">
        <label>Date<input type="date" value={(d.date || "").slice(0, 10)} onChange={(ev) => set({ date: ev.target.value })} /></label>
        <label>Catégorie<select value={d.category_id || ""} onChange={(ev) => set({ category_id: ev.target.value })}><option value="">Sans catégorie</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Création<select value={d.creation_id || ""} onChange={(ev) => set({ creation_id: ev.target.value })}><option value="">Aucune</option>{creations.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
      </div>
      <div className="tp-edit-checks">
        <label><input type="checkbox" checked={!!d.published} onChange={(ev) => set({ published: ev.target.checked })} data-testid="tape-edit-published" /> Publiée</label>
        <label><input type="checkbox" checked={!!d.show_home} onChange={(ev) => set({ show_home: ev.target.checked })} /> Sur l'accueil</label>
        <label>Format<select value={d.format || "cassette"} onChange={(ev) => set({ format: ev.target.value })}><option value="cassette">Cassette</option><option value="livre">Livre</option><option value="vhs">VHS</option><option value="vinyle">Vinyle</option></select></label>
      </div>
      <p className="tp-edit-s mono">TRANSCRIPTION (FACULTATIVE)</p>
      <div className="tp-edit-blocks"><BlocksEditor blocks={d.blocks || []} onChange={(blocks) => set({ blocks })} /></div>
      <div className="tp-edit-end">
        <button type="button" className="jr-pick" onClick={onCancel}>Annuler</button>
        <button type="button" className="jr-btn jr-btn-brand" onClick={onSave} disabled={busy} data-testid="tape-edit-save">{busy ? "Enregistrement…" : "Enregistrer la cassette"}</button>
      </div>
    </div>
  );
}

export function TapeById({ id, onClose }) {
  const { data: e } = useQuery({ queryKey: ["journal-entry", id], queryFn: () => getJournalEntry(id), enabled: !!id });
  if (!id || !e) return null;
  return <TapePlayer entry={e} onClose={onClose} />;
}
