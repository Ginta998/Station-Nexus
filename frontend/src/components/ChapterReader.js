import { useEffect, useRef, useState, useCallback } from "react";
import { IoClose, IoListOutline, IoChevronBack, IoChevronForward, IoMusicalNotes, IoPause, IoPlay, IoPlayBack, IoPlayForward, IoText, IoChatbubbleEllipsesOutline, IoShareSocialOutline } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { chapterAudioUrl, readingAudioUrl } from "@/lib/api";
import { toast } from "sonner";

function useReveal(deps) {
  const ref = useRef(null);
  useEffect(() => {
    const nodes = ref.current?.querySelectorAll("[data-reveal]");
    if (!nodes) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, deps); // eslint-disable-line
  return ref;
}

const FONTS = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: "var(--font-body)",
  display: "var(--font-display)",
  mono: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
};
const FONT_LABELS = [["serif", "Serif"], ["sans", "Sans"], ["display", "Display"], ["mono", "Mono"]];
const WIDTHS = { narrow: "max-w-xl", normal: "max-w-2xl", wide: "max-w-4xl" };

const fmtTime = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

// Floating, seekable mini-player for the reading audio (immersive track or a music cue).
function ReadingPlayer({ getAudio, title, isPlaying, onToggle }) {
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  useEffect(() => {
    const a = getAudio(); if (!a) return;
    const onTime = () => setCur(a.currentTime || 0);
    const onMeta = () => setDur(isFinite(a.duration) ? a.duration : 0);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    onMeta(); onTime();
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("durationchange", onMeta); };
  }, [getAudio]);
  const seek = (v) => { const a = getAudio(); if (a && isFinite(a.duration) && a.duration > 0) { a.currentTime = v; setCur(v); } };
  const nudge = (d) => { const a = getAudio(); if (a) seek(Math.max(0, Math.min(a.duration || 0, (a.currentTime || 0) + d))); };
  const canSeek = dur > 0;
  const ib = { color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "999px", background: "rgba(255,255,255,0.06)" };
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-2xl" data-testid="reading-player">
      <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 border" style={{ borderColor: "var(--border-c)", borderRadius: "999px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
        <button data-testid="reading-player-toggle" onClick={onToggle} className="p-2 border flex-shrink-0" style={{ ...ib, color: "var(--brand)", borderColor: "var(--brand)", background: "color-mix(in srgb, var(--brand) 14%, transparent)" }} title={isPlaying ? "Pause" : "Lecture"}>
          {isPlaying ? <IoPause size={18} /> : <IoPlay size={18} />}
        </button>
        <button data-testid="reading-player-back" onClick={() => nudge(-10)} className="p-2 border flex-shrink-0 hidden sm:block" style={ib} title="Reculer de 10 s"><IoPlayBack size={16} /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] truncate" style={{ color: "var(--text-primary)" }}>♪ {title}</span>
            <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: "var(--text-secondary)" }}>{fmtTime(cur)} / {fmtTime(dur)}</span>
          </div>
          <input data-testid="reading-player-seek" type="range" min="0" max={canSeek ? dur : 1} step="0.1" value={cur} disabled={!canSeek}
            onChange={(e) => seek(parseFloat(e.target.value))} className="w-full" style={{ accentColor: "var(--brand)", cursor: canSeek ? "pointer" : "default" }} />
        </div>
        <button data-testid="reading-player-fwd" onClick={() => nudge(10)} className="p-2 border flex-shrink-0 hidden sm:block" style={ib} title="Avancer de 10 s"><IoPlayForward size={16} /></button>
      </div>
    </div>
  );
}

