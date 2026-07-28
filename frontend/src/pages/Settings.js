import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoLockOpen, IoLockClosed, IoCheckmarkCircle, IoAddOutline, IoTrashOutline, IoCloudUploadOutline, IoPlay, IoDownloadOutline, IoVolumeMute, IoVolumeHigh, IoStar, IoStarOutline } from "react-icons/io5";
import { toast } from "sonner";
import { THEMES } from "@/lib/themes";
import { SOUND_PACKS } from "@/lib/sound";
import { INTROS } from "@/lib/intro";
import BootIntro from "@/components/BootIntro";
import { useApp } from "@/context/AppContext";
import { CB_PAGES, CB_PAGE_LABELS, CB_DEFAULT_TIPS } from "@/components/CosmicBunny";
import {
  listAmbiences, createAmbience, updateAmbience, uploadAmbienceAudio, deleteAmbience, ambienceUrl,
  listCategories, createCategory, updateCategory, deleteCategory,
  listSubscribers, deleteSubscriber, getSettings, updateSettings,
  uploadIntroVideo, deleteIntroVideo,
  listAnnouncements, createAnnouncement, deleteAnnouncement, listCreations, emailStatus,
} from "@/lib/api";

const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };
const Section = ({ title, extra, children }) => (
  <section className="mb-12">
    <h2 className="font-display text-2xl mb-4 flex items-baseline gap-2" style={{ color: "var(--text-primary)" }}>{title}{extra && <span className="text-base" style={{ color: "var(--text-secondary)" }}>{extra}</span>}</h2>
    {children}
  </section>
);

const AMBIENCE_ICONS = ["🎵","🌙","🌧️","🔥","🌊","🍃","🎐","🏯","⛩️","🌸","❄️","☕","📖","🕯️","🌌","🎹","🐉","🦊","💮","🎏","🌿","⚡","🫧","🪷"];

