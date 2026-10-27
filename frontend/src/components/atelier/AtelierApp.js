import { useEffect, useRef, useState } from "react";
import { IoPlanetOutline, IoFileTrayOutline, IoCheckboxOutline, IoSettingsOutline, IoExitOutline, IoSearch, IoGridOutline } from "react-icons/io5";
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
import { AppWindow, MiniPlayer } from "@/components/atelier/AppScreens";
import { BureauView, SalonView } from "@/components/atelier/BureauSalon";
import { IoAppsOutline, IoFilmOutline } from "react-icons/io5";
import BunnyPanel from "@/components/atelier/BunnyPanel";
import BunnyBrains from "@/components/atelier/BunnyBrains";
import BunnySprite from "@/components/atelier/BunnySprite";

const Dock = ({ icon, label, on, onClick, testid, color, kanji, badge }) => (
  <button className={"at-dock-b" + (on ? " on" : "")} onClick={onClick} data-testid={testid} title={label}>
    <span className="ic" style={color ? { color } : undefined}>{kanji ? <b>{kanji}</b> : icon}</span>
    <span className="lb">{label}</span>{badge > 0 && <span className="bd">{badge}</span>}
  </button>
);
const soundBtn = { borderColor: "var(--line)", borderRadius: "10px", color: "var(--text-primary)", background: "transparent" };

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
  const [uForm, setUForm] = useState(null);
  const [palette, setPalette] = useState(false);
  const [drop, setDrop] = useState(null);
  const [screen, setScreen] = useState(null);
  const [mini, setMini] = useState(null);
  const [bunny, setBunny] = useState(false);
  const [brains, setBrains] = useState(false);
  const launch = (s) => { sfx("select"); setScreen(s); };
  const toMini = (s) => { setScreen(null); setMini(s); };
  const [dragging, setDragging] = useState(false);
  const pick = useRef(null);
  const pickDefaults = useRef({});
  const go = (v) => { sfx("nav"); setView(v); setPalette(false); };
  const open = (id) => { sfx("select"); setPalette(false); setEditing(id); };
  const inbox = at.items.filter((i) => !i.universe_id);
  const pinned = at.universes.filter((u) => u.pinned);
  const cur = view.name === "universe" ? at.universes.find((u) => u.id === view.id) : null;
  const importDocs = (defaults = {}) => { pickDefaults.current = defaults; pick.current?.click(); };
  const ctx = { at, go, open, editUniverse: setUForm, importDocs, openBrains: () => setBrains(true) };

  useEffect(() => {
    let depth = 0;
    const has = (e) => [...(e.dataTransfer?.types || [])].some((t) => t === "Files" || t === "text/uri-list");
    const enter = (e) => { if (editing || !has(e)) return; depth++; setDragging(true); };
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
  }, [editing, view]);

  useEffect(() => { if (view.name === "universe" && !cur) setView({ name: "universes" }); }, [cur, view.name]);
  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);
  const crumb = { home: "PONT DE COMMANDEMENT", universes: "ARCHIVES DES UNIVERS", inbox: "INBOX", tasks: "COCKPIT", settings: "RÉGLAGES", bureau: "BUREAU NUMÉRIQUE", salon: "SALON" }[view.name] || (cur?.name || "").toUpperCase();

  return (
    <div className="at-app" data-testid="atelier-app">
      <div className="at-hudlines" aria-hidden="true" />
      <header className="at-top">
        <div className="at-brand"><b>工房</b><span><em>ATELIER NEXUS</em><small className="mono">// {crumb}</small></span></div>
        <button className="at-search" onClick={() => { sfx("nav"); setPalette(true); }} data-testid="atelier-search-open"><IoSearch size={15} /><span>Rechercher un univers, une fiche, une scène…</span><kbd className="mono">Ctrl K</kbd></button>
        <div className="at-top-r">
          <ShipClock />
          <SoundBtn btn={soundBtn} />
          <button className="at-icon" onClick={() => go({ name: "settings" })} title="Réglages de l'Atelier" data-testid="atelier-settings-top"><IoSettingsOutline size={17} /></button>
          <button className="at-icon" onClick={() => { sfx("back"); onLeave(); }} title="Retour à la Station" data-testid="atelier-leave-top"><IoExitOutline size={17} /></button>
        </div>
      </header>

      <div className="at-body">
        <aside className="at-dock" data-testid="atelier-dock">
          <Dock icon={<IoPlanetOutline size={18} />} label="Pont" on={view.name === "home"} onClick={() => go({ name: "home" })} testid="atelier-nav-home" />
          <Dock icon={<IoGridOutline size={18} />} label="Univers" badge={0} on={view.name === "universes" || view.name === "universe"} onClick={() => go({ name: "universes" })} testid="atelier-nav-universes" />
          <Dock icon={<IoSearch size={18} />} label="Recherche" onClick={() => setPalette(true)} testid="atelier-nav-search" />
          <Dock icon={<IoFileTrayOutline size={18} />} label="Inbox" badge={inbox.length} on={view.name === "inbox"} onClick={() => go({ name: "inbox" })} testid="atelier-nav-inbox" />
          <Dock icon={<IoCheckboxOutline size={18} />} label="Cockpit" badge={at.tasks.filter((t) => !t.done).length} on={view.name === "tasks"} onClick={() => go({ name: "tasks" })} testid="atelier-nav-tasks" />
          <Dock icon={<IoAppsOutline size={18} />} label="Bureau" on={view.name === "bureau"} onClick={() => go({ name: "bureau" })} testid="atelier-nav-bureau" />
          <Dock kanji="兎" label="Bunny" on={bunny} onClick={() => { sfx("select"); setBunny((b) => !b); }} testid="atelier-nav-bunny" />
          <Dock icon={<IoFilmOutline size={18} />} label="Salon" on={view.name === "salon"} onClick={() => go({ name: "salon" })} testid="atelier-nav-salon" />
          {pinned.length > 0 && <div className="at-dock-sep mono">ÉPINGLÉS</div>}
          <div className="at-dock-unis">
            {pinned.map((u) => <Dock key={u.id} kanji={u.kanji || u.name[0]} color={u.color} label={u.name} on={view.id === u.id} onClick={() => go({ name: "universe", id: u.id })} testid={`atelier-nav-universe-${u.id}`} />)}
          </div>
          <div className="at-dock-foot">
            <Dock icon={<IoSettingsOutline size={18} />} label="Réglages" on={view.name === "settings"} onClick={() => go({ name: "settings" })} testid="atelier-nav-settings" />
            <Dock icon={<IoExitOutline size={18} />} label="Station" onClick={() => { sfx("back"); onLeave(); }} testid="atelier-leave" />
          </div>
        </aside>

        <main className="at-main" key={view.name + (view.id || "")}>
          <div className="at-frame" aria-hidden="true"><i /><i /><i /><i /></div>
          {view.name === "home" && <QuartierView {...ctx} />}
          {view.name === "universes" && <UniversesHub {...ctx} />}
          {view.name === "universe" && cur && <UniverseView {...ctx} universe={cur} />}
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
        </main>
      </div>

      <input ref={pick} type="file" multiple hidden accept=".pdf,.docx,.txt,.md,image/*,audio/*,video/*" onChange={(e) => { const files = [...e.target.files]; e.target.value = ""; if (files.length) setDrop({ files, text: "", defaults: pickDefaults.current }); }} data-testid="atelier-import-input" />
      {dragging && <div className="at-dropzone" data-testid="atelier-dropzone"><div><b>工</b><p>Dépose ici — tu choisiras où le ranger</p><small className="mono">PDF · WORD · IMAGES · MUSIQUES · VIDÉOS · LIENS</small></div></div>}
      {drop && <DropDialog at={at} drop={drop} defaults={drop.defaults} open={open} onClose={() => setDrop(null)} />}
      {screen && <AppWindow screen={screen} onClose={() => setScreen(null)} onMini={toMini} onNavigate={setScreen} />}
      {mini && <MiniPlayer mini={mini} onClose={() => setMini(null)} onExpand={(s) => { setMini(null); setScreen(s); }} />}
      {palette && <CommandPalette {...ctx} onClose={() => setPalette(false)} newUniverse={() => { setPalette(false); setUForm({}); }} />}
      {!bunny && <div className="bn-fab"><BunnySprite pose="neutral" size={74} className="cb-bounce" onClick={() => { sfx("select"); setBunny(true); }} title="Cosmic Bunny" testid="bunny-open" /></div>}
      {bunny && <BunnyPanel at={at} universeId={view.name === "universe" ? view.id : null} onClose={() => setBunny(false)} openBrains={() => setBrains(true)} />}
      {brains && <BunnyBrains onClose={() => setBrains(false)} />}
      {editing && <ItemEditor {...ctx} id={editing} onClose={() => setEditing(null)} />}
      {uForm && <UniverseForm {...ctx} universe={uForm} onClose={(u) => { setUForm(null); if (u?.id) setView({ name: "universe", id: u.id }); }} />}
    </div>
  );
}
