import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoPlay, IoSearch, IoCreateOutline, IoTrashOutline, IoStar, IoStarOutline, IoArrowForward, IoColorPaletteOutline } from "react-icons/io5";
import { toast } from "sonner";
import { listCreations, listCategories, deleteCreation, getMembershipPlan, getSettings, updateSettings, posterUrl, bgUrl, listAnnouncements } from "@/lib/api";
import { THEMES } from "@/lib/themes";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useEntitlements } from "@/lib/useEntitlements";
import TopBar from "@/components/TopBar";
import CosmicBackground from "@/components/CosmicBackground";
import EditorDialog from "@/components/EditorDialog";
import ProfileDialog from "@/components/ProfileDialog";
import HomeCountdown from "@/components/HomeCountdown";
import HomeCustomizer from "@/components/home/HomeCustomizer";

/* ---------- Compte à rebours vers la prochaine sortie (dim. 20h) ---------- */
function nextSunday() {
  const d = new Date();
  let add = (7 - d.getDay()) % 7;
  if (add === 0 && d.getHours() >= 20) add = 7;
  d.setDate(d.getDate() + add); d.setHours(20, 0, 0, 0);
  return d;
}
function Countdown({ compact }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  let diff = Math.max(0, nextSunday() - new Date());
  const D = Math.floor(diff / 864e5); diff -= D * 864e5;
  const H = Math.floor(diff / 36e5); diff -= H * 36e5;
  const M = Math.floor(diff / 6e4); diff -= M * 6e4;
  const S = Math.floor(diff / 1e3);
  const p2 = (n) => String(n).padStart(2, "0");
  if (compact) return <span className="cd-num">{D}<small>J</small> {p2(H)}:{p2(M)}:{p2(S)}</span>;
  return <span className="cd-num">{D}<small>J</small> {p2(H)}<small>:</small>{p2(M)}<small>:</small>{p2(S)}</span>;
}

const MOIS = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d)) return String(v).slice(0, 8);
  return `${String(d.getDate()).padStart(2, "0")} ${MOIS[d.getMonth()]}`;
}

const JOURNAL_SECTIONS = [
  { tag: "NOUVEAUTÉS", title: "Les dernières sorties", sub: "ACTUALITÉS · STATION", route: "/nouveautes", c1: "#2b3a60", c2: "#0a1020" },
  { tag: "PLANNING", title: "Prochaines sorties", sub: "AGENDA · DIMANCHE 20H", route: "/planning", c1: "#4a2367", c2: "#140a22" },
  { tag: "COULISSES", title: "Dans l'atelier", sub: "MAKING-OF · CARNET", route: "/nouveautes", c1: "#5a1e12", c2: "#1a0805" },
  { tag: "LA STATION", title: "À propos", sub: "MANIFESTE · BRICHEL", route: "/a-propos", c1: "#1f3a4a", c2: "#0a141a" },
];

