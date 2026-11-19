import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { IoClose, IoDownloadOutline, IoShareSocialOutline, IoCopyOutline } from "react-icons/io5";
import { shareCardBlob, worldPalette } from "@/lib/shareCard";

/*
  La carte Instagram d'une sortie (œuvre, chapitre, épisode) : aperçu, télécharger, ou partager tout de suite depuis le téléphone.
*/
const longDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + " · " + new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");

export default function ShareCardDialog({ item, unit, onClose, poster }) {
  // unit : { kind: "chapter"|"episode", index, title, release_at } ; sans unit : l'œuvre elle-même
  const future = unit?.release_at && new Date(unit.release_at) > new Date();
  const [mode, setMode] = useState(future ? "date" : "now");
  const [url, setUrl] = useState(null); const [blob, setBlob] = useState(null);
  const link = `${window.location.origin}/oeuvre/${item.id}`;
  const kicker = unit ? `${unit.kind === "episode" ? "Épisode" : (item.unit_label || "Chapitre")} ${unit.index}${unit.title ? " · " + unit.title : ""}` : (item.tagline ? item.tagline.slice(0, 60) : "Nouvelle œuvre");
  const when = mode === "date" && unit?.release_at ? `Sortie ${longDate(unit.release_at)}` : unit ? "Disponible maintenant sur la station" : "À découvrir sur la station";
  useEffect(() => {
    let alive = true; let made = null;
    const pal = worldPalette(document.querySelector('[data-testid="nexus-world"]'));
    shareCardBlob({ title: item.title, kicker, when, url: link, poster, pal }).then((b) => { if (!alive || !b) return; made = URL.createObjectURL(b); setBlob(b); setUrl(made); });
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const fname = `${item.title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-")}${unit ? "-" + unit.index : ""}-story.png`;
  const download = () => { if (!url) return; const a = document.createElement("a"); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); };
  const share = async () => {
    const f = blob && new File([blob], fname, { type: "image/png" });
    if (f && navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: item.title, text: link }); return; } catch (_) { return; } }
    download(); toast.info("Image téléchargée : ajoute-la à ta story depuis ta galerie");
  };
  return createPortal(
    <div className="sc-wrap" onClick={onClose} data-testid="share-card">
      <div className="sc-box" onClick={(e) => e.stopPropagation()}>
        <div className="sc-h"><b>Carte Instagram</b><button onClick={onClose} aria-label="Fermer"><IoClose size={18} /></button></div>
        <div className="sc-prev">{url ? <img src={url} alt={`Carte story de ${item.title}`} /> : <span className="sc-wait">Dessin de la carte…</span>}</div>
        {unit?.release_at && (
          <div className="sc-seg">
            <button className={mode === "now" ? "on" : ""} onClick={() => setMode("now")}>« Disponible maintenant »</button>
            <button className={mode === "date" ? "on" : ""} onClick={() => setMode("date")}>Annoncer la date</button>
          </div>
        )}
        <p className="sc-note">Format story 1080 × 1920, aux couleurs du monde. Dans Instagram, pose un sticker « Lien » sur le cadre du bas.</p>
        <div className="sc-acts">
          <button onClick={() => { navigator.clipboard?.writeText(link).then(() => toast.success("Lien copié")); }}><IoCopyOutline size={15} /> Copier le lien</button>
          <button onClick={download} disabled={!url} data-testid="share-card-dl"><IoDownloadOutline size={15} /> Télécharger</button>
          <button className="main" onClick={share} disabled={!url}><IoShareSocialOutline size={15} /> Partager</button>
        </div>
      </div>
    </div>, document.body
  );
}
