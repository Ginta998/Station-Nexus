import { Fragment, useState } from "react";
import { IoCopyOutline, IoAddCircleOutline, IoCheckmarkDone } from "react-icons/io5";

const LABELS = { appel: "surnom", identite: "identité", genre: "genre", vision: "vision", univers: "univers", influences: "influences", objectifs: "objectifs", style_ton: "ton", style_longueur: "longueur", aime: "ce que tu aimes", evite: "à éviter", mots_interdits: "mots interdits" };
const inline = (t) => t.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : <Fragment key={i}>{p}</Fragment>));
const Prose = ({ text }) => text.split(/\n{2,}/).filter((b) => b.trim()).map((b, i) => {
  const lines = b.split("\n");
  if (lines.every((l) => /^\s*[-•*]\s/.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-•*]\s/, ""))}</li>)}</ul>;
  return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l.replace(/^#+\s*/, ""))}</Fragment>)}</p>;
});

function SceneCard({ title, body, onInsert, idx, dest }) {
  const [state, setState] = useState("");
  const copy = () => { navigator.clipboard?.writeText(body.trim()); setState("copied"); };
  const insert = async () => { setState("busy"); await onInsert(title, body); setState("inserted"); };
  return (
    <div className="bn-scene" data-testid={`bunny-scene-${idx}`}>
      <div className="bn-scene-h mono"><span>場 SCÈNE</span><b>{title}</b></div>
      <div className="bn-scene-b"><Prose text={body.trim()} /></div>
      <div className="bn-scene-a">
        <button onClick={copy} data-testid={`bunny-scene-copy-${idx}`}><IoCopyOutline size={14} />{state === "copied" ? "Copié" : "Copier"}</button>
        <button className="pri" onClick={insert} disabled={state === "busy" || state === "inserted"} data-testid={`bunny-scene-insert-${idx}`}>
          {state === "inserted" ? <><IoCheckmarkDone size={14} />Ajoutée à {dest}</> : <><IoAddCircleOutline size={14} />Insérer comme scène</>}
        </button>
      </div>
    </div>
  );
}

// Bulle de message : texte poétique + cartes de scènes insérables + tâches modifiées
export default function BunnyMessage({ m, idx, onInsertScene, onProposal, dest }) {
  if (m.role === "user") return <div className="bn-msg me" data-testid={`bunny-msg-${idx}`}><p>{m.content}</p></div>;
  const parts = m.content.split(/(<scene[^>]*>[\s\S]*?<\/scene>)/g);
  return (
    <div className="bn-msg ai" data-testid={`bunny-msg-${idx}`}>
      <span className="bn-av" aria-hidden="true">兎</span>
      <div className="bn-txt">
        {parts.map((p, i) => {
          const sc = p.match(/^<scene(?:\s+titre="([^"]*)")?[^>]*>([\s\S]*?)<\/scene>$/);
          return sc ? <SceneCard key={i} idx={`${idx}-${i}`} title={sc[1] || "Nouvelle scène"} body={sc[2]} onInsert={onInsertScene} dest={dest} /> : <Prose key={i} text={p} />;
        })}
        {m.tasks?.length > 0 && (
          <div className="bn-tasks mono" data-testid={`bunny-tasks-${idx}`}>{m.tasks.map((t, i) => <span key={i}>{t.done ? "✓" : "＋"} {t.title}</span>)}</div>
        )}
        {m.deleted > 0 && <div className="bn-tasks mono"><span>✕ {m.deleted} tâche(s) supprimée(s)</span></div>}
        {m.learned?.length > 0 && <div className="bn-tasks mono" data-testid={`bunny-learned-${idx}`}><span>✦ PROFIL MIS À JOUR : {m.learned.map((k) => LABELS[k] || k).join(", ").toUpperCase()}</span></div>}
        {m.proposals?.map((p) => (
          <div key={p} className="bn-prop" data-testid={`bunny-proposal-${idx}`}>
            <small className="mono">JE RETIENS ÇA ?</small><p>{p}</p>
            <div><button className="pri" onClick={() => onProposal(idx, p, true)} data-testid={`bunny-proposal-yes-${idx}`}>Oui, retiens</button><button onClick={() => onProposal(idx, p, false)} data-testid={`bunny-proposal-no-${idx}`}>Non merci</button></div>
          </div>
        ))}
        {m.via && <small className="bn-via mono">via {m.via}</small>}
      </div>
    </div>
  );
}
