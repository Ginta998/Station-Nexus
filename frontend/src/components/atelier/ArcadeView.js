import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { IoAdd, IoPlay, IoPlayForward, IoImageOutline, IoCreateOutline, IoTrashOutline, IoStar, IoStarOutline, IoSaveOutline, IoClose, IoColorPaletteOutline, IoTimeOutline, IoReloadOutline, IoSearch, IoBookOutline, IoEllipsisHorizontal, IoInformationCircleOutline, IoCloudUploadOutline, IoLinkOutline, IoSwapHorizontal, IoCheckmarkDoneOutline } from "react-icons/io5";
import { arcadeApi, uploadGame, uploadInto, importFromUrl, cacheDrop, cleanTitle, playTime, ago, PLATFORMS, pf, ACCEPT } from "@/lib/arcade";
import { pressMenu, showMenu } from "@/components/atelier/ContextMenu";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";
import { CoverDialog } from "@/components/atelier/AlexCore";
import GameBox, { SHELLS } from "@/components/atelier/ArcadeCart";
import ArcadePlayer, { SLOTS, slotLabel } from "@/components/atelier/ArcadePlayer";
import ArcadeAdd from "@/components/atelier/ArcadeAdd";
import ArcadeGuide from "@/components/atelier/ArcadeGuide";
import "./arcade.css";

// Nexus Arcade : ta ludothèque rétro. Une section par console, une étagère en carrousel 3D par section ;
// le jeu au centre s'avance, sa barre d'actions apparaît. Un jeu peut être rangé sans fichier (fiche d'un jeu
// officiel trouvé par la recherche) : tu ajoutes ensuite ta propre copie depuis sa fiche.
const isWish = (g) => !g.ready && g.kind === "wish";
const visible = (g) => g.ready || g.kind === "wish";
export const STATUS = [["", "Automatique"], ["a-faire", "À faire"], ["termine", "Terminé"], ["pause", "En pause"], ["culte", "Culte"]];
export function stampOf(g) {
  const s = g.prefs?.status;
  if (s === "termine") return ["TERMINÉ", "ok"];
  if (s === "pause") return ["EN PAUSE", "dim"];
  if (s === "culte") return ["CULTE", "gold"];
  if (s === "a-faire") return ["À FAIRE", "dim"];
  if (isWish(g)) return ["SANS FICHIER", "red"];
  return g.play_seconds > 60 ? ["EN COURS", "live"] : ["NOUVEAU", "new"];
}
const FILTERS = [["all", "Tout"], ["fav", "Favoris"], ["cours", "En cours"], ["termine", "Terminés"], ["wish", "Sans fichier"]];
const SORTS = [["az", "A → Z"], ["recent", "Joués récemment"], ["temps", "Temps de jeu"], ["ajout", "Derniers ajoutés"]];