function AmbienceManager() {
  const { isAdmin, ambienceId, selectAmbience, sfx } = useApp();
  const { data: list = [], refetch } = useQuery({ queryKey: ["ambiences"], queryFn: listAmbiences });
  const { data: settings, refetch: refetchSettings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [title, setTitle] = useState(""); const [emoji, setEmoji] = useState("🎵");
  const defaultId = settings?.default_ambience_id || "";

  const setDefault = async (id) => {
    await updateSettings({ ...settings, default_ambience_id: id });
    toast.success(id ? "Ambiance par défaut définie" : "Aucune ambiance par défaut");
    refetchSettings();
  };

  const add = async () => {
    if (!title.trim()) return toast.error("Titre requis");
    const a = await createAmbience({ title: title.trim(), emoji: emoji || "🎵", order: list.length });
    toast.success("Ambiance créée — ajoute un fichier audio"); setTitle(""); setEmoji("🎵"); refetch();
    return a;
  };
  const upload = async (id, file) => { if (!file) return; try { await uploadAmbienceAudio(id, file); toast.success("Audio ajouté"); refetch(); } catch { toast.error("Fichier trop lourd (max 12 Mo) ?"); } };
  const del = async (id) => { await deleteAmbience(id); if (ambienceId === id) selectAmbience(""); refetch(); };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4" data-testid="ambience-list">
        <button onClick={() => { sfx("nav"); selectAmbience(""); }} data-testid="ambience-none"
          className="p-4 border text-left" style={{ ...fs, background: "var(--bg-secondary)", outline: !ambienceId ? "2px solid var(--brand)" : "none" }}>
          <div className="text-2xl mb-1">🔇</div><p className="text-sm" style={{ color: "var(--text-primary)" }}>Aucune</p>
        </button>
        {list.map((a) => (
          <div key={a.id} data-testid={`ambience-${a.id}`} className="p-4 border relative" style={{ ...fs, background: "var(--bg-secondary)", outline: ambienceId === a.id ? "2px solid var(--brand)" : "none" }}>
            {defaultId === a.id && (
              <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5" style={{ background: "var(--brand)", color: "var(--bg-primary)" }} data-testid={`ambience-default-badge-${a.id}`}><IoStar size={10} /> Défaut</span>
            )}
            <button onClick={() => { sfx("select"); selectAmbience(a.id); }} className="text-left w-full">
              <div className="text-2xl mb-1">{a.emoji}</div>
              <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{a.title}</p>
            </button>
            <div className="flex items-center gap-3 mt-2">
              <a href={ambienceUrl(a.id)} target="_blank" rel="noreferrer" className="text-xs" style={{ color: "var(--text-secondary)" }}><IoPlay /></a>
              {isAdmin && (
                <>
                  <button onClick={() => setDefault(defaultId === a.id ? "" : a.id)} className="text-xs" style={{ color: defaultId === a.id ? "var(--brand)" : "var(--text-secondary)" }} title="Définir par défaut" data-testid={`ambience-default-${a.id}`}>
                    {defaultId === a.id ? <IoStar /> : <IoStarOutline />}
                  </button>
                  <label className="text-xs cursor-pointer" style={{ color: "var(--brand)" }} title="Uploader l'audio">
                    <IoCloudUploadOutline /><input type="file" accept="audio/*" hidden onChange={(e) => upload(a.id, e.target.files?.[0])} />
                  </label>
                  <button onClick={() => del(a.id)} className="text-xs" style={{ color: "var(--brand)" }}><IoTrashOutline /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {isAdmin && (
        <div className="border p-3" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="ambience-add">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Choisis une icône</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {AMBIENCE_ICONS.map((ic) => (
              <button key={ic} data-testid={`ambience-icon-${ic}`} onClick={() => setEmoji(ic)}
                className="w-9 h-9 flex items-center justify-center text-lg border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", outline: emoji === ic ? "2px solid var(--brand)" : "none", background: "var(--bg-primary)" }}>
                {ic}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="w-11 flex items-center justify-center text-xl border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>{emoji}</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'ambiance" className="flex-1 px-3 py-2 border outline-none" style={fs} data-testid="ambience-title-input" />
            <button onClick={add} className="px-4 py-2 font-semibold flex items-center gap-1" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }} data-testid="ambience-add-btn"><IoAddOutline /> Ajouter</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryManager() {
  const { data: list = [], refetch } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const [label, setLabel] = useState(""); const [kanji, setKanji] = useState("");

  const add = async () => { if (!label.trim()) return toast.error("Nom requis"); await createCategory({ label: label.trim(), kanji, order: list.length + 1 }); toast.success("Catégorie créée"); setLabel(""); setKanji(""); refetch(); };
  const save = async (c, patch) => { await updateCategory(c.id, { label: patch.label ?? c.label, kanji: patch.kanji ?? c.kanji, order: patch.order ?? c.order }); refetch(); };
  const del = async (c) => { if (!window.confirm(`Supprimer la catégorie « ${c.label} » ? Les créations resteront mais sans catégorie visible.`)) return; await deleteCategory(c.id); refetch(); };
  const move = async (c, dir) => { await save(c, { order: (c.order || 0) + dir }); };

  return (
    <div data-testid="category-manager">
      <div className="space-y-2 mb-4">
        {list.map((c) => (
          <div key={c.id} data-testid={`cat-row-${c.key}`} className="flex items-center gap-2 p-2 border" style={{ ...fs, background: "var(--bg-secondary)" }}>
            <input defaultValue={c.kanji} onBlur={(e) => e.target.value !== c.kanji && save(c, { kanji: e.target.value })} className="w-14 px-2 py-1.5 border outline-none text-center" style={fs} />
            <input defaultValue={c.label} onBlur={(e) => e.target.value !== c.label && save(c, { label: e.target.value })} className="flex-1 px-2 py-1.5 border outline-none" style={fs} />
            <button onClick={() => move(c, -1)} className="px-2" style={{ color: "var(--text-secondary)" }}>↑</button>
            <button onClick={() => move(c, 1)} className="px-2" style={{ color: "var(--text-secondary)" }}>↓</button>
            <button onClick={() => del(c)} className="px-2" style={{ color: "var(--brand)" }}><IoTrashOutline /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={kanji} onChange={(e) => setKanji(e.target.value)} placeholder="漢" className="w-14 px-2 py-2 border outline-none text-center" style={fs} data-testid="cat-new-kanji" />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nouvelle catégorie" className="flex-1 px-3 py-2 border outline-none" style={fs} data-testid="cat-new-label" />
        <button onClick={add} className="px-4 py-2 font-semibold flex items-center gap-1" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }} data-testid="cat-add-btn"><IoAddOutline /> Ajouter</button>
      </div>
    </div>
  );
}

function SubscribersManager() {
  const { data: list = [], refetch } = useQuery({ queryKey: ["subscribers"], queryFn: listSubscribers });
  const exportCsv = () => {
    const csv = "email,date\n" + list.map((s) => `${s.email},${s.created_at}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "abonnes.csv"; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div data-testid="subscribers-manager">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{list.length} abonné(s)</p>
        <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs" style={fs}><IoDownloadOutline /> Exporter CSV</button>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {list.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-2 border text-sm" style={{ ...fs, background: "var(--bg-secondary)" }}>
            <span style={{ color: "var(--text-primary)" }}>{s.email}</span>
            <button onClick={async () => { await deleteSubscriber(s.id); refetch(); }} style={{ color: "var(--brand)" }}><IoTrashOutline size={14} /></button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aucun abonné pour l'instant.</p>}
      </div>
    </div>
  );
}

function IntroManager() {
  const { isAdmin } = useApp();
  const { data: settings, refetch } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [off, setOff] = useState(localStorage.getItem("sx_intro_off") === "1");
  const [preview, setPreview] = useState(null);
  const curType = settings?.intro_type || "tengoku";
  const hasVideo = !!settings?.intro_has_video;
  const hidden = settings?.intro_hidden || [];
  const visibleIntros = INTROS.filter((it) => !hidden.includes(it.key));

  const toggleOff = () => { const nv = !off; setOff(nv); localStorage.setItem("sx_intro_off", nv ? "1" : "0"); };
  const chooseType = async (t) => { await updateSettings({ ...settings, intro_type: t }); toast.success("Intro par défaut mise à jour"); refetch(); };
  const hideIntro = async (key) => {
    const nh = [...new Set([...hidden, key])];
    const patch = { ...settings, intro_hidden: nh };
    if (curType === key) patch.intro_type = INTROS.find((i) => !nh.includes(i.key))?.key || "tengoku";
    await updateSettings(patch); toast.success("Écran de démarrage supprimé"); refetch();
  };
  const restoreAll = async () => { await updateSettings({ ...settings, intro_hidden: [] }); toast.success("Écrans réaffichés"); refetch(); };
  const upload = async (file) => {
    if (!file) return;
    try { await uploadIntroVideo(file); toast.success("Vidéo d'intro importée"); refetch(); }
    catch { toast.error("Vidéo trop lourde (max 10 Mo) ?"); }
  };
  const delVideo = async () => {
    await deleteIntroVideo();
    if (curType === "video") await updateSettings({ ...settings, intro_type: "tengoku", intro_has_video: false });
    toast.success("Vidéo supprimée"); refetch();
  };

  return (
    <div data-testid="intro-manager">
      <label className="flex items-center gap-2 text-sm cursor-pointer mb-4" style={{ color: "var(--text-primary)" }}>
        <input type="checkbox" data-testid="intro-enabled" checked={!off} onChange={toggleOff} /> Afficher l'écran de démarrage (une fois par session)
      </label>

      {/* Random mode */}
      <div data-testid="intro-random" className="p-4 border mb-3 flex items-center justify-between gap-3 flex-wrap"
        style={{ ...fs, background: "var(--bg-secondary)", outline: curType === "random" ? "2px solid var(--brand)" : "none" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎲</span>
          <div>
            <span className="font-display text-lg block" style={{ color: "var(--text-primary)" }}>Aléatoire</span>
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Un écran de démarrage différent à chaque session</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && curType !== "random" && <button data-testid="intro-choose-random" onClick={() => chooseType("random")} className="text-xs px-3 py-1.5 border" style={{ color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>Définir par défaut</button>}
          {curType === "random" && <span className="text-xs flex items-center gap-1" style={{ color: "var(--brand)" }}><IoStar size={11} /> Par défaut</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleIntros.map((it) => (
          <div key={it.key} data-testid={`intro-${it.key}`} className="p-4 border" style={{ ...fs, background: "var(--bg-secondary)", outline: curType === it.key ? "2px solid var(--brand)" : "none" }}>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{it.label}</span>
              <span className="font-display" style={{ color: "var(--brand)" }}>{it.kanji}</span>
            </div>
            <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>{it.tagline}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <button data-testid={`intro-preview-${it.key}`} onClick={() => setPreview({ type: it.key, hasVideo: false })} className="text-xs" style={{ color: "var(--brand)" }}><IoPlay /> Aperçu</button>
              {isAdmin && curType !== it.key && <button data-testid={`intro-choose-${it.key}`} onClick={() => chooseType(it.key)} className="text-xs" style={{ color: "var(--text-secondary)" }}>Définir</button>}
              {curType === it.key && <span className="text-xs flex items-center gap-1" style={{ color: "var(--brand)" }}><IoStar size={11} /> Par défaut</span>}
              {isAdmin && <button data-testid={`intro-delete-${it.key}`} onClick={() => hideIntro(it.key)} className="text-xs ml-auto" style={{ color: "var(--brand)" }} title="Supprimer cet écran"><IoTrashOutline /></button>}
            </div>
          </div>
        ))}

        {/* video card */}
        <div className="p-4 border" style={{ ...fs, background: "var(--bg-secondary)", outline: curType === "video" ? "2px solid var(--brand)" : "none" }} data-testid="intro-video-card">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-lg" style={{ color: "var(--text-primary)" }}>Ma vidéo</span>
            <span className="font-display" style={{ color: "var(--brand)" }}>🎬</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>{hasVideo ? "Vidéo importée" : "Aucune vidéo (max 10 Mo)"}</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {hasVideo && <button onClick={() => setPreview({ type: "video", hasVideo: true })} className="text-xs" style={{ color: "var(--brand)" }} data-testid="intro-preview-video"><IoPlay /> Aperçu</button>}
            {isAdmin && (
              <>
                <label className="text-xs cursor-pointer" style={{ color: "var(--brand)" }} data-testid="intro-video-upload">
                  <IoCloudUploadOutline /> {hasVideo ? "Remplacer" : "Importer"}
                  <input type="file" accept="video/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
                </label>
                {hasVideo && curType !== "video" && <button onClick={() => chooseType("video")} className="text-xs" style={{ color: "var(--text-secondary)" }} data-testid="intro-choose-video">Définir</button>}
                {hasVideo && <button onClick={delVideo} className="text-xs" style={{ color: "var(--brand)" }}><IoTrashOutline /></button>}
              </>
            )}
          </div>
        </div>
      </div>

      {isAdmin && hidden.length > 0 && (
        <button data-testid="intro-restore-all" onClick={restoreAll} className="mt-3 text-xs underline" style={{ color: "var(--text-secondary)" }}>Réafficher les écrans supprimés ({hidden.length})</button>
      )}

      {preview && <BootIntro type={preview.type} hasVideo={preview.hasVideo} onDone={() => setPreview(null)} />}
    </div>
  );
}

function WelcomeMessagesManager() {
  const { data: settings, refetch } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [draft, setDraft] = useState(null);
  const base = (draft ?? settings?.welcome_messages ?? []).slice(0, 5);
  while (base.length < 5) base.push("");
  const update = (i, v) => setDraft(base.map((m, x) => (x === i ? v : m)));
  const save = async () => {
    const clean = base.map((m) => m.trim()).filter(Boolean);
    if (!clean.length) return toast.error("Ajoute au moins un message");
    await updateSettings({ ...settings, welcome_messages: clean });
    toast.success("Messages de bienvenue enregistrés"); refetch(); setDraft(null);
  };
  return (
    <div data-testid="welcome-messages-manager">
      <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Ces messages s'affichent au hasard sur l'écran d'entrée quand un visiteur revient. Utilise <span style={{ color: "var(--brand)" }}>{"{name}"}</span> pour insérer son nom.</p>
      <div className="space-y-2 mb-3">
        {base.map((m, i) => (
          <input key={i} data-testid={`welcome-msg-${i}`} value={m} onChange={(e) => update(i, e.target.value)} placeholder={`Message ${i + 1} (ex: Bon retour, {name} !)`}
            className="w-full px-3 py-2 border outline-none" style={fs} />
        ))}
      </div>
      <button onClick={save} data-testid="welcome-save" className="px-5 py-2 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Enregistrer</button>
    </div>
  );
}

function CosmicBunnyManager() {
  const { isAdmin } = useApp();
  const { data: settings, refetch } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [hidden, setHidden] = useState(() => localStorage.getItem("sx_cb_hidden") === "1");
  const [tipsOff, setTipsOff] = useState(() => localStorage.getItem("sx_cb_tips_off") === "1");
  const [draft, setDraft] = useState(null);

  const notify = () => window.dispatchEvent(new Event("sx-cb-pref"));
  const setHiddenPref = (v) => { localStorage.setItem("sx_cb_hidden", v ? "1" : "0"); setHidden(v); notify(); };
  const setTipsOffPref = (v) => { localStorage.setItem("sx_cb_tips_off", v ? "1" : "0"); setTipsOff(v); notify(); };
  const replay = () => { localStorage.removeItem("sx_cb_seen"); notify(); toast.success("Conseils réinitialisés — Cosmic Bunny va revenir te guider ! 🐰"); };

  const enabledGlobal = settings ? settings.cosmic_bunny_enabled !== false : true;
  const toggleGlobal = async (v) => { await updateSettings({ ...settings, cosmic_bunny_enabled: v }); refetch(); toast.success(v ? "Cosmic Bunny activée" : "Cosmic Bunny désactivée pour tous"); };

  const tipsMap = draft ?? ((settings?.cosmic_bunny_tips && Object.keys(settings.cosmic_bunny_tips).length) ? settings.cosmic_bunny_tips : CB_DEFAULT_TIPS);
  const setTip = (page, i, v) => setDraft({ ...tipsMap, [page]: (tipsMap[page] || []).map((t, x) => (x === i ? v : t)) });
  const addTip = (page) => setDraft({ ...tipsMap, [page]: [...(tipsMap[page] || []), ""] });
  const removeTip = (page, i) => setDraft({ ...tipsMap, [page]: (tipsMap[page] || []).filter((_, x) => x !== i) });
  const savePhrases = async () => {
    const clean = {};
    CB_PAGES.forEach((p) => { clean[p] = (tipsMap[p] || []).map((t) => t.trim()).filter(Boolean); });
    await updateSettings({ ...settings, cosmic_bunny_tips: clean });
    toast.success("Phrases de Cosmic Bunny enregistrées"); refetch(); setDraft(null);
  };

  return (
    <div data-testid="cosmic-bunny-manager">
      <div className="flex items-center gap-3 mb-4">
        <img src="/cosmic-bunny.png" alt="" className="w-14 h-14 rounded-full object-contain" style={{ background: "var(--bg-secondary)", border: "2px solid var(--brand)" }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Cosmic Bunny t'accueille et te glisse des petits conseils sur chaque page. Sans IA, juste plein d'entrain ! 🐰</p>
      </div>
      <div className="space-y-3">
        <label className="flex items-center justify-between gap-3 p-3 border cursor-pointer" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="cb-toggle-show">
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>Afficher Cosmic Bunny <span className="block text-xs" style={{ color: "var(--text-secondary)" }}>Sa bulle reste en bas à gauche, prête à aider.</span></span>
          <input type="checkbox" checked={!hidden} onChange={(e) => setHiddenPref(!e.target.checked)} style={{ accentColor: "var(--brand)", width: 18, height: 18 }} />
        </label>
        <label className="flex items-center justify-between gap-3 p-3 border cursor-pointer" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="cb-toggle-auto">
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>Conseils automatiques <span className="block text-xs" style={{ color: "var(--text-secondary)" }}>Elle parle d'elle-même à la 1ʳᵉ visite d'une page.</span></span>
          <input type="checkbox" checked={!tipsOff} onChange={(e) => setTipsOffPref(!e.target.checked)} style={{ accentColor: "var(--brand)", width: 18, height: 18 }} />
        </label>
        <button data-testid="cb-replay" onClick={replay} className="px-5 py-2.5 border font-medium" style={fs}>Revoir tous les conseils</button>
      </div>

      {isAdmin && (
        <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border-c)" }}>
          <label className="flex items-center justify-between gap-3 p-3 border cursor-pointer mb-4" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="cb-toggle-global">
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>Activer Cosmic Bunny pour tous les visiteurs</span>
            <input type="checkbox" checked={enabledGlobal} onChange={(e) => toggleGlobal(e.target.checked)} style={{ accentColor: "var(--brand)", width: 18, height: 18 }} />
          </label>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>Modifier ses phrases (par page)</p>
          <div className="space-y-5">
            {CB_PAGES.map((page) => (
              <div key={page} data-testid={`cb-page-${page}`}>
                <p className="text-sm font-display mb-2" style={{ color: "var(--brand)" }}>{CB_PAGE_LABELS[page]}</p>
                <div className="space-y-2">
                  {(tipsMap[page] || []).map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <textarea data-testid={`cb-tip-${page}-${i}`} value={t} onChange={(e) => setTip(page, i, e.target.value)} rows={2} className="flex-1 px-3 py-2 border outline-none text-sm resize-y" style={fs} />
                      <button data-testid={`cb-tip-remove-${page}-${i}`} onClick={() => removeTip(page, i)} className="p-2 border" style={fs} title="Supprimer"><IoTrashOutline /></button>
                    </div>
                  ))}
                  <button data-testid={`cb-tip-add-${page}`} onClick={() => addTip(page)} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs" style={fs}><IoAddOutline /> Ajouter un conseil</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={savePhrases} data-testid="cb-save-phrases" className="mt-5 px-5 py-2.5 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Enregistrer les phrases</button>
        </div>
      )}
    </div>
  );
}

function AnnouncementsManager() {
  const { data: list = [], refetch } = useQuery({ queryKey: ["announcements"], queryFn: listAnnouncements });
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: mail } = useQuery({ queryKey: ["emailStatus"], queryFn: emailStatus });
  const [title, setTitle] = useState(""); const [text, setText] = useState(""); const [cid, setCid] = useState(""); const [notify, setNotify] = useState(false);
  const add = async () => {
    if (!title.trim() || !text.trim()) return toast.error("Titre et message requis");
    await createAnnouncement({ title: title.trim(), text: text.trim(), creation_id: cid, notify_email: notify });
    toast.success(notify ? "Annonce publiée + emails envoyés aux abonnés" : "Annonce publiée — visible par tous les visiteurs");
    setTitle(""); setText(""); setCid(""); setNotify(false); refetch();
  };
  const del = async (id) => { await deleteAnnouncement(id); refetch(); };
  return (
    <div data-testid="announcements-manager">
      <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Publie une annonce (ex: nouvelle création). Chaque visiteur la verra une fois à sa prochaine visite.</p>
      <div className="space-y-2 mb-3">
        {list.map((a) => (
          <div key={a.id} data-testid={`announcement-row-${a.id}`} className="flex items-start justify-between gap-2 p-3 border" style={{ ...fs, background: "var(--bg-secondary)" }}>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{a.title}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{a.text}</p>
            </div>
            <button onClick={() => del(a.id)} style={{ color: "var(--brand)" }} data-testid={`announcement-del-${a.id}`}><IoTrashOutline size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aucune annonce active.</p>}
      </div>
      <div className="border p-3 space-y-2" style={{ ...fs, background: "var(--bg-secondary)" }}>
        <input data-testid="announcement-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la nouveauté (ex: Épisode 3 : C'est lui le commandant)" className="w-full px-3 py-2 border outline-none" style={fs} />
        <textarea data-testid="announcement-text" value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Message…" className="w-full px-3 py-2 border outline-none resize-none" style={fs} />
        <select data-testid="announcement-creation" value={cid} onChange={(e) => setCid(e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs}>
          <option value="">Lier à une création (optionnel)</option>
          {creations.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-primary)" }} data-testid="announcement-notify-label">
          <input type="checkbox" data-testid="announcement-notify" checked={notify} onChange={(e) => setNotify(e.target.checked)} style={{ accentColor: "var(--brand)" }} />
          Envoyer aussi par email aux abonnés
        </label>
        {mail && !mail.configured && (
          <p className="text-[11px]" style={{ color: "var(--brand)" }}>⚠ Email non configuré côté serveur — l'envoi sera ignoré.</p>
        )}
        <button onClick={add} data-testid="announcement-add" className="px-4 py-2 font-semibold flex items-center gap-1" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}><IoAddOutline /> Publier</button>
      </div>
    </div>
  );
}

const POSTER_PREVIEW_PX = { compact: 40, normal: 58, grand: 78 };
function MiniPoster({ size }) {
  const w = POSTER_PREVIEW_PX[size] || POSTER_PREVIEW_PX.normal;
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0" data-testid="poster-preview">
      <div style={{ width: w, height: w * 1.5, borderRadius: "var(--radius-base)", background: "linear-gradient(155deg, var(--brand) 0%, var(--bg-secondary) 70%)", border: "1px solid var(--border-c)", position: "relative", overflow: "hidden", transition: "width .22s ease, height .22s ease", boxShadow: "0 4px 14px rgba(0,0,0,0.4)" }}>
        <div style={{ position: "absolute", left: 5, right: 14, bottom: 10, height: 3, background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: 5, right: 22, bottom: 5, height: 2, background: "rgba(255,255,255,0.5)", borderRadius: 2 }} />
      </div>
      <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Aperçu</span>
    </div>
  );
}

export default function Settings() {
  const nav = useNavigate();
  const { theme, setTheme, isAdmin, unlock, lock, changePin, musicVolume, setMusicVolume, uiVolume, setUiVolume, muted, toggleMute, soundPack, setPack, customSounds, setCustom, sfx,
    accent, setAccent, radius, setRadius, posterSize, setPosterSize, reduceMotion, setReduceMotion, cardTagline, setCardTagline, textScale, setTextScale,
    posterDesktop, posterMobile, setPosterSizeFor, textDesktop, textMobile, setTextScaleFor } = useApp();
  const [pin, setPin] = useState(""); const [newPin, setNewPin] = useState("");
  const { data: siteSettings, refetch: refetchSite } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const defTheme = siteSettings?.default_theme || "tengoku";
  const setDefaultTheme = async (k) => { await updateSettings({ ...siteSettings, default_theme: k }); toast.success("Thème par défaut défini"); refetchSite(); };

  const tryUnlock = () => { if (unlock(pin)) { toast.success("Mode création déverrouillé"); setPin(""); } else toast.error("PIN incorrect"); };
  const savePin = () => { if (!/^\d{4,6}$/.test(newPin)) return toast.error("PIN : 4 à 6 chiffres"); changePin(newPin); toast.success("PIN mis à jour"); setNewPin(""); };

  const setCustomSound = (event, file) => {
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) return toast.error("Son trop lourd (max 1 Mo)");
    const r = new FileReader(); r.onload = () => { setCustom({ ...(customSounds || {}), [event]: r.result }); toast.success("Son enregistré"); }; r.readAsDataURL(file);
  };

  const packs = [...SOUND_PACKS, { key: "silence", label: "Silence", emoji: "🔕" }];

  const ACCENTS = [
    { v: "", label: "Thème", c: "var(--brand)" }, { v: "#e60012", label: "Rouge", c: "#e60012" },
    { v: "#ff7a00", label: "Orange", c: "#ff7a00" }, { v: "#ffd400", label: "Or", c: "#ffd400" },
    { v: "#00e5a0", label: "Jade", c: "#00e5a0" }, { v: "#00fff5", label: "Cyan", c: "#00fff5" },
    { v: "#4d8dff", label: "Bleu", c: "#4d8dff" }, { v: "#c4b5fd", label: "Lilas", c: "#c4b5fd" },
    { v: "#ff4dcb", label: "Rose", c: "#ff4dcb" }, { v: "#ffffff", label: "Blanc", c: "#ffffff" },
  ];
  const RADII = [{ v: "", label: "Thème" }, { v: "0px", label: "Net" }, { v: "10px", label: "Arrondi" }, { v: "18px", label: "Doux" }, { v: "999px", label: "Pilule" }];
  const POSTERS = [{ v: "compact", label: "Compact" }, { v: "normal", label: "Normal" }, { v: "grand", label: "Grand" }];
  const TEXT_SCALES = [
    { v: "petit", label: "Petit", pct: "A" },
    { v: "normal", label: "Normal", pct: "A" },
    { v: "grand", label: "Grand", pct: "A" },
    { v: "xl", label: "Très grand", pct: "A" },
    { v: "max", label: "Maximum", pct: "A" },
  ];
  const TEXT_SCALE_SIZE = { petit: 12, normal: 15, grand: 18, xl: 22, max: 26 };

  return (
    <div className="relative min-h-screen w-full" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <button data-testid="settings-back" onClick={() => { sfx("back"); nav("/"); }} className="flex items-center gap-2 px-3 py-2 border mb-8" style={fs}><IoArrowBack /> <span className="text-sm">Retour</span></button>
        <h1 className="font-display text-4xl md:text-5xl mb-2" style={{ color: "var(--text-primary)" }}>Paramètres</h1>
        <p className="mb-10" style={{ color: "var(--text-secondary)" }}>Personnalise ta station.</p>

        <Section title="Mode création">
          {isAdmin ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--brand)" }}><IoLockOpen /> Déverrouillé — ajout, édition, suppression.</div>
              <button data-testid="lock-btn" onClick={() => { lock(); toast.success("Verrouillé"); }} className="px-5 py-2.5 border font-medium" style={fs}>Verrouiller</button>
              <div className="pt-4 border-t" style={{ borderColor: "var(--border-c)" }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Changer le PIN (4 à 6 chiffres)</p>
                <div className="flex gap-2">
                  <input data-testid="new-pin-input" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} maxLength={6} inputMode="numeric" placeholder="Nouveau PIN" className="px-4 py-2.5 border outline-none" style={fs} />
                  <button data-testid="save-pin-btn" onClick={savePin} className="px-5 py-2.5 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Enregistrer</button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Entre ton PIN pour débloquer la création (défaut : 1234).</p>
              <div className="flex gap-2">
                <input data-testid="pin-input" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} maxLength={6} inputMode="numeric" type="password" onKeyDown={(e) => e.key === "Enter" && tryUnlock()} placeholder="PIN" className="px-4 py-2.5 border outline-none" style={fs} />
                <button data-testid="unlock-btn" onClick={tryUnlock} className="px-5 py-2.5 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Déverrouiller</button>
              </div>
            </div>
          )}
        </Section>

        <Section title="Son">
          <button data-testid="mute-all" onClick={() => { toggleMute(); }} className="flex items-center gap-2 px-4 py-2.5 border mb-5" style={{ ...fs, color: muted ? "var(--brand)" : "var(--text-primary)" }}>
            {muted ? <IoVolumeMute /> : <IoVolumeHigh />} {muted ? "Son coupé — réactiver" : "Couper tous les sons"}
          </button>
          <label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Volume de l'ambiance ({Math.round(musicVolume * 100)}%)</label>
          <input data-testid="music-volume-slider" type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} className="w-full mt-2 mb-5" style={{ accentColor: "var(--brand)" }} />

          <label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Volume de l'interface ({Math.round(uiVolume * 100)}%)</label>
          <input data-testid="ui-volume-slider" type="range" min="0" max="1" step="0.05" value={uiVolume} onChange={(e) => { setUiVolume(parseFloat(e.target.value)); }} onMouseUp={() => sfx("select")} onTouchEnd={() => sfx("select")} className="w-full mt-2 mb-6" style={{ accentColor: "var(--brand)" }} />

          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Pack de sons d'interface</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="soundpack-grid">
            {packs.map((p) => (
              <button key={p.key} data-testid={`soundpack-${p.key}`} onClick={() => { setPack(p.key); setTimeout(() => sfx("select"), 30); }}
                className="p-3 border text-left" style={{ ...fs, background: "var(--bg-secondary)", outline: soundPack === p.key ? "2px solid var(--brand)" : "none" }}>
                <div className="text-xl mb-1">{p.emoji}</div><p className="text-sm" style={{ color: "var(--text-primary)" }}>{p.label}</p>
              </button>
            ))}
          </div>

          {/* Prominent custom pack button (like the contact button) — admin only */}
          {isAdmin && (<>
          <button data-testid="soundpack-custom" onClick={() => { setPack("custom"); setTimeout(() => sfx("select"), 30); }}
            className="mt-3 w-full flex items-center justify-between gap-3 px-5 py-4 border-2 transition-transform hover:scale-[1.01]"
            style={{ borderColor: "var(--brand)", borderRadius: "var(--radius-base)", background: soundPack === "custom" ? "var(--brand)" : "var(--bg-secondary)", color: soundPack === "custom" ? "var(--bg-primary)" : "var(--text-primary)" }}>
            <span className="flex items-center gap-3">
              <span className="text-2xl">🎚️</span>
              <span className="text-left">
                <span className="font-display text-lg block">Pack personnalisé</span>
                <span className="text-xs opacity-80">Uploade tes propres sons (survol · flèches · sélection)</span>
              </span>
            </span>
            {soundPack === "custom" && <IoCheckmarkCircle size={22} />}
          </button>
          {soundPack === "custom" && (
            <div className="mt-3 grid grid-cols-3 gap-2" data-testid="custom-sounds">
              {["hover", "nav", "select"].map((ev) => (
                <label key={ev} className="p-3 border cursor-pointer text-center text-xs" style={fs}>
                  <IoCloudUploadOutline style={{ color: customSounds?.[ev] ? "var(--brand)" : "var(--text-secondary)" }} />
                  <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{ev}</p>
                  <input type="file" accept="audio/*" hidden onChange={(e) => setCustomSound(ev, e.target.files?.[0])} />
                </label>
              ))}
            </div>
          )}
          </>)}
        </Section>

        <Section title="Ambiance sonore de l'app" extra="— choisis ou uploade">
          <AmbienceManager />
        </Section>

        {isAdmin && (
        <Section title="Écran de démarrage" extra="— intro type PS2 / Steam">
          <IntroManager />
        </Section>
        )}

        <Section title="Accessibilité" extra="— confort de lecture">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Taille du texte</p>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Agrandit tout le texte de l'application (descriptions, commentaires, chapitres…). Réglable séparément pour l'ordinateur et le mobile.</p>
          {[{ phone: false, label: "Ordinateur", cur: textDesktop }, { phone: true, label: "Mobile", cur: textMobile }].map((dev) => (
            <div key={dev.label} className="mb-3">
              <p className="text-[11px] uppercase tracking-widest mb-1.5" style={{ color: "var(--brand)" }}>{dev.label}</p>
              <div className="flex flex-wrap items-stretch gap-2" data-testid={`text-scale-${dev.phone ? "mobile" : "desktop"}-grid`}>
                {TEXT_SCALES.map((t) => {
                  const active = (dev.cur || "grand") === t.v;
                  return (
                    <button key={t.v} data-testid={`text-${dev.phone ? "mobile" : "desktop"}-${t.v}`} onClick={() => { setTextScaleFor(dev.phone, t.v); sfx("nav"); }}
                      className="flex-1 min-w-[64px] border flex flex-col items-center justify-center gap-1 py-2.5 px-2 transition-transform hover:scale-[1.02]"
                      style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-base)", outline: active ? "2px solid var(--brand)" : "none", color: "var(--text-primary)" }}>
                      <span className="font-display leading-none" style={{ fontSize: TEXT_SCALE_SIZE[t.v] }}>{t.pct}</span>
                      <span className="text-xs" style={{ color: active ? "var(--brand)" : "var(--text-secondary)" }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Cosmic Bunny" extra="— ton guide 🐰">
          <CosmicBunnyManager />
        </Section>

        <Section title="Personnalisation de l'interface" extra="— rends la station unique">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Couleur d'accent</p>
          <div className="flex flex-wrap gap-2 mb-3" data-testid="accent-grid">
            {ACCENTS.map((a) => (
              <button key={a.label} data-testid={`accent-${a.v || "theme"}`} onClick={() => { setAccent(a.v); sfx("select"); }}
                title={a.label} className="w-10 h-10 border flex items-center justify-center"
                style={{ background: a.c, borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", outline: accent === a.v ? "2px solid var(--text-primary)" : "none", outlineOffset: 2 }}>
                {accent === a.v && <IoCheckmarkCircle style={{ color: "#000", mixBlendMode: "difference" }} />}
              </button>
            ))}
            <label className="w-10 h-10 border flex items-center justify-center cursor-pointer text-xs" style={{ ...fs, background: "var(--bg-secondary)" }} title="Couleur personnalisée" data-testid="accent-custom">
              🎨<input type="color" hidden value={accent || "#e60012"} onChange={(e) => setAccent(e.target.value)} />
            </label>
          </div>

          <p className="text-xs uppercase tracking-widest mb-2 mt-5" style={{ color: "var(--text-secondary)" }}>Style des coins</p>
          <div className="flex flex-wrap gap-2 mb-3" data-testid="radius-grid">
            {RADII.map((r) => (
              <button key={r.label} data-testid={`radius-${r.v || "theme"}`} onClick={() => { setRadius(r.v); sfx("nav"); }}
                className="px-4 py-2 border text-sm" style={{ ...fs, background: "var(--bg-secondary)", borderRadius: r.v || "var(--radius-base)", outline: radius === r.v ? "2px solid var(--brand)" : "none" }}>
                {r.label}
              </button>
            ))}
          </div>

          <p className="text-xs uppercase tracking-widest mb-2 mt-5" style={{ color: "var(--text-secondary)" }}>Taille des affiches</p>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>Choisis la taille des affiches séparément pour l'ordinateur et le mobile.</p>
          {[{ phone: false, label: "Ordinateur", cur: posterDesktop }, { phone: true, label: "Mobile", cur: posterMobile }].map((dev) => (
            <div key={dev.label} className="mb-3">
              <p className="text-[11px] uppercase tracking-widest mb-1.5" style={{ color: "var(--brand)" }}>{dev.label}</p>
              <div className="flex items-center gap-4">
                <div className="flex flex-wrap gap-2" data-testid={`poster-size-${dev.phone ? "mobile" : "desktop"}-grid`}>
                  {POSTERS.map((p) => (
                    <button key={p.v} data-testid={`poster-${dev.phone ? "mobile" : "desktop"}-${p.v}`} onClick={() => { setPosterSizeFor(dev.phone, p.v); sfx("nav"); }}
                      className="px-4 py-2 border text-sm" style={{ ...fs, background: "var(--bg-secondary)", outline: (dev.cur || (dev.phone ? "compact" : "normal")) === p.v ? "2px solid var(--brand)" : "none" }}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <MiniPoster size={dev.cur || (dev.phone ? "compact" : "normal")} />
              </div>
            </div>
          ))}

          <div className="mt-5 space-y-3">
            <label className="flex items-center justify-between gap-3 p-3 border cursor-pointer" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="toggle-motion">
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>Réduire les animations <span className="block text-xs" style={{ color: "var(--text-secondary)" }}>Confort / économie de batterie</span></span>
              <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} style={{ accentColor: "var(--brand)", width: 18, height: 18 }} />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 border cursor-pointer" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="toggle-card-tagline">
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>Afficher les accroches sur les cartes</span>
              <input type="checkbox" checked={cardTagline} onChange={(e) => setCardTagline(e.target.checked)} style={{ accentColor: "var(--brand)", width: 18, height: 18 }} />
            </label>
          </div>
        </Section>

        <Section title="Thèmes" extra="— 12 ambiances">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="theme-grid">
            {THEMES.map((t) => {
              const active = theme === t.key;
              return (
                <button key={t.key} data-testid={`theme-${t.key}`} onClick={() => { setTheme(t.key); sfx("select"); toast.success(`Thème ${t.name}`); }}
                  className="relative text-left p-4 border transition-transform hover:scale-[1.02]" style={{ ...fs, background: "var(--bg-secondary)", outline: active ? "2px solid var(--brand)" : "none" }}>
                  {isAdmin && (
                    <span role="button" data-testid={`theme-default-${t.key}`} title="Définir par défaut"
                      onClick={(e) => { e.stopPropagation(); setDefaultTheme(t.key); }}
                      className="absolute top-2 right-2 cursor-pointer" style={{ color: defTheme === t.key ? "var(--brand)" : "var(--text-secondary)" }}>
                      {defTheme === t.key ? <IoStar size={16} /> : <IoStarOutline size={16} />}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 mb-3">{t.swatch.map((c, i) => <span key={i} className="w-5 h-5 rounded-full border" style={{ background: c, borderColor: "rgba(255,255,255,0.15)" }} />)}</div>
                  <div className="flex items-baseline justify-between"><span className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{t.name}</span><span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.kanji}</span></div>
                  <p className="text-[11px] mt-1 line-clamp-1" style={{ color: "var(--text-secondary)" }}>{t.tagline}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {active && <span className="flex items-center gap-1 text-xs" style={{ color: "var(--brand)" }}><IoCheckmarkCircle /> Actif</span>}
                    {defTheme === t.key && <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>défaut</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {isAdmin && (
          <>
            <Section title="Annonces aux visiteurs" extra="— préviens d'une nouveauté"><AnnouncementsManager /></Section>
            <Section title="Messages de bienvenue" extra="— écran d'entrée"><WelcomeMessagesManager /></Section>
            <Section title="Catégories"><CategoryManager /></Section>
            <Section title="Abonnés newsletter"><SubscribersManager /></Section>
          </>
        )}

        <p className="mt-4 text-xs text-center" style={{ color: "var(--text-secondary)" }}>Astuce : installe Stationexus via « Ajouter à l'écran d'accueil ».</p>
      </div>
    </div>
  );
}
