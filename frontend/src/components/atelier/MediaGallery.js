import { useRef, useState } from "react";
import { IoAttach, IoLinkOutline, IoClose, IoDocumentOutline, IoOpenOutline, IoDownloadOutline } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi, imgSrc, mediaFromUpload, mediaFromText, useMediaClaim } from "@/lib/atelier";
import { FilePreview } from "@/components/atelier/FileViewer";

function MediaTile({ m, onRemove, onOpen }) {
  const src = imgSrc(m.url);
  const [playing, setPlaying] = useState(false);
  useMediaClaim(playing);
  const evs = { onPlay: () => setPlaying(true), onPause: () => setPlaying(false), onEnded: () => setPlaying(false) };
  let body;
  if (m.type === "image") body = <a href={src} target="_blank" rel="noreferrer"><img src={src} alt={m.name} loading="lazy" /></a>;
  else if (m.type === "audio") body = <div className="au"><span className="nm">♪ {m.name}</span><audio controls preload="none" src={src} {...evs} /></div>;
  else if (m.type === "video") body = <video controls preload="metadata" src={src} {...evs} />;
  else if (m.type === "youtube") body = playing
    ? <iframe title={m.name} src={`https://www.youtube.com/embed/${m.yt}?autoplay=1`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
    : <button className="yt" onClick={() => setPlaying(true)} data-testid={`atelier-media-yt-${m.id}`}><img src={`https://i.ytimg.com/vi/${m.yt}/hqdefault.jpg`} alt="" loading="lazy" /><span>▶</span></button>;
  else if (m.type === "pdf") body = <button type="button" className="doc" onClick={() => onOpen?.(m)} title="Lire dans la Station" data-testid={`atelier-media-open-${m.id}`}><IoDocumentOutline size={22} /><span className="nm">{m.name}</span><IoOpenOutline size={16} /></button>;
  else if (m.type === "link") body = <a className="doc" href={m.url} target="_blank" rel="noreferrer"><IoLinkOutline size={20} /><span className="nm">{m.name}<small>{m.url}</small></span><IoOpenOutline size={15} /></a>;
  else body = <a className="doc" href={src} download={m.name}><IoDocumentOutline size={22} /><span className="nm">{m.name}</span><IoDownloadOutline size={16} /></a>;
  return (
    <div className={`at-media t-${m.type}`} data-testid={`atelier-media-${m.id}`}>
      {body}
      {onRemove && <button className="rm" onClick={() => onRemove(m.id)} aria-label="Retirer"><IoClose size={13} /></button>}
    </div>
  );
}

// Médias d'un élément : fichiers, images, musiques écoutables, vidéos, PDF, YouTube, liens
export default function MediaGallery({ media = [], onChange }) {
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(0);
  const [view, setView] = useState(null);
  const file = useRef(null);
  const addFiles = async (files) => {
    const list = [...files]; if (!list.length) return;
    setBusy(list.length);
    const added = [];
    for (const f of list) {
      try { added.push(mediaFromUpload(await atelierApi.upload(f))); } catch (e) { toast.error(`${f.name} : ${e?.response?.data?.detail || "envoi impossible"}`); }
      setBusy((b) => b - 1);
    }
    if (added.length) onChange([...media, ...added]);
  };
  const addLink = () => { const m = mediaFromText(link); if (!m) return toast.error("Colle un lien qui commence par https://"); onChange([...media, m]); setLink(""); };
  return (
    <div className="at-gallery" data-testid="atelier-media-gallery">
      {media.length > 0 && <div className="at-media-grid">{media.map((m) => <MediaTile key={m.id} m={m} onRemove={(id) => onChange(media.filter((x) => x.id !== id))} onOpen={setView} />)}</div>}
      {view && (
        <div className="fv-wrap" style={{ zIndex: 50 }} data-testid="atelier-media-viewer">
          <div className="fv-bar">
            <div className="grow"><b>{view.name}</b></div>
            <a className="at-icon" href={imgSrc(view.url)} download={view.name} title="Télécharger"><IoDownloadOutline size={17} /></a>
            <button className="at-icon" onClick={() => setView(null)} title="Fermer" data-testid="atelier-media-viewer-close"><IoClose size={19} /></button>
          </div>
          <div className="fv-body"><div className="fv-main"><FilePreview m={view} /></div></div>
        </div>
      )}
      <div className="at-media-add">
        <button className="at-btn ghost" onClick={() => file.current?.click()} disabled={busy > 0} data-testid="atelier-media-upload"><IoAttach size={15} /> {busy ? `Envoi… (${busy})` : "Fichiers"}</button>
        <input ref={file} type="file" multiple hidden onChange={(e) => { const f = e.target.files; addFiles(f); e.target.value = ""; }} />
        <input value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLink()} placeholder="Lien ou YouTube…" data-testid="atelier-media-link" />
        <button className="at-icon" onClick={addLink} aria-label="Ajouter le lien" data-testid="atelier-media-link-add"><IoLinkOutline size={16} /></button>
      </div>
      <p className="at-hint">Astuce : glisse-dépose des fichiers n'importe où sur cette page.</p>
    </div>
  );
}

export { MediaTile };
