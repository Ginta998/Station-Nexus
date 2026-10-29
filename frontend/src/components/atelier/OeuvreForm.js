import { useRef, useState } from "react";
import { IoClose, IoImageOutline, IoTrashOutline } from "react-icons/io5";
import { toast } from "sonner";
import { uploadJournalImage } from "@/lib/api";
import { imgSrc, OEUVRE_FORMATS } from "@/lib/atelier";

const COLORS = ["#ff2f5f", "#ffb340", "#3ff0ff", "#7c5cff", "#00e5a0", "#ff7ad9", "#e8e1cf"];
const STATUS = ["en cours", "en pause", "terminé", "idée"];

// Édition d'une Œuvre — même interface qu'un univers : cover, couleur, kanji, format, pitch.
// (Une œuvre reste un élément porteur, mais on ne l'édite jamais comme un simple document ici.)
export default function OeuvreForm({ at, oeuvre, onClose }) {
  const existing = oeuvre && oeuvre.id ? oeuvre : null;
  const f0 = existing?.fields || {};
  const [o, setO] = useState({
    title: existing?.title || "",
    universe_id: existing?.universe_id || oeuvre?.universe_id || (at.universes[0]?.id || null),
    image: existing?.image || "",
    pinned: !!existing?.pinned,
    format: f0.format || "serie",
    status: f0.status || "en cours",
    color: f0.color || COLORS[1],
    kanji: f0.kanji || "",
    desc: f0.desc || "",
    playlist: f0.playlist || "",
  });
  const [busy, setBusy] = useState(false);
  const file = useRef(null);
  const set = (k, v) => setO((x) => ({ ...x, [k]: v }));

  const upload = async (fl) => { if (!fl) return; setBusy(true); try { set("image", (await uploadJournalImage(fl)).url); } catch { toast.error("Image refusée"); } finally { setBusy(false); } };

  const save = async () => {
    if (!o.title.trim()) return toast.error("Donne un titre à l'œuvre");
    setBusy(true);
    try {
      const fields = { oeuvre: true, format: o.format, status: o.status, color: o.color, kanji: o.kanji, desc: o.desc, playlist: o.playlist.trim() };
      let doc;
      if (existing) {
        doc = await at.saveItem({ ...existing, title: o.title.trim(), universe_id: o.universe_id, image: o.image, pinned: o.pinned, fields: { ...existing.fields, ...fields } });
      } else {
        doc = await at.createItem({ kind: "document", title: o.title.trim(), universe_id: o.universe_id, image: o.image, pinned: o.pinned, fields });
      }
      toast.success("Œuvre enregistrée");
      onClose(doc);
    } catch { toast.error("Enregistrement impossible"); setBusy(false); }
  };
  const remove = async () => {
    if (!existing) return onClose();
    if (!window.confirm(`Supprimer l'œuvre « ${o.title} » ? Ses éléments retournent dans leur univers.`)) return;
    await at.removeItem(existing.id); toast.success("Œuvre supprimée"); onClose();
  };

  return (
    <div className="at-modal" onClick={() => onClose()} data-testid="atelier-oeuvre-form">
      <div className="at-modal-c" onClick={(e) => e.stopPropagation()} style={{ "--u": o.color }}>
        <div className="at-modal-h"><h2>{existing ? "Modifier l'œuvre" : "Nouvelle œuvre"}</h2><button onClick={() => onClose()} aria-label="Fermer"><IoClose size={20} /></button></div>
        <div className="at-form">
          <div className="row">
            <label className="grow">Titre<input autoFocus value={o.title} onChange={(e) => set("title", e.target.value)} placeholder="S.A.M, Dreamer, Blue Flower…" data-testid="atelier-of-title" /></label>
            <label className="kj">Kanji<input value={o.kanji} maxLength={2} onChange={(e) => set("kanji", e.target.value)} placeholder={OEUVRE_FORMATS[o.format].kanji} data-testid="atelier-of-kanji" /></label>
          </div>
          <div className="row">
            <label className="grow">Format<select value={o.format} onChange={(e) => set("format", e.target.value)} data-testid="atelier-of-format">{Object.entries(OEUVRE_FORMATS).map(([k, ff]) => <option key={k} value={k}>{ff.label}</option>)}</select></label>
            <label className="grow">Statut<select value={o.status} onChange={(e) => set("status", e.target.value)}>{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
          </div>
          <label>Univers<select value={o.universe_id || ""} onChange={(e) => set("universe_id", e.target.value || null)} data-testid="atelier-of-universe">
            <option value="">Aucun univers</option>
            {at.universes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select></label>
          <label>Pitch<textarea rows={3} value={o.desc} onChange={(e) => set("desc", e.target.value)} placeholder="De quoi parle cette œuvre…" data-testid="atelier-of-desc" /></label>
          <label>Playlist (lien YouTube, Spotify…)<input value={o.playlist} onChange={(e) => set("playlist", e.target.value)} placeholder="https://youtube.com/playlist?list=…" data-testid="atelier-of-playlist" /></label>
          <div className="lbl">Couleur</div>
          <div className="at-colors">{COLORS.map((c) => <button key={c} className={o.color === c ? "on" : ""} style={{ background: c }} onClick={() => set("color", c)} aria-label={c} />)}</div>
          <div className="lbl">Affiche de l'œuvre</div>
          <div className="at-cover">
            {o.image ? <img src={imgSrc(o.image)} alt="" /> : <span>Aucune</span>}
            <button className="at-btn ghost" disabled={busy} onClick={() => file.current?.click()} data-testid="atelier-of-cover"><IoImageOutline size={15} /> {busy ? "Envoi…" : "Choisir"}</button>
            {o.image && <button className="at-btn ghost" onClick={() => set("image", "")}><IoTrashOutline size={15} /></button>}
            <input ref={file} hidden type="file" accept="image/*" onChange={(e) => { const fl = e.target.files?.[0]; e.target.value = ""; upload(fl); }} />
          </div>
          <label className="at-check"><input type="checkbox" checked={o.pinned} onChange={(e) => set("pinned", e.target.checked)} data-testid="atelier-of-pin" /> Épingler cette œuvre sur le Pont</label>
        </div>
        <div className="at-modal-f">
          {existing && <button className="at-btn danger" onClick={remove} data-testid="atelier-of-delete"><IoTrashOutline size={15} /> Supprimer</button>}
          <span className="grow" />
          <button className="at-btn ghost" onClick={() => onClose()}>Annuler</button>
          <button className="at-btn" disabled={busy} onClick={save} data-testid="atelier-of-save">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
