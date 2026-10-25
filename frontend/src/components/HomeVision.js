import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IoArrowForward, IoCreateOutline, IoCheckmark, IoClose } from "react-icons/io5";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";

// Section « Vision » de l'accueil, texte éditable par l'admin, mène à la page À propos
export default function HomeVision() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { isAdmin, sfx } = useApp();
  const { data: s } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [edit, setEdit] = useState(null);
  if (!s) return null;
  const title = s.home_vision_title || "La vision de la station";
  const text = s.home_vision_text || "";

  const save = async () => {
    try {
      await updateSettings({ ...s, home_vision_title: edit.title, home_vision_text: edit.text });
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Section Vision enregistrée");
      setEdit(null);
    } catch { toast.error("Enregistrement impossible"); }
  };

  return (
    <section className="sx-vision" data-testid="home-vision">
      <div className="seclabel"><div className="lt"><h2>Vision</h2><span className="kj">志</span></div>
        {isAdmin && !edit && <span className="all mono" data-testid="home-vision-edit" onClick={() => setEdit({ title, text })}><IoCreateOutline size={12} /> MODIFIER</span>}
      </div>
      <div className="vz-card">
        <span className="vz-k" aria-hidden="true">天</span>
        <div className="vz-eyebrow mono">// STATION NEXUS · MANIFESTE</div>
        {edit ? (
          <div className="vz-edit">
            <input data-testid="home-vision-title-input" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Titre" />
            <textarea data-testid="home-vision-text-input" rows={6} value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} placeholder="Ta vision de la station… (ligne vide = nouveau paragraphe)" />
            <div className="vz-actions">
              <button data-testid="home-vision-save" onClick={save}><IoCheckmark size={15} /> Enregistrer</button>
              <button data-testid="home-vision-cancel" className="ghost" onClick={() => setEdit(null)}><IoClose size={15} /> Annuler</button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="vz-title" data-testid="home-vision-title">{title}</h3>
            <div className="vz-text" data-testid="home-vision-text">{text.split(/\n{2,}/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div>
          </>
        )}
        <span className="vz-cta" data-testid="home-vision-about" onClick={() => { sfx("select"); nav("/a-propos"); }}>Découvrir la station <IoArrowForward size={15} /></span>
      </div>
    </section>
  );
}
