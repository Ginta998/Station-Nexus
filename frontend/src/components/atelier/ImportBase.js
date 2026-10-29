import { useMemo, useState } from "react";
import { IoClose, IoSparklesOutline, IoWarningOutline } from "react-icons/io5";
import { toast } from "sonner";
import base from "@/data/nexus-base.json";

// Importe ma base : crée automatiquement univers → œuvres → éléments (+ réseau narratif) depuis le fichier généré.
export default function ImportBase({ at, onClose, go }) {
  const [running, setRunning] = useState(false);
  const [prog, setProg] = useState({ done: 0, total: 0, label: "" });
  const [report, setReport] = useState(null);
  const already = (() => { try { return localStorage.getItem("nexus-base-imported") === "1"; } catch { return false; } })();

  const stats = useMemo(() => {
    const u = base.universes.length;
    const o = base.universes.reduce((s, x) => s + x.oeuvres.length, 0);
    const e = base.universes.reduce((s, x) => s + x.elements.length + x.oeuvres.reduce((a, b) => a + b.elements.length, 0), 0);
    return { u, o, e };
  }, []);

  const run = async () => {
    if (already && !window.confirm("Tu as déjà importé une fois. Relancer va créer une seconde copie de tout. Continuer ?")) return;
    setRunning(true); setReport(null);
    const total = base.universes.reduce((s, u) => s + 1 + u.elements.length + u.oeuvres.reduce((a, o) => a + 1 + o.elements.length, 0), 0);
    let done = 0, fails = 0; const tmpToId = {}; const linkJobs = []; const createdU = [], createdI = [];
    const step = (label) => { done += 1; setProg({ done, total, label }); };
    const el = async (e, universe_id, oeuvre_id) => {
      try {
        const fields = { ...(e.fields || {}) }; if (oeuvre_id) fields.oeuvre_id = oeuvre_id;
        const doc = await at.createItem({ kind: e.kind || "note", title: e.title || "Sans titre", content: e.content || "", universe_id, fields, tags: [...(e.tags || []), "nexus-base"] });
        if (e.tmp) tmpToId[e.tmp] = doc.id; createdI.push(doc.id);
      } catch (_) { fails += 1; }
      step(e.title || "élément");
    };
    try {
      for (const u of base.universes) {
        let uni;
        try { uni = await at.saveUniverse({ name: u.name, kanji: u.kanji || "", color: u.color || "", description: u.description || "", cover: "", group: u.group || "", creation_ids: [] }); }
        catch (_) { fails += 1; step(u.name); continue; }
        if (u.tmp) tmpToId[u.tmp] = uni.id; createdU.push(uni.id);
        step(u.name);
        for (const e of u.elements) await el(e, uni.id, null);
        for (const o of u.oeuvres) {
          let oeu;
          try { oeu = await at.createItem({ kind: "document", title: o.title || "Œuvre", universe_id: uni.id, image: o.image || "", tags: ["nexus-base"], fields: { oeuvre: true, format: o.format || "autre", status: o.status || "en cours", color: u.color || "", kanji: "", desc: o.pitch || "" } }); }
          catch (_) { fails += 1; step(o.title); continue; }
          if (o.tmp) tmpToId[o.tmp] = oeu.id; createdI.push(oeu.id);
          if (o.links && o.links.length) linkJobs.push({ doc: oeu, links: o.links });
          step(o.title);
          for (const e of o.elements) await el(e, uni.id, oeu.id);
        }
      }
      for (const j of linkJobs) {  // réseau narratif : résout les liens tmp -> id réel
        const ids = j.links.map((t) => tmpToId[t]).filter(Boolean);
        if (ids.length) { try { await at.saveItem({ ...j.doc, links: ids }); } catch (_) {} }
      }
      try { localStorage.setItem("nexus-base-imported", "1"); localStorage.setItem("nexus-base-import-ids", JSON.stringify({ u: createdU, i: createdI })); } catch (_) {}
      setReport({ fails, total });
      toast.success(`Base importée : ${stats.u} univers, ${stats.o} œuvres, ${stats.e} éléments` + (fails ? ` (${fails} erreurs)` : ""));
    } finally { setRunning(false); }
  };

  // Vide tout l'Atelier (pour repartir propre après un import raté)
  const wipeAll = async () => {
    if (!window.confirm("Supprimer TOUS les univers et TOUTES les fiches de l'Atelier ? Irréversible.")) return;
    if (!window.confirm("Dernière confirmation : tout l'Atelier va être vidé.")) return;
    setRunning(true);
    try {
      const items = [...at.items]; let n = 0; const tot = items.length + at.universes.length;
      for (const it of items) { try { await at.removeItem(it.id); } catch (_) {} n++; setProg({ done: n, total: tot, label: "nettoyage…" }); }
      for (const u of [...at.universes]) { try { await at.removeUniverse(u.id); } catch (_) {} n++; setProg({ done: n, total: tot, label: "nettoyage…" }); }
      try { localStorage.removeItem("nexus-base-imported"); localStorage.removeItem("nexus-base-import-ids"); } catch (_) {}
      toast.success("Atelier vidé — tu peux réimporter proprement");
    } finally { setRunning(false); setProg({ done: 0, total: 0, label: "" }); }
  };

  return (
    <div className="at-modal" onClick={() => !running && onClose()} data-testid="atelier-import-base">
      <div className="at-modal-c" onClick={(e) => e.stopPropagation()} style={{ "--u": "var(--warm)" }}>
        <div className="at-modal-h"><h2><IoSparklesOutline size={18} /> Importer ma base</h2>{!running && <button onClick={() => onClose()} aria-label="Fermer"><IoClose size={20} /></button>}</div>
        <div className="at-form">
          {!report ? (
            <>
              <p className="at-sub" style={{ margin: 0 }}>Je vais créer automatiquement, à partir de tes bibles :</p>
              <div className="at-stats big" style={{ margin: "4px 0" }}>
                <div><b>{stats.u}</b><small className="mono">UNIVERS</small></div>
                <div><b>{stats.o}</b><small className="mono">ŒUVRES</small></div>
                <div><b>{stats.e}</b><small className="mono">ÉLÉMENTS</small></div>
              </div>
              <div className="at-imp-list">
                {base.universes.map((u, i) => (
                  <div key={i} className="at-imp-u"><span className="k" style={{ color: u.color }}>{u.kanji}</span><b>{u.name}</b><small className="mono">{u.oeuvres.length} œuvre{u.oeuvres.length > 1 ? "s" : ""}</small></div>
                ))}
              </div>
              {already && <p className="at-imp-warn"><IoWarningOutline size={15} /> Déjà importé une fois — relancer créera des doublons.</p>}
              {running && <div className="at-imp-prog"><div className="bar"><span style={{ width: `${Math.round(prog.done / (prog.total || 1) * 100)}%` }} /></div><small className="mono">{prog.done}/{prog.total} · {prog.label}</small></div>}
            </>
          ) : (
            <div className="at-imp-done">
              <p><b>C'est fait.</b> {stats.u} univers, {stats.o} œuvres et {stats.e} éléments créés{report.fails ? `, ${report.fails} en erreur` : ""}.</p>
              <p className="at-sub">Ouvre « Univers » pour tout retrouver et ajuster (affiches, couleurs, détails).</p>
            </div>
          )}
        </div>
        <div className="at-modal-f">
          {!report && <button className="at-btn danger" disabled={running} onClick={wipeAll} data-testid="atelier-import-wipe"><IoWarningOutline size={15} /> Vider l'Atelier</button>}
          <span className="grow" />
          {!report ? (
            <>
              <button className="at-btn ghost" disabled={running} onClick={() => onClose()}>Annuler</button>
              <button className="at-btn" disabled={running} onClick={run} data-testid="atelier-import-run"><IoSparklesOutline size={15} /> {running ? "Création…" : "Tout créer"}</button>
            </>
          ) : (
            <button className="at-btn" onClick={() => { onClose(); go && go({ name: "universes" }); }}>Voir mes univers</button>
          )}
        </div>
      </div>
    </div>
  );
}