export default function ChapterReader({ item, onClose, startChapter = null, onComment }) {
  const {
    playReadingUrl, toggleReadingUrl, pauseReading, resumeReading, getReadingAudio, endReading, isPlaying, playingId, sfx,
    readerFont, setReaderFont, readerSize, setReaderSize, readerLine, setReaderLine,
    readerWidth, setReaderWidth, readerDropcap, setReaderDropcap,
  } = useApp();
  const chapters = item.chapters || [];
  const progressKey = "sx_progress_" + item.id;
  const saved = (() => { try { return JSON.parse(localStorage.getItem(progressKey) || "null"); } catch (_) { return null; } })();
  const useStart = Number.isInteger(startChapter);
  const [idx, setIdx] = useState(() => {
    const clamp = (n) => Math.min(Math.max(n, 0), Math.max(chapters.length - 1, 0));
    if (useStart) return clamp(startChapter);
    return saved && Number.isInteger(saved.chapter) ? clamp(saved.chapter) : 0;
  });
  const [toc, setToc] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [trackTitle, setTrackTitle] = useState("Musique de lecture");
  const scrollRef = useRef(null);
  const resumeRatio = useRef(!useStart && saved && typeof saved.ratio === "number" && saved.ratio > 0.02 ? saved.ratio : null);
  const lastSave = useRef(0);
  const chap = chapters[idx];
  const contentRef = useReveal([idx]);
  const readingKey = "reading:" + item.id;
  // any reading audio playing (immersive track OR an inline music cue)
  const anyMusicOn = isPlaying && (playingId === readingKey || (typeof playingId === "string" && playingId.startsWith("cue:")));
  const hasCues = /sx-music-cue/.test(chapters[idx]?.content || "");

  useEffect(() => { setShowPlayer(false); setTrackTitle("Musique de lecture"); }, [idx]);
  useEffect(() => { if (anyMusicOn) setShowPlayer(true); }, [anyMusicOn]);

  const trackFor = useCallback((c) => {
    if (c?.has_music && c?.id) return chapterAudioUrl(item.id, c.id);
    if (item.has_reading_audio) return readingAudioUrl(item.id);
    return null;
  }, [item]);

  const saveProgress = useCallback((ratio) => {
    try { localStorage.setItem(progressKey, JSON.stringify({ chapter: idx, ratio, t: Date.now() })); } catch (_) {}
  }, [progressKey, idx]);

  // start reading music on open, switch track when chapter changes (fade + dedupe)
  useEffect(() => {
    playReadingUrl(trackFor(chapters[idx]), readingKey);
    // eslint-disable-next-line
  }, [idx]);
  useEffect(() => () => endReading(item.id, item.has_audio), []); // eslint-disable-line
  useEffect(() => {
    if (!useStart && saved && ((saved.chapter || 0) > 0 || (saved.ratio || 0) > 0.02)) {
      toast.success(`Reprise au chapitre ${(saved.chapter || 0) + 1}`, { duration: 2500 });
    }
  }, []); // eslint-disable-line

  // resume scroll position on the first chapter shown, otherwise reset to top
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    if (resumeRatio.current != null) {
      const r = resumeRatio.current; resumeRatio.current = null;
      const t = setTimeout(() => { const max = el.scrollHeight - el.clientHeight; if (max > 0) el.scrollTo({ top: max * r }); }, 400);
      return () => clearTimeout(t);
    }
    el.scrollTo({ top: 0 });
    saveProgress(0);
  }, [idx]); // eslint-disable-line

  const onScroll = useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const ratio = max > 0 ? el.scrollTop / max : 0;
    setProgress(Math.min(100, ratio * 100));
    const now = Date.now();
    if (now - lastSave.current > 800) { lastSave.current = now; saveProgress(ratio); }
  }, [saveProgress]);

  const close = () => { endReading(item.id, item.has_audio); onClose(); };
  const go = (d) => { sfx("nav"); setIdx((i) => Math.min(Math.max(i + d, 0), chapters.length - 1)); setToc(false); };

  // music cues placed inline in the chapter — reader taps to play (no loop, fades over previous)
  const onCueClick = (e) => {
    const cue = e.target.closest && e.target.closest(".sx-music-cue");
    if (!cue) return;
    e.preventDefault();
    const url = cue.getAttribute("data-track");
    if (!url) return;
    sfx("select");
    setTrackTitle(cue.getAttribute("data-title") || "Musique");
    setShowPlayer(true);
    toggleReadingUrl(url, "cue:" + url, { loop: false });
  };
  // reflect play/pause state on the cue chips
  useEffect(() => {
    const root = contentRef.current; if (!root) return;
    root.querySelectorAll(".sx-music-cue").forEach((el) => {
      const url = el.getAttribute("data-track");
      el.setAttribute("data-active", (playingId === "cue:" + url && isPlaying) ? "1" : "0");
    });
  }, [playingId, isPlaying, idx]); // eslint-disable-line

  const wantComment = () => { sfx("select"); onComment ? (endReading(item.id, item.has_audio), onComment()) : toast.info("Commentaires disponibles sur la fiche."); };
  const shareCreation = async () => {
    sfx("nav");
    const url = window.location.href;
    try { if (navigator.share) { await navigator.share({ title: item.title, text: item.tagline || "", url }); return; } } catch (_) {}
    try { await navigator.clipboard.writeText(url); toast.success("Lien copié — partage-le !"); } catch (_) { toast.info(url); }
  };
  const hasMusic = !!trackFor(chap);
  const paras = (chap?.content || "").split(/\n{2,}/).filter(Boolean);

  const articleStyle = { fontFamily: FONTS[readerFont] || FONTS.serif, fontSize: `${readerSize}px`, lineHeight: readerLine, color: "var(--text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex flex-col reader-root" style={{ background: "var(--bg-primary)" }} data-testid="chapter-reader">
      <div className="reader-aurora" aria-hidden="true" />
      <div className="reader-vignette" aria-hidden="true" />

      <div className="absolute top-0 left-0 h-1 z-20" style={{ width: `${progress}%`, background: "var(--brand)", transition: "width 0.15s linear" }} />

      {/* header */}
      <div className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3 border-b" style={{ borderColor: "var(--border-c)", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)" }}>
        <button data-testid="reader-toc-toggle" onClick={() => { sfx("nav"); setToc((v) => !v); }} className="flex items-center gap-2 px-3.5 py-2.5 border text-base" style={{ color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", background: "rgba(255,255,255,0.06)" }}>
          <IoListOutline size={24} /> <span className="hidden sm:inline">Sommaire</span>
        </button>
        <p className="font-display text-base md:text-lg truncate px-2" style={{ color: "var(--text-primary)" }}>{item.title}</p>
        <div className="flex items-center gap-2">
          <button data-testid="reader-prefs-toggle" onClick={() => { sfx("nav"); setPrefs((v) => !v); }} className="p-2.5 border flex items-center" style={{ color: prefs ? "var(--brand)" : "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", background: "rgba(255,255,255,0.06)" }} title="Réglages de lecture">
            <IoText size={22} />
          </button>
          {(hasMusic || hasCues || anyMusicOn) && (
            <button data-testid="reader-music" onClick={() => { sfx("nav"); if (anyMusicOn) pauseReading(); else { setTrackTitle("Musique de lecture"); setShowPlayer(true); toggleReadingUrl(trackFor(chap), readingKey); } }} className="p-2.5 border" style={{ color: anyMusicOn ? "var(--brand)" : "var(--text-secondary)", borderColor: anyMusicOn ? "var(--brand)" : "var(--border-c)", borderRadius: "var(--radius-base)", background: anyMusicOn ? "color-mix(in srgb, var(--brand) 16%, transparent)" : "rgba(255,255,255,0.06)" }} title={anyMusicOn ? "Couper la musique" : "Musique de lecture"}>
              {anyMusicOn ? <IoPause size={24} /> : <IoMusicalNotes size={24} />}
            </button>
          )}
          <button data-testid="reader-close" onClick={close} className="p-2.5 border" style={{ color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", background: "rgba(255,255,255,0.06)" }}><IoClose size={26} /></button>
        </div>
      </div>

      {/* reading preferences panel */}
      {prefs && (
        <div className="absolute right-3 top-16 z-30 w-72 max-w-[88vw] border p-4 fade-up" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }} data-testid="reader-prefs">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Police</p>
          <div className="grid grid-cols-4 gap-1 mb-4">
            {FONT_LABELS.map(([k, l]) => (
              <button key={k} data-testid={`reader-font-${k}`} onClick={() => setReaderFont(k)} className="px-1 py-1.5 border text-xs" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", fontFamily: FONTS[k], outline: readerFont === k ? "2px solid var(--brand)" : "none" }}>{l}</button>
            ))}
          </div>
          <label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Taille ({readerSize}px)</label>
          <input data-testid="reader-size" type="range" min="15" max="28" step="1" value={readerSize} onChange={(e) => setReaderSize(parseInt(e.target.value))} className="w-full mt-1 mb-3" style={{ accentColor: "var(--brand)" }} />
          <label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Interligne ({readerLine.toFixed(1)})</label>
          <input data-testid="reader-line" type="range" min="1.3" max="2.6" step="0.1" value={readerLine} onChange={(e) => setReaderLine(parseFloat(e.target.value))} className="w-full mt-1 mb-3" style={{ accentColor: "var(--brand)" }} />
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Largeur</p>
          <div className="grid grid-cols-3 gap-1 mb-4">
            {[["narrow", "Étroit"], ["normal", "Normal"], ["wide", "Large"]].map(([k, l]) => (
              <button key={k} data-testid={`reader-width-${k}`} onClick={() => setReaderWidth(k)} className="px-1 py-1.5 border text-xs" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", outline: readerWidth === k ? "2px solid var(--brand)" : "none" }}>{l}</button>
            ))}
          </div>
          <label className="flex items-center justify-between cursor-pointer" data-testid="reader-dropcap">
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>Lettrine</span>
            <input type="checkbox" checked={readerDropcap} onChange={(e) => setReaderDropcap(e.target.checked)} style={{ accentColor: "var(--brand)", width: 18, height: 18 }} />
          </label>
        </div>
      )}

      <div className="relative z-10 flex-1 flex overflow-hidden">
        {toc && (
          <div className="absolute md:relative z-10 w-72 max-w-[80%] h-full overflow-y-auto border-r p-4 fade-up" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", borderColor: "var(--border-c)" }} data-testid="reader-toc">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>Chapitres</p>
            {chapters.map((c, i) => (
              <button key={c.id || i} onClick={() => { sfx("select"); setIdx(i); setToc(false); }}
                className="flex items-center justify-between w-full text-left px-3 py-2 mb-1 text-sm transition-colors" style={{ background: i === idx ? "var(--brand)" : "transparent", color: i === idx ? "var(--bg-primary)" : "var(--text-primary)", borderRadius: "var(--radius-base)" }}>
                <span className="truncate">{c.title}</span>
                {c.has_music && <IoMusicalNotes size={13} className="flex-shrink-0 ml-2" />}
              </button>
            ))}
          </div>
        )}

        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto" data-testid="reader-pane">
          <article key={idx} ref={contentRef} className={`chapter-in ${WIDTHS[readerWidth] || WIDTHS.normal} mx-auto px-5 md:px-8 py-10 md:py-16`} style={{ ...articleStyle, paddingBottom: showPlayer ? 104 : undefined }}>
            <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "var(--brand)" }}>Chapitre {idx + 1} · {chapters.length}</p>
            <h1 data-reveal className="reveal font-display leading-tight mb-8" style={{ fontSize: "1.9em", color: "var(--text-primary)" }}>{chap?.title}</h1>
            {chap?.image ? (
              <div data-reveal className="reveal reader-kenburns mb-10 overflow-hidden border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
                <img src={chap.image} alt="" className="w-full" />
              </div>
            ) : null}

            {chap?.rich ? (
              <div data-reveal className="reveal reader-rich" data-dropcap={readerDropcap ? "on" : "off"} onClick={onCueClick} dangerouslySetInnerHTML={{ __html: chap.content || "" }} />
            ) : (
              <>
                {paras.map((p, i) => (
                  <p key={i} data-reveal className={`reveal mb-6 ${i === 0 && readerDropcap ? "reader-dropcap" : ""}`} style={{ opacity: 0.94 }}>{p}</p>
                ))}
                {paras.length === 0 && <p className="reveal" style={{ color: "var(--text-secondary)" }}>Chapitre à venir.</p>}
              </>
            )}

            <div className="flex items-center justify-center my-10">
              <span className="font-display text-2xl" style={{ color: "var(--brand)", opacity: 0.5 }}>❧</span>
            </div>

            {/* end-of-chapter engagement */}
            <div data-reveal className="reveal text-center px-4 py-8 mb-4" data-testid="reader-engagement"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)" }}>
              <p className="font-display mb-1" style={{ fontSize: "1.35em", color: "var(--text-primary)" }}>
                {idx >= chapters.length - 1 ? "Fin du chapitre — et fin pour l'instant !" : "Fin de ce chapitre"}
              </p>
              <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                Ce chapitre t'a plu ? Laisse un petit commentaire ou partage « {item.title} » — ça aide énormément la création à vivre. ✨
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button data-testid="reader-comment" onClick={wantComment}
                  className="flex items-center gap-2 px-5 py-2.5 font-semibold transition-transform hover:scale-105"
                  style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
                  <IoChatbubbleEllipsesOutline size={18} /> Commenter
                </button>
                <button data-testid="reader-share" onClick={shareCreation}
                  className="flex items-center gap-2 px-5 py-2.5 border font-medium transition-transform hover:scale-105"
                  style={{ borderColor: "var(--border-c)", color: "var(--text-primary)", borderRadius: "var(--radius-base)" }}>
                  <IoShareSocialOutline size={18} /> Partager
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-8 border-t" style={{ borderColor: "var(--border-c)" }}>
              <button data-testid="reader-prev" disabled={idx === 0} onClick={() => go(-1)} className="flex items-center gap-1.5 px-4 py-2.5 border disabled:opacity-30 transition-transform hover:scale-105" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", fontSize: "14px" }}>
                <IoChevronBack /> Précédent
              </button>
              <button data-testid="reader-next" disabled={idx >= chapters.length - 1} onClick={() => go(1)} className="flex items-center gap-1.5 px-4 py-2.5 font-semibold disabled:opacity-30 transition-transform hover:scale-105" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", fontSize: "14px" }}>
                Suivant <IoChevronForward />
              </button>
            </div>
          </article>
        </div>
      </div>

      {showPlayer && (
        <ReadingPlayer getAudio={getReadingAudio} title={trackTitle} isPlaying={anyMusicOn}
          onToggle={() => { sfx("nav"); if (anyMusicOn) pauseReading(); else resumeReading(); }} />
      )}
    </div>
  );
}
