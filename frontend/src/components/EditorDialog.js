import { useEffect, useRef, useState } from "react";
import VersionHistory from "@/components/VersionHistory";
import { IoSearch, IoClose, IoCloudUploadOutline, IoTrashOutline, IoAddOutline, IoMusicalNotes, IoImageOutline, IoBookOutline, IoCreateOutline, IoChevronUp, IoChevronDown, IoEyeOutline, IoTimeOutline, IoFilmOutline, IoLinkOutline, IoGameControllerOutline, IoInformationCircleOutline, IoListOutline, IoReaderOutline, IoCheckmark, IoArrowBack, IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { toast } from "sonner";
import { createCreation, updateCreation, uploadAudio, deleteAudio, uploadReadingAudio, deleteReadingAudio, getCreationFull, uploadChapterAudio, deleteChapterAudio, uploadVideo, deleteVideo, uploadAsset, assetUrl, createJournalEntry } from "@/lib/api";
import PageWriter from "@/components/PageWriter";
import { WORLD_STYLES, WORLD_MASKED, worldStyleOf, usePosterAccent } from "@/components/nexus/world";
import { THEMES as BOOK_LOOKS, THEME_INFO as BOOK_LOOK_INFO } from "@/data/alexandrie/looks";
import { LOOK_OF_WORLD } from "@/components/nexus/WorkReader";
import { CoverDialog } from "@/components/atelier/Alexandrie";
import { useWorldThemes } from "@/lib/worldThemes";
import WorldThemeLab from "@/components/nexus/WorldThemeLab";
import "@/components/editor.css";

/*
  L'atelier d'une œuvre : un seul éditeur pour créer et modifier chaque aspect,
  de l'identité au monde (ambiance, couleur, fond), au contenu, aux médias et à la publication.
  Ouvert depuis l'accueil (nouvelle création) ou depuis l'œuvre elle-même (bouton Modifier, à côté du cœur).
*/

const empty = {
  title: "", kanji: "", category: "livres", tagline: "", synopsis: "",
  poster: "", accent: "", world_style: "", reader_format: "", reader_look: "", units_cols: 0, units_cols_phone: 0, bg_image: "", bg_blur: 32, bg_dim: 0.55, gallery: [], embeds: [],
  launch_type: "reader", launch_label: "Lancer",
  launch_content: "", launch_url: "", film_url: "", trailer_url: "", buy_url: "", chapter_display: "button", chapter_size: "md", button_size: "md", unit_label: "", unit_display: "movix", episodes: [], chapters: [], coming_soon: false, release_month: "", release_year: "", order: 0, is_paid: false, price_eur: 0, free_chapters: 0, status: "",
  intention_enabled: false, intention_title: "Intentions de l'auteur", intention_text: "", intention_images: [], intention_file_id: "", intention_file_name: "",
};

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const LEGACY = { manga: "hero", vinyle: "eve", roman: "yorha" };
const STYLE_HINT = {
  cinema: "Bandes noires, grand titre, menu de DVD", vhs: "Écran cathodique, menus d'affichage",
  arcade: "Écran titre, police pixel, PRESS START", yorha: "Papier crème, menus carrés",
  eve: "Verre sombre, lignes fines, losanges", hero: "Panneaux inclinés, couleurs vives",
  cathedrale: "Noir et rouge sang, gothique, cadre gravé", couronne: "Noir et or, halo, filets dorés",
  trait: "Aplats, contours encrés, trames", sengoku: "Encre, coup de pinceau, sceau rouge",
  survivance: "Tons sourds, notes scotchées, sobriété", cristal: "Verre, lumière, typographie fine",
};
const LAUNCH = [
  ["chapters", "Chapitres", "Un lecteur page par page", IoBookOutline],
  ["episodes", "Épisodes", "Une liste d'épisodes", IoListOutline],
  ["film", "Film", "Lecture dans la plateforme", IoFilmOutline],
  ["reader", "Extrait", "Un texte court à lire", IoReaderOutline],
  ["link", "Lien", "Ouvre un autre site", IoLinkOutline],
  ["game", "Jeu", "Le jeu d'arcade", IoGameControllerOutline],
  ["info", "Info", "Présentation seulement", IoInformationCircleOutline],
];
const SECTIONS = [
  ["id", "Identité"], ["world", "Monde"], ["themes", "Thèmes"], ["content", "Contenu"], ["media", "Médias"], ["sound", "Son"], ["publish", "Publication"],
];
const SWATCHES = ["#e8473f", "#f99e1a", "#e3c48d", "#3fbf7f", "#2bb3c0", "#4d8dff", "#9b6bff", "#f2f2f2"];

const unitHtml = (u) => (u.rich ? (u.content || "") : (u.content ? u.content.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("") : ""));

// Réduit une image avant de la garder (affiche, fond, moodboard) : moins lourd, même rendu à l'écran
const shrink = (file, max = 1600) => new Promise((res, rej) => {
  if (!file?.type?.startsWith("image/")) return rej(new Error("type"));
  const r = new FileReader(); r.onerror = rej;
  r.onload = () => {
    if (file.type === "image/gif" || file.type === "image/svg+xml") return res(r.result);
    const img = new Image();
    img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.86)); };
    img.onerror = rej; img.src = r.result;
  };
  r.readAsDataURL(file);
});
const takeImage = (file, cb, max) => shrink(file, max).then(cb).catch(() => toast.error("Image illisible"));


// Images plus légères : celles du moodboard, des intentions, des chapitres et des épisodes partent en fichiers
// (servis à part et gardés en cache par le navigateur) au lieu d'alourdir la fiche de l'œuvre.
const isData = (v) => typeof v === "string" && v.startsWith("data:image");
const toBlob = (d) => { const [h, b] = d.split(","); const mime = h.match(/data:([^;]+)/)?.[1] || "image/jpeg"; const bin = atob(b); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: mime }); };
async function offloadImages(cid, f) {
  const up = async (v) => { if (!isData(v)) return v; try { const a = await uploadAsset(cid, toBlob(v), "image", "image.jpg"); return a?.id ? assetUrl(a.id) : v; } catch (_) { return v; } };
  const list = async (arr) => { const out = []; for (const v of arr || []) out.push(await up(v)); return out; };
  const units = async (arr) => { const out = []; for (const u of arr || []) out.push(isData(u.image) ? { ...u, image: await up(u.image) } : u); return out; };
  return { ...f, gallery: await list(f.gallery), intention_images: await list(f.intention_images), chapters: await units(f.chapters), episodes: await units(f.episodes) };
}
const hasData = (f) => [...(f.gallery || []), ...(f.intention_images || []), ...(f.chapters || []).map((u) => u.image), ...(f.episodes || []).map((u) => u.image)].some(isData);
// Brouillon : ce qui n'est pas enregistré survit à un onglet fermé (gardé dans ce navigateur)
const DRAFT = (id) => `sx_draft_creation_${id || "new"}`;
const saveDraft = (id, f) => {
  try { localStorage.setItem(DRAFT(id), JSON.stringify({ at: Date.now(), form: f })); }
  catch (_) { try { const { poster, bg_image, gallery, intention_images, ...light } = f; localStorage.setItem(DRAFT(id), JSON.stringify({ at: Date.now(), form: light, light: true })); } catch (__) {} }
};
const readDraft = (id) => { try { return JSON.parse(localStorage.getItem(DRAFT(id)) || "null"); } catch (_) { return null; } };
const dropDraft = (id) => { try { localStorage.removeItem(DRAFT(id)); } catch (_) {} };

