import { useEffect, useRef, useState } from "react";
import { IoArrowBack, IoColorPaletteOutline, IoEyeOutline, IoTimeOutline, IoPrintOutline, IoTrashOutline, IoPin, IoPinOutline, IoImageOutline, IoClose, IoLinkOutline, IoChevronForward, IoChevronBack } from "react-icons/io5";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";
import { uploadJournalImage } from "@/lib/api";
import { KINDS, KIND_FIELDS, atelierApi, imgSrc } from "@/lib/atelier";
import { TaskRow, TaskQuickAdd } from "@/components/atelier/TasksView";
import MediaGallery from "@/components/atelier/MediaGallery";
import DocView from "@/components/atelier/DocView";
import DocEdit from "@/components/atelier/DocEdit";
import DocStylePanel from "@/components/atelier/DocStylePanel";
import { styleOf, styleVars, DOC_CSS, DOC_FORMATS, docFonts } from "@/lib/docStyles";
import "@/components/atelier/docs.css";
import { mediaFromUpload, mediaFromText } from "@/lib/atelier";

const esc = (s) => (s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
function printItem(it, uname) {
  const w = window.open("", "_blank");
  if (!w) return toast.error("Autorise les fenêtres pour exporter en PDF");
  const fields = Object.entries(it.fields || {}).filter(([k, v]) => v && k !== "doc").map(([k, v]) => `<p><b>${esc((KIND_FIELDS[it.kind] || []).find((f) => f[0] === k)?.[1] || k)} :</b> ${esc(v)}</p>`).join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(it.title)}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:48px auto;padding:0 24px;line-height:1.7;color:#111}h1{font-size:30px;margin:0 0 4px}small{color:#777;letter-spacing:.2em;text-transform:uppercase;font:11px sans-serif}img{max-width:100%}hr{border:0;border-top:1px solid #ccc}.sx-music-cue{display:none}</style></head><body><small>${esc(KINDS[it.kind]?.label)}${uname ? " · " + esc(uname) : ""}</small><h1>${esc(it.title || "Sans titre")}</h1>${fields}${it.image ? `<img src="${imgSrc(it.image)}"/>` : ""}${it.content || ""}</body></html>`);
  w.document.close(); setTimeout(() => w.print(), 400);
}

