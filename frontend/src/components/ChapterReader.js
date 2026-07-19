import { useEffect, useRef, useState, useCallback } from "react";
import { IoClose, IoListOutline, IoChevronBack, IoChevronForward, IoMusicalNotes, IoPause } from "react-icons/io5";
import { useApp } from "@/context/AppContext";

function useReveal(deps) {
  const ref = useRef(null);
  useEffect(() => {
    const nodes = ref.current?.querySelectorAll("[data-reveal]");
    if (!nodes) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
    }, { threshold: 0.12 });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, deps); // eslint-disable-line
  return ref;
}

export default function ChapterReader({ item, onClose }) {
  const { playAmbient, stopAmbient, isPlaying, playingId, sfx } = useApp();
  const chapters = item.chapters || [];
  const [idx, setIdx] = useState(0);
  const [toc, setToc] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef(null);
  const chap = chapters[idx];
  const contentRef = useReveal([idx]);
  const musicOn = isPlaying && playingId === item.id;

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 }); }, [idx]);
  useEffect(() => () => stopAmbient(), [stopAmbient]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
  }, []);

  const go = (d) => { sfx("nav"); setIdx((i) => Math.min(Math.max(i + d, 0), chapters.length - 1)); setToc(false); };
  const paras = (chap?.content || "").split(/\n{2,}/).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg-primary)" }} data-testid="chapter-reader">
      {/* progress */}
      <div className="absolute top-0 left-0 h-1 z-20" style={{ width: `${progress}%`, background: "var(--brand)", transition: "width 0.15s linear" }} />

      {/* header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b" style={{ borderColor: "var(--border-c)", background: "var(--bg-secondary)" }}>
        <button data-testid="reader-toc-toggle" onClick={() => { sfx("nav"); setToc((v) => !v); }} className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-primary)" }}>
          <IoListOutline size={20} /> <span className="hidden sm:inline">Sommaire</span>
        </button>
        <p className="font-display text-sm md:text-base truncate px-2" style={{ color: "var(--text-primary)" }}>{item.title}</p>
        <div className="flex items-center gap-2">
          {item.has_audio && (
            <button data-testid="reader-music" onClick={() => { sfx("nav"); playAmbient(item.id); }} className="p-2" style={{ color: musicOn ? "var(--brand)" : "var(--text-secondary)" }} title="Musique d'immersion">
              {musicOn ? <IoPause size={18} /> : <IoMusicalNotes size={18} />}
            </button>
          )}
          <button data-testid="reader-close" onClick={() => { stopAmbient(); onClose(); }} className="p-2" style={{ color: "var(--text-primary)" }}><IoClose size={22} /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* TOC drawer */}
        {toc && (
          <div className="absolute md:relative z-10 w-72 max-w-[80%] h-full overflow-y-auto border-r p-4 fade-up" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-c)" }} data-testid="reader-toc">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>Chapitres</p>
            {chapters.map((c, i) => (
              <button key={c.id || i} onClick={() => { sfx("select"); setIdx(i); setToc(false); }}
                className="block w-full text-left px-3 py-2 mb-1 text-sm" style={{ background: i === idx ? "var(--brand)" : "transparent", color: i === idx ? "var(--bg-primary)" : "var(--text-primary)", borderRadius: "var(--radius-base)" }}>
                {c.title}
              </button>
            ))}
          </div>
        )}

        {/* reading pane (webtoon vertical) */}
        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto" data-testid="reader-pane">
          <article ref={contentRef} className="max-w-2xl mx-auto px-5 md:px-8 py-10 md:py-16">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>Chapitre {idx + 1} / {chapters.length}</p>
            <h1 data-reveal className="reveal font-display text-3xl md:text-5xl leading-tight mb-8" style={{ color: "var(--text-primary)" }}>{chap?.title}</h1>
            {chap?.image ? (
              <img data-reveal src={chap.image} alt="" className="reveal w-full mb-8 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }} />
            ) : null}
            {paras.map((p, i) => (
              <p key={i} data-reveal className="reveal text-lg md:text-xl leading-loose mb-6" style={{ color: "var(--text-primary)", opacity: 0.92 }}>{p}</p>
            ))}
            {paras.length === 0 && <p className="reveal text-lg" style={{ color: "var(--text-secondary)" }}>Chapitre à venir.</p>}

            <div className="flex items-center justify-between mt-12 pt-8 border-t" style={{ borderColor: "var(--border-c)" }}>
              <button data-testid="reader-prev" disabled={idx === 0} onClick={() => go(-1)} className="flex items-center gap-1.5 px-4 py-2.5 border disabled:opacity-30" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)" }}>
                <IoChevronBack /> Précédent
              </button>
              <button data-testid="reader-next" disabled={idx >= chapters.length - 1} onClick={() => go(1)} className="flex items-center gap-1.5 px-4 py-2.5 font-semibold disabled:opacity-30" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
                Suivant <IoChevronForward />
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
