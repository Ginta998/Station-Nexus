import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import DocView from "@/components/atelier/DocView";
import { styleOf, styleVars, DOC_CSS, docFonts } from "@/lib/docStyles";
import "@/components/atelier/docs.css";

// Document partagé par lien : lecture, commentaires ou modification selon le niveau choisi
export default function SharedDoc() {
  const { token } = useParams();
  const [it, setIt] = useState(null);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(false);
  const body = useRef(null); const ttl = useRef(null);
  const load = () => api.get(`/share/${token}`).then((r) => setIt(r.data)).catch(() => setErr("Ce lien n'est plus actif."));
  useEffect(() => { load(); }, [token]); // eslint-disable-line
  if (err) return <div className="dv-root" style={{ display: "grid", placeItems: "center", color: "#ccc" }} data-testid="shared-doc-error">{err}</div>;
  if (!it) return <div className="dv-root" />;
  if (editing) {
    const s = styleOf(it.fields?.doc?.style);
    const save = async () => { try { await api.put(`/share/${token}`, { title: ttl.current.innerText.trim(), content: body.current.innerHTML }); toast.success("Modifications enregistrées"); setEditing(false); load(); } catch (_) { toast.error("Enregistrement impossible"); } };
    return (
      <div className="dv-root" data-testid="shared-doc-editor">
        <link rel="stylesheet" href={docFonts()} /><style>{DOC_CSS}</style>
        <div className="dv-bar"><b>Mode modification</b><span className="grow" /><button className="at-btn ghost" onClick={() => setEditing(false)}>Annuler</button><button className="at-btn" onClick={save} data-testid="shared-doc-save">Enregistrer</button></div>
        <div className="dv-scroll"><div className="dz f-a4" data-deco={s.deco || ""} style={styleVars(s)}>
          <header className="dz-cover"><h1 className="dz-title" ref={ttl} contentEditable suppressContentEditableWarning>{it.title}</h1></header>
          <div className="dz-body dv-edit" ref={body} contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: it.content || "<p></p>" }} data-testid="shared-doc-body" />
        </div></div>
      </div>
    );
  }
  return <DocView it={it} eyebrow="STATION NEXUS" shared token={token} onEdit={() => setEditing(true)} />;
}
