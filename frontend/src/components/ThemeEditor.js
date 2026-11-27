import { useEffect, useRef, useState } from "react";
import { IoArrowBack, IoCloudUploadOutline, IoExpandOutline, IoContractOutline, IoChevronUp, IoChevronDown, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { OBJ_REPOS, OBJ_SURVOL, ETAGERES, HAB, MENU, FENETRES, ANIM, PAGES, resolveBlocs, toRaw, blocOf } from "@/lib/blocs";
import { ASTRES, DEFAULT_LAYERS } from "@/components/SceneCompose";
import { DECORS, FAMILLES } from "@/lib/decors";
import { SOURIS } from "@/components/MouseFx";
import { LUM_MODES, DECOR_MODES, decorList } from "@/lib/lumiere";
import { pressMenu } from "@/components/atelier/ContextMenu";
import { imgSrc } from "@/lib/atelier";
import { toast } from "sonner";
import { THEMES } from "@/lib/themes";
import { uploadJournalImage, listAmbiences } from "@/lib/api";
import { SOUND_PACKS, playUiSound } from "@/lib/sound";
import { AMBIENTS } from "@/lib/ambient";
import { setDraft, FONTS, FX, CURSORS, KEY_SOUNDS, PALETTES, GRADIENTS, keySound, fontHref } from "@/lib/themeStore";
import { WT_CURSORS } from "@/lib/worldThemes";
import { useHiddenLib, isHidden, hiddenCount, hideItem, showItem } from "@/lib/hiddenLib";

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

const TABS = [["blocs", "Blocs"], ["pages", "Pages"], ["menu", "Menu"], ["mouv", "Mouvement"], ["colors", "Couleurs"], ["type", "Typo"], ["shape", "Formes"], ["bg", "Fond"], ["fx", "Effets"], ["sound", "Sons"], ["info", "Réglages"]];
const COLORS = [["bg", "Fond"], ["bg2", "Surfaces"], ["brand", "Accent"], ["brand2", "Accent 2"], ["text", "Texte"], ["text2", "Texte doux"], ["border", "Bordures"]];

export default function ThemeEditor({ initial, onCancel, onSaved }) {
  const [t, setT] = useState(initial);
  const [tab, setTab] = useState("blocs");
  useEffect(() => { setDraft(t); }, [t]);
  const set = (patch) => setT((o) => ({ ...o, ...patch }));
  const sub = (k, patch) => setT((o) => ({ ...o, [k]: { ...(o[k] || {}), ...patch } }));
  const [full, setFull] = useState(false);
  const [peek, setPeek] = useState(false);
  if (peek) return <button className="ts-back" onClick={() => setPeek(false)} data-testid="theme-peek-back"><IoArrowBack size={16} /> Retour à Nexus OS</button>;
  return (
    <aside className={"ts-panel" + (full ? " full" : "")} data-testid="theme-editor">
      <div className="ts-col">
      <header className="ts-head">
        <button className="ts-x" onClick={onCancel} title="Annuler" data-testid="theme-editor-cancel"><IoArrowBack size={18} /></button>
        <div className="ts-title">
          <input className="ts-kanji" value={t.kanji || ""} onChange={(e) => set({ kanji: e.target.value.slice(0, 3) })} />
          <input className="ts-name" value={t.name || ""} onChange={(e) => set({ name: e.target.value })} data-testid="theme-editor-name" />
        </div>
        <button className="ts-x" onClick={() => setFull(!full)} title={full ? "Réduire" : "Pleine page"} data-testid="theme-editor-full">{full ? <IoContractOutline size={17} /> : <IoExpandOutline size={17} />}</button>
        <button className="ts-btn" onClick={() => onSaved(t)} data-testid="theme-editor-save">Enregistrer</button>
      </header>
      <p className="ts-live mono">● APERÇU EN DIRECT SUR TOUTE L'APP</p>
      <nav className="ts-tabs">{TABS.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} data-testid={`theme-tab-${k}`}>{l}</button>)}</nav>
      <div className="ts-scroll">
        {tab === "blocs" && <BlocsTab t={t} set={set} />}
        {tab === "pages" && <OptsTab t={t} set={set} k="pages" opts={PAGES} hint="Les autres pages de la Station : Journal, Planning, Soutien, À propos, univers. Les pages des œuvres gardent leur propre monde." />}
        {tab === "menu" && <>
          <OptsTab t={t} set={set} k="menu" opts={MENU} hint="Le cadre de la Station, sur toutes les pages : la barre (place, matière, icônes, boutons) et le tiroir qui s'ouvre avec le bouton Menu (matière, apparition, voile)." />
          <button className="ts-btn ghost" onClick={() => window.dispatchEvent(new CustomEvent("nx-open-menu"))} data-testid="theme-menu-try">Ouvrir le menu pour voir</button>
          <h4 className="ts-sub">Fenêtres</h4>
          <OptsTab t={t} set={set} k="fenetres" opts={FENETRES} hint="Les fenêtres qui s'ouvrent par-dessus la Station : profil, connexion, partage, lecture, planning." />
        </>}
        {tab === "mouv" && <OptsTab t={t} set={set} k="anim" opts={ANIM} hint="Comment la page bouge : le défilement, la profondeur, et l'entrée dans une œuvre. Les entrées de chaque bloc se règlent dans l'onglet Blocs." />}
        {tab === "colors" && <ColorsTab t={t} sub={sub} />}
        {tab === "type" && <TypeTab t={t} set={set} />}
        {tab === "shape" && <ShapeTab t={t} set={set} />}
        {tab === "bg" && <BgTab t={t} sub={sub} set={set} />}
        {tab === "fx" && <FxTab t={t} set={set} sub={sub} />}
        {tab === "sound" && <SoundTab t={t} set={set} />}
        {tab === "info" && <InfoTab t={t} set={set} />}
      </div>
      </div>
      {full && <ThemePreview t={t} onOpen={() => setPeek(true)} />}
    </aside>
  );
}

