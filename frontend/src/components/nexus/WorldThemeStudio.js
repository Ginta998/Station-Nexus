import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose, IoRefresh, IoCopyOutline, IoTrashOutline, IoSaveOutline, IoCheckmark } from "react-icons/io5";
import { toast } from "sonner";
import { WORLD_STYLES } from "@/components/nexus/world";
import { WT_BLANK, WT_FONTS, WT_CURSORS, newWorldKey, setWorldDraft, useWorldThemes, saveWorldTheme, deleteWorldTheme, isWorldKey } from "@/lib/worldThemes";
import { getCreationFull, updateCreation } from "@/lib/api";
import "@/components/nexus/studio.css";

/*
  L'atelier des thèmes de monde : un panneau posé sur le monde, qui le change en direct.
  On part d'un des douze thèmes (ou d'un thème déjà créé), on règle tout, on enregistre,
  puis on l'applique à l'œuvre. Les thèmes créés apparaissent aussi dans l'atelier de l'œuvre › Monde.
*/
const PT_NAMES = { cinema: "Poussière de pellicule", vhs: "Parasites", arcade: "Étoiles pixel", yorha: "Poussière d'archive", eve: "Étoiles", hero: "Étincelles", cathedrale: "Braises", couronne: "Cendres d'or", trait: "Taches d'encre", sengoku: "Cendres", survivance: "Spores", cristal: "Éclats de givre" };
const IN_NAMES = { cinema: "Écran large", vhs: "Bande qui défile", arcade: "Insert coin", yorha: "Connexion", eve: "Ouverture en anneau", hero: "Balayage", cathedrale: "Sceau de cire", couronne: "Éclat doré", trait: "Encre", sengoku: "Pinceau et sceau", survivance: "La lumière revient", cristal: "Éclats de verre" };
const pct = (v) => `${Math.round((v || 0) * 100)} %`;

// Petites briques du panneau (définies hors du composant pour ne pas perdre le focus en tapant)
const Sec = ({ n, title, children }) => <section className="wts-sec"><h3><span>{String(n).padStart(2, "0")}</span>{title}</h3>{children}</section>;
const Seg = ({ value, options, onChange, testid }) => <div className="wts-seg" data-testid={testid}>{options.map(([v, l]) => <button key={String(v)} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>)}</div>;
const Slide = ({ t, set, label, k, max = 1, step = 0.05, fmt = pct, auto }) => (
  <label className="wts-sl"><span>{label}</span>
    <input type="range" min={0} max={max} step={step} value={t[k] ?? 0} onChange={(e) => set({ [k]: Number(e.target.value) })} />
    <b>{auto && t[k] == null ? "auto" : fmt(t[k])}</b>
    {auto && t[k] != null && <button className="wts-auto" onClick={() => set({ [k]: null })}>auto</button>}
  </label>
);
const Color = ({ t, set, label, k }) => (
  <label className="wts-col"><span>{label}</span>
    <input type="color" value={t[k] || "#888888"} onChange={(e) => set({ [k]: e.target.value })} />
    <b>{t[k] || "auto"}</b>{t[k] && <button className="wts-auto" onClick={() => set({ [k]: "" })}>auto</button>}
  </label>
);
const Font = ({ t, set, label, k }) => (
  <label className="wts-font"><span>{label}</span>
    <select value={t[k] || ""} onChange={(e) => set({ [k]: e.target.value })} style={t[k] ? { fontFamily: `"${t[k]}"` } : undefined}>
      <option value="">Celle du thème de base</option>
      {WT_FONTS.map(([f, d]) => <option key={f} value={f} style={{ fontFamily: `"${f}"` }}>{f} · {d}</option>)}
    </select>
  </label>
);

