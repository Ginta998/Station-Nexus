import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { IoPlay, IoFilmOutline, IoHeart, IoHeartOutline, IoStar, IoStarOutline, IoCreateOutline, IoTrashOutline, IoSwapVertical, IoOptionsOutline, IoChevronForward } from "react-icons/io5";
import PosterCard from "@/components/PosterCard";
import { bgUrl, posterUrl } from "@/lib/api";
import { pageByKey } from "@/lib/homeShelves";
import { useGamepad } from "@/lib/useGamepad";

const HERO_H = { s: "clamp(180px,26vh,260px)", m: "clamp(220px,34vh,340px)", l: "clamp(260px,42vh,440px)" };
const CARD_W = { s: "clamp(96px,12vw,130px)", m: "clamp(120px,15vw,170px)", l: "clamp(150px,19vw,210px)" };
const DENS = { compact: { gap: 10, pad: 14, rowGap: 18 }, normal: { gap: 16, pad: 22, rowGap: 30 }, spacious: { gap: 24, pad: 32, rowGap: 44 } };

export default function BigPicture(ctx) {
  const {
    items, featuredId, isAdmin, catLabelByKey, isFavorite, toggleFavorite, sfx,
    open, resume, trailer, onEdit, onDelete, setFeatured, goRoute,
    shelves, cfg, onSort, sortLabel, onCustomize, dialogsOpen,
  } = ctx;

  const heroH = HERO_H[cfg.heroSize] || HERO_H.l;
  const cardW = CARD_W[cfg.cardSize] || CARD_W.m;
  const d = DENS[cfg.density] || DENS.normal;

  const [focus, setFocus] = useState(0);
  const [zone, setZone] = useState("rail"); // rail | shelves
  const [shelfIdx, setShelfIdx] = useState(0);
  const railRefs = useRef({});
  const shelfRefs = useRef({});

  const focused = items[focus] || items[0];
  const activeShelves = useMemo(() => (shelves || []).map((k) => pageByKey[k]).filter(Boolean), [shelves]);

  useEffect(() => { setFocus((f) => Math.min(f, Math.max(0, items.length - 1))); }, [items.length]);
  useEffect(() => { if (zone === "rail") { const el = railRefs.current[focus]; if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } }, [focus, zone]);

  const left = useCallback(() => { sfx("nav"); if (zone === "rail") setFocus((f) => Math.max(0, f - 1)); else setShelfIdx((i) => Math.max(0, i - 1)); }, [zone, sfx]);
  const right = useCallback(() => { sfx("nav"); if (zone === "rail") setFocus((f) => Math.min(items.length - 1, f + 1)); else setShelfIdx((i) => Math.min(activeShelves.length - 1, i + 1)); }, [zone, items.length, activeShelves.length, sfx]);
  const down = useCallback(() => { if (zone === "rail" && activeShelves.length) { sfx("nav"); setZone("shelves"); setShelfIdx(0); } }, [zone, activeShelves.length, sfx]);
  const up = useCallback(() => { if (zone === "shelves") { sfx("nav"); setZone("rail"); } }, [zone, sfx]);
  const confirm = useCallback(() => {
    if (zone === "rail") { if (focused) open(focused.id); }
    else { const s = activeShelves[shelfIdx]; if (s) goRoute(s.route); }
  }, [zone, focused, activeShelves, shelfIdx, open, goRoute]);

  const onKey = useCallback((e) => {
    if (dialogsOpen) return;
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowLeft") left(); else if (e.key === "ArrowRight") right();
    else if (e.key === "ArrowDown") down(); else if (e.key === "ArrowUp") up();
    else if (e.key === "Enter") confirm();
  }, [left, right, down, up, confirm, dialogsOpen]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);
  useGamepad({ left, right, up, down, confirm }, !dialogsOpen);

  const bg = focused ? (focused.has_bg ? bgUrl(focused.id, focused.updated_at) : (focused.has_poster ? posterUrl(focused.id, focused.updated_at) : null)) : null;
  const hasTrailer = !!((focused?.trailer_url && focused.trailer_url.trim()) || focused?.has_trailer);
  const wideSrc = (it) => (it.has_bg ? bgUrl(it.id, it.updated_at) : (it.has_poster ? posterUrl(it.id, it.updated_at) : null));

  return (
    <div data-testid="home-bigpicture" className="relative h-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Full-bleed backdrop */}
      <div className="absolute inset-0 z-0">
        {bg ? <img key={focused.id} src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ animation: "bgFade .5s ease", filter: "saturate(1.05)" }} />
          : <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 40% 25%, var(--bg-secondary), var(--bg-primary) 75%)" }} />}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-primary) 6%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.55))" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.55), transparent 55%)" }} />
      </div>

      <div className="relative z-10 h-full overflow-y-auto hide-scrollbar" style={{ padding: `${d.pad}px` }}>
        {/* Toolbar: Trier + Personnaliser */}
        <div className="flex items-center justify-end gap-2 mb-3 pr-1">
          <button data-testid="home-sort" onClick={onSort} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold" style={{ background: "rgba(0,0,0,0.45)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "999px", backdropFilter: "blur(8px)" }}>
            <IoSwapVertical size={14} /> {sortLabel}
          </button>
          <button data-testid="home-customize" onClick={onCustomize} aria-label="Personnaliser l'accueil" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold" style={{ background: "rgba(0,0,0,0.45)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "999px", backdropFilter: "blur(8px)" }}>
            <IoOptionsOutline size={14} /> <span className="hidden sm:inline">Personnaliser</span>
          </button>
        </div>

        {/* Main shelf: featured wide tile + portrait rail */}
        <div className="flex items-stretch overflow-x-auto hide-scrollbar" style={{ gap: d.gap, height: heroH, scrollPaddingLeft: d.pad, scrollPaddingRight: d.pad }} data-testid="bigpicture-rail">
          {items.map((it, i) => {
            const isFeatured = i === 0;
            const active = zone === "rail" && i === focus;
            if (isFeatured) {
              const src = wideSrc(it);
              return (
                <button key={it.id} ref={(el) => (railRefs.current[i] = el)} data-testid={`creation-card-${it.id}`}
                  onMouseEnter={() => { setZone("rail"); setFocus(i); }} onClick={() => { if (active) open(it.id); else { setZone("rail"); setFocus(i); } }}
                  className="relative flex-shrink-0 h-full overflow-hidden transition-transform duration-300"
                  style={{ aspectRatio: "16/9", borderRadius: "calc(var(--radius-base)*1.6)", outline: active ? "3px solid var(--brand)" : "1px solid rgba(255,255,255,0.12)", outlineOffset: 0, boxShadow: active ? "0 0 36px color-mix(in srgb,var(--brand) 45%,transparent)" : "var(--shadow-1)", transform: active ? "scale(1.015)" : "none" }}>
                  {src ? <img src={src} alt={it.title} className="absolute inset-0 w-full h-full object-cover" />
                    : <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg,var(--bg-secondary),var(--bg-primary))" }}><span className="font-display text-7xl" style={{ color: "var(--brand)" }}>{it.kanji || it.title[0]}</span></div>}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent 55%)" }} />
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2 py-1" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>À la une</span>
                  {!cfg.showTitles ? null : <div className="absolute bottom-0 left-0 right-0 p-4 text-left"><p className="font-display text-xl md:text-3xl leading-tight" style={{ color: "#fff", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>{it.title}</p></div>}
                </button>
              );
            }
            return (
              <div key={it.id} ref={(el) => (railRefs.current[i] = el)} className="flex-shrink-0 h-full" style={{ width: cardW }}>
                <PosterCard item={it} focused={active} hideTitle={!cfg.showTitles}
                  catLabel={cfg.showTitles ? (catLabelByKey[it.category] || it.category) : ""}
                  isFav={isFavorite(it.id)} onToggleFav={() => { toggleFavorite(it.id); sfx("select"); }}
                  onFocus={() => { setZone("rail"); setFocus(i); }}
                  onClick={() => open(it.id)} onResume={() => resume(it.id)} onTrailer={() => trailer(it.id)} />
              </div>
            );
          })}
        </div>

        {/* Focused meta + actions */}
        {focused && (
          <div key={focused.id} className="fade-up max-w-3xl" style={{ marginTop: d.gap + 4 }}>
            <span className="inline-block text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.25em] px-2.5 py-1 mb-2" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>{catLabelByKey[focused.category] || focused.category}</span>
            <h1 className="font-display leading-none text-3xl sm:text-5xl md:text-6xl break-words" style={{ color: "#fff", textShadow: "0 2px 22px rgba(0,0,0,0.7)" }} data-testid="bigpicture-title">{focused.title}</h1>
            {(focused.tagline || focused.synopsis) && <p className="mt-2 text-sm md:text-base line-clamp-2" style={{ color: "rgba(255,255,255,0.82)", maxWidth: "54ch", textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>{focused.tagline || focused.synopsis}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button data-testid="bigpicture-launch" onClick={() => open(focused.id)} className="flex items-center gap-2 px-6 py-3 font-semibold transition-transform hover:scale-105" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}><IoPlay size={18} /> {focused.launch_label || "Lancer"}</button>
              {hasTrailer && <button data-testid="bigpicture-trailer" onClick={() => trailer(focused.id)} className="flex items-center gap-2 px-5 py-3 font-semibold" style={{ background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)", backdropFilter: "blur(6px)" }}><IoFilmOutline size={18} /> Bande-annonce</button>}
              <button data-testid="bigpicture-fav" onClick={() => toggleFavorite(focused.id)} className="w-12 h-12 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", color: isFavorite(focused.id) ? "var(--brand)" : "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)" }}>{isFavorite(focused.id) ? <IoHeart size={20} /> : <IoHeartOutline size={20} />}</button>
              {isAdmin && (
                <>
                  <button data-testid="hero-set-featured" onClick={() => setFeatured(focused.id)} title="Mettre à la une" className="w-11 h-11 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", color: focused.id === featuredId ? "var(--brand)" : "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }}>{focused.id === featuredId ? <IoStar size={18} /> : <IoStarOutline size={18} />}</button>
                  <button data-testid="hero-edit" onClick={() => onEdit(focused)} className="w-11 h-11 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }}><IoCreateOutline size={18} /></button>
                  <button data-testid="hero-delete" onClick={() => onDelete(focused)} className="w-11 h-11 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", color: "var(--brand)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }}><IoTrashOutline size={18} /></button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Shortcut shelves = pages choisies */}
        {activeShelves.length > 0 && (
          <div style={{ marginTop: d.rowGap }} data-testid="home-shelves">
            <div className="flex flex-wrap" style={{ gap: d.gap }}>
              {activeShelves.map((s, i) => {
                const active = zone === "shelves" && i === shelfIdx;
                const Icon = s.Icon;
                return (
                  <button key={s.key} ref={(el) => (shelfRefs.current[i] = el)} data-testid={`home-shelf-${s.key}`}
                    onMouseEnter={() => { setZone("shelves"); setShelfIdx(i); }} onClick={() => goRoute(s.route)}
                    className="group relative flex items-center gap-3 px-5 py-4 transition-transform hover:scale-[1.02] flex-1 min-w-[160px]"
                    style={{ background: "linear-gradient(120deg, color-mix(in srgb, var(--brand) 16%, var(--bg-secondary)), var(--bg-secondary))", border: active ? "2px solid var(--brand)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "calc(var(--radius-base)*1.5)", boxShadow: active ? "0 0 26px color-mix(in srgb,var(--brand) 35%,transparent)" : "none" }}>
                    <span className="font-display text-2xl opacity-80" style={{ color: "var(--brand)" }}>{s.kanji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-display text-lg" style={{ color: "#fff" }}>{s.label}</p>
                    </div>
                    <Icon size={20} style={{ color: "var(--brand)" }} />
                    <IoChevronForward size={16} className="opacity-50 transition-transform group-hover:translate-x-1" style={{ color: "#fff" }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
