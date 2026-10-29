import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoClose, IoImageOutline, IoTrashOutline } from "react-icons/io5";
import { toast } from "sonner";
import { listCreations, uploadJournalImage } from "@/lib/api";
import { imgSrc, getUniPlaylist, setUniPlaylist } from "@/lib/atelier";

const COLORS = ["#ff2f5f", "#ffb340", "#3ff0ff", "#7c5cff", "#00e5a0", "#ff7ad9", "#e8e1cf"];

export default function UniverseForm({ at, universe, onClose }) {
  const [u, setU] = useState({ name: "", kanji: "", color: COLORS[0], cover: "", description: "", creation_ids: [], group: "", pinned: false, ...universe });
  const [playlist, setPlaylist] = useState(() => getUniPlaylist(universe?.id));
  const groups = [...new Set(at.universes.map((x) => x.group).filter(Boolean))];
  const [busy, setBusy] = useState(false);
  const file = useRef(null);
  const { data: creations = [] } = useQuery({ queryKey: ["creations", "all"], queryFn: () => listCreations() });
  const set = (k, v) => setU((x) => ({ ...x, [k]: v }));
  const toggleWork = (id) => set("creation_ids", u.creation_ids.includes(id) ? u.creation_ids.filter((x) => x !== id) : [...u.creation_ids, id]);

  const upload = async (f) => { if (!f) return; setBusy(true); try { set("cover", (await uploadJournalImage(f)).url); } catch { toast.error("Image refusée"); } finally { setBusy(false); } };
  const save = async () => {
    if (!u.name.trim()) return toast.error("Donne un nom à l'univers");
    setBusy(true);
    try { const doc = await at.saveUniverse({ ...u, name: u.name.trim() }); setUniPlaylist(doc.id, playlist); toast.success("Univers enregistré"); onClose(doc); }
    catch { toast.error("Enregistrement impossible"); setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm(`Supprimer l'univers « ${u.name} » ? Ses éléments ne sont pas supprimés : ils retournent dans l'Inbox.`)) return;
    await at.removeUniverse(u.id); toast.success("Univers supprimé, éléments rangés dans l'Inbox"); onClose();
  };

  return (
    <div className="at-modal" onClick={() => onClose()} data-testid="atelier-universe-form">
      <div className="at-modal-c" onClick={(e) => e.stopPropagation()}>
        <div className="at-modal-h"><h2>{u.id ? "Modifier l'univers" : "Nouvel univers"}</h2><button onClick={() => onClose()} aria-label="Fermer"><IoClose size={20} /></button></div>
        <div className="at-form">
          <div className="row">
            <label className="grow">Nom<input value={u.name} onChange={(e) => set("name", e.target.value)} placeholder="Liberty's Chroma II" data-testid="atelier-uf-name" /></label>
            <label className="kj">Kanji<input value={u.kanji} maxLength={2} onChange={(e) => set("kanji", e.target.value)} placeholder="色" data-testid="atelier-uf-kanji" /></label>
          </div>
          <div className="row">
            <label className="grow">Constellation (saga, collection…)<input list="at-groups" value={u.group} onChange={(e) => set("group", e.target.value)} placeholder="ex. Liberty's Chroma" data-testid="atelier-uf-group" /></label>
            <label className="kj">Épinglé<input type="checkbox" checked={!!u.pinned} onChange={(e) => set("pinned", e.target.checked)} data-testid="atelier-uf-pinned" /></label>
          </div>
          <datalist id="at-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
          <label>Description<textarea rows={3} value={u.description} onChange={(e) => set("description", e.target.value)} placeholder="Le pitch de cet univers…" data-testid="atelier-uf-desc" /></label>
          <label>Playlist (lien YouTube, Spotify…)<input value={playlist} onChange={(e) => setPlaylist(e.target.value)} placeholder="https://youtube.com/playlist?list=…" data-testid="atelier-uf-playlist" /></label>
          <div className="lbl">Couleur</div>
          <div className="at-colors">{COLORS.map((c) => <button key={c} className={u.color === c ? "on" : ""} style={{ background: c }} onClick={() => set("color", c)} aria-label={c} />)}</div>
          <div className="lbl">Image de couverture</div>
          <div className="at-cover">
            {u.cover ? <img src={imgSrc(u.cover)} alt="" /> : <span>Aucune</span>}
            <button className="at-btn ghost" disabled={busy} onClick={() => file.current?.click()} data-testid="atelier-uf-cover"><IoImageOutline size={15} /> {busy ? "Envoi…" : "Choisir"}</button>
            {u.cover && <button className="at-btn ghost" onClick={() => set("cover", "")}><IoTrashOutline size={15} /></button>}
            <input ref={file} hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; upload(f); }} />
          </div>
          {creations.length > 0 && <>
            <div className="lbl">Œuvres publiques de cet univers</div>
            <div className="at-chips">{creations.map((c) => <button key={c.id} className={u.creation_ids.includes(c.id) ? "on" : ""} onClick={() => toggleWork(c.id)}>{c.title}</button>)}</div>
          </>}
        </div>
        <div className="at-modal-f">
          {u.id && <button className="at-btn danger" onClick={remove} data-testid="atelier-uf-delete"><IoTrashOutline size={15} /> Supprimer</button>}
          <span className="grow" />
          <button className="at-btn ghost" onClick={() => onClose()}>Annuler</button>
          <button className="at-btn" disabled={busy} onClick={save} data-testid="atelier-uf-save">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
