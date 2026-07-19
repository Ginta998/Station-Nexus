import { useEffect, useRef, useState } from "react";
import { IoClose, IoCloudUploadOutline, IoTrashOutline, IoAddOutline, IoMusicalNotes } from "react-icons/io5";
import { toast } from "sonner";
import { createCreation, updateCreation, uploadAudio, deleteAudio } from "@/lib/api";
import { CATEGORIES } from "@/lib/themes";

const empty = {
  title: "", kanji: "", category: "livres", tagline: "", synopsis: "",
  poster: "", accent: "", launch_type: "reader", launch_label: "Lancer",
  launch_content: "", launch_url: "", buy_url: "", episodes: [], coming_soon: false, order: 0,
};

const fieldStyle = {
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  borderColor: "var(--border-c)",
  borderRadius: "var(--radius-base)",
};

function Label({ children }) {
  return <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-secondary)" }}>{children}</label>;
}

export default function EditorDialog({ open, onClose, initial, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const posterInput = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...empty, ...initial } : empty);
      setAudioFile(null);
    }
  }, [open, initial]);

  if (!open) return null;
  const isEdit = Boolean(initial && initial.id);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onPoster = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error("Image trop lourde (max 3 Mo)");
    const reader = new FileReader();
    reader.onload = () => set("poster", reader.result);
    reader.readAsDataURL(file);
  };

  const addEpisode = () => set("episodes", [...(form.episodes || []), { title: "", description: "", url: "" }]);
  const updEpisode = (i, k, v) =>
    set("episodes", form.episodes.map((ep, idx) => (idx === i ? { ...ep, [k]: v } : ep)));
  const delEpisode = (i) => set("episodes", form.episodes.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!form.title.trim()) return toast.error("Le titre est requis");
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      let saved;
      if (isEdit) saved = await updateCreation(initial.id, payload);
      else saved = await createCreation(payload);
      if (audioFile) {
        await uploadAudio(saved.id, audioFile);
      }
      toast.success(isEdit ? "Création mise à jour" : "Création ajoutée");
      onSaved?.();
      onClose();
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const removeAudio = async () => {
    if (!isEdit) return;
    await deleteAudio(initial.id);
    set("has_audio", false);
    toast.success("Ambiance supprimée");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} data-testid="editor-dialog">
      <div className="w-full max-w-2xl my-auto border" style={{ ...fieldStyle, background: "var(--bg-secondary)" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border-c)" }}>
          <h2 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>
            {isEdit ? "Modifier la création" : "Nouvelle création"}
          </h2>
          <button data-testid="editor-close" onClick={onClose} className="p-1" style={{ color: "var(--text-secondary)" }}><IoClose size={22} /></button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-4">
            <button onClick={() => posterInput.current?.click()}
              className="flex-shrink-0 w-28 aspect-[2/3] border flex flex-col items-center justify-center overflow-hidden"
              style={fieldStyle} data-testid="editor-poster-upload">
              {form.poster ? (
                <img src={form.poster} alt="poster" className="w-full h-full object-cover" />
              ) : (
                <><IoCloudUploadOutline size={22} style={{ color: "var(--brand)" }} /><span className="text-[10px] mt-1" style={{ color: "var(--text-secondary)" }}>Poster</span></>
              )}
            </button>
            <input ref={posterInput} type="file" accept="image/*" hidden onChange={onPoster} />
            <div className="flex-1 space-y-3">
              <div><Label>Titre</Label>
                <input data-testid="editor-title" value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fieldStyle} /></div>
              <div className="flex gap-3">
                <div className="w-20"><Label>Kanji</Label>
                  <input data-testid="editor-kanji" value={form.kanji} onChange={(e) => set("kanji", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fieldStyle} /></div>
                <div className="flex-1"><Label>Catégorie</Label>
                  <select data-testid="editor-category" value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fieldStyle}>
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select></div>
              </div>
            </div>
          </div>

          <div><Label>Accroche</Label>
            <input data-testid="editor-tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fieldStyle} /></div>
          <div><Label>Synopsis</Label>
            <textarea data-testid="editor-synopsis" rows={3} value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} className="w-full px-3 py-2 border outline-none resize-none" style={fieldStyle} /></div>

          <div className="flex gap-3">
            <div className="flex-1"><Label>Type de lancement</Label>
              <select data-testid="editor-launch-type" value={form.launch_type} onChange={(e) => set("launch_type", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fieldStyle}>
                <option value="reader">Lecture (texte)</option>
                <option value="link">Lien externe (film/vidéo)</option>
                <option value="episodes">Épisodes</option>
                <option value="info">Info seulement</option>
              </select></div>
            <div className="flex-1"><Label>Libellé du bouton</Label>
              <input data-testid="editor-launch-label" value={form.launch_label} onChange={(e) => set("launch_label", e.target.value)} className="w-full px-3 py-2 border outline-none" style={fieldStyle} /></div>
          </div>

          {form.launch_type === "reader" && (
            <div><Label>Contenu à lire</Label>
              <textarea data-testid="editor-launch-content" rows={4} value={form.launch_content} onChange={(e) => set("launch_content", e.target.value)} className="w-full px-3 py-2 border outline-none resize-none" style={fieldStyle} /></div>
          )}
          {form.launch_type === "link" && (
            <div><Label>URL du film / vidéo</Label>
              <input data-testid="editor-launch-url" value={form.launch_url} onChange={(e) => set("launch_url", e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border outline-none" style={fieldStyle} /></div>
          )}
          {form.launch_type === "episodes" && (
            <div>
              <div className="flex items-center justify-between mb-2"><Label>Épisodes</Label>
                <button onClick={addEpisode} data-testid="editor-add-episode" className="flex items-center gap-1 text-xs px-2 py-1" style={{ color: "var(--brand)" }}><IoAddOutline /> Ajouter</button></div>
              <div className="space-y-2">
                {(form.episodes || []).map((ep, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={ep.title} onChange={(e) => updEpisode(i, "title", e.target.value)} placeholder="Titre" className="flex-1 px-2 py-1.5 border outline-none text-sm" style={fieldStyle} />
                    <input value={ep.url} onChange={(e) => updEpisode(i, "url", e.target.value)} placeholder="URL" className="flex-1 px-2 py-1.5 border outline-none text-sm" style={fieldStyle} />
                    <button onClick={() => delEpisode(i)} style={{ color: "var(--brand)" }}><IoTrashOutline /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div><Label>Lien d'achat (optionnel)</Label>
            <input data-testid="editor-buy-url" value={form.buy_url} onChange={(e) => set("buy_url", e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border outline-none" style={fieldStyle} /></div>

          <div>
            <Label>Musique d'ambiance (max 12 Mo)</Label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 border cursor-pointer text-sm" style={fieldStyle} data-testid="editor-audio-upload">
                <IoMusicalNotes style={{ color: "var(--brand)" }} />
                {audioFile ? audioFile.name : (form.has_audio ? "Ambiance présente — remplacer" : "Choisir un fichier")}
                <input type="file" accept="audio/*" hidden onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              </label>
              {isEdit && form.has_audio && (
                <button onClick={removeAudio} className="text-sm" style={{ color: "var(--brand)" }} data-testid="editor-audio-remove"><IoTrashOutline /></button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-primary)" }}>
              <input type="checkbox" data-testid="editor-coming-soon" checked={form.coming_soon} onChange={(e) => set("coming_soon", e.target.checked)} /> À venir
            </label>
            <div className="flex items-center gap-2">
              <Label>Ordre</Label>
              <input data-testid="editor-order" type="number" value={form.order} onChange={(e) => set("order", e.target.value)} className="w-20 px-2 py-1 border outline-none" style={fieldStyle} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t" style={{ borderColor: "var(--border-c)" }}>
          <button onClick={onClose} className="px-4 py-2 border text-sm" style={{ ...fieldStyle, color: "var(--text-secondary)" }}>Annuler</button>
          <button data-testid="editor-save" onClick={save} disabled={saving} className="px-5 py-2 font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