export default function WorldThemeStudio({ item, ws, current, onClose, onApplied, sfx = () => {} }) {
  const mine = useWorldThemes();
  const start = current ? { ...WT_BLANK, ...current } : { ...WT_BLANK, base: ws, name: `Mon ${WORLD_STYLES[ws] || "thème"}` };
  const [t, setT] = useState(start);
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);
  const [replay, setReplay] = useState(0);
  const set = (p) => setT((x) => ({ ...x, ...p }));
  // le monde suit le brouillon en direct
  useEffect(() => { setWorldDraft({ ...t, forId: item.id, replay }); }, [t, replay, item.id]);
  useEffect(() => () => setWorldDraft(null), []);
  const bases = useMemo(() => Object.entries(WORLD_STYLES), []);

  const save = async (apply) => {
    if (!t.name.trim()) { toast.error("Donne un nom au thème"); return null; }
    setBusy(true);
    try {
      const key = t.key && isWorldKey(t.key) ? t.key : newWorldKey();
      const { forId, replay: _r, ...clean } = t; // eslint-disable-line no-unused-vars
      const saved = await saveWorldTheme({ ...clean, key, name: t.name.trim() });
      setT((x) => ({ ...x, key }));
      if (apply) {
        const full = await getCreationFull(item.id);
        await updateCreation(item.id, { ...full, world_style: key }, true);
        onApplied?.(); toast.success(`« ${t.name.trim()} » habille maintenant ${item.title}`);
      } else toast.success("Thème enregistré");
      sfx("select"); setBusy(false); return saved;
    } catch (_) { toast.error("Enregistrement impossible (reconnecte-toi en admin)"); setBusy(false); return null; }
  };
  const remove = async () => {
    if (!t.key) return;
    try { await deleteWorldTheme(t.key); toast.success("Thème supprimé"); setT({ ...WT_BLANK, base: ws, name: `Mon ${WORLD_STYLES[ws]}` }); setDel(false); } catch (_) { toast.error("Suppression impossible"); }
  };

  return createPortal(
    <aside className="wts rl-dark" role="dialog" aria-label="Atelier des thèmes de monde" data-testid="world-studio">
      <header className="wts-top">
        <p><span>ATELIER DES THÈMES</span><i>/</i><b>{t.name || "Sans nom"}</b></p>
        <button onClick={onClose} aria-label="Fermer l'atelier des thèmes" data-testid="wts-close"><IoClose size={17} /></button>
      </header>
      <div className="wts-body">
        <Sec n={1} title="Partir de">
          <div className="wts-chips">
            {mine.map((d) => <button key={d.key} className={t.key === d.key ? "on" : ""} onClick={() => setT({ ...WT_BLANK, ...d })} data-testid={`wts-mine-${d.key}`}>{d.name}</button>)}
          </div>
          <select className="wts-in" value={t.base} onChange={(e) => set({ base: e.target.value })} data-testid="wts-base">
            {bases.map(([k, l]) => <option key={k} value={k}>Base : {l}</option>)}
          </select>
          <input className="wts-in" value={t.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nom du thème" data-testid="wts-name" />
        </Sec>
        <Sec n={2} title="Couleurs"><Color t={t} set={set} label="Encre" k="ink" /><Color t={t} set={set} label="Fond" k="paper" /><Color t={t} set={set} label="Accent" k="hl" /></Sec>
        <Sec n={3} title="Polices">
          <Font t={t} set={set} label="Titres" k="font_title" /><Font t={t} set={set} label="Menus" k="font_ui" /><Font t={t} set={set} label="Textes" k="font_body" />
          <Seg value={t.title_case} onChange={(v) => set({ title_case: v })} options={[["auto", "Auto"], ["upper", "MAJUSCULES"], ["none", "Normal"]]} />
        </Sec>
        <Sec n={4} title="Disposition">
          <Seg value={!!t.mirror} onChange={(v) => set({ mirror: v })} options={[[false, "Normale"], [true, "Miroir"]]} testid="wts-mirror" />
          <Seg value={t.win !== false} onChange={(v) => set({ win: v })} options={[[true, "Avec fenêtre"], [false, "Sans fenêtre"]]} />
          <Seg value={t.radius ?? "auto"} onChange={(v) => set({ radius: v })} options={[["auto", "Coins auto"], [0, "Droits"], [6, "Doux"], [14, "Ronds"], [24, "Très ronds"]]} />
        </Sec>
        <Sec n={5} title="Fond et matière">
          <Slide t={t} set={set} label="Assombrir" k="bg_dim" max={0.9} auto />
          <Slide t={t} set={set} label="Flou" k="bg_blur" max={30} step={1} fmt={(v) => `${v || 0} px`} auto />
          <Slide t={t} set={set} label="Grain" k="grain" /><Slide t={t} set={set} label="Lignes d'écran" k="scan" /><Slide t={t} set={set} label="Vignette" k="vignette" />
        </Sec>
        <Sec n={6} title="Particules">
          <div className="wts-chips">
            {[["auto", "Celles du thème"], ["none", "Aucune"], ...Object.entries(PT_NAMES)].map(([k, l]) => <button key={k} className={t.pt === k ? "on" : ""} onClick={() => set({ pt: k })} data-testid={`wts-pt-${k}`}>{l}</button>)}
          </div>
        </Sec>
        <Sec n={7} title="Transition d'entrée">
          <div className="wts-chips">
            {[["auto", "Celle du thème"], ["none", "Aucune"], ...Object.entries(IN_NAMES)].map(([k, l]) => <button key={k} className={t.intro === k ? "on" : ""} onClick={() => { set({ intro: k }); setReplay((r) => r + 1); }} data-testid={`wts-in-${k}`}>{l}</button>)}
          </div>
          <button className="wts-btn" onClick={() => setReplay((r) => r + 1)} data-testid="wts-replay"><IoRefresh /> Rejouer l'entrée</button>
        </Sec>
        <Sec n={8} title="Effet de souris">
          <div className="wts-chips">
            {WT_CURSORS.map(([k, l, d]) => <button key={k} title={d} className={(t.cursor || "none") === k ? "on" : ""} onClick={() => set({ cursor: k })} data-testid={`wts-cur-${k}`}>{l}</button>)}
          </div>
          <small className="wts-note">Sur ordinateur seulement ; au toucher, rien ne change.</small>
        </Sec>
      </div>
      <footer className="wts-foot">
        <button className="wts-btn" onClick={() => save(false)} disabled={busy} data-testid="wts-save"><IoSaveOutline /> Enregistrer</button>
        <button className="wts-btn go" onClick={() => save(true)} disabled={busy} data-testid="wts-apply"><IoCheckmark /> Appliquer à l'œuvre</button>
        <span className="wts-grow" />
        {t.key && <button className="wts-ic" title="Dupliquer" aria-label="Dupliquer" onClick={() => setT((x) => ({ ...x, key: undefined, name: x.name + " (copie)" }))}><IoCopyOutline /></button>}
        {t.key && (del ? <button className="wts-ic del" onClick={remove}>Supprimer ?</button> : <button className="wts-ic" title="Supprimer" aria-label="Supprimer" onClick={() => setDel(true)}><IoTrashOutline /></button>)}
      </footer>
    </aside>,
    document.body
  );
}
