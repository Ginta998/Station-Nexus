import { useEffect, useRef, useState } from "react";
import { IoArrowBack, IoCloudUploadOutline, IoPlay } from "react-icons/io5";
import { toast } from "sonner";
import { THEMES } from "@/lib/themes";
import { uploadJournalImage, listAmbiences } from "@/lib/api";
import { SOUND_PACKS, playUiSound } from "@/lib/sound";
import { setDraft, FONTS, FX, KEY_SOUNDS, PALETTES, GRADIENTS, keySound, fontHref } from "@/lib/themeStore";

// Lit les valeurs réelles d'un thème d'origine pour pouvoir le retoucher
export function readBuiltin(key) {
  const el = document.documentElement; const css = el.style.cssText; const dt = el.getAttribute("data-theme");
  el.style.cssText = ""; el.setAttribute("data-theme", key);
  const cs = getComputedStyle(el); const g = (n) => cs.getPropertyValue(n).trim();
  const font = (n) => (g(n).split(",")[0] || "").replace(/["']/g, "").trim();
  const out = { base: key, colors: { bg: g("--bg-primary"), bg2: g("--bg-secondary"), brand: g("--brand"), brand2: g("--brand-2"), text: g("--text-primary"), text2: g("--text-secondary"), border: g("--border-c") },
    font_display: font("--font-display"), font_body: font("--font-body"), transform: g("--display-transform") || "none", spacing: parseFloat(g("--display-spacing")) || 0,
    radius: parseFloat(g("--radius-base")) || 0, border_w: parseFloat(g("--border-width")) || 1, bg: { type: "scene" }, name: THEMES.find((t) => t.key === key)?.name, kanji: THEMES.find((t) => t.key === key)?.kanji };
  el.style.cssText = css; el.setAttribute("data-theme", dt);
  return out;
}

const TABS = [["colors", "Couleurs"], ["type", "Typo"], ["shape", "Formes"], ["bg", "Fond"], ["fx", "Effets"], ["sound", "Sons"], ["info", "Réglages"]];
const COLORS = [["bg", "Fond"], ["bg2", "Surfaces"], ["brand", "Accent"], ["brand2", "Accent 2"], ["text", "Texte"], ["text2", "Texte doux"], ["border", "Bordures"]];

export default function ThemeEditor({ initial, onCancel, onSaved }) {
  const [t, setT] = useState(initial);
  const [tab, setTab] = useState("colors");
  useEffect(() => { setDraft(t); }, [t]);
  const set = (patch) => setT((o) => ({ ...o, ...patch }));
  const sub = (k, patch) => setT((o) => ({ ...o, [k]: { ...(o[k] || {}), ...patch } }));
  return (
    <aside className="ts-panel" data-testid="theme-editor">
      <header className="ts-head">
        <button className="ts-x" onClick={onCancel} title="Annuler" data-testid="theme-editor-cancel"><IoArrowBack size={18} /></button>
        <div className="ts-title">
          <input className="ts-kanji" value={t.kanji || ""} onChange={(e) => set({ kanji: e.target.value.slice(0, 3) })} />
          <input className="ts-name" value={t.name || ""} onChange={(e) => set({ name: e.target.value })} data-testid="theme-editor-name" />
        </div>
        <button className="ts-btn" onClick={() => onSaved(t)} data-testid="theme-editor-save">Enregistrer</button>
      </header>
      <p className="ts-live mono">● APERÇU EN DIRECT SUR TOUTE L'APP</p>
      <nav className="ts-tabs">{TABS.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} data-testid={`theme-tab-${k}`}>{l}</button>)}</nav>
      <div className="ts-scroll">
        {tab === "colors" && <ColorsTab t={t} sub={sub} />}
        {tab === "type" && <TypeTab t={t} set={set} />}
        {tab === "shape" && <ShapeTab t={t} set={set} />}
        {tab === "bg" && <BgTab t={t} sub={sub} set={set} />}
        {tab === "fx" && <FxTab t={t} set={set} sub={sub} />}
        {tab === "sound" && <SoundTab t={t} set={set} />}
        {tab === "info" && <InfoTab t={t} set={set} />}
      </div>
    </aside>
  );
}

