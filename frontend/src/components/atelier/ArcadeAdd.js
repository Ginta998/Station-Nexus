import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose, IoCloudUploadOutline, IoLinkOutline, IoLibraryOutline, IoSearch, IoTrophyOutline, IoCheckmark, IoDownloadOutline, IoAdd, IoOpenOutline } from "react-icons/io5";
import { IoImageOutline, IoSparklesOutline } from "react-icons/io5";
import { PLATFORMS, pf, detectPlatform, cleanTitle, catalogSearch, officialSearch, officialCovers, TEST_GAMES, ACCEPT } from "@/lib/arcade";
import { CoverDialog } from "@/components/atelier/AlexCore";

// L'artwork d'un jeu qu'on ajoute : touche la vignette pour en choisir un (recherche SteamGridDB, lien, fichier, Ctrl V)
function ArtBtn({ title, value, onChange, big }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={"ar-artbtn" + (big ? " big" : "") + (value ? " on" : "")} style={value ? { backgroundImage: `url("${value}")` } : undefined}
        onClick={() => setOpen(true)} title="Choisir l'artwork" aria-label="Choisir l'artwork" data-testid="arcade-art-btn">
        {!value && <><IoImageOutline size={big ? 20 : 15} />{big && <small>Artwork</small>}</>}
      </button>
      {open && <CoverDialog b={{ id: "arc-new", title: title || "Jeu", room: "jeux", format: "vhs" }} current={value || ""}
        onSave={(u) => { if (u !== undefined && u !== null) onChange(u); setOpen(false); }} onClose={() => setOpen(false)} root={document.querySelector(".ar-add-wrap") || undefined} />}
    </>
  );
}
// Premier artwork SteamGridDB trouvé pour ce titre (vide si rien)
export async function autoArt(title) {
  try { const r = (await officialSearch(title)).find((x) => x.src === "sgdb") ; if (!r) return ""; const cs = await officialCovers(r); return cs[0] || r.cover || ""; } catch (_) { return ""; }
}

// Le grand menu d'ajout de l'Arcade : tes fichiers, un lien, le catalogue de jeux libres (installés en un clic),
// et la recherche de jeux officiels (rangés dans la ludothèque sans fichier, avec leur jaquette).
const TABS = [
  ["files", "Mes fichiers", IoCloudUploadOutline],
  ["link", "Par un lien", IoLinkOutline],
  ["catalog", "Catalogue libre", IoLibraryOutline],
  ["official", "Jeux officiels", IoTrophyOutline],
];
const norm = (s = "") => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");

function ConsoleSelect({ value, onChange, allowEmpty = false, id }) {
  return (
    <select className="ar-cs" value={value || ""} onChange={(e) => onChange(e.target.value)} id={id} style={value ? { "--pc": pf(value).color } : undefined}>
      {allowEmpty && <option value="">Choisis la console…</option>}
      {PLATFORMS.map((p) => <option key={p.k} value={p.k}>{p.label}</option>)}
    </select>
  );
}

