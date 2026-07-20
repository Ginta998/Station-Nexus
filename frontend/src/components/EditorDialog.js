import { useEffect, useRef, useState } from "react";
import { IoClose, IoCloudUploadOutline, IoTrashOutline, IoAddOutline, IoMusicalNotes, IoImageOutline, IoBookOutline } from "react-icons/io5";
import { toast } from "sonner";
import { createCreation, updateCreation, uploadAudio, deleteAudio, uploadReadingAudio, deleteReadingAudio, getCreationFull, uploadChapterAudio, deleteChapterAudio } from "@/lib/api";
import RichTextEditor from "@/components/RichTextEditor";

const empty = {
  title: "", kanji: "", category: "livres", tagline: "", synopsis: "",
  poster: "", accent: "", bg_image: "", bg_blur: 32, bg_dim: 0.55, gallery: [], embeds: [],
  launch_type: "reader", launch_label: "Lancer",
  launch_content: "", launch_url: "", buy_url: "", chapter_display: "button", chapter_size: "md", button_size: "md", episodes: [], chapters: [], coming_soon: false, order: 0,
};

const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };
const Label = ({ children }) => <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-secondary)" }}>{children}</label>;

const readFile = (file, cb, max = 3) => {
  if (file.size > max * 1024 * 1024) return toast.error(`Fichier trop lourd (max ${max} Mo)`);
  const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(file);
};

