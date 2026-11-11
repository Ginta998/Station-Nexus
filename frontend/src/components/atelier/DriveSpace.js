import { useEffect, useMemo, useState } from "react";
import { IoCreateOutline, IoFolderOutline, IoChevronForward, IoTrashOutline, IoDocumentTextOutline, IoCloudUploadOutline, IoLinkOutline, IoGridOutline, IoTimeOutline, IoSparklesOutline, IoLibraryOutline, IoImagesOutline, IoAddOutline, IoListOutline, IoSearch, IoBookmarkOutline, IoClose } from "react-icons/io5";
import { toast } from "sonner";
import { KINDS, imgSrc, isFolder, isOeuvre, fileType, mediaFromText } from "@/lib/atelier";
import { templateHtml, templateMenuEntries, allTemplates, typeContent, typeMenuEntries } from "@/lib/templates";
import ItemCard from "@/components/atelier/ItemCard";
import { itemDrop, pressMenu, showMenu } from "@/components/atelier/ContextMenu";
import { dropToFolder } from "@/components/atelier/itemActions";
import { useSel, SelBtn, BulkBar } from "@/components/atelier/Bulk";
import { archiveCodes, words, fmtDate } from "@/lib/archive";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";

// Dossiers intelligents : filtres sauvegardés (type + recherche), sur cet appareil
const readSmart = () => { try { return JSON.parse(localStorage.getItem("nx-smart") || "[]"); } catch (_) { return []; } };
const writeSmart = (l) => { try { localStorage.setItem("nx-smart", JSON.stringify(l)); } catch (_) {} };