// Miniature d'exemple : la Station habillée du thème, cliquable pour voir l'app en vrai
function ThemePreview({ t, onOpen }) {
  const b = t.bg || {};
  const bg = b.type === "gradient" ? `linear-gradient(${b.angle ?? 160}deg,${(b.g || []).join(",")})` : b.type === "image" && b.url ? `url(${imgSrc(b.url)}) center/cover` : "radial-gradient(120% 80% at 70% 0%,color-mix(in srgb,var(--brand) 30%,var(--bg-primary)),var(--bg-primary))";
  return (
    <div className="ts-prev-wrap">
      <p className="mono ts-eye">// MINIATURE D'EXEMPLE</p>
      <button className="ts-prev" onClick={onOpen} style={{ background: bg }} data-testid="theme-preview-open">
        {b.type === "video" && b.url && !/youtu/.test(b.url) && <video src={imgSrc(b.url)} autoPlay muted loop playsInline />}
        <span className="ts-prev-dim" style={{ opacity: b.type && b.type !== "scene" ? (b.dim ?? 30) / 100 : 0 }} />
        <span className="ts-prev-top"><b>{t.kanji} STATION NEXUS</b><i>Accueil</i><i>Univers</i><i>Salon</i></span>
        <span className="ts-prev-hero"><small>// {t.tagline || "NOUVELLE SAISON"}</small><strong>{t.name || "Ton thème"}</strong><em>Une histoire commence ici, habillée par ton thème.</em><span className="ts-prev-btns"><u>Commencer</u><s>Découvrir</s></span></span>
        <span className="ts-prev-cards">{[0, 1, 2].map((i) => <span key={i}><span /><b>Œuvre {i + 1}</b><small>Chapitre {i + 3}</small></span>)}</span>
        <span className="ts-prev-cta">Ouvrir l'aperçu en grand</span>
      </button>
      <p className="ts-hint">Clique sur la miniature pour voir toute l'app avec ce thème, puis reviens ici.</p>
    </div>
  );
}