const Field = ({ label, children }) => <label className="ts-field"><span>{label}</span>{children}</label>;
const Range = ({ label, value, min = 0, max = 100, step = 1, onChange, unit = "" }) => (
  <Field label={<>{label} <em>{value}{unit}</em></>}><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} /></Field>
);
const hex = (c) => (/^#[0-9a-f]{6}$/i.test(c) ? c : /^#[0-9a-f]{3}$/i.test(c) ? "#" + c.slice(1).split("").map((x) => x + x).join("") : "#000000");
const Color = ({ label, value, onChange }) => (
  <div className="ts-color"><input type="color" value={hex(value || "")} onChange={(e) => onChange(e.target.value)} /><span>{label}</span><input className="mono" value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>
);
const upload = async (f) => { try { toast("Envoi…"); return (await uploadJournalImage(f)).url; } catch (_) { toast.error("Envoi impossible"); return ""; } };
function Upload({ accept, onDone, label = "Importer" }) {
  const r = useRef(null);
  return <><button className="ts-btn ghost sm" onClick={() => r.current?.click()}><IoCloudUploadOutline size={14} /> {label}</button><input ref={r} hidden type="file" accept={accept} onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) { const u = await upload(f); if (u) onDone(u); } }} /></>;
}

function ColorsTab({ t, sub }) {
  return (<>
    <h4>Palettes</h4>
    <div className="ts-pals">{PALETTES.map(([n, c]) => <button key={n} title={n} onClick={() => sub("colors", { bg: c[0], bg2: c[1], brand: c[2], brand2: c[3], text: c[4], text2: c[5] })}>{c.slice(0, 4).map((x) => <i key={x} style={{ background: x }} />)}<span>{n}</span></button>)}</div>
    <h4>Sur mesure</h4>
    {COLORS.map(([k, l]) => <Color key={k} label={l} value={t.colors?.[k]} onChange={(v) => sub("colors", { [k]: v })} />)}
  </>);
}

function TypeTab({ t, set }) {
  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = fontHref(FONTS); document.head.appendChild(l); return () => l.remove(); }, []);
  const pick = (k) => <div className="ts-fonts">{FONTS.map((f) => <button key={f} className={t[k] === f ? "on" : ""} style={{ fontFamily: `"${f}"` }} onClick={() => set({ [k]: f })}>{f}</button>)}</div>;
  return (<>
    <h4>Titres</h4>{pick("font_display")}
    <h4>Texte</h4>{pick("font_body")}
    <Field label="Casse des titres"><div className="ts-seg">{[["none", "Normale"], ["uppercase", "MAJUSCULES"]].map(([v, l]) => <button key={v} className={t.transform === v ? "on" : ""} onClick={() => set({ transform: v })}>{l}</button>)}</div></Field>
    <Range label="Espacement des lettres" value={t.spacing ?? 0} min={-0.05} max={0.3} step={0.01} unit="em" onChange={(v) => set({ spacing: v })} />
  </>);
}

function ShapeTab({ t, set }) {
  return (<>
    <Range label="Arrondis" value={t.radius ?? 10} max={32} unit="px" onChange={(v) => set({ radius: v })} />
    <Range label="Épaisseur des bordures" value={t.border_w ?? 1} max={4} unit="px" onChange={(v) => set({ border_w: v })} />
    <Range label="Flou des panneaux (verre)" value={t.blur ?? 12} max={40} unit="px" onChange={(v) => set({ blur: v })} />
    <Range label="Ombres et halo" value={t.shadow ?? 40} onChange={(v) => set({ shadow: v })} />
    <div className="ts-demo"><div className="ts-demo-card">Aperçu d'une carte</div><button className="ts-btn">Bouton</button></div>
  </>);
}

function BgTab({ t, sub, set }) {
  const b = t.bg || {};
  return (<>
    <div className="ts-seg">{[["scene", "Scène"], ["gradient", "Dégradé"], ["image", "Image"], ["video", "Vidéo"]].map(([v, l]) => <button key={v} className={b.type === v ? "on" : ""} onClick={() => sub("bg", { type: v })} data-testid={`theme-bg-${v}`}>{l}</button>)}</div>
    {b.type === "scene" && <Field label="Scène animée d'un thème d'origine"><select value={t.base} onChange={(e) => set({ base: e.target.value })}>{THEMES.map((x) => <option key={x.key} value={x.key}>{x.kanji} {x.name}</option>)}</select></Field>}
    {b.type === "gradient" && <>
      <div className="ts-grads">{GRADIENTS.map((g) => <button key={g.join()} style={{ background: `linear-gradient(160deg,${g.join(",")})` }} onClick={() => sub("bg", { g })} />)}</div>
      {[0, 1, 2].map((i) => <Color key={i} label={`Teinte ${i + 1}`} value={(b.g || [])[i]} onChange={(v) => { const g = [...(b.g || ["#000", "#333", "#666"])]; g[i] = v; sub("bg", { g }); }} />)}
      <Range label="Angle" value={b.angle ?? 160} max={360} unit="°" onChange={(v) => sub("bg", { angle: v })} />
    </>}
    {(b.type === "image" || b.type === "video") && <>
      <Field label={b.type === "image" ? "Lien de l'image" : "Lien vidéo (MP4 ou YouTube)"}><input value={b.url || ""} onChange={(e) => sub("bg", { url: e.target.value })} placeholder="https://…" /></Field>
      <Upload accept={b.type === "image" ? "image/*" : "video/*"} onDone={(url) => sub("bg", { url })} label={b.type === "image" ? "Importer une image" : "Importer une vidéo"} />
      {b.type === "image" && <Range label="Flou de l'image" value={b.blur ?? 0} max={30} unit="px" onChange={(v) => sub("bg", { blur: v })} />}
    </>}
    {b.type !== "scene" && <Range label="Voile sombre" value={b.dim ?? 30} max={90} unit="%" onChange={(v) => sub("bg", { dim: v })} />}
  </>);
}

