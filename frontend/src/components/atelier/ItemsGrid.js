import { useState } from "react";
import { IoAdd, IoCloudUploadOutline, IoLinkOutline } from "react-icons/io5";
import { KINDS, mediaFromText } from "@/lib/atelier";
import ItemCard from "@/components/atelier/ItemCard";

// Grille d'éléments + création rapide d'un élément du type choisi
export default function ItemsGrid({ at, open, items, newDefaults, kinds = Object.keys(KINDS), empty, importDocs }) {
  const [menu, setMenu] = useState(false);
  const [link, setLink] = useState(null);
  const addLink = async (e) => {
    e.preventDefault(); const m = mediaFromText(link); if (!m) return;
    const it = await at.createItem({ ...newDefaults, kind: "file", title: m.name, media: [m] }); setLink(null); open(it.id, "file");
  };
  const create = async (kind) => { setMenu(false); const it = await at.createItem({ ...newDefaults, kind }); open(it.id); };
  const sorted = [...items].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  return (
    <div>
      <div className="at-newbar">
        {importDocs && <button className="at-btn ghost" onClick={() => importDocs(newDefaults)} data-testid="atelier-import-btn"><IoCloudUploadOutline size={16} /> Déposer des fichiers</button>}
        {link === null ? <button className="at-btn ghost" onClick={() => setLink("")} data-testid="atelier-add-link"><IoLinkOutline size={16} /> Lien</button> : (
          <form className="at-linkform" onSubmit={addLink}><input autoFocus value={link} onChange={(e) => setLink(e.target.value)} onBlur={() => !link && setLink(null)} placeholder="https://docs.google.com/…" data-testid="atelier-add-link-input" /><button className="at-btn" type="submit" data-testid="atelier-add-link-save">Ajouter</button></form>
        )}
        <div className="relative">
          <button className="at-btn" onClick={() => (kinds.length === 1 ? create(kinds[0]) : setMenu((m) => !m))} data-testid="atelier-new-item"><IoAdd size={16} /> Nouveau{kinds.length === 1 ? ` · ${KINDS[kinds[0]].label}` : ""}</button>
          {menu && (
            <div className="at-menu" data-testid="atelier-new-item-menu">
              {kinds.map((k) => <button key={k} onClick={() => create(k)} data-testid={`atelier-new-${k}`}><span className="kj">{KINDS[k].kanji}</span> {KINDS[k].label}</button>)}
            </div>
          )}
        </div>
      </div>
      {sorted.length === 0 ? <p className="at-empty big">{empty}</p> : <div className="at-grid">{sorted.map((i) => <ItemCard key={i.id} it={i} at={at} open={open} />)}</div>}
    </div>
  );
}
