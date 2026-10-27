import { useCallback, useEffect, useState } from "react";
import { IoLogoGoogle, IoSearch, IoFolderOutline, IoChevronForward, IoArchiveOutline, IoUnlinkOutline } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi } from "@/lib/atelier";
import { FilePreview } from "@/components/atelier/FileViewer";

const FOLDER = "application/vnd.google-apps.folder";
const VIEWS = [["mine", "Mon Drive"], ["shared", "Partagés avec moi"], ["recent", "Récents"]];

function Connect({ st }) {
  const go = async () => { try { const r = await atelierApi.driveConnect(); window.location.href = r.url; } catch (e) { toast.error(e?.response?.data?.detail || "Connexion impossible"); } };
  return (
    <div className="at-panel dv-connect" data-testid="drive-connect-panel">
      <IoLogoGoogle size={34} />
      <h2>Connecte ton Google Drive</h2>
      <p className="at-sub">Parcours, cherche et ouvre tes Docs, Sheets, PDF, images et vidéos directement dans l'Atelier. Accès en lecture seule : l'Atelier ne modifie jamais ton Drive.</p>
      {!st.configured ? <p className="bn-err">Les identifiants Google ne sont pas encore configurés.</p> : <button className="at-btn" onClick={go} data-testid="drive-connect-btn"><IoLogoGoogle size={15} />Se connecter à Google</button>}
      <small className="mono dv-hint">URI DE REDIRECTION À AUTORISER DANS GOOGLE CLOUD : {window.location.origin}/api/atelier/drive/callback</small>
    </div>
  );
}

// Google Drive connecté : navigation dossiers, recherche, aperçu et rangement dans un univers
export default function DriveView({ at }) {
  const [st, setSt] = useState(null);
  const [view, setView] = useState("mine");
  const [path, setPath] = useState([]);
  const [q, setQ] = useState("");
  const [list, setList] = useState({ files: [], next: "" });
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState(null);
  const [uid, setUid] = useState("");
  const folder = path[path.length - 1]?.id || "";

  useEffect(() => { atelierApi.driveStatus().then(setSt).catch(() => setSt({ configured: false, connected: false })); }, []);
  const load = useCallback(async (page = "") => {
    setBusy(true);
    try { const r = await atelierApi.driveFiles({ view, folder, q, page }); setList((l) => ({ files: page ? [...l.files, ...r.files] : r.files, next: r.next })); }
    catch (e) { toast.error(e?.response?.data?.detail || "Drive indisponible"); }
    finally { setBusy(false); }
  }, [view, folder, q]);
  useEffect(() => { if (st?.connected) load(); }, [st, view, folder]); // eslint-disable-line

  if (!st) return <section className="at-view"><p className="at-empty">Connexion au Drive…</p></section>;
  const keep = async (f) => {
    await at.createItem({ kind: "file", title: f.name, universe_id: uid || null, image: "", media: [{ id: "drive-" + f.id, type: "drive", drive_id: f.id, url: f.webViewLink, name: f.name, mime: f.mimeType }] });
    toast.success(`« ${f.name} » rangé dans ${at.universes.find((u) => u.id === uid)?.name || "l'Inbox"}`);
  };
  const openF = (f) => (f.mimeType === FOLDER ? (setPath([...path, { id: f.id, name: f.name }]), setQ(""), setSel(null)) : setSel(f));
  const disconnect = async () => { if (!window.confirm("Déconnecter Google Drive ?")) return; await atelierApi.driveDisconnect(); setSt({ ...st, connected: false }); };

  return (
    <section className="at-view" data-testid="atelier-drive">
      <header className="at-head"><p className="at-eyebrow mono">// GOOGLE DRIVE {st.email ? `· ${st.email.toUpperCase()}` : ""}</p><h1>Ton Drive, à bord</h1></header>
      {!st.connected ? <Connect st={st} /> : (
        <>
          <div className="dv-bar">
            <div className="at-chips">{VIEWS.map(([k, l]) => <button key={k} className={view === k && !q ? "on" : ""} onClick={() => { setView(k); setPath([]); setQ(""); }} data-testid={`drive-view-${k}`}>{l}</button>)}</div>
            <form className="dv-search" onSubmit={(e) => { e.preventDefault(); load(); }}><IoSearch size={14} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher dans ton Drive…" data-testid="drive-search" /></form>
            <button className="at-icon" onClick={disconnect} title="Déconnecter" data-testid="drive-disconnect"><IoUnlinkOutline size={16} /></button>
          </div>
          {path.length > 0 && <nav className="dv-crumbs mono"><button onClick={() => setPath([])}>RACINE</button>{path.map((p, i) => <span key={p.id}><IoChevronForward size={11} /><button onClick={() => setPath(path.slice(0, i + 1))}>{p.name.toUpperCase()}</button></span>)}</nav>}
          <div className={"dv-split" + (sel ? " has" : "")}>
            <div className="dv-grid" data-testid="drive-files">
              {list.files.map((f) => (
                <button key={f.id} className={"dv-file" + (sel?.id === f.id ? " on" : "")} onClick={() => openF(f)} data-testid={`drive-file-${f.id}`}>
                  {f.mimeType === FOLDER ? <IoFolderOutline size={30} className="dv-ico" /> : f.thumbnailLink ? <img src={f.thumbnailLink} alt="" referrerPolicy="no-referrer" loading="lazy" /> : <img src={f.iconLink} alt="" className="dv-small" referrerPolicy="no-referrer" />}
                  <span>{f.name}</span>
                </button>
              ))}
              {!busy && !list.files.length && <p className="at-empty">Rien ici.</p>}
              {list.next && <button className="at-btn ghost" onClick={() => load(list.next)} disabled={busy}>Voir plus</button>}
              {busy && <p className="at-empty mono">CHARGEMENT…</p>}
            </div>
            {sel && (
              <div className="dv-preview" data-testid="drive-preview">
                <div className="dv-preview-h"><b>{sel.name}</b>
                  <select value={uid} onChange={(e) => setUid(e.target.value)} data-testid="drive-keep-universe"><option value="">Inbox</option>{at.universes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
                  <button className="at-btn" onClick={() => keep(sel)} data-testid="drive-keep"><IoArchiveOutline size={14} />Ranger</button>
                  <button className="at-icon" onClick={() => setSel(null)} aria-label="Fermer">✕</button>
                </div>
                <div className="dv-preview-b"><FilePreview key={sel.id} m={{ type: "drive", drive_id: sel.id, url: sel.webViewLink, name: sel.name, mime: sel.mimeType }} /></div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
