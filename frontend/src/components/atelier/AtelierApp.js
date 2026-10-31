import { useEffect, useRef, useState } from "react";
import { IoPlanetOutline, IoFileTrayOutline, IoCheckboxOutline, IoSettingsOutline, IoExitOutline, IoSearch, IoGridOutline, IoExpandOutline, IoContractOutline } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { useAtelier } from "@/lib/atelier";
import { SoundBtn } from "@/components/StationMenu";
import QuartierView from "@/components/atelier/QuartierView";
import UniverseView from "@/components/atelier/UniverseView";
import UniversesHub from "@/components/atelier/UniversesHub";
import ItemsGrid from "@/components/atelier/ItemsGrid";
import CockpitView from "@/components/atelier/CockpitView";
import AtelierSettings from "@/components/atelier/AtelierSettings";
import ItemEditor from "@/components/atelier/ItemEditor";
import UniverseForm from "@/components/atelier/UniverseForm";
import CommandPalette from "@/components/atelier/CommandPalette";
import DropDialog from "@/components/atelier/DropDialog";
import { Player } from "@/components/atelier/AppScreens";
import "@/components/atelier/mobile.css";
import { BureauView, SalonView } from "@/components/atelier/BureauSalon";
import { IoAppsOutline, IoFilmOutline } from "react-icons/io5";
import BunnyPanel from "@/components/atelier/BunnyPanel";
import FileViewer from "@/components/atelier/FileViewer";
import { ContextMenuHost, itemDrop } from "@/components/atelier/ContextMenu";
import { dropToUniverse } from "@/components/atelier/itemActions";
import { ShortcutBar, runShortcut } from "@/components/atelier/Shortcuts";
import BunnyBrains from "@/components/atelier/BunnyBrains";
import BunnySprite from "@/components/atelier/BunnySprite";
import FocusView from "@/components/atelier/FocusView";
import RadioView, { useRadio, RadioEngine, RadioBar } from "@/components/atelier/Radio";
import { IoRadioOutline } from "react-icons/io5";
import OeuvreView from "@/components/atelier/OeuvreView";
import OeuvreForm from "@/components/atelier/OeuvreForm";

const Dock = ({ icon, label, sub, on, onClick, testid, color, kanji, badge, drop }) => (
  <button className={"at-dock-b" + (on ? " on" : "")} onClick={onClick} data-testid={testid} title={label} {...(drop ? itemDrop(drop) : {})}>
    <span className="ic" style={color ? { color } : undefined}>{kanji ? <b>{kanji}</b> : icon}</span>
    <span className="tx"><span className="lb">{label}{badge > 0 && <span className="bd">{badge}</span>}</span>{sub && <span className="sb mono">// {sub}</span>}</span>
  </button>
);
const soundBtn = { borderColor: "var(--line)", borderRadius: "10px", color: "var(--text-primary)", background: "transparent" };

function FsBtn() {
  const [fs, setFs] = useState(typeof document !== "undefined" && !!document.fullscreenElement);
  useEffect(() => { const h = () => setFs(!!document.fullscreenElement); document.addEventListener("fullscreenchange", h); return () => document.removeEventListener("fullscreenchange", h); }, []);
  const toggle = () => { try { if (document.fullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document); else { const el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el); } } catch (_) {} };
  return <button className="at-icon" onClick={toggle} title={fs ? "Quitter le plein écran" : "Plein écran"} data-testid="atelier-fullscreen">{fs ? <IoContractOutline size={17} /> : <IoExpandOutline size={17} />}</button>;
}

function ShipClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span className="at-shipclock mono" data-testid="atelier-shipclock">{t.toLocaleTimeString("fr-FR")} · AN {t.getFullYear() + 2000}</span>;
}

