import { useRef, useState } from "react";
import { IoAdd, IoTrashOutline, IoPlay, IoContractOutline, IoCloudUploadOutline, IoOpenOutline } from "react-icons/io5";
import { toast } from "sonner";
import { DEFAULT_APPS, toEmbed, popOut } from "@/lib/embed";
import { atelierApi } from "@/lib/atelier";

// Le Bureau : tes applications et un lanceur universel — tout s'ouvre dans la Station quand c'est possible
export function BureauView({ at, launch, go }) {
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null);
  const custom = at.links.filter((l) => l.kind === "app");
  const run = (title, url) => { const e = toEmbed(url); if (e?.blocked) popOut(url); else launch({ title, url }); };
  const add = async () => { if (!form.title.trim() || !/^https?:\/\//.test(form.url)) return toast.error("Nom et lien https:// requis"); await at.saveLink({ ...form, kind: "app" }); setForm(null); };
  return (
    <section className="at-view" data-testid="atelier-bureau">
      <header className="at-head"><p className="at-eyebrow mono">// BUREAU NUMÉRIQUE</p><h1>Tes outils, à bord</h1><p className="at-sub">Colle n'importe quel lien : YouTube, Spotify, Canva, Google Docs/Drive, Twitch, Telegram… Un contenu précis (vidéo, playlist, doc partagé) s'ouvre ici ; les applications s'ouvrent dans leur propre fenêtre, la Station reste ouverte.</p></header>
      <form className="at-capture" onSubmit={(e) => { e.preventDefault(); if (q.trim()) { run("Lien", q.trim()); setQ(""); } }}>
        <textarea rows={1} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.form.requestSubmit(); } }} placeholder="Colle un lien à ouvrir dans la Station…" data-testid="atelier-bureau-launch" />
        <button className="at-btn" type="submit"><IoPlay size={14} /> Ouvrir</button>
      </form>
      <div className="at-apps">
        {[...DEFAULT_APPS, ...custom.map((l) => ({ key: l.id, title: l.title, url: l.url, color: l.color || "var(--brand)", k: l.title[0], custom: l }))].map((a) => {
          const openTile = () => (a.view ? go({ name: a.view }) : popOut(a.url, "nexus-" + a.key));
          return (
            <div key={a.key} className="at-app-tile" style={{ "--c": a.color }} role="button" tabIndex={0} onClick={openTile} onKeyDown={(e) => e.key === "Enter" && openTile()} data-testid={`atelier-app-${a.key}`}>
              <span className="ico">{a.k}</span><b>{a.title}</b>
              <small className="mono">{a.view ? "DANS L'ATELIER" : "FENÊTRE D'APP ↗"}</small>
              {a.tip && <em>{a.tip}</em>}
              {a.custom && <button className="rm" onClick={(e) => { e.stopPropagation(); at.removeLink(a.custom.id); }} aria-label="Retirer"><IoTrashOutline size={13} /></button>}
            </div>
          );
        })}
        <button className="at-app-tile add" onClick={() => setForm({ title: "", url: "", color: "#ffb340" })} data-testid="atelier-app-add"><span className="ico"><IoAdd size={22} /></span><b>Ajouter une app</b></button>
      </div>
      {form && (
        <div className="at-panel at-inline" data-testid="atelier-app-form">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nom" />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" style={{ flex: 1 }} />
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          <button className="at-btn" onClick={add} data-testid="atelier-app-save">Ajouter</button>
          <button className="at-btn ghost" onClick={() => setForm(null)}>Annuler</button>
        </div>
      )}
    </section>
  );
}

const FILTERS = [["all", "Tout"], ["watch", "À regarder"], ["listen", "À écouter"], ["video", "Mes vidéos"]];

// Le Salon : films, animes, vidéos et musiques — à regarder en grand ou en mini-lecteur pendant que tu crées
export function SalonView({ at, launch, mini }) {
  const [filter, setFilter] = useState("all");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(null);
  const file = useRef(null);
  const list = at.links.filter((l) => l.kind !== "app" && (filter === "all" || l.kind === filter));
  const add = async (e) => {
    e.preventDefault();
    const em = toEmbed(url); if (!em) return toast.error("Colle un lien valide");
    await at.saveLink({ title: title.trim() || em.provider, url: url.trim(), kind: em.ratio === "audio" || em.audio ? "listen" : "watch" });
    setUrl(""); setTitle(""); toast.success("Ajouté au Salon");
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
  return (
    <section className="at-view" data-testid="atelier-salon">
      <header className="at-head"><p className="at-eyebrow mono">// SALON · RESPIRATION</p><h1>Le Salon</h1><p className="at-sub">Tes films, animes, vidéos et playlists. Lance-les en grand, ou en mini-lecteur flottant pendant que tu écris.</p></header>
      <form className="at-tadd" onSubmit={add} data-testid="atelier-salon-add">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Lien YouTube, Spotify, Twitch, Drive (vidéo), Vimeo…" data-testid="atelier-salon-url" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre (optionnel)" style={{ flex: "0 1 220px" }} />
        <button className="at-btn" type="submit" data-testid="atelier-salon-submit"><IoAdd size={15} /> Ajouter</button>
        <button type="button" className="at-btn ghost" onClick={() => file.current?.click()} disabled={busy !== null} data-testid="atelier-salon-upload"><IoCloudUploadOutline size={15} /> {busy !== null ? `${busy}%` : "Importer une vidéo / musique"}</button>
        <input ref={file} hidden type="file" accept="video/*,audio/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; upload(f); }} />
      </form>
      <div className="at-seg" style={{ alignSelf: "flex-start" }}>{FILTERS.map(([k, l]) => <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>)}</div>
      {list.length === 0 && <p className="at-empty big">Ajoute un premier lien ou importe une vidéo (250 Mo max ; pour les films plus lourds, un lien Google Drive se lit aussi ici).</p>}
      <div className="at-salon">
        {list.map((l) => {
          const em = toEmbed(l.url) || {};
          const thumb = (l.url.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/) || [])[1];
          return (
            <div key={l.id} className="at-show" data-testid={`atelier-show-${l.id}`}>
              <div className="th" onClick={() => (em.blocked ? popOut(l.url) : launch({ title: l.title, url: l.url }))}>
                {thumb ? <img src={`https://i.ytimg.com/vi/${thumb}/hqdefault.jpg`} alt="" loading="lazy" /> : <span className="k">{l.kind === "listen" ? "♫" : l.kind === "video" ? "映" : "▶"}</span>}
                <span className="pl">{em.blocked ? <IoOpenOutline size={20} /> : <IoPlay size={22} />}</span>
              </div>
              <div className="tx"><b>{l.title}</b><small className="mono">{(em.provider || "").toUpperCase()}</small></div>
              <div className="ac">
                {!em.blocked && <button className="at-icon" onClick={() => mini({ title: l.title, url: l.url })} title="Mini-lecteur" data-testid={`atelier-show-mini-${l.id}`}><IoContractOutline size={15} /></button>}
                <button className="at-icon danger" onClick={() => at.removeLink(l.id)} title="Retirer"><IoTrashOutline size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
