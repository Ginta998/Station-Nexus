import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IoArrowForward, IoChatbubbleEllipsesOutline, IoClose } from "react-icons/io5";
import { Reader, htmlToAlexBlocks } from "@/components/atelier/Alexandrie";
import { useApp } from "@/context/AppContext";
import { chapterAudioUrl, readingAudioUrl, mediaUrl } from "@/lib/api";
import { blocksToHtml } from "@/lib/blocks";

/*
  Un seul lecteur pour toute la station en Nexus : celui d'Alexandrie.
  Chapitres, épisodes en texte, extraits et entrées du journal de bord s'y lisent en livre, en cassette ou en disque.
  Améliorer le lecteur d'Alexandrie améliore donc toutes les lectures.
  Musique : celle du chapitre, sinon celle de l'œuvre, et les musiques insérées dans le texte ; jamais deux à la fois.
*/

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unitHtml = (u) => (u.rich ? u.content || "" : String(u.content || "").split(/\n{2,}/).filter((p) => p.trim()).map((p) => `<p>${esc(p).replace(/\n/g, "<br/>")}</p>`).join(""));
const words = (chs) => chs.reduce((n, c) => n + c.blocks.reduce((m, b) => m + String(b.x || "").split(/\s+/).filter(Boolean).length, 0), 0);
export const READER_FORMATS = [["livre", "Livre"], ["vhs", "VHS"], ["vinyle", "Vinyle"]];
// Le thème de page vient des ambiances d'Alexandrie ; par défaut, celle qui va avec le thème du monde
export const LOOK_OF_WORLD = { cinema: "ombre", vhs: "terminal", arcade: "neon", yorha: "didone", eve: "cosmos", hero: "manga", cathedrale: "gothique", couronne: "cendre", trait: "manga", sengoku: "washi", survivance: "brume", cristal: "givre" };

// Œuvre → livre d'Alexandrie (un chapitre du livre par chapitre ou épisode lisible)
export function bookOfCreation(item, { unitKey, catLabel, format, locked, look }) {
  const word = unitKey === "episodes" ? "Épisode" : "Chapitre";
  const units = unitKey ? item[unitKey] || [] : [{ title: "", content: item.launch_content, rich: false }];
  const map = []; const chapters = []; let held = false;
  units.forEach((u, i) => {
    if (unitKey === "episodes" && !String(u.content || "").trim()) return; // un épisode vidéo garde son lecteur vidéo
    if (locked?.(i)) { held = true; return; }
    const blocks = htmlToAlexBlocks(unitHtml(u));
    map.push(i); chapters.push({ title: unitKey ? u.title || `${word} ${i + 1}` : "", blocks: blocks.length ? blocks : [{ t: "p", x: "Ce texte est encore vide." }] });
  });
  if (held) chapters.push({ title: "La suite", blocks: [{ t: "box", label: "RÉSERVÉ", x: "Les chapitres suivants se débloquent avec l'achat de l'œuvre ou l'abonnement : « Débloquer », dans le menu de l'œuvre." }] });
  return {
    map,
    book: { id: `sn:${item.id}:${unitKey || "texte"}`, title: item.title, sub: item.tagline || "", room: "station", roomLabel: catLabel || "Station", type: "recit", about: item.synopsis || "",
      cote: `SN-${String((item.order ?? 0) + 1).padStart(3, "0")}`, format, house: "STATION NEXUS", chapters, words: words(chapters), links: [], ...(look ? { look: { theme: look } } : {}) },
  };
}
// Entrée du journal de bord → livre d'Alexandrie
export function bookOfEntry(e) {
  const html = (e.blocks || []).length ? blocksToHtml(e.blocks) : String(e.body || "").split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("");
  const blocks = htmlToAlexBlocks(html);
  const chapters = [{ title: "", blocks: blocks.length ? blocks : [{ t: "p", x: "Cette entrée est encore vide." }] }];
  return { id: `jr:${e.id}`, title: e.title, sub: e.subtitle || "", room: "journal", roomLabel: "Journal de bord", type: "recit", about: "", cote: String(e.date || "").slice(0, 10) || "JOURNAL",
    format: e.format || "livre", house: "JOURNAL DE BORD", chapters, words: words(chapters), links: [], look: { theme: e.look || "presse" } };
}

