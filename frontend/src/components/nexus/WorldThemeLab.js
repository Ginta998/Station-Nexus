import { useEffect, useState } from "react";
import { IoArrowBack, IoAdd, IoCopyOutline, IoPencil, IoTrashOutline, IoCheckmark, IoExpandOutline, IoContractOutline, IoEyeOutline, IoRefresh } from "react-icons/io5";
import { toast } from "sonner";
import { WORLD_STYLES } from "@/components/nexus/world";
import CursorFx from "@/components/CursorFx";
import { WT_BLANK, WT_FONTS, WT_CURSORS, WT_BASE, WT_PALETTES, WT_PRESETS, newWorldKey, setWorldDraft, useWorldThemes, saveWorldTheme, deleteWorldTheme, isWorldKey } from "@/lib/worldThemes";
import "@/components/nexus/wtlab.css";

/*
  Atelier des thèmes de monde, dans l'atelier de l'œuvre (section « Thèmes »).
  Même logique que l'atelier des thèmes de la station : une bibliothèque (mes thèmes, modèles, thèmes d'origine),
  puis un éditeur en onglets avec un grand aperçu vivant. « Voir dans le monde » montre le vrai monde habillé.
*/
const PT_NAMES = { cinema: ["Poussière de pellicule", "Fines rayures qui passent"], vhs: ["Parasites", "Neige et bande qui roule"], arcade: ["Étoiles pixel", "Points nets qui scintillent"], yorha: ["Poussière d'archive", "Particules lentes"], eve: ["Étoiles", "Points froids qui dérivent"], hero: ["Étincelles", "Éclats rapides"], cathedrale: ["Braises", "Points rouges qui montent"], couronne: ["Cendres d'or", "Or qui tombe doucement"], trait: ["Taches d'encre", "Points noirs"], sengoku: ["Cendres", "Flocons pâles"], survivance: ["Spores", "Poussière en suspension"], cristal: ["Éclats de givre", "Scintillements froids"] };
const IN_NAMES = { cinema: "Écran large", vhs: "Bande qui défile", arcade: "Insert coin", yorha: "Connexion", eve: "Anneau", hero: "Balayage", cathedrale: "Sceau de cire", couronne: "Éclat doré", trait: "Encre", sengoku: "Pinceau et sceau", survivance: "La lumière revient", cristal: "Éclats de verre" };
const TABS = [["colors", "Couleurs"], ["type", "Typo"], ["layout", "Disposition"], ["matter", "Matière"], ["fx", "Effets"], ["mouse", "Souris"]];
const B = (t) => WT_BASE[t.base] || WT_BASE.cinema;

// L'aperçu : une petite fenêtre du monde, avec tout ce que le thème change
export function WorldMini({ t, title = "Titre", sub = "", bg, cover, big, onHover }) {
  const b = B(t);
  const st = {
    "--p": t.paper || b.paper, "--k": t.ink || b.ink, "--h": t.hl || b.hl,
    "--ft": `"${t.font_title || b.ft}",sans-serif`, "--fu": `"${t.font_ui || b.fu}",sans-serif`,
    "--r": t.radius === "auto" || t.radius == null ? "2px" : `${t.radius}px`,
  };
  const up = t.title_case === "upper" ? "upper" : t.title_case === "none" ? "low" : "";
  return (
    <div className={"wtm" + (big ? " big" : "") + (t.mirror ? " mir" : "") + (up ? " " + up : "")} style={st} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)} data-testid={big ? "wt-preview" : undefined}>
      {bg && <span className="wtm-bg" style={{ backgroundImage: `url(${bg})`, opacity: 1 - (t.bg_dim ?? 0.45), filter: t.bg_blur ? `blur(${Math.round(t.bg_blur / (big ? 2 : 4))}px)` : undefined }} />}
      <span className="wtm-in">
        <span className="wtm-txt">
          <small>{sub || WORLD_STYLES[t.base]}</small>
          <b className="wtm-t">{title}</b>
          <span className="wtm-menu">{["Reprendre", "Chapitres", "Moodboard", "Making of"].map((x, i) => <i key={x} className={i === 0 ? "on" : ""}>{x}</i>)}</span>
        </span>
        {t.win !== false && <span className="wtm-win"><span className="wtm-wimg" style={cover ? { backgroundImage: `url(${cover})` } : undefined} /><em>Reprendre là où tu t'étais arrêté</em></span>}
      </span>
      {t.grain > 0 && <span className="wtm-grain" style={{ opacity: t.grain * 0.55 }} />}
      {t.scan > 0 && <span className="wtm-scan" style={{ opacity: t.scan }} />}
      {t.vignette > 0 && <span className="wtm-vig" style={{ opacity: t.vignette }} />}
    </div>
  );
}

