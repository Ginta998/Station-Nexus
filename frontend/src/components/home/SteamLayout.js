import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import PosterCard from "@/components/PosterCard";
import HeroSpotlight from "@/components/home/HeroSpotlight";
import SupportBanner from "@/components/home/SupportBanner";
import { useGamepad } from "@/lib/useGamepad";

export default function SteamLayout(ctx) {
  const {
    cats, groups, hero, featuredId, isAdmin, memberPlan, membershipActive,
    catLabelByKey, isFavorite, toggleFavorite, favorites, sfx,
    open, resume, trailer, onEdit, onDelete, setFeatured, goSupport, dialogsOpen,
  } = ctx;

  const rows = useMemo(() => {
    const r = cats.map((c) => ({ key: c.key, label: c.label, kanji: c.kanji, items: groups[c.key] || [] }));
    const fav = (groups.__fav__ || []);
    if (fav.length) r.push({ key: "__fav__", label: "Favoris", kanji: "愛", items: fav });
    return r.filter((x) => x.items.length > 0);
  }, [cats, groups]);

  const heroActions = 1 + (((hero?.trailer_url && hero.trailer_url.trim()) || hero?.has_trailer) ? 1 : 0);
  const soutienVisible = !!(memberPlan?.enabled && !membershipActive);
  const lastSec = rows.length + (soutienVisible ? 1 : 0) - 1; // index of soutien (or last row)
  const soutienSec = soutienVisible ? rows.length : -2;

  const [sec, setSec] = useState(-1);
  const [col, setCol] = useState(0);
  const [act, setAct] = useState(0);
  const cardRefs = useRef({});
  const heroRef = useRef(null);
  const soutienRef = useRef(null);

  const rowLen = (s) => (rows[s] ? rows[s].items.length : 0);

  const scrollTo = useCallback((s, c) => {
    const el = s === -1 ? heroRef.current : s === soutienSec ? soutienRef.current : cardRefs.current[`${s}-${c}`];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [soutienSec]);

  useEffect(() => { scrollTo(sec, col); }, [sec, col, scrollTo]);

  const up = useCallback(() => { sfx("nav"); setSec((s) => Math.max(-1, s - 1)); }, [sfx]);
  const down = useCallback(() => { sfx("nav"); setSec((s) => Math.min(lastSec, s + 1)); }, [sfx, lastSec]);
  const left = useCallback(() => {
    sfx("nav");
    if (sec === -1) setAct((a) => Math.max(0, a - 1));
    else if (sec >= 0 && sec < rows.length) setCol((c) => Math.max(0, c - 1));
  }, [sec, rows.length, sfx]);
  const right = useCallback(() => {
    sfx("nav");
    if (sec === -1) setAct((a) => Math.min(heroActions - 1, a + 1));
    else if (sec >= 0 && sec < rows.length) setCol((c) => Math.min(rowLen(sec) - 1, c + 1));
  }, [sec, rows, heroActions, sfx]);
  const confirm = useCallback(() => {
    if (sec === -1 && hero) { act === 1 ? trailer(hero.id) : open(hero.id); }
    else if (sec === soutienSec) goSupport();
    else if (rows[sec]) { const it = rows[sec].items[col]; if (it) open(it.id); }
  }, [sec, col, act, hero, rows, soutienSec, open, trailer, goSupport]);

  useEffect(() => { setCol((c) => Math.min(c, Math.max(0, rowLen(sec) - 1))); }, [sec]); // eslint-disable-line

  const onKey = useCallback((e) => {
    if (dialogsOpen) return;
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowUp") up();
    else if (e.key === "ArrowDown") down();
    else if (e.key === "ArrowLeft") left();
    else if (e.key === "ArrowRight") right();
    else if (e.key === "Enter") confirm();
  }, [up, down, left, right, confirm, dialogsOpen]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);
  useGamepad({ up, down, left, right, confirm }, !dialogsOpen);

  return (
    <div data-testid="home-steam" className="h-full overflow-y-auto hide-scrollbar px-4 md:px-10 pb-16" style={{ background: "var(--bg-primary)" }}>
      <div ref={heroRef} className="pt-2">
        <HeroSpotlight
          item={hero} catLabel={catLabelByKey[hero?.category] || hero?.category}
          heroFocused={sec === -1} actionIndex={act}
          onLaunch={() => hero && open(hero.id)} onTrailer={() => hero && trailer(hero.id)}
          onToggleFav={() => hero && toggleFavorite(hero.id)} isFav={hero && isFavorite(hero.id)}
          isAdmin={isAdmin} isFeatured={hero && hero.id === featuredId} onSetFeatured={setFeatured}
          onEdit={onEdit} onDelete={onDelete} ratio="aspect-[16/9] md:aspect-[21/9]"
        />
      </div>

      <div className="mt-8 md:mt-10 space-y-8 md:space-y-10">
        {rows.map((row, s) => (
          <section key={row.key} data-testid={`category-row-${row.key}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-lg opacity-60" style={{ color: "var(--brand)" }}>{row.kanji}</span>
              <h2 className="font-display text-xl md:text-2xl" style={{ color: "#fff" }}>{row.label}</h2>
              <span className="text-xs px-2 py-0.5" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", borderRadius: "999px" }}>{row.items.length}</span>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x pb-2" style={{ scrollPaddingLeft: 24, scrollPaddingRight: 24 }}>
              {row.items.map((it, c) => (
                <div key={it.id} ref={(el) => (cardRefs.current[`${s}-${c}`] = el)} className="snap-start flex-shrink-0 w-[42vw] sm:w-[30vw] md:w-[200px] lg:w-[220px]">
                  <PosterCard item={it} focused={sec === s && col === c}
                    catLabel={catLabelByKey[it.category] || it.category}
                    isFav={isFavorite(it.id)} onToggleFav={() => { toggleFavorite(it.id); sfx("select"); }}
                    onFocus={() => { setSec(s); setCol(c); }}
                    onClick={() => open(it.id)} onResume={() => resume(it.id)} onTrailer={() => trailer(it.id)} />
                </div>
              ))}
            </div>
          </section>
        ))}

        {soutienVisible && (
          <div ref={soutienRef}>
            <SupportBanner memberPlan={memberPlan} membershipActive={membershipActive} onOpen={goSupport} focused={sec === soutienSec} />
          </div>
        )}
      </div>

      <p className="hidden md:block text-center text-xs mt-8" style={{ color: "var(--on-media-2)" }}>
        <IoChevronBack className="inline" /> <IoChevronForward className="inline" /> naviguer · ↑ ↓ sections · Entrée : ouvrir
      </p>
    </div>
  );
}