// Masquer / réafficher un élément par défaut d'une bibliothèque (police, effet, palette, son).
function HideWrap({ kind, id, rev, block, children }) {
  const h = isHidden(kind, id);
  if (h && !rev) return null;
  return <div className={"ts-hw" + (block ? " blk" : "") + (h ? " hid" : "")}>{children}<button type="button" className="ts-hide" title={h ? "Réafficher" : "Masquer de la liste"} onClick={(e) => { e.stopPropagation(); h ? showItem(kind, id) : hideItem(kind, id); }}>{h ? "↺" : "×"}</button></div>;
}
function RevBtn({ kind, rev, setRev }) {
  const n = hiddenCount(kind);
  if (!n && !rev) return null;
  return <button type="button" className="ts-revhid" onClick={() => setRev((v) => !v)}>{rev ? "Cacher les masqués" : `Voir les ${n} masqué${n > 1 ? "s" : ""}`}</button>;
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
  useHiddenLib(); const [rev, setRev] = useState(false);
  return (<>
    <h4>Palettes</h4>
    <div className="ts-pals">{PALETTES.map(([n, c]) => <HideWrap key={n} kind="palette" id={n} rev={rev}><button title={n} onClick={() => sub("colors", { bg: c[0], bg2: c[1], brand: c[2], brand2: c[3], text: c[4], text2: c[5] })}>{c.slice(0, 4).map((x) => <i key={x} style={{ background: x }} />)}<span>{n}</span></button></HideWrap>)}</div>
    <RevBtn kind="palette" rev={rev} setRev={setRev} />
    <h4>Sur mesure</h4>
    {COLORS.map(([k, l]) => <Color key={k} label={l} value={t.colors?.[k]} onChange={(v) => sub("colors", { [k]: v })} />)}
  </>);
}

function TypeTab({ t, set }) {
  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = fontHref(FONTS); document.head.appendChild(l); return () => l.remove(); }, []);
  useHiddenLib(); const [rev, setRev] = useState(false);
  const pick = (k) => <div className="ts-fonts">{FONTS.map((f) => <HideWrap key={f} kind="font" id={f} rev={rev}><button className={t[k] === f ? "on" : ""} style={{ fontFamily: `"${f}"` }} onClick={() => set({ [k]: f })}>{f}</button></HideWrap>)}</div>;
  return (<>
    <h4>Titres</h4>{pick("font_display")}
    <h4>Texte</h4>{pick("font_body")}
    <RevBtn kind="font" rev={rev} setRev={setRev} />
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
    <Field label="Effet de souris"><div className="ts-seg ts-cursors">{WT_CURSORS.map(([k, l, dsc]) => <button key={k} title={dsc} className={(t.cursor_fx || "none") === k ? "on" : ""} onClick={() => set({ cursor_fx: k })} data-testid={`theme-cfx-${k}`}>{l}</button>)}</div></Field>
    <Field label="Curseur"><div className="ts-seg ts-cursors">{CURSORS.map(([k, l]) => <button key={k} className={(t.cursor || "default") === k ? "on" : ""} onClick={() => set({ cursor: k })} data-testid={`theme-cursor-${k}`}>{l}</button>)}</div></Field>
    <div className="ts-demo"><div className="ts-demo-card">Aperçu d'une carte</div><button className="ts-btn">Bouton</button></div>
  </>);
}

