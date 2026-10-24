import { useState } from "react";
import { IoArrowUp, IoArrowDown, IoTrashOutline, IoImageOutline } from "react-icons/io5";
import { toast } from "sonner";
import { uploadJournalImage, mediaUrl } from "@/lib/api";
import { youtubeId } from "@/components/journal/JournalParts";

export const BLOCK_TYPES = [
  { type: "text", label: "Texte" }, { type: "heading", label: "Titre" }, { type: "image", label: "Image" },
  { type: "gallery", label: "Galerie" }, { type: "sketch", label: "Croquis" }, { type: "youtube", label: "YouTube" }, { type: "quote", label: "Citation" },
];
const LABEL = Object.fromEntries(BLOCK_TYPES.map((b) => [b.type, b.label]));

// envoi d'une ou plusieurs images -> URLs
export function ImagePick({ multiple, onDone, label = "Choisir une image", testid }) {
  const [busy, setBusy] = useState(false);
  const pick = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try { const urls = []; for (const f of files) urls.push((await uploadJournalImage(f)).url); onDone(urls); }
    catch (e) { toast.error(e?.response?.data?.detail || "Envoi de l'image impossible"); }
    setBusy(false);
  };
  return (
    <label className="jr-pick" data-testid={testid}>
      <IoImageOutline /> {busy ? "Envoi…" : label}
      <input type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => pick([...e.target.files])} />
    </label>
  );
}

function BlockFields({ b, set }) {
  const cap = <input className="jr-in" placeholder="Légende (facultatif)" value={b.caption || ""} onChange={(e) => set({ caption: e.target.value })} />;
  switch (b.type) {
    case "text": return <textarea className="jr-in" rows={6} placeholder="Écris ici… (ligne vide = nouveau paragraphe)" value={b.text || ""} onChange={(e) => set({ text: e.target.value })} />;
    case "heading": return <input className="jr-in jr-in-h" placeholder="Intertitre" value={b.text || ""} onChange={(e) => set({ text: e.target.value })} />;
    case "quote": return <><textarea className="jr-in" rows={3} placeholder="Citation" value={b.text || ""} onChange={(e) => set({ text: e.target.value })} /><input className="jr-in" placeholder="Auteur (facultatif)" value={b.author || ""} onChange={(e) => set({ author: e.target.value })} /></>;
    case "youtube": return <><input className="jr-in" placeholder="Lien YouTube" value={b.url || ""} onChange={(e) => set({ url: e.target.value })} />{b.url && !youtubeId(b.url) && <small className="jr-warn">Lien YouTube non reconnu</small>}{cap}</>;
    case "gallery": return (
      <>
        <div className="jr-thumbs">{(b.urls || []).map((u, i) => <span key={u + i}><img src={mediaUrl(u)} alt="" /><button onClick={() => set({ urls: b.urls.filter((_, k) => k !== i) })} aria-label="Retirer">×</button></span>)}</div>
        <ImagePick multiple label="Ajouter des images" onDone={(urls) => set({ urls: [...(b.urls || []), ...urls] })} />{cap}
      </>
    );
    default: return ( // image / croquis
      <>
        {b.url && <img className="jr-prev" src={mediaUrl(b.url)} alt="" />}
        <div className="flex flex-wrap items-center gap-3">
          <ImagePick label={b.url ? "Remplacer" : b.type === "sketch" ? "Importer le croquis" : "Choisir une image"} onDone={([u]) => set({ url: u })} />
          {b.type === "image" && <label className="jr-check"><input type="checkbox" checked={!!b.wide} onChange={(e) => set({ wide: e.target.checked })} /> Pleine largeur</label>}
        </div>
        {cap}
      </>
    );
  }
}

export function BlocksEditor({ blocks, onChange }) {
  const upd = (i, p) => onChange(blocks.map((b, k) => (k === i ? { ...b, ...p } : b)));
  const move = (i, d) => { const n = [...blocks]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="jr-blocks" data-testid="journal-blocks">
      {blocks.map((b, i) => (
        <div key={b._k} className="jr-block" data-testid={`journal-block-${i}`}>
          <div className="jr-block-bar">
            <span className="mono">{LABEL[b.type]}</span>
            <div><button onClick={() => move(i, -1)} aria-label="Monter"><IoArrowUp /></button><button onClick={() => move(i, 1)} aria-label="Descendre"><IoArrowDown /></button><button onClick={() => onChange(blocks.filter((_, k) => k !== i))} aria-label="Supprimer le bloc"><IoTrashOutline /></button></div>
          </div>
          <BlockFields b={b} set={(p) => upd(i, p)} />
        </div>
      ))}
      <div className="jr-add" data-testid="journal-add-block">
        <span className="mono">AJOUTER</span>
        {BLOCK_TYPES.map((t) => <button key={t.type} data-testid={`journal-add-${t.type}`} onClick={() => onChange([...blocks, { type: t.type, _k: Math.random().toString(36).slice(2) }])}>+ {t.label}</button>)}
      </div>
    </div>
  );
}
