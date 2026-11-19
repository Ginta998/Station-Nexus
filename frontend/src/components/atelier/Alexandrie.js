import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { playPageTurn } from "@/lib/sound";
import { createPortal } from "react-dom";
import { IoArrowBack, IoArrowForward, IoClose, IoAdd, IoBookmark, IoBookmarkOutline, IoList, IoSearch, IoStar, IoStarOutline, IoOpenOutline, IoImageOutline, IoMusicalNotes, IoPlay, IoPause, IoLogoYoutube, IoCreateOutline, IoTrashOutline, IoCloudUploadOutline, IoHeart, IoHeartOutline, IoExpandOutline, IoContractOutline } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi } from "@/lib/atelier";
import { uploadJournalImage } from "@/lib/api";
import { DEFAULT_COVERS, mergeCovers, sgdbTerm } from "@/data/alexandrie/covers";
import { IoImagesOutline, IoCheckmarkCircle, IoTimeOutline, IoClipboardOutline, IoDownloadOutline, IoPencil, IoPrintOutline, IoSwapHorizontal, IoArrowUndo, IoVolumeHighOutline, IoVolumeMuteOutline, IoGridOutline, IoLibraryOutline, IoPlaySkipForward, IoListOutline, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { lookOf, WEB_FONTS, fontHref } from "@/data/alexandrie/looks";
import { SEP, parsePaste, pasteToBook, bookToPaste, nextCote, withCote, setCatalog } from "@/data/alexandrie/paste";
import AlexPaste from "@/components/atelier/AlexPaste";
import { Controls, Progress, Queue, thumb as ytThumb, coverOf } from "@/components/atelier/Radio";
import { pressMenu } from "@/components/atelier/ContextMenu";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";

import { ROOMS, TYPES, BOOKS, UPCOMING, parseBook, readingTime } from "@/data/alexandrie";
import { stripHtml } from "@/lib/atelier";
import { useApp } from "@/context/AppContext";
import { playLaunch, getLaunchSound, useLaunchSync } from "@/lib/launchSound";
import "@/components/nexus/nexus.css";
import "@/components/atelier/alexandrie.css";
import { AlexSearch, CoverDialog, Face, Grid, LS, NOEDITS, Reader, Room, asPaste, autoIllustrate, bodyEdit, bookNotes, bookToHtml, clean, errText, exportBook, fmtOf, hue, itemToBook, itemToBookRaw, normT, notesItemOf, notesOf, read, splitSrc, volLook, write, ytDel, ytIns, ytSwap } from "@/components/atelier/AlexCore";
setCatalog(BOOKS);
// compatibilité : les autres fichiers importaient ces pièces d'ici
export { Face, Rail, Reader, CoverDialog, htmlToAlexBlocks } from "@/components/atelier/AlexCore";

export default function Alexandrie({ at, open, radio, room: startRoom, book: startBook }) {
  const { sfx, uiVolume = 0.6, muted } = useApp();
  useLaunchSync();
  // L'ouverture d'un livre, comme sur la station : l'objet en volume, le son de lancement, puis la lecture
  const [launching, setLaunching] = useState(null);
  useEffect(() => { if (!launching) return undefined; const t = setTimeout(() => { setReading(launching); setLaunching(null); }, 1650); return () => clearTimeout(t); }, [launching]);
  const [room, setRoom] = useState(startRoom || null);
  useEffect(() => { setRoom(startRoom || null); }, [startRoom]);
  const [type, setType] = useState("all");
  const [view, setView] = useState(() => read(LS.view, "rayon"));
  const pickView = (v) => { setView(v); write(LS.view, v); sfx?.("select"); };
  const [search, setSearch] = useState(false);
  const [reading, setReading] = useState(null);
  const [sel, setSel] = useState({});
  const [coverFor, setCoverFor] = useState(null);
  const [wish, setWish] = useState(() => read(LS.wish, []));
  // Titres à paraître retirés des rayons. Gardés sur le serveur (tous les appareils) et dans le navigateur.
  const srvHid = at.config?.alexandrie?.hiddenUp;
  const [hidUp, setHidUp] = useState(() => srvHid || read(LS.hideUp, []));
  useEffect(() => { if (srvHid) setHidUp(srvHid); }, [JSON.stringify(srvHid || null)]); // eslint-disable-line react-hooks/exhaustive-deps
  const saveHid = (h) => { setHidUp(h); write(LS.hideUp, h); at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), hiddenUp: h } }).catch(() => {}); };
  // Mes lectures : lus, à lire, coups de cœur. Gardés sur le serveur (tous les appareils) et dans le navigateur.
  const [shelf, setShelf] = useState(() => ({ read: [], want: [], fav: read(LS.fav, []), ...read(LS.shelf, {}), ...(at.config?.alexandrie?.shelf || {}) }));
  const srvShelf = at.config?.alexandrie?.shelf;
  useEffect(() => { if (srvShelf) setShelf((x) => ({ ...x, ...srvShelf })); }, [JSON.stringify(srvShelf || null)]); // eslint-disable-line react-hooks/exhaustive-deps
  const saveShelf = (sh) => { setShelf(sh); write(LS.shelf, sh); at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), shelf: sh } }).catch(() => {}); };
  const setStatus = (k, id, on) => { const has = shelf[k].includes(id); const want = on ?? !has; if (want === has) return;
    const sh = { ...shelf, [k]: want ? [id, ...shelf[k]] : shelf[k].filter((x) => x !== id) };
    if (want && k === "read") sh.want = sh.want.filter((x) => x !== id); if (want && k === "want") sh.read = sh.read.filter((x) => x !== id);
    saveShelf(sh); sfx?.("select"); };
  const favs = shelf.fav; const toggleFav = (id) => setStatus("fav", id);
  const stOf = (id) => ({ read: shelf.read.includes(id), want: shelf.want.includes(id), fav: shelf.fav.includes(id) });
  const [stf, setStf] = useState("all"); const [mineTab, setMineTab] = useState(null);
  const [readNotes, setReadNotes] = useState(false);
  const [localCovers, setLocalCovers] = useState(() => read(LS.covers, {}));
  const [bad, setBad] = useState({});
  const rawCovers = { ...localCovers, ...(at.config?.alexandrie?.covers || {}) };
  const covers = mergeCovers(localCovers, at.config?.alexandrie?.covers, bad);
  // Un artwork par défaut qui ne répond pas est écarté : le volume garde sa couverture dessinée.
  useEffect(() => { Object.values(DEFAULT_COVERS).forEach((u) => { const im = new Image(); im.onerror = () => setBad((x) => ({ ...x, [u]: 1 })); im.src = u; }); }, []);
  const prog = read(LS.prog, {});
  // Livres de la bibliothèque. Les modifier ouvre une copie dans l'éditeur de documents (le même que pour écrire un livre) :
  // la copie remplace le livre sur les rayons, l'original reste dans le code et revient d'un clic.
  const edits = at.config?.alexandrie?.edits || NOEDITS;
  const overrides = useMemo(() => Object.fromEntries(at.items.filter((i) => i.fields?.alexandrie?.of).map((i) => [i.fields.alexandrie.of, i])), [at.items]);
  const rawOf = (b) => ({ ...b, ...(edits[b.id] || {}) });
  const books = useMemo(() => BOOKS.map((b) => {
    const base = (() => { try { return parseBook(rawOf(b)); } catch (_) { return parseBook(b); } })();
    const o = overrides[b.id]; if (!o) return edits[b.id] ? { ...base, edited: true } : base;
    if (o.fields.alexandrie.src) { try { const x = pasteToBook(o.fields.alexandrie.src, { id: b.id }); return { ...base, ...x, id: b.id, cote: x.cote === "PERS." ? base.cote : x.cote, edited: true, copyId: o.id }; } catch (_) { return base; } }
    try { const x = itemToBookRaw(o); const a = o.fields.alexandrie; return { ...base, title: o.title || base.title, sub: a.sub ?? base.sub, about: a.about ?? base.about, chapters: x.chapters, words: x.words, text: x.text, edited: true, copyId: o.id }; } catch (_) { return base; }
  }), [edits, overrides]); // eslint-disable-line react-hooks/exhaustive-deps
  // Modifier par copier-coller : le texte complet du livre (réglages + chapitres) s'ouvre dans la fenêtre de collage.
  const [paste, setPaste] = useState(null); // { text, item?, of?, title? }
  const itemOf = (b) => (b.itemId ? at.items.find((i) => i.id === b.itemId) : overrides[b.id]);
  const modifyBook = (b) => {
    const it = itemOf(b);
    if (it && !it.fields?.alexandrie?.src) { setReading(null); open(it.id, "document"); return; } // écrit dans l'éditeur : il s'y modifie
    setReading(null);
    setPaste({ text: it ? it.fields.alexandrie.src : asPaste(rawBook(b)), item: it, of: it ? undefined : b.id, title: b.title });
  };
  const rawBook = (b) => { const r = rawOf(BOOKS.find((x) => x.id === b.id) || b); return { ...b, ...r }; };
  // Illustrer automatiquement : une image par chapitre qui n'en a pas, sans doublon ; le texte s'ouvre dans la fenêtre de collage pour relecture
  const [illBusy, setIllBusy] = useState(false);
  const illustrate = async (b) => {
    const it = itemOf(b);
    if (it && !it.fields?.alexandrie?.src) { toast.info("Ce livre s'écrit dans l'éditeur : ajoute les images depuis l'éditeur, ou copie-colle-le d'abord."); return; }
    if (illBusy) return; setIllBusy(true);
    const tid = toast.loading(`Recherche d'images pour « ${b.title} »…`);
    try {
      const text = it ? it.fields.alexandrie.src : asPaste(rawBook(b));
      const parsed = pasteToBook(text, { id: b.id });
      const r = await autoIllustrate(text, { ...parsed, id: b.id, room: parsed.room || b.room, format: parsed.format || b.format }, covers[b.id]);
      toast.dismiss(tid);
      if (!r.added) { toast.info(r.found ? "Chaque chapitre a déjà son image." : "Aucune image libre trouvée pour ce livre. Ajoute une ligne ILLUSTRATIONS (anime:, manga:, ol:, sgdb:, commons:) puis réessaie."); return; }
      setReading(null);
      setPaste({ text: r.text, item: it, of: it ? undefined : b.id, title: b.title });
      toast.success(`${r.added} image${r.added > 1 ? "s" : ""} ajoutée${r.added > 1 ? "s" : ""} sur ${r.chapters} chapitres. Vérifie avec « Lire l'aperçu », puis enregistre.`);
    } catch (e) { toast.dismiss(tid); toast.error("La recherche d'images a échoué : " + (e?.message || "erreur")); }
    finally { setIllBusy(false); }
  };
  // Méthode classique : une copie du livre dans l'éditeur de documents
  const modifyInEditor = async (b) => {
    if (b.mine) { setReading(null); open(b.itemId); return; }
    if (overrides[b.id]) { setReading(null); open(overrides[b.id].id); return; }
    const raw = rawOf(BOOKS.find((x) => x.id === b.id) || b);
    try {
      const it = await at.createItem({ kind: "document", title: raw.title, content: bookToHtml(raw.text), tags: ["alexandrie"], fields: { alexandrie: { of: b.id, room: b.room, type: b.type, sub: raw.sub || "", about: raw.about || "" } } });
      if (!it?.id) throw new Error("création refusée");
      setReading(null); open(it.id, "document");
      toast.success("Le livre s'ouvre dans l'éditeur. Tes changements apparaîtront sur les rayons.");
    } catch (e) { toast.error("Le livre n'a pas pu être ouvert : " + (e?.response?.data?.detail || e?.message || "erreur")); }
  };
  // Vidéos : dans le texte collé du livre (ou sa copie), sinon dans le document de l'éditeur. Un livre du code reçoit une copie.
  const editVideos = async (b, fn, htmlFn, ok) => {
    const it = itemOf(b);
    try {
      if (it?.fields?.alexandrie?.src) { const src = fn(it.fields.alexandrie.src); await at.saveItem({ ...clean(it), content: bookToHtml(splitSrc(src).body), fields: { ...it.fields, alexandrie: { ...it.fields.alexandrie, src } } }); }
      else if (it) { const doc = new DOMParser().parseFromString(`<div>${it.content || ""}</div>`, "text/html").body.firstChild; htmlFn(doc); await at.saveItem({ ...clean(it), title: it.title || b.title, content: doc.innerHTML }); }
      else { const src = fn(asPaste(rawBook(b))); const r = rawBook(b);
        const made = await at.createItem({ kind: "document", title: r.title, content: bookToHtml(splitSrc(src).body), tags: ["alexandrie"], fields: { alexandrie: { of: b.id, src, room: b.room, type: b.type, sub: r.sub || "", about: r.about || "" } } });
        if (!made?.id) throw new Error("le serveur n'a pas créé la copie"); }
      toast.success(ok); sfx?.("select"); return true;
    } catch (e) { console.error("[Alexandrie] vidéo", e); toast.error("La vidéo n'a pas pu être modifiée : " + errText(e)); return false; }
  };
  const ytNodes = (doc, id) => [...doc.childNodes].filter((n) => n.nodeType === 1 && (n.innerHTML || "").includes(id));
  const swapVideo = (b, oldId, newId) => editVideos(b, (src) => bodyEdit(src, ytSwap(oldId, newId)), (doc) => ytNodes(doc, oldId).forEach((n) => { n.innerHTML = n.innerHTML.split(oldId).join(newId); }), "Vidéo remplacée");
  const removeVideo = (b, id) => editVideos(b, (src) => bodyEdit(src, ytDel(id)), (doc) => ytNodes(doc, id).forEach((n) => n.remove()), "Vidéo supprimée");
  // Ajouter une vidéo à la page où l'on est : juste après le dernier paragraphe qui commence sur cette page.
  const addVideo = (b, si, id, cap) => { const line = `@yt ${id} | ${cap || "Vidéo"}`;
    return editVideos(b, (src) => bodyEdit(src, ytIns(si, line)), (doc) => {
      const p = document.createElement("p"); const a = document.createElement("a"); a.href = `https://www.youtube.com/watch?v=${id}`; a.textContent = `▶ ${cap || "Vidéo"}`; p.appendChild(a);
      const ref = doc.childNodes[si]; if (ref) ref.after(p); else doc.appendChild(p); }, "Vidéo ajoutée à cette page"); };
  const revertEdit = async (b) => {
    if (!(await labConfirm(`Revenir au texte d'origine de « ${b.title} » ? Tes modifications seront perdues.`))) return;
    try {
      if (overrides[b.id]) await at.removeItem(overrides[b.id].id);
      if (edits[b.id]) { const e = { ...edits }; delete e[b.id]; await at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), edits: e } }); }
      toast.success("Texte d'origine rétabli");
    } catch (_) { toast.error("Le texte d'origine n'a pas pu être rétabli"); }
  };
  const menuFor = (b, upc) => () => ({ title: b.title, entries: [
    !upc && { id: "read", label: prog[b.id]?.page > 0 ? `Reprendre page ${prog[b.id].page + 1}` : "Lire", icon: <IoPlay size={14} />, onClick: () => openBook(b) },
    upc && { id: "wish", label: wish.includes(b.id) ? "Ne plus demander" : "Je veux le lire", icon: <IoStarOutline size={14} />, onClick: () => toggleWish(b.id) },
    upc && { id: "up-write", label: "Écrire ce livre", icon: <IoCreateOutline size={14} />, onClick: () => writeUp(b) },
    !upc && { id: "modify", label: b.mine && !b.src ? "Écrire" : "Modifier (copier-coller)", icon: <IoCreateOutline size={14} />, onClick: () => modifyBook(b) },
    !upc && !(b.mine && !b.src) && { id: "illustrate", label: "Illustrer automatiquement", icon: <IoImagesOutline size={14} />, onClick: () => illustrate(b) },
    !upc && !b.mine && !b.edited && { id: "modify-ed", label: "Modifier dans l'éditeur", icon: <IoPencil size={14} />, onClick: () => modifyInEditor(b) },
    !upc && { id: "copy", label: "Copier le texte du livre", icon: <IoClipboardOutline size={14} />, onClick: () => navigator.clipboard?.writeText(asPaste(b.mine || b.edited ? b : rawBook(b))).then(() => toast.success("Texte copié : il se colle tel quel dans « Coller un livre »"), () => toast.error("La copie n'a pas marché")) },
    "-",
    !upc && { id: "st-read", label: shelf.read.includes(b.id) ? "Retirer de « Lus »" : "Marquer comme lu", icon: <IoCheckmarkCircle size={14} />, onClick: () => setStatus("read", b.id) },
    !upc && { id: "st-want", label: shelf.want.includes(b.id) ? "Retirer de « À lire »" : "À lire", icon: <IoTimeOutline size={14} />, onClick: () => setStatus("want", b.id) },
    !upc && { id: "fav", label: favs.includes(b.id) ? "Retirer des coups de cœur" : "Coup de cœur", icon: favs.includes(b.id) ? <IoHeart size={14} /> : <IoHeartOutline size={14} />, onClick: () => toggleFav(b.id) },
    !upc && { id: "pdf", label: "Exporter en PDF", icon: <IoPrintOutline size={14} />, onClick: () => exportBook(b, covers[b.id], bookNotes(at, b.id, 0)) },
    "-",
    { id: "cover", label: covers[b.id] ? "Changer l'artwork" : "Mettre un artwork", icon: <IoImageOutline size={14} />, onClick: () => setCoverFor(b) },
    covers[b.id] && { id: "uncover", label: "Retirer l'artwork", icon: <IoTrashOutline size={14} />, onClick: () => saveCover(b.id, "") },
    DEFAULT_COVERS[b.id] && covers[b.id] !== DEFAULT_COVERS[b.id] && { id: "recover", label: "Remettre l'artwork d'origine", icon: <IoArrowUndo size={14} />, onClick: () => saveCover(b.id, null) },
    !upc && b.edited && "-",
    !upc && b.edited && { id: "revert", label: "Revenir au texte d'origine", icon: <IoArrowUndo size={14} />, danger: true, onClick: () => revertEdit(b) },
    upc && "-",
    upc && { id: "up-hide", label: "Retirer des titres à paraître", icon: <IoTrashOutline size={14} />, danger: true, onClick: () => hideUp(b) },
    b.mine && "-",
    b.mine && { id: "del", label: "Supprimer le livre", icon: <IoTrashOutline size={14} />, danger: true, onClick: () => deleteBook(b) },
  ] });
  const deleteBook = async (b) => {
    if (!(await labConfirm(`Supprimer « ${b.title} » ? Il disparaîtra des rayons et du Nexus Drive.`))) return;
    try { await at.removeItem(b.itemId); toast.success("Livre supprimé"); } catch (e) { toast.error("Le livre n'a pas pu être supprimé : " + errText(e)); }
  };
  // Un titre à paraître : l'écrire (la fenêtre de collage s'ouvre avec ses réglages) ou le retirer des rayons.
  const writeUp = (b) => {
    const T = TYPES[b.type]; setReading(null);
    setPaste({ up: b.id, text: `// Les réglages viennent du titre à paraître. Écris ou colle le livre sous la ligne ---.\nTITRE : ${b.title}\n${b.sub ? `SOUS-TITRE : ${b.sub}\n` : ""}SALLE : ${b.room}\nGENRE : ${T ? T.label.toLowerCase() : "récit"}\nFORMAT : ${b.format || "livre"}\n---\n\n# Premier chapitre\n\nLe texte du chapitre.\n` });
  };
  const hideUp = async (b) => {
    if (!(await labConfirm(`Retirer « ${b.title} » des titres à paraître ? Tu pourras le remettre en bas de la bibliothèque.`))) return;
    saveHid([...hidUp.filter((x) => x !== b.id), b.id]);
    if (wish.includes(b.id)) { const w = wish.filter((x) => x !== b.id); setWish(w); write(LS.wish, w); }
    toast.success(`« ${b.title} » retiré des rayons`); sfx?.("select");
  };
  const restoreUp = () => { saveHid([]); toast.success("Titres à paraître remis sur les rayons"); sfx?.("select"); };
  // Enregistrer ce qui a été collé : un livre modifié, ou un ou plusieurs livres nouveaux.
  const savePaste = async (blocks) => {
    const roomNow = R?.key; const made = [];
    try {
      if (paste.item || paste.of) {
        const src = blocks[0]; const { meta, body } = parsePaste(src); const fa = { room: meta.room, type: meta.type, sub: meta.sub, about: meta.about };
        if (paste.item) await at.saveItem({ ...clean(paste.item), title: meta.title, content: bookToHtml(body), fields: { ...paste.item.fields, alexandrie: { ...paste.item.fields.alexandrie, ...fa, src } } });
        else { const it = await at.createItem({ kind: "document", title: meta.title, content: bookToHtml(body), tags: ["alexandrie"], fields: { alexandrie: { of: paste.of, ...fa, src } } }); if (!it?.id) throw new Error("création refusée"); }
        if (blocks.length > 1) toast("Seul le premier livre a été gardé : la modification porte sur un seul volume.");
        toast.success(`« ${meta.title} » enregistré`);
      } else {
        const sh = { ...shelf, read: [...shelf.read], want: [...shelf.want], fav: [...shelf.fav] }; const cv = {};
        for (const t0 of blocks) {
          let { meta } = parsePaste(t0);
          if (!/^\s*salle\s*:/im.test(t0) && roomNow) meta = { ...meta, room: roomNow }; // collé dans une salle : il y reste
          const src = meta.cote ? t0 : withCote(t0, nextCote(meta.room, [...all, ...made]));
          const { body } = parsePaste(src); const fa = { room: meta.room, type: meta.type, sub: meta.sub, about: meta.about };
          const it = await at.createItem({ kind: "document", title: meta.title, content: bookToHtml(body), tags: ["alexandrie"], fields: { alexandrie: { ...fa, src: /^\s*salle\s*:/im.test(src) ? src : src.replace(/^(\s*titre\s*:.*)$/im, `$1\nSALLE : ${meta.room}`) } } });
          if (!it?.id) throw new Error("création refusée");
          const id = "item:" + it.id; made.push({ id, cote: parsePaste(src).meta.cote, room: meta.room });
          if (meta.status) { sh[meta.status] = [id, ...sh[meta.status]]; if (meta.status === "read") sh.want = sh.want.filter((x) => x !== id); }
          if (meta.cover) cv[id] = meta.cover;
        }
        if (made.length) { if (JSON.stringify(sh) !== JSON.stringify(shelf)) saveShelf(sh);
          if (Object.keys(cv).length) { const c = { ...rawCovers, ...cv }; setLocalCovers(c); write(LS.covers, c); at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), covers: c } }).catch(() => {}); } }
        if (paste.up && made.length && !hidUp.includes(paste.up)) saveHid([...hidUp, paste.up]); // écrit : il quitte les titres à paraître
        toast.success(made.length > 1 ? `${made.length} livres ajoutés aux rayons` : "Livre ajouté aux rayons");
      }
      sfx?.("select"); setPaste(null);
    } catch (e) { console.error("[Alexandrie] collage", e); toast.error(`Enregistrement interrompu${made.length ? ` après ${made.length} livre(s)` : ""} : ${errText(e)}`); }
  };
  // Exporter mes livres : tous les livres écrits ou collés, et les copies modifiées, dans un seul fichier à recoller.
  const exportMine = () => {
    const list = [...books.filter((b) => b.edited), ...mine];
    if (!list.length) { toast("Aucun livre à exporter pour l'instant : seuls tes livres et tes copies modifiées le sont."); return; }
    const txt = list.map(asPaste).join("\n\n=====\n\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain;charset=utf-8" }));
    a.download = `alexandrie-mes-livres-${new Date().toISOString().slice(0, 10)}.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast.success(`${list.length} livre${list.length > 1 ? "s" : ""} exporté${list.length > 1 ? "s" : ""}. Le fichier se recolle tel quel.`);
  };
  const mine = useMemo(() => at.items.filter((i) => i.fields?.alexandrie && !i.fields.alexandrie.of).map(itemToBook), [at.items]);
  const all = useMemo(() => [...books, ...mine], [books, mine]);
  // Un titre à paraître disparaît quand il est retiré, ou quand un de tes livres porte le même titre.
  // Titres à paraître ajoutés à la main (titre + sous-titre), gardés sur le serveur avec la bibliothèque
  const customUp = useMemo(() => (at.config?.alexandrie?.customUp || []).map((u) => ({ ...u, type: u.type || "recit", format: u.format || (u.room === "lore" ? "vhs" : u.room === "musique" ? "vinyle" : "livre") })), [at.config]);
  const upcoming = useMemo(() => { const own = new Set(mine.map((b) => normT(b.title))); return [...customUp, ...UPCOMING].filter((u) => !hidUp.includes(u.id) && !own.has(normT(u.title))); }, [hidUp, mine, customUp]);
  const addUp = async (room) => {
    const title = (await labPrompt("Titre du livre à paraître"))?.trim(); if (!title) return;
    const sub = (await labPrompt("Sous-titre (facultatif)"))?.trim() || "";
    const u = { id: "up-mine-" + Date.now().toString(36), room, title, sub };
    await at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), customUp: [...(at.config?.alexandrie?.customUp || []), u] } });
    setSel((x) => ({ ...x, [room]: u.id })); toast.success(`« ${title} » ajouté aux titres à paraître`); sfx?.("select");
  };
  const readingBook = reading && (all.find((b) => b.id === reading.id) || reading);
  const match = (b) => (type === "all" || b.type === type) && (stf === "all" || shelf[stf].includes(b.id));
  const matchUp = (b) => (type === "all" || b.type === type) && (stf === "all" || (stf === "want" && wish.includes(b.id)));
  useEffect(() => { if (!startBook) return; const b = all.find((x) => x.id === startBook); if (b) { setSel((x) => ({ ...x, [b.room]: b.id })); setReading(b); } }, [startBook]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = all.filter((b) => prog[b.id] && prog[b.id].page > 0 && prog[b.id].page < (prog[b.id].pages || 1) - 1).sort((a, b) => prog[b.id].at - prog[a.id].at).slice(0, 4);
  const toggleWish = (id) => { const w = wish.includes(id) ? wish.filter((x) => x !== id) : [...wish, id]; setWish(w); write(LS.wish, w); sfx?.("select"); };
  const addBook = async (rk) => {
    try {
      const it = await at.createItem({ kind: "document", title: "Nouveau livre", content: "<h2>Chapitre 1</h2><p>Écris ici. Chaque titre ouvre un nouveau chapitre.</p>", tags: ["alexandrie"], fields: { alexandrie: { room: typeof rk === "string" && rk ? rk : "atelier", type: "recit" } } });
      if (it?.id) open(it.id, "document"); else toast.error("Le livre n'a pas pu être créé");
    } catch (e) { toast.error("Le livre n'a pas pu être créé : " + (e?.response?.data?.detail || e?.message || "erreur")); }
  };
  const openBook = (b) => {
    setSearch(false);
    const fmt = volLook(b).fmt;
    playLaunch(muted ? 0 : uiVolume, getLaunchSound(fmt === "vhs" || fmt === "vinyle" ? fmt : "livre"));
    if (b.preview || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setReading(b); return; }
    setLaunching(b);
  };
  const enter = (k) => { sfx?.("open"); setRoom(k); document.querySelector(".at-main, main")?.scrollTo?.({ top: 0 }); };
  // Habiller une salle : pour chaque cassette sans artwork choisi par toi, prend le mieux noté sur SteamGridDB.
  const [dressing, setDressing] = useState(false);
  const dressRoom = async (list) => {
    const todo = list.filter((b) => fmtOf(b) === "vhs" && !rawCovers[b.id]);
    if (!todo.length) { toast("Toutes les cassettes de cette salle ont déjà un artwork choisi."); return; }
    setDressing(true); const t = toast.loading(`Artworks : 0 / ${todo.length}`); const found = {}; let miss = 0;
    for (let i = 0; i < todo.length; i++) {
      try { const r = await atelierApi.sgdbSearch(sgdbTerm(todo[i])); if (r?.items?.[0]) found[todo[i].id] = r.items[0].url; else miss++; }
      catch (e) { const st = e?.response?.status; if (st === 503 || st === 404) { toast.error(st === 404 ? "La recherche SteamGridDB n'est pas encore installée sur le serveur de la Station." : e.response.data?.detail || "Clé SteamGridDB absente", { id: t }); setDressing(false); return; } miss++; }
      toast.loading(`Artworks : ${i + 1} / ${todo.length}`, { id: t });
    }
    const c = { ...rawCovers, ...found }; setLocalCovers(c); write(LS.covers, c); at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), covers: c } }).catch(() => {});
    toast.success(`${Object.keys(found).length} artworks posés${miss ? `, ${miss} introuvables` : ""}. Change ceux qui ne te plaisent pas.`, { id: t });
    setDressing(false);
  };
  // url : une adresse = cet artwork ; "" = retiré (couverture dessinée) ; null = artwork d'origine.
  const saveCover = (id, url) => { const c = { ...rawCovers }; if (url === null) delete c[id]; else if (url) c[id] = url; else if (DEFAULT_COVERS[id]) c[id] = "-"; else delete c[id]; setLocalCovers(c); write(LS.covers, c); at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), covers: c } }).catch(() => {}); setCoverFor(null); };
  // « / » ouvre l'index, Échap revient au plan
  useEffect(() => {
    const k = (e) => { if (reading || coverFor || search) return; if (/^(INPUT|TEXTAREA)$/.test(e.target?.tagName) || e.target?.isContentEditable) return;
      if (e.key === "/") { e.preventDefault(); setSearch(true); } if (e.key === "Escape" && room) { setRoom(null); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [reading, coverFor, search, room]);
  const R = ROOMS.find((r) => r.key === room); const ri = ROOMS.indexOf(R);
  const inRoom = (k) => ({ here: all.filter((b) => b.room === k), up: upcoming.filter((b) => b.room === k) });
  const searchBtn = <button className="ax-find" onClick={() => setSearch(true)} data-testid="alex-find"><IoSearch size={15} /><span>Chercher un titre, un nom, un mot dans un livre…</span><kbd className="mono">/</kbd></button>;

  return (
    <section className={"at-view ax-view" + (R ? " in-room" : "")} data-testid="alexandrie">
      {!R ? (
        <>
          <header className="ax-top">
            <div className="ax-top-t">
              <p className="at-eyebrow mono">// ALEXANDRIE · 図書館 · {all.length} VOLUMES · {upcoming.length} À PARAÎTRE</p>
              <h1>La bibliothèque</h1>
              <p className="ax-top-ab">Nérodus tient les rayonnages. Pousse une porte.</p>
            </div>
            <div className="ax-tools">{searchBtn}
              <button className="ax-ghost" onClick={() => setPaste({ text: "" })} data-testid="alex-paste-open"><IoClipboardOutline size={15} /> Coller un livre</button>
              <button className="at-btn" onClick={() => addBook("atelier")} data-testid="alex-add"><IoAdd size={16} /> Écrire un livre</button>
              <button className="ax-ghost ax-ico" onClick={exportMine} title="Exporter mes livres (un fichier texte à recoller)" aria-label="Exporter mes livres" data-testid="alex-export"><IoDownloadOutline size={15} /></button></div>
          </header>
          {current.length > 0 && (
            <div className="ax-current">
              <p className="mono">LECTURES EN COURS</p>
              <div>{current.map((b) => <button key={b.id} onClick={() => openBook(b)} style={{ "--h": b.color ?? hue(b.title) }}><b>{b.title}</b><small className="mono">PAGE {prog[b.id].page + 1} / {prog[b.id].pages}</small><span><i style={{ width: `${(prog[b.id].page / Math.max(1, prog[b.id].pages - 1)) * 100}%` }} /></span></button>)}</div>
            </div>
          )}
          {(shelf.read.length + shelf.want.length + shelf.fav.length > 0) && (() => {
            const k = mineTab || (shelf.want.length ? "want" : shelf.read.length ? "read" : "fav"); const list = shelf[k].map((id) => all.find((b) => b.id === id)).filter(Boolean);
            return (
              <div className="ax-mine" data-testid="alex-mine">
                <p className="mono ax-plan-t"><span>MES LECTURES · 読書</span><i /></p>
                <div className="ax-types" role="tablist" aria-label="Mes lectures">{[["want", "À lire"], ["read", "Lus"], ["fav", "Coups de cœur"]].map(([v, l]) => <button key={v} role="tab" aria-selected={k === v} className={k === v ? "on" : ""} onClick={() => setMineTab(v)} data-testid={`alex-mine-${v}`}>{l} · {shelf[v].filter((id) => all.some((b) => b.id === id)).length}</button>)}</div>
                {list.length ? <Grid list={list} upFrom={list.length} selId={null} onSel={(id) => { const b = all.find((x) => x.id === id); if (b) { setSel((x) => ({ ...x, [b.room]: b.id })); enter(b.room); } }} covers={covers} onOpen={(b) => openBook(b)} menuFor={menuFor} stOf={stOf} /> : <p className="ax-empty">Rien ici pour l'instant.</p>}
              </div>
            ); })()}
          <p className="mono ax-plan-t"><span>PLAN DES SALLES · 館内図</span><i /></p>
          <div className="ax-plan" data-testid="alex-plan">
            {ROOMS.map((r, i) => { const { here, up } = inRoom(r.key); const strip = [...here, ...up];
              return (
                <button key={r.key} className={"ax-door" + (r.key === "lore" ? " wide" : "")} onClick={() => enter(r.key)} data-testid={`alex-door-${r.key}`} style={{ animationDelay: `${i * 45}ms` }}>
                  <span className="ax-door-k" aria-hidden="true">{r.kanji}</span>
                  <span className="mono ax-door-n">SALLE {String(i + 1).padStart(2, "0")}<i>{here.length} À {r.format === "vhs" ? "VOIR" : "LIRE"} · {up.length} À VENIR</i></span>
                  <span className="ax-door-l">{r.label}</span>
                  <span className="ax-door-ab">{r.about}</span>
                  <span className="ax-door-strip" aria-hidden="true">{strip.map((b, j) => { const L = volLook(b, j >= here.length); return <i key={b.id} className={`t-${L.tone} f-${L.fmt}` + (j >= here.length ? " up" : "") + (covers[b.id] ? " img" : "")} style={{ "--h": b.color ?? hue(b.title), "--r": L.r % 40, "--lean": L.r % 7 === 0 ? "-4deg" : "0deg", width: Math.max(8, Math.round(L.w / 4)), height: Math.round(L.hgt / 4.9), "--img": covers[b.id] ? `url(${covers[b.id]})` : undefined }} />; })}</span>
                  <span className="mono ax-door-go">ENTRER <IoArrowForward size={13} /></span>
                </button>
              ); })}
          </div>
        </>
      ) : (
        <>
          <nav className="ax-crumb mono" aria-label="Où je suis">
            <button onClick={() => { sfx?.("close"); setRoom(null); }} data-testid="alex-plan-back"><IoArrowBack size={14} /> PLAN</button>
            <span>ALEXANDRIE / SALLE {String(ri + 1).padStart(2, "0")}</span>
            <i />
            {searchBtn}
            <button onClick={() => enter(ROOMS[(ri + ROOMS.length - 1) % ROOMS.length].key)} aria-label="Salle précédente"><IoArrowBack size={13} /> {ROOMS[(ri + ROOMS.length - 1) % ROOMS.length].label.toUpperCase()}</button>
            <button onClick={() => enter(ROOMS[(ri + 1) % ROOMS.length].key)} aria-label="Salle suivante">{ROOMS[(ri + 1) % ROOMS.length].label.toUpperCase()} <IoArrowForward size={13} /></button>
          </nav>
          <header className="ax-top ax-roomhead" key={R.key}>
            <span className="ax-plaque-k" aria-hidden="true">{R.kanji}</span>
            <div className="ax-top-t"><h1>{R.label}</h1><p className="ax-top-ab">{R.about}</p></div>
            <div className="ax-tools">
              <div className="ax-types" role="tablist" aria-label="Mes lectures">{[["all", "Tout"], ["read", "Lus"], ["want", "À lire"], ["fav", "Coups de cœur"]].map(([k, l]) => <button key={k} role="tab" aria-selected={stf === k} className={stf === k ? "on" : ""} onClick={() => setStf(k)} data-testid={`alex-stf-${k}`}>{l}</button>)}</div>
              <div className="ax-types" role="tablist" aria-label="Genre">{[["all", "Tous"], ...Object.entries(TYPES).map(([k, v]) => [k, v.label])].map(([k, l]) => <button key={k} role="tab" aria-selected={type === k} className={type === k ? "on" : ""} onClick={() => setType(k)}>{l}</button>)}</div>
              <div className="ax-viewsw" role="group" aria-label="Affichage">
                <button className={view === "rayon" ? "on" : ""} aria-pressed={view === "rayon"} onClick={() => pickView("rayon")} data-testid="alex-view-rayon"><IoLibraryOutline size={14} /> Rayon</button>
                <button className={view === "grille" ? "on" : ""} aria-pressed={view === "grille"} onClick={() => pickView("grille")} data-testid="alex-view-grille"><IoGridOutline size={14} /> Grille</button>
              </div>
              {R.format === "vhs" && <button className="ax-ghost" onClick={() => dressRoom([...inRoom(R.key).here, ...inRoom(R.key).up])} disabled={dressing} data-testid="alex-dress"><IoImageOutline size={15} /> {dressing ? "Recherche…" : "Habiller la salle"}</button>}
              <button className="ax-ghost" onClick={() => addUp(R.key)} data-testid="alex-up-add"><IoTimeOutline size={15} /> À paraître</button>
              <button className="ax-ghost" onClick={() => setPaste({ text: "" })} data-testid="alex-paste-open"><IoClipboardOutline size={15} /> Coller</button>
              <button className="at-btn" onClick={() => addBook(R.key)} data-testid="alex-add"><IoAdd size={16} /> Écrire</button>
            </div>
          </header>
          <Room r={R} n={ri + 1} here={inRoom(R.key).here.filter(match)} up={inRoom(R.key).up.filter(matchUp)} selId={sel[R.key]} onSel={(id) => { sfx?.("nav"); setSel((s) => ({ ...s, [R.key]: id })); }} covers={covers} wish={wish} prog={prog} onRead={openBook} onWish={toggleWish} onWriteUp={writeUp} onHideUp={hideUp} onCover={setCoverFor} onEdit={open} onModify={modifyBook} menuFor={menuFor} noteCount={(id) => notesOf(notesItemOf(at, id)).length} onNotes={(b) => { setReadNotes(true); openBook(b); }} favs={favs} onFav={toggleFav} view={view} stOf={stOf} onStatus={setStatus} />
        </>
      )}
      {wish.length > 0 && <p className="ax-wishes mono">★ {wish.length} TITRE{wish.length > 1 ? "S" : ""} DEMANDÉ{wish.length > 1 ? "S" : ""} : {wish.map((id) => upcoming.find((u) => u.id === id)?.title).filter(Boolean).join(" · ")}</p>}
      {hidUp.length > 0 && <p className="ax-wishes mono">{hidUp.length} TITRE{hidUp.length > 1 ? "S" : ""} À PARAÎTRE RETIRÉ{hidUp.length > 1 ? "S" : ""} · <button className="ax-linkbtn" onClick={restoreUp} data-testid="alex-up-restore">LES REMETTRE</button></p>}
      {coverFor && <CoverDialog b={coverFor} current={covers[coverFor.id]} def={DEFAULT_COVERS[coverFor.id]} onSave={(u) => saveCover(coverFor.id, u)} onClose={() => setCoverFor(null)} />}
      {search && <AlexSearch books={all} upcoming={upcoming} onClose={() => setSearch(false)} onOpen={openBook} onGoto={(b) => { setSearch(false); setRoom(b.room); setSel((s) => ({ ...s, [b.room]: b.id })); }} />}
      {paste && <AlexPaste initial={paste.text} editing={paste.title} onSave={savePaste} onClose={() => setPaste(null)} onPreview={(b) => setReading(b)} renderCover={(b) => <Face b={b} cover={b.coverUrl || covers[b.id]} />} />}
      {launching && createPortal(
        <div className={"nx-launchfx f-" + volLook(launching).fmt} onClick={() => { setReading(launching); setLaunching(null); }} role="status" aria-label={`Ouverture de ${launching.title}`} data-testid="alex-launch" style={{ zIndex: 3000 }}>
          <i className="nx-lf-glow" aria-hidden="true" />
          <div className="nx-lf-obj">
            <div className={`nx-box f-${volLook(launching).fmt}`}><div className="nx-box-in">
              <div className="nx-box-front"><Face b={launching} cover={covers[launching.id]} /></div>
              <div className="nx-box-side" style={covers[launching.id] ? { backgroundImage: `url(${covers[launching.id]})` } : undefined}><span>{launching.title}</span></div>
              <div className="nx-box-back" />
            </div></div>
          </div>
          <p className="nx-lf-t"><span className="mono">{volLook(launching).fmt === "vhs" ? "▶ PLAY" : volLook(launching).fmt === "vinyle" ? "◉ FACE A" : "OUVERTURE"}</span>{launching.title}</p>
          <small className="mono nx-lf-skip">TOUCHE OU CLIC POUR PASSER</small>
        </div>, document.body)}
      {readingBook && (readingBook.preview
        ? <Reader key={readingBook.id + readingBook.words} book={readingBook} at={null} radio={radio} cover={readingBook.coverUrl} onClose={() => { sfx?.("close"); setReading(null); }} />
        : <Reader key={readingBook.id} book={readingBook} at={at} startNotes={readNotes} radio={radio} cover={covers[readingBook.id]} onClose={() => { sfx?.("close"); setReading(null); setReadNotes(false); }} onEdit={(id) => { setReading(null); open(id); }}
          onCover={() => setCoverFor(readingBook)} onModify={() => modifyBook(readingBook)} onIllustrate={() => illustrate(readingBook)} onSwap={(oldId, newId) => swapVideo(readingBook, oldId, newId)} onRemoveVideo={(id) => removeVideo(readingBook, id)} onAddVideo={(si, id, cap) => addVideo(readingBook, si, id, cap)}
          onDone={() => setStatus("read", readingBook.id, true)} />)}
    </section>
  );
}