/* ---------- Poster (carte affiche, style maquette) ---------- */
function Poster({ it, idx, catLabel, soon, isAdmin, featured, onOpen, onEdit, onDelete, onFeature }) {
  const img = it.has_poster ? posterUrl(it.id, it.updated_at) : null;
  const key = String(it.id || it.title || "x");
  const init = (it.title || "?").replace(/[^A-Za-zÀ-ÿ0-9]/g, "").slice(0, 1).toUpperCase() || "✦";
  const hue = [...key].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const style = img
    ? { backgroundImage: `url(${img})` }
    : { "--c1": `hsl(${hue} 52% 30%)`, "--c2": `hsl(${(hue + 36) % 360} 58% 11%)` };
  return (
    <article className="poster" onClick={onOpen}>
      <div className={"art" + (img ? " pimg" : "")} style={style}>
        <span className="pm">{String(idx).padStart(3, "0")}</span>
        <span className="pt a" />
        <span className="wmk">{init}</span>
        <div className="ptt">{it.title}</div>
        <span className={"pst" + (soon ? " soon" : "")}>{soon ? "À VENIR" : "DISPO"}</span>
        {isAdmin && (
          <div className="padm" onClick={(e) => e.stopPropagation()}>
            <button className={featured ? "on" : ""} title="Mettre à la une" onClick={onFeature}>{featured ? <IoStar size={13} /> : <IoStarOutline size={13} />}</button>
            <button title="Modifier" onClick={onEdit}><IoCreateOutline size={13} /></button>
            <button title="Supprimer" onClick={onDelete}><IoTrashOutline size={13} /></button>
          </div>
        )}
      </div>
      <div className="pcap">
        {catLabel && <div className="pcat">{catLabel}</div>}
        <div className="ct">{it.title}</div>
        {it.tagline && <div className="cs">{it.tagline}</div>}
      </div>
    </article>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { isAdmin, sfx, theme, setTheme, playAmbient } = useApp();
  const { user, openAuth } = useAuth();
  const { membershipActive } = useEntitlements();

  const { data: all = [], refetch, isLoading } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: memberPlan } = useQuery({ queryKey: ["membership-plan"], queryFn: getMembershipPlan });
  const { data: settings, refetch: refetchSettings } = useQuery({ queryKey: ["site-settings"], queryFn: getSettings });
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: listAnnouncements });

  const [view, setView] = useState("rails");      // rails | map | arcade
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [mapCat, setMapCat] = useState("__all__");
  const [arcCat, setArcCat] = useState("__all__");
  const [arcSel, setArcSel] = useState(0);
  const [openJ, setOpenJ] = useState(null);
  const [themeOpen, setThemeOpen] = useState(false);

  const requireProfile = () => { if (!user) { toast.info("Crée un compte pour sauvegarder ton profil partout."); openAuth(); } else setProfileOpen(true); };
  useEffect(() => { document.body.classList.toggle("sx-picking", themeOpen); return () => document.body.classList.remove("sx-picking"); }, [themeOpen]);
  const themeMeta = useMemo(() => THEMES.find((t) => t.key === theme) || THEMES[0], [theme]);
  const catLabelByKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c.label])), [cats]);
  const catKanjiByKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c.kanji])), [cats]);
  // LA UNE = uniquement les créations étoilées (multi). Compat : ancien champ unique.
  const featuredIds = useMemo(() => {
    const arr = Array.isArray(settings?.featured_ids) ? settings.featured_ids.filter(Boolean) : [];
    if (arr.length) return arr;
    return settings?.featured_creation_id ? [settings.featured_creation_id] : [];
  }, [settings]);
  const isFeatured = (id) => featuredIds.includes(id);
  const featuredId = featuredIds[0] || "";
  const isSoon = (it) => it.category === "avenir";

  // recherche globale
  const filtered = useMemo(() => {
    let list = [...all].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((x) => (x.title + " " + (x.tagline || "") + " " + (x.synopsis || "")).toLowerCase().includes(q));
    }
    return list;
  }, [all, query]);

  // rails groupés par catégorie, dans l'ordre de l'artefact
  const rails = useMemo(() => {
    const RAIL_ORDER = ["films", "livres", "series", "avenir", "dojo"];
    const ord = (k) => { const i = RAIL_ORDER.indexOf(k); return i < 0 ? 99 : i; };
    return [...cats]
      .sort((a, b) => ord(a.key) - ord(b.key))
      .map((c) => ({ ...c, items: filtered.filter((x) => x.category === c.key) }))
      .filter((r) => r.items.length);
  }, [cats, filtered]);

  // LA UNE : SEULEMENT les créations étoilées, dans l'ordre d'ajout de l'étoile.
  const heroes = useMemo(() => {
    if (!featuredIds.length) return [];
    const byId = Object.fromEntries(all.map((x) => [x.id, x]));
    return featuredIds.map((id) => byId[id]).filter(Boolean).slice(0, 8);
  }, [all, featuredIds]);

  useEffect(() => { if (heroIdx >= heroes.length) setHeroIdx(0); }, [heroes.length, heroIdx]);
  useEffect(() => {
    if (heroes.length < 2) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroes.length), 6000);
    return () => clearInterval(t);
  }, [heroes.length]);
  const hero = heroes[heroIdx];

  // ARCADE : œuvres avec affiche, filtrées
  const arcItems = useMemo(() => {
    let list = filtered.filter((x) => x.has_poster);
    if (arcCat !== "__all__") list = list.filter((x) => x.category === arcCat);
    return list;
  }, [filtered, arcCat]);
  useEffect(() => { setArcSel(0); }, [arcCat]);
  const arcCur = arcItems[arcSel];
  // Garde la tuile sélectionnée visible (clavier, clic, flèches) — sinon on finit "bloqué" hors écran.
  const arcRailRef = useRef(null);
  useEffect(() => {
    const rail = arcRailRef.current; if (!rail || view !== "arcade") return;
    if (arcSel <= 0) { rail.scrollTo({ left: 0, behavior: "smooth" }); return; }
    if (arcSel >= arcItems.length - 1) { rail.scrollTo({ left: rail.scrollWidth, behavior: "smooth" }); return; }
    const tile = rail.children[arcSel];
    if (tile && tile.scrollIntoView) tile.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [arcSel, view, arcItems.length]);

  // clavier (navigation arcade)
  const onKey = useCallback((e) => {
    if (editorOpen || view !== "arcade") return;
    if (e.key === "ArrowRight") { e.preventDefault(); sfx("nav"); setArcSel((i) => Math.min(i + 1, arcItems.length - 1)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); sfx("nav"); setArcSel((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && arcCur) { sfx("select"); nav(`/oeuvre/${arcCur.id}`); }
  }, [editorOpen, view, arcItems.length, arcCur, sfx, nav]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);

  useEffect(() => {
    const open = () => setProfileOpen(true);
    window.addEventListener("sx-open-profile", open);
    return () => window.removeEventListener("sx-open-profile", open);
  }, []);

  // actions
  const pushRecent = (id) => { try { const r = JSON.parse(localStorage.getItem("sx_recent") || "[]"); const nx = [id, ...r.filter((x) => x !== id)].slice(0, 8); localStorage.setItem("sx_recent", JSON.stringify(nx)); } catch (_) {} };
  const open = (id) => { sfx("select"); pushRecent(id); nav(`/oeuvre/${id}`); };
  const openCreate = () => { setEditing(null); setEditorOpen(true); };
  const openEditItem = (it) => { setEditing(it); setEditorOpen(true); };
  const doDeleteItem = async (it) => {
    if (!it || !window.confirm(`Supprimer « ${it.title} » ?`)) return;
    await deleteCreation(it.id); toast.success("Supprimé"); refetch();
  };
  const setFeaturedItem = async (it) => {
    if (!settings || !it) return;
    const cur = Array.isArray(settings.featured_ids) ? settings.featured_ids.filter(Boolean)
      : (settings.featured_creation_id ? [settings.featured_creation_id] : []);
    const on = cur.includes(it.id);
    const nextArr = on ? cur.filter((x) => x !== it.id) : [...cur, it.id];
    // On écrit la liste ET l'ancien champ (1er élément) pour rester compatible backend.
    await updateSettings({ ...settings, featured_ids: nextArr, featured_creation_id: nextArr[0] || "" });
    toast.success(on ? "Retirée de la une" : "⭐ Mise à la une ✓");
    refetchSettings();
  };
  const ambiance = (it) => { try { sfx("select"); if (playAmbient && it) playAmbient(it.id); } catch (_) {} };

  // ---- Carte : positions des catégories autour d'un centre ----
  const mapNodes = useMemo(() => {
    const n = cats.length;
    const nodes = cats.map((c, i) => {
      const ang = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
      return { key: c.key, label: c.label, kanji: c.kanji, x: 50 + Math.cos(ang) * 32, y: 50 + Math.sin(ang) * 32 };
    });
    nodes.push({ key: "__all__", label: "Tout", kanji: "全", x: 50, y: 50 });
    return nodes;
  }, [cats]);
  const mapItems = useMemo(() => (mapCat === "__all__" ? filtered : filtered.filter((x) => x.category === mapCat)), [filtered, mapCat]);

  // ---- prochaine sortie / reprendre / journal ----
  const upcoming = useMemo(() => [...all].filter((x) => x.category === "avenir").sort((a, b) => (a.order || 0) - (b.order || 0)), [all]);
  const nextDrop = useMemo(() => {
    if (upcoming.length) return upcoming[0];
    if (featuredId) return all.find((x) => x.id === featuredId) || null;
    return null;
  }, [upcoming, featuredId, all]);
  const resumeItems = useMemo(() => {
    let ids = []; try { ids = JSON.parse(localStorage.getItem("sx_recent") || "[]"); } catch (_) {}
    return ids.map((id) => all.find((x) => x.id === id)).filter(Boolean).slice(0, 6);
  }, [all]);
  const journal = useMemo(() => (announcements || []).slice(0, 6).map((a, i) => ({
    id: a.id || i,
    date: a.created_at || a.date || a.updated_at || "",
    title: a.title || a.heading || a.name || "Note",
    body: a.body || a.text || a.message || a.content || a.description || "",
  })), [announcements]);

  const heroImg = hero ? (hero.has_bg ? bgUrl(hero.id, hero.updated_at) : (hero.has_poster ? posterUrl(hero.id, hero.updated_at) : null)) : null;

  let gi = 0; // compteur d'index global pour les affiches

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "var(--text-primary)", position: "relative" }}>
      <CosmicBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
      <TopBar onAdd={openCreate} onProfile={requireProfile} />
      <HomeCountdown />

      <div className="sx-exp">
        {/* CINEHEAD */}
        <div className="cinehead">
          <span className="ck">// STATION NEXUS</span>
          <h2 className="ct-title">{(themeMeta.name || "STATION").toUpperCase()}</h2>
          <span className="ctag" key={theme} data-testid="home-theme-tagline">{[...(themeMeta.tagline || "")].map((c, i) => <span key={i} className="ctag-ch" style={{ animationDelay: `${i * 35}ms` }}>{c === " " ? "\u00a0" : c}</span>)}</span>
        </div>

        {/* LA UNE */}
        {hero && (
          <section className="hero">
            <div className={"viewport" + (heroImg ? " himg" : "")} onClick={() => open(hero.id)}
              style={{ background: `radial-gradient(85% 120% at 74% 6%, var(--glow), transparent 55%), linear-gradient(160deg, var(--bg-secondary), var(--bg-primary))` }}>
              {heroes.map((h, i) => {
                const im = h.has_bg ? bgUrl(h.id, h.updated_at) : (h.has_poster ? posterUrl(h.id, h.updated_at) : null);
                return im ? (
                  <div key={h.id} className="vp-slot" style={{ opacity: i === heroIdx ? 1 : 0 }}>
                    <div className="vp-blur" style={{ backgroundImage: `url(${im})` }} />
                    <div className="vp-img" style={{ backgroundImage: `url(${im})` }} />
                  </div>
                ) : null;
              })}
              <div className="vp-shade" />
              <span className="idx mono">{String(heroIdx + 1).padStart(3, "0")} / {String(heroes.length).padStart(2, "0")}</span>
              <span className="tick t1" /><span className="tick t2" />
              {!heroImg && <div className="ring" />}
              {!heroImg && <div className="k2">{hero.kanji || themeMeta.kanji}</div>}
              <div className="scan" />
              <div className="hdots">
                {heroes.map((_, i) => (
                  <i key={i} className={i === heroIdx ? "on" : ""} onClick={(e) => { e.stopPropagation(); sfx("nav"); setHeroIdx(i); }} />
                ))}
              </div>
            </div>
            <div className="hmeta herofade" key={hero.id}>
              <div className="cat mono"><b>{catLabelByKey[hero.category] || hero.category || "STATION"}</b>{isFeatured(hero.id) ? " · À LA UNE" : ""}</div>
              <h1>{hero.title}</h1>
              <p>{hero.tagline || hero.synopsis || ""}</p>
              <div className="herobtns">
                <span className="btn p" onClick={() => open(hero.id)}>Entrer dans l'univers <span className="ar">→</span></span>
                <span className="btn s" onClick={() => ambiance(hero)}><span className="ar">▷</span> Ambiance</span>
              </div>
              {memberPlan?.enabled && !membershipActive && (
                <div className="herobtns">
                  <span className="btn s" onClick={() => { sfx("select"); nav("/soutien"); }} style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                    Soutiens la station <IoArrowForward size={15} />
                  </span>
                </div>
              )}
              {isAdmin && (
                <div className="hero-admin">
                  <button onClick={(e) => { e.stopPropagation(); setFeaturedItem(hero); }}>{isFeatured(hero.id) ? <IoStar size={14} /> : <IoStarOutline size={14} />} {isFeatured(hero.id) ? "Retirer de la une" : "Mettre à la une"}</button>
                  <button onClick={(e) => { e.stopPropagation(); openEditItem(hero); }}><IoCreateOutline size={14} /> Modifier</button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PROCHAINE SORTIE */}
        {nextDrop && (
          <section className="sx-drop">
            <div className="drop" onClick={() => open(nextDrop.id)}>
              <div className={"dpos" + (nextDrop.has_poster ? " bimg" : "")} style={nextDrop.has_poster ? { backgroundImage: `url(${posterUrl(nextDrop.id, nextDrop.updated_at)})` } : undefined}>
                {!nextDrop.has_poster && <span className="dk">{nextDrop.kanji || themeMeta.kanji}</span>}
                <span className="pst">{isSoon(nextDrop) ? "À VENIR" : "À LA UNE"}</span>
              </div>
              <div className="dinfo">
                <div className="dl mono">// PROCHAINE SORTIE · DIM. 20H</div>
                <div className="dt">{nextDrop.title}</div>
                <div className="ds">{nextDrop.tagline || nextDrop.synopsis || ""}</div>
                <div className="cd"><Countdown /></div>
                <span className="notify" onClick={(e) => { e.stopPropagation(); sfx("select"); nav("/planning"); }}>⊕ Préviens-moi</span>
              </div>
            </div>
          </section>
        )}

        {/* REPRENDRE */}
        {resumeItems.length > 0 && (
          <section className="sx-resume">
            <div className="seclabel"><div className="lt"><h2>Reprendre</h2><span className="kj">続</span></div></div>
            <div className="resume">
              {resumeItems.map((it) => (
                <article key={it.id} className="rcard" onClick={() => open(it.id)}>
                  <div className={"rv2" + (it.has_poster ? " bimg" : "")} style={it.has_poster ? { backgroundImage: `url(${posterUrl(it.id, it.updated_at)})` } : undefined}><span className="play">▶</span></div>
                  <div className="ri"><div className="rt">{it.title}</div><div className="rs mono">{(catLabelByKey[it.category] || "").toUpperCase()}</div></div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* EXPLORER */}
        <div className="seclabel sx-explore-head">
          <div className="lt"><h2>Explorer</h2><span className="kj">探</span></div>
          <span className="all mono">RAILS · CARTE · ARCADE</span>
        </div>

        {/* RECHERCHE */}
        <div className="sx-search">
          <div className="field">
            <IoSearch size={14} style={{ color: "var(--text-secondary)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une création…" />
          </div>
          <button className="sbtn" data-testid="home-theme-toggle" onClick={() => { sfx("nav"); setThemeOpen((v) => !v); }}>
            <IoColorPaletteOutline size={14} style={{ marginRight: 5 }} /> Thèmes
          </button>
          {themeOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 89 }} onClick={() => setThemeOpen(false)} />
              <div className="sx-themepick">
                {THEMES.map((t) => (
                  <button type="button" key={t.key} data-testid={`home-theme-pick-${t.key}`} className={"tp" + (t.key === theme ? " on" : "")} onClick={() => { sfx("select"); setTheme(t.key); setThemeOpen(false); }}>
                    <span className="sw" style={{ background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]} 55%, ${t.swatch[2]})` }} />
                    <span className="nm">{t.name}</span>
                    <span className="kj">{t.kanji}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* VIEW TOGGLE */}
        <div className="vtog">
          {[["rails", "⊞ Rails"], ["map", "✦ Carte"], ["arcade", "▶ Arcade"]].map(([v, label]) => (
            <button key={v} aria-pressed={view === v} onClick={() => { sfx("nav"); setView(v); }}>{label}</button>
          ))}
        </div>

        {isLoading && <div className="empty">Chargement…</div>}
        {!isLoading && filtered.length === 0 && <div className="empty">Aucune création{query ? " pour cette recherche." : "."}</div>}

        {/* ---------- RAILS ---------- */}
        {view === "rails" && (
          <div>
            {rails.map((r) => (
              <section className="rail" key={r.key}>
                <div className="seclabel">
                  <div className="lt"><h2>{r.label}</h2><span className="kj">{r.kanji}</span></div>
                  <span className="all mono">{r.items.length} ŒUVRE{r.items.length > 1 ? "S" : ""}</span>
                </div>
                <div className="scroller">
                  {r.items.map((it) => (
                    <Poster key={it.id} it={it} idx={++gi} catLabel={r.label} soon={isSoon(it)} isAdmin={isAdmin}
                      featured={isFeatured(it.id)} onOpen={() => open(it.id)}
                      onEdit={() => openEditItem(it)} onDelete={() => doDeleteItem(it)} onFeature={() => setFeaturedItem(it)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ---------- CARTE ---------- */}
        {view === "map" && (
          <div>
            <div className="seclabel" style={{ marginTop: 14 }}>
              <div className="lt"><span className="mono" style={{ fontSize: 9.5, letterSpacing: ".14em", color: "var(--faint)" }}>// CHOISIS UN SECTEUR</span></div>
            </div>
            <div className="const">
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                {mapNodes.filter((n) => n.key !== "__all__").map((n) => (
                  <line key={n.key} x1="50%" y1="50%" x2={`${n.x}%`} y2={`${n.y}%`} stroke="var(--border-c)" strokeWidth="1" />
                ))}
              </svg>
              {mapNodes.map((n) => (
                <div key={n.key} className={"cnode" + (mapCat === n.key ? " sel" : "")}
                  onClick={() => { sfx("select"); setMapCat(n.key); }}
                  style={{ position: "absolute", left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%,-50%)", cursor: "pointer", textAlign: "center" }}>
                  <div className="cdisc">{n.kanji}</div>
                  <div className="cnm">{n.label}</div>
                </div>
              ))}
            </div>
            <div className="mapres">
              <div className="scroller">
                {mapItems.map((it) => (
                  <Poster key={it.id} it={it} idx={++gi} catLabel={catLabelByKey[it.category]} soon={isSoon(it)} isAdmin={isAdmin}
                    featured={isFeatured(it.id)} onOpen={() => open(it.id)}
                    onEdit={() => openEditItem(it)} onDelete={() => doDeleteItem(it)} onFeature={() => setFeaturedItem(it)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------- ARCADE ---------- */}
        {view === "arcade" && (
          <div className="arc">
            <div className="arc-filters">
              {[{ key: "__all__", label: "Tout" }, ...cats].map((c) => (
                <button key={c.key} className={"arc-chip" + (arcCat === c.key ? " on" : "")} onClick={() => { sfx("nav"); setArcCat(c.key); }}>{c.label}</button>
              ))}
            </div>
            <div className="arc-stage">
              {arcCur && <div className="arc-bgblur" key={"b" + arcCur.id} style={{ backgroundImage: `url(${posterUrl(arcCur.id, arcCur.updated_at)})` }} />}
              {arcCur && <div className="arc-bgimg" key={"i" + arcCur.id} style={{ backgroundImage: `url(${posterUrl(arcCur.id, arcCur.updated_at)})` }} />}
              <div className="arc-shade" />
              <div className="arc-info">
                <div className="arc-k mono">◆ {arcCur ? (catKanjiByKey[arcCur.category] || themeMeta.kanji) : themeMeta.kanji}</div>
                <h2>{arcCur ? arcCur.title : "—"}</h2>
                <div className="arc-sub">{arcCur ? `${(catLabelByKey[arcCur.category] || "").toUpperCase()} · ${arcCur.tagline || ""}` : "Aucune affiche dans ce secteur"}</div>
                {arcCur && <span className="arc-play" onClick={() => open(arcCur.id)}><IoPlay size={14} style={{ marginRight: 6 }} /> Ouvrir</span>}
              </div>
            </div>
            <div className="arc-railwrap">
              <button className="arc-nav prev" aria-label="Précédent" onClick={() => { sfx("nav"); setArcSel((i) => Math.max(0, i - 1)); }}>‹</button>
              <div className="arc-rail" ref={arcRailRef}>
                {arcItems.map((it, i) => (
                  <div key={it.id} className={"arc-tile" + (i === arcSel ? " on" : "")}
                    style={{ backgroundImage: `url(${posterUrl(it.id, it.updated_at)})` }}
                    onClick={() => { sfx("nav"); setArcSel(i); }} />
                ))}
              </div>
              <button className="arc-nav next" aria-label="Suivant" onClick={() => { sfx("nav"); setArcSel((i) => Math.min(arcItems.length - 1, i + 1)); }}>›</button>
            </div>
          </div>
        )}

        {/* ---------- JOURNAL DE BORD ---------- */}
        <section className="sx-journal">
          <div className="seclabel"><div className="lt"><h2>Journal de bord</h2><span className="kj">録</span></div><span className="all mono" onClick={() => { sfx("nav"); nav("/nouveautes"); }}>TOUT VOIR →</span></div>
          <div className="bts">
            {JOURNAL_SECTIONS.map((s) => (
              <article key={s.title} className="btc" onClick={() => { sfx("select"); nav(s.route); }}>
                <div className="bv" style={{ "--c1": s.c1, "--c2": s.c2 }}><span className="tag">{s.tag}</span></div>
                <div className="bi"><div className="bt">{s.title}</div><div className="bs">{s.sub}</div></div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- CARTE D'EMBARQUEMENT ---------- */}
        <section className="sx-pass-wrap">
          <div className="seclabel"><div className="lt"><h2>Carte d'embarquement</h2><span className="kj">搭乗</span></div></div>
          <div className="boarding" onClick={() => { sfx("select"); nav("/soutien"); }}>
            <div className="bp-main">
              <div className="bp-k mono">STATION NEXUS · EMBARQUEMENT</div>
              <div className="bp-name">{membershipActive ? "Membre à bord" : "Explorateur libre"}</div>
              <div className="bp-subline mono">{membershipActive ? "ACCÈS COMPLET À TOUS LES UNIVERS" : "ACCÈS LIBRE · SOUTIENS POUR EMBARQUER"}</div>
              <div className="bp-row">
                <div className="bp-c"><b>{all.length}</b><span>UNIVERS</span></div>
                <div className="bp-c"><b>{cats.length}</b><span>SECTEURS</span></div>
                <div className="bp-c"><b>DIM·20H</b><span>SORTIES</span></div>
              </div>
            </div>
            <div className="bp-stub">
              <div className="bp-k mono">PORTE</div>
              <div className="bp-gate">{membershipActive ? "A1" : "—"}</div>
              <span className="bp-cta">{membershipActive ? "Mon accès" : "Embarquer"} <IoArrowForward size={14} /></span>
            </div>
          </div>
        </section>

        {/* ---------- SOUTIEN À LA STATION ---------- */}
        <section className="sx-soutien">
          <div className="sk" aria-hidden="true">{themeMeta.kanji}</div>
          <div className="eyebrow mono">// SOUTIEN</div>
          <h2>Fais vivre<br />la station</h2>
          <p className="slead">Ton soutien ne finance pas une plateforme. Il finance la suite : les prochaines œuvres, les chapitres à venir, et le temps de créer librement.</p>
          <span className="s-cta" onClick={() => { sfx("select"); nav("/soutien"); }}>Soutiens la station <IoArrowForward size={16} /></span>
        </section>
      </div>

      </div>

      <EditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} initial={editing} categories={cats} onSaved={refetch} />
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
      <HomeCustomizer open={customizerOpen} onClose={() => setCustomizerOpen(false)} isAdmin={isAdmin} onSaveDefault={() => {}} saving={false} />
    </div>
  );
}

