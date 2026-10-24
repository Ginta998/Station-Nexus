import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IoArrowBack, IoSaveOutline } from "react-icons/io5";
import { toast } from "sonner";
import { getJournalEntry, createJournalEntry, updateJournalEntry, listJournalCategories, listCreations, mediaUrl,
  createJournalCategory, updateJournalCategory, deleteJournalCategory } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { BlocksEditor, ImagePick } from "@/components/journal/BlocksEditor";

const today = () => new Date().toISOString().slice(0, 10);
const blank = { title: "", subtitle: "", category_id: "", creation_id: "", date: today(), cover: "", blocks: [{ type: "text", _k: "t0" }], show_home: false, published: true };

function CategoryManager({ cats, refetch }) {
  const [name, setName] = useState(""); const [color, setColor] = useState("#3f86ff");
  const add = async () => { if (!name.trim()) return; await createJournalCategory({ name, color, order: cats.length }); setName(""); refetch(); toast.success("Catégorie ajoutée"); };
  return (
    <div className="jr-catman" data-testid="journal-cat-manager">
      {cats.map((c) => (
        <div key={c.id} className="row">
          <input type="color" value={c.color} onChange={(e) => updateJournalCategory(c.id, { ...c, color: e.target.value }).then(refetch)} />
          <input className="jr-in" defaultValue={c.name} onBlur={(e) => e.target.value.trim() && e.target.value !== c.name && updateJournalCategory(c.id, { ...c, name: e.target.value }).then(refetch)} data-testid={`journal-cat-name-${c.id}`} />
          <button onClick={() => window.confirm(`Supprimer « ${c.name} » ?`) && deleteJournalCategory(c.id).then(refetch)} aria-label="Supprimer">×</button>
        </div>
      ))}
      <div className="row"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} /><input className="jr-in" placeholder="Nouvelle catégorie" value={name} onChange={(e) => setName(e.target.value)} data-testid="journal-cat-new" /><button onClick={add} data-testid="journal-cat-add">+</button></div>
    </div>
  );
}

export default function JournalEditor() {
  const { id } = useParams();
  const nav = useNavigate(); const qc = useQueryClient();
  const { sfx, isAdmin } = useApp();
  const [f, setF] = useState(blank); const [saving, setSaving] = useState(false); const [showCats, setShowCats] = useState(false);
  const { data: entry } = useQuery({ queryKey: ["journal-entry", id], queryFn: () => getJournalEntry(id), enabled: !!id });
  const { data: cats = [], refetch: refetchCats } = useQuery({ queryKey: ["journal-cats"], queryFn: listJournalCategories });
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  useEffect(() => { if (entry) setF({ ...blank, ...entry, blocks: (entry.blocks || []).map((b, i) => ({ ...b, _k: `b${i}` })) }); }, [entry]);
  const set = (p) => setF((o) => ({ ...o, ...p }));

  if (!isAdmin) return <div className="min-h-screen grid place-items-center jr-page"><p className="jr-empty">Réservé à l'administrateur.</p></div>;

  const save = async () => {
    if (!f.title.trim()) return toast.error("Donne un titre à l'entrée");
    setSaving(true);
    try {
      const payload = { ...f, blocks: f.blocks.map(({ _k, ...b }) => b) };
      ["id", "created_at", "updated_at"].forEach((k) => delete payload[k]);
      const r = id ? await updateJournalEntry(id, payload) : await createJournalEntry(payload);
      qc.invalidateQueries({ queryKey: ["journal"] }); qc.invalidateQueries({ queryKey: ["journal-entry", r.id] });
      toast.success(id ? "Entrée mise à jour" : f.published ? "Entrée publiée — les abonnés sont notifiés" : "Brouillon enregistré");
      sfx("select"); nav(`/journal/${r.id}`);
    } catch (e) { toast.error(e?.response?.data?.detail || "Enregistrement impossible"); }
    setSaving(false);
  };

  return (
    <div className="relative min-h-screen w-full jr-page" data-testid="journal-editor">
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <div className="flex items-center justify-between gap-2 mb-8">
          <button onClick={() => { sfx("back"); nav(id ? `/journal/${id}` : "/journal"); }} className="jr-btn" aria-label="Retour" data-testid="journal-editor-back"><IoArrowBack /></button>
          <button onClick={save} disabled={saving} className="jr-btn jr-btn-brand" data-testid="journal-save"><IoSaveOutline /> {saving ? "Enregistrement…" : id ? "Enregistrer" : "Publier"}</button>
        </div>
        <p className="mono jr-k mb-3">{id ? "MODIFIER L'ENTRÉE" : "NOUVELLE ENTRÉE"}</p>

        <div className="jr-cover-edit" style={f.cover ? { backgroundImage: `url(${mediaUrl(f.cover)})` } : undefined}>
          <ImagePick label={f.cover ? "Changer la couverture" : "Ajouter une image de couverture"} onDone={([u]) => set({ cover: u })} testid="journal-cover-pick" />
          {f.cover && <button className="jr-pick" onClick={() => set({ cover: "" })}>Retirer</button>}
        </div>

        <input className="jr-in jr-in-title font-display" placeholder="Titre de l'entrée" value={f.title} onChange={(e) => set({ title: e.target.value })} data-testid="journal-title-input" />
        <input className="jr-in" placeholder="Sous-titre / chapeau (facultatif)" value={f.subtitle} onChange={(e) => set({ subtitle: e.target.value })} data-testid="journal-subtitle-input" />

        <div className="jr-opts">
          <label>Date<input type="date" className="jr-in" value={f.date} onChange={(e) => set({ date: e.target.value })} data-testid="journal-date-input" /></label>
          <label>Catégorie
            <div className="flex gap-2"><select className="jr-in" value={f.category_id} onChange={(e) => set({ category_id: e.target.value })} data-testid="journal-category-select">
              <option value="">Sans catégorie</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select><button className="jr-pick" onClick={() => setShowCats((v) => !v)} data-testid="journal-cat-toggle">Gérer</button></div>
          </label>
          <label>Création associée
            <select className="jr-in" value={f.creation_id} onChange={(e) => set({ creation_id: e.target.value })} data-testid="journal-creation-select">
              <option value="">Aucune</option>{creations.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
        </div>
        {showCats && <CategoryManager cats={cats} refetch={refetchCats} />}
        <div className="jr-toggles">
          <label className="jr-check"><input type="checkbox" checked={f.show_home} onChange={(e) => set({ show_home: e.target.checked })} data-testid="journal-home-toggle" /> Afficher sur l'accueil</label>
          <label className="jr-check"><input type="checkbox" checked={f.published} onChange={(e) => set({ published: e.target.checked })} data-testid="journal-published-toggle" /> Publiée (sinon brouillon)</label>
        </div>
        {f.creation_id && <p className="jr-hint">Elle apparaîtra aussi sur la fiche de la création.</p>}

        <BlocksEditor blocks={f.blocks} onChange={(blocks) => set({ blocks })} />
      </div>
    </div>
  );
}
