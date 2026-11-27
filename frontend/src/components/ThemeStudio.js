import { useEffect, useRef, useState } from "react";
import { IoClose, IoAdd, IoCloudUploadOutline, IoDownloadOutline, IoCopyOutline, IoPencil, IoTrashOutline, IoEyeOutline, IoEyeOffOutline, IoGlobeOutline, IoLockClosedOutline, IoRefresh, IoCheckmark } from "react-icons/io5";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { THEMES } from "@/lib/themes";
import { useThemeState, loadThemes, saveTheme, deleteTheme, setDraft, isCustomKey, newTheme, MODELES, osList, osTheme, DEFAULT_MASKED } from "@/lib/themeStore";
import ThemeEditor, { readBuiltin } from "@/components/ThemeEditor";
import { decorOf } from "@/lib/decors";
import "@/components/themeStudio.css";

export function ThemeLoader() {
  const { isAdmin } = useApp();
  useEffect(() => { loadThemes(isAdmin); }, [isAdmin]);
  return null;
}

const strip = ({ updated_at, ...t }) => t;
// Vignette d'un modèle : ses décors côte à côte (matin → nuit), sinon son ciel
const MODE_TXT = { heure: "Suit l'heure", visite: "Au hasard à chaque visite", minutes: "Change en boucle", "": "Décor fixe" };
const newKey = () => "c-" + Date.now().toString(36);
const download = (t) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(strip(t), null, 2)], { type: "application/json" })); a.download = `theme-${(t.name || t.key).replace(/\W+/g, "-").toLowerCase()}.nexustheme.json`; a.click(); };