// Petits éléments de l'atelier
const Field = ({ label, hint, children, wide }) => (
  <label className={"rl-f" + (wide ? " wide" : "")}><span className="rl-lbl">{label}</span>{children}{hint && <small className="rl-hint">{hint}</small>}</label>
);
const Toggle = ({ on, onChange, children, testid }) => (
  <button type="button" role="switch" aria-checked={!!on} className={"rl-tg" + (on ? " on" : "")} onClick={() => onChange(!on)} data-testid={testid}><i /><span>{children}</span></button>
);
const Seg = ({ value, onChange, options, testid }) => (
  <div className="rl-seg" role="radiogroup" data-testid={testid}>{options.map(([v, l]) => <button type="button" key={v} role="radio" aria-checked={value === v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>)}</div>
);
const Drop = ({ img, ratio = "2/3", label, onFile, onClear, testid, multiple, onSearch }) => {
  const [over, setOver] = useState(false);
  return (
    <div className={"rl-drop" + (over ? " over" : "") + (img ? " has" : "")} style={{ aspectRatio: ratio }} data-testid={testid}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const fl = [...(e.dataTransfer.files || [])]; if (fl.length) multiple ? onFile(fl) : onFile(fl[0]); }}>
      {img && <img src={img} alt="" />}
      <label className="rl-drop-in">
        <IoCloudUploadOutline size={20} /><span>{img ? "Remplacer" : label}</span><small>glisser-déposer ou cliquer</small>
        <input type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => { const fl = [...(e.target.files || [])]; e.target.value = ""; if (fl.length) multiple ? onFile(fl) : onFile(fl[0]); }} />
      </label>
      {img && onClear && <button type="button" className="rl-drop-x" onClick={onClear} aria-label="Retirer"><IoTrashOutline size={14} /></button>}
      {onSearch && <button type="button" className="rl-drop-s" onClick={onSearch} title="Chercher une image : SteamGridDB, affiches, manga, livres, domaine public, Pinterest…" data-testid={testid ? testid + "-search" : undefined}><IoSearch size={14} /> Chercher un artwork</button>}
    </div>
  );
};
const FilePick = ({ icon, label, present, file, onPick, onRemove, accept, testid, removeTestid }) => (
  <div className="rl-file">
    <label className={"rl-btn ghost" + (file || present ? " set" : "")} data-testid={testid}>
      {icon}<span>{file ? file.name : present ? `${label} — remplacer` : label}</span>
      <input type="file" accept={accept} hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onPick(f); }} />
    </label>
    {(file || present) && onRemove && <button type="button" className="rl-ico" onClick={onRemove} data-testid={removeTestid} aria-label="Retirer"><IoTrashOutline /></button>}
  </div>
);

