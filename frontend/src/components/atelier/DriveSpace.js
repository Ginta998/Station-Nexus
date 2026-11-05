import { useState } from "react";
import { IoCreateOutline, IoFolderOutline, IoChevronForward, IoTrashOutline, IoDocumentTextOutline, IoCloudUploadOutline, IoLinkOutline, IoGridOutline, IoTimeOutline, IoSparklesOutline, IoLibraryOutline, IoImagesOutline, IoAddOutline } from "react-icons/io5";
import { toast } from "sonner";
import { KINDS, imgSrc, isFolder, fileType, mediaFromText } from "@/lib/atelier";
import { templateHtml, templateMenuEntries, allTemplates, typeContent, typeMenuEntries } from "@/lib/templates";
import ItemCard from "@/components/atelier/ItemCard";
import { itemDrop, pressMenu, showMenu } from "@/components/atelier/ContextMenu";
import { dropToFolder } from "@/components/atelier/itemActions";

function Timeline({ items, at, open }) {
  const dated = items.filter((i) => i.date).sort((a, b) => a.date.localeCompare(b.date, "fr", { numeric: true }));
  if (!dated.length) return <p className="at-empty big">Donne une date (même « An 312 » ou « Chapitre 4 ») à tes éléments pour construire la chronologie.</p>;
  return <ol className="at-timeline" data-testid="atelier-timeline">{dated.map((i) => <li key={i.id}><span className="d mono">{i.date}</span><ItemCard it={i} at={at} open={open} /></li>)}</ol>;
}

// Espace « Drive » réutilisable : dossiers + fichiers, sans catégories imposées.
// scope = { universe_id, oeuvre_id? }. Un dossier/élément « appartient » au scope.
export default function DriveSpace({ at, open, importDocs, universe_id, oeuvre_id = null, label = "Mon espace" }) {
  const [folderId, setFolderId] = useState(null);
  const [view, setView] = useState("grid");

  const inScope = (i) => (oeuvre_id ? i.fields?.oeuvre_id === oeuvre_id : (i.universe_id === universe_id && !i.fields?.oeuvre_id));
  const scopeFields = (extra = {}) => ({ ...(oeuvre_id ? { oeuvre_id } : {}), ...extra });

  const curFolder = folderId ? at.items.find((i) => i.id === folderId && isFolder(i) && inScope(i)) : null;
  const fid = curFolder ? curFolder.id : null;
  const trail = []; { let f = curFolder; while (f) { trail.unshift(f); f = f.fields?.parent ? at.items.find((x) => x.id === f.fields.parent && isFolder(x)) : null; } }

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

  const newFolder = async () => { const name = window.prompt("Nom du dossier"); if (!name || !name.trim()) return; await at.createItem({ kind: "note", title: name.trim(), universe_id, fields: scopeFields({ folder: true, parent: fid }) }); toast.success("Dossier créé"); };
  const renameFolder = (f) => { const name = window.prompt("Nom du dossier", f.title || ""); if (name !== null && name.trim()) at.saveItem({ ...f, title: name.trim() }).then(() => toast.success("Dossier renommé")); };
  const deleteFolder = async (f) => {
    if (!window.confirm(`Supprimer le dossier « ${f.title || "Dossier"} » ? Son contenu remonte au niveau au-dessus.`)) return;
    const parent = f.fields?.parent || null;
    await Promise.all(at.items.filter((i) => !isFolder(i) && (i.fields?.folder_id || null) === f.id).map((i) => at.saveItem({ ...i, fields: { ...(i.fields || {}), folder_id: parent } })));
    await Promise.all(at.items.filter((i) => isFolder(i) && (i.fields?.parent || null) === f.id).map((i) => at.saveItem({ ...i, fields: { ...(i.fields || {}), parent } })));
    await at.removeItem(f.id);
    if (fid === f.id) setFolderId(parent);
    toast.success("Dossier supprimé");
  };
  const createType = async (t) => { const it = await at.createItem({ universe_id, kind: t.kind, title: "", content: typeContent(t), fields: scopeFields({ folder_id: fid, ...(t.dtype ? { dtype: t.dtype } : {}) }) }); open(it.id); };
  const fromTemplate = async (t) => { const it = await at.createItem({ universe_id, kind: t.kind || "note", title: t.name, content: templateHtml(t), fields: scopeFields({ folder_id: fid }) }); open(it.id); };
  const addLink = async () => { const url = window.prompt("Colle un lien (page, YouTube, Drive…)"); if (!url) return; const m = mediaFromText(url); if (!m) return toast.error("Lien invalide (doit commencer par https://)"); const it = await at.createItem({ universe_id, kind: "file", title: m.name, media: [m], fields: scopeFields({ folder_id: fid }) }); open(it.id, "file"); };
  const dropFiles = () => importDocs?.({ universe_id, fields: scopeFields({ folder_id: fid }) });
  const organizeByType = async () => {
    const root = items.filter((i) => !i.fields?.folder_id);
    const byKind = {}; root.forEach((i) => { (byKind[i.kind] = byKind[i.kind] || []).push(i); });
    const kinds = Object.keys(byKind);
    if (!kinds.length) return toast.error("Rien à organiser ici.");
    if (!window.confirm(`Créer ${kinds.length} dossier(s) à partir des types présents et y ranger ${root.length} élément(s) ? Tu pourras tout renommer, fusionner ou déplacer ensuite.`)) return;
    for (const k of kinds) {
      const folder = await at.createItem({ kind: "note", universe_id, title: KINDS[k]?.plural || k, fields: scopeFields({ folder: true, parent: null }) });
      await Promise.all(byKind[k].map((i) => at.saveItem({ ...i, fields: { ...(i.fields || {}), folder_id: folder.id } })));
    }
    toast.success("Rangé par type en dossiers");
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
          <button className="at-btn at-drive-new" onClick={createMenu} data-testid="atelier-drive-new"><IoAddOutline size={17} /> Créer</button>
          <span className="at-seg">
            <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} title="Grille" data-testid="atelier-view-grid"><IoGridOutline size={15} /></button>
            <button className={view === "board" ? "on" : ""} onClick={() => setView("board")} title="Moodboard" data-testid="atelier-view-board"><IoImagesOutline size={15} /></button>
            <button className={view === "time" ? "on" : ""} onClick={() => setView("time")} title="Chronologie" data-testid="atelier-view-time"><IoTimeOutline size={15} /></button>
          </span>
        </div>
      </div>

      {view === "time" ? <Timeline items={items} at={at} open={open} />
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
          {sortedItems.length > 0 ? <div className="at-grid">{sortedItems.map((i) => <ItemCard key={i.id} it={i} at={at} open={open} />)}</div>
            : folders.length === 0 && <p className="at-empty big">{fid ? "Ce dossier est vide. Clic droit pour créer un dossier, une fiche ou déposer des fichiers." : "Ton espace est vide. Clic droit (ou les boutons ci-dessus) pour créer un dossier, une fiche ou déposer des fichiers."}</p>}
        </>
      )}
    </section>
  );
}
