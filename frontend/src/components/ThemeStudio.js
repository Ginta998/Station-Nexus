import { useEffect, useRef, useState } from "react";
import { IoClose, IoAdd, IoCloudUploadOutline, IoDownloadOutline, IoCopyOutline, IoPencil, IoTrashOutline, IoEyeOutline, IoEyeOffOutline, IoGlobeOutline, IoLockClosedOutline, IoRefresh, IoCheckmark } from "react-icons/io5";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { THEMES } from "@/lib/themes";
import { useThemeState, loadThemes, saveTheme, deleteTheme, setDraft, isCustomKey, newTheme, PRESETS } from "@/lib/themeStore";
import ThemeEditor, { readBuiltin } from "@/components/ThemeEditor";
import "@/components/themeStudio.css";

export function ThemeLoader() {
  const { isAdmin } = useApp();
  useEffect(() => { loadThemes(isAdmin); }, [isAdmin]);
  return null;
}

const strip = ({ updated_at, ...t }) => t;
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
  const del = async (k) => { if (!window.confirm(isCustomKey(k) ? "Supprimer définitivement ce thème ?" : "Revenir à la version d'origine ?")) return; if (theme === k && isCustomKey(k)) setTheme("abysse"); await deleteTheme(k); };

  if (edit) return <ThemeEditor initial={edit} onCancel={() => close(false)} onSaved={async (t) => { await upsert(t); toast.success("Thème enregistré"); close(true); }} />;

  const customs = s.docs.filter((d) => isCustomKey(d.key));
  return (
    <aside className="ts-panel" data-testid="theme-studio">
      <header className="ts-head">
        <div><p className="mono ts-eye">// ATELIER DE THÈMES</p><h2>Bibliothèque</h2></div>
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
        <h3>Modèles <small>pour démarrer</small></h3>
        <div className="ts-presets">{PRESETS.map((p) => (
          <button key={p.name} className="ts-preset" onClick={() => create(p)} style={{ background: `linear-gradient(${p.bg.angle}deg,${p.bg.g.join(",")})` }} data-testid={`theme-preset-${p.name}`}>
            <b style={{ fontFamily: `"${p.font_display}"` }}>{p.kanji}</b><span>{p.name}</span>
          </button>))}
        </div>
        <h3>Thèmes d'origine <small>modifiables</small></h3>
        {THEMES.map((t) => <Row key={t.key} t={t} doc={docOf(t.key)} on={theme === t.key} builtin acts={{ apply: () => setTheme(t.key), edit: () => editBuiltin(t.key), dup: () => dup(t.key), flag, exp: () => exp(t.key), del: () => del(t.key) }} />)}
      </div>
    </aside>
  );
}

function Row({ t, doc, on, builtin, acts }) {
  const enabled = doc?.enabled !== false; const pub = builtin ? doc?.public !== false : !!doc?.public;
  const sw = doc?.colors ? [doc.colors.bg, doc.colors.brand, doc.colors.brand2] : t.swatch || [];
  return (
    <div className={"ts-row" + (on ? " on" : "") + (enabled ? "" : " off")} data-testid={`theme-row-${t.key}`}>
      <button className="ts-sw" onClick={acts.apply} title="Appliquer">{sw.map((c, i) => <i key={i} style={{ background: c }} />)}</button>
      <div className="ts-info" onClick={acts.apply}>
        <b>{doc?.name || t.name} <span>{doc?.kanji || t.kanji}</span></b>
        <small>{on && <em><IoCheckmark /> actif</em>}{pub ? "Public" : "Privé"}{!enabled && " · désactivé"}{builtin && doc?.colors && " · retouché"}</small>
      </div>
      <div className="ts-ra">
        <button onClick={acts.edit} title="Modifier" data-testid={`theme-edit-${t.key}`}><IoPencil size={14} /></button>
        <button onClick={acts.dup} title="Dupliquer"><IoCopyOutline size={14} /></button>
        <button onClick={() => acts.flag(t.key, { enabled: !enabled })} title={enabled ? "Désactiver" : "Activer"} data-testid={`theme-toggle-${t.key}`}>{enabled ? <IoEyeOutline size={14} /> : <IoEyeOffOutline size={14} />}</button>
        <button onClick={() => acts.flag(t.key, { public: !pub })} title={pub ? "Rendre privé" : "Rendre public"} data-testid={`theme-public-${t.key}`}>{pub ? <IoGlobeOutline size={14} /> : <IoLockClosedOutline size={14} />}</button>
        <button onClick={acts.exp} title="Exporter en fichier"><IoDownloadOutline size={14} /></button>
        {(!builtin || doc) && <button onClick={acts.del} title={builtin ? "Revenir à l'original" : "Supprimer"} data-testid={`theme-del-${t.key}`}>{builtin ? <IoRefresh size={14} /> : <IoTrashOutline size={14} />}</button>}
      </div>
    </div>
  );
}
