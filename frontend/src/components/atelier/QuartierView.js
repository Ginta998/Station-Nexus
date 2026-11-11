import { archiveCodes } from "@/lib/archive";
import { useMemo, useState, useEffect } from "react";
import GCalPanel from "@/components/atelier/GCalPanel";
import { IoSend, IoArrowForward, IoPlay, IoEnterOutline } from "react-icons/io5";
import { toast } from "sonner";
import { KINDS, imgSrc, todayStr, stripHtml, isOeuvre, isFolder, oeuvreFmt } from "@/lib/atelier";
import { isTemplate } from "@/lib/templates";
import { toEmbed, popOut } from "@/lib/embed";
import ItemCard from "@/components/atelier/ItemCard";
import { TaskRow, TaskQuickAdd } from "@/components/atelier/TasksView";
import BunnyBriefing from "@/components/atelier/BunnyBriefing";

const greet = (h) => (h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir");
const ytId = (u = "") => (u.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1];

// Horloge du pont — élégante, à côté du titre (heure · AN d'exploitation)
function PontClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  const date = t.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="at-clock" data-testid="atelier-clock">
      <b>{hh}<span className="sep">:</span>{mm}</b>
      <small className="mono">{date.toUpperCase()} · AN {t.getFullYear() + 2000}</small>
    </div>
  );
}

// En-tête de section façon HUD — eyebrow mono + gros titre condensé + filet d'accent
function SectionHead({ eye, title, link, onLink, testid }) {
  return (
    <div className="at-sechead">
      <div className="tt"><p className="at-eyebrow mono">{eye}</p><h2>{title}</h2></div>
      {link && <span className="at-link" onClick={onLink} data-testid={testid}>{link} <IoArrowForward size={12} /></span>}
    </div>
  );
}

// Grande carte cinématographique d'une œuvre ou d'un élément épinglé (même langage que les univers du Pont)
function ItemBig({ it, at, onClick, testid }) {
  const oe = isOeuvre(it);
  const un = at.universes.find((x) => x.id === it.universe_id);
  const col = it.fields?.color || un?.color || "var(--brand)";
  const kanji = oe ? (it.fields?.kanji || oeuvreFmt(it).kanji) : (KINDS[it.kind]?.kanji || "作");
  const sub = oe ? oeuvreFmt(it).label.toUpperCase() : (KINDS[it.kind]?.label || "").toUpperCase();
  return (
    <button className="at-uni-big" onClick={onClick} style={{ "--u": col }} data-testid={testid}>
      <span className="cov">{it.image ? <img src={imgSrc(it.image)} alt="" loading="lazy" /> : <span className="k">{kanji}</span>}</span>
      <span className="t"><b>{it.title || "Sans titre"}</b><small>{sub}{un ? ` · ${un.name.toUpperCase()}` : ""}</small></span>
    </button>
  );
}

