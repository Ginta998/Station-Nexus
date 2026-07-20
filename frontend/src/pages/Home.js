import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoChevronForward, IoCreateOutline, IoTrashOutline, IoPlay, IoFilter, IoSearch } from "react-icons/io5";
import { toast } from "sonner";
import { listCreations, listCategories, deleteCreation } from "@/lib/api";
import { posterUrl, bgUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import PosterCard from "@/components/PosterCard";
import EditorDialog from "@/components/EditorDialog";

const ALL = "__all__";

export default function Home() {
  const nav = useNavigate();
  const { isAdmin, sfx } = useApp();
  const { data: all = [], refetch, isLoading } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const [catIndex, setCatIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const [sort, setSort] = useState("order");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const cardRefs = useRef([]);

  const tabs = useMemo(() => [{ key: ALL, label: "Toutes mes créations", kanji: "全" }, ...cats], [cats]);
  const catLabelByKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c.label])), [cats]);
  const activeTab = tabs[catIndex] || tabs[0];

  const items = useMemo(() => {
    let list = activeTab.key === ALL ? [...all] : all.filter((x) => x.category === activeTab.key);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((x) => (x.title + " " + (x.tagline || "") + " " + (x.synopsis || "")).toLowerCase().includes(q));
    }
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "za") list.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === "recent") list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    else list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return list;
  }, [all, activeTab, query, sort]);

  const focused = items[focusIndex];

  useEffect(() => { setFocusIndex(0); }, [catIndex, query, sort]);
  useEffect(() => {
    const el = cardRefs.current[focusIndex];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [focusIndex, catIndex, items.length]);

  const onKey = useCallback((e) => {
    if (editorOpen) return;
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) { e.preventDefault(); sfx("nav"); }
    if (e.key === "ArrowRight") setFocusIndex((i) => Math.min(i + 1, items.length - 1));
    else if (e.key === "ArrowLeft") setFocusIndex((i) => Math.max(i - 1, 0));
    else if (e.key === "ArrowDown") setCatIndex((c) => Math.min(c + 1, tabs.length - 1));
    else if (e.key === "ArrowUp") setCatIndex((c) => Math.max(c - 1, 0));
    else if (e.key === "Enter" && focused) { sfx("select"); nav(`/oeuvre/${focused.id}`); }
  }, [items.length, focused, editorOpen, nav, tabs.length, sfx]);

  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);

  const bgImg = focused ? (focused.has_bg ? bgUrl(focused.id, focused.updated_at) : (focused.has_poster ? posterUrl(focused.id, focused.updated_at) : null)) : null;
  const openCreate = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = () => { if (focused) { setEditing(focused); setEditorOpen(true); } };
  const doDelete = async () => {
    if (!focused || !window.confirm(`Supprimer « ${focused.title} » ?`)) return;
    await deleteCreation(focused.id); toast.success("Supprimé"); refetch();
  };
  const open = (id) => { sfx("select"); nav(`/oeuvre/${id}`); };
  const resume = (id) => { sfx("select"); nav(`/oeuvre/${id}`, { state: { resume: true } }); };

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
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
        <TopBar onAdd={openCreate} />

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

        {/* filter bar */}
        <div className="flex items-center gap-2 px-5 md:px-12 mt-4">
          <button data-testid="filter-toggle" onClick={() => { sfx("nav"); setShowFilters((v) => !v); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border text-xs" style={{ borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media-2)", background: "rgba(0,0,0,0.25)" }}>
            <IoFilter size={14} /> Filtres
          </button>
          {showFilters && (
            <div className="flex items-center gap-2 fade-up">
              <div className="flex items-center gap-1 px-2 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
                <IoSearch size={14} style={{ color: "var(--text-secondary)" }} />
                <input data-testid="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher…"
                  className="bg-transparent outline-none text-xs py-1.5 w-32" style={{ color: "var(--text-primary)" }} />
              </div>
              <select data-testid="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}
                className="px-2 py-1.5 border text-xs outline-none" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
                <option value="order">Ordre</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="recent">Récent</option>
              </select>
            </div>
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

        <div className="flex-1 flex items-center overflow-x-auto hide-scrollbar snap-x snap-mandatory px-5 md:px-12 gap-4 md:gap-6" data-testid="poster-rail">
          {items.map((it, i) => (
            <PosterCard key={it.id} ref={(el) => (cardRefs.current[i] = el)} item={it} focused={i === focusIndex}
              catLabel={catLabelByKey[it.category] || it.category}
              onFocus={() => { if (i !== focusIndex) sfx("hover"); setFocusIndex(i); }}
              onClick={() => open(it.id)} onResume={() => resume(it.id)} />
          ))}
        </div>

        <div className="flex items-center justify-between px-5 md:px-12 pb-6 md:pb-8 pt-2">
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
          <p className="hidden md:block text-xs" style={{ color: "var(--on-media-2)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>← → naviguer · ↑ ↓ catégories · Entrée : ouvrir</p>
        </div>
      </div>

      <EditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} initial={editing} categories={cats} onSaved={refetch} />
    </div>
  );
}