function Versions({ id, onRestore, onClose }) {
  const [list, setList] = useState(null);
  useEffect(() => { atelierApi.versions(id).then(setList).catch(() => setList([])); }, [id]);
  return (
    <div className="at-versions" data-testid="atelier-versions">
      <div className="at-panel-h"><h2>Versions</h2><button onClick={onClose} aria-label="Fermer"><IoClose size={18} /></button></div>
      {list === null ? <p className="at-empty">Chargement…</p> : list.length === 0 ? <p className="at-empty">Pas encore d'ancienne version (une copie est gardée toutes les 5 min d'écriture).</p> :
        list.map((v) => (
          <div key={v.id} className="at-ver">
            <span className="mono">{new Date(v.at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            <span className="tt">{v.data?.title || "Sans titre"}</span>
            <button className="at-btn ghost" onClick={() => onRestore(v)} data-testid={`atelier-version-restore-${v.id}`}>Restaurer</button>
          </div>
        ))}
    </div>
  );
}

export default function ItemEditor({ at, id, open, onClose }) {
  const src = at.items.find((i) => i.id === id);
  const [it, setIt] = useState(src);
  const [status, setStatus] = useState("saved");
  const [rev, setRev] = useState(0);
  const [panel, setPanel] = useState(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);
  const latest = useRef(it);
  const file = useRef(null);
  latest.current = it;

  const flush = async () => {
    clearTimeout(timer.current);
    if (status === "saved" || !latest.current) return;
    try { await at.saveItem(latest.current); setStatus("saved"); } catch { setStatus("error"); toast.error("Sauvegarde impossible — ton texte reste ici, réessaie"); }
  };
  const dst = styleOf(it?.fields?.doc?.style);
  const fmt = it?.fields?.doc?.format || "flow";
  const setFmt = (f) => change({ fields: { ...(it.fields || {}), doc: { ...(it.fields?.doc || {}), format: f } } });
  const [side, setSide] = useState(() => { try { return localStorage.getItem("nx-ed-side") !== "0"; } catch (_) { return true; } });
  const toggleSide = () => setSide((v) => { const nv = !v; try { localStorage.setItem("nx-ed-side", nv ? "1" : "0"); } catch (_) {} return nv; });
  const [wide, setWide] = useState(() => { try { return localStorage.getItem("nx-doc-wide") === "1"; } catch (_) { return false; } });
  const toggleWide = () => setWide((v) => { const nv = !v; try { localStorage.setItem("nx-doc-wide", nv ? "1" : "0"); } catch (_) {} return nv; });
  const change = (patch) => {
    setIt((x) => ({ ...x, ...patch })); setStatus("dirty");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setStatus("saving");
      try { await at.saveItem(latest.current); setStatus("saved"); } catch { setStatus("error"); }
    }, 1200);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !panel) close(); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });
  if (!it) return null;

  const close = async () => { await flush(); onClose(); };
  const goTo = async (lid) => { await flush(); onClose(); setTimeout(() => open(lid), 0); };
  const uname = at.universes.find((u) => u.id === it.universe_id)?.name;
  const others = at.items.filter((x) => x.id !== it.id && !(it.links || []).includes(x.id));
  const links = (it.links || []).map((l) => at.items.find((x) => x.id === l)).filter(Boolean);
  const backlinks = at.items.filter((x) => (x.links || []).includes(it.id) && !(it.links || []).includes(x.id));
  const tasks = at.tasks.filter((t) => t.item_id === it.id);
  const remove = async () => {
    if (!window.confirm(`Supprimer « ${it.title || "Sans titre"} » ? (une copie est gardée dans la corbeille du serveur)`)) return;
    clearTimeout(timer.current); await at.removeItem(it.id); toast.success("Élément supprimé"); onClose();
  };
  const upload = async (f) => { if (!f) return; setBusy(true); try { change({ image: (await uploadJournalImage(f)).url }); } catch { toast.error("Image refusée"); } finally { setBusy(false); } };
  const restore = async (v) => {
    const doc = await atelierApi.restore(it.id, v.id);
    await at.saveItem(doc); setIt(doc); setRev((r) => r + 1); setPanel(null); setStatus("saved");
    toast.success("Version restaurée (la précédente a été gardée)");
  };
  const statusLabel = { saved: "Enregistré", dirty: "Modifié…", saving: "Enregistrement…", error: "Erreur — non enregistré" }[status];
  const onDrop = async (e) => {
    const files = [...(e.dataTransfer?.files || [])];
    const text = e.dataTransfer?.getData("text/uri-list") || "";
    if (!files.length && !text) return;
    if (e.target.closest?.(".rte-area") && !files.length) return;
    e.preventDefault();
    const added = [];
    if (files.length) toast(`Envoi de ${files.length} fichier${files.length > 1 ? "s" : ""}…`);
    for (const f of files) { try { added.push(mediaFromUpload(await atelierApi.upload(f))); } catch { toast.error(`${f.name} : envoi impossible`); } }
    const l = !files.length && mediaFromText(text); if (l) added.push(l);
    if (added.length) { change({ media: [...(latest.current.media || []), ...added] }); toast.success("Ajouté aux médias"); }
  };

  return (
    <div className="at-editor" data-testid="atelier-editor" onDragOver={(e) => e.preventDefault()} onDrop={onDrop} style={{ "--u": at.universes.find((u) => u.id === it.universe_id)?.color || "var(--brand)" }}>
      <div className="at-ed-bar">
        <button className="at-btn ghost" onClick={close} data-testid="atelier-editor-close"><IoArrowBack size={16} /> <span className="hide-sm">Retour</span></button>
        <select value={it.kind} onChange={(e) => change({ kind: e.target.value })} data-testid="atelier-editor-kind">{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        <select value={it.universe_id || ""} onChange={(e) => change({ universe_id: e.target.value || null })} data-testid="atelier-editor-universe">
          <option value="">Inbox (sans univers)</option>{at.universes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <span className={"at-status mono s-" + status} data-testid="atelier-editor-status">{statusLabel}</span>
        <span className="grow" />
        <button className="at-icon" onClick={() => change({ pinned: !it.pinned })} title="Épingler" data-testid="atelier-editor-pin">{it.pinned ? <IoPin size={17} /> : <IoPinOutline size={17} />}</button>
        <button className="at-icon" onClick={() => setPanel(panel === "versions" ? null : "versions")} title="Versions" data-testid="atelier-editor-versions"><IoTimeOutline size={17} /></button>
        <button className="at-icon" onClick={() => setPanel(panel === "style" ? null : "style")} title="Mise en forme" data-testid="atelier-editor-style"><IoColorPaletteOutline size={17} /></button>
        <button className="at-icon" onClick={async () => { await flush(); setPanel("view"); }} title="Visualiser" data-testid="atelier-editor-view"><IoEyeOutline size={17} /></button>
        <button className="at-icon" onClick={() => printItem(it, uname)} title="Exporter en PDF" data-testid="atelier-editor-pdf"><IoPrintOutline size={17} /></button>
        <button className="at-icon txt" onClick={async () => { await flush(); try { await atelierApi.downloadDocx(it.id, it.title); } catch { toast.error("Export Word impossible"); } }} title="Exporter en Word (.docx)" data-testid="atelier-editor-docx">W</button>
        <button className="at-icon danger" onClick={remove} title="Supprimer" data-testid="atelier-editor-delete"><IoTrashOutline size={17} /></button>
        <button className="at-icon hide-sm" onClick={toggleSide} title={side ? "Replier le panneau de droite" : "Afficher le panneau de droite"} data-testid="atelier-editor-side">{side ? <IoChevronForward size={17} /> : <IoChevronBack size={17} />}</button>
      </div>

      <div className={"at-ed-body" + (side ? "" : " side-closed")}>
        {dst.bg && <><link rel="stylesheet" href={docFonts()} /><style>{DOC_CSS}</style></>}
        <article className={"at-ed-main" + (wide ? " ed-wide" : "") + (dst.bg && fmt === "flow" ? " dz dz-edit" : "")} data-deco={dst.deco || undefined} style={fmt === "flow" ? styleVars(dst) : undefined}>
          <div className="at-ed-fmts" data-testid="atelier-editor-formats">
            {[["flow", "Flux"], ...DOC_FORMATS].map(([k, l]) => <button key={k} className={fmt === k ? "on" : ""} onClick={() => setFmt(k)} data-testid={`atelier-format-${k}`}>{l}</button>)}
            <span className="grow" />
            <button className={"at-ed-wide" + (wide ? " on" : "")} onClick={toggleWide} data-testid="atelier-format-wide" title={wide ? "Largeur page" : "Pleine largeur"}>{wide ? "Pleine largeur" : "Page"}</button>
          </div>
          {fmt === "flow"
            ? <RichTextEditor key={it.id + ":" + rev} value={it.content} onChange={(html) => change({ content: html })} page eyebrow={`${KINDS[it.kind]?.kanji} ${KINDS[it.kind]?.label.toUpperCase()}${uname ? ` · ${uname.toUpperCase()}` : " · INBOX"}`} title={it.title} onTitle={(t) => change({ title: t })} placeholder="Écris, colle depuis Google Docs, développe ton idée…" />
            : <DocEdit key={it.id + ":" + rev + ":" + fmt} value={it.content} onChange={(html) => change({ content: html })} format={fmt} styleKey={it.fields?.doc?.style} eyebrow={`${KINDS[it.kind]?.label || ""}${uname ? " · " + uname : ""}`} title={it.title} onTitle={(t) => change({ title: t })} image={it.image} />}
        </article>

        <aside className="at-ed-side">
          <div className="at-ed-img">
            {it.image ? <img src={imgSrc(it.image)} alt="" /> : <span>{KINDS[it.kind]?.kanji}</span>}
            <div className="acts">
              <button className="at-btn ghost" disabled={busy} onClick={() => file.current?.click()} data-testid="atelier-editor-image"><IoImageOutline size={15} /> {busy ? "Envoi…" : it.image ? "Changer" : "Image"}</button>
              {it.image && <button className="at-btn ghost" onClick={() => change({ image: "" })}><IoTrashOutline size={14} /></button>}
            </div>
            <input ref={file} hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; upload(f); }} />
          </div>
          <div className="at-form">
            {(KIND_FIELDS[it.kind] || []).map(([k, l]) => (
              <label key={k}>{l}<input value={it.fields?.[k] || ""} onChange={(e) => change({ fields: { ...(it.fields || {}), [k]: e.target.value } })} data-testid={`atelier-field-${k}`} /></label>
            ))}
            <label>Date / repère chronologique<input value={it.date || ""} onChange={(e) => change({ date: e.target.value })} placeholder="ex. An 312, Chapitre 4, 2026-05-01" data-testid="atelier-editor-date" /></label>
            <label>Étiquettes<input value={(it.tags || []).join(", ")} onChange={(e) => change({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="séparées par des virgules" data-testid="atelier-editor-tags" /></label>
          </div>
          <div className="at-ed-sec">
            <h3><IoLinkOutline size={14} /> Éléments reliés</h3>
            <div className="at-chips">
              {links.map((l) => <span key={l.id} className="chip on"><b onClick={() => goTo(l.id)}>{KINDS[l.kind]?.kanji} {l.title || "Sans titre"}</b><IoClose size={12} onClick={() => change({ links: it.links.filter((x) => x !== l.id) })} /></span>)}
              {backlinks.map((l) => <span key={l.id} className="chip back" title="Relié depuis cet élément" onClick={() => goTo(l.id)}>↩ {l.title || "Sans titre"}</span>)}
            </div>
            {others.length > 0 && (
              <select value="" onChange={(e) => e.target.value && change({ links: [...(it.links || []), e.target.value] })} data-testid="atelier-editor-link-add">
                <option value="">+ Relier un élément…</option>
                {others.map((o) => <option key={o.id} value={o.id}>{KINDS[o.kind]?.label} · {o.title || "Sans titre"}</option>)}
              </select>
            )}
          </div>
          <div className="at-ed-sec">
            <h3>Médias & références</h3>
            <MediaGallery media={it.media || []} onChange={(media) => change({ media })} />
          </div>
          <div className="at-ed-sec">
            <h3>Tâches liées</h3>
            {tasks.map((t) => <TaskRow key={t.id} t={t} at={at} open={() => {}} compact />)}
            <TaskQuickAdd at={at} defaults={{ item_id: it.id, universe_id: it.universe_id }} />
          </div>
        </aside>
      </div>
      {panel === "style" && <DocStylePanel doc={it.fields?.doc || {}} onChange={(d) => change({ fields: { ...(it.fields || {}), doc: { ...(it.fields?.doc || {}), ...d } } })} onView={() => setPanel("view")} onClose={() => setPanel(null)} />}
      {panel === "view" && <DocView it={it} eyebrow={`${KINDS[it.kind]?.label || ""}${uname ? " · " + uname : ""}`} onClose={() => setPanel(null)} />}
      {panel === "versions" && <Versions id={it.id} onRestore={restore} onClose={() => setPanel(null)} />}
    </div>
  );
}
