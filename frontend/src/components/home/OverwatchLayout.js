import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import PosterCard from "@/components/PosterCard";
import HeroSpotlight from "@/components/home/HeroSpotlight";
import { useGamepad } from "@/lib/useGamepad";
import { IoHeart } from "react-icons/io5";

export default function OverwatchLayout(ctx) {
  const {
    tabs, groups, all, hero: featured, featuredId, isAdmin, memberPlan, membershipActive,
    catLabelByKey, isFavorite, toggleFavorite, sfx,
    open, resume, trailer, onEdit, onDelete, setFeatured, goSupport, dialogsOpen,
  } = ctx;

  const soutienVisible = !!(memberPlan?.enabled && !membershipActive);
  const spine = useMemo(() => {
    const s = tabs.map((t) => ({ key: t.key, label: t.label, kanji: t.kanji, soutien: false }));
    if (soutienVisible) s.push({ key: "__soutien__", label: "Soutien", kanji: "愛", soutien: true });
    return s;
  }, [tabs, soutienVisible]);

  const [cols, setCols] = useState(() => (typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 4));
  useEffect(() => { const r = () => setCols(window.innerWidth < 768 ? 2 : 4); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);

  const [spineIndex, setSpineIndex] = useState(0);
  const [zone, setZone] = useState("spine");
  const [gridIndex, setGridIndex] = useState(0);
  const gridRefs = useRef({});

  const activeSpine = spine[spineIndex] || spine[0];
  const activeItems = useMemo(() => (activeSpine?.soutien ? [] : (groups[activeSpine?.key] || [])), [activeSpine, groups]);

  useEffect(() => { setGridIndex(0); }, [spineIndex]);

  const stageItem = zone === "grid" && activeItems[gridIndex]
    ? activeItems[gridIndex]
    : (activeItems.find((x) => x.id === featuredId) || activeItems[0] || featured);

  const up = useCallback(() => { sfx("nav"); if (zone === "spine") setSpineIndex((i) => Math.max(0, i - 1)); else setGridIndex((i) => Math.max(0, i - cols)); }, [zone, cols, sfx]);
  const down = useCallback(() => { sfx("nav"); if (zone === "spine") setSpineIndex((i) => Math.min(spine.length - 1, i + 1)); else setGridIndex((i) => Math.min(activeItems.length - 1, i + cols)); }, [zone, cols, spine.length, activeItems.length, sfx]);
  const left = useCallback(() => { sfx("nav"); if (zone === "grid") { if (gridIndex % cols === 0) setZone("spine"); else setGridIndex((i) => Math.max(0, i - 1)); } }, [zone, gridIndex, cols, sfx]);
  const right = useCallback(() => { sfx("nav"); if (zone === "spine" && !activeSpine?.soutien && activeItems.length) { setZone("grid"); setGridIndex(0); } else if (zone === "grid") setGridIndex((i) => Math.min(activeItems.length - 1, i + 1)); }, [zone, activeSpine, activeItems.length, sfx]);
  const confirm = useCallback(() => {
    if (zone === "spine") { if (activeSpine?.soutien) goSupport(); else if (activeItems.length) { setZone("grid"); setGridIndex(0); } }
    else { const it = activeItems[gridIndex]; if (it) open(it.id); }
  }, [zone, activeSpine, activeItems, gridIndex, open, goSupport]);

  useEffect(() => { if (zone === "grid") { const el = gridRefs.current[gridIndex]; if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" }); } }, [gridIndex, zone]);

  const onKey = useCallback((e) => {
    if (dialogsOpen) return;
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowUp") up(); else if (e.key === "ArrowDown") down();
    else if (e.key === "ArrowLeft") left(); else if (e.key === "ArrowRight") right();
    else if (e.key === "Enter") confirm();
  }, [up, down, left, right, confirm, dialogsOpen]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);
  useGamepad({ up, down, left, right, confirm }, !dialogsOpen);

  return (
    <div data-testid="home-overwatch" className="h-full flex flex-col md:flex-row" style={{ background: "var(--bg-primary)" }}>
      {/* Spine */}
      <div className="flex md:flex-col md:w-[280px] md:flex-shrink-0 gap-1 md:gap-1.5 px-3 md:px-4 py-3 md:py-6 overflow-x-auto md:overflow-y-auto hide-scrollbar border-b md:border-b-0 md:border-r"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "linear-gradient(180deg, var(--bg-secondary), var(--bg-primary))" }}>
        {spine.map((it, i) => {
          const active = i === spineIndex;
          return (
            <button key={it.key} data-testid={`spine-${it.key}`}
              onClick={() => { sfx("nav"); setSpineIndex(i); setZone("spine"); }}
              className="relative flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 whitespace-nowrap md:whitespace-normal transition-all duration-300 text-left flex-shrink-0 md:w-full min-w-0"
              style={{ borderRadius: "var(--radius-base)", background: active ? "rgba(255,255,255,0.08)" : "transparent", transform: active ? "translateX(0)" : "none", color: active ? "#fff" : "var(--text-secondary)" }}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 md:h-3/5" style={{ background: "var(--brand)", borderRadius: 2, boxShadow: "0 0 12px var(--brand)" }} />}
              <span className="font-display text-lg opacity-70 flex-shrink-0" style={{ color: it.soutien ? "var(--brand)" : "inherit" }}>{it.soutien ? <IoHeart size={18} /> : it.kanji}</span>
              <span className="font-display text-sm md:text-base truncate">{it.label}</span>
              {!it.soutien && <span className="ml-auto text-xs opacity-60 hidden md:inline flex-shrink-0 pl-1">{(groups[it.key] || []).length}</span>}
            </button>
          );
        })}
      </div>

      {/* Stage + grid */}
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-4 md:px-8 py-4 md:py-6">
        {activeSpine?.soutien ? (
          <div className="h-full flex items-center justify-center">
            <button data-testid="soutien-section-container" onClick={goSupport} className="max-w-xl w-full text-center p-10 transition-transform hover:scale-[1.02]"
              style={{ borderRadius: "calc(var(--radius-base)*2)", background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 30%, var(--bg-secondary)), var(--bg-primary))", border: "1px solid color-mix(in srgb, var(--brand) 40%, transparent)" }}>
              <IoHeart size={56} style={{ color: "var(--brand)" }} className="mx-auto mb-4" />
              <p className="font-display text-3xl" style={{ color: "#fff" }}>Soutiens la station</p>
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>Rejoins les membres et débloque les avantages exclusifs.</p>
              <span className="inline-block mt-5 px-6 py-3 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "999px" }}>Découvrir les avantages</span>
            </button>
          </div>
        ) : stageItem ? (
          <>
            <HeroSpotlight item={stageItem} catLabel={catLabelByKey[stageItem.category] || stageItem.category}
              heroFocused={false} onLaunch={() => open(stageItem.id)} onTrailer={() => trailer(stageItem.id)}
              onToggleFav={() => toggleFavorite(stageItem.id)} isFav={isFavorite(stageItem.id)}
              isAdmin={isAdmin} isFeatured={stageItem.id === featuredId} onSetFeatured={setFeatured}
              onEdit={onEdit} onDelete={onDelete} ratio="aspect-[16/9] md:aspect-[21/9]" />
            <div className="mt-6 grid gap-3 md:gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }} data-testid="overwatch-grid">
              {activeItems.map((it, i) => (
                <div key={it.id} ref={(el) => (gridRefs.current[i] = el)}>
                  <PosterCard item={it} focused={zone === "grid" && i === gridIndex}
                    catLabel={catLabelByKey[it.category] || it.category}
                    isFav={isFavorite(it.id)} onToggleFav={() => { toggleFavorite(it.id); sfx("select"); }}
                    onFocus={() => { setZone("grid"); setGridIndex(i); }}
                    onClick={() => open(it.id)} onResume={() => resume(it.id)} onTrailer={() => trailer(it.id)} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center"><p style={{ color: "var(--text-secondary)" }}>Aucune création dans cette catégorie.</p></div>
        )}
      </div>
    </div>
  );
}
