import { useRef, useState } from "react";
import { IoMusicalNotes, IoKeypadOutline, IoDownloadOutline, IoTrashOutline } from "react-icons/io5";
import { toast } from "sonner";
import { uploadJournalImage } from "@/lib/api";
import { atelierApi } from "@/lib/atelier";
import { THEMES } from "@/lib/themes";
import { useApp } from "@/context/AppContext";

export default function AtelierSettings({ at }) {
  const { theme, setTheme, sfx } = useApp();
  const [code, setCode] = useState(at.config.code || "");
  const [busy, setBusy] = useState(false);
  const file = useRef(null);

  const saveCode = async () => {
    if (!/^\d{3,8}$/.test(code)) return toast.error("Le code doit contenir 3 à 8 chiffres");
    await at.saveConfig({ code }); toast.success("Code du portail mis à jour");
  };
  const uploadMusic = async (f) => {
    if (!f) return;
    if (!f.type.startsWith("audio/")) return toast.error("Choisis un fichier audio");
    setBusy(true);
    try { const r = await uploadJournalImage(f); await at.saveConfig({ music_url: r.url, music_title: f.name.replace(/\.[^.]+$/, "") }); toast.success("Musique du portail enregistrée — elle jouera au prochain passage"); }
    catch { toast.error("Envoi impossible (max 25 Mo)"); }
    finally { setBusy(false); }
  };
  const backup = async () => {
    const data = await atelierApi.exportAll();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = `atelier-nexus-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    toast.success("Sauvegarde téléchargée");
  };

  return (
    <section className="at-view" data-testid="atelier-settings">
      <header className="at-head"><p className="at-eyebrow mono">// RÉGLAGES</p><h1>Réglages de l'Atelier</h1></header>
      <div className="at-panel">
        <div className="at-panel-h"><h2>Thème du pont</h2></div>
        <p className="at-sub">Les thèmes de la Station habillent aussi l'Atelier. La musique d'ambiance se règle avec le bouton ♪ en haut (lecteur et musiques de la Station).</p>
        <div className="at-themes" data-testid="atelier-themes">
          {THEMES.map((t) => (
            <button key={t.key} className={theme === t.key ? "on" : ""} onClick={() => { sfx("select"); setTheme(t.key); }} data-testid={`atelier-theme-${t.key}`}>
              <span className="sw">{t.swatch.map((c) => <i key={c} style={{ background: c }} />)}</span>
              <b>{t.kanji} {t.name}</b>
            </button>
          ))}
        </div>
      </div>
      <div className="at-panel">
        <div className="at-panel-h"><h2><IoKeypadOutline size={16} /> Code du portail</h2></div>
        <p className="at-sub">Tape ce code n'importe où dans la Station (connecté en admin) pour ouvrir le portail.</p>
        <div className="at-inline">
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" className="code mono" data-testid="atelier-code-input" />
          <button className="at-btn" onClick={saveCode} data-testid="atelier-code-save">Enregistrer</button>
        </div>
      </div>
      <div className="at-panel">
        <div className="at-panel-h"><h2><IoMusicalNotes size={16} /> Musique du portail</h2></div>
        <p className="at-sub">Elle accompagne le voyage pendant le chargement, puis s'estompe à l'arrivée sur le pont.</p>
        <div className="at-inline">
          <span className="mono" data-testid="atelier-music-title">{at.config.music_url ? `♪ ${at.config.music_title || "Piste importée"}` : "Aucune musique pour l'instant"}</span>
          <button className="at-btn" disabled={busy} onClick={() => file.current?.click()} data-testid="atelier-music-upload">{busy ? "Envoi…" : at.config.music_url ? "Changer" : "Importer une musique"}</button>
          {at.config.music_url && <button className="at-btn ghost" onClick={() => at.saveConfig({ music_url: "", music_title: "" })} aria-label="Retirer"><IoTrashOutline size={15} /></button>}
          <input ref={file} hidden type="file" accept="audio/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; uploadMusic(f); }} />
        </div>
      </div>
      <div className="at-panel">
        <div className="at-panel-h"><h2><IoDownloadOutline size={16} /> Sauvegarde complète</h2></div>
        <p className="at-sub">Télécharge tout ton Atelier (univers, éléments, tâches et historique des versions) dans un fichier, à garder en lieu sûr.</p>
        <button className="at-btn" onClick={backup} data-testid="atelier-backup">Télécharger la sauvegarde</button>
      </div>
    </section>
  );
}