export default function WorkReader({ item, entry, unitKey = "chapters", catLabel, format = "livre", look, cover, startUnit = null, resume = false, locked, onClose, next, nextCover, onNext, onComment, onEditUnit, noPdf = true }) {
  const [ended, setEnded] = useState(false); // fin de l'œuvre : écran de fin et œuvre suivante
  const { playReadingUrl, toggleReadingUrl, pauseReading, endReading, isPlaying, playingId } = useApp();
  const built = useMemo(() => (entry ? { book: bookOfEntry(entry), map: [0] } : bookOfCreation(item, { unitKey, catLabel, format, locked, look })), [item, entry, unitKey, catLabel, format, look]); // eslint-disable-line react-hooks/exhaustive-deps
  const { book, map } = built;
  const owner = entry ? entry.id : item.id;
  const readingKey = "reading:" + owner;
  const startCh = startUnit == null ? null : Math.max(0, map.indexOf(startUnit));
  const [ci, setCi] = useState(startCh ?? 0);
  const [title, setTitle] = useState("Musique de lecture");
  const trackFor = (c) => {
    if (entry || !item) return null;
    const u = unitKey ? item[unitKey]?.[map[c]] : null;
    if (unitKey === "chapters" && u?.has_music && u?.id) return chapterAudioUrl(item.id, u.id);
    if (item.has_reading_audio) return readingAudioUrl(item.id);
    return null;
  };
  // La musique du chapitre démarre à l'ouverture et change avec le chapitre (une seule à la fois)
  useEffect(() => { const t = trackFor(ci); if (t) { setTitle("Musique de lecture"); playReadingUrl(t, readingKey); } }, [ci]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => endReading(owner, !!item?.has_audio), []); // eslint-disable-line react-hooks/exhaustive-deps
  const on = isPlaying && (playingId === readingKey || (typeof playingId === "string" && playingId.startsWith("cue:")));
  const hasCue = book.chapters.some((c) => c.blocks.some((b) => b.t === "mus"));
  const music = trackFor(ci) || hasCue || on ? {
    playing: on, title,
    toggle: () => { if (on) pauseReading(); else { const t = trackFor(ci); if (t) { setTitle("Musique de lecture"); toggleReadingUrl(t, readingKey); } } },
  } : null;
  // Où l'on en est : « Reprendre » sur le menu de l'œuvre (chapitre, part lue du chapitre, première phrase de la page)
  const onProgress = (c, ratio, info = {}) => {
    if (c !== ci) setCi(c);
    if (entry || !item || !unitKey) return;
    const u = map[c]; if (u == null) return;
    const rec = { chapter: u, ratio: Math.round((info.inCh || 0) * 100) / 100, excerpt: info.excerpt || "", opened: 1, t: Date.now() };
    try {
      if (unitKey === "chapters") localStorage.setItem("sx_progress_" + item.id, JSON.stringify(rec));
      else { localStorage.setItem("sx_eplast_" + item.id, String(u)); localStorage.setItem("sx_progress_" + item.id + "_ep", JSON.stringify(rec)); }
    } catch (_) {}
  };
  const where = entry ? "STATION NEXUS / JOURNAL DE BORD" : `STATION NEXUS / ${(catLabel || "ŒUVRE").toUpperCase()} / ${item.title.toUpperCase()}`;
  const held = book.chapters.some((c) => c.title === "La suite");
  const endCard = ended && !entry && !held && createPortal(
    <div className="wr-end" role="dialog" aria-label="Fin" data-testid="work-end">
      <div className="wr-end-in">
        <button className="wr-end-x" onClick={() => setEnded(false)} aria-label="Fermer"><IoClose size={18} /></button>
        <p className="wr-end-k">FIN · {(catLabel || "").toUpperCase()}</p>
        <h2>{item.title}</h2>
        {item.tagline && <p className="wr-end-by">{item.tagline}</p>}
        <p className="wr-end-thanks">Merci d'avoir lu jusqu'au bout.</p>
        <div className="wr-end-acts">
          {onComment && <button className="wr-btn ghost" onClick={() => { setEnded(false); onComment(); }} data-testid="work-end-comment"><IoChatbubbleEllipsesOutline size={16} /> Laisser un mot à l'auteur</button>}
          <button className="wr-btn ghost" onClick={onClose}>Revenir au monde</button>
        </div>
        {next && (
          <button className="wr-next" onClick={() => onNext?.(next)} data-testid="work-end-next">
            <span className="wr-next-img" style={nextCover ? { backgroundImage: `url(${nextCover})` } : undefined} />
            <span className="wr-next-t"><small>ŒUVRE SUIVANTE</small><b>{next.title}</b>{next.tagline && <em>{next.tagline}</em>}<span className="wr-next-go">Entrer dans cet univers <IoArrowForward /></span></span>
          </button>
        )}
      </div>
    </div>, document.body);
  return (<>
    {endCard}
    <Reader book={book} cover={cover || (entry?.cover ? mediaUrl(entry.cover) : null)} onClose={onClose} backLabel={entry ? "Retour" : "Retour au monde"} path={where}
      startCh={startCh} keepSaved={resume} onProgress={onProgress} workMusic={music} noPdf={noPdf}
      onEditChapter={onEditUnit && !entry ? (c) => onEditUnit(map[c] ?? map[0] ?? 0) : undefined}
      onCue={(url, t) => { setTitle(t || "Musique"); toggleReadingUrl(mediaUrl(url), "cue:" + url, { loop: false }); }}
      onDone={() => { if (!entry) setTimeout(() => setEnded(true), 900); }} />
  </>);
}
