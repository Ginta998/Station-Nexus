import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { IoClose, IoExpand, IoContract, IoSaveOutline, IoFolderOpenOutline, IoRefresh } from "react-icons/io5";
import { arcadeApi, loadRom, coreOf, fnv, ago, pf } from "@/lib/arcade";
import { Cartridge } from "@/components/atelier/ArcadeCart";

// La console de l'Arcade : la cartouche glisse dans la console, l'écran s'allume, puis le jeu tourne
// en plein écran avec EmulatorJS (chargé depuis son CDN, dans un cadre à part pour rester isolé).
// Clavier (touches modifiables dans la barre de l'émulateur), manette Bluetooth/USB, boutons tactiles sur téléphone.
// SRAM : envoyée au serveur dès qu'elle change. États : emplacements Auto, 1, 2, 3, avec une capture.
const EJS_DATA = "https://cdn.emulatorjs.org/stable/data/";
export const SLOTS = ["auto", "1", "2", "3"];
export const slotLabel = (s) => (s === "auto" ? "Auto (en quittant)" : `Emplacement ${s}`);

const frameDoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}#game{width:100%;height:100%}</style></head><body><div id="game"></div>
<script>
var c = parent.__NX_EJS || {};
window.EJS_player = "#game"; window.EJS_core = c.core; window.EJS_gameUrl = c.url; window.EJS_gameName = c.name; window.EJS_gameID = c.name;
window.EJS_pathtodata = "${EJS_DATA}"; window.EJS_startOnLoaded = true; window.EJS_color = c.color || "#7c5cff"; window.EJS_language = "fr-FR";
window.EJS_volume = 0.7; window.EJS_backgroundColor = "#000"; if (c.noExtract) window.EJS_dontExtractRom = true;
window.EJS_Buttons = { saveState: false, loadState: false, saveSavFiles: false, loadSavFiles: false, netplay: false, cacheManager: false, exitEmulation: false, quickSave: false, quickLoad: false, screenRecord: false, contextMenu: false };
window.EJS_onGameStart = function () { c.onStart && c.onStart(window); };
window.EJS_ready = function () { c.onReady && c.onReady(window); };
</script>
<script src="${EJS_DATA}loader.js" onerror="parent.__NX_EJS && parent.__NX_EJS.onFail && parent.__NX_EJS.onFail()"></script></body></html>`;

async function thumb(u8) {
  try {
    const bmp = await createImageBitmap(new Blob([u8], { type: "image/png" }));
    const w = 240; const h = Math.round((bmp.height / bmp.width) * w) || 160;
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const g = cv.getContext("2d"); g.imageSmoothingEnabled = false; g.drawImage(bmp, 0, 0, w, h);
    return cv.toDataURL("image/jpeg", 0.78);
  } catch (_) { return ""; }
}
const timeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);

export default function ArcadePlayer({ game, resume = null, onClose, onUpdate }) {
  const [phase, setPhase] = useState("insert"); // insert → boot → play | fail
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const [full, setFull] = useState(false);
  const [menu, setMenu] = useState(null); // "save" | "load"
  const [saves, setSaves] = useState([]);
  const [conflict, setConflict] = useState(null);
  const wrap = useRef(null); const frame = useRef(null);
  const st = useRef({ emu: null, rev: null, hash: "", t0: 0, blobUrl: "", busy: false, paused: false, closed: false, prefs: game.prefs || {} });
  const preview = typeof window !== "undefined" && window.__NX_PREVIEW;

  const gm = () => st.current.emu?.gameManager;

  // ---------- SRAM
  const pushSram = async (force = false) => {
    const s = st.current; const m = gm(); if (!m || s.paused) return;
    let d = null; try { d = m.getSaveFile(); } catch (_) { return; }
    if (!d || !d.length) return;
    const h = fnv(d); if (h === s.hash && !force) return;
    try {
      const r = await arcadeApi.putSave(game.id, "sram", "main", d, { base: s.rev, force, core: coreOf(game) });
      s.rev = r.rev; s.hash = h;
    } catch (e) {
      if (e?.response?.status === 409) { s.paused = true; setConflict(e.response.data?.detail?.server || {}); }
    }
  };
  const pullSram = async () => {
    try { const r = await arcadeApi.getSave(game.id, "sram", "main"); st.current.rev = r.rev; return r.data; } catch (_) { st.current.rev = 0; return null; }
  };
  const writeSram = (data) => {
    const m = gm(); if (!m || !data) return false;
    try {
      const path = m.getSaveFilePath(); const parts = path.split("/"); let cp = "";
      for (let i = 0; i < parts.length - 1; i++) { if (!parts[i]) continue; cp += "/" + parts[i]; try { m.FS.mkdir(cp); } catch (_) { /* existe */ } }
      try { m.FS.unlink(path); } catch (_) { /* rien */ }
      m.FS.writeFile(path, data); m.loadSaveFiles(); st.current.hash = fnv(data); return true;
    } catch (_) { return false; }
  };

  // ---------- états
  const loadSlot = async (slot) => {
    const m = gm(); if (!m) return;
    try { const r = await arcadeApi.getSave(game.id, "state", slot); m.loadState(r.data); toast.success(`${slotLabel(slot)} chargé`); }
    catch (_) { toast.error("Cet emplacement est vide."); }
    setMenu(null);
  };
  const saveSlot = async (slot, quiet = false) => {
    const m = gm(); if (!m) return;
    try {
      const state = m.getState(); if (!state) throw new Error("vide");
      const shot = await timeout(m.screenshot?.() ?? Promise.resolve(null), 1500);
      const img = shot ? await thumb(shot) : "";
      await arcadeApi.putSave(game.id, "state", slot, state, { core: coreOf(game) });
      const prefs = { ...st.current.prefs, shots: { ...(st.current.prefs.shots || {}), [slot]: { img, at: new Date().toISOString() } } };
      st.current.prefs = prefs;
      const g = await arcadeApi.patch(game.id, { prefs }).catch(() => null); if (g) onUpdate?.(g);
      if (!quiet) toast.success(`Partie sauvée · ${slotLabel(slot)}`);
    } catch (_) { if (!quiet) toast.error("Sauvegarde impossible pour l'instant."); }
    setMenu(null);
  };

  // ---------- démarrage
  useEffect(() => {
    let alive = true; const s = st.current;
    const insert = setTimeout(() => alive && setPhase((p) => (p === "insert" ? "boot" : p)), 1300);
    (async () => {
      if (preview) { setTimeout(() => { if (alive) { setPhase("fail"); setErr("L'aperçu ne peut pas charger l'émulateur (son CDN est bloqué ici). Sur ta Station, le jeu démarre à cet endroit."); } }, 2600); return; }
      let rom;
      try { rom = await loadRom(game, (p) => alive && setPct(p)); } catch (_) { if (alive) { setPhase("fail"); setErr("Impossible de récupérer le jeu sur le serveur."); } return; }
      const sram = await pullSram();
      if (!alive) return;
      s.blobUrl = URL.createObjectURL(rom);
      const name = (game.file_name || "jeu").replace(/\.[a-z0-9]+$/i, "") + "." + (game.file_format || "gba");
      window.__NX_EJS = {
        core: coreOf(game), noExtract: coreOf(game) === "arcade", url: s.blobUrl, name: game.id, color: getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "#7c5cff", fileName: name,
        onFail: () => { if (alive) { setPhase("fail"); setErr("EmulatorJS ne répond pas (connexion à cdn.emulatorjs.org ?)."); } },
        onStart: (w) => {
          s.emu = w.EJS_emulator; s.t0 = Date.now();
          arcadeApi.launch(game.id).catch(() => {});
          if (sram && writeSram(sram)) { try { s.emu.gameManager.restart(); } catch (_) { /* rien */ } }
          if (resume) setTimeout(() => loadSlot(resume), sram ? 450 : 150);
          setPhase("play");
          try { frame.current?.contentWindow?.focus(); } catch (_) { /* rien */ }
        },
      };
      setTimeout(() => { if (alive && frame.current) frame.current.srcdoc = frameDoc; }, 900);
      setTimeout(() => { if (alive && !s.emu) { setPhase("fail"); setErr("L'émulateur met trop de temps à démarrer. Vérifie ta connexion et relance."); } }, 60000);
    })();
    // SRAM toutes les 15 s si elle a changé ; état Auto toutes les 3 min et quand l'appli passe en arrière-plan (téléphone)
    let lastAuto = Date.now();
    const auto = () => { if (st.current.emu && !st.current.closed && Date.now() - lastAuto > 60000) { lastAuto = Date.now(); saveSlot("auto", true); } };
    const iv = setInterval(() => { pushSram(); if (Date.now() - lastAuto > 180000) auto(); }, 15000);
    const hide = () => { if (document.visibilityState === "hidden") { pushSram(); auto(); } };
    document.addEventListener("visibilitychange", hide);
    return () => { alive = false; clearTimeout(insert); clearInterval(iv); document.removeEventListener("visibilitychange", hide); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- quitter : SRAM, état Auto, temps de jeu
  const quit = async () => {
    const s = st.current; if (s.closed) return; s.closed = true;
    if (s.emu) {
      const tid = toast.loading("Sauvegarde de la partie…");
      await pushSram(); await saveSlot("auto", true);
      if (s.t0) await arcadeApi.session(game.id, (Date.now() - s.t0) / 1000).catch(() => {});
      toast.success("Partie sauvée. Tu peux la reprendre sur n'importe quel appareil.", { id: tid });
    }
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (_) { /* rien */ }
    try { if (frame.current) frame.current.srcdoc = "<html></html>"; } catch (_) { /* rien */ }
    if (s.blobUrl) setTimeout(() => URL.revokeObjectURL(s.blobUrl), 4000);
    delete window.__NX_EJS;
    onClose();
  };

  useEffect(() => {
    const fs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fs);
    return () => document.removeEventListener("fullscreenchange", fs);
  }, []);
  const toggleFull = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else { await wrap.current?.requestFullscreen?.(); try { await window.screen.orientation?.lock?.("landscape"); } catch (_) { /* rien */ } }
    } catch (_) { /* rien */ }
  };
  const openMenu = async (k) => { setMenu(k); try { setSaves((await arcadeApi.saves(game.id)).filter((x) => x.kind === "state")); } catch (_) { setSaves([]); } };
  const shotOf = (slot) => st.current.prefs.shots?.[slot]?.img;

  // Conflit : un autre appareil a sauvegardé pendant que tu jouais ici
  const keepMine = async () => { st.current.paused = false; setConflict(null); await pushSram(true); toast.success("Ta sauvegarde remplace celle de l'autre appareil."); };
  const takeTheirs = async () => {
    st.current.paused = false; setConflict(null);
    const d = await pullSram(); if (d && writeSram(d)) { try { gm().restart(); } catch (_) { /* rien */ } toast.success("Sauvegarde de l'autre appareil chargée."); }
  };

  return createPortal(
    <div className={"ar-player ph-" + phase} ref={wrap} data-testid="arcade-player">
      <div className="ar-pbar">
        <b>{game.title}</b>
        <span className="ar-pbar-sp" />
        {phase === "play" && <>
          <button onClick={() => openMenu("save")} title="Sauver la partie" data-testid="arcade-save"><IoSaveOutline size={16} /><span>Sauver</span></button>
          <button onClick={() => openMenu("load")} title="Charger une partie" data-testid="arcade-load"><IoFolderOpenOutline size={16} /><span>Charger</span></button>
          <button onClick={() => { try { gm().restart(); } catch (_) { /* rien */ } }} title="Redémarrer le jeu"><IoRefresh size={16} /></button>
        </>}
        <button onClick={toggleFull} title={full ? "Quitter le plein écran" : "Plein écran"}>{full ? <IoContract size={16} /> : <IoExpand size={16} />}</button>
        <button className="q" onClick={quit} title="Quitter (sauvegarde automatique)" data-testid="arcade-quit"><IoClose size={18} /><span>Quitter</span></button>
      </div>

      {phase !== "play" && (
        <div className="ar-stage">
          <ConsoleArt game={game} phase={phase} pct={pct} err={err} />
          {phase === "fail" && <button className="ar-b" onClick={quit}>Retour à l'étagère</button>}
        </div>
      )}
      <iframe ref={frame} className="ar-frame" title={game.title} allow="gamepad; fullscreen; autoplay" />

      {menu && (
        <div className="ar-slots-wrap" onClick={() => setMenu(null)}>
          <div className="ar-slots" onClick={(e) => e.stopPropagation()}>
            <p className="mono">{menu === "save" ? "SAUVER DANS…" : "CHARGER…"}</p>
            <div className="ar-slot-grid">
              {SLOTS.filter((s) => menu === "load" || s !== "auto").map((s) => {
                const sv = saves.find((x) => x.slot === s); const img = shotOf(s);
                return (
                  <button key={s} className={"ar-slot" + (sv ? "" : " empty")} disabled={menu === "load" && !sv} onClick={() => (menu === "save" ? saveSlot(s) : loadSlot(s))} data-testid={`arcade-slot-${s}`}>
                    <span className="ar-slot-img" style={img ? { backgroundImage: `url("${img}")` } : undefined}>{!img && <i>{sv ? "▣" : "vide"}</i>}</span>
                    <b>{slotLabel(s)}</b><small>{sv ? `${ago(sv.updated_at)}${sv.device ? " · " + sv.device : ""}` : "Libre"}</small>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {conflict && (
        <div className="ar-slots-wrap">
          <div className="ar-slots ar-conflict">
            <p className="mono">DEUX SAUVEGARDES</p>
            <h3>Un autre appareil a sauvegardé ce jeu pendant ta partie</h3>
            <p>{conflict.device ? `${conflict.device}, ` : ""}{ago(conflict.updated_at)}. Laquelle garder ?</p>
            <div className="ar-cf-row">
              <button className="ar-b" onClick={keepMine}>Garder celle d'ici</button>
              <button className="ar-b ghost" onClick={takeTheirs}>Prendre l'autre</button>
            </div>
            <small>L'avant-dernière reste récupérable depuis la fiche du jeu (Sauvegardes › Restaurer la précédente).</small>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}


// La console qui lance le jeu, selon la famille : portable horizontale, portable verticale, double écran,
// console de salon et son téléviseur, lecteur de disque, borne d'arcade. Dessins originaux, sans marque.
const INSERT_TXT = { h: "Insertion de la cartouche…", v: "Insertion de la cartouche…", ds: "Insertion de la carte…", salon: "Insertion de la cartouche…", disque: "Le disque se met en place…", borne: "INSERT COIN" };
function ConsoleArt({ game, phase, pct, err }) {
  const p = pf(game.platform); const fam = p.family;
  const screen = (
    <div className="ar-screen">
      {phase === "insert" && <em>{INSERT_TXT[fam]}</em>}
      {phase === "boot" && <><strong>NEXUS</strong><small>{pct < 1 ? `Chargement ${Math.round(pct * 100)} %` : "Démarrage…"}</small><span className="ar-load"><i style={{ width: `${Math.round(pct * 100)}%` }} /></span></>}
      {phase === "fail" && <p>{err}</p>}
    </div>
  );
  const media = <div className="ar-insert"><Cartridge g={game} mini /></div>;
  const pad = <><span className="ar-dpad"><i /><i /></span><span className="ar-ab"><i>B</i><i>A</i></span></>;
  const style = { "--pc": p.color };
  if (fam === "v") return (
    <div className="ar-console fam-v" style={style}>{media}
      <div className="ar-con-body"><div className="ar-bezel">{screen}<span className="ar-led" /></div>{pad}<span className="ar-ss"><i /><i /></span><span className="ar-grill"><i /><i /><i /><i /><i /></span></div>
    </div>);
  if (fam === "ds") return (
    <div className="ar-console fam-ds" style={style}>{media}
      <div className="ar-lid"><span className="ar-cam" />{screen}</div>
      <div className="ar-con-body">{pad}<div className="ar-screen2" /><span className="ar-led" /></div>
    </div>);
  if (fam === "salon" || fam === "disque") return (
    <div className={"ar-console fam-salon" + (fam === "disque" ? " disc" : "")} style={style}>
      <div className="ar-tv"><div className="ar-tv-in">{screen}</div><span className="ar-tv-side"><i /><i /><b /></span></div>
      <div className="ar-deck">
        {fam === "disque" ? <div className="ar-insert"><span className="ar-cdisc" /></div> : media}
        <div className="ar-con-body">{fam === "disque" ? <span className="ar-lidring" /> : <span className="ar-slot-hole" />}<span className="ar-power" /><span className="ar-led" /><span className="ar-ports"><i /><i /></span></div>
      </div>
    </div>);
  if (fam === "borne") return (
    <div className="ar-console fam-borne" style={style}>
      <div className="ar-cab">
        <div className="ar-cab-marq"><b>{game.title}</b></div>
        <div className="ar-cab-scr">{screen}</div>
        <div className="ar-cab-panel"><span className="ar-stick"><i /></span><span className="ar-btns"><i /><i /><i /><i /><i /><i /></span></div>
        <div className="ar-cab-coin"><span className="ar-coin-slot" /><div className="ar-insert"><span className="ar-coin" /></div></div>
      </div>
    </div>);
  return (
    <div className="ar-console fam-h" style={style}>{media}
      <div className="ar-con-body"><span className="ar-dpad"><i /><i /></span>{screen}<span className="ar-ab"><i>B</i><i>A</i></span><span className="ar-led" /><span className="ar-ss"><i /><i /></span></div>
    </div>);
}