// Nexus OS : l'accueil en blocs. Ordre, blocs affichés, présentation et habillage de chacun, comportement des objets.
const Seg2 = ({ o, value, onPick, tid }) => <div className="ts-seg ts-wrap">{o.map(([v, l]) => <button key={v} className={(value || "") === v ? "on" : ""} onClick={() => onPick(v)} data-testid={tid ? `${tid}-${v || "def"}` : undefined}>{l}</button>)}</div>;
function BlocsTab({ t, set }) {
  const r = resolveBlocs(t.blocs || {});
  const [open, setOpen] = useState(null);
  const save = (p) => set({ blocs: toRaw({ ...r, ...p }) });
  const move = (k, d) => { const o = [...r.order]; const i = o.indexOf(k); const j = d === "first" ? 0 : d === "last" ? o.length - 1 : i + d; if (j < 0 || j >= o.length || j === i) return; o.splice(i, 1); o.splice(j, 0, k); save({ order: o }); };
  const toggle = (k) => { const off = new Set(r.off); off.has(k) ? off.delete(k) : off.add(k); save({ off }); };
  const pick = (k, v) => save({ v: { ...r.v, [k]: v } });
  const hab = (k, h, v) => save({ hab: { ...r.hab, [k]: { ...r.hab[k], [h]: v } } });
  const habAll = (h, v) => save({ hab: Object.fromEntries(r.order.map((k) => [k, { ...r.hab[k], [h]: v }])) });
  const menu = (k) => () => { const b = blocOf(k); const hidden = r.off.has(k); return { title: b.label, entries: [
    { label: "Monter", onClick: () => move(k, -1) }, { label: "Descendre", onClick: () => move(k, 1) },
    { label: "Mettre en premier", onClick: () => move(k, "first") }, { label: "Mettre en dernier", onClick: () => move(k, "last") }, "-",
    { label: hidden ? "Afficher ce bloc" : "Masquer ce bloc", onClick: () => toggle(k) },
    { label: open === k ? "Fermer l'habillage" : "Habillage du bloc…", onClick: () => setOpen(open === k ? null : k) },
    ...(k === "entete" ? [{ label: "Titre plus petit", onClick: () => set({ titre_taille: Math.max(40, (t.titre_taille ?? 100) - 15) }) }, { label: "Titre plus grand", onClick: () => set({ titre_taille: Math.min(160, (t.titre_taille ?? 100) + 15) }) }] : []),
    ...(b.v.length > 1 ? ["-", ...b.v.map(([v, l]) => ({ label: (r.v[k] === v ? "● " : "") + l, onClick: () => pick(k, v) }))] : []),
  ] }; };
  return (<>
    <p className="ts-hint">L'accueil de la Station, bloc par bloc. Change l'ordre, masque ce qui ne sert pas, choisis la présentation de chaque bloc et son habillage. Clic droit sur un bloc pour plus d'actions.</p>
    <div className="ts-bls">{r.order.map((k, i) => { const b = blocOf(k); const hidden = r.off.has(k); const cur = b.v.find(([v]) => v === r.v[k]) || b.v[0]; const h = r.hab[k] || {}; const nh = Object.values(h).filter(Boolean).length; return (
      <div key={k} className={"ts-bl" + (hidden ? " off" : "")} {...pressMenu(menu(k))} data-testid={`theme-bloc-${k}`}>
        <div className="ts-bl-h">
          <span className="ts-bl-k">{b.kj}</span><b>{b.label}</b>
          <button onClick={() => move(k, -1)} disabled={i === 0} title="Monter"><IoChevronUp size={15} /></button>
          <button onClick={() => move(k, 1)} disabled={i === r.order.length - 1} title="Descendre"><IoChevronDown size={15} /></button>
          <button onClick={() => toggle(k)} title={hidden ? "Afficher" : "Masquer"} data-testid={`theme-bloc-toggle-${k}`}>{hidden ? <IoEyeOffOutline size={15} /> : <IoEyeOutline size={15} />}</button>
        </div>
        {!hidden && <>
          {b.v.length > 1 && <><div className="ts-seg ts-bl-v ts-wrap">{b.v.map(([v, l]) => <button key={v} className={r.v[k] === v ? "on" : ""} onClick={() => pick(k, v)} data-testid={`theme-bloc-${k}-${v}`}>{l}</button>)}</div>
            <small className="ts-bl-d">{cur[2]}</small></>}
          {k === "entete" && <Range label="Taille du titre" min={40} max={160} unit="%" value={t.titre_taille ?? 100} onChange={(v) => set({ titre_taille: v })} />}
          <button className="ts-bl-more" onClick={() => setOpen(open === k ? null : k)} data-testid={`theme-bloc-hab-${k}`}>{open === k ? "Fermer l'habillage" : `Habillage${nh ? ` · ${nh} réglage${nh > 1 ? "s" : ""}` : ""}`}</button>
          {open === k && <div className="ts-hab">{Object.entries(HAB).map(([hk, { label, o }]) => (
            <div key={hk} className="ts-hab-r"><span>{label}</span><Seg2 o={o} value={h[hk]} onPick={(v) => hab(k, hk, v)} tid={`theme-hab-${k}-${hk}`} /></div>))}
          </div>}
        </>}
      </div>); })}
    </div>
    <h4 className="ts-sub">Pour tous les blocs d'un coup</h4>
    <div className="ts-hab">{["fond", "titre", "entree"].map((hk) => <div key={hk} className="ts-hab-r"><span>{HAB[hk].label}</span><Seg2 o={HAB[hk].o} value={r.order.every((k) => (r.hab[k]?.[hk] || "") === (r.hab[r.order[0]]?.[hk] || "")) ? r.hab[r.order[0]]?.[hk] : "~"} onPick={(v) => habAll(hk, v)} /></div>)}</div>
    <h4 className="ts-sub">Objets</h4>
    <p className="ts-hint">Les livres, cassettes et disques : rayons, accès rapide, vitrines, une en affiche.</p>
    <Field label="Au repos"><Seg2 o={OBJ_REPOS} value={r.repos} onPick={(v) => save({ repos: v })} tid="theme-repos" /></Field>
    <Field label="Au survol"><Seg2 o={OBJ_SURVOL} value={r.survol} onPick={(v) => save({ survol: v })} tid="theme-survol" /></Field>
    <Field label="Étagères des rayons"><Seg2 o={ETAGERES} value={r.etagere} onPick={(v) => save({ etagere: v })} tid="theme-etagere" /></Field>
    <button className="ts-btn ghost ts-reset" onClick={() => set({ blocs: undefined })}>Revenir à l'accueil d'origine</button>
  </>);
}
// Menu et Mouvement : une liste de réglages à choix
function OptsTab({ t, set, k, opts, hint }) {
  const cur = t[k] || {};
  return (<>
    <p className="ts-hint">{hint}</p>
    {Object.entries(opts).map(([ok, { label, o }]) => <Field key={ok} label={label}><Seg2 o={o} value={cur[ok]} onPick={(v) => set({ [k]: { ...cur, [ok]: v } })} tid={`theme-${k}-${ok}`} /></Field>)}
  </>);
}

