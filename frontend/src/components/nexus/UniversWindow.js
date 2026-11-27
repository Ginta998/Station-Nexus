import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IoClose, IoCreateOutline, IoCheckmark, IoPlay } from "react-icons/io5";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useObjs, Obj, progressOf } from "@/components/nexus/HomeBlocs";
import "@/components/nexus/blocs.css";

// La fenêtre d'un univers : le monde en grand, sa description (modifiable par l'admin), et toutes ses créations en objets.
export default function UniversWindow({ name, all = [], cats = [], onClose, page = false }) {
  const qc = useQueryClient();
  const { isAdmin, sfx } = useApp();
  const { data: s } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const objs = useObjs(all, cats);
  const list = useMemo(() => objs.filter((o) => (o.it.univers || "").trim().toLowerCase() === (name || "").trim().toLowerCase()), [objs, name]);
  const info = s?.univers_info?.[name] || {};
  const [edit, setEdit] = useState(null);
  const bg = (list.find((o) => o.it.has_bg) || list[0] || {}).bg;
  const kj = info.kj || list[0]?.emblem || "界";
  useEffect(() => { const k = (e) => { if (e.key === "Escape" && !edit) onClose?.(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose, edit]);
  useEffect(() => { if (page) return undefined; const o = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = o; }; }, [page]);
  const go = (id, quick) => { onClose?.(); setTimeout(() => window.dispatchEvent(new CustomEvent("nx-start", { detail: { id, quick } })), 60); };
  const save = async () => {
    try {
      await updateSettings({ ...s, univers_info: { ...(s?.univers_info || {}), [name]: { ...info, desc: edit.desc, kj: edit.kj } } });
      qc.invalidateQueries({ queryKey: ["settings"] }); setEdit(null); sfx?.("select"); toast.success("Univers enregistré");
    } catch (_) { toast.error("Enregistrement impossible"); }
  };
  const formats = [...new Set(list.map((o) => ({ livre: "livres", vhs: "cassettes", vinyle: "disques" })[o.format]))];
  return (
    <div className={"uvw" + (page ? " page" : "")} role="dialog" aria-label={`Univers ${name}`} data-testid="univers-window" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="uvw-win">
        <div className="uvw-banner">
          {bg && <div className="uvw-bg" style={{ backgroundImage: `url("${bg}")` }} />}
          <div className="uvw-shade" aria-hidden="true" />
          <span className="uvw-kj" aria-hidden="true">{kj}</span>
          <button type="button" className="uvw-x" onClick={onClose} aria-label="Fermer" data-testid="univers-close"><IoClose size={20} /></button>
          <div className="uvw-head">
            <p className="mono">Univers · {list.length} création{list.length > 1 ? "s" : ""}{formats.length ? ` · ${formats.join(", ")}` : ""}</p>
            <h2>{name}</h2>
          </div>
        </div>
        <div className="uvw-body">
          <div className="uvw-desc">
            {edit ? (<>
              <div className="uvw-edrow"><label>Emblème<input value={edit.kj} maxLength={3} onChange={(e) => setEdit({ ...edit, kj: e.target.value })} /></label></div>
              <textarea rows={6} value={edit.desc} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} placeholder="Raconte cet univers : son monde, ses règles, ce qui relie ses œuvres… (ligne vide = nouveau paragraphe)" data-testid="univers-desc-input" />
              <div className="uvw-acts"><button className="af-btn f" onClick={save} data-testid="univers-desc-save"><IoCheckmark size={14} /> Enregistrer</button><button className="af-btn o" onClick={() => setEdit(null)}>Annuler</button></div>
            </>) : (<>
              {info.desc ? info.desc.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>) : <p className="uvw-empty">{isAdmin ? "Pas encore de description. Raconte cet univers à tes visiteurs." : "Un univers de la Station."}</p>}
              {isAdmin && <button className="uvw-edit mono" onClick={() => setEdit({ desc: info.desc || "", kj: info.kj || "" })} data-testid="univers-desc-edit"><IoCreateOutline size={13} /> Modifier la description</button>}
            </>)}
          </div>
          {list.length > 0 && <div className="uvw-shelf">
            <div className="hb-objs">{list.map((o) => <Obj key={o.id} o={o} z={0.66} line={progressOf(o.it)?.label} />)}</div>
            <div className="hb-counter" aria-hidden="true" />
          </div>}
          <div className="uvw-list">{list.map((o, i) => (
            <article key={o.id} className="uvw-item" style={{ animationDelay: `${120 + i * 70}ms` }}>
              {o.cover && <img src={o.cover} alt="" loading="lazy" />}
              <div>
                <p className="mono">{o.roomLabel}{o.up && !/venir/i.test(o.roomLabel) ? " · À venir" : ""}</p>
                <h3>{o.title}</h3>
                {o.sub && <p className="sub">{o.sub}</p>}
                {o.it.synopsis && <p className="syn">{o.it.synopsis}</p>}
                <button type="button" className="af-btn f" onClick={() => go(o.id)}><IoPlay size={13} /> {o.up ? "Découvrir" : "Entrer"}</button>
              </div>
            </article>))}
          </div>
        </div>
      </div>
    </div>
  );
}
