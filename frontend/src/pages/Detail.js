import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoHome, IoPlay, IoPause, IoClose, IoCart, IoCreateOutline, IoTrashOutline, IoMusicalNotes, IoOpenOutline, IoBookOutline, IoLogoYoutube, IoHeart, IoHeartOutline, IoFilmOutline, IoLockClosed, IoDownloadOutline, IoSparklesOutline } from "react-icons/io5";
import { toast } from "sonner";
import { getCreation, deleteCreation, listCategories, listCreations, posterUrl, bgUrl, videoUrl, startCheckout, getMembershipPlan, assetDownloadUrl, getSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useEntitlements } from "@/lib/useEntitlements";
import { resolveVideoEmbed } from "@/lib/video";
import EditorDialog from "@/components/EditorDialog";
import MovixSelector from "@/components/MovixSelector";
import CommentsSection from "@/components/CommentsSection";
import { FicheSupport } from "@/components/SupportersWall";
import LaunchGate from "@/components/LaunchGate";
import ChapterReader from "@/components/ChapterReader";
import CosmicBunnyGame from "@/components/CosmicBunnyGame";
import CinemaPlayer from "@/components/CinemaPlayer";
import ShareMenu from "@/components/ShareMenu";
import MobileMenu from "@/components/MobileMenu";

