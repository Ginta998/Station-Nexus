import { Fragment, useState } from "react";
import { IoCopyOutline, IoAddCircleOutline, IoCheckmarkDone, IoCreateOutline } from "react-icons/io5";
import { KINDS } from "@/lib/atelier";

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

const attr = (tag, k) => (tag.match(new RegExp(`${k}="([^"]*)"`)) || [])[1] || "";

// Proposition de création / modification de document, appliquée seulement après validation
function DocCard({ tag, body, onApply, idx, at }) {
  const [state, setState] = useState("");
  const create = attr(tag, "action") !== "update";
  const target = !create && at?.items.find((x) => x.id === attr(tag, "id"));
  const title = attr(tag, "titre") || target?.title || "Sans titre";
  const append = attr(tag, "mode") === "append";
  const kind = create ? (KINDS[attr(tag, "type")] ? attr(tag, "type") : "note") : target?.kind;
  const apply = async () => { setState("busy"); try { await onApply({ create, target, title, kind, append, body }); setState("done"); } catch (_) { setState("err"); } };
  return (
    <div className="bn-scene" data-testid={`bunny-doc-${idx}`}>
      <div className="bn-scene-h mono"><span>{KINDS[kind]?.kanji || "書"} {create ? `CRÉER · ${(KINDS[kind]?.label || "Note").toUpperCase()}` : append ? "COMPLÉTER" : "MODIFIER"}</span><b>{title}</b></div>
      {!create && !target && <p className="bn-err">Document introuvable, je peux le créer à la place.</p>}
      <div className="bn-scene-b"><Prose text={body.trim()} /></div>
      <div className="bn-scene-a">
        <button onClick={() => { navigator.clipboard?.writeText(body.trim()); setState("copied"); }} data-testid={`bunny-doc-copy-${idx}`}><IoCopyOutline size={14} />{state === "copied" ? "Copié" : "Copier"}</button>
        <button className="pri" onClick={apply} disabled={state === "busy" || state === "done"} data-testid={`bunny-doc-apply-${idx}`}>
          {state === "done" ? <><IoCheckmarkDone size={14} />Appliqué</> : state === "err" ? "Échec, réessayer" : <><IoCreateOutline size={14} />{create || !target ? "Créer" : "Appliquer"}</>}
        </button>
      </div>
    </div>
  );
}

const plain = (t) => t.replace(/<(scene|doc)[^>]*>/g, "\n").replace(/<\/(scene|doc)>/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

// Bulle de message : texte poétique + cartes de scènes insérables + tâches modifiées
export default function BunnyMessage({ m, idx, onInsertScene, onProposal, onApplyDoc, at, dest }) {
  const [copied, setCopied] = useState(false);
  if (m.role === "user") return <div className="bn-msg me" data-testid={`bunny-msg-${idx}`}><p>{m.content}</p></div>;
  const parts = m.content.split(/(<scene[^>]*>[\s\S]*?<\/scene>|<doc[^>]*>[\s\S]*?<\/doc>)/g);
  const copyAll = () => { navigator.clipboard?.writeText(plain(m.content)); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="bn-msg ai" data-testid={`bunny-msg-${idx}`}>
      <span className="bn-av" aria-hidden="true">兎</span>
      <div className="bn-txt">
        {parts.map((p, i) => {
          const dc = p.match(/^(<doc[^>]*>)([\s\S]*?)<\/doc>$/);
          if (dc) return <DocCard key={i} idx={`${idx}-${i}`} tag={dc[1]} body={dc[2]} onApply={onApplyDoc} at={at} />;
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
        <div className="bn-foot">
          {m.via && <small className="bn-via mono">via {m.via}</small>}
          <button className="bn-copy" onClick={copyAll} title="Copier le message" aria-label="Copier le message" data-testid={`bunny-msg-copy-${idx}`}>{copied ? <IoCheckmarkDone size={13} /> : <IoCopyOutline size={13} />}{copied ? " Copié" : ""}</button>
        </div>
      </div>
    </div>
  );
}