export default function ArcadeAdd({ tab: tab0 = "files", initialFiles, have, defaultPlatform = "", onClose, onFiles, onLink, onInstall, onWish }) {
  const [tab, setTab] = useState(tab0);
  useEffect(() => { const k = (e) => e.key === "Escape" && !document.querySelector(".ar-add-wrap .ax-fiche-wrap") && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return createPortal(
    <div className="ar-dlg-wrap ar-add-wrap" onClick={onClose}>
      <div className="ar-add" onClick={(e) => e.stopPropagation()} data-testid="arcade-add-panel">
        <header className="ar-add-h">
          <div><p className="mono">NEXUS ARCADE · AJOUTER</p><h3>Ajouter des jeux</h3></div>
          <button className="ar-add-x" onClick={onClose} aria-label="Fermer"><IoClose size={18} /></button>
        </header>
        <nav className="ar-add-tabs">
          {TABS.map(([k, l, I]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} data-testid={`arcade-tab-${k}`}><I size={16} /><span>{l}</span></button>)}
        </nav>
        <div className="ar-add-body">
          {tab === "files" && <FilesTab initial={initialFiles} def={defaultPlatform} onSend={onFiles} />}
          {tab === "link" && <LinkTab def={defaultPlatform} onOk={onLink} />}
          {tab === "catalog" && <CatalogTab have={have} onInstall={onInstall} />}
          {tab === "official" && <OfficialTab have={have} def={defaultPlatform} onWish={onWish} />}
        </div>
      </div>
    </div>, document.body);
}

// ---------- Mes fichiers : la console est reconnue à l'extension ; pour un .zip / .7z, tu la choisis
function FilesTab({ initial, def, onSend }) {
  const [list, setList] = useState([]);
  const [over, setOver] = useState(false);
  const inp = useRef(null);
  const add = (files) => setList((l) => [...l, ...[...files].map((f) => { const d = detectPlatform(f.name); return { file: f, platform: d || def || (d === null ? "" : ""), known: d !== undefined }; })]);
  useEffect(() => { if (initial?.length) add(initial); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = list.filter((x) => x.known && x.platform);
  const [finding, setFinding] = useState(false);
  const findArt = async () => {
    setFinding(true);
    for (const x of list.filter((y) => !y.cover).slice(0, 12)) { const u = await autoArt(cleanTitle(x.file.name)); if (u) setList((l) => l.map((y) => (y === x || y.file === x.file ? { ...y, cover: u } : y))); }
    setFinding(false);
  };
  const size = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(b > 1e8 ? 0 : 1)} Mo` : `${Math.ceil(b / 1024)} Ko`);
  return (
    <div className="ar-tab">
      <button className={"ar-drop" + (over ? " on" : "")} onClick={() => inp.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }} data-testid="arcade-drop">
        <IoCloudUploadOutline size={30} />
        <b>Glisse tes jeux ici, ou touche pour choisir</b>
        <small>.gba .gb .gbc .nes .sfc .md .sms .gg .nds .z64 .chd .pbp, ou une archive .zip / .7z · plusieurs à la fois</small>
      </button>
      <input ref={inp} type="file" multiple accept={ACCEPT} hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      {list.length > 0 && (
        <div className="ar-flist">
          {list.map((x, i) => (
            <div key={i} className={"ar-frow" + (!x.known ? " bad" : "")}>
              <ArtBtn title={cleanTitle(x.file.name)} value={x.cover} onChange={(u) => setList((l) => l.map((y, j) => (j === i ? { ...y, cover: u } : y)))} />
              <span className="ar-pill" style={{ "--pc": x.platform ? pf(x.platform).color : "#777" }}>{x.platform ? pf(x.platform).short : "?"}</span>
              <span className="ar-fname"><b>{cleanTitle(x.file.name)}</b><small>{x.file.name} · {size(x.file.size)}{!x.known ? " · format non lu par l'Arcade" : ""}</small></span>
              {x.known && <ConsoleSelect value={x.platform} allowEmpty onChange={(v) => setList((l) => l.map((y, j) => (j === i ? { ...y, platform: v } : y)))} />}
              <button className="ar-rm" onClick={() => setList((l) => l.filter((_, j) => j !== i))} aria-label="Retirer"><IoClose size={14} /></button>
            </div>
          ))}
        </div>
      )}
      {list.length > 0 && <div className="ar-artbar"><small>Touche la vignette d'un jeu pour choisir son artwork, ou laisse la Station chercher.</small>
        <button type="button" className="ar-b ghost" disabled={finding || list.every((x) => x.cover)} onClick={findArt} data-testid="arcade-art-auto"><IoSparklesOutline size={14} /> {finding ? "Recherche…" : "Trouver les artworks"}</button></div>}
      <div className="ar-tab-foot">
        <small>{list.some((x) => x.known && !x.platform) ? "Choisis la console des archives (.zip, .7z)." : "Les fichiers partent en morceaux vers ta Station : tu peux continuer à naviguer."}</small>
        <button className="ar-b" disabled={!ok.length} onClick={() => onSend(ok.map(({ file, platform, cover }) => ({ file, platform, cover: cover || "" })))} data-testid="arcade-files-send">Envoyer {ok.length || ""} jeu{ok.length > 1 ? "x" : ""}</button>
      </div>
    </div>
  );
}

function LinkTab({ def, onOk }) {
  const [url, setUrl] = useState(""); const [title, setTitle] = useState(""); const [plat, setPlat] = useState(def || ""); const [cover, setCover] = useState("");
  const guess = useMemo(() => { try { const n = decodeURIComponent(new URL(url).pathname.split("/").pop() || ""); return detectPlatform(n); } catch (_) { return undefined; } }, [url]);
  useEffect(() => { if (guess) setPlat(guess); }, [guess]);
  const valid = /^https?:\/\//i.test(url.trim()) && plat;
  return (
    <form className="ar-tab" onSubmit={(e) => { e.preventDefault(); if (valid) onOk({ url: url.trim(), title: title.trim() || undefined, platform: plat, cover: cover || undefined }); }}>
      <label className="ar-f"><span>Lien vers le fichier du jeu</span><input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/file/d/…  ·  https://www.dropbox.com/…  ·  https://…/jeu.gba" data-testid="arcade-link-url" /></label>
      <div className="ar-row2">
        <label className="ar-f"><span>Console</span><ConsoleSelect value={plat} allowEmpty onChange={setPlat} /></label>
        <label className="ar-f"><span>Nom (facultatif)</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Repris du nom du fichier" /></label>
      </div>
      <div className="ar-artrow"><ArtBtn big title={title || (() => { try { return cleanTitle(decodeURIComponent(new URL(url).pathname.split("/").pop() || "")); } catch (_) { return ""; } })()} value={cover} onChange={setCover} />
        <p className="ar-note">Artwork (facultatif) : touche le carré pour chercher sur SteamGridDB, coller un lien ou envoyer une image. Sans artwork, la boîte est dessinée à partir du titre.</p></div>
      <p className="ar-note">Le serveur de ta Station télécharge le fichier lui-même, même gros : tu peux fermer l'Atelier pendant ce temps. Google Drive : partage « à toute personne disposant du lien ». Dropbox : le lien de partage suffit.</p>
      <div className="ar-tab-foot"><span /><button className="ar-b" disabled={!valid} data-testid="arcade-link-ok">Installer</button></div>
    </form>
  );
}

// ---------- Catalogue libre : Homebrew Hub (homebrews GB, GBC, GBA, NES) + la sélection de test
function CatalogTab({ have, onInstall }) {
  const [q, setQ] = useState(""); const [plat, setPlat] = useState("");
  const [res, setRes] = useState(null); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1); const [done, setDone] = useState({});
  const owned = useMemo(() => new Set(have.map((g) => norm(g.title))), [have]);
  const run = async (p = 1) => {
    setBusy(true); setErr("");
    try { const r = await catalogSearch({ title: q.trim(), platform: plat, page: p }); setRes((old) => (p > 1 && old ? { ...r, items: [...old.items, ...r.items] } : r)); setPage(p); }
    catch (_) { setErr("Le catalogue Homebrew Hub ne répond pas pour l'instant."); if (p === 1) setRes({ items: [], total: 0, pages: 1 }); }
    setBusy(false);
  };
  useEffect(() => { const t = setTimeout(() => run(1), 350); return () => clearTimeout(t); }, [q, plat]); // eslint-disable-line react-hooks/exhaustive-deps
  const install = (it) => { setDone((d) => ({ ...d, [it.slug || it.title]: true })); onInstall(it); };
  const picks = TEST_GAMES.map((t) => ({ slug: "t-" + t.title, title: t.title, dev: t.by, license: t.lic, tags: [t.note], platform: "gba", shot: "", file: t.file_name, url: t.url }));
  const Item = ({ it }) => {
    const got = owned.has(norm(it.title)); const sent = done[it.slug || it.title]; const p = pf(it.platform);
    return (
      <div className="ar-cat" style={{ "--pc": p.color }}>
        <span className="ar-cat-shot" style={it.shot ? { backgroundImage: `url("${it.shot}")` } : undefined}>{!it.shot && <i>{p.short}</i>}<em className="ar-pill">{p.short}</em></span>
        <b>{it.title}</b>
        <small>{[it.dev, it.license && "licence " + it.license].filter(Boolean).join(" · ")}</small>
        {it.tags?.length > 0 && <span className="ar-tags">{it.tags.slice(0, 2).map((t) => <i key={t}>{t}</i>)}</span>}
        <button className={"ar-b" + (got || sent ? " ghost" : "")} disabled={got || sent || !it.url} onClick={() => install(it)}>
          {got ? <><IoCheckmark size={14} /> Dans ta ludothèque</> : sent ? <><IoCheckmark size={14} /> Installation…</> : <><IoDownloadOutline size={14} /> Installer</>}
        </button>
      </div>
    );
  };
  return (
    <div className="ar-tab">
      <div className="ar-qrow">
        <label className="ar-search"><IoSearch size={15} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un jeu libre (titre)" data-testid="arcade-cat-q" /></label>
        <div className="ar-chips">{[["", "Tous"], ["GB", "Game Boy"], ["GBC", "Color"], ["GBA", "GBA"], ["NES", "NES"]].map(([k, l]) => <button key={k} className={plat === k ? "on" : ""} onClick={() => setPlat(k)}>{l}</button>)}</div>
      </div>
      <p className="ar-note">Des jeux faits par des créateurs indépendants (homebrews), gratuits et publiés avec leur licence, sur <b>Homebrew Hub</b>. Un clic : le serveur les télécharge et ils arrivent sur l'étagère.</p>
      {!q && !plat && <><h4 className="ar-h4">Sélection pour tester la console</h4><div className="ar-cat-grid">{picks.map((it) => <Item key={it.slug} it={it} />)}</div><h4 className="ar-h4">Homebrew Hub</h4></>}
      {err && <p className="ar-note ar-errtxt">{err}</p>}
      {res && <div className="ar-cat-grid" data-testid="arcade-cat-results">{res.items.map((it) => <Item key={it.slug} it={it} />)}</div>}
      {res && !res.items.length && !busy && !err && <p className="ar-note">Aucun jeu libre ne porte ce titre.</p>}
      <div className="ar-tab-foot"><small>{busy ? "Recherche…" : res ? `${res.total || res.items.length} jeu(x)` : ""}</small>{res && page < res.pages && <button className="ar-b ghost" onClick={() => run(page + 1)} disabled={busy}>Plus de jeux</button>}</div>
    </div>
  );
}

// ---------- Jeux officiels : n'importe quel jeu, pour le ranger dans la ludothèque (sans le télécharger)
const GUESS = [[/game boy advance|\bgba\b/i, "gba"], [/game boy color/i, "gbc"], [/game boy/i, "gb"], [/super nintendo|super famicom|\bsnes\b/i, "snes"], [/nintendo 64/i, "n64"],
  [/nintendo ds|\bds\b/i, "nds"], [/nintendo entertainment|\bnes\b|famicom/i, "nes"], [/playstation/i, "psx"], [/mega drive|genesis/i, "segaMD"], [/master system/i, "segaMS"], [/game gear/i, "segaGG"], [/arcade|borne/i, "arcade"]];
function OfficialTab({ have, def, onWish }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState(null); const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState(null); const [covers, setCovers] = useState(null); const [cover, setCover] = useState("");
  const [plat, setPlat] = useState(def || ""); const [year, setYear] = useState(""); const [title, setTitle] = useState("");
  const [added, setAdded] = useState({});
  const owned = useMemo(() => new Set(have.map((g) => norm(g.title))), [have]);
  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return undefined; }
    const t = setTimeout(async () => { setBusy(true); setRes(await officialSearch(q.trim())); setBusy(false); }, 450);
    return () => clearTimeout(t);
  }, [q]);
  const pick = async (it) => {
    setSel(it); setTitle(it.title); setCover(it.cover || ""); setCovers(null);
    const g = GUESS.find(([re]) => re.test(it.desc || "")); if (g) setPlat(g[1]);
    const y = (it.desc || "").match(/\b(19[7-9]\d|20[0-2]\d)\b/); setYear(y ? y[1] : "");
    const cs = await officialCovers(it); setCovers(cs); if (!it.cover && cs[0]) setCover(cs[0]);
  };
  const add = async () => { await onWish({ title: title.trim() || sel.title, platform: plat, cover, year }); setAdded((a) => ({ ...a, [norm(title || sel.title)]: true })); setSel(null); };
  return (
    <div className="ar-tab">
      <label className="ar-search big"><IoSearch size={16} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher n'importe quel jeu : Zelda Minish Cap, Pokémon Émeraude, Final Fantasy VII…" data-testid="arcade-off-q" /></label>
      <p className="ar-note">Range dans ta ludothèque les jeux que tu possèdes, avec leur jaquette. Rien n'est téléchargé : tu ajoutes ensuite ta propre copie (le dump de ta cartouche ou de ton disque) depuis la fiche du jeu. Sources : SteamGridDB et Wikipédia.</p>
      {busy && <p className="ar-note">Recherche…</p>}
      {sel ? (
        <div className="ar-off-sel">
          <div className="ar-off-cov">
            <span className="ar-off-big" style={cover ? { backgroundImage: `url("${cover}")` } : undefined}>{!cover && <i>Pas de jaquette</i>}</span>
            {covers === null ? <small>Jaquettes…</small> : covers.length > 0 && <div className="ar-off-thumbs">{covers.slice(0, 12).map((u) => <button key={u} className={u === cover ? "on" : ""} style={{ backgroundImage: `url("${u}")` }} onClick={() => setCover(u)} aria-label="Choisir cette jaquette" />)}</div>}
          </div>
          <div className="ar-off-form">
            <label className="ar-f"><span>Titre</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <div className="ar-row2">
              <label className="ar-f"><span>Console</span><ConsoleSelect value={plat} allowEmpty onChange={setPlat} /></label>
              <label className="ar-f"><span>Année</span><input value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2004" inputMode="numeric" /></label>
            </div>
            {sel.desc && <p className="ar-note">{sel.desc}{sel.wiki && <> · <a href={sel.wiki} target="_blank" rel="noreferrer">Wikipédia <IoOpenOutline size={11} /></a></>}</p>}
            <div className="ar-tab-foot"><button className="ar-b ghost" onClick={() => setSel(null)}>Retour</button><button className="ar-b" disabled={!plat} onClick={add} data-testid="arcade-off-add"><IoAdd size={15} /> Ranger dans ma ludothèque</button></div>
          </div>
        </div>
      ) : res && (
        <div className="ar-off-list" data-testid="arcade-off-results">
          {res.length === 0 && !busy && <p className="ar-note">Aucun jeu trouvé. Essaie le titre original ou anglais.</p>}
          {res.map((it) => {
            const got = owned.has(norm(it.title)) || added[norm(it.title)];
            return (
              <button key={it.src + it.id} className="ar-off" onClick={() => pick(it)}>
                <span className="ar-off-cv" style={it.cover ? { backgroundImage: `url("${it.cover}")` } : undefined} />
                <span className="ar-off-t"><b>{it.title}</b><small>{it.desc || (it.src === "sgdb" ? "SteamGridDB" : "Wikipédia")}</small></span>
                {got ? <i className="ar-off-got"><IoCheckmark size={13} /> rangé</i> : <i className="ar-off-src">{it.src === "sgdb" ? "SGDB" : "WIKI"}</i>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
