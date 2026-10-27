import { useEffect, useState } from "react";
import { IoClose, IoArrowUp, IoArrowDown, IoTrashOutline, IoFlashOutline, IoKeyOutline, IoAdd } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi } from "@/lib/atelier";

const ago = (iso) => (iso ? new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "");
function status(b) {
  if (!b.enabled) return ["off", "Désactivé"];
  if (b.stats?.resting_until) return ["rest", `En pause jusqu'à ${ago(b.stats.resting_until)}`];
  if (b.stats?.last_ok) return ["ok", `A répondu à ${ago(b.stats.last_ok)} · ${(b.stats.latency_ms / 1000).toFixed(1)} s`];
  if (b.stats?.last_error) return ["err", b.stats.last_error];
  return ["idle", "Prêt"];
}

function BrainRow({ b, i, n, move, refresh }) {
  const [key, setKey] = useState(null);
  const [busy, setBusy] = useState(false);
  const [st, label] = status(b);
  const act = async (fn, ok) => { setBusy(true); try { await fn(); if (ok) toast.success(ok); await refresh(); } catch (e) { toast.error(e?.response?.data?.detail || "Action impossible"); } finally { setBusy(false); } };
  const test = () => act(async () => { const r = await atelierApi.testBrain(b.id); r.ok ? toast.success(`${b.name} : ${r.detail}`) : toast.error(`${b.name} ne répond pas (${r.detail || "erreur"})`); });
  return (
    <div className={"bn-brain " + st} data-testid={`brain-row-${b.id}`}>
      <span className="rank mono">{String(i + 1).padStart(2, "0")}</span>
      <div className="info">
        <b>{b.name}</b><small className="mono">{b.model}{b.has_key ? ` · CLÉ ${b.key_hint}` : " · SANS CLÉ"}</small>
        <em className={"st " + st} data-testid={`brain-status-${b.id}`}>{label}</em>
        {b.note && <span className="note">{b.note}</span>}
        {key !== null && (
          <div className="keyed">
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Colle la clé ici (vide = retirer la clé)" data-testid={`brain-key-input-${b.id}`} />
            <button className="at-btn" onClick={() => act(() => atelierApi.patchBrain(b.id, { key }), "Clé enregistrée").then(() => setKey(null))} data-testid={`brain-key-save-${b.id}`}>OK</button>
          </div>
        )}
      </div>
      <div className="acts">
        <label className="bn-switch" title={b.enabled ? "Désactiver" : "Activer"}><input type="checkbox" checked={b.enabled} disabled={busy} onChange={() => act(() => atelierApi.patchBrain(b.id, { enabled: !b.enabled }))} data-testid={`brain-toggle-${b.id}`} /><i /></label>
        <button className="at-icon" disabled={i === 0} onClick={() => move(i, -1)} title="Monter en priorité" data-testid={`brain-up-${b.id}`}><IoArrowUp size={14} /></button>
        <button className="at-icon" disabled={i === n - 1} onClick={() => move(i, 1)} title="Descendre" data-testid={`brain-down-${b.id}`}><IoArrowDown size={14} /></button>
        <button className="at-icon" onClick={() => setKey(key === null ? "" : null)} title="Ajouter / changer la clé" data-testid={`brain-key-${b.id}`}><IoKeyOutline size={14} /></button>
        <button className="at-icon" disabled={busy} onClick={test} title="Tester" data-testid={`brain-test-${b.id}`}><IoFlashOutline size={14} /></button>
        {!b.builtin && <button className="at-icon danger" onClick={() => window.confirm(`Retirer ${b.name} ?`) && act(() => atelierApi.deleteBrain(b.id), "Cerveau retiré")} title="Retirer" data-testid={`brain-delete-${b.id}`}><IoTrashOutline size={14} /></button>}
      </div>
    </div>
  );
}

