import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoSearch, IoFilter, IoRefresh, IoWarningOutline } from "react-icons/io5";
import { toast } from "sonner";
import { listCreations, listCategories, deleteCreation, getMembershipPlan, getSettings, updateSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useEntitlements } from "@/lib/useEntitlements";
import TopBar from "@/components/TopBar";
import EditorDialog from "@/components/EditorDialog";
import ProfileDialog from "@/components/ProfileDialog";
import HomeCountdown from "@/components/HomeCountdown";
import LayoutSwitcher from "@/components/home/LayoutSwitcher";
import SteamLayout from "@/components/home/SteamLayout";
import OverwatchLayout from "@/components/home/OverwatchLayout";
import ValorantLayout from "@/components/home/ValorantLayout";

const ALL = "__all__";
const FAV = "__fav__";
const LAYOUTS = { steam: SteamLayout, overwatch: OverwatchLayout, valorant: ValorantLayout };

export default function Home() {
  const nav = useNavigate();
  const { isAdmin, sfx, favorites, isFavorite, toggleFavorite, homeLayout } = useApp();
  const { user, openAuth } = useAuth();
  const { membershipActive } = useEntitlements();

  const { data: all = [], refetch, isLoading, isError } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [], refetch: refetchCats, isError: catsError } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: memberPlan } = useQuery({ queryKey: ["membership-plan"], queryFn: getMembershipPlan });
  const { data: settings, refetch: refetchSettings } = useQuery({ queryKey: ["site-settings"], queryFn: getSettings });

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("order");
  const [showSort, setShowSort] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const requireProfile = () => { if (!user) { toast.info("Crée un compte pour avoir ton profil (nom + avatar) sauvegardé partout."); openAuth(); } else setProfileOpen(true); };

  const tabs = useMemo(() => [{ key: ALL, label: "Toutes mes créations", kanji: "全" }, { key: FAV, label: "Favoris", kanji: "愛" }, ...cats], [cats]);
  const catLabelByKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c.label])), [cats]);

  const base = useMemo(() => {
    let list = [...all];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((x) => (x.title + " " + (x.tagline || "") + " " + (x.synopsis || "")).toLowerCase().includes(q));
    }
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "za") list.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === "recent") list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    else list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return list;
  }, [all, query, sort]);

  const groups = useMemo(() => {
    const g = { [ALL]: base, [FAV]: base.filter((x) => favorites.includes(x.id)) };
    cats.forEach((c) => { g[c.key] = base.filter((x) => x.category === c.key); });
    return g;
  }, [base, cats, favorites]);

  const featuredId = settings?.featured_creation_id || "";
  const hero = useMemo(() => all.find((x) => x.id === featuredId) || base[0] || all[0] || null, [all, base, featuredId]);

  const open = useCallback((id) => { sfx("select"); nav(`/oeuvre/${id}`); }, [nav, sfx]);
  const resume = useCallback((id) => { sfx("select"); nav(`/oeuvre/${id}`, { state: { resume: true } }); }, [nav, sfx]);
  const trailer = useCallback((id) => { sfx("select"); nav(`/oeuvre/${id}`, { state: { trailer: true } }); }, [nav, sfx]);
  const goSupport = useCallback(() => { sfx("select"); nav("/soutien"); }, [nav, sfx]);
  const onEdit = useCallback((item) => { setEditing(item || null); setEditorOpen(true); }, []);
  const onCreate = useCallback(() => { setEditing(null); setEditorOpen(true); }, []);
  const onDelete = useCallback(async (item) => {
    if (!item || !window.confirm(`Supprimer « ${item.title} » ?`)) return;
    await deleteCreation(item.id); toast.success("Supprimé"); refetch();
  }, [refetch]);
  const setFeatured = useCallback(async (id) => {
    if (!settings) return;
    const next = settings.featured_creation_id === id ? "" : id;
    await updateSettings({ ...settings, featured_creation_id: next });
    toast.success(next ? "Création du moment mise à jour ✓" : "Mise en avant retirée");
    refetchSettings();
  }, [settings, refetchSettings]);

  useEffect(() => {
    const openP = () => setProfileOpen(true);
    window.addEventListener("sx-open-profile", openP);
    return () => window.removeEventListener("sx-open-profile", openP);
  }, []);

  const ActiveLayout = LAYOUTS[homeLayout] || SteamLayout;
  const dialogsOpen = editorOpen || profileOpen;

  const ctx = {
    tabs, cats, groups, all, hero, featuredId, isAdmin, memberPlan, membershipActive,
    catLabelByKey, isFavorite, toggleFavorite, favorites, sfx,
    open, resume, trailer, onEdit, onDelete, setFeatured, goSupport, dialogsOpen,
  };

  const hardError = (isError || catsError) && all.length === 0;
  const booting = isLoading && all.length === 0;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <TopBar onAdd={onCreate} onProfile={requireProfile} />
      <HomeCountdown />

      <div className="flex items-center gap-2 px-4 md:px-10 py-2.5 flex-wrap" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <LayoutSwitcher />
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 px-2 border" style={{ borderColor: "rgba(255,255,255,0.18)", borderRadius: "999px", background: "rgba(0,0,0,0.3)" }}>
            <IoSearch size={14} style={{ color: "var(--on-media-2)" }} />
            <input data-testid="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher…"
              className="bg-transparent outline-none text-xs py-1.5 w-32 md:w-56" style={{ color: "var(--on-media)" }} />
          </div>
          <button data-testid="filter-toggle" onClick={() => { sfx("nav"); setShowSort((v) => !v); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border text-xs" style={{ borderColor: "rgba(255,255,255,0.18)", borderRadius: "999px", color: "var(--on-media-2)", background: "rgba(0,0,0,0.3)" }}>
            <IoFilter size={14} /> Trier
          </button>
          {showSort && (
            <select data-testid="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}
              className="px-2 py-1.5 border text-xs outline-none" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "999px" }}>
              <option value="order">Ordre</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="recent">Récent</option>
            </select>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {booting ? (
          <div data-testid="home-loading" className="h-full flex flex-col items-center justify-center gap-4">
            <div className="sx-spin" style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "var(--brand)", borderRadius: "999px" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Chargement des créations…</p>
          </div>
        ) : hardError ? (
          <div data-testid="home-error" className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
            <IoWarningOutline size={48} style={{ color: "var(--brand)" }} />
            <p className="font-display text-xl" style={{ color: "#fff" }}>Connexion interrompue</p>
            <p className="text-sm max-w-sm" style={{ color: "var(--text-secondary)" }}>Impossible de charger les créations pour le moment. Vérifie ta connexion et réessaie.</p>
            <button data-testid="home-retry" onClick={() => { sfx("select"); refetch(); refetchCats(); refetchSettings(); }}
              className="flex items-center gap-2 px-6 py-3 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
              <IoRefresh size={18} /> Réessayer
            </button>
          </div>
        ) : all.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <p style={{ color: "var(--text-secondary)" }}>Aucune création pour l'instant.</p>
            {isAdmin && <button onClick={onCreate} className="px-5 py-2.5 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>+ Ajouter une création</button>}
          </div>
        ) : (
          <ActiveLayout {...ctx} />
        )}
      </div>

      <EditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} initial={editing} categories={cats} onSaved={refetch} />
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
