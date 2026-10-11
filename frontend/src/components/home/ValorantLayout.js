import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { IoPlay, IoFilmOutline, IoHeart, IoHeartOutline, IoStar, IoStarOutline, IoCreateOutline } from "react-icons/io5";
import { bgUrl, posterUrl } from "@/lib/api";
import { useGamepad } from "@/lib/useGamepad";

export default function ValorantLayout(ctx) {
  const {
    tabs, groups, featuredId, isAdmin, catLabelByKey, isFavorite, toggleFavorite, sfx,
    open, trailer, onEdit, setFeatured, dialogsOpen,
  } = ctx;

  const [catIndex, setCatIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const [zone, setZone] = useState("strip"); // cats | actions | strip
  const [act, setAct] = useState(0);
  const stripRefs = useRef({});

  const activeTab = tabs[catIndex] || tabs[0];
  const items = useMemo(() => groups[activeTab?.key] || [], [activeTab, groups]);
  const item = items[focusIndex];
  const hasTrailer = !!((item?.trailer_url && item.trailer_url.trim()) || item?.has_trailer);
  const actions = 1 + (hasTrailer ? 1 : 0);

  useEffect(() => { setFocusIndex(0); }, [catIndex]);
  useEffect(() => { const el = stripRefs.current[focusIndex]; if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }, [focusIndex, catIndex]);

  const catPrev = useCallback(() => { sfx("nav"); setCatIndex((c) => Math.max(0, c - 1)); }, [sfx]);
  const catNext = useCallback(() => { sfx("nav"); setCatIndex((c) => Math.min(tabs.length - 1, c + 1)); }, [tabs.length, sfx]);
  const left = useCallback(() => { sfx("nav"); if (zone === "cats") setCatIndex((c) => Math.max(0, c - 1)); else if (zone === "actions") setAct((a) => Math.max(0, a - 1)); else setFocusIndex((i) => Math.max(0, i - 1)); }, [zone, sfx]);
  const right = useCallback(() => { sfx("nav"); if (zone === "cats") setCatIndex((c) => Math.min(tabs.length - 1, c + 1)); else if (zone === "actions") setAct((a) => Math.min(actions - 1, a + 1)); else setFocusIndex((i) => Math.min(items.length - 1, i + 1)); }, [zone, tabs.length, actions, items.length, sfx]);
  const up = useCallback(() => { sfx("nav"); setZone((z) => (z === "strip" ? "actions" : "cats")); }, [sfx]);
  const down = useCallback(() => { sfx("nav"); setZone((z) => (z === "cats" ? "actions" : "strip")); }, [sfx]);
  const confirm = useCallback(() => { if (!item) return; if (zone === "actions" && act === 1) trailer(item.id); else if (zone === "cats") setZone("strip"); else open(item.id); }, [zone, act, item, open, trailer]);

  const onKey = useCallback((e) => {
    if (dialogsOpen) return;
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowUp") up(); else if (e.key === "ArrowDown") down();
    else if (e.key === "ArrowLeft") left(); else if (e.key === "ArrowRight") right();
    else if (e.key === "Enter") confirm();
  }, [up, down, left, right, confirm, dialogsOpen]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);
  useGamepad({ up, down, left, right, confirm, catPrev, catNext }, !dialogsOpen);

  const bg = item ? (item.has_bg ? bgUrl(item.id, item.updated_at) : (item.has_poster ? posterUrl(item.id, item.updated_at) : null)) : null;
  const ring = (i) => zone === "actions" && act === i;

  return (
    <div data-testid="home-valorant" className="relative h-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Backdrop stage */}
      <div className="absolute inset-0 z-0">
        {bg ? <img key={item.id} src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ animation: "bgFade .5s ease" }} />
          : <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 40% 30%, var(--bg-secondary), var(--bg-primary) 75%)" }} />}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-primary) 8%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5))" }} />
      </div>
      {item?.kanji && <div className="absolute right-6 top-8 z-0 pointer-events-none select-none font-display leading-none" style={{ fontSize: "42vh", color: "var(--brand)", opacity: 0.08 }}>{item.kanji}</div>}

      <div className="relative z-10 h-full flex flex-col">
        {/* Category top bar */}
        <div className="flex items-center gap-2 px-5 md:px-12 pt-4 overflow-x-auto hide-scrollbar" data-testid="valorant-cats">
          {tabs.map((t, i) => {
            const active = i === catIndex;
            return (
              <button key={t.key} data-testid={`category-tab-${t.key}`} onClick={() => { sfx("nav"); setCatIndex(i); setZone("strip"); }}
                className="flex items-center gap-1.5 px-3 py-2 whitespace-nowrap transition-all duration-300"
                style={{ color: active ? "#fff" : "rgba(255,255,255,0.55)", borderBottom: active ? "2px solid var(--brand)" : "2px solid transparent", textShadow: "0 1px 8px rgba(0,0,0,0.6)", outline: zone === "cats" && active ? "2px solid var(--brand)" : "none", outlineOffset: 2, borderRadius: 4 }}>
                <span className="font-display text-sm opacity-70">{t.kanji}</span>
                <span className="text-sm md:text-base font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stage text */}
        <div className="flex-1 min-h-0 flex items-end px-5 md:px-12 pb-2">
          {item ? (
            <div key={item.id} className="max-w-3xl fade-up">
              <span className="inline-block text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.25em] px-2.5 py-1 mb-3" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>{catLabelByKey[item.category] || item.category}</span>
              <h1 className="font-display leading-none text-4xl sm:text-6xl md:text-7xl break-words" style={{ color: "#fff", textShadow: "0 2px 24px rgba(0,0,0,0.7)" }} data-testid="valorant-title">{item.title}</h1>
              {(item.tagline || item.synopsis) && <p className="mt-3 text-sm md:text-lg line-clamp-2 md:line-clamp-3" style={{ color: "rgba(255,255,255,0.85)", maxWidth: "54ch", textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>{item.tagline || item.synopsis}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button data-testid="hero-launch-button" onClick={() => open(item.id)} className="flex items-center gap-2 px-7 py-3.5 font-semibold transition-transform hover:scale-105"
                  style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", boxShadow: ring(0) ? "0 0 0 3px var(--bg-primary),0 0 0 5px var(--brand)" : "var(--shadow-1)", transform: ring(0) ? "scale(1.05)" : "none" }}>
                  <IoPlay size={18} /> {item.launch_label || "Lancer"}
                </button>
                {hasTrailer && (
                  <button data-testid="hero-trailer-button" onClick={() => trailer(item.id)} className="flex items-center gap-2 px-5 py-3.5 font-semibold"
                    style={{ background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)", backdropFilter: "blur(6px)", boxShadow: ring(1) ? "0 0 0 3px var(--bg-primary),0 0 0 5px var(--brand)" : "none" }}>
                    <IoFilmOutline size={18} /> Bande-annonce
                  </button>
                )}
                <button data-testid="hero-fav-button" onClick={() => toggleFavorite(item.id)} className="w-12 h-12 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", color: isFavorite(item.id) ? "var(--brand)" : "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)" }}>{isFavorite(item.id) ? <IoHeart size={20} /> : <IoHeartOutline size={20} />}</button>
                {isAdmin && (
                  <>
                    <button data-testid="hero-set-featured" onClick={() => setFeatured(item.id)} title="Mettre en avant" className="w-11 h-11 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", color: item.id === featuredId ? "var(--brand)" : "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }}>{item.id === featuredId ? <IoStar size={18} /> : <IoStarOutline size={18} />}</button>
                    <button data-testid="hero-edit" onClick={() => onEdit(item)} className="w-11 h-11 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }}><IoCreateOutline size={18} /></button>
                  </>
                )}
              </div>
            </div>
          ) : <p style={{ color: "var(--text-secondary)" }}>Aucune création dans cette catégorie.</p>}
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5 md:px-12 py-4" data-testid="valorant-strip"
          style={{ background: "rgba(0,0,0,0.5)", borderTop: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
          {items.map((it, i) => {
            const active = i === focusIndex;
            const src = it.poster && it.poster.length > 4 ? it.poster : posterUrl(it.id, it.updated_at);
            const hasImg = it.has_poster || (it.poster && it.poster.length > 4);
            return (
              <button key={it.id} ref={(el) => (stripRefs.current[i] = el)} data-testid={`creation-card-${it.id}`}
                onClick={() => { if (active) open(it.id); else { setZone("strip"); setFocusIndex(i); sfx("hover"); } }}
                onMouseEnter={() => { setZone("strip"); setFocusIndex(i); }}
                className="relative flex-shrink-0 overflow-hidden transition-all duration-300"
                style={{ width: active ? "7.2rem" : "5.6rem", aspectRatio: "2/3", borderRadius: "var(--radius-base)", transform: active ? "scale(1.06)" : "scale(1)", boxShadow: active ? "0 0 22px color-mix(in srgb, var(--brand) 55%, transparent)" : "none", outline: active ? "2px solid var(--brand)" : "1px solid rgba(255,255,255,0.12)", outlineOffset: 0 }}>
                {hasImg ? <img src={src} alt={it.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(160deg,var(--bg-secondary),var(--bg-primary))" }}><span className="font-display text-3xl" style={{ color: "var(--brand)" }}>{it.kanji || it.title[0]}</span></div>}
                {active && <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 2px var(--brand)" }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