export default function Detail() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const { isAdmin, playAmbient, stopAmbient, isPlaying, playingId, sfx, isFavorite, toggleFavorite } = useApp();
  const { user, openAuth } = useAuth();
  const { hasAccess, chapterLocked, membershipActive } = useEntitlements();
  const { data: plan } = useQuery({ queryKey: ["membership-plan"], queryFn: getMembershipPlan });
  const { data: siteSettings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data: item, refetch, isLoading } = useQuery({ queryKey: ["creation", id], queryFn: () => getCreation(id) });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: allCreations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });

  const [readerOpen, setReaderOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [cinemaKind, setCinemaKind] = useState(null); // "film" | "trailer" | null
  const [readerStart, setReaderStart] = useState(null);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [buying, setBuying] = useState(false);
  const cardRef = useRef(null);

  // auto-play the creation ambient on open (cuts app ambience)
  useEffect(() => {
    if (item && item.has_audio) playAmbient(item.id);
    return () => stopAmbient();
    // eslint-disable-next-line
  }, [item?.id, item?.has_audio]);

  // Cosmic Bunny special context on her own creation page ("Cosmic Bunny")
  useEffect(() => {
    const isBunny = item && typeof item.title === "string" && item.title.trim().toLowerCase() === "cosmic bunny";
    if (isBunny) {
      window.dispatchEvent(new CustomEvent("sx-cb-context", { detail: "bunny_story" }));
      return () => window.dispatchEvent(new CustomEvent("sx-cb-context", { detail: null }));
    }
    // eslint-disable-next-line
  }, [item?.id, item?.title]);

  // resume reading directly when navigated from a card's progress bar
  useEffect(() => {
    if (location.state?.resume && item && item.launch_type === "chapters") {
      setReaderStart(null);
      setChaptersOpen(true);
      nav(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line
  }, [location.state?.resume, item?.id]);

  useEffect(() => {
    if (location.state?.trailer && item) {
      const t = setTimeout(() => {
        const el = document.querySelector('[data-testid="detail-trailer-section"]');
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
      nav(location.pathname, { replace: true, state: {} });
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [location.state?.trailer, item?.id]);

  const recommendations = useMemo(() => {
    const others = allCreations.filter((c) => c.id !== id);
    for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
    return others.slice(0, 6);
  }, [allCreations, id]);

  if (isLoading || !item) {
    return <div className="h-screen flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>Chargement…</div>;
  }

  const hasImg = item.has_poster || (item.poster && item.poster.length > 4);
  const posterSrc = item.poster && item.poster.length > 4 ? item.poster : posterUrl(item.id, item.updated_at);
  const bgSrc = item.has_bg ? bgUrl(item.id, item.updated_at) : (hasImg ? posterSrc : null);
  const thisPlaying = isPlaying && playingId === item.id;
  const catLabel = cats.find((c) => c.key === item.category)?.label || item.category;
  const savedProgress = item.launch_type === "chapters" ? (() => { try { return JSON.parse(localStorage.getItem("sx_progress_" + item.id) || "null"); } catch (_) { return null; } })() : null;
  const canResume = savedProgress && ((savedProgress.chapter || 0) > 0 || (savedProgress.ratio || 0) > 0.02);

  // Prochain à regarder (reprise de lecture) — affiché en haut de la fiche
  const continueTarget = (() => {
    if (item.launch_type === "chapters" && item.chapters?.length) {
      const idx = Math.min(savedProgress?.chapter || 0, item.chapters.length - 1);
      const c = item.chapters[idx];
      return { kind: "chapter", idx, item: c, image: c.image, title: c.title || `Chapitre ${idx + 1}`,
        label: canResume ? "Reprendre la lecture" : "Commencer la lecture", badge: `Chapitre ${idx + 1}`,
        onOpen: () => openChapter(idx) };
    }
    if (item.launch_type === "episodes" && item.episodes?.length) {
      let last = null; try { last = JSON.parse(localStorage.getItem("sx_eplast_" + item.id) ?? "null"); } catch (_) {}
      const idx = last != null ? Math.min(Number(last) + 1, item.episodes.length - 1) : 0;
      const e = item.episodes[idx];
      return { kind: "episode", idx, item: e, image: e.image, title: e.title || `Épisode ${idx + 1}`,
        label: last != null ? "Continuer" : "Commencer", badge: `Épisode ${idx + 1}`,
        onOpen: () => openEpisode(idx) };
    }
    return null;
  })();

  const chSize = item.chapter_size || "md";
  const btnSizeCls = { md: "px-7 py-3.5 text-lg", lg: "px-9 py-4 text-xl", xl: "px-12 py-5 text-2xl" }[item.button_size || "md"];
  const secondaryBtnCls = { md: "px-5 py-3.5", lg: "px-6 py-4 text-lg", xl: "px-8 py-5 text-xl" }[item.button_size || "md"];
  const imgGridCls = { sm: "grid-cols-3 sm:grid-cols-4", md: "grid-cols-2 sm:grid-cols-3", lg: "grid-cols-1 sm:grid-cols-2", xl: "grid-cols-1 sm:grid-cols-2" }[chSize];
  const imgAspectCls = { sm: "aspect-video", md: "aspect-video", lg: "aspect-video", xl: "aspect-[16/7]" }[chSize];
  const imgTitleCls = { sm: "text-xs", md: "text-sm", lg: "text-base", xl: "text-xl" }[chSize];
  const rowPadCls = { sm: "p-2", md: "p-3", lg: "p-4", xl: "p-6" }[chSize];
  const rowNumCls = { sm: "text-base w-6", md: "text-lg w-8", lg: "text-2xl w-10", xl: "text-4xl w-14" }[chSize];
  const rowTitleCls = { sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-2xl" }[chSize];

  const ytEmbed = (url) => {
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  const access = hasAccess(item);
  const isPaidLocked = item.is_paid && !access;

  const buyThis = async () => {
    if (!user) { toast.info("Connecte-toi pour acheter cette création."); openAuth(); return; }
    setBuying(true);
    try { const r = await startCheckout({ kind: "creation", creation_id: item.id }); window.location.href = r.checkout_url; }
    catch (e) { toast.error(e?.response?.data?.detail || "Impossible de démarrer l'achat"); setBuying(false); }
  };
  const subscribe = async () => { sfx("select"); nav("/soutien"); };

  const launch = () => {
    sfx("select");
    if (!user) { setGateOpen(true); return; }
    // Paywall: film/reader creations fully locked until purchase or membership
    if (isPaidLocked && (item.launch_type === "film" || item.launch_type === "reader" || item.launch_type === "link")) {
      toast.info("Cette création est payante — débloque-la pour la lancer.");
      document.querySelector('[data-testid="detail-paywall"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (item.launch_type === "chapters") { setReaderStart(null); setChaptersOpen(true); }
    else if (item.launch_type === "game") setGameOpen(true);
    else if (item.launch_type === "reader") setReaderOpen(true);
    else if (item.launch_type === "episodes") setShowEpisodes(true);
    else if (item.launch_type === "film") { stopAmbient(); setCinemaKind("film"); }
    else if (item.launch_type === "link") {
      if (item.launch_url) window.open(item.launch_url, "_blank", "noopener");
      else toast.info("Le lien du film sera bientôt disponible.");
    } else toast.success(`« ${item.title} » lancé.`);
  };

  const hasTrailer = !!((item.trailer_url && item.trailer_url.trim()) || item.has_trailer);
  const trailerSource = hasTrailer
    ? ((item.trailer_url && item.trailer_url.trim())
        ? resolveVideoEmbed(item.trailer_url, false)
        : { type: "video", src: videoUrl(item.id, "trailer", item.updated_at) })
    : null;

  const openChapter = (i) => {
    if (!user) { sfx("nav"); setGateOpen(true); return; }
    if (chapterLocked(item, i)) {
      sfx("nav");
      toast.info("Ce chapitre est réservé — débloque la création ou abonne-toi.");
      document.querySelector('[data-testid="detail-paywall"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    sfx("select"); setReaderStart(i); setChaptersOpen(true);
  };

  const openEpisode = (i) => {
    const ep = item.episodes?.[i];
    if (!ep) return;
    try { localStorage.setItem("sx_eplast_" + item.id, String(i)); } catch (_) {}
    if (ep.url) { sfx("select"); window.open(ep.url, "_blank", "noopener,noreferrer"); }
    else { toast.info("Aucun lien pour cet épisode."); }
  };

  const goToComments = () => {
    setChaptersOpen(false);
    setTimeout(() => {
      const el = document.querySelector('[data-testid="comments-section"]');
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      const input = document.querySelector('[data-testid="comment-text"]');
      if (input) input.focus();
    }, 450);
  };

  const doDelete = async () => {
    if (!window.confirm(`Supprimer « ${item.title} » ?`)) return;
    await deleteCreation(item.id); stopAmbient(); toast.success("Supprimé"); nav("/");
  };

  const btn = { borderColor: "rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)", color: "#fff", background: "rgba(0,0,0,0.25)" };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: "var(--bg-primary)" }}>
      <div className="fixed inset-0 z-0" aria-hidden="true">
        {bgSrc ? (
          <div className="absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: `url(${bgSrc})`, filter: `blur(${item.bg_blur ?? 32}px)` }} />
        ) : (
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 30%, var(--bg-secondary), var(--bg-primary) 70%)" }} />
        )}
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${item.bg_dim ?? 0.55})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.25))" }} />
      </div>

      <div className="relative z-10">
        <div className="sx-safe-top flex flex-wrap items-center justify-between gap-2 px-5 md:px-12 pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button data-testid="detail-back" onClick={() => { sfx("back"); nav(-1); }} title="Retour" aria-label="Retour" className="p-2.5 border flex-shrink-0" style={btn}>
              <IoArrowBack size={18} />
            </button>
            <button data-testid="detail-home" onClick={() => { sfx("nav"); nav("/"); }} title="Accueil" aria-label="Accueil" className="p-2.5 border flex-shrink-0" style={btn}>
              <IoHome size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ShareMenu item={item} cardRef={cardRef} testid="detail-share-icon" />
            {isAdmin && (
              <>
                <button data-testid="detail-edit" onClick={() => setEditorOpen(true)} className="p-2.5 border" style={btn}><IoCreateOutline size={18} /></button>
                <button data-testid="detail-delete" onClick={doDelete} className="p-2.5 border" style={{ ...btn, color: "var(--brand)" }}><IoTrashOutline size={18} /></button>
              </>
            )}
            <MobileMenu />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-12 py-8 md:py-14 flex flex-col md:flex-row gap-8 md:gap-14 items-center md:items-start">
          <div ref={cardRef} className="group flex-shrink-0 w-72 sm:w-96 md:w-[28rem] lg:w-[34rem] aspect-[2/3] overflow-hidden border relative poster-in"
            style={{ borderColor: "var(--border-c)", borderRadius: "calc(var(--radius-base)*1.3)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }} data-testid="detail-poster">
            {hasImg ? (
              <img src={posterSrc} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "linear-gradient(160deg, var(--bg-secondary), var(--bg-primary))" }}>
                <span className="font-display text-8xl" style={{ color: "var(--brand)" }}>{item.kanji || item.title[0]}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
              <p className="font-display text-2xl" style={{ color: "#fff" }}>{item.title}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Stationexus 天</p>
            </div>
          </div>

          <div className="w-full md:flex-1 min-w-0 fade-up" style={{ animationDelay: ".12s" }}>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-[11px] uppercase tracking-widest px-2 py-0.5" style={{ background: "var(--brand)", color: "var(--bg-primary)" }} data-testid="detail-category">{catLabel}</span>
              <span className="font-display text-2xl" style={{ color: "var(--brand)" }}>{item.kanji}</span>
              {(() => {
                const st = item.status || (item.coming_soon ? "a_venir" : "");
                const META = { en_cours: { label: "En cours", bg: "#ff7a00", fg: "#1a0f00" }, a_venir: { label: "À venir", bg: "#4d8dff", fg: "#00122e" }, termine: { label: "✓ Terminé", bg: "#00e5a0", fg: "#04241a" } }[st];
                return META ? <span data-testid="detail-status-badge" className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold" style={{ background: META.bg, color: META.fg }}>{META.label}</span> : null;
              })()}
              {item.is_paid && (access ? (
                <span data-testid="detail-owned-badge" className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)" }}>✓ Débloqué</span>
              ) : (
                <span data-testid="detail-price-badge" className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold border" style={{ borderColor: "var(--brand)", color: "var(--brand)" }}>{Number(item.price_eur || 0).toFixed(2)}€</span>
              ))}
              {item.coming_soon && <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest border" style={{ borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.75)" }}>À venir</span>}
              {item.coming_soon && [item.release_month, item.release_year].filter(Boolean).length > 0 && (
                <span data-testid="detail-release" className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)" }}>
                  Sortie · {[item.release_month, item.release_year].filter(Boolean).join(" ")}
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-none break-words" style={{ color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.6)" }} data-testid="detail-title">{item.title}</h1>
            <p className="mt-3 text-base md:text-lg" style={{ color: "rgba(255,255,255,0.9)" }}>{item.tagline}</p>
            <p className="mt-5 leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.72)" }}>{item.synopsis}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {!item.coming_soon && (
                <button data-testid="detail-launch" onClick={launch}
                  className={`flex items-center gap-2 ${btnSizeCls} font-semibold transition-transform hover:scale-105`}
                  style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}>
                  {item.launch_type === "chapters" ? <IoBookOutline size={20} /> : item.launch_type === "film" ? <IoFilmOutline size={20} /> : <IoPlay size={20} />} {item.launch_type === "chapters" && canResume ? `Reprendre · ch. ${(savedProgress.chapter || 0) + 1}` : (item.launch_label || "Lancer")}
                </button>
              )}
              {item.buy_url && (
                <a data-testid="detail-buy" href={item.buy_url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-2 ${secondaryBtnCls} border font-medium`} style={btn}>
                  <IoCart size={18} /> Acheter
                </a>
              )}
              {item.has_audio && (
                <button data-testid="detail-ambient" onClick={() => { sfx("nav"); playAmbient(item.id); }}
                  className={`flex items-center gap-2 ${secondaryBtnCls} border font-medium`} style={{ ...btn, color: thisPlaying ? "var(--brand)" : "var(--text-primary)" }}>
                  {thisPlaying ? <IoPause size={18} /> : <IoMusicalNotes size={18} />} Ambiance
                </button>
              )}
              <ShareMenu item={item} cardRef={cardRef} prominent testid="detail-share-prominent"
                className={`flex items-center gap-2 ${secondaryBtnCls} border font-medium transition-transform hover:scale-105`} style={btn} />
              <button data-testid="detail-favorite" onClick={() => { sfx("nav"); toggleFavorite(item.id); }}
                className={`flex items-center gap-2 ${secondaryBtnCls} border font-medium transition-transform hover:scale-105`}
                style={{ ...btn, color: isFavorite(item.id) ? "var(--brand)" : "var(--text-primary)" }}>
                {isFavorite(item.id) ? <IoHeart size={18} /> : <IoHeartOutline size={18} />} {isFavorite(item.id) ? "Favori" : "Favoris"}
              </button>
            </div>

            {/* Reprise de lecture — prochain chapitre/épisode à regarder */}
            {continueTarget && (
              <button data-testid="detail-continue" onClick={continueTarget.onOpen}
                className="group mt-7 w-full flex items-center gap-4 text-left overflow-hidden transition-transform hover:scale-[1.01] movix-pop"
                style={{ borderRadius: "calc(var(--radius-base)*1.3)", border: "1px solid color-mix(in srgb, var(--brand) 45%, transparent)", background: "linear-gradient(100deg, color-mix(in srgb, var(--brand) 20%, var(--bg-secondary)), var(--bg-secondary) 60%, var(--bg-primary))", boxShadow: "var(--shadow-1)" }}>
                <div className="relative flex-shrink-0 w-28 sm:w-44 self-stretch overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {continueTarget.image ? <img src={continueTarget.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    : <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--bg-secondary), rgba(0,0,0,0.8))" }}><span className="font-display text-4xl" style={{ color: "var(--brand)" }}>{item.kanji || continueTarget.title[0]}</span></div>}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.25))" }} />
                </div>
                <div className="flex-1 min-w-0 py-3 pr-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--brand)" }}>{continueTarget.label}</p>
                  <p className="font-display text-lg md:text-2xl leading-tight mt-0.5 truncate" style={{ color: "#fff" }}>{continueTarget.badge} · {continueTarget.title}</p>
                </div>
                <span className="flex-shrink-0 mr-4 w-12 h-12 flex items-center justify-center rounded-full transition-transform group-hover:scale-110" style={{ background: "var(--brand)", color: "var(--bg-primary)" }}><IoPlay size={24} /></span>
              </button>
            )}

            {/* Paywall — achat à l'unité + abonnement */}
            {isPaidLocked && !item.coming_soon && (
              <div className="mt-8 p-5" data-testid="detail-paywall"
                style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 16%, rgba(0,0,0,0.4)), rgba(0,0,0,0.4))", border: "1px solid var(--brand)", borderRadius: "var(--radius-base)" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--brand)" }}>Création payante</p>
                <p className="font-display text-2xl mb-1" style={{ color: "#fff" }}>
                  Débloque « {item.title} »{item.launch_type === "chapters" && (item.free_chapters || 0) > 0 ? ` · ${item.free_chapters} chapitre(s) gratuit(s)` : ""}
                </p>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>Accès définitif à cette création, ou soutiens le créateur avec l'abonnement (accès à tout le catalogue).</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button data-testid="detail-buy-unit" disabled={buying} onClick={buyThis}
                    className="flex items-center gap-2 px-6 py-3 font-semibold transition-transform hover:scale-105 disabled:opacity-60"
                    style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
                    <IoCart size={18} /> Acheter · {Number(item.price_eur || 0).toFixed(2)}€
                  </button>
                  {plan?.enabled && (
                    <button data-testid="detail-subscribe" disabled={buying} onClick={subscribe}
                      className="flex items-center gap-2 px-6 py-3 font-medium border transition-transform hover:scale-105 disabled:opacity-60"
                      style={{ ...btn }}>
                      ✨ S'abonner · dès {Math.min(...((plan.tiers && plan.tiers.length ? plan.tiers.map((t) => t.price_eur) : [plan.price_eur || 5])))}€/mois
                    </button>
                  )}
                </div>
              </div>
            )}

            {item.launch_type === "chapters" && (item.chapters?.length > 0) && (
              <MovixSelector
                testid="detail-chapters"
                mode={item.unit_display || "movix"}
                label={item.unit_label || "Chapitres"}
                kanji={item.kanji || "章"}
                items={item.chapters.map((c, i) => ({
                  key: c.id || i,
                  image: c.image,
                  title: c.title || `Chapitre ${i + 1}`,
                  description: c.description,
                  badge: `Ch. ${String(i + 1).padStart(2, "0")}`,
                  locked: chapterLocked(item, i),
                  music: c.has_music,
                  active: savedProgress && (savedProgress.chapter || 0) === i,
                  note: (savedProgress && (savedProgress.chapter || 0) === i) ? "▸ En cours de lecture" : "",
                  onOpen: () => openChapter(i),
                }))}
              />
            )}

            {(showEpisodes || item.launch_type === "episodes") && item.episodes?.length > 0 && (
              <MovixSelector
                testid="detail-episodes"
                mode={item.unit_display || "movix"}
                label={item.unit_label || "Épisodes"}
                kanji={item.kanji || "話"}
                items={item.episodes.map((ep, i) => ({
                  key: ep.id || i,
                  image: ep.image,
                  title: ep.title || `Épisode ${i + 1}`,
                  description: ep.description,
                  badge: `N° ${String(i + 1).padStart(2, "0")}`,
                  onOpen: () => openEpisode(i),
                }))}
              />
            )}

            {/* Bande-annonce (inline, comme la galerie) */}
            {trailerSource && (
              <div className="mt-10" data-testid="detail-trailer-section">
                <h3 className="font-display text-xl mb-3 flex items-center gap-2" style={{ color: "#fff" }}><IoFilmOutline style={{ color: "var(--brand)" }} /> Bande-annonce</h3>
                <div className="aspect-video w-full max-w-2xl overflow-hidden border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", background: "#000", boxShadow: "var(--shadow-1)" }}>
                  {trailerSource.type === "video"
                    ? <video data-testid="trailer-video" src={trailerSource.src} controls playsInline className="w-full h-full" />
                    : <iframe data-testid="trailer-iframe" src={trailerSource.src} title="Bande-annonce" className="w-full h-full" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />}
                </div>
              </div>
            )}

            {/* Gallery */}
            {item.gallery?.length > 0 && (
              <div className="mt-10" data-testid="detail-gallery">
                <h3 className="font-display text-xl mb-3" style={{ color: "#fff" }}>Galerie</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {item.gallery.map((g, i) => (
                    <button key={i} onClick={() => { sfx("nav"); setLightbox(g); }} data-testid={`gallery-img-${i}`}
                      className="aspect-square overflow-hidden border transition-transform hover:scale-[1.03]" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
                      <img src={g} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Embeds / réseaux */}
            {item.embeds?.length > 0 && (
              <div className="mt-10" data-testid="detail-embeds">
                <h3 className="font-display text-xl mb-3" style={{ color: "#fff" }}>Sur les réseaux</h3>
                <div className="space-y-4">
                  {item.embeds.map((em, i) => {
                    const yt = em.platform === "youtube" ? ytEmbed(em.url) : null;
                    if (yt) return (
                      <div key={i} className="aspect-video w-full overflow-hidden border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }} data-testid={`embed-${i}`}>
                        <iframe src={yt} title={em.label || "YouTube"} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    );
                    return (
                      <a key={i} href={em.url} target="_blank" rel="noopener noreferrer" onClick={() => sfx("nav")} data-testid={`embed-${i}`}
                        className="flex items-center gap-2 px-4 py-3 border font-medium" style={{ ...btn, background: "var(--bg-secondary)" }}>
                        {em.platform === "youtube" ? <IoLogoYoutube size={18} style={{ color: "var(--brand)" }} /> : <IoOpenOutline size={18} style={{ color: "var(--brand)" }} />}
                        {em.label || (em.platform === "wattpad" ? "Lire sur Wattpad" : em.platform === "youtube" ? "Voir sur YouTube" : "Ouvrir le lien")}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Intentions de l'auteur */}
            {item.intention_enabled && (item.intention_text || item.intention_images?.length > 0 || item.intention_file_id) && (
              <div className="mt-10" data-testid="detail-intention">
                <h3 className="font-display text-xl mb-3 flex items-center gap-2" style={{ color: "#fff" }}>
                  <IoSparklesOutline style={{ color: "var(--brand)" }} /> {item.intention_title || "Intentions de l'auteur"}
                </h3>
                {item.intention_text && (
                  <div className="space-y-3 leading-relaxed max-w-2xl mb-5" style={{ color: "rgba(255,255,255,0.75)" }} data-testid="detail-intention-text">
                    {item.intention_text.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                )}
                {item.intention_images?.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
                    {item.intention_images.map((g, i) => (
                      <button key={i} onClick={() => { sfx("nav"); setLightbox(g); }} data-testid={`intention-img-${i}`}
                        className="aspect-square overflow-hidden border transition-transform hover:scale-[1.03]" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
                        <img src={g} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                {item.intention_file_id && (
                  <a href={assetDownloadUrl(item.intention_file_id)} target="_blank" rel="noopener noreferrer" onClick={() => sfx("select")} data-testid="detail-intention-download"
                    className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold transition-transform hover:scale-105"
                    style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
                    <IoDownloadOutline size={18} /> Télécharger le dossier{item.intention_file_name ? ` · ${item.intention_file_name}` : ""}
                  </a>
                )}
              </div>
            )}

            <FicheSupport membershipActive={membershipActive} />

            <CommentsSection creationId={item.id} episodes={item.episodes || []} />

            {recommendations.length > 0 && (
              <div className="mt-14" data-testid="recommendations">
                <h3 className="font-display text-xl mb-1" style={{ color: "#fff" }}>Recommandations</h3>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>D'autres créations qui pourraient te plaire ✨</p>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {recommendations.map((r) => {
                    const rimg = r.has_poster || (r.poster && r.poster.length > 4);
                    return (
                      <button key={r.id} data-testid={`reco-${r.id}`} onClick={() => { sfx("select"); nav(`/oeuvre/${r.id}`); }}
                        className="flex-shrink-0 w-28 sm:w-32 text-left transition-transform hover:scale-105">
                        <div className="w-full aspect-[2/3] overflow-hidden border relative" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
                          {rimg ? <img src={r.poster && r.poster.length > 4 ? r.poster : posterUrl(r.id, r.updated_at)} alt={r.title} loading="lazy" className="w-full h-full object-cover" /> : (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(160deg, var(--bg-secondary), var(--bg-primary))" }}>
                              <span className="font-display text-4xl" style={{ color: "var(--brand)" }}>{r.kanji || r.title[0]}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "rgba(255,255,255,0.85)" }}>{r.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="mt-14 pt-6 border-t text-xs leading-relaxed text-center" style={{ borderColor: "var(--border-c)", color: "var(--text-secondary)" }} data-testid="fiche-copyright">
              {siteSettings?.copyright_notice || "© Stationexus — Toutes les créations sont protégées par le droit d'auteur. Toute reproduction ou diffusion sans autorisation est interdite. Merci de respecter le travail de l'artiste. 💛"}
            </p>
          </div>
        </div>
      </div>

      {gateOpen && <LaunchGate onClose={() => setGateOpen(false)} />}

      {readerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }} data-testid="reader-modal">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto border p-8" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>{item.title}</h2>
              <button data-testid="reader-close" onClick={() => setReaderOpen(false)} style={{ color: "var(--text-secondary)" }}><IoClose size={24} /></button>
            </div>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-primary)" }}>{item.launch_content || "Contenu à venir."}</p>
          </div>
        </div>
      )}

      {chaptersOpen && <ChapterReader item={item} startChapter={readerStart} onClose={() => setChaptersOpen(false)} onComment={goToComments} />}

      {cinemaKind && <CinemaPlayer item={item} kind={cinemaKind} onClose={() => setCinemaKind(null)} />}

      {gameOpen && <CosmicBunnyGame item={item} onClose={() => setGameOpen(false)} />}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }} onClick={() => setLightbox(null)} data-testid="lightbox">
          <button className="absolute top-4 right-4" style={{ color: "#fff" }} onClick={() => setLightbox(null)}><IoClose size={28} /></button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain" />
        </div>
      )}

      <EditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} initial={item} categories={cats} onSaved={refetch} />
    </div>
  );
}
