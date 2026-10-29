import { useRef, useState } from "react";
import { IoAdd, IoTrashOutline, IoPlay, IoContractOutline, IoCloudUploadOutline, IoOpenOutline, IoClose, IoListOutline, IoArrowUp, IoArrowDown, IoCreateOutline } from "react-icons/io5";
import { toast } from "sonner";
import { DEFAULT_APPS, toEmbed, popOut } from "@/lib/embed";
import { atelierApi } from "@/lib/atelier";
import { EmbedFrame } from "@/components/atelier/AppScreens";
import { pressMenu } from "@/components/atelier/ContextMenu";

// Mode d'ouverture choisi par app (intégré / fenêtre / onglet), mémorisé en local — tu choisis, et tu changes quand tu veux.
const AMODE_KEY = "nexus-app-mode";
const loadModes = () => { try { return JSON.parse(localStorage.getItem(AMODE_KEY) || "{}"); } catch { return {}; } };
const MODE_LABEL = { embed: "INTÉGRÉ ▣", popup: "FENÊTRE ↗", tab: "ONGLET ⤢" };

// Le Bureau : tes applications et un lanceur universel. Chaque app s'ouvre comme TU veux (intégré, fenêtre, onglet).
export function BureauView({ at, launch }) {
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null); // {id?, title, url, color, mode}
  const [modes, setModes] = useState(loadModes);
  const custom = at.links.filter((l) => l.kind === "app");
  const hidden = at.config.hidden_apps || [];
  const setMode = (key, m) => { const n = { ...modes, [key]: m }; setModes(n); try { localStorage.setItem(AMODE_KEY, JSON.stringify(n)); } catch (_) {} };
  const smart = (url) => { const e = toEmbed(url); return e && !e.blocked && !e.maybe ? "embed" : "popup"; }; // par défaut : intègre seulement si c'est sûr, sinon fenêtre (pas de page morte)
  const modeOf = (a) => modes[a.key] || smart(a.url);
  const openWith = (a, m) => {
    if (m === "tab") return window.open(a.url, "_blank", "noopener");
    if (m === "embed") { const e = toEmbed(a.url); if (e?.blocked) { toast.message("Ce service bloque l'intégration — ouvert en fenêtre"); return popOut(a.url, "nexus-" + a.key); } return launch({ title: a.title, url: a.url }); }
    return popOut(a.url, "nexus-" + a.key);
  };
  const removeApp = async (a) => {
    if (!window.confirm(`Retirer « ${a.title} » du bureau ?`)) return;
    if (a.custom) await at.removeLink(a.custom.id); else await at.saveConfig({ hidden_apps: [...hidden, a.key] });
    toast.success(`${a.title} retiré du bureau`);
  };
  const save = async () => {
    if (!form.title.trim() || !/^https?:\/\//.test(form.url)) return toast.error("Nom et lien https:// requis");
    const doc = await at.saveLink({ id: form.id, title: form.title.trim(), url: form.url.trim(), color: form.color, kind: "app" });
    if (doc?.id && form.mode && form.mode !== "auto") setMode(doc.id, form.mode);
    setForm(null); toast.success(form.id ? "App modifiée" : "App ajoutée");
  };
  return (
    <section className="at-view" data-testid="atelier-bureau">
      <header className="at-head"><p className="at-eyebrow mono">// BUREAU NUMÉRIQUE</p><h1>Tes outils, à bord</h1><p className="at-sub">Colle n'importe quel lien. Pour chaque app tu choisis comment elle s'ouvre : intégrée dans la Station, en fenêtre à côté, ou dans un onglet — et tu peux changer d'avis (clic droit sur la tuile, ou le crayon).</p></header>
      <form className="at-capture" onSubmit={(e) => { e.preventDefault(); const u = q.trim(); if (u) { openWith({ title: "Lien", url: u, key: "launch" }, smart(u)); setQ(""); } }}>
        <textarea rows={1} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.form.requestSubmit(); } }} placeholder="Colle un lien à ouvrir dans la Station…" data-testid="atelier-bureau-launch" />
        <button className="at-btn" type="submit"><IoPlay size={14} /> Ouvrir</button>
      </form>
      <div className="at-apps">
        {[...DEFAULT_APPS.filter((a) => !hidden.includes(a.key)), ...custom.map((l) => ({ key: l.id, title: l.title, url: l.url, color: l.color || "var(--brand)", k: l.title[0], custom: l }))].map((a) => {
          const m = modeOf(a);
          const editApp = () => setForm({ id: a.custom.id, title: a.custom.title, url: a.custom.url, color: a.custom.color || "#ffb340", mode: modes[a.key] || "auto" });
          const menu = () => ({ title: a.title, entries: [
            { id: "embed", label: "Intégré ▣" + (m === "embed" ? "  ✓" : ""), onClick: () => { setMode(a.key, "embed"); openWith(a, "embed"); } },
            { id: "popup", label: "Fenêtre ↗" + (m === "popup" ? "  ✓" : ""), onClick: () => { setMode(a.key, "popup"); openWith(a, "popup"); } },
            { id: "tab", label: "Onglet ⤢" + (m === "tab" ? "  ✓" : ""), onClick: () => { setMode(a.key, "tab"); openWith(a, "tab"); } },
            "-",
            ...(a.custom ? [{ id: "edit", label: "Modifier (titre, lien…)", onClick: editApp }] : []),
            { id: "remove", label: "Retirer du bureau", danger: true, onClick: () => removeApp(a) },
          ] });
          return (
            <div key={a.key} className="at-app-tile" style={{ "--c": a.color }} role="button" tabIndex={0} onClick={() => openWith(a, m)} onKeyDown={(e) => e.key === "Enter" && openWith(a, m)} data-testid={`atelier-app-${a.key}`} {...pressMenu(menu)}>
              <span className="ico">{a.k}</span><b>{a.title}</b>
              <small className="mono">{MODE_LABEL[m]}</small>
              {a.tip && <em>{a.tip}</em>}
              {a.custom && <button className="rm edit" onClick={(e) => { e.stopPropagation(); editApp(); }} aria-label="Modifier" title="Modifier (titre, lien)" data-testid={`atelier-app-edit-${a.key}`}><IoCreateOutline size={13} /></button>}
              <button className="rm" onClick={(e) => { e.stopPropagation(); removeApp(a); }} aria-label="Retirer" title="Retirer du bureau" data-testid={`atelier-app-remove-${a.key}`}><IoTrashOutline size={13} /></button>
            </div>
          );
        })}
        <button className="at-app-tile add" onClick={() => setForm({ title: "", url: "", color: "#ffb340", mode: "auto" })} data-testid="atelier-app-add"><span className="ico"><IoAdd size={22} /></span><b>Ajouter une app</b></button>
      </div>
      {hidden.length > 0 && <button className="at-btn ghost at-restore" onClick={() => at.saveConfig({ hidden_apps: [] })} data-testid="atelier-apps-restore">Réafficher les {hidden.length} app{hidden.length > 1 ? "s" : ""} retirée{hidden.length > 1 ? "s" : ""}</button>}
      {form && (
        <div className="at-panel at-inline" data-testid="atelier-app-form">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nom" />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" style={{ flex: 1 }} data-testid="atelier-app-url" />
          <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} aria-label="Mode d'ouverture" data-testid="atelier-app-mode">
            <option value="auto">Auto</option>
            <option value="embed">Intégré ▣</option>
            <option value="popup">Fenêtre ↗</option>
            <option value="tab">Onglet ⤢</option>
          </select>
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          <button className="at-btn" onClick={save} data-testid="atelier-app-save">{form.id ? "Enregistrer" : "Ajouter"}</button>
          <button className="at-btn ghost" onClick={() => setForm(null)}>Annuler</button>
        </div>
      )}
    </section>
  );
}