export default function AtelierApp({ onLeave }) {
  const { sfx } = useApp();
  const at = useAtelier();
  const [view, setView] = useState({ name: "home" });
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [uForm, setUForm] = useState(null);
  const [oForm, setOForm] = useState(null);
  const [palette, setPalette] = useState(false);
  const [drop, setDrop] = useState(null);
  const [screen, setScreen] = useState(null);
  const [bunny, setBunny] = useState(false);
  const [bnMode, setBnMode] = useState(() => localStorage.getItem("nexus-bunny-m") || "bar");
  const [scrolling, setScrolling] = useState(false);
  useEffect(() => { const on = () => setBnMode(localStorage.getItem("nexus-bunny-m") || "bar"); window.addEventListener("nexus-bunny-m", on); return () => window.removeEventListener("nexus-bunny-m", on); }, []);
  useEffect(() => {
    if (bnMode !== "hide") return;
    let t; const on = () => { setScrolling(true); clearTimeout(t); t = setTimeout(() => setScrolling(false), 900); };
    document.addEventListener("scroll", on, { capture: true, passive: true }); return () => document.removeEventListener("scroll", on, { capture: true });
  }, [bnMode]);
  const [brains, setBrains] = useState(false);
  const [focusMode, setFocusMode] = useState(() => window.location.hash === "#focus");
  const radio = useRadio(at);
  useEffect(() => { if (screen || focusMode) radio.pause(); }, [screen, focusMode]); // eslint-disable-line
  const [dockOpen, setDockOpen] = useState(() => { try { return localStorage.getItem("nexus-dock") !== "0"; } catch (_) { return true; } });
  const toggleDock = () => setDockOpen((o) => { const n = !o; try { localStorage.setItem("nexus-dock", n ? "1" : "0"); } catch (_) {} return n; });
  const [menuOpen, setMenuOpen] = useState(false);
  const launch = (s) => { sfx("select"); setScreen(s); };
  const setMini = (s) => setScreen(s && { ...s, mini: true });
  const [dragging, setDragging] = useState(false);
  const pick = useRef(null);
  const pickDefaults = useRef({});
  const go = (v) => { sfx("nav"); setView(v); setPalette(false); setMenuOpen(false); window.history.pushState({ ...window.history.state, atView: v }, ""); };
  // Bouton retour (téléphone / navigateur) : revient à l'écran précédent de l'Atelier au lieu de quitter
  useEffect(() => {
    const on = (e) => { setMenuOpen(false); setView(e.state?.atView || { name: "home" }); };
    window.addEventListener("popstate", on); return () => window.removeEventListener("popstate", on);
  }, []);
  const open = (id, kind) => { sfx("select"); setPalette(false); if ((kind || at.items.find((x) => x.id === id)?.kind) === "file") setViewing(id); else setEditing(id); };
  const inbox = at.items.filter((i) => !i.universe_id);
  const pinned = at.universes.filter((u) => u.pinned);
  const cur = view.name === "universe" ? at.universes.find((u) => u.id === view.id) : null;
  const importDocs = (defaults = {}) => { pickDefaults.current = defaults; pick.current?.click(); };
  const ctx = { at, go, open, launch, mini: (s) => setMini(s), editUniverse: setUForm, editOeuvre: setOForm, importDocs, openBrains: () => setBrains(true) };

  useEffect(() => {
    let depth = 0;
    const has = (e) => [...(e.dataTransfer?.types || [])].some((t) => t === "Files" || t === "text/uri-list");
    const enter = (e) => { if (editing || viewing || !has(e)) return; depth++; setDragging(true); };
    const leave = () => { depth = Math.max(0, depth - 1); if (!depth) setDragging(false); };
    const over = (e) => { if (!editing && has(e)) e.preventDefault(); };
    const dropIt = (e) => {
      if (editing) return;
      e.preventDefault(); depth = 0; setDragging(false);
      const files = [...(e.dataTransfer?.files || [])];
      const text = e.dataTransfer?.getData("text/uri-list") || e.dataTransfer?.getData("text/plain") || "";
      if (files.length || /^https?:/i.test(text)) setDrop({ files, text: files.length ? "" : text, defaults: view.name === "universe" ? { universe_id: view.id } : {} });
    };
    window.addEventListener("dragenter", enter); window.addEventListener("dragleave", leave); window.addEventListener("dragover", over); window.addEventListener("drop", dropIt);
    return () => { window.removeEventListener("dragenter", enter); window.removeEventListener("dragleave", leave); window.removeEventListener("dragover", over); window.removeEventListener("drop", dropIt); };
  }, [editing, viewing, view]);

  useEffect(() => { if (view.name === "universe" && !cur) setView({ name: "universes" }); }, [cur, view.name]);
  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);
  const crumb = { home: "PONT DE COMMANDEMENT", universes: "ARCHIVES DES UNIVERS", inbox: "INBOX", tasks: "COCKPIT", settings: "RÉGLAGES", bureau: "BUREAU NUMÉRIQUE", salon: "SALON", radio: "RADIO NEXUS", oeuvre: "ŒUVRE" }[view.name] || (cur?.name || "").toUpperCase();

  return (
    <div className={"at-app cov-" + (at.config.cover_ratio || "std") + " bnm-" + bnMode + (scrolling ? " is-scrolling" : "") + (radio.pl ? " has-radio" : "") + (menuOpen ? " menu-open" : "")} data-testid="atelier-app">
      <div className="at-hudlines" aria-hidden="true" />
      <header className="at-top">
        <div className="at-brand" onClick={() => go({ name: "home" })} role="button" style={{ cursor: "pointer" }} data-testid="atelier-logo-home"><b>工房</b><span><em>ATELIER NEXUS</em><small className="mono">// {crumb}</small></span></div>
        <button className="at-search" onClick={() => { sfx("nav"); setPalette(true); }} data-testid="atelier-search-open"><IoSearch size={15} /><span>Rechercher un univers, une fiche, une scène…</span><kbd className="mono">Ctrl K</kbd></button>
        <div className="at-top-r">
          <ShipClock />
          <SoundBtn btn={soundBtn} />
          <FsBtn />
          <button className="at-icon" onClick={() => go({ name: "settings" })} title="Réglages de l'Atelier" data-testid="atelier-settings-top"><IoSettingsOutline size={17} /></button>
          <button className="at-icon" onClick={() => { sfx("back"); onLeave(); }} title="Retour à la Station" data-testid="atelier-leave-top"><IoExitOutline size={17} /></button>
          <button className={"at-burger" + (menuOpen ? " on" : "")} onClick={() => { sfx("nav"); setMenuOpen((o) => !o); }} title="Menu" aria-label="Menu" data-testid="atelier-menu-toggle"><i /><i /><i /></button>
        </div>
      </header>

      <div className="at-body">
        {menuOpen && <div className="at-drawer-scrim" onClick={() => setMenuOpen(false)} data-testid="atelier-menu-scrim" />}
        <aside className={"at-dock" + (dockOpen ? "" : " collapsed")} data-testid="atelier-dock" onClick={(e) => e.target.closest(".at-dock-b") && setMenuOpen(false)}>
          <div className="at-dock-head">
            <button className="at-dock-toggle" onClick={toggleDock} title={dockOpen ? "Replier le menu" : "Déployer le menu"} aria-label="Replier ou déployer le menu" data-testid="atelier-dock-toggle">{dockOpen ? "‹‹" : "››"}</button>
          </div>
          <Dock icon={<IoPlanetOutline size={18} />} label="Pont" sub="POSTE DE COMMANDEMENT" on={view.name === "home"} onClick={() => go({ name: "home" })} testid="atelier-nav-home" />
          <Dock icon={<IoGridOutline size={18} />} label="Univers" sub="TES MONDES & ŒUVRES" on={view.name === "universes" || view.name === "universe" || view.name === "oeuvre"} onClick={() => go({ name: "universes" })} testid="atelier-nav-universes" />
          <Dock icon={<IoSearch size={18} />} label="Recherche" sub="TROUVE TOUT · CTRL K" onClick={() => setPalette(true)} testid="atelier-nav-search" />
          <Dock icon={<IoFileTrayOutline size={18} />} label="Inbox" sub="IDÉES EN VRAC" badge={inbox.length} on={view.name === "inbox"} onClick={() => go({ name: "inbox" })} testid="atelier-nav-inbox" drop={dropToUniverse(at, null)} />
          <Dock icon={<IoCheckboxOutline size={18} />} label="Cockpit" sub="TES TÂCHES" badge={at.tasks.filter((t) => !t.done).length} on={view.name === "tasks"} onClick={() => go({ name: "tasks" })} testid="atelier-nav-tasks" />
          <Dock icon={<IoAppsOutline size={18} />} label="Bureau" sub="TES OUTILS À BORD" on={view.name === "bureau"} onClick={() => go({ name: "bureau" })} testid="atelier-nav-bureau" />
          <Dock kanji="兎" label="Bunny" sub="TON COPILOTE" on={bunny} onClick={() => { sfx("select"); setBunny((b) => !b); }} testid="atelier-nav-bunny" />
          <Dock icon={<IoFilmOutline size={18} />} label="Salon" sub="TON NETFLIX PERSO" on={view.name === "salon"} onClick={() => go({ name: "salon" })} testid="atelier-nav-salon" />
          <Dock icon={<IoRadioOutline size={18} />} label="Radio" sub="TA RADIO NEXUS" on={view.name === "radio"} onClick={() => go({ name: "radio" })} testid="atelier-nav-radio" />
          <Dock kanji="禅" label="Focus" sub="ESPACE IMMERSIF" on={focusMode} onClick={() => { sfx("select"); setFocusMode(true); }} testid="atelier-nav-focus" />
          {pinned.length > 0 && <div className="at-dock-sep mono">ÉPINGLÉS</div>}
          <div className="at-dock-unis">
            {pinned.map((u) => <Dock key={u.id} kanji={u.kanji || u.name[0]} color={u.color} label={u.name} on={view.id === u.id} onClick={() => go({ name: "universe", id: u.id })} testid={`atelier-nav-universe-${u.id}`} drop={dropToUniverse(at, u.id)} />)}
          </div>
          <div className="at-dock-foot">
            <Dock icon={<IoSettingsOutline size={18} />} label="Réglages" sub="COMPTE · THÈME" on={view.name === "settings"} onClick={() => go({ name: "settings" })} testid="atelier-nav-settings" />
            <Dock icon={<IoExitOutline size={18} />} label="Station" sub="RETOUR PUBLIC" onClick={() => { sfx("back"); onLeave(); }} testid="atelier-leave" />
          </div>
        </aside>

        <main className="at-main" key={view.name + (view.id || "")}>
          <div className="at-frame" aria-hidden="true"><i /><i /><i /><i /></div>
          {view.name === "home" && <QuartierView {...ctx} />}
          {view.name === "universes" && <UniversesHub {...ctx} />}
          {view.name === "universe" && cur && <UniverseView {...ctx} universe={cur} />}
          {view.name === "oeuvre" && <OeuvreView {...ctx} id={view.id} />}
          {view.name === "inbox" && (
            <section className="at-view">
              <header className="at-head"><p className="at-eyebrow mono">// IDÉES EN VRAC</p><h1>Inbox</h1><p className="at-sub">Tout ce que tu notes sans univers atterrit ici. Range-le quand tu veux.</p></header>
              <ItemsGrid {...ctx} items={inbox} newDefaults={{ universe_id: null }} empty="Rien en attente — l'esprit est clair." />
            </section>
          )}
          {view.name === "tasks" && <CockpitView {...ctx} />}
          {view.name === "settings" && <AtelierSettings {...ctx} />}
          {view.name === "bureau" && <BureauView {...ctx} launch={launch} />}
          {view.name === "salon" && <SalonView {...ctx} launch={launch} mini={(s) => setMini(s)} />}
          {view.name === "radio" && <RadioView radio={radio} />}
        </main>
      </div>

      <ShortcutBar onBunny={bnMode === "bar" ? () => { sfx("select"); setBunny(true); } : null} at={at} onAdd={() => go({ name: "settings" })} run={(s) => runShortcut(s, { at, go, open, launch, action: (v) => (v === "search" ? setPalette(true) : v === "bunny" ? setBunny(true) : setFocusMode(true)) })} />
      <input ref={pick} type="file" multiple hidden onChange={(e) => { const files = [...e.target.files]; e.target.value = ""; if (files.length) setDrop({ files, text: "", defaults: pickDefaults.current }); }} data-testid="atelier-import-input" />
      {dragging && <div className="at-dropzone" data-testid="atelier-dropzone"><div><b>工</b><p>Dépose ici — tu choisiras où le ranger</p><small className="mono">PDF · WORD · EXCEL · IMAGES · MUSIQUES · VIDÉOS · LIENS · TOUT FICHIER</small></div></div>}
      {drop && <DropDialog at={at} drop={drop} defaults={drop.defaults} open={open} onClose={() => setDrop(null)} />}
      {screen && <Player screen={screen} onClose={() => setScreen(null)} onNavigate={setScreen} />}
      <RadioEngine radio={radio} />
      {!focusMode && <RadioBar radio={radio} onOpen={() => go({ name: "radio" })} />}}
      {palette && <CommandPalette {...ctx} onClose={() => setPalette(false)} newUniverse={() => { setPalette(false); setUForm({}); }} />}
      {!bunny && <div className="bn-fab"><BunnySprite pose="neutral" size={74} className="cb-bounce" onClick={() => { sfx("select"); setBunny(true); }} title="Cosmic Bunny" testid="bunny-open" /></div>}
      {bunny && <BunnyPanel at={at} universeId={view.name === "universe" ? view.id : null} onClose={() => setBunny(false)} openBrains={() => setBrains(true)} />}
      {brains && <BunnyBrains onClose={() => setBrains(false)} />}
      {focusMode && <FocusView at={at} onClose={() => setFocusMode(false)} />}
      <ContextMenuHost />
      {viewing && <FileViewer at={at} id={viewing} onClose={() => setViewing(null)} edit={(id) => { setViewing(null); setEditing(id); }} />}
      {editing && <ItemEditor {...ctx} id={editing} onClose={() => setEditing(null)} />}
      {uForm && <UniverseForm {...ctx} universe={uForm} onClose={(u) => { setUForm(null); if (u?.id) setView({ name: "universe", id: u.id }); }} />}
      {oForm && <OeuvreForm {...ctx} oeuvre={oForm} onClose={(o) => { setOForm(null); if (o?.id) setView({ name: "oeuvre", id: o.id }); }} />}
    </div>
  );
}
