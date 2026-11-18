import { useRef, useState } from "react";
import { IoClose, IoColorPaletteOutline, IoImageOutline, IoCreateOutline, IoSparklesOutline } from "react-icons/io5";
import { toast } from "sonner";
import { getCreationFull, updateCreation } from "@/lib/api";
import { WORLD_STYLES, worldStyleOf } from "@/components/nexus/world";

const STYLE_HINT = {
  cinema: "Bandes noires, grand titre, menu de DVD", vhs: "Téléviseur cathodique, cassette, menu de magnétoscope",
  arcade: "Écran titre, police pixel, PRESS START", manga: "Cases à bord épais, bulle, onomatopée",
  vinyle: "Pochette, disque qui tourne, liste des pistes", roman: "Livre ouvert, page de titre, sommaire",
};
// Réduit une image avant de l'envoyer (fond du monde)
const shrink = (file, max = 1920) => new Promise((res, rej) => {
  const r = new FileReader(); r.onerror = rej;
  r.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.86)); }; img.onerror = rej; img.src = r.result; };
  r.readAsDataURL(file);
});

// Habiller le monde d'une œuvre, depuis l'œuvre elle-même : ambiance, couleur, fond, textes. L'éditeur complet reste à un clic.
export default function WorldStudio({ item, catLabel, onClose, onSaved, onFullEditor, onPreview }) {
  const [ws, setWs] = useState(item.world_style || "");
  const [accent, setAccent] = useState(item.accent || "");
  const [bg, setBg] = useState(null); // nouvelle image de fond (data URL) ou "" pour la retirer
  const [txt, setTxt] = useState({ title: item.title || "", tagline: item.tagline || "", synopsis: item.synopsis || "" });
  const [busy, setBusy] = useState(false);
  const file = useRef(null);
  const auto = worldStyleOf({ ...item, world_style: "" }, catLabel);
  // Aperçu en direct derrière le panneau
  const pv = (p) => onPreview?.({ ws, accent, ...p });
  const save = async () => {
    setBusy(true);
    try {
      const full = await getCreationFull(item.id);
      const patch = { ...txt, world_style: ws, accent };
      if (bg !== null) patch.bg_image = bg;
      await updateCreation(item.id, { ...full, ...patch });
      toast.success("Monde enregistré"); onSaved?.(); onClose();
    } catch (_) { toast.error("Enregistrement impossible (connecte-toi en admin)"); }
    setBusy(false);
  };
  return (
    <div className="wst-wrap" onClick={onClose} data-testid="world-studio">
      <aside className="wst" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Habiller ce monde">
        <header className="wst-h"><p className="mono">HABILLER CE MONDE</p><button onClick={onClose} aria-label="Fermer"><IoClose size={18} /></button></header>

        <p className="wst-l mono"><IoSparklesOutline size={13} /> AMBIANCE</p>
        <div className="wst-styles">
          <button className={!ws ? "on" : ""} onClick={() => { setWs(""); pv({ ws: "" }); }} data-testid="wst-style-auto"><b>Automatique</b><small>{WORLD_STYLES[auto]} (d'après le type de l'œuvre)</small></button>
          {Object.entries(WORLD_STYLES).map(([k, label]) => (
            <button key={k} className={(ws === k ? "on " : "") + "ws-" + k} onClick={() => { setWs(k); pv({ ws: k }); }} data-testid={`wst-style-${k}`}><b>{label}</b><small>{STYLE_HINT[k]}</small></button>
          ))}
        </div>

        <p className="wst-l mono"><IoColorPaletteOutline size={13} /> COULEUR</p>
        <div className="wst-row">
          <button className={!accent ? "wst-chip on" : "wst-chip"} onClick={() => { setAccent(""); pv({ accent: "" }); }}>Tirée de l'affiche</button>
          <label className={accent ? "wst-chip on" : "wst-chip"}><input type="color" value={accent || "#4d8dff"} onChange={(e) => { setAccent(e.target.value); pv({ accent: e.target.value }); }} /> Choisir</label>
          {accent && <span className="wst-sw" style={{ background: accent }} />}
        </div>

        <p className="wst-l mono"><IoImageOutline size={13} /> FOND DU MONDE</p>
        <div className="wst-row">
          <button className="wst-chip" onClick={() => file.current?.click()} data-testid="wst-bg">{bg ? "Image choisie ✓" : item.has_bg ? "Changer l'image" : "Choisir une image"}</button>
          {(item.has_bg || bg) && <button className="wst-chip" onClick={() => setBg("")}>Retirer (l'affiche sert de fond)</button>}
          <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) { try { setBg(await shrink(f)); } catch (_) { toast.error("Image illisible"); } } }} />
        </div>
        {bg && <span className="wst-prev" style={{ backgroundImage: `url(${bg})` }} />}

        <p className="wst-l mono"><IoCreateOutline size={13} /> TEXTES</p>
        <label className="wst-f"><span>Titre</span><input value={txt.title} onChange={(e) => setTxt({ ...txt, title: e.target.value })} /></label>
        <label className="wst-f"><span>Accroche</span><input value={txt.tagline} onChange={(e) => setTxt({ ...txt, tagline: e.target.value })} /></label>
        <label className="wst-f"><span>Résumé</span><textarea rows={4} value={txt.synopsis} onChange={(e) => setTxt({ ...txt, synopsis: e.target.value })} /></label>

        <footer className="wst-f-acts">
          <button className="wst-btn ghost" onClick={onFullEditor}>Éditeur complet (chapitres, épisodes, médias…)</button>
          <button className="wst-btn" onClick={save} disabled={busy} data-testid="wst-save">{busy ? "Enregistrement…" : "Enregistrer"}</button>
        </footer>
      </aside>
    </div>
  );
}
