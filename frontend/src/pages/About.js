import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoArrowBack, IoHome, IoCreateOutline, IoSaveOutline, IoCloseOutline, IoPlanetOutline } from "react-icons/io5";
import { getAboutPage, getSettings, updateSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import QuickControls from "@/components/QuickControls";

export default function About() {
  const nav = useNavigate();
  const { isAdmin, sfx } = useApp();
  const { data, refetch } = useQuery({ queryKey: ["about"], queryFn: getAboutPage });
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(null);

  useEffect(() => { if (edit && data) setDraft({ title: data.title, body: data.body }); }, [edit, data]);

  const btn = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", background: "var(--bg-secondary)" };
  const primary = { background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" };

  const save = async () => {
    const s = await getSettings();
    await updateSettings({ ...s, about_title: draft.title, about_body: draft.body });
    toast.success("Page À propos mise à jour"); setEdit(false); refetch();
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} data-testid="about-page">
      <div className="sx-safe-top flex items-center justify-between gap-2 px-5 md:px-12 pt-6">
        <div className="flex items-center gap-2">
          <button data-testid="about-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoArrowBack /> <span className="text-sm hidden sm:inline">Retour</span></button>
          <button data-testid="about-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoHome size={16} /></button>
        </div>
        <QuickControls />
      </div>

      <div className="max-w-3xl mx-auto px-5 md:px-12 py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="w-14 h-14 flex items-center justify-center flex-shrink-0" style={{ background: "color-mix(in srgb, var(--brand) 16%, transparent)", borderRadius: "var(--radius-base)" }}>
            <IoPlanetOutline size={30} style={{ color: "var(--brand)" }} />
          </div>
          {isAdmin && (edit ? (
            <div className="flex gap-2">
              <button data-testid="about-save" onClick={save} className="flex items-center gap-2 px-4 py-2 font-semibold" style={primary}><IoSaveOutline /> Enregistrer</button>
              <button data-testid="about-cancel" onClick={() => setEdit(false)} className="px-3 py-2" style={btn}><IoCloseOutline /></button>
            </div>
          ) : (
            <button data-testid="about-edit" onClick={() => setEdit(true)} className="flex items-center gap-2 px-4 py-2" style={btn}><IoCreateOutline /> <span className="text-sm">Modifier</span></button>
          ))}
        </div>

        {edit ? (
          <>
            <input data-testid="about-title-input" value={draft?.title || ""} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="w-full font-display text-3xl md:text-4xl mb-4 px-3 py-2 border outline-none" style={btn} />
            <textarea data-testid="about-body-input" rows={12} value={draft?.body || ""} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} className="w-full px-3 py-2 border outline-none resize-none" style={btn} />
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl md:text-5xl mb-6">{data?.title}</h1>
            <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {(data?.body || "").split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