// Vue « Répertoire des archives » : liste codée, onglets par type, colonnes triables, recherche, filtres sauvegardés
function ArchiveList({ at, open, all, folders, folderMenu, items, setFolderId, folderCount, sel }) {
  const codes = useMemo(() => archiveCodes(at.items), [at.items]);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState({ k: "code", d: 1 });
  const [smart, setSmart] = useState(readSmart);
  const kinds = [...new Set(all.map((i) => i.kind))].filter((k) => KINDS[k]);
  const needle = q.trim().toLowerCase();
  const filtering = needle || kind !== "all";
  const pool = filtering ? all : items;
  const rows = pool.filter((i) => (kind === "all" || i.kind === kind) && (!needle || `${i.title} ${(i.tags || []).join(" ")} ${codes[i.id]}`.toLowerCase().includes(needle)));
  const val = (i) => ({ code: codes[i.id] || "", title: (i.title || "").toLowerCase(), type: KINDS[i.kind]?.label || "", mots: words(i.content), date: i.updated_at || "" }[sort.k]);
  rows.sort((a, b) => { const x = val(a), y = val(b); return (x > y ? 1 : x < y ? -1 : 0) * sort.d; });
  const head = (k, l) => <button className={sort.k === k ? "on" : ""} onClick={() => setSort((s) => ({ k, d: s.k === k ? -s.d : 1 }))} aria-sort={sort.k === k ? (sort.d > 0 ? "ascending" : "descending") : "none"}>{l}{sort.k === k ? (sort.d > 0 ? " ↑" : " ↓") : ""}</button>;
  const save = async () => { const name = (await labPrompt("Nom du dossier intelligent", needle || KINDS[kind]?.plural || "Filtre")); if (!name) return; const l = [...smart, { id: Date.now().toString(36), name: name.trim(), q: q.trim(), kind }]; setSmart(l); writeSmart(l); toast.success("Dossier intelligent enregistré"); };
  const drop = (id) => { const l = smart.filter((x) => x.id !== id); setSmart(l); writeSmart(l); };
  return (
    <div className="ar-dir" data-testid="atelier-archive-list">
      <div className="ar-dir-bar">
        <label className="ar-dir-q"><IoSearch size={14} aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un code, un titre, une étiquette…" aria-label="Chercher dans le répertoire" /></label>
        {filtering && <button className="ar-dir-save" onClick={save} data-testid="archive-smart-save"><IoBookmarkOutline size={13} /> Enregistrer ce filtre</button>}
      </div>
      {smart.length > 0 && <div className="ar-smart" aria-label="Dossiers intelligents">{smart.map((f) => <span key={f.id} className={"ar-chip" + (f.q === q.trim() && f.kind === kind ? " on" : "")}><button onClick={() => { setQ(f.q); setKind(f.kind); }}>◇ {f.name}</button><button className="x" onClick={() => drop(f.id)} aria-label={`Supprimer ${f.name}`}><IoClose size={11} /></button></span>)}</div>}
      <div className="ar-tabs" role="tablist">
        {[["all", "TOUT"], ...kinds.map((k) => [k, (KINDS[k].plural || KINDS[k].label).toUpperCase()])].map(([k, l]) => <button key={k} role="tab" aria-selected={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{l}</button>)}
      </div>
      <div className="ar-th">{head("code", "FICHIER")}{head("title", "TITRE / 題名")}{head("type", "TYPE")}{head("mots", "MOTS")}{head("date", "MODIFIÉ")}</div>
      <div className="ar-tb">
        {!filtering && folders.map((f) => (
          <button key={f.id} className="ar-tr folder" onClick={() => setFolderId(f.id)} {...pressMenu(() => folderMenu(f))} data-testid={`archive-folder-${f.id}`}>
            <span className="c mono">DOS.</span><span className="t"><b><i aria-hidden="true">函</i>{f.title || "Dossier"}</b></span><span className="y">Dossier</span><span className="w mono">{String(folderCount(f)).padStart(2, "0")} él.</span><span className="d mono">{fmtDate(f.updated_at)}</span>
          </button>
        ))}
        {rows.map((i) => (
          <button key={i.id} className={"ar-tr" + (sel.has(i.id) ? " sel" : "")} onClick={() => open(i.id)} data-testid={`archive-row-${i.id}`}>
            <span className="c mono">{codes[i.id]}</span>
            <span className="t"><b><i aria-hidden="true">{KINDS[i.kind]?.kanji}</i>{i.title || "Sans titre"}{i.pinned && <em className="mono"> · ÉPINGLÉ</em>}</b>{(i.tags || []).length > 0 && <small className="mono">{i.tags.slice(0, 4).map((t) => "#" + t).join("  ")}</small>}</span>
            <span className="y">{isOeuvre(i) ? "Œuvre" : KINDS[i.kind]?.label}</span>
            <span className="w mono">{words(i.content).toLocaleString("fr-FR")}</span>
            <span className="d mono">{fmtDate(i.updated_at)}</span>
          </button>
        ))}
        {rows.length === 0 && (filtering || !folders.length) && <p className="at-empty">{filtering ? "Aucune archive ne correspond à ce filtre." : "Ce dossier est vide."}</p>}
      </div>
      <p className="ar-foot mono"><span>{rows.length + (filtering ? 0 : folders.length)} ENTRÉE{rows.length + (filtering ? 0 : folders.length) > 1 ? "S" : ""}{filtering ? " · RECHERCHE DANS TOUT L'ESPACE" : ""}</span><span>RÉPERTOIRE <i /> CONNECTÉ</span></p>
    </div>
  );
}

function Timeline({ items, at, open }) {
  const dated = items.filter((i) => i.date).sort((a, b) => a.date.localeCompare(b.date, "fr", { numeric: true }));
  if (!dated.length) return <p className="at-empty big">Donne une date (même « An 312 » ou « Chapitre 4 ») à tes éléments pour construire la chronologie.</p>;
  return <ol className="at-timeline" data-testid="atelier-timeline">{dated.map((i) => <li key={i.id}><span className="d mono">{i.date}</span><ItemCard it={i} at={at} open={open} /></li>)}</ol>;
}

// Espace « Drive » réutilisable : dossiers + fichiers, sans catégories imposées.
// scope = { universe_id, oeuvre_id? }. Un dossier/élément « appartient » au scope.
export default function DriveSpace({ at, open, importDocs, universe_id, oeuvre_id = null, label = "Mon espace" }) {
  const [folderId, setFolderId] = useState(null);
  const [view, setViewState] = useState(() => { try { return localStorage.getItem("nx-drive-view") || "grid"; } catch (_) { return "grid"; } });
  const setView = (v) => { setViewState(v); try { localStorage.setItem("nx-drive-view", v); } catch (_) {} };
  const sel = useSel();

  const inScope = (i) => (oeuvre_id ? i.fields?.oeuvre_id === oeuvre_id : (i.universe_id === universe_id && !i.fields?.oeuvre_id));
  const scopeFields = (extra = {}) => ({ ...(oeuvre_id ? { oeuvre_id } : {}), ...extra });

  const curFolder = folderId ? at.items.find((i) => i.id === folderId && isFolder(i) && inScope(i)) : null;
  const fid = curFolder ? curFolder.id : null;
  const trail = []; { let f = curFolder; while (f) { trail.unshift(f); f = f.fields?.parent ? at.items.find((x) => x.id === f.fields.parent && isFolder(x)) : null; } }

  useEffect(() => { sel.clear(); }, [fid]); // eslint-disable-line
  const folders = at.items.filter((i) => isFolder(i) && inScope(i) && (i.fields?.parent || null) === fid);
  const items = at.items.filter((i) => !isFolder(i) && inScope(i) && (i.fields?.folder_id || null) === fid);
  const sortedItems = [...items].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const images = [];
  for (const i of items) {
    if (i.image) images.push({ id: i.id, iid: i.id, url: i.image, title: i.title });
    (i.media || []).forEach((m, x) => { if (fileType(m) === "image") images.push({ id: i.id + "-" + x, iid: i.id, url: m.url, title: i.title }); });
  }

  const folderCount = (f) => at.items.filter((i) => !isFolder(i) && inScope(i) && (i.fields?.folder_id || null) === f.id).length + at.items.filter((i) => isFolder(i) && inScope(i) && (i.fields?.parent || null) === f.id).length;
  const folderCover = (f) => { if (f.fields?.cover) return f.fields.cover; const c = at.items.find((i) => !isFolder(i) && inScope(i) && (i.fields?.folder_id || null) === f.id && (i.image || (i.kind === "file" && i.media?.[0] && fileType(i.media[0]) === "image"))); return c ? (c.image || c.media[0].url) : ""; };

  const newFolder = async () => { const name = (await labPrompt("Nom du dossier")); if (!name || !name.trim()) return; await at.createItem({ kind: "note", title: name.trim(), universe_id, fields: scopeFields({ folder: true, parent: fid }) }); toast.success("Dossier créé"); };
  const renameFolder = async (f) => { const name = (await labPrompt("Nom du dossier", f.title || "")); if (name !== null && name.trim()) at.saveItem({ ...f, title: name.trim() }).then(() => toast.success("Dossier renommé")); };
  const deleteFolder = async (f) => {
    if (!(await labConfirm(`Supprimer le dossier « ${f.title || "Dossier"} » ? Son contenu remonte au niveau au-dessus.`))) return;
    const parent = f.fields?.parent || null;
    await Promise.all(at.items.filter((i) => !isFolder(i) && (i.fields?.folder_id || null) === f.id).map((i) => at.saveItem({ ...i, fields: { ...(i.fields || {}), folder_id: parent } })));
    await Promise.all(at.items.filter((i) => isFolder(i) && (i.fields?.parent || null) === f.id).map((i) => at.saveItem({ ...i, fields: { ...(i.fields || {}), parent } })));
    await at.removeItem(f.id);
    if (fid === f.id) setFolderId(parent);
    toast.success("Dossier supprimé");
  };
  const createType = async (t) => { const it = await at.createItem({ universe_id, kind: t.kind, title: "", content: typeContent(t), fields: scopeFields({ folder_id: fid, ...(t.dtype ? { dtype: t.dtype } : {}) }) }); open(it.id); };
  const fromTemplate = async (t) => { const it = await at.createItem({ universe_id, kind: t.kind || "note", title: t.name, content: templateHtml(t), fields: scopeFields({ folder_id: fid }) }); open(it.id); };
  const addLink = async () => { const url = (await labPrompt("Colle un lien (page, YouTube, Drive…)")); if (!url) return; const m = mediaFromText(url); if (!m) return toast.error("Lien invalide (doit commencer par https://)"); const it = await at.createItem({ universe_id, kind: "file", title: m.name, media: [m], fields: scopeFields({ folder_id: fid }) }); open(it.id, "file"); };
  const dropFiles = () => importDocs?.({ universe_id, fields: scopeFields({ folder_id: fid }) });
  const organizeByType = async () => {
    const root = items.filter((i) => !i.fields?.folder_id);
    const byKind = {}; root.forEach((i) => { (byKind[i.kind] = byKind[i.kind] || []).push(i); });
    const kinds = Object.keys(byKind);
    if (!kinds.length) return toast.error("Rien à organiser ici.");
    if (!(await labConfirm(`Créer ${kinds.length} dossier(s) à partir des types présents et y ranger ${root.length} élément(s) ? Tu pourras tout renommer, fusionner ou déplacer ensuite.`))) return;
    for (const k of kinds) {
      const folder = await at.createItem({ kind: "note", universe_id, title: KINDS[k]?.plural || k, fields: scopeFields({ folder: true, parent: null }) });
      await Promise.all(byKind[k].map((i) => at.saveItem({ ...i, fields: { ...(i.fields || {}), folder_id: folder.id } })));
    }
    toast.success("Rangé par type en dossiers");
  };

  const picked = () => at.items.filter((i) => sel.has(i.id));
  const bulk = (patch, msg) => Promise.all(picked().map((i) => at.saveItem(patch(i)))).then(() => { toast.success(msg); sel.clear(); });
  const noOe = (f = {}) => { const { oeuvre_id, ...rest } = f; return rest; };
  const bulkMove = (e) => showMenu(e.clientX, e.clientY, [
    { id: "bm-u", label: "Vers un univers", icon: <IoGridOutline size={14} />, sub: [
      { id: "bm-inbox", label: "Inbox", onClick: () => bulk((i) => ({ ...i, universe_id: null, fields: { ...noOe(i.fields), folder_id: null } }), "Déplacé vers l'Inbox") },
      ...at.universes.map((u) => ({ id: `bm-u-${u.id}`, label: u.name, onClick: () => bulk((i) => ({ ...i, universe_id: u.id, fields: { ...noOe(i.fields), folder_id: null } }), `Déplacé vers ${u.name}`) })),
    ] },
    { id: "bm-f", label: "Vers un dossier", icon: <IoFolderOutline size={14} />, sub: [
      { id: "bm-root", label: `— ${label} (racine)`, onClick: () => bulk((i) => ({ ...i, fields: { ...(i.fields || {}), folder_id: null } }), "Rangé à la racine") },
      ...at.items.filter((x) => isFolder(x) && inScope(x)).map((f) => ({ id: `bm-f-${f.id}`, label: f.title || "Dossier", onClick: () => bulk((i) => ({ ...i, fields: { ...(i.fields || {}), folder_id: f.id } }), `Rangé dans ${f.title || "le dossier"}`) })),
    ] },
    ...(at.items.some(isOeuvre) ? [{ id: "bm-o", label: "Vers une œuvre", icon: <IoLibraryOutline size={14} />, sub: at.items.filter(isOeuvre).map((o) => ({ id: `bm-o-${o.id}`, label: o.title || "Œuvre", onClick: () => bulk((i) => ({ ...i, universe_id: o.universe_id, fields: { ...(i.fields || {}), oeuvre_id: o.id, folder_id: null } }), `Rangé dans ${o.title || "l'œuvre"}`) })) }] : []),
  ], `DÉPLACER ${sel.ids.length} ÉLÉMENT${sel.ids.length > 1 ? "S" : ""}`);
  const bulkDelete = async () => {
    if (!(await labConfirm(`Supprimer ${sel.ids.length} élément(s) ?`))) return;
    await Promise.all(picked().map((i) => at.removeItem(i.id))); toast.success("Supprimés"); sel.clear();
  };

  const folderMenu = (f) => ({ title: f.title || "Dossier", entries: [
    { id: "open", label: "Ouvrir", icon: <IoFolderOutline size={14} />, onClick: () => setFolderId(f.id) },
    { id: "rename", label: "Renommer", icon: <IoCreateOutline size={14} />, onClick: () => renameFolder(f) },
    "-",
    { id: "delete", label: "Supprimer le dossier", danger: true, icon: <IoTrashOutline size={14} />, onClick: () => deleteFolder(f) },
  ] });
  const spaceMenu = () => ({ title: curFolder ? (curFolder.title || "Dossier") : label, entries: [
    { id: "nf", label: "Nouveau dossier", icon: <IoFolderOutline size={14} />, onClick: newFolder },
    { id: "nn", label: "Nouveau", icon: <IoDocumentTextOutline size={14} />, sub: typeMenuEntries(createType) },
    { id: "tpl", label: "Depuis un template", icon: <IoLibraryOutline size={14} />, sub: templateMenuEntries(fromTemplate, allTemplates(at)) },
    { id: "up", label: "Déposer des fichiers", icon: <IoCloudUploadOutline size={14} />, onClick: dropFiles },
    { id: "ln", label: "Coller un lien", icon: <IoLinkOutline size={14} />, onClick: addLink },
    ...(!fid && items.some((i) => !i.fields?.folder_id) ? ["-", { id: "org", label: "Organiser par type", icon: <IoSparklesOutline size={14} />, onClick: organizeByType }] : []),
  ] });
  // Un seul bouton « Créer » qui ouvre tout (dossier, fiche, template, fichiers, lien) — mobile et PC.
  const createMenu = (e) => showMenu(e.clientX, e.clientY, spaceMenu().entries, "CRÉER ICI");

  return (
    <section className="at-drive" data-testid="atelier-drive" {...pressMenu(spaceMenu)} {...itemDrop(dropToFolder(at, fid))}>
      {trail.length > 0 && (
        <div className="at-crumbs mono" data-testid="atelier-folder-crumbs">
          <button onClick={() => setFolderId(null)} {...itemDrop(dropToFolder(at, null))}>{label}</button>
          {trail.map((f, i) => <span key={f.id}><IoChevronForward size={11} />{i === trail.length - 1 ? <b>{f.title || "Dossier"}</b> : <button onClick={() => setFolderId(f.id)} {...itemDrop(dropToFolder(at, f.id))}>{f.title || "Dossier"}</button>}</span>)}
        </div>
      )}

      <div className="at-sechead">
        <div className="tt"><p className="at-eyebrow mono">// NEXUS DRIVE</p><h2>{curFolder ? (curFolder.title || "Dossier") : label}</h2></div>
        <div className="at-drive-acts">
          {view === "grid" && sortedItems.length > 0 && <SelBtn sel={sel} />}
          <button className="at-btn at-drive-new" onClick={createMenu} data-testid="atelier-drive-new"><IoAddOutline size={17} /> Créer</button>
          <span className="at-seg">
            <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} title="Grille" data-testid="atelier-view-grid"><IoGridOutline size={15} /></button>
            <button className={view === "list" ? "on" : ""} onClick={() => setView("list")} title="Répertoire des archives" data-testid="atelier-view-list"><IoListOutline size={15} /></button>
            <button className={view === "board" ? "on" : ""} onClick={() => setView("board")} title="Moodboard" data-testid="atelier-view-board"><IoImagesOutline size={15} /></button>
            <button className={view === "time" ? "on" : ""} onClick={() => setView("time")} title="Chronologie" data-testid="atelier-view-time"><IoTimeOutline size={15} /></button>
          </span>
        </div>
      </div>

      {view === "list" ? <ArchiveList at={at} open={open} all={at.items.filter((i) => !isFolder(i) && inScope(i))} folders={folders} folderMenu={folderMenu} items={sortedItems} setFolderId={setFolderId} folderCount={folderCount} sel={sel} />
        : view === "time" ? <Timeline items={items} at={at} open={open} />
        : view === "board" ? (
          images.length ? <div className="at-moodwall" data-testid="atelier-moodwall">{images.map((im) => <button key={im.id} onClick={() => open(im.iid)} title={im.title || ""}><img src={imgSrc(im.url)} alt={im.title || ""} loading="lazy" /></button>)}</div>
            : <p className="at-empty big">Aucune image ici. Dépose des images (ou colle un lien Google Drive) sur tes fiches pour composer ton moodboard.</p>
        ) : (
        <>
          {folders.length > 0 && (
            <div className="at-unis-big at-folders-grid">
              {folders.map((f) => {
                const cov = folderCover(f); const n = folderCount(f);
                return (
                  <button key={f.id} className="at-uni-big at-folder" onClick={() => setFolderId(f.id)} data-testid={`atelier-folder-${f.id}`} {...pressMenu(() => folderMenu(f))} {...itemDrop(dropToFolder(at, f.id))}>
                    <span className="cov">{cov ? <img src={imgSrc(cov)} alt="" loading="lazy" /> : <span className="k">{f.fields?.kanji || "函"}</span>}</span>
                    <span className="t"><b>{f.title || "Dossier"}</b><small>DOSSIER · {n} ÉLÉMENT{n > 1 ? "S" : ""}</small></span>
                  </button>
                );
              })}
            </div>
          )}
          {sortedItems.length > 0 ? <div className="at-grid">{sortedItems.map((i) => <ItemCard key={i.id} it={i} at={at} open={open} sel={sel} />)}</div>
            : folders.length === 0 && <p className="at-empty big">{fid ? "Ce dossier est vide. Clic droit pour créer un dossier, une fiche ou déposer des fichiers." : "Ton espace est vide. Clic droit (ou les boutons ci-dessus) pour créer un dossier, une fiche ou déposer des fichiers."}</p>}
        </>
      )}
      <BulkBar sel={sel} all={sortedItems.map((i) => i.id)}>
        <button onClick={bulkMove} data-testid="bulk-move"><IoFolderOutline size={14} /> Déplacer</button>
        <button className="danger" onClick={bulkDelete} data-testid="bulk-delete"><IoTrashOutline size={14} /> Supprimer</button>
      </BulkBar>
    </section>
  );
}
