import { useEffect, useRef, useState } from "react";
import {
  IoPlanetOutline, IoGridOutline, IoLibraryOutline, IoCheckboxOutline, IoAppsOutline,
  IoFilmOutline, IoRadioOutline, IoMoonOutline, IoFileTrayOutline, IoSparklesOutline,
  IoCodeSlashOutline, IoSettingsOutline, IoClose, IoCreateOutline,
  IoArrowForward, IoAddOutline, IoAppsSharp,
} from "react-icons/io5";
import { PiRabbit } from "react-icons/pi";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { SoundBtn } from "@/components/StationMenu";

// Styles de boutons du hub (le reste suit le thème de la Station).
export const HUB_SKINS = ["glossy", "glass", "neon", "aurore", "encre", "prisme"];

// Un hub mobile = une couche de navigation par-dessus les vues existantes.
// Rien n'est reconstruit : chaque tuile appelle la navigation go() déjà en place.
export default function MobileLauncher({ ctx, view, onLeave, onBunny, onFocus, onSearch, bunny, focusMode }) {
  const { sfx } = useApp();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [warp, setWarp] = useState(null);
  const [skin, setSkin] = useState(() => localStorage.getItem("nexus-hub-skin") || "glossy");
  const noteRef = useRef(null);
  const hubRef = useRef(null);
  const openRef = useRef(false);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { const on = () => setSkin(localStorage.getItem("nexus-hub-skin") || "glossy"); window.addEventListener("nexus-hub-skin", on); return () => window.removeEventListener("nexus-hub-skin", on); }, []);

  const openMenu = () => { sfx("nav"); setOpen(true); };
  const closeMenu = () => { sfx("back"); setOpen(false); };

  // L'app masque la barre radio / Bunny pendant que le hub est ouvert.
  useEffect(() => { const el = document.querySelector(".at-app"); if (el) el.classList.toggle("nx-open", open); return () => { const e = document.querySelector(".at-app"); if (e) e.classList.remove("nx-open"); }; }, [open]);

  const inbox = ctx.at.items.filter((i) => !i.universe_id && !i.fields?.template && !i.fields?.alexandrie).length;
  const activeK = focusMode ? "focus" : bunny ? "bunny" : view.name === "home" ? "home" : view.name;
  const SPACES = [
    { k: "home", label: "Pont", c: "#dcbd82", Icon: IoPlanetOutline, act: () => ctx.go({ name: "home" }) },
    { k: "universes", label: "Nexus Drive", c: "#64cad8", Icon: IoGridOutline, act: () => ctx.go({ name: "universes" }) },
    { k: "templates", label: "Templates", c: "#b98cff", Icon: IoLibraryOutline, act: () => ctx.go({ name: "templates" }) },
    { k: "tasks", label: "Cockpit", c: "#6ad98c", Icon: IoCheckboxOutline, act: () => ctx.go({ name: "tasks" }) },
    { k: "bureau", label: "Bureau", c: "#ff9f68", Icon: IoAppsOutline, act: () => ctx.go({ name: "bureau" }) },
    { k: "salon", label: "Salon", c: "#ff6b9d", Icon: IoFilmOutline, act: () => ctx.go({ name: "salon" }) },
    { k: "radio", label: "Radio", c: "#5fb0d9", Icon: IoRadioOutline, act: () => ctx.go({ name: "radio" }) },
    { k: "alexandrie", label: "Alexandrie", c: "#d9b98c", Icon: IoLibraryOutline, act: () => ctx.go({ name: "alexandrie" }) },
    { k: "focus", label: "Focus", c: "#c9a86a", Icon: IoMoonOutline, act: onFocus },
    { k: "inbox", label: "Inbox", c: "#9ad0ff", Icon: IoFileTrayOutline, badge: inbox, act: () => ctx.go({ name: "inbox" }) },
    { k: "bunny", label: "Bunny", c: "#ffd36a", Icon: IoSparklesOutline, act: onBunny },
    { k: "devlog", label: "Dev", c: "#8ce0b0", Icon: IoCodeSlashOutline, act: () => ctx.go({ name: "devlog" }) },
    { k: "settings", label: "Réglages", c: "#c7b3ff", Icon: IoSettingsOutline, act: () => ctx.go({ name: "settings" }) },
  ];

  // Ouverture d'un espace : léger flash à la couleur de l'espace, puis navigation (court et fluide).
  const launch = (s) => {
    setOpen(false);
    setWarp({ c: s.c, n: Date.now() });
    window.setTimeout(() => s.act && s.act(), 130);
    window.setTimeout(() => setWarp(null), 420);
  };

  const pins = ctx.at.universes.filter((u) => u.pinned);
  const recent = [...ctx.at.items]
    .filter((i) => !i.fields?.folder && !i.fields?.template && (i.title || i.image))
    .sort((a, b) => String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || "")))
    .slice(0, 2);

  const saveNote = async () => {
    const v = (noteRef.current?.value || "").trim(); if (!v) return;
    noteRef.current.value = "";
    try { await ctx.at.createItem({ kind: "note", title: v.slice(0, 60), content: v, universe_id: null }); toast.success("Note capturée dans l'Inbox"); }
    catch { toast.error("Note non enregistrée"); }
  };

  // Gestes riches : l'axe du geste est verrouillé dès le premier mouvement.
  // Horizontal = changer de page (partout sur le menu). Vertical depuis le haut = tirer/fermer au doigt.
  // Vertical ailleurs = laisser défiler le contenu. Un simple appui = clic normal.
  useEffect(() => {
    let g = null;
    const H = () => window.innerHeight;
    const down = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const y = e.clientY, hub = hubRef.current;
      if (openRef.current) {
        const top = hub ? hub.getBoundingClientRect().top : 0;
        g = { x: e.clientX, y, t: Date.now(), fromOpen: true, topZone: y < top + 112, axis: null };
      } else {
        g = y > H() - 120 ? { x: e.clientX, y, t: Date.now(), fromOpen: false, topZone: false, axis: null } : null;
      }
    };
    const move = (e) => {
      if (!g) return;
      const dx = e.clientX - g.x, dy = e.clientY - g.y;
      if (!g.axis) { if (Math.abs(dx) > 9 || Math.abs(dy) > 9) g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y"; else return; }
      if (g.axis === "x") return;                       // glissé horizontal = page, géré au relâché
      const hub = hubRef.current; if (!hub) return;
      if (g.fromOpen) {
        if (!g.topZone) return;                          // vertical hors zone haute = défilement
        hub.style.transition = "none"; hub.style.transform = `translateY(${Math.max(0, dy)}px)`;
      } else {
        hub.style.visibility = "visible"; hub.style.transition = "none"; hub.style.transform = `translateY(calc(113% + ${Math.min(0, dy)}px))`;
      }
    };
    const up = (e) => {
      const d = g; g = null; const hub = hubRef.current;
      if (hub) { hub.style.transition = ""; hub.style.transform = ""; hub.style.visibility = ""; }
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y, vy = dy / Math.max(1, Date.now() - d.t);
      if (d.axis === "x") { if (d.fromOpen && Math.abs(dx) > 38) { sfx("nav"); setPage((p) => (p === 1 ? 2 : 1)); } return; }
      if (d.axis !== "y") return;                        // simple appui : on laisse passer le clic
      if (d.fromOpen) { if (d.topZone && (dy > 100 || vy > 0.5)) closeMenu(); else setOpen(true); }
      else { if (dy < -80 || vy < -0.45) openMenu(); else setOpen(false); }
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => { window.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
  }, []); // eslint-disable-line

  const openItem = (i) => { setOpen(false); ctx.open(i.id, i.kind); };
  const goUni = (u) => { setOpen(false); ctx.go({ name: "universe", id: u.id }); };

  return (
    <div className={"nx-launcher" + (open ? " open" : "")} data-skin={skin} data-testid="mobile-launcher">
      <div className="nx-hub" ref={hubRef} role="dialog" aria-label="Menu de navigation">
        <div className="nx-grab" onClick={closeMenu} role="button" aria-label="Fermer le menu" />
        <div className="nx-note">
          <span className="ic"><IoCreateOutline size={16} /></span>
          <input ref={noteRef} placeholder="Note rapide…" aria-label="Note rapide" onKeyDown={(e) => { if (e.key === "Enter") saveNote(); }} />
          <button className="send" onClick={saveNote} aria-label="Capturer la note"><IoArrowForward size={16} /></button>
        </div>

        {page === 1 ? (
          <div className="nx-page">
            <p className="nx-ptitle mono">// Tes espaces</p>
            <div className="nx-grid">
              {SPACES.map((s) => (
                <button key={s.k} className={"nx-cell" + (activeK === s.k ? " on" : "")} style={{ "--c": s.c }} onClick={() => launch(s)} data-testid={`hub-${s.k}`}>
                  <span className="circle"><s.Icon size={21} />{s.badge > 0 && <span className="bdg">{s.badge}</span>}</span>
                  <small>{s.label}</small>
                </button>
              ))}
            </div>
            {recent.length > 0 && (
              <div className="nx-resume">
                <p className="nx-ptitle mono">// Reprendre</p>
                {recent.map((i) => (
                  <button key={i.id} className="nx-rcard" onClick={() => openItem(i)}>
                    <span className="rk" style={i.image ? { backgroundImage: `url(${i.image})` } : undefined}>{!i.image && <IoCreateOutline size={16} />}</span>
                    <span className="rt"><b>{i.title || "Sans titre"}</b><small className="mono">{(i.kind || "note").toUpperCase()}</small></span>
                    <IoArrowForward className="rgo" size={15} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="nx-page">
            <p className="nx-ptitle mono">// Tes raccourcis</p>
            <div className="nx-grid">
              {pins.map((u) => (
                <button key={u.id} className="nx-cell" style={{ "--c": u.color || "#9fb4ff" }} onClick={() => goUni(u)} data-testid={`hub-pin-${u.id}`}>
                  <span className="circle">{u.kanji ? <b>{u.kanji}</b> : (u.name || "?")[0]}</span>
                  <small>{u.name}</small>
                </button>
              ))}
              <button className="nx-cell add" onClick={() => launch({ c: "#c7b3ff", Icon: IoSettingsOutline, act: () => ctx.go({ name: "settings" }) })} aria-label="Gérer les raccourcis">
                <span className="circle"><IoAddOutline size={21} /></span><small>Ajouter</small>
              </button>
            </div>
            {pins.length === 0 && <p className="nx-empty">Épingle des univers dans le Drive pour les retrouver ici.</p>}
          </div>
        )}

        <div className="nx-dots">
          <button className={page === 1 ? "on" : ""} onClick={() => setPage(1)} aria-label="Espaces" />
          <button className={page === 2 ? "on" : ""} onClick={() => setPage(2)} aria-label="Raccourcis" />
        </div>
      </div>

      {warp && <div className="nx-warp go" key={warp.n} style={{ "--c": warp.c }} aria-hidden="true" />}

      <div className="nx-tools" data-testid="mobile-tools">
        <SoundBtn up btn={{ borderColor: "transparent", background: "transparent", color: "var(--text-primary)" }} />
        <button onClick={() => { sfx("nav"); setOpen(false); ctx.go({ name: "settings" }); }} aria-label="Paramètres"><IoSettingsOutline size={20} /></button>
        <button className={"nx-menu" + (open ? " on" : "")} onClick={() => (open ? closeMenu() : openMenu())} aria-label={open ? "Fermer le menu" : "Menu"} data-testid="mobile-menu-toggle">{open ? <IoClose size={22} /> : <IoAppsSharp size={22} />}</button>
        <button onClick={() => { setOpen(false); ctx.go({ name: "home" }); }} aria-label="Retour au Pont" data-testid="mobile-home"><IoPlanetOutline size={20} /></button>
        <button onClick={() => { setOpen(false); onBunny(); }} aria-label="Cosmic Bunny" data-testid="mobile-bunny"><PiRabbit size={20} /></button>
      </div>
    </div>
  );
}
