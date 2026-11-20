import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCreationFull, updateCreation } from "@/lib/api";
import PageWriter from "@/components/PageWriter";

/*
  Modifier un chapitre (ou un épisode) sans quitter le monde : depuis la lecture (bouton « Modifier »)
  ou depuis la liste des chapitres (crayon, « + Nouveau chapitre »). On charge la création complète,
  on change seulement ce chapitre, on enregistre tout le reste tel quel.
  index = null : nouveau chapitre ajouté à la fin.
*/
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const toHtml = (u) => (u?.rich ? u.content || "" : String(u?.content || "").split(/\n{2,}/).filter((p) => p.trim()).map((p) => `<p>${esc(p).replace(/\n/g, "<br/>")}</p>`).join(""));

export default function ChapterQuickEdit({ creationId, unitKey = "chapters", index, onClose, onSaved }) {
  const word = unitKey === "episodes" ? "Épisode" : "Chapitre";
  const [full, setFull] = useState(null);
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const isNew = index == null;

  useEffect(() => {
    let on = true;
    getCreationFull(creationId).then((c) => {
      if (!on) return;
      setFull(c);
      const u = isNew ? null : (c[unitKey] || [])[index];
      setTitle(u?.title || ""); setHtml(toHtml(u));
    }).catch(() => { toast.error("Impossible de charger la création"); onClose(); });
    return () => { on = false; };
  }, [creationId, unitKey, index]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!full || saving) return;
    setSaving(true);
    try {
      const units = [...(full[unitKey] || [])];
      const base = isNew ? { title: "", content: "", description: "", image: "", rich: true, has_music: false } : units[index];
      const unit = { ...base, title: title.trim(), content: html, rich: true };
      if (isNew) units.push(unit); else units[index] = unit;
      await updateCreation(creationId, { ...full, [unitKey]: units }, true);
      toast.success(isNew ? `${word} ajouté` : `${word} enregistré`);
      onSaved?.(isNew ? units.length - 1 : index);
      onClose();
    } catch (_) { toast.error("Enregistrement impossible (reconnecte-toi en admin)"); }
    setSaving(false);
  };

  if (!full) return null;
  return (
    <PageWriter kicker={`${full.title} · ${isNew ? `Nouveau ${word.toLowerCase()}` : `${word} ${index + 1}`}`}
      title={title} onTitle={setTitle} html={html} onHtml={setHtml}
      image={!isNew ? (full[unitKey] || [])[index]?.image : null}
      creationId={creationId} onClose={onClose} onSave={save} saving={saving} saveLabel="Enregistrer"
      note="« Retour » abandonne les changements ; « Enregistrer » les publie tout de suite." />
  );
}

// Supprimer un chapitre : même principe (la création complète, moins ce chapitre)
export async function deleteUnit(creationId, unitKey, index) {
  const c = await getCreationFull(creationId);
  const units = (c[unitKey] || []).filter((_, i) => i !== index);
  await updateCreation(creationId, { ...c, [unitKey]: units }, true);
}
