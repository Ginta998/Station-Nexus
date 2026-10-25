import { mediaUrl } from "@/lib/api";
import { inlineMd } from "@/lib/blocks";
import { IoMusicalNotes, IoPause } from "react-icons/io5";

export const MOIS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const fmtDate = (d) => {
  const [y, m, j] = String(d || "").slice(0, 10).split("-").map(Number);
  return y && m ? `${j || 1} ${MOIS_LONG[m - 1]} ${y}` : "";
};
export const monthLabel = (ym) => { const [y, m] = ym.split("-").map(Number); return `${MOIS_LONG[m - 1]} ${y}`; };

export const youtubeId = (url = "") => {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : "";
};

export function CategoryTag({ cat }) {
  if (!cat) return null;
  return <span className="jr-tag" style={{ "--jc": cat.color || "var(--brand)" }}>{cat.name}</span>;
}

// carte d'une entrée (liste du journal, accueil, fiche création)
export function JournalCard({ e, cat, creation, onOpen, idx = 0 }) {
  return (
    <article className="jr-card" style={{ animationDelay: `${idx * 50}ms` }} onClick={onOpen} data-testid={`journal-card-${e.id}`}>
      <div className="jr-card-img" style={e.cover ? { backgroundImage: `url(${mediaUrl(e.cover)})` } : { "--jc": cat?.color || "var(--brand)" }}>
        {!e.cover && <span className="jr-card-kj">録</span>}
        {!e.published && <span className="jr-draft">Brouillon</span>}
      </div>
      <div className="jr-card-body">
        <div className="jr-card-meta"><CategoryTag cat={cat} /><span className="mono">{fmtDate(e.date)}</span></div>
        <h3 className="jr-card-title">{e.title}</h3>
        {(e.subtitle || e.excerpt) && <p className="jr-card-ex">{e.subtitle || e.excerpt}</p>}
        {creation && <span className="jr-card-crea mono">✦ {creation.title}</span>}
      </div>
    </article>
  );
}

function Paragraphs({ text, first }) {
  return String(text || "").split(/\n{2,}/).map((p, i) => (
    <p key={i} className={first && i === 0 ? "jr-p jr-drop" : "jr-p"} dangerouslySetInnerHTML={{ __html: inlineMd(p) }} />
  ));
}

// rendu des blocs d'une entrée
export function JournalBlocks({ blocks = [], onImage, onMusic, playingUrl }) {
  let firstText = true;
  return blocks.map((b, i) => {
    const cap = b.caption ? <figcaption>{b.caption}</figcaption> : null;
    switch (b.type) {
      case "heading": return <h2 key={i} className="jr-h2">{b.text}</h2>;
      case "text": { const f = firstText; firstText = false; return <div key={i} className="jr-text"><Paragraphs text={b.text} first={f} /></div>; }
      case "music": { const on = playingUrl === mediaUrl(b.url); return b.url ? (
        <p key={i} className="jr-music-p"><button type="button" className="sx-music-cue" data-active={on ? "1" : "0"} onClick={() => onMusic?.(mediaUrl(b.url), b.caption)} data-testid={`journal-music-${i}`}>{on ? <IoPause /> : <IoMusicalNotes />} {b.caption || "Musique"}</button></p>
      ) : null; }
      case "quote": return <blockquote key={i} className="jr-quote"><p dangerouslySetInnerHTML={{ __html: inlineMd(b.text) }} />{b.author && <cite>— {b.author}</cite>}</blockquote>;
      case "image": return b.url ? <figure key={i} className={"jr-fig" + (b.wide ? " wide" : "")}><img src={mediaUrl(b.url)} alt={b.caption || ""} loading="lazy" onClick={() => onImage?.(mediaUrl(b.url))} />{cap}</figure> : null;
      case "sketch": return b.url ? <figure key={i} className="jr-sketch" style={{ "--rot": `${i % 2 ? 1.2 : -1.4}deg` }}><span className="tape" /><img src={mediaUrl(b.url)} alt={b.caption || "Croquis"} loading="lazy" onClick={() => onImage?.(mediaUrl(b.url))} />{cap}</figure> : null;
      case "gallery": return (b.urls || []).length ? (
        <figure key={i} className="jr-gal"><div className="g">{b.urls.map((u, k) => <img key={k} src={mediaUrl(u)} alt="" loading="lazy" onClick={() => onImage?.(mediaUrl(u))} />)}</div>{cap}</figure>
      ) : null;
      case "youtube": { const id = youtubeId(b.url); return id ? (
        <figure key={i} className="jr-yt"><div className="r"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={b.caption || "Vidéo"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" /></div>{cap}</figure>
      ) : null; }
      default: return null;
    }
  });
}