// Briques de l'éditeur (hors du composant : le curseur d'un réglage ne lâche pas pendant qu'on le glisse)
const Chip = ({ on, onClick, children, testid, title: tt }) => <button type="button" className={"wtl-chip" + (on ? " on" : "")} onClick={onClick} data-testid={testid} title={tt}>{children}</button>;
const Slide = ({ t, patch, label, k, max = 1, step = 0.05, unit = "%", auto }) => {
  const v = t[k]; const shown = v == null ? "auto" : unit === "%" ? `${Math.round(v * 100)} %` : `${v} ${unit}`;
  return (
    <label className="wtl-sl"><span>{label}<em>{shown}</em></span>
      <input type="range" min={0} max={max} step={step} value={v ?? 0} onChange={(e) => patch({ [k]: Number(e.target.value) })} />
      {auto && v != null && <button type="button" className="wtl-auto" onClick={() => patch({ [k]: null })}>Revenir à auto</button>}
    </label>
  );
};
const ColorRow = ({ t, patch, label, k, def }) => (
  <div className="wtl-color"><input type="color" value={t[k] || def} onChange={(e) => patch({ [k]: e.target.value })} /><span>{label}</span><code>{t[k] || "auto"}</code>{t[k] && <button type="button" className="wtl-auto" onClick={() => patch({ [k]: "" })}>auto</button>}</div>
);

