import { useState } from "react";
import { IoAdd, IoPlayForward, IoCopyOutline, IoCreateOutline, IoTrashOutline, IoArrowBack, IoEyeOutline, IoClose } from "react-icons/io5";
import { toast } from "sonner";
import { isOeuvre } from "@/lib/atelier";
import { allTemplates, templateHtml, TEMPLATE_CATS, CAT_ORDER, forkBuiltin, hideBuiltin } from "@/lib/templates";
import { showMenu, pressMenu } from "@/components/atelier/ContextMenu";

// Bibliothèque de templates : tous les templates (intégrés + perso), classés par thème.
// Utiliser dans un univers/œuvre, aperçu, dupliquer, renommer, modifier, supprimer (clic droit).
export default function TemplatesPage({ at, open, go }) {
  const [preview, setPreview] = useState(null);
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const list = allTemplates(at);
  const cats = [...new Set(list.map((t) => t.cat))].sort((a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b));

  const create = async (t, scope) => {
    const it = await at.createItem({ universe_id: scope.universe_id, kind: t.kind || "note", title: t.name, content: templateHtml(t), fields: scope.oeuvre_id ? { oeuvre_id: scope.oeuvre_id } : {} });
    toast.success(`« ${t.name} » créé`); open(it.id);
  };
  const targetEntries = (t) => at.universes.map((u) => ({
    id: "u-" + u.id, label: u.name, sub: [
      { id: "root-" + u.id, label: "— Racine de l'univers", onClick: () => create(t, { universe_id: u.id }) },
      ...at.items.filter((x) => isOeuvre(x) && x.universe_id === u.id).map((o) => ({ id: "oe-" + o.id, label: o.title || "Œuvre", onClick: () => create(t, { universe_id: u.id, oeuvre_id: o.id }) })),
    ],
  }));
  const pickUse = (t) => (e) => { const en = targetEntries(t); showMenu(e.clientX, e.clientY, en.length ? en : [{ id: "none", label: "Crée d'abord un univers" }], "UTILISER DANS…"); };
  const duplicate = async (t) => {
    const it = await at.createItem({ universe_id: null, kind: "note", title: `${t.name} (copie)`, content: templateHtml(t), fields: { template: true, tcat: t.cat, tkind: t.kind || "note", kanji: t.kanji || "書" } });
    toast.success("Template dupliqué — à toi de le modifier"); open(it.id);
  };
  const newTemplate = async () => {
    const name = window.prompt("Nom du nouveau template"); if (!name || !name.trim()) return;
    const it = await at.createItem({ universe_id: null, kind: "note", title: name.trim(), content: "<h2>Section</h2><p class=\"tpl-hint\"><em>Écris ici l'amorce à remplacer…</em></p><p><br/></p>", fields: { template: true, tcat: "perso", kanji: "書" } });
    open(it.id);
  };
  const modify = (t) => { if (t.builtin) forkBuiltin(at, t).then((it) => open(it.id)); else open(t.item.id); };
  const rename = (t) => { const name = window.prompt("Renommer le template", t.name); if (!name || !name.trim()) return; if (t.builtin) forkBuiltin(at, t, name.trim()).then(() => toast.success("Template renommé")); else at.saveItem({ ...t.item, title: name.trim() }).then(() => toast.success("Template renommé")); };
  const del = (t) => { if (!window.confirm(`Supprimer le template « ${t.name} » ?`)) return; if (t.builtin) { hideBuiltin(t.id); toast.success("Template supprimé"); refresh(); } else { if (t.base) hideBuiltin(t.base); at.removeItem(t.item.id).then(() => toast.success("Template supprimé")); } };

  const cardMenu = (t) => ({ title: t.name, entries: [
    { id: "use", label: "Utiliser dans…", icon: <IoPlayForward size={14} />, sub: targetEntries(t) },
    { id: "preview", label: "Aperçu", icon: <IoEyeOutline size={14} />, onClick: () => setPreview(t) },
    { id: "edit", label: "Modifier", icon: <IoCreateOutline size={14} />, onClick: () => modify(t) },
    { id: "rename", label: "Renommer", icon: <IoCreateOutline size={14} />, onClick: () => rename(t) },
    { id: "dup", label: "Dupliquer", icon: <IoCopyOutline size={14} />, onClick: () => duplicate(t) },
    "-",
    { id: "del", label: "Supprimer", danger: true, icon: <IoTrashOutline size={14} />, onClick: () => del(t) },
  ] });

  return (
    <section className="at-view" data-testid="atelier-templates">
      {go && <button className="at-link at-back" onClick={() => go({ name: "universes" })}><IoArrowBack size={13} /> Nexus Drive</button>}
      <header className="at-head">
        <p className="at-eyebrow mono">// NEXUS DRIVE · BIBLIOTHÈQUE</p>
        <h1>Templates</h1>
        <p className="at-sub">Des trames prêtes à l'emploi pour écrire plus vite. Clic droit sur une carte pour tout faire : utiliser, aperçu, dupliquer, renommer, supprimer.</p>
        <div style={{ marginTop: 12 }}><button className="at-btn" onClick={newTemplate} data-testid="atelier-template-new"><IoAdd size={15} /> Nouveau template</button></div>
      </header>

      {cats.map((c) => (
        <section key={c} className="at-tpl-sec">
          <div className="at-sechead"><div className="tt"><p className="at-eyebrow mono">// {(TEMPLATE_CATS[c] || c).toUpperCase()}</p><h2>{TEMPLATE_CATS[c] || c}</h2></div></div>
          <div className="at-tpl-grid">
            {list.filter((t) => t.cat === c).map((t) => (
              <div key={t.id} className="at-tpl-card" data-testid={`atelier-template-${t.id}`} {...pressMenu(() => cardMenu(t))}>
                <span className="kj">{t.kanji || "書"}</span>
                <div className="tx">
                  <b>{t.name}</b>
                  {t.desc && <small>{t.desc}</small>}
                  <span className="tag mono">{t.user ? "PERSO" : "INTÉGRÉ"}</span>
                </div>
                <div className="acts">
                  <button className="at-btn sm" onClick={pickUse(t)} data-testid={`atelier-template-use-${t.id}`}><IoPlayForward size={13} /> Utiliser</button>
                  <span className="row">
                    <button className="at-icon" title="Aperçu" onClick={() => setPreview(t)} data-testid={`atelier-template-preview-${t.id}`}><IoEyeOutline size={15} /></button>
                    <button className="at-icon" title="Modifier" onClick={() => modify(t)} data-testid={`atelier-template-edit-${t.id}`}><IoCreateOutline size={15} /></button>
                    <button className="at-icon danger" title="Supprimer" onClick={() => del(t)} data-testid={`atelier-template-del-${t.id}`}><IoTrashOutline size={14} /></button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {preview && (
        <div className="tpl-ov" onClick={() => setPreview(null)} data-testid="atelier-template-preview">
          <div className="tpl-preview" onClick={(e) => e.stopPropagation()}>
            <div className="fv-bar"><div className="grow"><b>{preview.kanji} {preview.name}</b></div><button className="at-icon" onClick={() => setPreview(null)} title="Fermer"><IoClose size={19} /></button></div>
            <div className="tpl-preview-body" dangerouslySetInnerHTML={{ __html: templateHtml(preview) }} />
            <div className="tpl-preview-foot"><button className="at-btn" onClick={(e) => { setPreview(null); pickUse(preview)(e); }}><IoPlayForward size={14} /> Utiliser ce template</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