export default function ThemeStudio({ onClose }) {
  const { theme, setTheme } = useApp();
  const s = useThemeState();
  const [edit, setEdit] = useState(null);
  const prev = useRef(theme);
  const file = useRef(null);
  const docOf = (k) => s.docs.find((d) => d.key === k);

  const open = (t) => { prev.current = theme; setDraft(t); setTheme(t.key); setEdit(t); };
  const create = (over = {}) => open(newTheme({ ...over, key: newKey(), public: false, enabled: true }));
  const editBuiltin = (k) => { const d = docOf(k); open(d?.colors ? { ...newTheme(d), ...d } : { ...newTheme(readBuiltin(k)), ...(d || {}), key: k, base: k }); };
  const close = (saved) => { setDraft(null); if (!saved) setTheme(prev.current); setEdit(null); };
  const upsert = async (t) => { try { await saveTheme(t); } catch (_) { toast.error("Enregistrement impossible"); } };
  const flag = (k, patch) => upsert({ ...(docOf(k) || { key: k }), ...patch });
  const dup = (k) => { const d = docOf(k); const src = d?.colors ? d : { ...readBuiltin(k), base: k }; const t = isCustomKey(k) ? d : THEMES.find((x) => x.key === k); create({ ...strip(src), name: `${(d || t).name} (copie)`, kanji: d?.kanji || t?.kanji }); };
  const exp = (k) => { const d = docOf(k); download(d?.colors ? d : { ...newTheme(readBuiltin(k)), ...(d || {}), key: k, base: k, name: THEMES.find((x) => x.key === k)?.name }); };
  const imp = async (f) => {
    try { const t = JSON.parse(await f.text()); if (!t.colors) throw new Error(); await saveTheme({ ...newTheme(t), ...t, key: newKey(), public: false }); toast.success(`Thème « ${t.name} » importé`); }
    catch (_) { toast.error("Fichier de thème invalide"); }
  };
  const editOs = (k) => { const d = docOf(k); open({ ...newTheme(osTheme(k)), ...osTheme(k), ...(d || {}), key: k }); };
  // Supprimer un thème d'origine (Nexus OS ou classique) : il quitte toutes les listes, la Corbeille le garde pour le remettre
  const nameOf = (k) => docOf(k)?.name || osList(s).find((t) => t.key === k)?.name || THEMES.find((t) => t.key === k)?.name || k;
  const drop = async (k) => { if (!window.confirm(`Supprimer « ${nameOf(k)} » ? Il disparaît des listes de la Station. Tu pourras le remettre depuis la Corbeille, en bas de Nexus OS.`)) return;
    await flag(k, { deleted: true, enabled: false }); if (theme === k) setTheme(osList(s).find((t) => t.key !== k && !t.deleted)?.key || "abysse"); toast.success(`« ${nameOf(k)} » supprimé`); };
  const restore = async (k) => { await flag(k, { deleted: false, enabled: true }); toast.success(`« ${nameOf(k)} » remis`); };
  const isGone = (k) => !!docOf(k)?.deleted;
  const del = async (k) => { if (!window.confirm(isCustomKey(k) ? "Supprimer définitivement ce thème ?" : "Revenir à la version d'origine ?")) return; if (theme === k && isCustomKey(k)) setTheme("abysse"); await deleteTheme(k); };

  if (edit) return <ThemeEditor initial={edit} onCancel={() => close(false)} onSaved={async (t) => { await upsert(t); toast.success("Thème enregistré"); close(true); }} />;

  const customs = s.docs.filter((d) => isCustomKey(d.key));
  return (
    <aside className="ts-panel" data-testid="theme-studio">
      <header className="ts-head">
        <div><p className="mono ts-eye">// NEXUS OS</p><h2>Tes thèmes</h2></div>
        <button className="ts-x" onClick={onClose} data-testid="theme-studio-close"><IoClose size={20} /></button>
      </header>
      <div className="ts-actions">
        <button className="ts-btn" onClick={() => create()} data-testid="theme-new"><IoAdd size={16} /> Nouveau thème</button>
        <button className="ts-btn ghost" onClick={() => file.current?.click()} data-testid="theme-import"><IoCloudUploadOutline size={16} /> Importer</button>
        <input ref={file} hidden type="file" accept=".json,application/json" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) imp(f); }} />
      </div>
      <div className="ts-scroll">
        <h3>Tes créations <small>{customs.length}</small></h3>
        {!customs.length && <p className="ts-empty">Aucun thème perso. Pars de zéro, d'un modèle ou copie un thème d'origine.</p>}
        {customs.map((d) => <Row key={d.key} t={d} doc={d} on={theme === d.key} acts={{ apply: () => setTheme(d.key), edit: () => open({ ...newTheme(d), ...d }), dup: () => dup(d.key), flag, exp: () => exp(d.key), del: () => del(d.key) }} />)}
        <h3>Nexus OS <small>les thèmes affichés</small></h3>
        {osList(s).filter((t) => !t.deleted).map((t) => <Row key={t.key} t={t} doc={docOf(t.key)} on={theme === t.key} os acts={{ drop: () => drop(t.key), apply: () => setTheme(t.key), edit: () => editOs(t.key), dup: () => create({ ...strip(osTheme(t.key)), key: undefined, name: `${t.name} (copie)` }), flag, exp: () => download({ ...osTheme(t.key), ...(docOf(t.key) || {}) }), del: () => del(t.key) }} />)}
        <h3>Modèles <small>des univers qui vivent avec le temps, pour démarrer un thème à toi</small></h3>
        <div className="ts-presets ts-modeles">{MODELES.map((p) => { const sc = p.bg.type === "scene"; const L = p.bg.layers || {}; const ds = sc ? [] : [L.decor, ...(L.decors || [])].map(decorOf).filter(Boolean); const scn = sc && THEMES.find((x) => x.key === p.bg.scene); return (
          <button key={p.key} className="ts-preset ts-modele" onClick={() => create({ ...p, key: undefined })} data-testid={`theme-preset-${p.key}`}
            onContextMenu={(e) => { e.preventDefault(); create({ ...p, key: undefined }); }} title={p.tagline}>
            <span className={"ts-m-strip" + (sc ? " scene" : "")}>{sc ? <i style={{ background: `radial-gradient(120% 140% at 30% 110%,${p.colors.brand}aa,transparent 60%),radial-gradient(90% 120% at 85% -10%,${p.colors.brand2}88,transparent 60%),${p.colors.bg}` }}><em>{scn?.kanji}</em></i> : ds.slice(0, 4).map((d) => <i key={d.id} style={{ backgroundImage: `url(${d.thumb})` }} />)}</span>
            <span className="ts-m-txt"><b style={{ fontFamily: `"${p.font_display}"`, color: p.colors.brand }}>{p.kanji}</b><span><strong>{p.name}</strong><small>{sc ? `Scène animée · ${scn?.name || p.bg.scene}` : `${MODE_TXT[L.decorMode || ""]} · ${ds.length} décors`}</small></span></span>
          </button>); })}
        </div>
        <h3>Thèmes d'origine <small>masqués, l'œil les réaffiche</small></h3>
        {THEMES.filter((t) => !isGone(t.key)).map((t) => <Row key={t.key} t={t} doc={docOf(t.key)} on={theme === t.key} builtin acts={{ drop: () => drop(t.key), apply: () => setTheme(t.key), edit: () => editBuiltin(t.key), dup: () => dup(t.key), flag, exp: () => exp(t.key), del: () => del(t.key) }} />)}
        {s.docs.some((d) => d.deleted) && <>
          <h3>Corbeille <small>thèmes supprimés, à remettre d'un clic</small></h3>
          {s.docs.filter((d) => d.deleted).map((d) => <div key={d.key} className="ts-row off" data-testid={`theme-gone-${d.key}`} onContextMenu={(e) => { e.preventDefault(); restore(d.key); }}>
            <div className="ts-info"><b>{nameOf(d.key)}</b><small>supprimé</small></div>
            <div className="ts-ra"><button onClick={() => restore(d.key)} title="Remettre" data-testid={`theme-restore-${d.key}`}><IoRefresh size={14} /> Remettre</button></div>
          </div>)}
        </>}
      </div>
    </aside>
  );
}