export default function ArcadeView({ start = null }) {
  const [games, setGames] = useState(null);
  const [jobs, setJobs] = useState([]); // envois en cours : { key, title, pct, err }
  const [play, setPlay] = useState(null); // { game, resume }
  const [dlg, setDlg] = useState(null); // { add } | "guide" | { cover } | { saves } | { card }
  const [over, setOver] = useState(false);
  const [q, setQ] = useState("");
  const [cons, setCons] = useState(() => { try { return localStorage.getItem("nx-arc-cons") || "all"; } catch (_) { return "all"; } });
  const [filt, setFilt] = useState("all");
  const [sort, setSort] = useState(() => { try { return localStorage.getItem("nx-arc-sort") || "az"; } catch (_) { return "az"; } });
  const fileFor = useRef(null); const fileInput = useRef(null);
  useEffect(() => { try { localStorage.setItem("nx-arc-cons", cons); localStorage.setItem("nx-arc-sort", sort); } catch (_) { /* rien */ } }, [cons, sort]);

  const reload = async () => { try { setGames(await arcadeApi.list()); } catch (_) { setGames([]); toast.error("L'Arcade ne répond pas : le serveur de la Station est-il à jour ?"); } };
  useEffect(() => { reload(); }, []);
  const upd = (g) => setGames((l) => (l || []).map((x) => (x.id === g.id ? { ...x, ...g } : x)));
  const job = (key, patch) => setJobs((l) => (patch === null ? l.filter((j) => j.key !== key) : l.some((j) => j.key === key) ? l.map((j) => (j.key === key ? { ...j, ...patch } : j)) : [...l, { key, ...patch }]));

  const all = useMemo(() => (games || []).filter(visible), [games]);
  const numOf = useMemo(() => { const m = {}; [...all].sort((a, b) => (a.added_at || "").localeCompare(b.added_at || "")).forEach((g, i) => { m[g.id] = i + 1; }); return m; }, [all]);
  const counts = useMemo(() => { const c = {}; all.forEach((g) => { const k = pf(g.platform).k; c[k] = (c[k] || 0) + 1; }); return c; }, [all]);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    const l = all.filter((g) => (cons === "all" || pf(g.platform).k === cons) && (!t || g.title.toLowerCase().includes(t) || (g.publisher || "").toLowerCase().includes(t))
      && (filt === "all" || (filt === "fav" && g.favorite) || (filt === "wish" && isWish(g)) || (filt === "termine" && g.prefs?.status === "termine")
        || (filt === "cours" && g.play_seconds > 60 && g.prefs?.status !== "termine")));
    const by = { az: (a, b) => a.title.localeCompare(b.title, "fr"), recent: (a, b) => (b.last_played_at || "").localeCompare(a.last_played_at || ""),
      temps: (a, b) => (b.play_seconds || 0) - (a.play_seconds || 0), ajout: (a, b) => (b.added_at || "").localeCompare(a.added_at || "") }[sort];
    return l.sort((a, b) => (b.favorite - a.favorite) || by(a, b));
  }, [all, q, cons, filt, sort]);
  const sections = useMemo(() => PLATFORMS.map((p) => ({ p, items: shown.filter((g) => pf(g.platform).k === p.k) })).filter((s) => s.items.length), [shown]);
  const recent = useMemo(() => all.filter((g) => g.ready && g.last_played_at && g.prefs?.shots?.auto).sort((a, b) => b.last_played_at.localeCompare(a.last_played_at)).slice(0, 3), [all]);

  // ---------- ajouter
  const sendFiles = async (list) => { // list : [{ file, platform }]
    for (const { file: f, platform, cover } of list) {
      const key = "up-" + f.name + f.size;
      job(key, { title: cleanTitle(f.name), pct: 0 });
      try {
        const g = await uploadGame(f, { platform, cover }, (p) => job(key, { pct: p }));
        job(key, null); setGames((l) => [...(l || []), g]); toast.success(`${g.title} est sur l'étagère`);
      } catch (e) { job(key, { err: e?.response?.data?.detail || "envoi interrompu" }); }
    }
  };
  const fromUrl = async (body, label) => {
    const key = "url-" + body.url; job(key, { title: label || body.title || "Jeu depuis un lien", pct: null });
    try { const { cover, ...b } = body; const id = await importFromUrl(b, (p) => job(key, { pct: p })); if (cover && id) await arcadeApi.patch(id, { cover }).catch(() => {}); job(key, null); await reload(); toast.success(`${label || body.title || "Le jeu"} est installé`); }
    catch (e) { job(key, { err: e?.response?.data?.detail || e.message || "lien refusé" }); }
  };
  const addWish = async ({ title, platform, cover, year, publisher }) => {
    try {
      const g = await arcadeApi.create({ title, platform, kind: "wish", file_name: "", file_format: "", file_size: 0, sha1: "", cover: cover || "", description: "", year: year || "", publisher: publisher || "" });
      setGames((l) => [...(l || []), g]); toast.success(`${title} rangé dans ta ludothèque (sans fichier)`);
    } catch (_) { toast.error("Impossible d'ajouter ce jeu."); }
  };
  // Remplir une fiche : ton fichier, ou un lien que le serveur télécharge
  const pickFileFor = (g) => { fileFor.current = g; fileInput.current?.click(); };
  const fileChosen = async (f) => {
    const g = fileFor.current; fileFor.current = null; if (!f || !g) return;
    const key = "into-" + g.id; job(key, { title: g.title, pct: 0 });
    try { const ng = await uploadInto(g, f, (p) => job(key, { pct: p })); job(key, null); upd(ng); toast.success(`${g.title} : fichier ajouté, prêt à jouer`); }
    catch (e) { job(key, { err: e?.response?.data?.detail || "envoi interrompu" }); }
  };
  const linkFor = async (g) => { const u = await labPrompt(`Lien du fichier pour « ${g.title} » (Drive, Dropbox, lien direct)`, ""); if (u && /^https?:\/\//i.test(u.trim())) fromUrl({ url: u.trim(), game_id: g.id, title: g.title }, g.title); };

  // ---------- actions sur un jeu
  const launch = (g, resume = null) => { if (isWish(g)) { setDlg({ card: g }); return; } setPlay({ game: g, resume }); };
  // Venu du Pont (« Reprendre ma partie ») : le jeu se lance dès que la ludothèque est chargée
  const started = useRef(null);
  useEffect(() => { if (!start || !games || started.current === start.t) return; started.current = start.t; const g = games.find((x) => x.id === start.id); if (g) launch(g, start.resume); }, [start, games]); // eslint-disable-line react-hooks/exhaustive-deps
  const patch = async (g, p) => { try { upd(await arcadeApi.patch(g.id, p)); } catch (_) { toast.error("Modification impossible."); } };
  const rename = async (g) => { const t = await labPrompt("Nom du jeu", g.title); if (t && t.trim() && t.trim() !== g.title) patch(g, { title: t.trim() }); };
  const remove = async (g) => {
    if (!(await labConfirm(`Retirer « ${g.title} » de la ludothèque ? Ses sauvegardes restent sur le serveur, au cas où tu le réinstalles.`))) return;
    try { await arcadeApi.remove(g.id); cacheDrop(g.id); setGames((l) => l.filter((x) => x.id !== g.id)); toast.success("Jeu retiré"); } catch (_) { toast.error("Suppression impossible."); }
  };
  const moveTo = (g) => ({ label: "Console", icon: <IoSwapHorizontal size={14} />, sub: PLATFORMS.map((p) => ({ label: p.label, on: pf(g.platform).k === p.k, onClick: () => patch(g, { platform: p.k }) })) });
  const menuFor = (g) => () => ({ title: g.title, entries: [
    ...(isWish(g) ? [
      { label: "Ajouter mon fichier…", icon: <IoCloudUploadOutline size={14} />, onClick: () => pickFileFor(g) },
      { label: "Ajouter par un lien…", icon: <IoLinkOutline size={14} />, onClick: () => linkFor(g) },
    ] : [
      { label: "Lancer", icon: <IoPlay size={14} />, onClick: () => launch(g) },
      ...(g.prefs?.shots?.auto ? [{ label: "Reprendre là où j'en étais", icon: <IoPlayForward size={14} />, onClick: () => launch(g, "auto") }] : []),
      { label: "Sauvegardes…", icon: <IoSaveOutline size={14} />, onClick: () => setDlg({ saves: g }) },
    ]),
    { label: "Fiche du jeu", icon: <IoInformationCircleOutline size={14} />, onClick: () => setDlg({ card: g }) },
    "-",
    { label: "Changer l'artwork…", icon: <IoImageOutline size={14} />, onClick: () => setDlg({ cover: g }) },
    { label: "Renommer…", icon: <IoCreateOutline size={14} />, onClick: () => rename(g) },
    { label: g.favorite ? "Retirer des favoris" : "Mettre en favori", icon: g.favorite ? <IoStar size={14} /> : <IoStarOutline size={14} />, onClick: () => patch(g, { favorite: !g.favorite }) },
    { label: "Cartouche au lancement", icon: <IoColorPaletteOutline size={14} />, sub: SHELLS.map(([k, l]) => ({ label: l, on: (g.prefs?.shell || "") === k, onClick: () => patch(g, { prefs: { ...(g.prefs || {}), shell: k } }) })) },
    { label: "Statut", icon: <IoCheckmarkDoneOutline size={14} />, sub: STATUS.map(([k, l]) => ({ label: l, on: (g.prefs?.status || "") === k, onClick: () => patch(g, { prefs: { ...(g.prefs || {}), status: k } }) })) },
    moveTo(g),
    "-",
    { label: "Retirer de la ludothèque", danger: true, icon: <IoTrashOutline size={14} />, onClick: () => remove(g) },
  ] });

  const onDrop = (e) => { e.preventDefault(); setOver(false); if (e.dataTransfer?.files?.length) setDlg({ add: "files", files: [...e.dataTransfer.files] }); };
  const consTabs = PLATFORMS.filter((p) => counts[p.k]);

  return (
    <section className={"at-view ar-view" + (over ? " ar-over" : "")} data-testid="atelier-arcade"
      onDragOver={(e) => { if ([...(e.dataTransfer?.types || [])].includes("Files")) { e.preventDefault(); setOver(true); } }} onDragLeave={(e) => { if (e.currentTarget === e.target) setOver(false); }} onDrop={onDrop}>
      <header className="ar-hero">
        <div>
          <p className="ar-eyebrow mono">NEXUS ARCADE · {all.length} JEU{all.length > 1 ? "X" : ""} · {consTabs.length} CONSOLE{consTabs.length > 1 ? "S" : ""}</p>
          <h1>Ta ludothèque</h1>
          <p className="ar-sub">Tes jeux rétro rangés par console. Un clic, le jeu entre dans sa console. Tes sauvegardes vivent sur ta Station : tu reprends ta partie sur n'importe quel appareil.</p>
        </div>
        <div className="ar-hero-act">
          <button className="ar-b big" onClick={() => setDlg({ add: "files" })} data-testid="arcade-add"><IoAdd size={18} /> Ajouter des jeux</button>
          <button className="ar-b ghost" onClick={() => setDlg("guide")} data-testid="arcade-guide"><IoBookOutline size={15} /> Guide</button>
        </div>
      </header>

      <div className="ar-tools">
        <label className="ar-search"><IoSearch size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher dans ta ludothèque" data-testid="arcade-search" />{q && <button onClick={() => setQ("")} aria-label="Effacer"><IoClose size={14} /></button>}</label>
        <div className="ar-chips">{FILTERS.map(([k, l]) => <button key={k} className={filt === k ? "on" : ""} onClick={() => setFilt(k)}>{l}</button>)}</div>
        <select className="ar-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier">{SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      </div>
      {consTabs.length > 0 && (
        <nav className="ar-cons" aria-label="Consoles">
          <button className={cons === "all" ? "on" : ""} onClick={() => setCons("all")}><span className="ar-pill all">✦</span>Toutes<small>{all.length}</small></button>
          {consTabs.map((p) => <button key={p.k} className={cons === p.k ? "on" : ""} onClick={() => setCons(p.k)} style={{ "--pc": p.color }} data-testid={`arcade-cons-${p.k}`}><span className="ar-pill">{p.short}</span>{p.label}<small>{counts[p.k]}</small></button>)}
        </nav>
      )}

      {jobs.length > 0 && (
        <div className="ar-jobs">
          {jobs.map((j) => (
            <div key={j.key} className={"ar-job" + (j.err ? " err" : "")}>
              <b>{j.title}</b>
              {j.err ? <small className="ar-err">{j.err} <button onClick={() => job(j.key, null)} aria-label="Fermer"><IoClose size={12} /></button></small>
                : <span className={"ar-prog" + (j.pct == null ? " indet" : "")}><i style={j.pct != null ? { width: `${Math.round(j.pct * 100)}%` } : undefined} /></span>}
            </div>
          ))}
        </div>
      )}

      {recent.length > 0 && !q && filt === "all" && (
        <div className="ar-resumes">
          {recent.map((g) => (
            <button key={g.id} className="ar-resume" onClick={() => launch(g, "auto")} {...pressMenu(menuFor(g))} style={{ "--pc": pf(g.platform).color }} data-testid={`arcade-resume-${g.id}`}>
              <span className="ar-resume-shot" style={{ backgroundImage: `url("${g.prefs.shots.auto.img}")` }}><i className="ar-pill">{pf(g.platform).short}</i></span>
              <span className="ar-resume-txt"><small className="mono">REPRENDRE</small><b>{g.title}</b><em><IoTimeOutline size={12} /> {ago(g.prefs.shots.auto.at)} · {playTime(g.play_seconds)}</em></span>
              <span className="ar-resume-go"><IoPlayForward size={18} /></span>
            </button>
          ))}
        </div>
      )}

      {games === null ? <p className="at-empty">Ouverture de la ludothèque…</p>
        : all.length === 0 ? (
          <div className="ar-empty">
            <div className="ar-empty-carts"><GameBox g={{ title: "Ton premier jeu", platform: "gba", ready: true }} /><GameBox g={{ title: "Rétro", platform: "snes", ready: true }} /><GameBox g={{ title: "Disque", platform: "psx", ready: true }} /></div>
            <div><h3>L'étagère attend ses premiers jeux</h3><p>Glisse ici tes fichiers, colle un lien, pioche dans le catalogue de jeux libres, ou range un jeu officiel que tu possèdes pour y ajouter ta copie plus tard.</p>
              <button className="ar-b" onClick={() => setDlg({ add: "catalog" })}>Ouvrir le catalogue libre</button></div>
          </div>
        ) : sections.length === 0 ? <p className="at-empty">Aucun jeu ne correspond.</p>
          : sections.map(({ p, items }) => (
            <Shelf key={p.k} p={p} items={items} num={numOf} menuFor={menuFor} onPlay={launch} onCard={(g) => setDlg({ card: g })} onSaves={(g) => setDlg({ saves: g })} onFile={pickFileFor} />
          ))}
      <p className="ar-hint">Clic droit (ou appui long) sur un jeu : reprendre, sauvegardes, fiche, artwork, statut, coque, console. Sur l'étagère : ← → ou glisse pour parcourir, Entrée pour jouer.</p>
      <input ref={fileInput} type="file" accept={ACCEPT} hidden onChange={(e) => { fileChosen(e.target.files?.[0]); e.target.value = ""; }} />

      {dlg?.add && <ArcadeAdd tab={dlg.add} initialFiles={dlg.files} have={all} defaultPlatform={cons !== "all" ? cons : ""} onClose={() => setDlg(null)}
        onFiles={(l) => { setDlg(null); sendFiles(l); }} onLink={(b) => { setDlg(null); fromUrl(b); }} onInstall={(it) => fromUrl({ url: it.url, title: it.title, file_name: it.file, platform: it.platform }, it.title)}
        onWish={addWish} />}
      {dlg === "guide" && <ArcadeGuide onClose={() => setDlg(null)} />}
      {dlg?.cover && <CoverDialog b={{ id: "arc-" + dlg.cover.id, title: dlg.cover.title, room: "jeux", format: "vhs" }} current={dlg.cover.cover || ""}
        onSave={(u) => { if (u !== undefined) patch(dlg.cover, { cover: u }); setDlg(null); }} onClose={() => setDlg(null)} />}
      {dlg?.saves && <SavesDialog g={dlg.saves} onClose={() => setDlg(null)} onResume={(slot) => { const g = dlg.saves; setDlg(null); launch(g, slot); }} onUpdate={upd} />}
      {dlg?.card && <GameCard g={(games || []).find((x) => x.id === dlg.card.id) || dlg.card} num={numOf[dlg.card.id]} onClose={() => setDlg(null)} onPlay={(g, r) => { setDlg(null); launch(g, r); }}
        onSaves={(g) => setDlg({ saves: g })} onCover={(g) => setDlg({ cover: g })} onFile={pickFileFor} onLink={linkFor} onPatch={patch} />}
      {play && <ArcadePlayer game={play.game} resume={play.resume} onUpdate={upd} onClose={() => { setPlay(null); reload(); }} />}
    </section>
  );
}

// ---------- Une étagère : carrousel 3D, le jeu au centre s'avance et montre sa barre d'actions
function Shelf({ p, items, num, menuFor, onPlay, onCard, onSaves, onFile }) {
  const sc = useRef(null);
  const [act, setAct] = useState(0);
  const cur = items[Math.min(act, items.length - 1)];
  const measure = () => {
    const el = sc.current; if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2; let best = 0; let bd = Infinity;
    [...el.children].forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
    setAct(best);
  };
  const goTo = (i, smooth = true) => { const el = sc.current; const c = el?.children[i]; if (!c) return; el.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - el.clientWidth / 2, behavior: smooth ? "smooth" : "auto" }); };
  useEffect(() => { measure(); }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const key = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(Math.min(items.length - 1, act + 1)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(Math.max(0, act - 1)); }
    else if (e.key === "Enter" && cur) { e.preventDefault(); onPlay(cur); }
  };
  return (
    <section className="ar-shelfsec" style={{ "--pc": p.color }} data-testid={`arcade-sec-${p.k}`}>
      <header className="ar-sec-h">
        <span className="ar-pill big">{p.short}</span>
        <div><h2>{p.label}</h2><small className="mono">{p.gen.toUpperCase()} · {items.length} JEU{items.length > 1 ? "X" : ""}</small></div>
      </header>
      <div className="ar-car" ref={sc} onScroll={() => requestAnimationFrame(measure)} tabIndex={0} onKeyDown={key} aria-label={`Étagère ${p.label}`}>
        {items.map((g, i) => {
          const d = i - act;
          return (
            <button key={g.id} className={"ar-it" + (d === 0 ? " on" : d < 0 ? " l" : " r")} style={{ "--d": Math.min(3, Math.abs(d)) }}
              onClick={() => (d === 0 ? onPlay(g) : goTo(i))} {...pressMenu(menuFor(g))} title={g.title} data-testid={`arcade-game-${g.id}`}>
              <span className="ar-stand"><GameBox g={g} />{g.favorite && <IoStar className="ar-fav" size={13} />}</span>
            </button>
          );
        })}
      </div>
      {cur && (
        <div className="ar-cur" key={cur.id}>
          <b>{cur.title}</b>
          <small>#NX-{String(num[cur.id] || 0).padStart(4, "0")} · {isWish(cur) ? "fichier à ajouter" : cur.play_seconds ? playTime(cur.play_seconds) + " de jeu" : "jamais lancé"}{cur.last_played_at ? " · " + ago(cur.last_played_at) : ""}</small>
          <div className="ar-actbar">
            <button onClick={(e) => { const b = menuFor(cur)(); showMenu(e.clientX, e.clientY, b.entries, b.title); }} aria-label="Plus d'actions" title="Plus d'actions"><IoEllipsisHorizontal size={16} /></button>
            {isWish(cur)
              ? <button className="main" onClick={() => onFile(cur)}><IoCloudUploadOutline size={16} /> Ajouter mon fichier</button>
              : <button className="main" onClick={() => onPlay(cur)} data-testid="arcade-play"><IoPlay size={15} /> Jouer</button>}
            {cur.prefs?.shots?.auto && !isWish(cur) && <button onClick={() => onPlay(cur, "auto")} title="Reprendre" aria-label="Reprendre"><IoPlayForward size={16} /></button>}
            {!isWish(cur) && <button onClick={() => onSaves(cur)} title="Sauvegardes" aria-label="Sauvegardes"><IoSaveOutline size={16} /></button>}
            <button onClick={() => onCard(cur)} title="Fiche du jeu" aria-label="Fiche du jeu" data-testid="arcade-card-open"><IoInformationCircleOutline size={17} /></button>
          </div>
        </div>
      )}
    </section>
  );
}