// Scène composée : chaque calque se règle séparément
function ComposeEditor({ L, put }) {
  const a = { ...DEFAULT_LAYERS.astre, ...(L.astre || {}) };
  const sky = L.ciel || DEFAULT_LAYERS.ciel;
  const [fam, setFam] = useState(() => DECORS.find((d) => d.id === L.decor)?.fam || "ete");
  const coll = decorList(L);
  const toggleCol = (id) => { const cur = (L.decors || []).filter((x) => x !== L.decor); put({ decors: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] }); };
  return (<>
    <p className="ts-hint">Un décor peint à la main, en calques qui bougent en profondeur, ou un simple ciel en dégradé. Par-dessus : un astre et l'atmosphère. Les particules se règlent dans l'onglet Effets.</p>
    <h4 className="ts-sub">Décor</h4>
    <Seg2 o={[...FAMILLES, ["", "Ciel seul"]]} value={L.decor ? fam : ""} onPick={(v) => { if (!v) put({ decor: "" }); else { setFam(v); if (!L.decor || DECORS.find((d) => d.id === L.decor)?.fam !== v) put({ decor: DECORS.find((d) => d.fam === v)?.id || "" }); } }} tid="theme-decor-fam" />
    {L.decor && <div className="ts-decors">{DECORS.filter((d) => d.fam === fam).map((d) => { const inCol = coll.includes(d.id); return (
      <div key={d.id} className={"ts-decor" + (L.decor === d.id ? " on" : "") + (inCol ? " col" : "")}>
        <button onClick={() => put({ decor: d.id })} title={d.label} data-testid={`theme-decor-${d.id}`} {...pressMenu(() => ({ title: d.label, entries: [{ label: "Décor principal", onClick: () => put({ decor: d.id }) }, { label: inCol ? "Retirer de la collection" : "Ajouter à la collection", onClick: () => toggleCol(d.id) }] }))}>
          <img src={d.thumb} alt="" /><span>{d.label.split(" · ")[1] || d.label}</span>
        </button>
        {L.decor !== d.id && <button className="ts-decor-add" onClick={() => toggleCol(d.id)} title={inCol ? "Retirer de la collection" : "Ajouter à la collection du thème"} aria-label={inCol ? "Retirer de la collection" : "Ajouter à la collection"} data-testid={`theme-decor-col-${d.id}`}>{inCol ? "✓" : "+"}</button>}
      </div>); })}</div>}
    {L.decor && <>
      <h4 className="ts-sub">Collection du thème {coll.length > 1 ? `· ${coll.length} décors` : ""}</h4>
      <p className="ts-hint">Un thème peut porter plusieurs décors : touche « + » sur une miniature (ou clic droit) pour l'ajouter. Le thème garde ses couleurs, sa typo et ses blocs ; seul le décor change.</p>
      {coll.length > 1 && <div className="ts-coll">{coll.map((id) => { const d = DECORS.find((x) => x.id === id); return d && (
        <span key={id} className={id === L.decor ? "on" : ""}><img src={d.thumb} alt="" title={d.label} onClick={() => put({ decor: id })} />{id !== L.decor && <button onClick={() => toggleCol(id)} aria-label={`Retirer ${d.label}`}>×</button>}</span>); })}</div>}
      {coll.length > 1 && <>
        <Seg2 o={DECOR_MODES} value={L.decorMode || ""} onPick={(v) => put({ decorMode: v })} tid="theme-decor-mode" />
        {L.decorMode === "minutes" && <Range label="Changer toutes les" min={1} max={60} unit=" min" value={L.decorMin ?? 10} onChange={(v) => put({ decorMin: v })} />}
        <p className="ts-hint">{({ "": "Fixe : le décor principal (encadré). Le public peut quand même en choisir un autre si tu le permets.", visite: "Chaque visiteur tombe sur un décor de la collection à chaque visite.", minutes: "Les décors se succèdent en fondu.", heure: "Un décor par moment de la journée, dans l'ordre de la collection : matin (6 h), journée (11 h), crépuscule (18 h), nuit (21 h). Le cadran de l'accueil suit les mêmes moments." })[L.decorMode || ""]}</p>
        <label className="ts-check"><input type="checkbox" checked={L.decorPublic !== false} onChange={(e) => put({ decorPublic: e.target.checked })} data-testid="theme-decor-public" /> Le public peut choisir le décor (pastille sur l'accueil)</label>
      </>}
    </>}
    {L.decor ? <>
      <Range label="Teinte" min={0} max={360} unit="°" value={L.teinte ?? 0} onChange={(v) => put({ teinte: v })} />
      <Range label="Lumière" min={30} max={150} unit="%" value={L.lum ?? 100} onChange={(v) => put({ lum: v })} />
      <Range label="Saturation" min={0} max={180} unit="%" value={L.sat ?? 100} onChange={(v) => put({ sat: v })} />
    </> : <>
      <h4 className="ts-sub">Ciel</h4>
      {[0, 1, 2].map((i) => <Color key={i} label={["Haut", "Milieu", "Horizon"][i]} value={sky[i]} onChange={(v) => { const c = [...sky]; c[i] = v; put({ ciel: c }); }} />)}
    </>}
    <h4 className="ts-sub">Astre</h4>
    <Seg2 o={ASTRES} value={a.f} onPick={(v) => put({ astre: { ...a, f: v } })} tid="theme-astre" />
    {a.f && <><Color label="Couleur" value={a.c} onChange={(v) => put({ astre: { ...a, c: v } })} />
      <Range label="Position" value={a.x} onChange={(v) => put({ astre: { ...a, x: v } })} unit="%" />
      <Range label="Hauteur" value={a.y} onChange={(v) => put({ astre: { ...a, y: v } })} unit="%" />
      <Range label="Taille" min={30} max={420} value={a.t} onChange={(v) => put({ astre: { ...a, t: v } })} unit="px" />
      <Range label="Halo" value={a.h} onChange={(v) => put({ astre: { ...a, h: v } })} unit="%" /></>}
    <h4 className="ts-sub">Atmosphère</h4>
    {[["nuages", "Nuages qui passent"], ["brume", "Brume"], ["rayons", "Rayons de lumière"], ["grain", "Grain"], ["vignette", "Vignette"]].map(([k, l]) => <Range key={k} label={l} value={L[k] ?? 0} onChange={(v) => put({ [k]: v })} unit="%" />)}
  </>);
}