function Row({ t, doc, on, builtin, os, acts }) {
  const enabled = builtin ? (doc ? doc.enabled !== false && (doc.enabled === true || !DEFAULT_MASKED.includes(t.key)) : !DEFAULT_MASKED.includes(t.key)) : doc?.enabled !== false;
  const pub = builtin || os ? doc?.public !== false : !!doc?.public;
  const sw = doc?.colors ? [doc.colors.bg, doc.colors.brand, doc.colors.brand2] : t.swatch || [];
  return (
    <div className={"ts-row" + (on ? " on" : "") + (enabled ? "" : " off")} data-testid={`theme-row-${t.key}`}>
      <button className="ts-sw" onClick={acts.apply} title="Appliquer">{sw.map((c, i) => <i key={i} style={{ background: c }} />)}</button>
      <div className="ts-info" onClick={acts.apply}>
        <b>{doc?.name || t.name} <span>{doc?.kanji || t.kanji}</span></b>
        <small>{on && <em><IoCheckmark /> actif</em>}{pub ? "Public" : "Privé"}{!enabled && " · masqué"}{(builtin || os) && (doc?.colors || doc?.blocs) && " · retouché"}</small>
      </div>
      <div className="ts-ra">
        <button onClick={acts.edit} title="Modifier" data-testid={`theme-edit-${t.key}`}><IoPencil size={14} /></button>
        <button onClick={acts.dup} title="Dupliquer"><IoCopyOutline size={14} /></button>
        <button onClick={() => acts.flag(t.key, { enabled: !enabled })} title={enabled ? "Désactiver" : "Activer"} data-testid={`theme-toggle-${t.key}`}>{enabled ? <IoEyeOutline size={14} /> : <IoEyeOffOutline size={14} />}</button>
        <button onClick={() => acts.flag(t.key, { public: !pub })} title={pub ? "Rendre privé" : "Rendre public"} data-testid={`theme-public-${t.key}`}>{pub ? <IoGlobeOutline size={14} /> : <IoLockClosedOutline size={14} />}</button>
        <button onClick={acts.exp} title="Exporter en fichier"><IoDownloadOutline size={14} /></button>
        {(builtin || os) && <button onClick={acts.drop} title="Supprimer ce thème (Corbeille)" data-testid={`theme-drop-${t.key}`}><IoTrashOutline size={14} /></button>}
        {(!(builtin || os) || doc?.colors || doc?.blocs) && <button onClick={acts.del} title={builtin || os ? "Revenir à l'original" : "Supprimer"} data-testid={`theme-del-${t.key}`}>{builtin || os ? <IoRefresh size={14} /> : <IoTrashOutline size={14} />}</button>}
      </div>
    </div>
  );
}
