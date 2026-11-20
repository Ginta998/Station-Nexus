import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IoArrowForward, IoChatbubbleEllipsesOutline, IoClose } from "react-icons/io5";
import { Reader, htmlToAlexBlocks } from "@/components/atelier/AlexCore";
import { useApp } from "@/context/AppContext";
import { chapterAudioUrl, readingAudioUrl, mediaUrl, hit } from "@/lib/api";
import { markDone } from "@/lib/shelf";
import PassageLayer from "@/components/nexus/PassageLayer";
import { blocksToHtml } from "@/lib/blocks";
import { useRadio, RadioEngine, Progress, artOf } from "@/components/atelier/Radio";
import { IoPause, IoPlay, IoPlaySkipForward, IoVolumeHigh, IoVolumeMute, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { holdAmbient } from "@/lib/ambient";

const PUB_AT = { pub: true, config: { radio: [] }, saveConfig: async () => {} };
const YT = /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/;

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

// Barre de musique pendant la lecture : avancée, pause, suivant, volume, réduire, couper
function ReaderPlayer({ r }) {
  const [min, setMin] = useState(false);
  if (!r.pl) return null;
  const i = r.info;
  return createPortal(
    <div className={"wr-player" + (min ? " min" : "")} data-testid="reader-player">
      <span className="wr-pl-art" style={{ backgroundImage: `url(${artOf(r.pl, i.vid)})` }} />
      <div className="wr-pl-mid">
        <b className="wr-pl-t">{i.title || r.pl.title}</b>
        {!min && <Progress r={r} />}
      </div>
      <button onClick={r.toggle} aria-label={r.playing ? "Pause" : "Lecture"} data-testid="reader-player-toggle">{r.playing ? <IoPause size={18} /> : <IoPlay size={18} />}</button>
      {!min && (i.n || 0) > 1 && <button onClick={r.next} aria-label="Suivant" data-testid="reader-player-next"><IoPlaySkipForward size={16} /></button>}
      {!min && <button onClick={r.mute} aria-label="Son" data-testid="reader-player-mute">{r.muted ? <IoVolumeMute size={17} /> : <IoVolumeHigh size={17} />}</button>}
      {!min && <input className="rd-vol wr-pl-vol" type="range" min="0" max="100" value={r.muted ? 0 : r.vol} onChange={(e) => r.setVol(+e.target.value)} style={{ "--p": (r.muted ? 0 : r.vol) + "%" }} data-testid="reader-player-volume" />}
      <button onClick={() => setMin(!min)} aria-label={min ? "Agrandir" : "Réduire"} data-testid="reader-player-min">{min ? <IoChevronUp size={17} /> : <IoChevronDown size={17} />}</button>
      <button onClick={r.stop} aria-label="Couper la musique" data-testid="reader-player-stop"><IoClose size={17} /></button>
    </div>, document.body);
}

export default function WorkReader({ item, entry, unitKey = "chapters", catLabel, format = "livre", look, cover, startUnit = null, resume = false, locked, onClose, next, nextCover, onNext, onComment, onEditUnit, noPdf = true }) {
  const [ended, setEnded] = useState(false); // fin de l'œuvre : écran de fin et œuvre suivante
  const { playReadingUrl, toggleReadingUrl, pauseReading, endReading, isPlaying, playingId } = useApp();
  const built = useMemo(() => (entry ? { book: bookOfEntry(entry), map: [0] } : bookOfCreation(item, { unitKey, catLabel, format, locked, look })), [item, entry, unitKey, catLabel, format, look]); // eslint-disable-line react-hooks/exhaustive-deps
  const { book, map } = built;
  const owner = entry ? entry.id : item.id;
  const readingKey = "reading:" + owner;
  const radio = useRadio(PUB_AT);
  // En entrant dans l'œuvre : l'ambiance du monde et les sons d'ambiance se taisent (rendus en sortant)
  useEffect(() => { holdAmbient(true); if (!trackFor(ci)) playReadingUrl("", readingKey); return () => holdAmbient(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Jamais deux musiques : la radio YouTube coupe la musique de lecture
  useEffect(() => { if (radio.playing) pauseReading(); }, [radio.playing]); // eslint-disable-line react-hooks/exhaustive-deps
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
  // Tes chiffres : quel chapitre est lu, lequel est fini (on passe au suivant), et le temps de lecture (par tranches de 30 s, onglet visible)
  const unitOf = (c) => { const k = map[c]; const u = unitKey && item ? item[unitKey]?.[k] : null; return { unit_index: k ?? -1, unit_id: u?.id || "" }; };
  const prevCi = useMemo(() => ({ v: null }), []);
  useEffect(() => {
    if (entry || !item) return;
    if (prevCi.v != null && ci > prevCi.v) hit("end", { creation_id: item.id, ...unitOf(prevCi.v) });
    prevCi.v = ci; hit("read", { creation_id: item.id, ...unitOf(ci) });
  }, [ci]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (entry || !item) return undefined;
    const t = setInterval(() => { if (document.visibilityState === "visible") hit("time", { creation_id: item.id, seconds: 30 }); }, 30000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const on = isPlaying && (playingId === readingKey || (typeof playingId === "string" && playingId.startsWith("cue:")));
  const music = trackFor(ci) || (on && !radio.pl) ? {
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
  const curUnit = !entry && item && unitKey ? item[unitKey]?.[map[ci]] : null;
  return (<>
    {endCard}
    <RadioEngine radio={radio} />
    <ReaderPlayer r={radio} />
    {curUnit && <PassageLayer item={item} unit={curUnit} unitIndex={map[ci]} unitLabel={`${unitKey === "episodes" ? "Épisode" : "Chapitre"} ${map[ci] + 1}`} />}
    <Reader book={book} cover={cover || (entry?.cover ? mediaUrl(entry.cover) : null)} onClose={onClose} backLabel={entry ? "Retour" : "Retour au monde"} path={where}
      startCh={startCh} keepSaved={resume} onProgress={onProgress} workMusic={music} noPdf={noPdf}
      onEditChapter={onEditUnit ? (entry ? () => onEditUnit(0) : (c) => onEditUnit(map[c] ?? map[0] ?? 0)) : undefined}
      radio={radio}
      onCue={(url, t) => {
        const v = (String(url).match(YT) || [])[1];
        if (v) { if (radio.info?.vid === v || radio.pl?.id === "cue-" + v) return radio.toggle(); pauseReading(); return radio.play({ id: "cue-" + v, url: `https://www.youtube.com/watch?v=${v}`, title: t || "Musique", thumb: `https://i.ytimg.com/vi/${v}/mqdefault.jpg` }); }
        radio.pause(); setTitle(t || "Musique"); toggleReadingUrl(mediaUrl(url), "cue:" + url, { loop: false, title: t || "Musique" });
      }}
      onDone={() => { if (!entry) { hit("end", { creation_id: item.id, ...unitOf(ci) }); if (!held) markDone(item.id); setTimeout(() => setEnded(true), 900); } }} />
  </>);
}