function BgTab({ t, sub, set }) {
  const b = t.bg || {};
  return (<>
    <div className="ts-seg ts-wrap">{[["scene", "Scène"], ["compose", "Décor"], ["gradient", "Dégradé"], ["image", "Image"], ["video", "Vidéo"]].map(([v, l]) => <button key={v} className={b.type === v ? "on" : ""} onClick={() => sub("bg", v === "compose" && !b.layers ? { type: v, layers: DEFAULT_LAYERS } : { type: v })} data-testid={`theme-bg-${v}`}>{l}</button>)}</div>
    {b.type === "scene" && <>
      <Field label="Scène animée d'un thème d'origine"><select value={b.scene || t.base} onChange={(e) => sub("bg", { scene: e.target.value })} data-testid="theme-scene">{THEMES.map((x) => <option key={x.key} value={x.key}>{x.kanji} {x.name}</option>)}</select></Field>
      <h4 className="ts-sub">Régler la scène</h4>
      {[["teinte", "Teinte", 0, 360, "°", 0], ["sat", "Saturation", 0, 200, "%", 100], ["lum", "Lumière", 30, 160, "%", 100], ["op", "Présence", 0, 100, "%", 100], ["vit", "Vitesse", 20, 300, "%", 100]].map(([k, l, mn, mx, u, d]) =>
        <Range key={k} label={l} min={mn} max={mx} unit={u} value={b.tune?.[k] ?? d} onChange={(v) => sub("bg", { tune: { ...(b.tune || {}), [k]: v } })} />)}
      {b.tune && <button className="ts-btn ghost ts-reset" onClick={() => sub("bg", { tune: undefined })}>Remettre la scène d'origine</button>}
    </>}
    {b.type === "compose" && <ComposeEditor L={{ ...DEFAULT_LAYERS, ...(b.layers || {}) }} put={(p) => sub("bg", { layers: { ...DEFAULT_LAYERS, ...(b.layers || {}), ...p } })} />}
    {b.type === "compose" && <>
      <h4 className="ts-sub">Lumière</h4>
      <p className="ts-hint">Le même décor au jour, à l'aube, à l'heure dorée ou la nuit. Pour que la Station change avec le moment de la journée, mets plusieurs décors dans la collection, en mode « Suit l'heure ».</p>
      <Seg2 o={LUM_MODES} value={t.lumiere === "heure" ? "" : t.lumiere || ""} onPick={(v) => set({ lumiere: v })} tid="theme-lumiere" />
    </>}
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
    {b.type !== "scene" && b.type !== "compose" && <Range label="Voile sombre" value={b.dim ?? 30} max={90} unit="%" onChange={(v) => sub("bg", { dim: v })} />}
    <h4 className="ts-sub">Réaction à la souris</h4>
    <p className="ts-hint">Sur n'importe quel fond. « Profondeur » fait suivre la souris aux calques d'un décor.</p>
    <Seg2 o={SOURIS} value={t.souris} onPick={(v) => set({ souris: v })} tid="theme-souris" />
  </>);
}

function FxTab({ t, set, sub }) {
  useHiddenLib(); const [rev, setRev] = useState(false);
  return (<>
    <Color label="Couleur des effets" value={t.fx_color} onChange={(v) => set({ fx_color: v })} />
    {FX.map(([k, l]) => <HideWrap key={k} kind="fx" id={k} rev={rev} block><Range label={l} value={t.fx?.[k] || 0} onChange={(v) => sub("fx", { [k]: v })} /></HideWrap>)}
    <RevBtn kind="fx" rev={rev} setRev={setRev} />
  </>);
}

function SoundTab({ t, set }) {
  const [ambs, setAmbs] = useState([]);
  useHiddenLib(); const [rev, setRev] = useState(false);
  useEffect(() => { listAmbiences().then((a) => setAmbs(Array.isArray(a) ? a : a?.items || [])).catch(() => {}); }, []);
  return (<>
    <h4>Clavier</h4>
    <div className="ts-keys">{KEY_SOUNDS.map(([k, l]) => <HideWrap key={k} kind="key" id={k} rev={rev}><button className={t.key_sound === k ? "on" : ""} onClick={() => { set({ key_sound: k }); keySound(k, 0.6); }} data-testid={`theme-key-${k}`}>{l}</button></HideWrap>)}
      <button className={t.key_sound === "file" ? "on" : ""} onClick={() => t.key_url && set({ key_sound: "file" })}>Ton fichier</button></div>
    <RevBtn kind="key" rev={rev} setRev={setRev} />
    <input className="ts-try" placeholder="Tape ici pour essayer…" />
    <Upload accept="audio/*" onDone={(u) => set({ key_url: u, key_sound: "file" })} label="Importer un son de touche" />
    <h4>Bruitages de l'interface</h4>
    <div className="ts-keys">{[{ key: "auto", label: "Selon la scène" }, ...SOUND_PACKS].map((p) => <button key={p.key} className={(t.sfx_pack || "auto") === p.key ? "on" : ""} onClick={() => { set({ sfx_pack: p.key }); try { playUiSound("select", p.key === "auto" ? undefined : p.key); } catch (_) {} }} title={p.hint}>{p.label}</button>)}</div>
    <Field label="Son de clic perso (remplace au clic)"><div className="ts-inline"><Upload accept="audio/*" onDone={(u) => set({ click_url: u })} label={t.click_url ? "Changer" : "Importer"} />{t.click_url && <button className="ts-btn ghost sm" onClick={() => set({ click_url: "" })}>Retirer</button>}</div></Field>
    <h4>Sons d'ambiance superposés</h4>
    <p className="ts-hint">Mélangés sous la musique. Ils se coupent à part dans le menu ♪.</p>
    <AmbientLayers t={t} set={set} />
    <h4>Musique d'ambiance</h4>
    <select value={t.ambience_id || ""} onChange={(e) => set({ ambience_id: e.target.value })} data-testid="theme-ambience">
      <option value="">Garder celle choisie par le visiteur</option>
      {ambs.map((a) => <option key={a.id} value={a.id}>{a.title || a.name || a.id}</option>)}
    </select>
    <p className="ts-hint">Les ambiances se gèrent dans Réglages › Musique de la Station.</p>
  </>);
}

function AmbientLayers({ t, set }) {
  const L = t.ambient || [];
  const same = (a, b) => a.id === b.id && (a.url || "") === (b.url || "");
  const has = (id) => L.find((l) => l.id === id);
  const put = (l) => set({ ambient: L.some((x) => same(x, l)) ? L.map((x) => (same(x, l) ? l : x)) : [...L, l] });
  const drop = (l) => set({ ambient: L.filter((x) => !same(x, l)) });
  return (<>
    <div className="ts-keys">{AMBIENTS.map(([id, label]) => <button key={id} className={has(id) ? "on" : ""} onClick={() => (has(id) ? drop(has(id)) : put({ id, vol: 0.7 }))} data-testid={`theme-amb-${id}`}>{label}</button>)}</div>
    {L.map((l) => (
      <div key={l.id + (l.url || "")} className="ts-amb-row">
        <span>{l.name || AMBIENTS.find((a) => a[0] === l.id)?.[1]}</span>
        <input type="range" min="0" max="1" step="0.01" value={l.vol ?? 0.7} onChange={(e) => put({ ...l, vol: +e.target.value })} />
        <button onClick={() => drop(l)} title="Retirer">×</button>
      </div>
    ))}
    <Upload accept="audio/*" onDone={(url) => put({ id: "file", url, name: "Mon son", vol: 0.7 })} label="Ajouter ton propre son d'ambiance" />
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