const ytThumb = (url = "") => { const y = (url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1]; return y ? `https://i.ytimg.com/vi/${y}/hqdefault.jpg` : ""; };

// Playlists + ordre des rubriques persistés en local (le backend distant ne stocke pas encore ces champs).
const PL_KEY = "nexus-playlists";
const ORDER_KEY = "nexus-salon-order";
const DEFAULT_ORDER = ["playlists", "watch", "video", "listen", "integrations"];
const loadPls = (fallback) => { try { const v = JSON.parse(localStorage.getItem(PL_KEY) || "null"); if (Array.isArray(v)) return v; } catch (_) {} return Array.isArray(fallback) ? fallback : []; };
const loadOrder = () => { try { const v = JSON.parse(localStorage.getItem(ORDER_KEY) || "null"); if (Array.isArray(v)) return [...v.filter((k) => DEFAULT_ORDER.includes(k)), ...DEFAULT_ORDER.filter((k) => !v.includes(k))]; } catch (_) {} return DEFAULT_ORDER; };

// Le Salon : ton Netflix / Apple TV personnel — vidéos, playlists, intégrations de sites. File d'attente + enchaînement auto.
export function SalonView({ at, launch, mini }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(null);
  const [addTo, setAddTo] = useState(null);
  const [openPl, setOpenPl] = useState(null);
  const [playlists, setPlaylists] = useState(() => loadPls(at.config?.playlists));
  const [order, setOrder] = useState(loadOrder);
  const file = useRef(null);
  const links = at.links.filter((l) => l.kind !== "app");
  const byKind = (k) => links.filter((l) => l.kind === k);
  const watch = byKind("watch"), listen = byKind("listen"), video = byKind("video"), site = byKind("site");
  const featured = watch[0] || video[0] || listen[0] || links[0];
  const plItems = (p) => (p.ids || []).map((id) => links.find((l) => l.id === id)).filter(Boolean);

  const add = async (e) => {
    e.preventDefault();
    const em = toEmbed(url); if (!em) return toast.error("Colle un lien valide");
    let t = title.trim();
    if (!t) {
      const y = (url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1];
      if (y) { try { const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${y}&format=json`); if (r.ok) { const d = await r.json(); if (d?.title) t = d.title; } } catch (_) {} }
    }
    const kind = em.ratio === "audio" || em.audio ? "listen" : em.ratio === "page" ? "site" : "watch";
    await at.saveLink({ title: t || em.provider, url: url.trim(), kind });
    setUrl(""); setTitle(""); toast.success(kind === "site" ? "Site intégré — titre modifiable d'un clic sur ✎" : "Ajouté au Salon");
  };
  const upload = async (f) => {
    if (!f) return;
    try {
      setBusy(0);
      const up = await atelierApi.upload(f, (p) => setBusy(Math.round(p * 100)));
      await at.saveLink({ title: f.name.replace(/\.[^.]+$/, ""), url: up.url, kind: f.type.startsWith("audio/") ? "listen" : "video" });
      toast.success("Ajouté à tes vidéos");
    } catch (e) { toast.error(e?.response?.data?.detail || "Envoi impossible"); }
    finally { setBusy(null); }
  };
  const play = (item, items) => {
    const em = toEmbed(item.url);
    if (em?.blocked) return popOut(item.url);
    const list = items && items.length ? items : [item];
    const qi = Math.max(0, list.findIndex((x) => x.id === item.id));
    launch({ title: item.title, url: item.url, queue: list.map((x) => ({ title: x.title, url: x.url })), qi });
  };
  const renameLink = (l) => {
    const t = window.prompt("Titre", l.title || ""); if (t === null) return;
    const u = window.prompt("Lien (au cas où il ne fonctionne plus)", l.url || ""); if (u === null) return;
    at.saveLink({ ...l, title: t.trim() || l.title, url: u.trim() || l.url }).then(() => toast.success("Modifié"));
  };
  const savePl = (pl) => { setPlaylists(pl); try { localStorage.setItem(PL_KEY, JSON.stringify(pl)); } catch (_) {} };
  const newPlaylist = () => { const name = window.prompt("Nom de la playlist (ex. One Piece)"); if (name && name.trim()) savePl([...playlists, { id: "pl-" + Date.now(), name: name.trim(), ids: [] }]); };
  const renamePl = (p) => { const n = window.prompt("Nom de la playlist", p.name); if (n && n.trim()) savePl(playlists.map((x) => x.id === p.id ? { ...x, name: n.trim() } : x)); };
  const addToPlaylist = (plId, linkId) => { savePl(playlists.map((p) => p.id === plId ? { ...p, ids: p.ids.includes(linkId) ? p.ids : [...p.ids, linkId] } : p)); setAddTo(null); toast.success("Ajouté à la playlist"); };
  const removePlaylist = (plId) => { if (window.confirm("Supprimer cette playlist ? (les vidéos restent dans le Salon)")) { savePl(playlists.filter((p) => p.id !== plId)); setOpenPl(null); } };
  const saveOrder = (o) => { setOrder(o); try { localStorage.setItem(ORDER_KEY, JSON.stringify(o)); } catch (_) {} };
  const moveSec = (k, dir) => { const i = order.indexOf(k), j = i + dir; if (i < 0 || j < 0 || j >= order.length) return; const o = [...order]; [o[i], o[j]] = [o[j], o[i]]; saveOrder(o); };

  const Card = ({ l, items }) => {
    const em = toEmbed(l.url) || {}; const thumb = ytThumb(l.url);
    return (
      <div className="sx-card" data-testid={`atelier-show-${l.id}`}>
        <div className="art" onClick={() => play(l, items)}>
          {thumb ? <img src={thumb} alt="" loading="lazy" /> : <span className="k">{l.kind === "listen" ? "♫" : l.kind === "video" ? "映" : l.kind === "site" ? "❖" : "▶"}</span>}
          <span className="pl">{em.blocked ? <IoOpenOutline size={20} /> : <IoPlay size={22} />}</span>
        </div>
        <div className="meta"><b>{l.title}</b><small className="mono">{(em.provider || "").toUpperCase()}</small></div>
        <div className="acts">
          <button className="at-icon" title="Renommer" onClick={() => renameLink(l)}><IoCreateOutline size={14} /></button>
          <button className="at-icon" title="Ajouter à une playlist" onClick={() => setAddTo(l.id)}><IoAdd size={15} /></button>
          {!em.blocked && <button className="at-icon" title="Mini-lecteur" onClick={() => mini({ title: l.title, url: l.url })} data-testid={`atelier-show-mini-${l.id}`}><IoContractOutline size={14} /></button>}
          <button className="at-icon danger" title="Retirer du Salon" onClick={() => at.removeLink(l.id)}><IoTrashOutline size={14} /></button>
        </div>
      </div>
    );
  };
  const Rail = ({ children }) => {
    const ref = useRef(null);
    const scroll = (d) => ref.current?.scrollBy({ left: d * Math.max(260, ref.current.clientWidth * 0.8), behavior: "smooth" });
    return (
      <div className="sx-railwrap">
        <button className="sx-arrow left" onClick={() => scroll(-1)} aria-label="Précédent" tabIndex={-1}>‹</button>
        <div className="sx-rail" ref={ref}>{children}</div>
        <button className="sx-arrow right" onClick={() => scroll(1)} aria-label="Suivant" tabIndex={-1}>›</button>
      </div>
    );
  };
  const SecHead = ({ k, title, extra }) => (
    <div className="sx-row-h">
      <h3>{title}</h3>{extra}
      <span className="sx-ord">
        <button className="at-icon" title="Monter la rubrique" disabled={order.indexOf(k) <= 0} onClick={() => moveSec(k, -1)} data-testid={`atelier-salon-up-${k}`}><IoArrowUp size={14} /></button>
        <button className="at-icon" title="Descendre la rubrique" disabled={order.indexOf(k) >= order.length - 1} onClick={() => moveSec(k, 1)} data-testid={`atelier-salon-down-${k}`}><IoArrowDown size={14} /></button>
      </span>
    </div>
  );

  const PlaylistsSec = () => {
    if (!playlists.length) return null;
    const open = playlists.find((p) => p.id === openPl);
    const openIts = open ? plItems(open) : [];
    return (
      <section className="sx-row" data-testid="atelier-salon-playlists">
        <SecHead k="playlists" title="Playlists" />
        <Rail>
          {playlists.map((p) => {
            const its = plItems(p); const cov = its[0] && ytThumb(its[0].url);
            return (
              <div key={p.id} className={"sx-plcard" + (openPl === p.id ? " on" : "")} data-testid={`atelier-pl-${p.id}`}>
                <div className="art" onClick={() => setOpenPl(openPl === p.id ? null : p.id)}>
                  {cov ? <img src={cov} alt="" loading="lazy" /> : <span className="k">☰</span>}
                  <span className="cnt mono">{its.length}</span>
                  {its.length > 0 && <span className="pl" onClick={(e) => { e.stopPropagation(); play(its[0], its); }} title="Tout lire"><IoPlay size={20} /></span>}
                </div>
                <div className="meta"><b>{p.name}</b><small className="mono">{its.length} VIDÉO{its.length > 1 ? "S" : ""}</small></div>
                <div className="acts">
                  <button className="at-icon" title="Renommer" onClick={() => renamePl(p)}><IoCreateOutline size={14} /></button>
                  <button className="at-icon danger" title="Supprimer la playlist" onClick={() => removePlaylist(p.id)}><IoTrashOutline size={14} /></button>
                </div>
              </div>
            );
          })}
        </Rail>
        {open && (
          <div className="sx-plopen" data-testid="atelier-pl-open">
            <div className="sx-plopen-h"><b>{open.name}</b>{openIts.length > 0 && <button className="at-btn" onClick={() => play(openIts[0], openIts)}><IoPlay size={14} /> Tout lire</button>}<button className="at-icon" onClick={() => setOpenPl(null)} title="Replier"><IoClose size={15} /></button></div>
            {openIts.length ? <Rail>{openIts.map((l) => <Card key={l.id} l={l} items={openIts} />)}</Rail> : <p className="at-empty">Vide — ajoute des vidéos avec le + d'une carte.</p>}
          </div>
        )}
      </section>
    );
  };

  const IntegrationsSec = () => {
    if (!site.length) return null;
    return (
      <section className="sx-row sx-integs" data-testid="atelier-salon-integrations">
        <SecHead k="integrations" title="Intégrations" />
        <div className="sx-integ-list">
          {site.map((l) => (
            <div key={l.id} className="sx-integ" data-testid={`atelier-integ-${l.id}`}>
              <div className="sx-integ-h">
                <b>{l.title}</b>
                <span className="sx-integ-acts">
                  <button className="at-icon" title="Renommer" onClick={() => renameLink(l)}><IoCreateOutline size={14} /></button>
                  <button className="at-icon" title="Ouvrir à côté" onClick={() => popOut(l.url)}><IoOpenOutline size={14} /></button>
                  <button className="at-icon danger" title="Retirer" onClick={() => at.removeLink(l.id)}><IoTrashOutline size={14} /></button>
                </span>
              </div>
              <div className="sx-integ-frame"><EmbedFrame url={l.url} /></div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const ItemsSec = ({ k, title, items }) => !items.length ? null : (
    <section className="sx-row">
      <SecHead k={k} title={title} />
      <Rail>{items.map((l) => <Card key={l.id} l={l} items={items} />)}</Rail>
    </section>
  );
  const LABELS = { watch: "À regarder", video: "Mes vidéos", listen: "À écouter" };
  const ITEMS = { watch, video, listen };

  return (
    <section className="at-view at-salon2" data-testid="atelier-salon">
      {featured && (
        <header className="sx-hero" style={{ cursor: "pointer" }} onClick={() => play(featured, watch.length ? watch : links)}>
          {ytThumb(featured.url) && <img className="bg" src={ytThumb(featured.url)} alt="" />}
          <div className="in">
            <p className="at-eyebrow mono">// SALON · À L'AFFICHE</p>
            <h1>{featured.title}</h1>
            <span className="sx-playbtn"><IoPlay size={18} /> Lecture</span>
          </div>
        </header>
      )}

      <form className="at-tadd" onSubmit={add} data-testid="atelier-salon-add">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Lien YouTube, Spotify, Twitch, un site web à parcourir…" data-testid="atelier-salon-url" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre (optionnel)" style={{ flex: "0 1 220px" }} />
        <button className="at-btn" type="submit" data-testid="atelier-salon-submit"><IoAdd size={15} /> Ajouter</button>
        <button type="button" className="at-btn ghost" onClick={() => file.current?.click()} disabled={busy !== null} data-testid="atelier-salon-upload"><IoCloudUploadOutline size={15} /> {busy !== null ? `${busy}%` : "Importer"}</button>
        <button type="button" className="at-btn ghost" onClick={newPlaylist} data-testid="atelier-salon-newpl"><IoListOutline size={15} /> Nouvelle playlist</button>
        <input ref={file} hidden type="file" accept="video/*,audio/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; upload(f); }} />
      </form>

      {links.length === 0 && playlists.length === 0 && <p className="at-empty big">Ajoute un premier lien ou importe une vidéo. Crée des playlists (ex. les épisodes d'un anime), intègre des sites web à parcourir, et réorganise tes rubriques avec les flèches.</p>}

      {order.map((k) => {
        if (k === "playlists") return <PlaylistsSec key={k} />;
        if (k === "integrations") return <IntegrationsSec key={k} />;
        return <ItemsSec key={k} k={k} title={LABELS[k]} items={ITEMS[k]} />;
      })}

      {addTo && (
        <div className="sx-pick" onClick={() => setAddTo(null)} data-testid="atelier-salon-pick">
          <div className="box" onClick={(e) => e.stopPropagation()}>
            <div className="h"><b>Ajouter à une playlist</b><button className="at-icon" onClick={() => setAddTo(null)}><IoClose size={16} /></button></div>
            {playlists.length === 0 && <p className="empty">Aucune playlist encore — crées-en une.</p>}
            {playlists.map((p) => <button key={p.id} className="opt" onClick={() => addToPlaylist(p.id, addTo)}><IoListOutline size={15} /> <span>{p.name}</span><small>{(p.ids || []).length}</small></button>)}
            <button className="opt new" onClick={() => { const name = window.prompt("Nom de la playlist"); if (name && name.trim()) { savePl([...playlists, { id: "pl-" + Date.now(), name: name.trim(), ids: [addTo] }]); setAddTo(null); toast.success("Playlist créée"); } }}><IoAdd size={15} /> Nouvelle playlist</button>
          </div>
        </div>
      )}
    </section>
  );
}