// Bandeau héros — univers vedette cinématographique, rotatif, à sa couleur
function PontHero({ active, last, lastU, open, go, stats, subTxt }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (active.length < 2) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % active.length), 7000);
    return () => clearInterval(t);
  }, [active.length]);
  const feat = active[i] || lastU || null;
  return (
    <header className="at-hero" style={{ "--u": feat?.color || "var(--brand)" }} data-testid="atelier-bridge">
      <div className="at-hero-bg" key={feat?.id || "none"}>
        {feat?.cover
          ? <img src={imgSrc(feat.cover)} alt="" />
          : <span className="at-hero-glow"><b>{feat?.kanji || "天"}</b></span>}
      </div>
      <span className="at-hero-grain" aria-hidden="true" />
      <div className="at-hero-content">
        <div className="at-hero-top">
          <p className="at-eyebrow mono">// PONT DE COMMANDEMENT · STATION NEXUS</p>
          <PontClock />
        </div>
        <div className="at-hero-mid">
          <h1>{greet(new Date().getHours())}, Brichel.</h1>
          <p className="at-sub">{subTxt}</p>
          <div className="at-hero-cta">
            {last && <button className="at-btn big" onClick={() => open(last.id)} data-testid="atelier-hero-resume"><IoPlay size={16} /> Reprendre</button>}
            {feat && <button className="at-btn ghost" onClick={() => go({ name: "universe", id: feat.id })} data-testid="atelier-hero-enter"><IoEnterOutline size={16} /> Entrer dans {feat.name}</button>}
          </div>
        </div>
        <div className="at-hero-foot">
          <div className="at-stats">{stats.map(([l, v]) => <div key={l}><b>{v}</b><small className="mono">{l}</small></div>)}</div>
          {active.length > 1 && (
            <div className="at-hero-dots">
              {active.map((u, j) => <button key={u.id} className={j === i ? "on" : ""} style={{ "--u": u.color || "var(--brand)" }} onClick={() => setI(j)} aria-label={u.name} />)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Le Pont : poste de commandement — tes univers, tes œuvres, tes créations et tes tâches ; le Salon en respiration
export default function QuartierView({ at, go, open, launch }) {
  const [idea, setIdea] = useState("");
  const playVid = (item, items) => {
    const em = toEmbed(item.url);
    if (em?.blocked) return popOut(item.url);
    const list = items || [item];
    const qi = Math.max(0, list.findIndex((x) => x.id === item.id));
    launch?.({ title: item.title, url: item.url, queue: list.map((x) => ({ title: x.title, url: x.url })), qi });
  };
  const today = todayStr();
  const focus = at.tasks.filter((t) => !t.done && t.due && t.due <= today).sort((a, b) => a.due.localeCompare(b.due));
  const next = at.tasks.filter((t) => !t.done && (!t.due || t.due > today)).slice(0, Math.max(0, 6 - focus.length));
  const oeuvres = useMemo(() => at.items.filter(isOeuvre), [at.items]);
  const pinnedOeuvres = useMemo(() => oeuvres.filter((o) => o.pinned), [oeuvres]);
  const pinnedUnis = useMemo(() => at.universes.filter((u) => u.pinned), [at.universes]);
  const pins = useMemo(() => at.items.filter((i) => i.pinned && !isOeuvre(i) && !isFolder(i) && !isTemplate(i)), [at.items]);
  const openItem = (it) => (isOeuvre(it) ? go({ name: "oeuvre", id: it.id }) : open(it.id));
  const [last, ...recent] = at.items.filter((i) => !isOeuvre(i) && !isFolder(i) && !isTemplate(i) && !i.pinned);
  const words = useMemo(() => stripHtml(at.items.map((i) => i.content).join(" ")).split(" ").filter(Boolean).length, [at.items]);
  const active = useMemo(() => {
    const seen = new Set(); const out = at.universes.filter((u) => u.pinned);
    out.forEach((u) => seen.add(u.id));
    at.items.forEach((i) => { const u = at.universes.find((x) => x.id === i.universe_id); if (u && !seen.has(u.id)) { seen.add(u.id); out.push(u); } });
    at.universes.forEach((u) => { if (!seen.has(u.id)) { seen.add(u.id); out.push(u); } });
    return out;
  }, [at.universes, at.items]);
  const salon = useMemo(() => at.links.filter((l) => l.kind !== "app").slice(0, 4), [at.links]);
  const lastU = last && at.universes.find((u) => u.id === last.universe_id);

  const capture = async (e) => {
    e.preventDefault();
    const text = idea.trim(); if (!text) return;
    const [first, ...rest] = text.split("\n");
    await at.createItem({ kind: "note", title: first.slice(0, 120), content: rest.length ? `<p>${rest.join("<br/>")}</p>` : "" });
    setIdea(""); toast.success("Idée capturée dans l'Inbox");
  };
  const stats = [["UNIVERS", at.universes.length], ["ÉLÉMENTS", at.items.length], ["MOTS", words.toLocaleString("fr-FR")], ["TÂCHES", at.tasks.filter((t) => !t.done).length]];
  const subTxt = focus.length ? `${focus.length} objectif${focus.length > 1 ? "s" : ""} au cap aujourd'hui.` : "Aucune urgence à bord. Le pont est à toi.";

  const arCodes = archiveCodes(at.items);
  const mobRecent = [...at.items].filter((i) => !isFolder(i)).sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || "")).slice(0, 4);
  return (
    <section className="at-view at-pont" data-testid="atelier-home">
      <PontHero active={pinnedUnis.length ? pinnedUnis : active} last={last} lastU={lastU} open={open} go={go} stats={stats} subTxt={subTxt} />

      <form className="at-capture" onSubmit={capture} data-testid="atelier-capture">
        <textarea rows={1} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Une idée traverse le pont ? Capture-la…"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) capture(e); }} data-testid="atelier-capture-input" />
        <button type="submit" className="at-btn" data-testid="atelier-capture-btn"><IoSend size={15} /> Capturer</button>
      </form>

      {/* Téléphone : liste « Archives » façon répertoire (dernières fiches touchées) */}
      {mobRecent.length > 0 && (
        <section className="ar-mob" aria-labelledby="ar-mob-h">
          <div className="ar-mob-h"><h2 id="ar-mob-h">ARCHIVES <small>記録</small></h2><button className="mono" onClick={() => go({ name: "universes" })}>TOUT VOIR ↗</button></div>
          {mobRecent.map((i) => (
            <button key={i.id} className="ar-mob-r" onClick={() => open(i.id)}>
              <span className="mono">{arCodes[i.id]}</span>
              <span className="t"><b>{i.title || "Sans titre"}</b><small className="mono">{(isOeuvre(i) ? "ŒUVRE" : KINDS[i.kind]?.label || "").toUpperCase()} · {at.universes.find((u) => u.id === i.universe_id)?.name?.toUpperCase() || "INBOX"}</small></span>
              <i aria-hidden="true">↗</i>
            </button>
          ))}
        </section>
      )}

      {last && (
        <button className="at-resume" onClick={() => open(last.id)} style={{ "--u": lastU?.color || "var(--brand)" }} data-testid="atelier-resume">
          {last.image ? <img src={imgSrc(last.image)} alt="" /> : <span className="k">{KINDS[last.kind]?.kanji}</span>}
          <span className="tx">
            <small className="mono">REPRENDRE · {KINDS[last.kind]?.label.toUpperCase()}{lastU ? ` · ${lastU.name.toUpperCase()}` : ""}</small>
            <b>{last.title || "Sans titre"}</b>
            <em>{stripHtml(last.content).slice(-160) || "Page encore blanche — c'est le moment."}</em>
          </span>
          <span className="go"><IoPlay size={18} /></span>
        </button>
      )}

      {pinnedUnis.length > 0 ? (
        <section data-testid="atelier-home-universes">
          <SectionHead eye="// TES MONDES" title="Tes univers" link="Toutes les archives" onLink={() => go({ name: "universes" })} testid="atelier-home-all-universes" />
          <div className="at-unis-big">
            {pinnedUnis.map((u) => (
              <button key={u.id} className="at-uni-big" onClick={() => go({ name: "universe", id: u.id })} style={{ "--u": u.color || "var(--brand)" }} data-testid={`atelier-home-universe-${u.id}`}>
                <span className="cov">{u.cover ? <img src={imgSrc(u.cover)} alt="" loading="lazy" /> : <span className="k">{u.kanji || u.name[0]}</span>}</span>
                <span className="t"><b>{u.name}</b><small>{at.items.filter((i) => i.universe_id === u.id).length} ÉLÉMENTS</small></span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <p className="at-empty" data-testid="atelier-home-universes-empty">Épingle tes univers (l'étoile dans « Univers ») pour les poser sur le pont.</p>
      )}

      <div className="at-panel">
        <div className="at-panel-h"><h2>Cap du jour</h2><span className="at-link" onClick={() => go({ name: "tasks" })}>Cockpit <IoArrowForward size={12} /></span></div>
        <TaskQuickAdd at={at} />
        {focus.length + next.length === 0 && <p className="at-empty">Aucune tâche. Ajoute-en une ci-dessus.</p>}
        {[...focus, ...next].map((t) => <TaskRow key={t.id} t={t} at={at} open={open} compact />)}
      </div>

      {at.config?.gcal_pont !== false && <GCalPanel compact />}
      <BunnyBriefing />

      {pinnedOeuvres.length > 0 && (
        <section data-testid="atelier-home-oeuvres">
          <SectionHead eye="// TES ŒUVRES" title="Tes œuvres" link="Toutes les archives" onLink={() => go({ name: "universes" })} />
          <div className="at-unis-big">
            {pinnedOeuvres.map((o) => <ItemBig key={o.id} it={o} at={at} onClick={() => go({ name: "oeuvre", id: o.id })} testid={`atelier-home-oeuvre-${o.id}`} />)}
          </div>
        </section>
      )}

      {pins.length > 0 && (
        <section data-testid="atelier-home-pins">
          <SectionHead eye="// ÉPINGLÉS" title="Épinglés sur le pont" />
          <div className="at-unis-big">
            {pins.map((it) => <ItemBig key={it.id} it={it} at={at} onClick={() => openItem(it)} testid={`atelier-home-pin-${it.id}`} />)}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <SectionHead eye="// TON ATELIER" title="Tes dernières créations" />
          <div className="at-grid">{recent.slice(0, 8).map((i) => <ItemCard key={i.id} it={i} at={at} open={open} />)}</div>
        </section>
      )}


      {salon.length > 0 && (
        <section className="at-salon-sec" data-testid="atelier-home-salon">
          <SectionHead eye="// RESPIRATION" title="Reprendre au Salon" link="Le Salon" onLink={() => go({ name: "salon" })} />
          <div className="at-salon-grid">
            {salon.map((l) => {
              const yt = ytId(l.url);
              return (
                <button key={l.id} className="at-vid" onClick={() => playVid(l, salon)} data-testid={`atelier-home-salon-${l.id}`}>
                  <span className="th">
                    {yt ? <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" loading="lazy" /> : <span className="k">{l.kind === "listen" ? "♫" : "映"}</span>}
                    <span className="pl"><IoPlay size={15} /></span>
                  </span>
                  <span className="tt"><b>{l.title || "Sans titre"}</b><small className="mono">{l.kind === "listen" ? "À ÉCOUTER" : l.kind === "video" ? "MA VIDÉO" : "À REGARDER"}</small></span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}