function AddBrain({ presets, refresh }) {
  const [p, setP] = useState(null);
  const [v, setV] = useState({});
  const pick = (x) => { setP(x); setV({ name: x.name, base: x.base, model: x.model, key: "", note: x.note }); };
  const save = async () => {
    try { await atelierApi.addBrain(v); toast.success(`${v.name} rejoint le cerveau de Bunny !`); setP(null); await refresh(); }
    catch (e) { toast.error(e?.response?.data?.detail?.[0]?.msg || e?.response?.data?.detail || "Ajout impossible"); }
  };
  const f = (k, ph, type = "text") => <input type={type} value={v[k] || ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} placeholder={ph} data-testid={`brain-add-${k}`} />;
  return (
    <div className="bn-add" data-testid="brain-add">
      <div className="bn-presets">{presets.map((x) => <button key={x.key} className={p?.key === x.key ? "on" : ""} onClick={() => pick(x)} data-testid={`brain-preset-${x.key}`}><IoAdd size={13} />{x.name}</button>)}</div>
      {p && (
        <div className="bn-add-form">
          {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="at-link" data-testid="brain-add-getkey">Obtenir une clé gratuite chez {p.name.split(" ")[0]} ↗</a>}
          {f("name", "Nom affiché")}{f("base", "Adresse (https://…/v1)")}{f("model", "Modèle")}{f("key", "Clé API", "password")}
          <div className="at-inline"><button className="at-btn" onClick={save} data-testid="brain-add-save">Ajouter ce cerveau</button><button className="at-btn ghost" onClick={() => setP(null)}>Annuler</button></div>
        </div>
      )}
    </div>
  );
}

// Les cerveaux de Bunny : sur quoi elle tourne, dans quel ordre, ce qu'elle lit, et ajout de clés
export default function BunnyBrains({ onClose }) {
  const [d, setD] = useState(null);
  const refresh = () => atelierApi.brains().then(setD);
  useEffect(() => { refresh().catch(() => toast.error("Impossible de charger les cerveaux")); }, []);
  const move = async (i, dir) => { const ids = d.brains.map((b) => b.id); [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]]; await atelierApi.orderBrains(ids); refresh(); };
  const c = d?.composition;
  return (
    <div className="at-pal-wrap" onClick={onClose} data-testid="bunny-brains">
      <div className="at-pal bn-brains" onClick={(e) => e.stopPropagation()}>
        <header className="bn-head"><div className="bn-title"><b>Cerveaux de Bunny</b><small className="mono">// CE QUI LA COMPOSE AUJOURD'HUI</small></div><button className="at-icon" onClick={onClose} data-testid="bunny-brains-close"><IoClose size={18} /></button></header>
        {!d ? <p className="at-empty">Chargement…</p> : (
          <div className="bn-brains-body">
            <section>
              <h3 className="mono">// SA PERSONNALITÉ</h3><p className="bn-persona">{c.persona}</p>
              <div className="bn-skills">{c.skills.map((s) => <span key={s}>{s}</span>)}</div>
              <div className="bn-comp mono" data-testid="bunny-composition">
                <span><b>{c.universes}</b>UNIVERS</span><span><b>{c.items_read}/{c.items}</b>FICHES LUES</span><span><b>{c.tasks}</b>TÂCHES</span><span><b>{Math.round((c.context_chars / c.context_budget) * 100)}%</b>MÉMOIRE UTILISÉE</span><span><b>{c.sessions}</b>CONVERSATIONS</span>
              </div>
            </section>
            <section>
              <h3 className="mono">// SES CERVEAUX · ESSAYÉS DANS CET ORDRE</h3>
              <p className="at-sub">Si un cerveau est saturé ou en panne, Bunny passe au suivant. Un cerveau saturé se repose 10 minutes.</p>
              {d.brains.map((b, i) => <BrainRow key={b.id} b={b} i={i} n={d.brains.length} move={move} refresh={refresh} />)}
            </section>
            <section>
              <h3 className="mono">// AJOUTER UN CERVEAU</h3>
              <AddBrain presets={d.presets} refresh={refresh} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
