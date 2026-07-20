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
import {
  listAmbiences, createAmbience, updateAmbience, uploadAmbienceAudio, deleteAmbience, ambienceUrl,
  listCategories, createCategory, updateCategory, deleteCategory,
  listSubscribers, deleteSubscriber, getSettings, updateSettings,
  uploadIntroVideo, deleteIntroVideo,
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

export default function Settings() {
  const nav = useNavigate();
  const { theme, setTheme, isAdmin, unlock, lock, changePin, musicVolume, setMusicVolume, uiVolume, setUiVolume, muted, toggleMute, soundPack, setPack, customSounds, setCustom, sfx } = useApp();
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

          {/* Prominent custom pack button (like the contact button) */}
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
        </Section>

        <Section title="Ambiance sonore de l'app" extra="— choisis ou uploade">
          <AmbienceManager />
        </Section>

        <Section title="Écran de démarrage" extra="— intro type PS2 / Steam">
          <IntroManager />
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
            <Section title="Catégories"><CategoryManager /></Section>
            <Section title="Abonnés newsletter"><SubscribersManager /></Section>
          </>
        )}

        <p className="mt-4 text-xs text-center" style={{ color: "var(--text-secondary)" }}>Astuce : installe Stationexus via « Ajouter à l'écran d'accueil ».</p>
      </div>
    </div>
  );
}
