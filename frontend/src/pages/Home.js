import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoChevronForward, IoChevronBack, IoChevronUp, IoChevronDown, IoCreateOutline, IoTrashOutline, IoPlay, IoFilter, IoSearch } from "react-icons/io5";
import { toast } from "sonner";
import { listCreations, listCategories, deleteCreation } from "@/lib/api";
import { posterUrl, bgUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import PosterCard from "@/components/PosterCard";
import EditorDialog from "@/components/EditorDialog";
import ProfileDialog from "@/components/ProfileDialog";
import ProfilePrompt from "@/components/ProfilePrompt";
import AnnouncementBanner from "@/components/AnnouncementBanner";

const ALL = "__all__";
const FAV = "__fav__";

export default function Home() {
  const nav = useNavigate();
  const { isAdmin, sfx, favorites, isFavorite, toggleFavorite } = useApp();
  const { data: all = [], refetch, isLoading } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const [catIndex, setCatIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const [sort, setSort] = useState("order");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const cardRefs = useRef([]);
  const focusSrc = useRef("kbd");
  const railRef = useRef(null);
  const edgeDir = useRef(0);

  const tabs = useMemo(() => [{ key: ALL, label: "Toutes mes créations", kanji: "全" }, { key: FAV, label: "Favoris", kanji: "愛" }, ...cats], [cats]);
  const catLabelByKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c.label])), [cats]);
  const activeTab = tabs[catIndex] || tabs[0];

  const items = useMemo(() => {
    let list = activeTab.key === ALL ? [...all]
      : activeTab.key === FAV ? all.filter((x) => favorites.includes(x.id))
      : all.filter((x) => x.category === activeTab.key);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((x) => (x.title + " " + (x.tagline || "") + " " + (x.synopsis || "")).toLowerCase().includes(q));
    }
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "za") list.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === "recent") list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    else list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return list;
  }, [all, activeTab, query, sort, favorites]);

  const focused = items[focusIndex];

  useEffect(() => { focusSrc.current = "kbd"; setFocusIndex(0); }, [catIndex, query, sort]);
  useEffect(() => {
    // Ne recentre le rail QUE sur navigation clavier / D-pad — pas au survol souris (évite le "glissement" sur PC)
    if (focusSrc.current === "hover") { focusSrc.current = "kbd"; return; }
    const el = cardRefs.current[focusIndex];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [focusIndex, catIndex, items.length]);

  const navRight = useCallback(() => { focusSrc.current = "kbd"; sfx("nav"); setFocusIndex((i) => Math.min(i + 1, items.length - 1)); }, [items.length, sfx]);
  const navLeft = useCallback(() => { focusSrc.current = "kbd"; sfx("nav"); setFocusIndex((i) => Math.max(i - 1, 0)); }, [sfx]);
  const catDown = useCallback(() => { focusSrc.current = "kbd"; sfx("nav"); setCatIndex((c) => Math.min(c + 1, tabs.length - 1)); }, [tabs.length, sfx]);
  const catUp = useCallback(() => { focusSrc.current = "kbd"; sfx("nav"); setCatIndex((c) => Math.max(c - 1, 0)); }, [sfx]);

  const onKey = useCallback((e) => {
    if (editorOpen) return;
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) { e.preventDefault(); }
    if (e.key === "ArrowRight") navRight();
    else if (e.key === "ArrowLeft") navLeft();
    else if (e.key === "ArrowDown") catDown();
    else if (e.key === "ArrowUp") catUp();
    else if (e.key === "Enter" && focused) { sfx("select"); nav(`/oeuvre/${focused.id}`); }
  }, [focused, editorOpen, nav, sfx, navRight, navLeft, catDown, catUp]);

  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);

  // Ouvre la fenêtre profil après création de compte (parcours compte -> profil)
  useEffect(() => {
    const open = () => setProfileOpen(true);
    window.addEventListener("sx-open-profile", open);
    return () => window.removeEventListener("sx-open-profile", open);
  }, []);

  // Glissement fluide aux extrémités (PC) : la vitesse augmente à mesure qu'on approche du bord.
  const onEdgeMove = useCallback((e) => {
    if (editorOpen || profileOpen) { edgeDir.current = 0; return; }
    const EDGE = 110, w = window.innerWidth;
    if (e.clientX <= EDGE) edgeDir.current = -(1 - e.clientX / EDGE);
    else if (e.clientX >= w - EDGE) edgeDir.current = (e.clientX - (w - EDGE)) / EDGE;
    else edgeDir.current = 0;
  }, [editorOpen, profileOpen]);
  useEffect(() => {
    let raf;
    const step = () => {
      const rail = railRef.current;
      if (rail && Math.abs(edgeDir.current) > 0.02) rail.scrollLeft += edgeDir.current * 16;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const bgImg = focused ? (focused.has_bg ? bgUrl(focused.id, focused.updated_at) : (focused.has_poster ? posterUrl(focused.id, focused.updated_at) : null)) : null;
  const openCreate = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = () => { if (focused) { setEditing(focused); setEditorOpen(true); } };
  const doDelete = async () => {
    if (!focused || !window.confirm(`Supprimer « ${focused.title} » ?`)) return;
    await deleteCreation(focused.id); toast.success("Supprimé"); refetch();
  };
  const open = (id) => { sfx("select"); nav(`/oeuvre/${id}`); };
  const resume = (id) => { sfx("select"); nav(`/oeuvre/${id}`, { state: { resume: true } }); };
  const dpadStyle = { width: "2.4em", height: "2.4em", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media)", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" };
  const dpadOkStyle = { width: "2.7em", height: "2.7em", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--brand)", borderRadius: "999px", color: "var(--bg-primary)", background: "var(--brand)", fontWeight: 700, fontSize: "0.72em", letterSpacing: "0.05em", boxShadow: "0 0 16px color-mix(in srgb, var(--brand) 55%, transparent)" };

  const buzz = () => { try { if (navigator.vibrate) navigator.vibrate(15); } catch (_) {} };
  const openFocused = () => { if (focused) { buzz(); sfx("select"); nav(`/oeuvre/${focused.id}`); } };

  const touchRef = useRef(null);
  const onTouchStart = (e) => { const t = e.touches[0]; touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }; };
  const onTouchEnd = (e) => {
    const s = touchRef.current; if (!s || editorOpen) return;
    const t = e.changedTouches[0]; const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.4 && Date.now() - s.t < 700) {
      buzz(); if (dy < 0) catDown(); else catUp();
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: "var(--bg-primary)" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseMove={onEdgeMove} onMouseLeave={() => { edgeDir.current = 0; }}>
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {bgImg ? (
          <div key={focused.id} className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ backgroundImage: `url(${bgImg})`, filter: `blur(${focused.bg_blur ?? 28}px)`, animation: "bgFade 1s ease" }} />
        ) : (
          <div className="absolute inset-0" style={{ background: focused?.kanji ? "radial-gradient(circle at 50% 30%, var(--bg-secondary), var(--bg-primary) 70%)" : "var(--bg-primary)" }} />
        )}
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${focused?.bg_dim ?? 0.5})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.25))" }} />
      </div>

      {focused && (
        <div className="absolute right-4 top-1/4 z-0 pointer-events-none select-none font-display leading-none"
          style={{ fontSize: "34vh", color: "var(--brand)", opacity: 0.06 }}>{focused.kanji}</div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <TopBar onAdd={openCreate} onProfile={() => setProfileOpen(true)} />

        <nav className="flex items-center gap-2 md:gap-3 px-5 md:px-12 mt-6 md:mt-8 overflow-x-auto hide-scrollbar" data-testid="category-nav">
          {tabs.map((c, i) => {
            const active = i === catIndex;
            return (
              <button key={c.key} data-testid={`cat-${c.key}`} onClick={() => { sfx("nav"); setCatIndex(i); }} aria-current={active}
                className="flex items-center gap-2 px-3 md:px-4 py-2 whitespace-nowrap transition-all duration-300"
                style={{ borderBottom: active ? "2px solid var(--brand)" : "2px solid transparent", color: active ? "var(--on-media)" : "var(--on-media-2)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                <span className="font-display text-sm opacity-70">{c.kanji}</span>
                <span className="text-sm md:text-base font-medium">{c.label}</span>
              </button>
            );
          })}
        </nav>

        <AnnouncementBanner />

        {/* filter + search bar */}
        <div className="flex items-center gap-2 px-5 md:px-12 mt-4">
          <div className="flex items-center gap-1 px-2 border" style={{ borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", background: "rgba(0,0,0,0.25)" }}>
            <IoSearch size={14} style={{ color: "var(--on-media-2)" }} />
            <input data-testid="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une création…"
              className="bg-transparent outline-none text-xs py-1.5 w-40 md:w-64" style={{ color: "var(--on-media)" }} />
          </div>
          <button data-testid="filter-toggle" onClick={() => { sfx("nav"); setShowFilters((v) => !v); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border text-xs" style={{ borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media-2)", background: "rgba(0,0,0,0.25)" }}>
            <IoFilter size={14} /> Trier
          </button>
          {showFilters && (
            <select data-testid="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}
              className="px-2 py-1.5 border text-xs outline-none fade-up" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
              <option value="order">Ordre</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="recent">Récent</option>
            </select>
          )}
        </div>

        <div className="px-5 md:px-12 mt-4 md:mt-6 min-h-[100px]">
          {focused ? (
            <div key={focused.id} className="fade-up max-w-2xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-widest px-2 py-0.5" style={{ background: "var(--brand)", color: "var(--bg-primary)" }} data-testid="focused-category">
                  {catLabelByKey[focused.category] || focused.category}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl leading-none" style={{ color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.6)" }} data-testid="focused-title">{focused.title}</h1>
              <p className="mt-2 text-sm md:text-base" style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}>{focused.tagline}</p>
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>{isLoading ? "Chargement…" : "Aucune création."}</p>
          )}
        </div>

        <div ref={railRef} className="flex-1 min-h-0 flex items-center overflow-x-auto hide-scrollbar snap-x snap-mandatory md:snap-none px-5 md:px-12 gap-4 md:gap-6" data-testid="poster-rail">
          {items.map((it, i) => (
            <PosterCard key={it.id} ref={(el) => (cardRefs.current[i] = el)} item={it} focused={i === focusIndex}
              catLabel={catLabelByKey[it.category] || it.category}
              isFav={isFavorite(it.id)} onToggleFav={() => { toggleFavorite(it.id); sfx("select"); }}
              onFocus={() => { if (i !== focusIndex) { sfx("hover"); focusSrc.current = "hover"; setFocusIndex(i); } }}
              onClick={() => open(it.id)} onResume={() => resume(it.id)}
              onTrailer={() => { sfx("select"); nav(`/oeuvre/${it.id}`, { state: { trailer: true } }); }} />
          ))}
          {items.length > 0 && <div className="flex-shrink-0 w-[42vw] md:w-[38vw]" aria-hidden="true" />}
        </div>

        <div className="flex items-center justify-between px-5 md:px-12 pb-6 md:pb-6 pt-2 md:-mt-4">
          <div className="flex flex-col items-start gap-2.5">
            {focused && (
              <div className="hidden md:flex items-center gap-2" data-testid="home-nav-arrows">
                <button data-testid="nav-left" onClick={() => { buzz(); navLeft(); }} aria-label="Création précédente" className="w-11 h-11 flex items-center justify-center border transition-transform hover:scale-110 active:scale-95" style={{ borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media)", background: "rgba(0,0,0,0.3)" }}><IoChevronBack size={20} /></button>
                <button data-testid="nav-right" onClick={() => { buzz(); navRight(); }} aria-label="Création suivante" className="w-11 h-11 flex items-center justify-center border transition-transform hover:scale-110 active:scale-95" style={{ borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media)", background: "rgba(0,0,0,0.3)" }}><IoChevronForward size={20} /></button>
              </div>
            )}
            <div className="flex items-center gap-3">
              {focused && (
                <button data-testid="launch-cta" onClick={() => open(focused.id)}
                  className="flex items-center gap-2 px-6 py-3 font-semibold transition-transform hover:scale-105"
                  style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}>
                  <IoPlay size={18} /> {focused.launch_label || "Lancer"} <IoChevronForward size={16} />
                </button>
              )}
              {isAdmin && focused && (
                <>
                  <button data-testid="home-edit" onClick={openEdit} className="p-3 border" style={{ borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media)", background: "rgba(0,0,0,0.25)" }}><IoCreateOutline size={18} /></button>
                  <button data-testid="home-delete" onClick={doDelete} className="p-3 border" style={{ borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--brand)", background: "rgba(0,0,0,0.25)" }}><IoTrashOutline size={18} /></button>
                </>
              )}
            </div>
          </div>
          <p className="hidden md:block text-xs" style={{ color: "var(--on-media-2)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>← → naviguer · ↑ ↓ catégories · Entrée : ouvrir</p>

          {/* Mobile D-pad: navigate the launcher by tapping (in addition to swipe) */}
          <div className="md:hidden flex flex-col items-center gap-1.5" data-testid="mobile-dpad">
            <button data-testid="dpad-up" onClick={() => { buzz(); catUp(); }} aria-label="Catégorie précédente" className="dpad-btn" style={dpadStyle}><IoChevronUp size="1.3em" /></button>
            <div className="flex items-center gap-3">
              <button data-testid="dpad-left" onClick={() => { buzz(); navLeft(); }} aria-label="Création précédente" className="dpad-btn" style={dpadStyle}><IoChevronBack size="1.3em" /></button>
              <button data-testid="dpad-ok" onClick={openFocused} aria-label="Ouvrir la création" className="dpad-btn" style={dpadOkStyle}>OK</button>
              <button data-testid="dpad-right" onClick={() => { buzz(); navRight(); }} aria-label="Création suivante" className="dpad-btn" style={dpadStyle}><IoChevronForward size="1.3em" /></button>
            </div>
            <button data-testid="dpad-down" onClick={() => { buzz(); catDown(); }} aria-label="Catégorie suivante" className="dpad-btn" style={dpadStyle}><IoChevronDown size="1.3em" /></button>
          </div>
        </div>
      </div>

      <EditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} initial={editing} categories={cats} onSaved={refetch} />
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
      <ProfilePrompt onCreate={() => setProfileOpen(true)} />
    </div>
  );
}
