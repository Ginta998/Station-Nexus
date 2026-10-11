import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoRefresh, IoWarningOutline } from "react-icons/io5";
import { toast } from "sonner";
import { listCreations, listCategories, deleteCreation, getSettings, updateSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import TopBar from "@/components/TopBar";
import EditorDialog from "@/components/EditorDialog";
import ProfileDialog from "@/components/ProfileDialog";
import HomeCountdown from "@/components/HomeCountdown";
import BigPicture from "@/components/home/BigPicture";
import HomeCustomizer from "@/components/home/HomeCustomizer";

const SORTS = [
  { v: "order", label: "Ordre" },
  { v: "recent", label: "Récent" },
  { v: "az", label: "A → Z" },
  { v: "za", label: "Z → A" },
];
const CFG_KEYS = { heroSize: "sx_home_hero", cardSize: "sx_home_card", density: "sx_home_density", showTitles: "sx_home_titles" };
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

export default function Home() {
  const nav = useNavigate();
  const { isAdmin, sfx, favorites, isFavorite, toggleFavorite } = useApp();
  const { user, openAuth } = useAuth();

  const { data: all = [], refetch, isLoading, isError } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: settings, refetch: refetchSettings } = useQuery({ queryKey: ["site-settings"], queryFn: getSettings });

  const [sort, setSort] = useState("order");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);

  // per-visitor overrides (localStorage) with admin/global defaults (settings) fallback
  const [override, setOverride] = useState({
    heroSize: lsGet(CFG_KEYS.heroSize), cardSize: lsGet(CFG_KEYS.cardSize),
    density: lsGet(CFG_KEYS.density), showTitles: lsGet(CFG_KEYS.showTitles),
  });
  const cfg = useMemo(() => ({
    heroSize: override.heroSize || settings?.home_hero_size || "l",
    cardSize: override.cardSize || settings?.home_card_size || "m",
    density: override.density || settings?.home_density || "normal",
    showTitles: override.showTitles != null ? override.showTitles === "1" : (settings?.home_show_titles != null ? settings.home_show_titles : true),
  }), [override, settings]);

  const [shelves, setShelves] = useState(null);
  useEffect(() => { if (shelves === null && settings) setShelves(settings.home_shelves || ["soutien", "membres", "nouveautes"]); }, [settings, shelves]);
  const effectiveShelves = shelves || settings?.home_shelves || ["soutien", "membres", "nouveautes"];

  const setCfg = useCallback((patch) => {
    setOverride((prev) => {
      const next = { ...prev };
      Object.entries(patch).forEach(([k, v]) => {
        const sval = k === "showTitles" ? (v ? "1" : "0") : v;
        next[k] = sval; try { localStorage.setItem(CFG_KEYS[k], sval); } catch {}
      });
      return next;
    });
  }, []);

  const requireProfile = () => { if (!user) { toast.info("Crée un compte pour avoir ton profil (nom + avatar) sauvegardé partout."); openAuth(); } else setProfileOpen(true); };

  const catLabelByKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c.label])), [cats]);

  const items = useMemo(() => {
    let list = [...all];
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "za") list.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === "recent") list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    else list.sort((a, b) => (a.order || 0) - (b.order || 0));
    // featured first
    const fid = settings?.featured_creation_id;
    if (fid) { const idx = list.findIndex((x) => x.id === fid); if (idx > 0) { const [f] = list.splice(idx, 1); list.unshift(f); } }
    return list;
  }, [all, sort, settings]);

  const featuredId = settings?.featured_creation_id || (items[0]?.id || "");

  const open = useCallback((id) => { sfx("select"); nav(`/oeuvre/${id}`); }, [nav, sfx]);
  const resume = useCallback((id) => { sfx("select"); nav(`/oeuvre/${id}`, { state: { resume: true } }); }, [nav, sfx]);
  const trailer = useCallback((id) => { sfx("select"); nav(`/oeuvre/${id}`, { state: { trailer: true } }); }, [nav, sfx]);
  const goRoute = useCallback((r) => { sfx("select"); nav(r); }, [nav, sfx]);
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
    toast.success(next ? "Mise à la une ✓" : "Mise en avant retirée");
    refetchSettings();
  }, [settings, refetchSettings]);
  const cycleSort = useCallback(() => {
    const i = SORTS.findIndex((s) => s.v === sort);
    const nextS = SORTS[(i + 1) % SORTS.length];
    setSort(nextS.v); sfx("nav"); toast.success(`Tri : ${nextS.label}`);
  }, [sort, sfx]);
  const saveDefault = useCallback(async () => {
    if (!settings) return;
    setSavingDefault(true);
    try {
      await updateSettings({ ...settings, home_hero_size: cfg.heroSize, home_card_size: cfg.cardSize, home_density: cfg.density, home_show_titles: cfg.showTitles, home_shelves: effectiveShelves });
      toast.success("Affichage par défaut enregistré pour tous ✓");
      refetchSettings();
    } finally { setSavingDefault(false); }
  }, [settings, cfg, effectiveShelves, refetchSettings]);

  useEffect(() => {
    const openP = () => setProfileOpen(true);
    window.addEventListener("sx-open-profile", openP);
    return () => window.removeEventListener("sx-open-profile", openP);
  }, []);

  const dialogsOpen = editorOpen || profileOpen || customizerOpen;
  const sortLabel = (SORTS.find((s) => s.v === sort) || SORTS[0]).label;
  const hardError = isError && all.length === 0;
  const booting = isLoading && all.length === 0;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <TopBar onAdd={onCreate} onProfile={requireProfile} />
      <HomeCountdown />

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
            <button data-testid="home-retry" onClick={() => { sfx("select"); refetch(); refetchSettings(); }}
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
          <BigPicture
            items={items} featuredId={featuredId} isAdmin={isAdmin} catLabelByKey={catLabelByKey}
            isFavorite={isFavorite} toggleFavorite={(id) => toggleFavorite(id)} sfx={sfx}
            open={open} resume={resume} trailer={trailer} onEdit={onEdit} onDelete={onDelete} setFeatured={setFeatured} goRoute={goRoute}
            shelves={effectiveShelves} cfg={cfg} onSort={cycleSort} sortLabel={sortLabel} onCustomize={() => setCustomizerOpen(true)} dialogsOpen={dialogsOpen}
          />
        )}
      </div>

      <HomeCustomizer open={customizerOpen} onClose={() => setCustomizerOpen(false)} cfg={cfg} setCfg={setCfg}
        shelves={effectiveShelves} setShelves={setShelves} isAdmin={isAdmin} onSaveDefault={saveDefault} saving={savingDefault} />
      <EditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} initial={editing} categories={cats} onSaved={refetch} />
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
