import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoArrowUp, IoArrowDown, IoTrashOutline, IoImageOutline, IoMusicalNotes } from "react-icons/io5";
import { toast } from "sonner";
import { uploadJournalImage, mediaUrl, listAmbiences, ambienceUrl } from "@/lib/api";
import { ytId } from "@/lib/blocks";
import AutoTextarea from "@/components/AutoTextarea";

export const BLOCK_TYPES = [
  { type: "text", label: "Texte" }, { type: "heading", label: "Titre" }, { type: "image", label: "Image" },
  { type: "gallery", label: "Galerie" }, { type: "sketch", label: "Croquis" }, { type: "youtube", label: "YouTube" },
  { type: "quote", label: "Citation" }, { type: "music", label: "Musique" },
];
const LABEL = Object.fromEntries(BLOCK_TYPES.map((b) => [b.type, b.label]));
const journalUpload = async (f) => (await uploadJournalImage(f)).url;

// envoi d'un ou plusieurs fichiers -> URLs
export function FilePick({ multiple, onDone, upload = journalUpload, accept = "image/*", label = "Choisir une image", icon = <IoImageOutline />, testid }) {
  const [busy, setBusy] = useState(false);
  const pick = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try { const urls = []; for (const f of files) urls.push(await upload(f)); onDone(urls, files); }
    catch (e) { toast.error(e?.response?.data?.detail || "Envoi du fichier impossible"); }
    setBusy(false);
  };
  return (
    <label className="jr-pick" data-testid={testid}>
      {icon} {busy ? "Envoi…" : label}
      <input type="file" accept={accept} multiple={multiple} hidden onChange={(e) => pick([...e.target.files])} />
    </label>
  );
}
export const ImagePick = (p) => <FilePick {...p} />;

function MusicFields({ b, set, uploadAudio }) {
  const { data: ambiences = [] } = useQuery({ queryKey: ["ambiences"], queryFn: listAmbiences });
  return (
    <>
      <input className="jr-in" placeholder="Titre affiché (ex. « Thème de la bataille »)" value={b.caption || ""} onChange={(e) => set({ caption: e.target.value })} />
      <div className="flex flex-wrap items-center gap-2">
        <FilePick accept="audio/*" icon={<IoMusicalNotes />} label={b.url ? "Remplacer le fichier" : "Importer une musique"} upload={uploadAudio}
          onDone={([u], [f]) => set({ url: u, caption: b.caption || f.name.replace(/\.[^.]+$/, "") })} />
        <select className="jr-in" style={{ width: "auto" }} value="" onChange={(e) => { const a = ambiences.find((x) => x.id === e.target.value); if (a) set({ url: ambienceUrl(a.id), caption: b.caption || a.title }); }}>
          <option value="">…ou une musique de la station</option>
          {ambiences.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>
      {b.url && <audio className="w-full" controls preload="none" src={mediaUrl(b.url)} />}
      <small style={{ color: "var(--text-secondary)" }}>Le lecteur touche ce repère pour lancer la musique pendant sa lecture.</small>
    </>
  );
}

function BlockFields({ b, set, uploadImage, uploadAudio, page }) {
  const cap = <input className="jr-in" placeholder="Légende (facultatif)" value={b.caption || ""} onChange={(e) => set({ caption: e.target.value })} />;
  switch (b.type) {
    case "text": if (page) return <AutoTextarea className="pw-text" maxHeight={100000} placeholder="Écris ici… (ligne vide = nouveau paragraphe · **gras** · *italique*)" value={b.text || ""} onChange={(e) => set({ text: e.target.value })} />;
      return <><textarea className="jr-in" rows={7} placeholder="Écris ici… (ligne vide = nouveau paragraphe)" value={b.text || ""} onChange={(e) => set({ text: e.target.value })} /><small style={{ color: "var(--text-secondary)" }}>**gras** · *italique*</small></>;
    case "heading": return <input className="jr-in jr-in-h" placeholder="Intertitre" value={b.text || ""} onChange={(e) => set({ text: e.target.value })} />;
    case "quote": return <><textarea className="jr-in" rows={3} placeholder="Citation" value={b.text || ""} onChange={(e) => set({ text: e.target.value })} /><input className="jr-in" placeholder="Auteur (facultatif)" value={b.author || ""} onChange={(e) => set({ author: e.target.value })} /></>;
    case "youtube": return <><input className="jr-in" placeholder="Lien YouTube" value={b.url || ""} onChange={(e) => set({ url: e.target.value })} />{b.url && !ytId(b.url) && <small className="jr-warn">Lien YouTube non reconnu</small>}{cap}</>;
    case "music": return <MusicFields b={b} set={set} uploadAudio={uploadAudio} />;
    case "gallery": return (
      <>
        <div className="jr-thumbs">{(b.urls || []).map((u, i) => <span key={u + i}><img src={mediaUrl(u)} alt="" /><button onClick={() => set({ urls: b.urls.filter((_, k) => k !== i) })} aria-label="Retirer">×</button></span>)}</div>
        <FilePick multiple upload={uploadImage} label="Ajouter des images" onDone={(urls) => set({ urls: [...(b.urls || []), ...urls] })} />{cap}
      </>
    );
    default: return ( // image / croquis
      <>
        {b.url && <img className="jr-prev" src={mediaUrl(b.url)} alt="" />}
        <div className="flex flex-wrap items-center gap-3">
          <FilePick upload={uploadImage} label={b.url ? "Remplacer" : b.type === "sketch" ? "Importer le croquis" : "Choisir une image"} onDone={([u]) => set({ url: u })} />
          {b.type === "image" && <label className="jr-check"><input type="checkbox" checked={!!b.wide} onChange={(e) => set({ wide: e.target.checked })} /> Pleine largeur</label>}
        </div>
        {cap}
      </>
    );
  }
}

// uploadImage / uploadAudio : (file) => URL ; par défaut, stockage du journal
export function BlocksEditor({ blocks, onChange, uploadImage = journalUpload, uploadAudio = journalUpload, page = false }) {
  const upd = (i, p) => onChange(blocks.map((b, k) => (k === i ? { ...b, ...p } : b)));
  const move = (i, d) => { const n = [...blocks]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className={`jr-blocks${page ? " jr-blocks--page" : ""}`} data-testid="journal-blocks">
      {blocks.map((b, i) => (
        <div key={b._k} className="jr-block" data-testid={`journal-block-${i}`}>
          <div className="jr-block-bar">
            <span className="mono">{LABEL[b.type]}</span>
            <div><button onClick={() => move(i, -1)} aria-label="Monter"><IoArrowUp /></button><button onClick={() => move(i, 1)} aria-label="Descendre"><IoArrowDown /></button><button onClick={() => onChange(blocks.filter((_, k) => k !== i))} aria-label="Supprimer le bloc"><IoTrashOutline /></button></div>
          </div>
          <BlockFields b={b} set={(p) => upd(i, p)} uploadImage={uploadImage} uploadAudio={uploadAudio} page={page} />
        </div>
      ))}
      <div className="jr-add" data-testid="journal-add-block">
        <span className="mono">AJOUTER</span>
        {BLOCK_TYPES.map((t) => <button key={t.type} type="button" data-testid={`journal-add-${t.type}`} onClick={() => onChange([...blocks, { type: t.type, _k: Math.random().toString(36).slice(2) }])}>+ {t.label}</button>)}
      </div>
    </div>
  );
}
