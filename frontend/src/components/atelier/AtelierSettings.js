import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoMusicalNotes, IoKeypadOutline, IoDownloadOutline, IoTrashOutline } from "react-icons/io5";
import { toast } from "sonner";
import { uploadJournalImage } from "@/lib/api";
import { atelierApi } from "@/lib/atelier";
import { useThemeList } from "@/lib/themeStore";
import { useApp } from "@/context/AppContext";
import { StartupSetting } from "@/components/Startup";
import ShortcutsManager from "@/components/atelier/ShortcutsManager";
import ThemeStudio from "@/components/ThemeStudio";

export default function AtelierSettings({ at, openBrains }) {
  const THEMES = useThemeList();
  const [studio, setStudio] = useState(false);
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
      {studio && createPortal(<ThemeStudio onClose={() => setStudio(false)} />, document.body)}
      <div className="at-panel">
        <div className="at-panel-h"><h2>Thème du pont</h2><button className="at-btn" onClick={() => setStudio(true)} data-testid="open-theme-studio">Atelier de thèmes</button></div>
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
        <div className="at-panel-h"><h2>Format des couvertures (PC)</h2></div>
        <p className="at-sub">Hauteur des images d'Univers et d'Œuvres sur grand écran.</p>
        <div className="at-inline" data-testid="atelier-cover-ratio">
          {[["std", "Actuel"], ["tall", "+30 %"], ["poster", "Affiche 2:3"]].map(([k, l]) => (
            <button key={k} className={"at-btn" + ((at.config.cover_ratio || "std") === k ? "" : " ghost")} onClick={() => at.saveConfig({ cover_ratio: k })} data-testid={`atelier-cover-${k}`}>{l}</button>
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
      <div className="at-panel" data-testid="atelier-settings-nav">
        <div className="at-panel-h"><h2>航 Navigation sur téléphone</h2></div>
        <p className="at-sub">Choisis comment tu navigues sur téléphone. Le <b>Hub mobile</b> remplace le menu par une grille d'espaces (swipe du bas pour l'ouvrir, note rapide, raccourcis). Les styles ne changent que l'allure des boutons — le reste suit le thème de la Station.</p>
        <NavModeSetting sfx={sfx} />
      </div>
      <div className="at-panel" data-testid="atelier-settings-shortcuts">
        <div className="at-panel-h"><h2>捷 Raccourcis du téléphone</h2></div>
        <p className="at-sub">La barre du bas sur téléphone n'affiche que ces raccourcis (elle défile, se déploie ou se range en bas).</p>
        <ShortcutsManager at={at} />
      </div>
      <div className="at-panel">
        <div className="at-panel-h"><h2>兎 Bunny sur téléphone</h2></div>
        <p className="at-sub">Où Bunny se place sur cet appareil.</p>
        <BunnyMobileSetting />
      </div>
      <div className="at-panel">
        <div className="at-panel-h"><h2>起 Démarrage</h2></div>
        <p className="at-sub">Choisis ce qui s'ouvre quand tu lances l'app sur cet appareil.</p>
        <StartupSetting />
      </div>
      <div className="at-panel">
        <div className="at-panel-h"><h2>兎 Cerveaux de Bunny</h2></div>
        <p className="at-sub">Vois sur quelles IA Bunny tourne, ce qu'elle lit de ton lore, et ajoute des clés ou de nouveaux cerveaux quand tu veux.</p>
        <button className="at-btn" onClick={openBrains} data-testid="atelier-settings-brains">Ouvrir les cerveaux de Bunny</button>
      </div>
      <div className="at-panel">
        <div className="at-panel-h"><h2><IoDownloadOutline size={16} /> Sauvegarde complète</h2></div>
        <p className="at-sub">Télécharge tout ton Atelier (univers, éléments, tâches et historique des versions) dans un fichier, à garder en lieu sûr.</p>
        <button className="at-btn" onClick={backup} data-testid="atelier-backup">Télécharger la sauvegarde</button>
      </div>
    </section>
  );
}

function NavModeSetting({ sfx }) {
  const [mode, setMode] = useState(() => localStorage.getItem("nexus-nav-mode") || "hub");
  const [skin, setSkin] = useState(() => localStorage.getItem("nexus-hub-skin") || "glossy");
  const pickMode = (x) => { sfx("select"); localStorage.setItem("nexus-nav-mode", x); setMode(x); window.dispatchEvent(new Event("nexus-nav-mode")); };
  const pickSkin = (x) => { sfx("select"); localStorage.setItem("nexus-hub-skin", x); setSkin(x); window.dispatchEvent(new Event("nexus-hub-skin")); };
  const SKINS = [["glossy", "Brillant"], ["glass", "Verre"], ["neon", "Néon"], ["aurore", "Aurore"], ["encre", "Encre"], ["prisme", "Prisme"]];
  return (
    <div data-testid="nav-mode-setting">
      <div className="at-inline">
        {[["classic", "Classique"], ["hub", "Hub mobile"]].map(([k, l]) => (
          <button key={k} className={"at-btn" + (mode === k ? "" : " ghost")} onClick={() => pickMode(k)} data-testid={`nav-mode-${k}`}>{l}</button>
        ))}
      </div>
      {mode === "hub" && (
        <>
          <p className="at-sub" style={{ marginTop: 14 }}>Style des boutons du hub</p>
          <div className="at-inline" data-skin={skin} data-testid="hub-skin-setting">
            {SKINS.map(([k, l]) => (
              <button key={k} className={"at-btn" + (skin === k ? "" : " ghost")} onClick={() => pickSkin(k)} data-testid={`hub-skin-${k}`}>{l}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BunnyMobileSetting() {
  const [v, setV] = useState(() => localStorage.getItem("nexus-bunny-m") || "bar");
  const pick = (x) => { localStorage.setItem("nexus-bunny-m", x); setV(x); window.dispatchEvent(new Event("nexus-bunny-m")); };
  return (
    <div className="at-inline" data-testid="bunny-mobile-setting">
      {[["bar", "Dans la barre du bas"], ["hide", "Bulle qui se cache au défilement"], ["float", "Bulle classique"]].map(([k, l]) => (
        <button key={k} className={"at-btn" + (v === k ? "" : " ghost")} onClick={() => pick(k)} data-testid={`bunny-mobile-${k}`}>{l}</button>
      ))}
    </div>
  );
}
