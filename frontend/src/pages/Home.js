import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoChevronForward, IoCreateOutline, IoTrashOutline, IoPlay } from "react-icons/io5";
import { toast } from "sonner";
import { listCreations, deleteCreation } from "@/lib/api";
import { CATEGORIES } from "@/lib/themes";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import PosterCard from "@/components/PosterCard";
import EditorDialog from "@/components/EditorDialog";

export default function Home() {
  const nav = useNavigate();
  const { isAdmin } = useApp();
  const { data: all = [], refetch, isLoading } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });

  const [catIndex, setCatIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const cardRefs = useRef([]);
  const railRef = useRef(null);

  const grouped = useMemo(() => {
    const m = {};
    CATEGORIES.forEach((c) => (m[c.key] = []));
    all.forEach((it) => { if (m[it.category]) m[it.category].push(it); });
    return m;
  }, [all]);

  const activeCat = CATEGORIES[catIndex];
  const items = grouped[activeCat.key] || [];
  const focused = items[focusIndex];

  useEffect(() => { setFocusIndex(0); }, [catIndex]);

  useEffect(() => {
    const el = cardRefs.current[focusIndex];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [focusIndex, catIndex, items.length]);

  const onKey = useCallback((e) => {
    if (editorOpen) return;
    if (e.key === "ArrowRight") { e.preventDefault(); setFocusIndex((i) => Math.min(i + 1, items.length - 1)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); setFocusIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setCatIndex((c) => Math.min(c + 1, CATEGORIES.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCatIndex((c) => Math.max(c - 1, 0)); }
    else if (e.key === "Enter" && focused) { nav(`/oeuvre/${focused.id}`); }
  }, [items.length, focused, editorOpen, nav]);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const bgImg = focused && focused.poster && focused.poster.length > 4 ? focused.poster : null;

  const openCreate = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = () => { if (focused) { setEditing(focused); setEditorOpen(true); } };
  const doDelete = async () => {
    if (!focused) return;
    if (!window.confirm(`Supprimer « ${focused.title} » ?`)) return;
    await deleteCreation(focused.id);
    toast.success("Supprimé");
    refetch();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Dynamic background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {bgImg ? (
          <div
            key={focused.id}
            className="absolute inset-0 bg-cover bg-center scale-110 fade-up"
            style={{ backgroundImage: `url(${bgImg})`, filter: "blur(28px) brightness(0.5)", animation: "bgFade 1s ease" }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: focused?.kanji ? "radial-gradient(circle at 50% 30%, var(--bg-secondary), var(--bg-primary) 70%)" : "var(--bg-primary)" }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "var(--scrim)" }} />
      </div>

      {/* Faint giant kanji watermark */}
      {focused && (
        <div className="absolute right-4 top-1/4 z-0 pointer-events-none select-none font-display leading-none"
          style={{ fontSize: "34vh", color: "var(--brand)", opacity: 0.06 }}>
          {focused.kanji}
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <TopBar onAdd={openCreate} />

        {/* Category tabs */}
        <nav className="flex items-center gap-2 md:gap-3 px-5 md:px-12 mt-6 md:mt-8 overflow-x-auto hide-scrollbar" data-testid="category-nav">
          {CATEGORIES.map((c, i) => {
            const active = i === catIndex;
            return (
              <button
                key={c.key}
                data-testid={`cat-${c.key}`}
                onClick={() => setCatIndex(i)}
                aria-current={active}
                className="flex items-center gap-2 px-3 md:px-4 py-2 whitespace-nowrap transition-all duration-300"
                style={{
                  borderBottom: active ? "2px solid var(--brand)" : "2px solid transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <span className="font-display text-sm opacity-70">{c.kanji}</span>
                <span className="text-sm md:text-base font-medium">{c.label}</span>
                <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{(grouped[c.key] || []).length}</span>
              </button>
            );
          })}
        </nav>

        {/* Focused hero text */}
        <div className="px-5 md:px-12 mt-6 md:mt-10 min-h-[110px]">
          {focused ? (
            <div key={focused.id} className="fade-up max-w-2xl">
              <h1 className="font-display text-4xl md:text-6xl leading-none" style={{ color: "var(--text-primary)" }} data-testid="focused-title">
                {focused.title}
              </h1>
              <p className="mt-2 text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>{focused.tagline}</p>
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>{isLoading ? "Chargement…" : "Aucune création dans cette catégorie."}</p>
          )}
        </div>

        {/* Poster rail */}
        <div ref={railRef} className="flex-1 flex items-center overflow-x-auto hide-scrollbar snap-x snap-mandatory px-5 md:px-12 gap-4 md:gap-6" data-testid="poster-rail">
          {items.map((it, i) => (
            <PosterCard
              key={it.id}
              ref={(el) => (cardRefs.current[i] = el)}
              item={it}
              index={i}
              focused={i === focusIndex}
              onFocus={() => setFocusIndex(i)}
              onClick={() => nav(`/oeuvre/${it.id}`)}
            />
          ))}
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between px-5 md:px-12 pb-6 md:pb-8 pt-2">
          <div className="flex items-center gap-3">
            {focused && (
              <button
                data-testid="launch-cta"
                onClick={() => nav(`/oeuvre/${focused.id}`)}
                className="flex items-center gap-2 px-6 py-3 font-semibold transition-transform hover:scale-105"
                style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}
              >
                <IoPlay size={18} /> {focused.launch_label || "Lancer"}
                <IoChevronForward size={16} />
              </button>
            )}
            {isAdmin && focused && (
              <>
                <button data-testid="home-edit" onClick={openEdit} className="p-3 border transition-colors" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)" }}><IoCreateOutline size={18} /></button>
                <button data-testid="home-delete" onClick={doDelete} className="p-3 border transition-colors" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--brand)" }}><IoTrashOutline size={18} /></button>
              </>
            )}
          </div>
          <p className="hidden md:block text-xs" style={{ color: "var(--text-secondary)" }}>
            ← → naviguer · ↑ ↓ catégories · Entrée : ouvrir
          </p>
        </div>
      </div>

      <EditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} initial={editing} onSaved={refetch} />
    </div>
  );
}