export function ArcadeShell({ title, eyebrow, onClose, children, wide, className = "" }) {
  return createPortal(
    <div className="ar-dlg-wrap" onClick={onClose}>
      <div className={"ar-dlg" + (wide ? " wide" : "") + (className ? " " + className : "")} onClick={(e) => e.stopPropagation()}>
        <p className="mono ar-dlg-top"><span>{eyebrow}</span><button type="button" onClick={onClose} aria-label="Fermer"><IoClose size={15} /></button></p>
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>, document.body);
}

// ---------- Fiche du jeu, en carte de collection
function GameCard({ g, num, onClose, onPlay, onSaves, onCover, onFile, onLink, onPatch }) {
  const p = pf(g.platform); const [stamp, tone] = stampOf(g);
  const [desc, setDesc] = useState(g.description || "");
  return createPortal(
    <div className="ar-dlg-wrap" onClick={onClose}>
      <div className="ar-card" style={{ "--pc": p.color }} onClick={(e) => e.stopPropagation()} data-testid="arcade-card">
        <button className="ar-card-x" onClick={onClose} aria-label="Fermer"><IoClose size={16} /></button>
        <div className="ar-card-frame">
          <p className="ar-card-top mono"><span>NEXUS ARCADE</span><span>{p.label.toUpperCase()}</span></p>
          <button className="ar-card-art" style={g.cover ? { backgroundImage: `url("${g.cover}")` } : undefined} onClick={() => onCover(g)} title="Changer l'artwork">
            {!g.cover && <GameBox g={g} />}
            <i className={"ar-tampon " + tone}>{stamp}</i>
          </button>
          <p className="ar-card-num mono">#NX-{String(num || 0).padStart(4, "0")}</p>
          <h3>{g.title}</h3>
          <p className="ar-card-meta">{[g.publisher, g.year, p.gen].filter(Boolean).join(" · ")}</p>
          <dl className="ar-card-stats">
            <div><dt>Temps de jeu</dt><dd>{playTime(g.play_seconds)}</dd></div>
            <div><dt>Parties</dt><dd>{g.play_count || 0}</dd></div>
            <div><dt>Dernière</dt><dd>{g.last_played_at ? ago(g.last_played_at) : "—"}</dd></div>
            <div><dt>Fichier</dt><dd>{isWish(g) ? "à ajouter" : g.file_size ? `${(g.file_size / 1048576).toFixed(g.file_size > 1e7 ? 0 : 1)} Mo` : "—"}</dd></div>
          </dl>
          <label className="ar-card-st"><span>Statut</span>
            <select value={g.prefs?.status || ""} onChange={(e) => onPatch(g, { prefs: { ...(g.prefs || {}), status: e.target.value } })}>{STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
          <textarea className="ar-card-notes" value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={() => desc !== (g.description || "") && onPatch(g, { description: desc })} placeholder="Tes notes : où tu en es, codes, astuces…" rows={2} />
        </div>
        <div className="ar-card-act">
          {isWish(g) ? <>
            <button className="ar-b" onClick={() => onFile(g)}><IoCloudUploadOutline size={15} /> Ajouter mon fichier</button>
            <button className="ar-b ghost" onClick={() => onLink(g)}><IoLinkOutline size={15} /> Par un lien</button>
          </> : <>
            <button className="ar-b" onClick={() => onPlay(g)}><IoPlay size={14} /> Jouer</button>
            {g.prefs?.shots?.auto && <button className="ar-b ghost" onClick={() => onPlay(g, "auto")}><IoPlayForward size={14} /> Reprendre</button>}
            <button className="ar-b ghost" onClick={() => onSaves(g)}><IoSaveOutline size={14} /> Sauvegardes</button>
          </>}
        </div>
        {isWish(g) && <p className="ar-note ar-card-tip">Ce jeu est rangé sans fichier. Ajoute la copie de ta cartouche ou de ton disque (ton propre dump) : la fiche, l'artwork et le statut restent.</p>}
      </div>
    </div>, document.body);
}

function SavesDialog({ g, onClose, onResume, onUpdate }) {
  const [list, setList] = useState(null);
  const load = async () => { try { setList(await arcadeApi.saves(g.id)); } catch (_) { setList([]); } };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sram = (list || []).find((s) => s.kind === "sram");
  const del = async (slot) => {
    if (!(await labConfirm(`Supprimer la sauvegarde « ${slotLabel(slot)} » ?`))) return;
    await arcadeApi.delSave(g.id, "state", slot).catch(() => {});
    const shots = { ...(g.prefs?.shots || {}) }; delete shots[slot];
    const ng = await arcadeApi.patch(g.id, { prefs: { ...(g.prefs || {}), shots } }).catch(() => null); if (ng) onUpdate(ng);
    load();
  };
  const restorePrev = async () => {
    if (!(await labConfirm("Remettre la sauvegarde du jeu d'avant la dernière ? La sauvegarde actuelle devient l'avant-dernière."))) return;
    try { const r = await arcadeApi.getSave(g.id, "sram", "main", true); await arcadeApi.putSave(g.id, "sram", "main", r.data, { force: true }); toast.success("Sauvegarde précédente remise en place"); load(); }
    catch (_) { toast.error("Pas de sauvegarde précédente."); }
  };
  return (
    <ArcadeShell eyebrow="SAUVEGARDES" title={g.title} onClose={onClose} wide>
      <p className="ar-note"><b>Sauvegarde du jeu</b> (celle que le jeu écrit lui-même) : {sram ? `${ago(sram.updated_at)}${sram.device ? " · " + sram.device : ""} · version ${sram.rev}` : "aucune pour l'instant"}.
        {sram && sram.rev > 1 && <button className="ar-linkbtn" onClick={restorePrev}><IoReloadOutline size={12} /> Restaurer la précédente</button>}</p>
      <div className="ar-slot-grid">
        {SLOTS.map((s) => {
          const sv = (list || []).find((x) => x.kind === "state" && x.slot === s); const img = g.prefs?.shots?.[s]?.img;
          return (
            <div key={s} className={"ar-slot" + (sv ? "" : " empty")}>
              <span className="ar-slot-img" style={img ? { backgroundImage: `url("${img}")` } : undefined}>{!img && <i>{sv ? "▣" : "vide"}</i>}</span>
              <b>{slotLabel(s)}</b><small>{sv ? `${ago(sv.updated_at)}${sv.device ? " · " + sv.device : ""}` : "Libre"}</small>
              {sv && <span className="ar-slot-act"><button className="ar-b" onClick={() => onResume(s)}><IoPlay size={12} /> Jouer</button><button className="ar-b ghost" onClick={() => del(s)} aria-label="Supprimer"><IoTrashOutline size={13} /></button></span>}
            </div>
          );
        })}
      </div>
      <p className="ar-note ar-dim">Temps de jeu : {playTime(g.play_seconds)} · lancé {g.play_count || 0} fois{g.last_played_at ? ` · dernière partie ${ago(g.last_played_at)}` : ""}.</p>
    </ArcadeShell>
  );
}