export default function WorldThemeLab({ form, set, creationId, bg, cover, onPeek, full, onFull }) {
  const mine = useWorldThemes();
  const [t, setT] = useState(null);         // thème en cours d'édition (null : bibliothèque)
  const [tab, setTab] = useState("colors");
  const [typeFor, setTypeFor] = useState("font_title");
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [replay, setReplay] = useState(0);
  const [tryCur, setTryCur] = useState(false);
  const patch = (p) => setT((x) => ({ ...x, ...p }));
  // le vrai monde suit le brouillon (visible avec « Voir dans le monde »)
  useEffect(() => { setWorldDraft(t && creationId ? { ...t, forId: creationId, replay } : null); }, [t, replay, creationId]);
  useEffect(() => () => setWorldDraft(null), []);
  const used = form.world_style;
  const title = form.title || "Titre de l'œuvre";

  const edit = (x) => { setT({ ...WT_BLANK, ...x }); setTab("colors"); };
  const fromBase = (k) => edit({ base: k, name: `Mon ${WORLD_STYLES[k]}` });
  const fromPreset = (p) => edit({ ...p, key: undefined, about: undefined });
  const save = async (use) => {
    if (!t.name?.trim()) { toast.error("Donne un nom au thème"); return; }
    setBusy(true);
    try {
      const key = t.key && isWorldKey(t.key) ? t.key : newWorldKey();
      await saveWorldTheme({ ...t, key, name: t.name.trim() });
      setT((x) => ({ ...x, key }));
      if (use) { set("world_style", key); toast.success(`« ${t.name.trim()} » habille l'œuvre : enregistre l'œuvre pour le garder`); }
      else toast.success("Thème enregistré");
    } catch (_) { toast.error("Enregistrement impossible (reconnecte-toi en admin)"); }
    setBusy(false);
  };
  const remove = async (k) => { try { await deleteWorldTheme(k); if (used === k) set("world_style", ""); toast.success("Thème supprimé"); } catch (_) { toast.error("Suppression impossible"); } setDel(null); };

  // ---------- bibliothèque ----------
  if (!t) return (
    <div className="wtl" data-testid="wt-lab">
      <p className="wtl-intro">Habille le monde de l'œuvre à ta façon : pars d'un modèle, d'un thème d'origine, ou d'un de tes thèmes. Tout se voit en direct.</p>
      <div className="wtl-acts"><button type="button" className="rl-btn go" onClick={() => fromBase("cinema")} data-testid="wt-new"><IoAdd /> Nouveau thème</button></div>

      <h3 className="wtl-h">Mes thèmes <small>{mine.length}</small></h3>
      {!mine.length && <p className="wtl-empty">Aucun thème pour l'instant. Commence par un modèle ci-dessous.</p>}
      <div className="wtl-grid">
        {mine.map((d) => (
          <article key={d.key} className={"wtl-card" + (used === d.key ? " on" : "")} data-testid={`wt-mine-${d.key}`}>
            <button type="button" className="wtl-prev" onClick={() => edit(d)} title="Modifier"><WorldMini t={d} title={title} bg={bg} cover={cover} /></button>
            <div className="wtl-cap"><b>{d.name}</b><small>{used === d.key ? <><IoCheckmark /> utilisé par cette œuvre</> : `D'après ${WORLD_STYLES[d.base] || d.base}`}</small></div>
            <div className="wtl-ra">
              {used !== d.key && <button type="button" onClick={() => set("world_style", d.key)} data-testid={`wt-use-${d.key}`}>Utiliser</button>}
              <button type="button" onClick={() => edit(d)} title="Modifier" aria-label="Modifier" data-testid={`wt-edit-${d.key}`}><IoPencil /></button>
              <button type="button" onClick={() => edit({ ...d, key: undefined, name: d.name + " (copie)" })} title="Dupliquer" aria-label="Dupliquer"><IoCopyOutline /></button>
              {del === d.key ? <button type="button" className="sure" onClick={() => remove(d.key)}>Supprimer ?</button> : <button type="button" onClick={() => setDel(d.key)} title="Supprimer" aria-label="Supprimer" data-testid={`wt-del-${d.key}`}><IoTrashOutline /></button>}
            </div>
          </article>
        ))}
      </div>

      <h3 className="wtl-h">Modèles <small>pour démarrer</small></h3>
      <div className="wtl-grid">
        {WT_PRESETS.map((p) => (
          <button type="button" key={p.name} className="wtl-card wtl-preset" onClick={() => fromPreset(p)} data-testid={`wt-preset-${p.name}`}>
            <span className="wtl-prev"><WorldMini t={p} title={title} bg={bg} cover={cover} /></span>
            <span className="wtl-cap"><b>{p.name}</b><small>{p.about}</small></span>
          </button>
        ))}
      </div>

      <h3 className="wtl-h">Thèmes d'origine <small>partir de l'un d'eux</small></h3>
      <div className="wtl-grid sm">
        {Object.entries(WORLD_STYLES).map(([k, l]) => (
          <button type="button" key={k} className="wtl-card" onClick={() => fromBase(k)} data-testid={`wt-base-${k}`}>
            <span className="wtl-prev"><WorldMini t={{ ...WT_BLANK, base: k }} title={title} bg={bg} cover={cover} /></span>
            <span className="wtl-cap"><b>{l}</b></span>
          </button>
        ))}
      </div>
    </div>
  );

  // ---------- éditeur ----------
  const b = B(t);
  return (
    <div className={"wtl wtl-ed" + (full ? " full" : "")} data-testid="wt-editor">
      <header className="wtl-bar">
        <button type="button" className="rl-btn ghost" onClick={() => setT(null)} data-testid="wt-back"><IoArrowBack /> Mes thèmes</button>
        <input className="rl-in wtl-name" value={t.name || ""} onChange={(e) => patch({ name: e.target.value })} placeholder="Nom du thème" data-testid="wt-name" />
        <select className="rl-in wtl-base" value={t.base} onChange={(e) => patch({ base: e.target.value })} title="Thème de base : la mise en page du monde" data-testid="wt-base">
          {Object.entries(WORLD_STYLES).map(([k, l]) => <option key={k} value={k}>Base : {l}</option>)}
        </select>
        <span className="wtl-grow" />
        <button type="button" className="rl-btn ghost" onClick={() => onFull?.(!full)} title={full ? "Réduire" : "Plein écran"} data-testid="wt-full">{full ? <IoContractOutline /> : <IoExpandOutline />}</button>
        {onPeek && <button type="button" className="rl-btn ghost" onClick={() => { setReplay((r) => r + 1); onPeek(); }} data-testid="wt-peek"><IoEyeOutline /> Voir dans le monde</button>}
        <button type="button" className="rl-btn" onClick={() => save(false)} disabled={busy} data-testid="wt-save">Enregistrer</button>
        <button type="button" className="rl-btn go" onClick={() => save(true)} disabled={busy} data-testid="wt-apply"><IoCheckmark /> Utiliser pour l'œuvre</button>
      </header>
      <div className="wtl-split">
        <div className="wtl-ctrl">
          <nav className="wtl-tabs">{TABS.map(([k, l]) => <button type="button" key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} data-testid={`wt-tab-${k}`}>{l}</button>)}</nav>
          <div className="wtl-pane">
            {tab === "colors" && <>
              <h4>Palettes</h4>
              <div className="wtl-pals">{WT_PALETTES.map(([n, p, k, h]) => (
                <button type="button" key={n} className={t.paper === p && t.ink === k && t.hl === h ? "on" : ""} onClick={() => patch({ paper: p, ink: k, hl: h })} title={n}>
                  <span style={{ background: p }}><i style={{ background: k }} /><i style={{ background: h }} /></span><small>{n}</small>
                </button>))}
              </div>
              <h4>Sur mesure</h4>
              <ColorRow t={t} patch={patch} label="Fond" k="paper" def={b.paper} /><ColorRow t={t} patch={patch} label="Encre (textes)" k="ink" def={b.ink} /><ColorRow t={t} patch={patch} label="Accent (menus, reflets)" k="hl" def={b.hl} />
            </>}
            {tab === "type" && <>
              <div className="wtl-seg">{[["font_title", "Titres"], ["font_ui", "Menus"], ["font_body", "Textes"]].map(([k, l]) => <button type="button" key={k} className={typeFor === k ? "on" : ""} onClick={() => setTypeFor(k)}>{l}{t[k] ? <em>{t[k]}</em> : <em>thème</em>}</button>)}</div>
              <div className="wtl-fonts">
                <button type="button" className={!t[typeFor] ? "on" : ""} onClick={() => patch({ [typeFor]: "" })}><b style={{ fontFamily: `"${typeFor === "font_ui" ? b.fu : b.ft}"` }}>Aa</b><small>Celle du thème</small></button>
                {WT_FONTS.map(([f, d]) => <button type="button" key={f} className={t[typeFor] === f ? "on" : ""} onClick={() => patch({ [typeFor]: f })} data-testid={`wt-font-${f}`}><b style={{ fontFamily: `"${f}"` }}>{typeFor === "font_title" ? title.slice(0, 14) : "Chapitres"}</b><small>{f} · {d}</small></button>)}
              </div>
              <h4>Titres</h4>
              <div className="wtl-chips"><Chip on={t.title_case === "auto"} onClick={() => patch({ title_case: "auto" })}>Comme le thème</Chip><Chip on={t.title_case === "upper"} onClick={() => patch({ title_case: "upper" })}>MAJUSCULES</Chip><Chip on={t.title_case === "none"} onClick={() => patch({ title_case: "none" })}>Normal</Chip></div>
            </>}
            {tab === "layout" && <>
              <h4>Côté du menu</h4>
              <div className="wtl-cards">
                {[[false, "Menu à gauche", "Comme le thème de base"], [true, "Miroir", "Le menu et la fenêtre changent de côté"]].map(([v, l, d]) => (
                  <button type="button" key={String(v)} className={!!t.mirror === v ? "on" : ""} onClick={() => patch({ mirror: v })} data-testid={`wt-mirror-${v}`}><span className={"wtl-diag" + (v ? " mir" : "")}><i /><u /></span><b>{l}</b><small>{d}</small></button>))}
              </div>
              <h4>Fenêtre façon Nier</h4>
              <div className="wtl-cards">
                {[[true, "Avec fenêtre", "Image et texte du bouton choisi"], [false, "Sans fenêtre", "Seulement le menu et le titre"]].map(([v, l, d]) => (
                  <button type="button" key={String(v)} className={(t.win !== false) === v ? "on" : ""} onClick={() => patch({ win: v })}><span className={"wtl-diag" + (v ? "" : " nowin")}><i /><u /></span><b>{l}</b><small>{d}</small></button>))}
              </div>
              <h4>Coins</h4>
              <div className="wtl-radii">{[["auto", "Thème"], [0, "Droits"], [6, "Doux"], [14, "Ronds"], [24, "Très ronds"]].map(([v, l]) => <button type="button" key={String(v)} className={(t.radius ?? "auto") === v ? "on" : ""} onClick={() => patch({ radius: v })}><i style={{ borderRadius: v === "auto" ? 3 : v }} /><small>{l}</small></button>)}</div>
            </>}
            {tab === "matter" && <>
              <h4>Fond</h4>
              <Slide t={t} patch={patch} label="Assombrir l'image" k="bg_dim" max={0.9} auto /><Slide t={t} patch={patch} label="Flou de l'image" k="bg_blur" max={30} step={1} unit="px" auto />
              <h4>Matière</h4>
              <Slide t={t} patch={patch} label="Grain de pellicule" k="grain" /><Slide t={t} patch={patch} label="Lignes d'écran" k="scan" /><Slide t={t} patch={patch} label="Vignette (bords sombres)" k="vignette" />
            </>}
            {tab === "fx" && <>
              <h4>Particules</h4>
              <div className="wtl-tiles">
                {[["auto", "Celles du thème", "Rien ne change"], ["none", "Aucune", "Un monde calme"], ...Object.entries(PT_NAMES).map(([k, [n, d]]) => [k, n, d])].map(([k, n, d]) => <button type="button" key={k} className={t.pt === k ? "on" : ""} onClick={() => patch({ pt: k })} data-testid={`wt-pt-${k}`}><b>{n}</b><small>{d}</small></button>)}
              </div>
              <h4>Transition d'entrée</h4>
              <div className="wtl-tiles">
                {[["auto", "Celle du thème"], ["none", "Aucune"], ...Object.entries(IN_NAMES)].map(([k, n]) => <button type="button" key={k} className={t.intro === k ? "on" : ""} onClick={() => patch({ intro: k })} data-testid={`wt-in-${k}`}><b>{n}</b></button>)}
              </div>
              {onPeek && <button type="button" className="rl-btn ghost" onClick={() => { setReplay((r) => r + 1); onPeek(); }}><IoRefresh /> La voir dans le monde</button>}
            </>}
            {tab === "mouse" && <>
              <p className="wtl-hint">Passe la souris sur l'aperçu pour l'essayer. Sur téléphone, rien ne change.</p>
              <div className="wtl-tiles">
                {WT_CURSORS.map(([k, n, d]) => <button type="button" key={k} className={(t.cursor || "none") === k ? "on" : ""} onClick={() => patch({ cursor: k })} data-testid={`wt-cur-${k}`}><b>{n}</b><small>{d}</small></button>)}
              </div>
            </>}
          </div>
        </div>
        <div className="wtl-look">
          <p className="rl-lbl">APERÇU EN DIRECT</p>
          <WorldMini t={t} title={title} sub={form.tagline} bg={bg} cover={cover} big onHover={setTryCur} />
          <p className="wtl-hint">{onPeek ? "« Voir dans le monde » montre le vrai monde habillé de ce thème (rien n'est enregistré)." : "Enregistre d'abord l'œuvre pour voir le thème dans son monde."}</p>
          {tryCur && t.cursor && t.cursor !== "none" && <CursorFx type={t.cursor} color={t.hl || b.hl} />}
        </div>
      </div>
    </div>
  );
}