export default function EditorDialog({ open, onClose, initial, categories = [], onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [readingFile, setReadingFile] = useState(null);
  const [chapterFiles, setChapterFiles] = useState({});
  const posterInput = useRef(null);

  useEffect(() => {
    if (open) {
      const base = initial ? { ...empty, ...initial } : { ...empty, category: categories[0]?.key || "livres" };
      setForm(base); setAudioFile(null); setReadingFile(null); setChapterFiles({});
      // fetch full item (with base64 images) so editing preserves poster/bg/gallery/chapters
      if (initial && initial.id) {
        getCreationFull(initial.id).then((full) => setForm((f) => ({ ...empty, ...full }))).catch(() => {});
      }
    }
  }, [open, initial]); // eslint-disable-line

  if (!open) return null;
  const isEdit = Boolean(initial && initial.id);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addEp = () => set("episodes", [...(form.episodes || []), { title: "", description: "", url: "" }]);
  const updEp = (i, k, v) => set("episodes", form.episodes.map((e, x) => (x === i ? { ...e, [k]: v } : e)));
  const delEp = (i) => set("episodes", form.episodes.filter((_, x) => x !== i));

  const addCh = () => set("chapters", [...(form.chapters || []), { title: "", content: "", image: "", rich: true, has_music: false }]);
  const updCh = (i, k, v) => set("chapters", form.chapters.map((c, x) => (x === i ? { ...c, [k]: v } : c)));
  const delCh = (i) => { set("chapters", form.chapters.filter((_, x) => x !== i)); setChapterFiles((f) => { const n = { ...f }; delete n[i]; return n; }); };
  const removeChapterMusic = async (i) => {
    const ch = form.chapters[i];
    if (isEdit && ch?.id) { try { await deleteChapterAudio(initial.id, ch.id); } catch (_) {} }
    updCh(i, "has_music", false);
    setChapterFiles((f) => { const n = { ...f }; delete n[i]; return n; });
    toast.success("Musique du chapitre retirée");
  };

  const addGallery = (files) => {
    [...files].slice(0, 12).forEach((f) => readFile(f, (d) => setForm((p) => ({ ...p, gallery: [...(p.gallery || []), d] })), 4));
  };
  const delGallery = (i) => set("gallery", form.gallery.filter((_, x) => x !== i));

  const addEmbed = () => set("embeds", [...(form.embeds || []), { platform: "youtube", url: "", label: "" }]);
  const updEmbed = (i, k, v) => set("embeds", form.embeds.map((e, x) => (x === i ? { ...e, [k]: v } : e)));
  const delEmbed = (i) => set("embeds", form.embeds.filter((_, x) => x !== i));

  const save = async () => {
    if (!form.title.trim()) return toast.error("Le titre est requis");
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      const saved = isEdit ? await updateCreation(initial.id, payload) : await createCreation(payload);
      if (audioFile) await uploadAudio(saved.id, audioFile);
      if (readingFile) await uploadReadingAudio(saved.id, readingFile);
      // per-chapter music (chapters keep order → match by index to saved.chapters)
      const chFiles = Object.entries(chapterFiles);
      for (const [i, file] of chFiles) {
        const ch = saved.chapters?.[Number(i)];
        if (ch && file) { try { await uploadChapterAudio(saved.id, ch.id, file); } catch (_) { toast.error(`Musique du chapitre ${Number(i) + 1} trop lourde (max 12 Mo) ?`); } }
      }
      toast.success(isEdit ? "Création mise à jour" : "Création ajoutée");
      onSaved?.(); onClose();
    } catch { toast.error("Erreur lors de l'enregistrement"); } finally { setSaving(false); }
  };

  const removeAudio = async () => { if (!isEdit) return; await deleteAudio(initial.id); set("has_audio", false); toast.success("Ambiance supprimée"); };
  const removeReading = async () => { if (!isEdit) return; await deleteReadingAudio(initial.id); set("has_reading_audio", false); toast.success("Musique de lecture supprimée"); };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} data-testid="editor-dialog">
      <div className="w-full max-w-2xl my-auto border" style={{ ...fs, background: "var(--bg-secondary)" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border-c)" }}>
          <h2 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>{isEdit ? "Modifier la création" : "Nouvelle création"}</h2>
          <button data-testid="editor-close" onClick={onClose} className="p-1" style={{ color: "var(--text-secondary)" }}><IoClose size={22} /></button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-4">
            <button onClick={() => posterInput.current?.click()} className="flex-shrink-0 w-28 aspect-[2/3] border flex flex-col items-center justify-center overflow-hidden" style={fs} data-testid="editor-poster-upload">
              {form.poster ? <img src={form.poster} alt="poster" className="w-full h-full object-cover" /> : (<><IoCloudUploadOutline size={22} style={{ color: "var(--brand)" }} /><span className="text-[10px] mt-1" style={{ color: "var(--text-secondary)" }}>Poster</span></>)}
            </button>
            <input ref={posterInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], (d) => set("poster", d))} />
            <div className="flex-1 space-y-3">
              <div><Label>Titre</Label><input data-testid="editor-title" value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs} /></div>
              <div className="flex gap-3">
                <div className="w-20"><Label>Kanji</Label><input data-testid="editor-kanji" value={form.kanji} onChange={(e) => set("kanji", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs} /></div>
                <div className="flex-1"><Label>Catégorie</Label>
                  <select data-testid="editor-category" value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs}>
                    {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select></div>
              </div>
            </div>
          </div>

          <div><Label>Accroche</Label><input data-testid="editor-tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs} /></div>
          <div><Label>Synopsis</Label><textarea data-testid="editor-synopsis" rows={3} value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} className="w-full px-3 py-2 border outline-none resize-none" style={fs} /></div>

          {/* Immersive background */}
          <div className="border p-3 space-y-3" style={fs} data-testid="editor-bg-section">
            <Label>Image de fond immersive (floutée & assombrie)</Label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 border cursor-pointer text-sm" style={fs} data-testid="editor-bg-upload">
                <IoImageOutline style={{ color: form.bg_image ? "var(--brand)" : "var(--text-secondary)" }} />
                {form.bg_image ? "Fond présent — remplacer" : "Choisir une image (sinon le poster est utilisé)"}
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], (d) => set("bg_image", d), 4)} />
              </label>
              {form.bg_image && <button onClick={() => set("bg_image", "")} style={{ color: "var(--brand)" }}><IoTrashOutline /></button>}
            </div>
            <div className="flex gap-4">
              <div className="flex-1"><Label>Flou ({form.bg_blur}px)</Label>
                <input type="range" min="0" max="60" value={form.bg_blur} onChange={(e) => set("bg_blur", Number(e.target.value))} className="w-full" style={{ accentColor: "var(--brand)" }} data-testid="editor-bg-blur" /></div>
              <div className="flex-1"><Label>Assombrissement ({Math.round(form.bg_dim * 100)}%)</Label>
                <input type="range" min="0" max="0.95" step="0.05" value={form.bg_dim} onChange={(e) => set("bg_dim", Number(e.target.value))} className="w-full" style={{ accentColor: "var(--brand)" }} data-testid="editor-bg-dim" /></div>
            </div>
          </div>

          {/* Gallery */}
          <div className="border p-3" style={fs} data-testid="editor-gallery-section">
            <div className="flex items-center justify-between mb-2">
              <Label>Galerie d'images</Label>
              <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: "var(--brand)" }} data-testid="editor-gallery-add">
                <IoAddOutline /> Ajouter
                <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && addGallery(e.target.files)} />
              </label>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {(form.gallery || []).map((g, i) => (
                <div key={i} className="relative aspect-square overflow-hidden border" style={{ borderColor: "var(--border-c)" }}>
                  <img src={g} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => delGallery(i)} className="absolute top-0.5 right-0.5 p-0.5" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}><IoTrashOutline size={12} /></button>
                </div>
              ))}
              {(form.gallery || []).length === 0 && <p className="col-span-full text-xs" style={{ color: "var(--text-secondary)" }}>Aucune image.</p>}
            </div>
          </div>

          {/* Embeds / réseaux */}
          <div className="border p-3" style={fs} data-testid="editor-embeds-section">
            <div className="flex items-center justify-between mb-2">
              <Label>Intégrations réseaux (YouTube, Wattpad…)</Label>
              <button onClick={addEmbed} className="flex items-center gap-1 text-xs" style={{ color: "var(--brand)" }} data-testid="editor-embed-add"><IoAddOutline /> Ajouter</button>
            </div>
            <div className="space-y-2">
              {(form.embeds || []).map((em, i) => (
                <div key={i} className="flex gap-2 items-center" data-testid={`editor-embed-${i}`}>
                  <select value={em.platform} onChange={(e) => updEmbed(i, "platform", e.target.value)} className="px-2 py-1.5 border outline-none text-sm" style={fs}>
                    <option value="youtube">YouTube</option>
                    <option value="wattpad">Wattpad</option>
                    <option value="other">Autre</option>
                  </select>
                  <input value={em.url} onChange={(e) => updEmbed(i, "url", e.target.value)} placeholder="URL" className="flex-1 px-2 py-1.5 border outline-none text-sm" style={fs} />
                  <input value={em.label} onChange={(e) => updEmbed(i, "label", e.target.value)} placeholder="Libellé" className="w-28 px-2 py-1.5 border outline-none text-sm" style={fs} />
                  <button onClick={() => delEmbed(i)} style={{ color: "var(--brand)" }}><IoTrashOutline /></button>
                </div>
              ))}
              {(form.embeds || []).length === 0 && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Colle un lien YouTube (vidéo) ou Wattpad pour l'afficher sur la fiche.</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1"><Label>Type de lancement</Label>
              <select data-testid="editor-launch-type" value={form.launch_type} onChange={(e) => set("launch_type", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs}>
                <option value="reader">Lecture (extrait)</option>
                <option value="chapters">Lecteur de chapitres</option>
                <option value="link">Lien externe (film/vidéo)</option>
                <option value="episodes">Épisodes</option>
                <option value="info">Info seulement</option>
              </select></div>
            <div className="flex-1"><Label>Libellé du bouton</Label><input data-testid="editor-launch-label" value={form.launch_label} onChange={(e) => set("launch_label", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs} /></div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1"><Label>Taille des boutons d'action</Label>
              <select data-testid="editor-button-size" value={form.button_size || "md"} onChange={(e) => set("button_size", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs}>
                <option value="md">Normale</option>
                <option value="lg">Grande</option>
                <option value="xl">Très grande</option>
              </select></div>
            {(form.launch_type === "chapters" || form.launch_type === "episodes") && (
              <div className="flex-1"><Label>Taille des chapitres / épisodes</Label>
                <select data-testid="editor-chapter-size" value={form.chapter_size || "md"} onChange={(e) => set("chapter_size", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs}>
                  <option value="sm">Petite</option>
                  <option value="md">Moyenne</option>
                  <option value="lg">Grande</option>
                  <option value="xl">Très grande</option>
                </select></div>
            )}
          </div>

          {form.launch_type === "reader" && (
            <div><Label>Contenu à lire</Label><textarea data-testid="editor-launch-content" rows={4} value={form.launch_content} onChange={(e) => set("launch_content", e.target.value)} className="w-full px-3 py-2 border outline-none resize-none" style={fs} /></div>
          )}
          {form.launch_type === "link" && (
            <div><Label>URL du film / vidéo</Label><input data-testid="editor-launch-url" value={form.launch_url} onChange={(e) => set("launch_url", e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border outline-none" style={fs} /></div>
          )}

          {form.launch_type === "chapters" && (
            <div>
              <div className="flex items-center justify-between mb-2"><Label>Chapitres</Label>
                <button onClick={addCh} data-testid="editor-add-chapter" className="flex items-center gap-1 text-xs px-2 py-1" style={{ color: "var(--brand)" }}><IoAddOutline /> Ajouter</button></div>
              <div className="mb-3">
                <Label>Affichage des chapitres sur la fiche</Label>
                <select data-testid="editor-chapter-display" value={form.chapter_display || "button"} onChange={(e) => set("chapter_display", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fs}>
                  <option value="button">Boutons (liste)</option>
                  <option value="image">Images (vignettes)</option>
                </select>
              </div>
              <div className="space-y-3">
                {(form.chapters || []).map((ch, i) => (
                  <div key={i} className="p-3 border space-y-2" style={fs} data-testid={`editor-chapter-${i}`}>
                    <div className="flex gap-2 items-center">
                      <input value={ch.title} onChange={(e) => updCh(i, "title", e.target.value)} placeholder={`Titre chapitre ${i + 1}`} className="flex-1 px-2 py-1.5 border outline-none text-sm" style={fs} />
                      <label className="p-2 border cursor-pointer" style={fs} title="Image">
                        <IoImageOutline style={{ color: ch.image ? "var(--brand)" : "var(--text-secondary)" }} />
                        <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], (d) => updCh(i, "image", d), 4)} />
                      </label>
                      <button onClick={() => delCh(i)} style={{ color: "var(--brand)" }} data-testid={`editor-chapter-delete-${i}`}><IoTrashOutline /></button>
                    </div>
                    <RichTextEditor value={ch.rich ? (ch.content || "") : (ch.content ? ch.content.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("") : "")}
                      onChange={(html) => setForm((f) => ({ ...f, chapters: f.chapters.map((c, x) => (x === i ? { ...c, content: html, rich: true } : c)) }))} />
                    {/* per-chapter music */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <label className="flex items-center gap-2 px-3 py-1.5 border cursor-pointer text-xs" style={fs} data-testid={`editor-chapter-music-${i}`}>
                        <IoMusicalNotes style={{ color: (chapterFiles[i] || ch.has_music) ? "var(--brand)" : "var(--text-secondary)" }} />
                        {chapterFiles[i]?.name || (ch.has_music ? "Musique du chapitre — remplacer" : "Musique de ce chapitre (max 12 Mo)")}
                        <input type="file" accept="audio/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setChapterFiles((cf) => ({ ...cf, [i]: f })); }} />
                      </label>
                      {(ch.has_music || chapterFiles[i]) && <button onClick={() => removeChapterMusic(i)} className="text-xs" style={{ color: "var(--brand)" }} data-testid={`editor-chapter-music-remove-${i}`}><IoTrashOutline /></button>}
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Astuce : sans musique propre, ce chapitre reprend la musique de lecture générale de l'œuvre.</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {form.launch_type === "episodes" && (
            <div>
              <div className="flex items-center justify-between mb-2"><Label>Épisodes</Label>
                <button onClick={addEp} data-testid="editor-add-episode" className="flex items-center gap-1 text-xs px-2 py-1" style={{ color: "var(--brand)" }}><IoAddOutline /> Ajouter</button></div>
              <div className="space-y-2">
                {(form.episodes || []).map((ep, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={ep.title} onChange={(e) => updEp(i, "title", e.target.value)} placeholder="Titre" className="flex-1 px-2 py-1.5 border outline-none text-sm" style={fs} />
                    <input value={ep.url} onChange={(e) => updEp(i, "url", e.target.value)} placeholder="URL" className="flex-1 px-2 py-1.5 border outline-none text-sm" style={fs} />
                    <button onClick={() => delEp(i)} style={{ color: "var(--brand)" }}><IoTrashOutline /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div><Label>Lien d'achat (optionnel)</Label><input data-testid="editor-buy-url" value={form.buy_url} onChange={(e) => set("buy_url", e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border outline-none" style={fs} /></div>

          <div><Label>Musique d'ambiance de la fiche (max 12 Mo)</Label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 border cursor-pointer text-sm" style={fs} data-testid="editor-audio-upload">
                <IoMusicalNotes style={{ color: "var(--brand)" }} />
                {audioFile ? audioFile.name : (form.has_audio ? "Ambiance présente — remplacer" : "Choisir un fichier")}
                <input type="file" accept="audio/*" hidden onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              </label>
              {isEdit && form.has_audio && <button onClick={removeAudio} className="text-sm" style={{ color: "var(--brand)" }} data-testid="editor-audio-remove"><IoTrashOutline /></button>}
            </div>
          </div>

          <div><Label>Musique de lecture (chapitres) — coupe l'ambiance pendant la lecture</Label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 border cursor-pointer text-sm" style={fs} data-testid="editor-reading-upload">
                <IoBookOutline style={{ color: "var(--brand)" }} />
                {readingFile ? readingFile.name : (form.has_reading_audio ? "Musique de lecture présente — remplacer" : "Choisir un fichier")}
                <input type="file" accept="audio/*" hidden onChange={(e) => setReadingFile(e.target.files?.[0] || null)} />
              </label>
              {isEdit && form.has_reading_audio && <button onClick={removeReading} className="text-sm" style={{ color: "var(--brand)" }} data-testid="editor-reading-remove"><IoTrashOutline /></button>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-primary)" }}>
              <input type="checkbox" data-testid="editor-coming-soon" checked={form.coming_soon} onChange={(e) => set("coming_soon", e.target.checked)} /> À venir
            </label>
            <div className="flex items-center gap-2"><Label>Ordre</Label>
              <input data-testid="editor-order" type="number" value={form.order} onChange={(e) => set("order", e.target.value)} className="w-20 px-2 py-1 border outline-none" style={fs} /></div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t" style={{ borderColor: "var(--border-c)" }}>
          <button onClick={onClose} className="px-4 py-2 border text-sm" style={{ ...fs, color: "var(--text-secondary)" }}>Annuler</button>
          <button data-testid="editor-save" onClick={save} disabled={saving} className="px-5 py-2 font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
