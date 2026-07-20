import { useEffect, useRef, useState, useCallback } from "react";
import { IoClose, IoListOutline, IoChevronBack, IoChevronForward, IoMusicalNotes, IoPause, IoText } from "react-icons/io5";
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

export default function ChapterReader({ item, onClose }) {
  const {
    playReadingUrl, toggleReadingUrl, endReading, isPlaying, playingId, sfx,
    readerFont, setReaderFont, readerSize, setReaderSize, readerLine, setReaderLine,
    readerWidth, setReaderWidth, readerDropcap, setReaderDropcap,
  } = useApp();
  const chapters = item.chapters || [];
  const progressKey = "sx_progress_" + item.id;
  const saved = (() => { try { return JSON.parse(localStorage.getItem(progressKey) || "null"); } catch (_) { return null; } })();
  const [idx, setIdx] = useState(() => saved && Number.isInteger(saved.chapter) ? Math.min(Math.max(saved.chapter, 0), Math.max(chapters.length - 1, 0)) : 0);
  const [toc, setToc] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef(null);
  const resumeRatio = useRef(saved && typeof saved.ratio === "number" && saved.ratio > 0.02 ? saved.ratio : null);
  const lastSave = useRef(0);
  const chap = chapters[idx];
  const contentRef = useReveal([idx]);
  const readingKey = "reading:" + item.id;
  const musicOn = isPlaying && playingId === readingKey;

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
    if (saved && ((saved.chapter || 0) > 0 || (saved.ratio || 0) > 0.02)) {
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
        <button data-testid="reader-toc-toggle" onClick={() => { sfx("nav"); setToc((v) => !v); }} className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-primary)" }}>
          <IoListOutline size={20} /> <span className="hidden sm:inline">Sommaire</span>
        </button>
        <p className="font-display text-sm md:text-base truncate px-2" style={{ color: "var(--text-primary)" }}>{item.title}</p>
        <div className="flex items-center gap-2">
          <button data-testid="reader-prefs-toggle" onClick={() => { sfx("nav"); setPrefs((v) => !v); }} className="p-2 flex items-center" style={{ color: prefs ? "var(--brand)" : "var(--text-primary)" }} title="Réglages de lecture">
            <IoText size={18} />
          </button>
          {hasMusic && (
            <button data-testid="reader-music" onClick={() => { sfx("nav"); toggleReadingUrl(trackFor(chap), readingKey); }} className="p-2" style={{ color: musicOn ? "var(--brand)" : "var(--text-secondary)" }} title="Musique de lecture">
              {musicOn ? <IoPause size={18} /> : <IoMusicalNotes size={18} />}
            </button>
          )}
          <button data-testid="reader-close" onClick={close} className="p-2" style={{ color: "var(--text-primary)" }}><IoClose size={22} /></button>
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
          <article key={idx} ref={contentRef} className={`chapter-in ${WIDTHS[readerWidth] || WIDTHS.normal} mx-auto px-5 md:px-8 py-10 md:py-16`} style={articleStyle}>
            <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "var(--brand)" }}>Chapitre {idx + 1} · {chapters.length}</p>
            <h1 data-reveal className="reveal font-display leading-tight mb-8" style={{ fontSize: "1.9em", color: "var(--text-primary)" }}>{chap?.title}</h1>
            {chap?.image ? (
              <div data-reveal className="reveal reader-kenburns mb-10 overflow-hidden border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
                <img src={chap.image} alt="" className="w-full" />
              </div>
            ) : null}

            {chap?.rich ? (
              <div data-reveal className="reveal reader-rich" data-dropcap={readerDropcap ? "on" : "off"} dangerouslySetInnerHTML={{ __html: chap.content || "" }} />
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
    </div>
  );
}
