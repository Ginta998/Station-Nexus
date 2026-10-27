import { useState } from "react";
import { IoClose, IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { toast } from "sonner";
import { KINDS, atelierApi, isImportable, mediaFromUpload, mediaFromText } from "@/lib/atelier";

// Ranger un dépôt : choisir l'univers et la destination (import mis en page, nouvel élément, élément existant)
export default function DropDialog({ at, drop, defaults = {}, onClose, open }) {
  const files = drop.files || [];
  const link = drop.text ? mediaFromText(drop.text) : null;
  const docs = files.filter(isImportable);
  const [uid, setUid] = useState(defaults.universe_id || "");
  const [kind, setKind] = useState(docs.length ? "document" : files.length || link ? "inspiration" : "note");
  const [mode, setMode] = useState(docs.length && docs.length === files.length ? "import" : "new");
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState(files[0]?.name.replace(/\.[^.]+$/, "") || link?.name || "");
  const [prog, setProg] = useState(null);
  const targets = at.items.filter((i) => (uid ? i.universe_id === uid : !i.universe_id));

  const run = async () => {
    try {
      if (mode === "import") {
        let all = [];
        for (let i = 0; i < docs.length; i++) {
          setProg(`Lecture de ${docs[i].name}…`);
          all = [...all, ...(await atelierApi.importDoc(docs[i], { universe_id: uid, kind }, (p) => setProg(`Envoi de ${docs[i].name} · ${Math.round(p * 100)}%`)))];
        }
        at.addItems(all);
        toast.success(`${all.length} élément${all.length > 1 ? "s" : ""} créé${all.length > 1 ? "s" : ""} et mis en page`);
        onClose(); if (all.length === 1) open(all[0].id);
        return;
      }
      const media = [];
      for (let i = 0; i < files.length; i++) {
        setProg(`Envoi ${i + 1}/${files.length} · ${files[i].name}`);
        media.push(mediaFromUpload(await atelierApi.upload(files[i], (p) => setProg(`Envoi ${i + 1}/${files.length} · ${Math.round(p * 100)}%`))));
      }
      if (link) media.push(link);
      const img = media.find((m) => m.type === "image");
      if (mode === "attach" && target) {
        const it = at.items.find((x) => x.id === target);
        await at.saveItem({ ...it, media: [...(it.media || []), ...media] });
        toast.success("Ajouté à l'élément"); onClose(); open(it.id);
      } else {
        const it = await at.createItem({ kind, title: title.trim(), universe_id: uid || null, media, image: kind === "inspiration" || kind === "character" ? img?.url || "" : "" });
        toast.success("Élément créé"); onClose(); open(it.id);
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Échec de l'envoi"); setProg(null);
    }
  };

  return (
    <div className="at-modal" onClick={() => !prog && onClose()} data-testid="atelier-drop-dialog">
      <div className="at-modal-c" onClick={(e) => e.stopPropagation()}>
        <div className="at-modal-h"><h2><IoCloudUploadOutline size={18} /> Ranger dans l'Atelier</h2><button onClick={onClose} disabled={!!prog} aria-label="Fermer"><IoClose size={20} /></button></div>
        <div className="at-form">
          <div className="at-drop-list">
            {files.map((f) => <span key={f.name + f.size}>{isImportable(f) ? <IoDocumentTextOutline size={13} /> : "•"} {f.name} <small>{(f.size / 1048576).toFixed(1)} Mo</small></span>)}
            {link && <span>🔗 {link.url}</span>}
          </div>
          <label>Univers<select value={uid} onChange={(e) => { setUid(e.target.value); setTarget(""); }} data-testid="atelier-drop-universe">
            <option value="">Inbox (sans univers)</option>{at.universes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select></label>
          <div className="at-chips">
            {docs.length > 0 && <button className={mode === "import" ? "on" : ""} onClick={() => setMode("import")} data-testid="atelier-drop-mode-import">Importer le texte (découpé par titres)</button>}
            <button className={mode === "new" ? "on" : ""} onClick={() => setMode("new")} data-testid="atelier-drop-mode-new">Nouvel élément avec ces médias</button>
            <button className={mode === "attach" ? "on" : ""} onClick={() => setMode("attach")} data-testid="atelier-drop-mode-attach">Ajouter à un élément existant</button>
          </div>
          {mode !== "attach" && (
            <label>Type<select value={kind} onChange={(e) => setKind(e.target.value)} data-testid="atelier-drop-kind">{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
          )}
          {mode === "new" && <label>Titre<input value={title} onChange={(e) => setTitle(e.target.value)} data-testid="atelier-drop-title" /></label>}
          {mode === "attach" && (
            <label>Élément<select value={target} onChange={(e) => setTarget(e.target.value)} data-testid="atelier-drop-target">
              <option value="">Choisir…</option>{targets.map((i) => <option key={i.id} value={i.id}>{KINDS[i.kind]?.label} · {i.title || "Sans titre"}</option>)}
            </select></label>
          )}
          {mode === "import" && <p className="at-hint">Chaque titre ou chapitre du document devient un élément séparé, avec sa mise en forme (gras, italique, titres, listes, images Word). Le fichier d'origine est joint.</p>}
          {prog && <p className="at-hint mono" data-testid="atelier-drop-progress">{prog}</p>}
        </div>
        <div className="at-modal-f"><span className="grow" /><button className="at-btn ghost" onClick={onClose} disabled={!!prog}>Annuler</button>
          <button className="at-btn" onClick={run} disabled={!!prog || (mode === "attach" && !target)} data-testid="atelier-drop-confirm">{prog ? "En cours…" : "Ranger"}</button></div>
      </div>
    </div>
  );
}