export default function EditorDialog({ open, onClose, initial, categories = [], onSaved, onPeek, cover: coverHint, section }) {
  const myThemes = useWorldThemes();
  const [form, setForm] = useState(empty);
  const [sec, setSec] = useState("id");
  const [dirty, setDirty] = useState(false);
  const [askLeave, setAskLeave] = useState(false);
  const [peek, setPeek] = useState(false);
  const [wtFull, setWtFull] = useState(false); // atelier des thèmes en plein écran
  const [draft, setDraft] = useState(null); // brouillon trouvé à l'ouverture
  const [dark, setDark] = useState(() => { try { return localStorage.getItem("sx_atelier_dark") !== "0"; } catch (_) { return true; } });
  const toggleDark = () => setDark((d) => { try { localStorage.setItem("sx_atelier_dark", d ? "0" : "1"); } catch (_) {} return !d; });
  const [showHistory, setShowHistory] = useState(false);
  const [fullState, setFullState] = useState("ok"); // ok | loading | error — on n'enregistre jamais une version incomplète
  const [saving, setSaving] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [readingFile, setReadingFile] = useState(null);
  const [chapterFiles, setChapterFiles] = useState({});
  const [filmFile, setFilmFile] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);
  const [intentionFile, setIntentionFile] = useState(null);
  const [videoProg, setVideoProg] = useState({ film: 0, trailer: 0 });
  const [writing, setWriting] = useState(null); // { key: "chapters" | "episodes", i }
  const [pick, setPick] = useState(null); // recherche d'image façon Alexandrie : { label, cur, put }
  const autoAccent = usePosterAccent(!open ? null : form.poster && form.poster.length > 4 ? form.poster : coverHint || null);
  const keyRef = useRef(null);

  useEffect(() => {
    if (open) {
      const base = initial ? { ...empty, ...initial } : { ...empty, category: categories[0]?.key || "livres" };
      setFullState("ok"); setSec(section || "id"); setDraft(readDraft(initial?.id)); setDirty(false); setAskLeave(false); setPeek(false); setShowHistory(false);
      setForm(base); setAudioFile(null); setReadingFile(null); setChapterFiles({}); setFilmFile(null); setTrailerFile(null); setIntentionFile(null); setVideoProg({ film: 0, trailer: 0 }); setWriting(null);
      // on charge la version complète (images comprises) pour ne rien perdre en enregistrant
      if (initial && initial.id) {
        setFullState("loading");
        getCreationFull(initial.id).then((full) => { setForm({ ...empty, ...full }); setFullState("ok"); })
          .catch(() => { setFullState("error"); toast.error("Impossible de charger la création complète — enregistrement bloqué pour protéger tes épisodes"); });
      }
    }
  }, [open, initial]); // eslint-disable-line

  // Brouillon : gardé quelques instants après chaque modification
  useEffect(() => { if (!open || !dirty) return; const t = setTimeout(() => saveDraft(initial?.id, form), 900); return () => clearTimeout(t); }, [open, dirty, form]); // eslint-disable-line
  // Aperçu en direct : le monde derrière l'atelier suit tes réglages
  useEffect(() => { if (open && onPeek) onPeek(form); }, [open, form]); // eslint-disable-line
  useEffect(() => () => onPeek?.(null), []); // eslint-disable-line

  // Clavier : Échap pour fermer (avec confirmation si rien n'est enregistré), Ctrl/Cmd + S pour enregistrer
  keyRef.current = (e) => {
    if (!open || writing) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (peek) setPeek(false); else tryClose(); }
  };
  useEffect(() => { const h = (e) => keyRef.current?.(e); window.addEventListener("keydown", h, true); return () => window.removeEventListener("keydown", h, true); }, []);

  if (!open) return null;
  const isEdit = Boolean(initial && initial.id);
  const upd = (fn) => { setDirty(true); setForm(fn); };
  const set = (k, v) => upd((f) => ({ ...f, [k]: v }));
  const close = () => { onPeek?.(null); onClose(); };
  const tryClose = () => (dirty ? setAskLeave(true) : close());

  // listes (chapitres, épisodes) : ajouter, modifier, retirer, déplacer
  const addEp = () => set("episodes", [...(form.episodes || []), { title: "", description: "", url: "", image: "" }]);
  const updEp = (i, k, v) => set("episodes", form.episodes.map((e, x) => (x === i ? { ...e, [k]: v } : e)));
  const delEp = (i) => set("episodes", form.episodes.filter((_, x) => x !== i));
  const addCh = () => set("chapters", [...(form.chapters || []), { title: "", content: "", description: "", image: "", rich: true, has_music: false }]);
  const updCh = (i, k, v) => set("chapters", form.chapters.map((c, x) => (x === i ? { ...c, [k]: v } : c)));
  const delCh = (i) => { set("chapters", form.chapters.filter((_, x) => x !== i)); setChapterFiles((f) => { const n = {}; Object.entries(f).forEach(([k, v]) => { const j = Number(k); if (j < i) n[j] = v; else if (j > i) n[j - 1] = v; }); return n; }); };
  const move = (key, i, d) => {
    const j = i + d; const list = [...(form[key] || [])]; if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]]; set(key, list);
    if (key === "chapters") setChapterFiles((f) => { const n = { ...f }; const a = n[i]; const b = n[j]; delete n[i]; delete n[j]; if (b) n[i] = b; if (a) n[j] = a; return n; });
  };
  const removeChapterMusic = async (i) => {
    const ch = form.chapters[i];
    if (isEdit && ch?.id) { try { await deleteChapterAudio(initial.id, ch.id); } catch (_) {} }
    updCh(i, "has_music", false);
    setChapterFiles((f) => { const n = { ...f }; delete n[i]; return n; });
    toast.success("Musique du chapitre retirée");
  };

  const addImages = (key, files) => [...files].slice(0, 12).forEach((f) => takeImage(f, (d) => upd((p) => ({ ...p, [key]: [...(p[key] || []), d] })), 1600));
  const delImage = (key, i) => set(key, (form[key] || []).filter((_, x) => x !== i));
  const moveImage = (key, i, d) => { const l = [...(form[key] || [])]; const j = i + d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; set(key, l); };

  const addEmbed = () => set("embeds", [...(form.embeds || []), { platform: "youtube", url: "", label: "" }]);
  const updEmbed = (i, k, v) => set("embeds", form.embeds.map((e, x) => (x === i ? { ...e, [k]: v } : e)));
  const delEmbed = (i) => set("embeds", form.embeds.filter((_, x) => x !== i));

  const save = async () => {
    if (saving) return;
    if (!form.title.trim()) { setSec("id"); return toast.error("Le titre est requis"); }
    if (isEdit && fullState !== "ok") return toast.error(fullState === "loading" ? "Chargement de la création en cours… réessaie dans un instant" : "La création complète n'a pas pu être chargée : ferme et rouvre l'éditeur");
    setSaving(true);
    try {
      let payload = { ...form, order: Number(form.order) || 0 };
      // Les Intentions rejoignent le Making of : elles deviennent une entrée du journal de bord liée à l'œuvre
      if (isEdit && payload.intention_enabled && (payload.intention_text || (payload.intention_images || []).length)) {
        try {
          if (hasData(payload)) payload = await offloadImages(initial.id, payload);
          const imgs = payload.intention_images || [];
          await createJournalEntry({ title: payload.intention_title || "Intentions de l'auteur", subtitle: "", creation_id: initial.id, date: new Date().toISOString().slice(0, 10), cover: imgs[0] || "", published: true, show_home: false,
            blocks: [{ type: "text", text: payload.intention_text || "" }, ...imgs.map((url) => ({ type: "image", url }))] });
          payload = { ...payload, intention_enabled: false };
          toast.success("Tes Intentions sont maintenant une entrée du Making of");
        } catch (_) { toast.error("Les Intentions n'ont pas pu passer dans le Making of (elles restent enregistrées)"); }
      }
      if (isEdit && hasData(payload)) payload = await offloadImages(initial.id, payload);
      let saved = isEdit ? await updateCreation(initial.id, payload, true) : await createCreation(payload);
      if (!isEdit && hasData(payload)) { payload = await offloadImages(saved.id, payload); saved = await updateCreation(saved.id, payload, true); }
      if (audioFile) await uploadAudio(saved.id, audioFile);
      if (readingFile) await uploadReadingAudio(saved.id, readingFile);
      if (filmFile) await uploadVideo(saved.id, "film", filmFile, (p) => setVideoProg((s) => ({ ...s, film: p })));
      if (trailerFile) await uploadVideo(saved.id, "trailer", trailerFile, (p) => setVideoProg((s) => ({ ...s, trailer: p })));
      if (intentionFile) {
        try {
          const a = await uploadAsset(saved.id, intentionFile, "file", intentionFile.name);
          await updateCreation(saved.id, { ...payload, intention_file_id: a.id, intention_file_name: a.name }, true);
        } catch { toast.error("Dossier trop lourd (max 12 Mo) ?"); }
      }
      // musique de chaque chapitre (les chapitres gardent leur ordre : on les retrouve par position)
      for (const [i, file] of Object.entries(chapterFiles)) {
        const ch = saved.chapters?.[Number(i)];
        if (ch && file) { try { await uploadChapterAudio(saved.id, ch.id, file); } catch (_) { toast.error(`Musique du chapitre ${Number(i) + 1} trop lourde (max 12 Mo) ?`); } }
      }
      toast.success(isEdit ? "Création mise à jour" : "Création ajoutée");
      dropDraft(isEdit ? initial.id : null); setDirty(false); onSaved?.(); close();
    } catch { toast.error("Erreur lors de l'enregistrement"); } finally { setSaving(false); }
  };

  const removeAudio = async () => { if (audioFile) { setAudioFile(null); return; } if (!isEdit) return; await deleteAudio(initial.id); set("has_audio", false); toast.success("Ambiance supprimée"); };
  const removeReading = async () => { if (readingFile) { setReadingFile(null); return; } if (!isEdit) return; await deleteReadingAudio(initial.id); set("has_reading_audio", false); toast.success("Musique de lecture supprimée"); };
  const pickVideo = (kind, file) => {
    if (file.size > 200 * 1024 * 1024) return toast.error("Vidéo trop lourde (max 200 Mo). Utilise plutôt un lien.");
    setDirty(true); if (kind === "film") setFilmFile(file); else setTrailerFile(file);
  };
  const removeFilm = async () => { if (filmFile) { setFilmFile(null); return; } if (!isEdit) return; await deleteVideo(initial.id, "film"); set("has_film", false); toast.success("Film supprimé"); };
  const removeTrailer = async () => { if (trailerFile) { setTrailerFile(null); return; } if (!isEdit) return; await deleteVideo(initial.id, "trailer"); set("has_trailer", false); toast.success("Bande-annonce supprimée"); };

  const wUnit = writing && form[writing.key]?.[writing.i];
  const updUnit = (patch) => upd((f) => ({ ...f, [writing.key]: f[writing.key].map((u, x) => (x === writing.i ? { ...u, ...patch } : u)) }));

  // ce que l'atelier sait de l'œuvre
  const catLabel = categories.find((c) => c.key === form.category)?.label || form.category;
  const wsAuto = worldStyleOf({ ...form, world_style: "" }, catLabel);
  const wsCur = LEGACY[form.world_style] || form.world_style || "";
  const wsMine = myThemes.find((d) => d.key === wsCur);
  const ws = wsMine ? (WORLD_STYLES[wsMine.base] ? wsMine.base : wsAuto) : WORLD_STYLES[wsCur] ? wsCur : wsAuto;
  const acc = form.accent || autoAccent || "var(--brand)";
  const units = form.launch_type === "chapters" ? form.chapters || [] : form.launch_type === "episodes" ? form.episodes || [] : null;
  const checks = [
    ["Titre", !!form.title.trim(), "id"], ["Affiche", !!(form.poster && form.poster.length > 4) || !!form.has_poster, "id"], ["Résumé", !!form.synopsis.trim(), "id"],
    ["Contenu", units ? units.length > 0 : form.launch_type === "film" ? !!(form.film_url || form.has_film || filmFile) : form.launch_type === "link" ? !!form.launch_url : form.launch_type === "reader" ? !!form.launch_content : true, "content"],
    ["Fond du monde", !!(form.bg_image && form.bg_image.length > 4) || !!form.has_bg, "world"],
  ];
  const count = { content: units ? units.length : null, media: (form.gallery || []).length + (form.embeds || []).length + (form.trailer_url || form.has_trailer || trailerFile ? 1 : 0) };
  const cover = form.poster && form.poster.length > 4 ? form.poster : coverHint || null;
  const bgPrev = form.bg_image && form.bg_image.length > 4 ? form.bg_image : cover;

  const UnitList = ({ k }) => {
    const list = form[k] || []; const isCh = k === "chapters";
    return (
      <div className="rl-units">
        <div className="rl-sub"><b>{isCh ? "Chapitres" : "Épisodes"}</b><span className="rl-count">{String(list.length).padStart(2, "0")}</span>
          <button type="button" className="rl-btn" onClick={isCh ? addCh : addEp} data-testid={isCh ? "editor-add-chapter" : "editor-add-episode"}><IoAddOutline /> Ajouter</button></div>
        {list.length === 0 && <p className="rl-empty">Aucun {isCh ? "chapitre" : "épisode"} pour l'instant.</p>}
        {list.map((u, i) => (
          <article key={i} className="rl-unit" data-testid={isCh ? `editor-chapter-${i}` : `editor-episode-${i}`}>
            <span className="rl-unit-n">{String(i + 1).padStart(2, "0")}</span>
            <span className="rl-thumbw"><label className="rl-thumb" title="Image">
              {u.image ? <img src={u.image} alt="" /> : <IoImageOutline size={18} />}
              <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) takeImage(f, (d) => (isCh ? updCh(i, "image", d) : updEp(i, "image", d)), 1280); }} />
            </label>
            <button type="button" className="rl-thumb-s" onClick={() => setPick({ label: `${isCh ? "Chapitre" : "Épisode"} ${i + 1}`, cur: u.image, put: (url) => (isCh ? updCh(i, "image", url) : updEp(i, "image", url)) })} title="Chercher une image" aria-label="Chercher une image" data-testid={`editor-unit-search-${i}`}><IoSearch size={12} /></button></span>
            <div className="rl-unit-b">
              <input className="rl-in" value={u.title || ""} onChange={(e) => (isCh ? updCh(i, "title", e.target.value) : updEp(i, "title", e.target.value))} placeholder={`${isCh ? "Chapitre" : "Épisode"} ${i + 1}`} />
              <textarea className="rl-in" rows={2} value={u.description || ""} onChange={(e) => (isCh ? updCh(i, "description", e.target.value) : updEp(i, "description", e.target.value))} placeholder="Résumé affiché dans la liste" data-testid={isCh ? `editor-chapter-desc-${i}` : undefined} />
              {!isCh && <input className="rl-in" value={u.url || ""} onChange={(e) => updEp(i, "url", e.target.value)} placeholder="Lien (optionnel)" />}
              <div className="rl-unit-acts">
                <button type="button" className="rl-btn" onClick={() => setWriting({ key: k, i })} data-testid={isCh ? `editor-chapter-write-${i}` : `editor-episode-write-${i}`}><IoCreateOutline /> {u.content ? "Modifier le texte" : "Rédiger"}</button>
                {isCh && <FilePick icon={<IoMusicalNotes />} label="Musique du chapitre" present={u.has_music} file={chapterFiles[i]} accept="audio/*" testid={`editor-chapter-music-${i}`} removeTestid={`editor-chapter-music-remove-${i}`}
                  onPick={(f) => { setDirty(true); setChapterFiles((cf) => ({ ...cf, [i]: f })); }} onRemove={() => removeChapterMusic(i)} />}
              </div>
            </div>
            <div className="rl-unit-side">
              <button type="button" className="rl-ico" onClick={() => move(k, i, -1)} disabled={i === 0} aria-label="Monter"><IoChevronUp /></button>
              <button type="button" className="rl-ico" onClick={() => move(k, i, 1)} disabled={i === list.length - 1} aria-label="Descendre"><IoChevronDown /></button>
              <button type="button" className="rl-ico danger" onClick={() => (isCh ? delCh(i) : delEp(i))} data-testid={isCh ? `editor-chapter-delete-${i}` : undefined} aria-label="Retirer"><IoTrashOutline /></button>
            </div>
          </article>
        ))}
        {isCh && list.length > 0 && <p className="rl-hint">Sans musique propre, un chapitre reprend la musique de lecture générale (section Son).</p>}
      </div>
    );
  };

  const ImageGrid = ({ k, testid }) => (
    <div className="rl-grid">
      {(form[k] || []).map((g, i) => (
        <figure key={i} className="rl-gi">
          <img src={g} alt="" />
          <figcaption>
            <button type="button" onClick={() => moveImage(k, i, -1)} aria-label="Avant"><IoChevronUp style={{ rotate: "-90deg" }} /></button>
            <button type="button" onClick={() => moveImage(k, i, 1)} aria-label="Après"><IoChevronDown style={{ rotate: "-90deg" }} /></button>
            <button type="button" onClick={() => delImage(k, i)} aria-label="Retirer"><IoTrashOutline /></button>
          </figcaption>
        </figure>
      ))}
      <div className="rl-gi add"><Drop ratio="1/1" label="Ajouter" multiple onFile={(fl) => addImages(k, fl)} testid={testid} onSearch={() => setPick({ label: "Moodboard", cur: "", put: (u) => set(k, [...(form[k] || []), u]) })} /></div>
    </div>
  );

  const body = {
    themes: <WorldThemeLab form={form} set={set} creationId={isEdit ? initial.id : null} bg={bgPrev} cover={cover} onPeek={onPeek && isEdit ? () => setPeek(true) : undefined} full={wtFull} onFull={setWtFull} />,
    id: (
      <>
        <div className="rl-two">
          <Drop img={cover} label="Affiche" onFile={(f) => takeImage(f, (d) => set("poster", d), 1400)} onClear={form.poster ? () => set("poster", "") : null} testid="editor-poster-upload" onSearch={() => setPick({ label: "Affiche", cur: form.poster, put: (u) => set("poster", u) })} />
          <div className="rl-stack">
            <Field label="Titre"><input className="rl-in big" data-testid="editor-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Le nom de l'œuvre" autoFocus={!isEdit} /></Field>
            <Field label="Accroche" hint="Une ligne sous le titre (auteur, slogan, sous-titre)."><input className="rl-in" data-testid="editor-tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
            <div className="rl-row">
              <Field label="Catégorie"><select className="rl-in" data-testid="editor-category" value={form.category} onChange={(e) => set("category", e.target.value)}>{categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></Field>
              <Field label="Emblème" hint="Un caractère, sur la tranche et la couverture."><input className="rl-in mono" data-testid="editor-kanji" maxLength={3} value={form.kanji} onChange={(e) => set("kanji", e.target.value)} /></Field>
            </div>
          </div>
        </div>
        <Field label="Résumé" hint={`${form.synopsis.length} caractères — 300 à 500, c'est l'idéal pour la notice.`} wide><textarea className="rl-in" rows={5} data-testid="editor-synopsis" value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} /></Field>
      </>
    ),
    world: (
      <>
        <p className="rl-sub"><b>Ambiance</b><span>Le menu de jeu de l'œuvre en expérience Nexus.</span></p>
        <div className="rl-ws">
          <button type="button" className={"rl-wsc" + (!wsCur ? " on" : "")} onClick={() => set("world_style", "")} data-testid="wst-style-auto">
            <span className={"rl-mini m-" + wsAuto} style={{ "--a": acc, backgroundImage: bgPrev ? `url(${bgPrev})` : undefined }}><b>{form.title || "Titre"}</b><i /><i /><i /></span>
            <strong>Automatique</strong><small>{WORLD_STYLES[wsAuto]}, d'après le type</small>
          </button>
          {Object.entries(WORLD_STYLES).filter(([k]) => !WORLD_MASKED.includes(k) || wsCur === k).map(([k, label]) => (
            <button type="button" key={k} className={"rl-wsc" + (wsCur === k ? " on" : "")} onClick={() => set("world_style", k)} data-testid={`wst-style-${k}`}>
              <span className={"rl-mini m-" + k} style={{ "--a": acc, backgroundImage: bgPrev ? `url(${bgPrev})` : undefined }}><b>{form.title || "Titre"}</b><i /><i /><i /></span>
              <strong>{label}</strong><small>{STYLE_HINT[k]}</small>
            </button>
          ))}
        </div>
        <p className="rl-sub"><b>Mes thèmes</b><span>Créés dans la section Thèmes (juste en dessous).</span></p>
        <div className="rl-ws" data-testid="editor-my-themes">
          {myThemes.map((d) => (
            <button type="button" key={d.key} className={"rl-wsc" + (form.world_style === d.key ? " on" : "")} onClick={() => set("world_style", d.key)} data-testid={`wst-style-${d.key}`}>
              <span className={"rl-mini m-" + (d.base || "cinema")} style={{ "--a": d.hl || acc, backgroundImage: bgPrev ? `url(${bgPrev})` : undefined, fontFamily: d.font_title ? `"${d.font_title}"` : undefined }}><b>{form.title || "Titre"}</b><i /><i /><i /></span>
              <strong>{d.name}</strong><small>D'après {WORLD_STYLES[d.base] || d.base}</small>
            </button>
          ))}
          {<button type="button" className="rl-wsc rl-wsc-new" onClick={() => setSec("themes")} data-testid="editor-open-studio"><span className="rl-mini rl-mini-new">+</span><strong>Atelier des thèmes</strong><small>Créer ou modifier un thème, en direct sur le monde</small></button>}
        </div>
        {WORLD_MASKED.some((k) => k !== wsCur) && (
          <details className="rl-masked">
            <summary>Ambiances masquées ({WORLD_MASKED.filter((k) => k !== wsCur).length})</summary>
            <div className="rl-ws">
              {WORLD_MASKED.filter((k) => k !== wsCur).map((k) => (
                <button type="button" key={k} className="rl-wsc" onClick={() => set("world_style", k)} data-testid={`wst-style-${k}`}>
                  <span className={"rl-mini m-" + k} style={{ "--a": acc, backgroundImage: bgPrev ? `url(${bgPrev})` : undefined }}><b>{form.title || "Titre"}</b><i /><i /><i /></span>
                  <strong>{WORLD_STYLES[k]}</strong><small>{STYLE_HINT[k]}</small>
                </button>
              ))}
            </div>
          </details>
        )}
        {(form.launch_type === "chapters" || form.launch_type === "episodes") && (<>
          <p className="rl-sub"><b>Grille des {form.launch_type === "chapters" ? "chapitres" : "épisodes"}</b><span>Combien de vignettes par ligne sur ordinateur. Peu de chapitres : grandes vignettes ; beaucoup : plus compact.</span></p>
          {[["units_cols", "Ordinateur", [0, 1, 2, 3, 4, 5], "editor-cols-"], ["units_cols_phone", "Téléphone", [0, 1, 2, 3], "editor-pcols-"]].map(([key, lab, opts, tid]) => (
            <div className="rl-colsrow" key={key}>
              <span className="rl-cols-l">{lab}</span>
              <div className="rl-cols" role="radiogroup" aria-label={lab} data-testid={key === "units_cols" ? "editor-units-cols" : "editor-units-cols-phone"}>
                {opts.map((n) => (
                  <button type="button" key={n} role="radio" aria-checked={(Number(form[key]) || 0) === n} className={(Number(form[key]) || 0) === n ? "on" : ""} onClick={() => set(key, n)} data-testid={`${tid}${n}`}>
                    <span className="rl-cols-m" aria-hidden="true">{n === 0 ? <em>A</em> : Array.from({ length: n }, (_, i) => <i key={i} />)}</span>
                    <small>{n === 0 ? "Auto" : n}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>)}
        <p className="rl-sub"><b>Couleur</b><span>Les menus, les reflets, la barre de progression.</span></p>
        <div className="rl-colors">
          <button type="button" className={"rl-sw auto" + (!form.accent ? " on" : "")} onClick={() => set("accent", "")} title="Tirée de l'affiche"><i style={{ background: autoAccent || "var(--brand)" }} /><span>Affiche</span></button>
          {SWATCHES.map((c) => <button type="button" key={c} className={"rl-sw" + (form.accent === c ? " on" : "")} onClick={() => set("accent", c)} aria-label={c}><i style={{ background: c }} /></button>)}
          <label className={"rl-sw pick" + (form.accent && !SWATCHES.includes(form.accent) ? " on" : "")}><i style={{ background: form.accent && !SWATCHES.includes(form.accent) ? form.accent : "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }} /><span>Choisir</span>
            <input type="color" value={form.accent || "#4d8dff"} onChange={(e) => set("accent", e.target.value)} /></label>
        </div>
        <p className="rl-sub"><b>Fond du monde</b><span>Sans image, l'affiche sert de fond.</span></p>
        <Drop img={form.bg_image && form.bg_image.length > 4 ? form.bg_image : null} ratio="16/7" label="Image de fond" onFile={(f) => takeImage(f, (d) => set("bg_image", d), 1920)} onClear={() => set("bg_image", "")} onSearch={() => setPick({ label: "Image de fond", cur: form.bg_image, put: (u) => set("bg_image", u) })} testid="editor-bg-upload" />
        <details className="rl-more">
          <summary>Réglages de la fiche Classique</summary>
          <div className="rl-row">
            <Field label={`Flou du fond · ${form.bg_blur}px`}><input type="range" min="0" max="60" value={form.bg_blur} onChange={(e) => set("bg_blur", Number(e.target.value))} data-testid="editor-bg-blur" /></Field>
            <Field label={`Assombrissement · ${Math.round(form.bg_dim * 100)}%`}><input type="range" min="0" max="0.95" step="0.05" value={form.bg_dim} onChange={(e) => set("bg_dim", Number(e.target.value))} data-testid="editor-bg-dim" /></Field>
          </div>
          <div className="rl-row">
            <Field label="Taille des boutons"><Seg value={form.button_size || "md"} onChange={(v) => set("button_size", v)} options={[["md", "Normale"], ["lg", "Grande"], ["xl", "Très grande"]]} testid="editor-button-size" /></Field>
            {units && <Field label="Taille des chapitres / épisodes"><Seg value={form.chapter_size || "md"} onChange={(v) => set("chapter_size", v)} options={[["sm", "S"], ["md", "M"], ["lg", "L"], ["xl", "XL"]]} testid="editor-chapter-size" /></Field>}
          </div>
          {units && <Field label="Affichage de la liste"><Seg value={form.unit_display || "movix"} onChange={(v) => set("unit_display", v)} options={[["movix", "Menu + grande affiche"], ["list", "Liste complète"]]} testid="editor-unit-display" /></Field>}
        </details>
      </>
    ),
    content: (
      <>
        <p className="rl-sub"><b>Ce que lance l'œuvre</b></p>
        <div className="rl-types" data-testid="editor-launch-type">
          {LAUNCH.map(([v, l, d, Icon]) => (
            <button type="button" key={v} className={form.launch_type === v ? "on" : ""} onClick={() => set("launch_type", v)} data-testid={`editor-launch-${v}`}><Icon size={20} /><b>{l}</b><small>{d}</small></button>
          ))}
        </div>
        <div className="rl-row">
          <Field label="Texte du bouton"><input className="rl-in" data-testid="editor-launch-label" value={form.launch_label} onChange={(e) => set("launch_label", e.target.value)} placeholder="Lancer" /></Field>
          {units && <Field label="Nom de la liste" hint="Chapitres, Tomes, Saisons…"><input className="rl-in" data-testid="editor-unit-label" value={form.unit_label || ""} onChange={(e) => set("unit_label", e.target.value)} placeholder={form.launch_type === "episodes" ? "Épisodes" : "Chapitres"} /></Field>}
        </div>
        {(units || form.launch_type === "reader") && <Field label="Lecture (expérience Nexus)" hint="Le lecteur d'Alexandrie habille les chapitres en livre, en cassette ou en disque. Auto : selon le type de l'œuvre."><Seg value={form.reader_format || ""} onChange={(v) => set("reader_format", v)} options={[["", "Auto"], ["livre", "Livre"], ["vhs", "VHS"], ["vinyle", "Vinyle"]]} testid="editor-reader-format" /></Field>}
        {(units || form.launch_type === "reader") && (
          <div className="rl-f wide">
            <span className="rl-lbl">Page du lecteur · ambiances d'Alexandrie</span>
            <div className="rl-looks" data-testid="editor-reader-look">
              {[["", null], ...Object.entries(BOOK_LOOKS)].map(([k, L]) => { const lk = L || BOOK_LOOKS[LOOK_OF_WORLD[ws]] || BOOK_LOOKS.didone; return (
                <button type="button" key={k || "auto"} className={"rl-look" + ((form.reader_look || "") === k ? " on" : "")} onClick={() => set("reader_look", k)} title={k ? BOOK_LOOK_INFO[k] || k : "D'après le thème du monde"} data-testid={`editor-look-${k || "auto"}`}>
                  <span className="rl-look-pg" style={{ background: lk.p, color: lk.ink, "--la": lk.acc }}><b>{lk.orn}</b><i /><i /><i /></span>
                  <small>{k ? k[0].toUpperCase() + k.slice(1) : `Auto · ${LOOK_OF_WORLD[ws] || "didone"}`}</small>
                </button>
              ); })}
            </div>
          </div>
        )}
        {form.launch_type === "reader" && <Field label="Texte à lire" wide><textarea className="rl-in" rows={8} data-testid="editor-launch-content" value={form.launch_content} onChange={(e) => set("launch_content", e.target.value)} /></Field>}
        {form.launch_type === "link" && <Field label="Adresse" wide><input className="rl-in" data-testid="editor-launch-url" value={form.launch_url} onChange={(e) => set("launch_url", e.target.value)} placeholder="https://…" /></Field>}
        {form.launch_type === "film" && (
          <div className="rl-box">
            <Field label="Film : un lien" hint="YouTube, Vimeo, Dailymotion, .mp4 ou code iframe. Un lien passe avant un fichier envoyé." wide><input className="rl-in" data-testid="editor-film-url" value={form.film_url || ""} onChange={(e) => set("film_url", e.target.value)} placeholder="https://youtube.com/watch?v=…" /></Field>
            <FilePick icon={<IoCloudUploadOutline />} label="…ou envoyer un fichier (max 200 Mo)" present={form.has_film} file={filmFile} accept="video/*" testid="editor-film-upload" removeTestid="editor-film-remove" onPick={(f) => pickVideo("film", f)} onRemove={removeFilm} />
            {videoProg.film > 0 && videoProg.film < 100 && <p className="rl-prog"><i style={{ width: `${videoProg.film}%` }} />Envoi… {videoProg.film}%</p>}
          </div>
        )}
        {form.launch_type === "chapters" && UnitList({ k: "chapters" })}
        {form.launch_type === "episodes" && UnitList({ k: "episodes" })}
      </>
    ),
    media: (
      <>
        <p className="rl-sub"><b>Moodboard</b><span className="rl-count">{String((form.gallery || []).length).padStart(2, "0")}</span></p>
        {ImageGrid({ k: "gallery", testid: "editor-gallery-add" })}
        <p className="rl-sub"><b>Bande-annonce</b></p>
        <div className="rl-box">
          <Field label="Lien" wide><input className="rl-in" data-testid="editor-trailer-url" value={form.trailer_url || ""} onChange={(e) => set("trailer_url", e.target.value)} placeholder="https://…" /></Field>
          <FilePick icon={<IoCloudUploadOutline />} label="…ou envoyer la bande-annonce" present={form.has_trailer} file={trailerFile} accept="video/*" testid="editor-trailer-upload" removeTestid="editor-trailer-remove" onPick={(f) => pickVideo("trailer", f)} onRemove={removeTrailer} />
          {videoProg.trailer > 0 && videoProg.trailer < 100 && <p className="rl-prog"><i style={{ width: `${videoProg.trailer}%` }} />Envoi… {videoProg.trailer}%</p>}
        </div>
        <p className="rl-sub"><b>Réseaux</b><button type="button" className="rl-btn" onClick={addEmbed} data-testid="editor-embed-add"><IoAddOutline /> Ajouter</button></p>
        {(form.embeds || []).length === 0 && <p className="rl-empty">Un lien YouTube s'affiche en vidéo, un lien Wattpad ou autre en bouton.</p>}
        {(form.embeds || []).map((em, i) => (
          <div key={i} className="rl-embed" data-testid={`editor-embed-${i}`}>
            <Seg value={em.platform} onChange={(v) => updEmbed(i, "platform", v)} options={[["youtube", "YouTube"], ["wattpad", "Wattpad"], ["other", "Autre"]]} />
            <input className="rl-in" value={em.url} onChange={(e) => updEmbed(i, "url", e.target.value)} placeholder="Adresse" />
            <input className="rl-in" value={em.label} onChange={(e) => updEmbed(i, "label", e.target.value)} placeholder="Libellé" />
            <button type="button" className="rl-ico danger" onClick={() => delEmbed(i)} aria-label="Retirer"><IoTrashOutline /></button>
          </div>
        ))}
        <p className="rl-sub"><b>Making of</b><span>Il se compose depuis le journal de bord : chaque entrée liée à l'œuvre y apparaît, intentions comprises.</span></p>
      </>
    ),
    sound: (
      <>
        <p className="rl-sub"><b>Ambiance de l'œuvre</b><span>Jouée quand on écoute l'ambiance depuis la fiche ou le monde. Max 12 Mo.</span></p>
        <FilePick icon={<IoMusicalNotes />} label="Choisir un fichier" present={form.has_audio} file={audioFile} accept="audio/*" testid="editor-audio-upload" removeTestid="editor-audio-remove" onPick={(f) => { setDirty(true); setAudioFile(f); }} onRemove={removeAudio} />
        <p className="rl-sub"><b>Musique de lecture</b><span>Remplace l'ambiance pendant la lecture des chapitres.</span></p>
        <FilePick icon={<IoBookOutline />} label="Choisir un fichier" present={form.has_reading_audio} file={readingFile} accept="audio/*" testid="editor-reading-upload" removeTestid="editor-reading-remove" onPick={(f) => { setDirty(true); setReadingFile(f); }} onRemove={removeReading} />
        {form.launch_type === "chapters" && <p className="rl-hint">Chaque chapitre peut aussi avoir sa propre musique (section Contenu).</p>}
      </>
    ),
    publish: (
      <>
        <Field label="Statut"><Seg value={form.status || ""} onChange={(v) => set("status", v)} options={[["", "Aucun"], ["en_cours", "En cours"], ["a_venir", "À venir"], ["termine", "Terminé"]]} testid="editor-status" /></Field>
        <Toggle on={form.coming_soon} onChange={(v) => set("coming_soon", v)} testid="editor-coming-soon">Pas encore sortie (prochaine sortie, date)</Toggle>
        {form.coming_soon && (
          <div className="rl-row" data-testid="editor-release-section">
            <Field label="Mois"><select className="rl-in" data-testid="editor-release-month" value={form.release_month || ""} onChange={(e) => set("release_month", e.target.value)}><option value="">—</option>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
            <Field label="Année"><input className="rl-in mono" type="number" min="2024" max="2100" placeholder="2027" data-testid="editor-release-year" value={form.release_year || ""} onChange={(e) => set("release_year", e.target.value)} /></Field>
          </div>
        )}
        <Toggle on={form.is_paid} onChange={(v) => set("is_paid", v)} testid="editor-is-paid">Œuvre payante (achat à l'unité ou abonnement)</Toggle>
        {form.is_paid && (
          <div className="rl-row">
            <Field label="Prix (€)"><input className="rl-in mono" type="number" min="0" step="0.5" data-testid="editor-price" value={form.price_eur} onChange={(e) => set("price_eur", Number(e.target.value))} /></Field>
            {form.launch_type === "chapters" && <Field label="Chapitres gratuits"><input className="rl-in mono" type="number" min="0" step="1" data-testid="editor-free-chapters" value={form.free_chapters} onChange={(e) => set("free_chapters", Number(e.target.value))} /></Field>}
          </div>
        )}
        {form.is_paid && <p className="rl-hint">{form.launch_type === "chapters" ? `Les ${form.free_chapters || 0} premiers chapitres restent libres, la suite après achat ou avec l'abonnement.` : "Le contenu se débloque après achat ou avec l'abonnement."}</p>}
        <div className="rl-row">
          <Field label="Lien d'achat externe" hint="Optionnel : boutique, éditeur…"><input className="rl-in" data-testid="editor-buy-url" value={form.buy_url} onChange={(e) => set("buy_url", e.target.value)} placeholder="https://…" /></Field>
          <Field label="Ordre" hint="Plus petit = plus haut dans le rayon."><input className="rl-in mono" type="number" data-testid="editor-order" value={form.order} onChange={(e) => set("order", e.target.value)} /></Field>
        </div>
      </>
    ),
  };

  return (
    <>
      <div className={"rl" + (dark ? " rl-dark" : "") + (peek ? " rl-peeking" : "") + (sec === "themes" ? (wtFull ? " rl-full" : " rl-wide") : "")} style={{ "--rl-acc": acc }} data-testid={peek ? "editor-dialog-peek" : "editor-dialog"} role="dialog" aria-label={isEdit ? "Modifier la création" : "Nouvelle création"}>
        <header className="rl-top">
          <button type="button" className="rl-ico" onClick={tryClose} aria-label="Fermer" data-testid="editor-close"><IoClose size={20} /></button>
          <div className="rl-brand"><small>RHINE LAB · ATELIER DE L'ŒUVRE</small><b>{form.title || (isEdit ? "Sans titre" : "Nouvelle création")}</b></div>
          <span className={"rl-state" + (fullState === "loading" ? " load" : dirty ? " dirty" : "")}>{fullState === "loading" ? "CHARGEMENT…" : fullState === "error" ? "INCOMPLET" : dirty ? "NON ENREGISTRÉ" : "À JOUR"}</span>
          <div className="rl-top-acts">
            <button type="button" className="rl-ico" onClick={toggleDark} title={dark ? "Mode clair" : "Mode sombre"} aria-label={dark ? "Mode clair" : "Mode sombre"} data-testid="editor-dark">{dark ? <IoSunnyOutline size={17} /> : <IoMoonOutline size={17} />}</button>
            {isEdit && <button type="button" className={"rl-btn ghost" + (showHistory ? " set" : "")} onClick={() => setShowHistory((v) => !v)} data-testid="editor-history"><IoTimeOutline /> <span>Historique</span></button>}
            {onPeek && <button type="button" className="rl-btn ghost" onClick={() => setPeek(true)} data-testid="editor-peek"><IoEyeOutline /> <span>Voir dans le monde</span></button>}
            <button type="button" className="rl-btn go" onClick={save} disabled={saving} data-testid="editor-save">{saving ? "Enregistrement…" : <><IoCheckmark /> Enregistrer</>}</button>
          </div>
        </header>

        {draft && fullState === "ok" && (
          <div className="rl-draft" data-testid="editor-draft">
            <span>Un brouillon non enregistré du {new Date(draft.at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} existe{draft.light ? " (sans les images)" : ""}.</span>
            <button type="button" className="rl-btn go" onClick={() => { setForm((f) => ({ ...f, ...draft.form })); setDirty(true); setDraft(null); toast.success("Brouillon repris"); }} data-testid="editor-draft-restore">Reprendre le brouillon</button>
            <button type="button" className="rl-btn ghost" onClick={() => { dropDraft(initial?.id); setDraft(null); }}>Ignorer</button>
          </div>
        )}
        <nav className="rl-nav" aria-label="Sections">
          {SECTIONS.map(([k, l], i) => (
            <button type="button" key={k} className={sec === k ? "on" : ""} onClick={() => setSec(k)} data-testid={`editor-sec-${k}`}>
              <i>{String(i + 1).padStart(2, "0")}</i><span>{l}</span>{count[k] != null && <em>{count[k]}</em>}
            </button>
          ))}
          <p className="rl-keys"><kbd>Ctrl</kbd>+<kbd>S</kbd> enregistrer · <kbd>Échap</kbd> fermer</p>
        </nav>

        <main className="rl-main" key={sec + (showHistory ? "h" : "")}>
          {showHistory && isEdit ? (
            <section className="rl-hist"><VersionHistory creationId={initial.id} onRestored={(full) => { setForm({ ...empty, ...full }); setFullState("ok"); setDirty(false); onSaved?.(full); }} /></section>
          ) : (
            <section className="rl-sec">
              <header className="rl-sec-h"><i>{String(SECTIONS.findIndex(([k]) => k === sec) + 1).padStart(2, "0")}</i><h2>{SECTIONS.find(([k]) => k === sec)[1]}</h2></header>
              {body[sec]}
              <footer className="rl-sec-f">
                {sec !== "id" && <button type="button" className="rl-btn ghost" onClick={() => setSec(SECTIONS[SECTIONS.findIndex(([k]) => k === sec) - 1][0])}><IoArrowBack /> {SECTIONS[SECTIONS.findIndex(([k]) => k === sec) - 1][1]}</button>}
                {sec !== "publish" && <button type="button" className="rl-btn" onClick={() => setSec(SECTIONS[SECTIONS.findIndex(([k]) => k === sec) + 1][0])}>{SECTIONS[SECTIONS.findIndex(([k]) => k === sec) + 1][1]} →</button>}
              </footer>
            </section>
          )}
        </main>

        <aside className="rl-side" aria-label="Aperçu">
          <p className="rl-lbl">APERÇU · {(wsMine ? wsMine.name : WORLD_STYLES[ws] || "").toUpperCase()}</p>
          <div className={"rl-mini big m-" + ws} style={{ "--a": acc, backgroundImage: bgPrev ? `url(${bgPrev})` : undefined }}>
            <b>{form.title || "Titre"}</b>{form.tagline && <small>{form.tagline}</small>}<i /><i /><i />
          </div>
          <div className="rl-card">
            {cover ? <img src={cover} alt="" /> : <span className="rl-card-ph">{form.kanji || "?"}</span>}
            <div><small>{catLabel}</small><b>{form.title || "Sans titre"}</b>{units && <span>{units.length} {form.launch_type === "chapters" ? "chapitre(s)" : "épisode(s)"}</span>}</div>
          </div>
          <p className="rl-lbl">PRÊT À PUBLIER</p>
          <ul className="rl-check">
            {checks.map(([l, ok, s]) => <li key={l} className={ok ? "ok" : ""}><button type="button" onClick={() => setSec(s)}><i>{ok ? <IoCheckmark /> : ""}</i>{l}</button></li>)}
          </ul>
        </aside>

        {askLeave && (
          <div className="rl-ask" role="alertdialog">
            <p><b>Des modifications ne sont pas enregistrées.</b> Les garder ?</p>
            <button type="button" className="rl-btn go" onClick={() => { setAskLeave(false); save(); }}>Enregistrer</button>
            <button type="button" className="rl-btn ghost" onClick={() => { dropDraft(initial?.id); close(); }} data-testid="editor-discard">Quitter sans enregistrer</button>
            <button type="button" className="rl-btn ghost" onClick={() => setAskLeave(false)}>Rester</button>
          </div>
        )}
      </div>

      {peek && (
        <div className="rl-peekbar" style={{ "--rl-acc": acc }}>
          <span><IoEyeOutline /> Aperçu en direct · rien n'est enregistré</span>
          <button type="button" className="rl-btn ghost" onClick={() => setPeek(false)} data-testid="editor-peek-back">Revenir à l'atelier</button>
          <button type="button" className="rl-btn go" onClick={save} disabled={saving}>{saving ? "…" : "Enregistrer"}</button>
        </div>
      )}

      {pick && <CoverDialog b={{ id: "sn-" + (form.id || "new"), title: form.title || pick.label, room: /manga|anime/i.test(catLabel) ? "manga" : form.launch_type === "game" ? "jeux" : "cinema", format: form.launch_type === "game" || form.launch_type === "episodes" ? "vhs" : /musique|music|album/i.test(catLabel) ? "vinyle" : "livre" }}
        current={pick.cur && pick.cur.length > 4 && !/^data:/.test(pick.cur) ? pick.cur : ""} onSave={(u) => { if (u) pick.put(u); setPick(null); }} onClose={() => setPick(null)} />}
      {wUnit && (
        <PageWriter kicker={`${form.title || "Création"} · ${writing.key === "episodes" ? "Épisode" : "Chapitre"} ${writing.i + 1}`}
          title={wUnit.title} onTitle={(v) => updUnit({ title: v })}
          html={unitHtml(wUnit)} onHtml={(v) => updUnit({ content: v, rich: true })} image={wUnit.image}
          creationId={isEdit ? initial.id : form.id} onClose={() => setWriting(null)} onSave={save} saving={saving} saveLabel="Enregistrer la création"
          note="« Retour » garde ton texte dans l'atelier ; « Enregistrer la création » le sauvegarde définitivement." />
      )}
    </>
  );
}