function FxTab({ t, set, sub }) {
  return (<>
    <Color label="Couleur des effets" value={t.fx_color} onChange={(v) => set({ fx_color: v })} />
    {FX.map(([k, l]) => <Range key={k} label={l} value={t.fx?.[k] || 0} onChange={(v) => sub("fx", { [k]: v })} />)}
  </>);
}

function SoundTab({ t, set }) {
  const [ambs, setAmbs] = useState([]);
  useEffect(() => { listAmbiences().then((a) => setAmbs(Array.isArray(a) ? a : a?.items || [])).catch(() => {}); }, []);
  return (<>
    <h4>Clavier</h4>
    <div className="ts-keys">{KEY_SOUNDS.map(([k, l]) => <button key={k} className={t.key_sound === k ? "on" : ""} onClick={() => { set({ key_sound: k }); keySound(k, 0.6); }} data-testid={`theme-key-${k}`}>{l}</button>)}
      <button className={t.key_sound === "file" ? "on" : ""} onClick={() => t.key_url && set({ key_sound: "file" })}>Ton fichier</button></div>
    <input className="ts-try" placeholder="Tape ici pour essayer…" />
    <Upload accept="audio/*" onDone={(u) => set({ key_url: u, key_sound: "file" })} label="Importer un son de touche" />
    <h4>Bruitages de l'interface</h4>
    <div className="ts-keys">{[{ key: "auto", label: "Selon la scène" }, ...SOUND_PACKS].map((p) => <button key={p.key} className={(t.sfx_pack || "auto") === p.key ? "on" : ""} onClick={() => { set({ sfx_pack: p.key }); try { playUiSound("select", p.key === "auto" ? undefined : p.key); } catch (_) {} }} title={p.hint}>{p.label}</button>)}</div>
    <Field label="Son de clic perso (remplace au clic)"><div className="ts-inline"><Upload accept="audio/*" onDone={(u) => set({ click_url: u })} label={t.click_url ? "Changer" : "Importer"} />{t.click_url && <button className="ts-btn ghost sm" onClick={() => set({ click_url: "" })}>Retirer</button>}</div></Field>
    <h4>Musique d'ambiance</h4>
    <select value={t.ambience_id || ""} onChange={(e) => set({ ambience_id: e.target.value })} data-testid="theme-ambience">
      <option value="">Garder celle choisie par le visiteur</option>
      {ambs.map((a) => <option key={a.id} value={a.id}>{a.title || a.name || a.id}</option>)}
    </select>
    <p className="ts-hint">Les ambiances se gèrent dans Réglages › Musique de la Station.</p>
  </>);
}

function InfoTab({ t, set }) {
  return (<>
    <Field label="Phrase d'accroche"><input value={t.tagline || ""} onChange={(e) => set({ tagline: e.target.value })} /></Field>
    <Field label="Thème de base (scène et bruitages auto)"><select value={t.base} onChange={(e) => set({ base: e.target.value })}>{THEMES.map((x) => <option key={x.key} value={x.key}>{x.kanji} {x.name}</option>)}</select></Field>
    <div className="ts-seg"><button className={t.public ? "on" : ""} onClick={() => set({ public: true })} data-testid="theme-set-public">Public</button><button className={!t.public ? "on" : ""} onClick={() => set({ public: false })}>Privé</button></div>
    <p className="ts-hint">Public : les visiteurs peuvent le choisir dans la Station. Privé : visible seulement par toi.</p>
    <div className="ts-seg"><button className={t.enabled !== false ? "on" : ""} onClick={() => set({ enabled: true })}>Activé</button><button className={t.enabled === false ? "on" : ""} onClick={() => set({ enabled: false })}>Désactivé</button></div>
  </>);
}
