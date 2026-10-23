import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoArrowBack, IoHome, IoCreateOutline, IoSaveOutline, IoCloseOutline, IoPlanetOutline, IoSparkles, IoBookOutline, IoFilmOutline, IoHeartOutline, IoCloudUploadOutline } from "react-icons/io5";
import { getAboutPage, getSettings, updateSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import QuickControls from "@/components/QuickControls";
import MobileMenu from "@/components/MobileMenu";

const PILLAR_ICONS = [IoBookOutline, IoFilmOutline, IoHeartOutline];

export default function About() {
  const nav = useNavigate();
  const { isAdmin, sfx } = useApp();
  const { data, refetch } = useQuery({ queryKey: ["about"], queryFn: getAboutPage });
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(null);
  const heroRef = useRef(null);
  const creatorRef = useRef(null);

  useEffect(() => {
    if (edit && data) setDraft({ title: data.title, body: data.body, creator_title: data.creator_title, creator_name: data.creator_name, creator_body: data.creator_body, hero_image: data.hero_image, creator_image: data.creator_image, pillars: JSON.parse(JSON.stringify(data.pillars || [])) });
  }, [edit, data]);

  const btn = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", background: "var(--bg-secondary)" };
  const primary = { background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" };
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const setPillar = (i, k, v) => setDraft((d) => ({ ...d, pillars: d.pillars.map((p, x) => x === i ? { ...p, [k]: v } : p) }));

  const onImage = (key, file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error("Image trop lourde (max 3 Mo)");
    const r = new FileReader(); r.onload = () => set(key, r.result); r.readAsDataURL(file);
  };

  const save = async () => {
    const s = await getSettings();
    await updateSettings({ ...s, about_title: draft.title, about_body: draft.body, creator_title: draft.creator_title, creator_name: draft.creator_name, creator_body: draft.creator_body, about_hero_image: draft.hero_image, creator_image: draft.creator_image, about_pillars: (draft.pillars || []).map((p) => ({ title: p.title || "", text: p.text || "" })) });
    toast.success("Page À propos mise à jour"); setEdit(false); refetch();
  };

  const view = edit && draft ? draft : data;
  const pillars = (view?.pillars || []);

  return (
    <div className="min-h-screen pb-16" style={{ background: "transparent", color: "var(--text-primary)" }} data-testid="about-page">
      {/* Top bar */}
      <div className="sx-safe-top absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-2 px-5 md:px-12 pt-6">
        <div className="flex items-center gap-2">
          <button data-testid="about-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2 backdrop-blur-md" style={{ ...btn, background: "rgba(0,0,0,0.45)" }}><IoArrowBack /> <span className="text-sm hidden sm:inline">Retour</span></button>
          <button data-testid="about-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2 backdrop-blur-md" style={{ ...btn, background: "rgba(0,0,0,0.45)" }}><IoHome size={16} /></button>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (edit ? (
            <>
              <button data-testid="about-save" onClick={save} className="flex items-center gap-2 px-4 py-2 font-semibold" style={primary}><IoSaveOutline /> Enregistrer</button>
              <button data-testid="about-cancel" onClick={() => setEdit(false)} className="px-3 py-2 backdrop-blur-md" style={{ ...btn, background: "rgba(0,0,0,0.45)" }}><IoCloseOutline /></button>
            </>
          ) : (
            <button data-testid="about-edit" onClick={() => setEdit(true)} className="flex items-center gap-2 px-3 py-2 backdrop-blur-md" style={{ ...btn, background: "rgba(0,0,0,0.45)" }}><IoCreateOutline /> <span className="text-sm hidden sm:inline">Modifier</span></button>
          ))}
          <MobileMenu />
          <QuickControls />
        </div>
      </div>

      {/* Hero with cosmic image */}
      <div className="relative h-[62vh] min-h-[420px] flex items-end overflow-hidden">
        <img src={view?.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-primary) 4%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.55))" }} />
        {edit && (
          <>
            <input ref={heroRef} type="file" accept="image/*" hidden onChange={(e) => onImage("hero_image", e.target.files?.[0])} />
            <button data-testid="about-hero-upload" onClick={() => heroRef.current?.click()} className="absolute top-24 right-5 md:right-12 flex items-center gap-2 px-3 py-2 backdrop-blur-md z-10" style={{ ...btn, background: "rgba(0,0,0,0.6)" }}><IoCloudUploadOutline /> <span className="text-sm">Changer l'image de fond</span></button>
          </>
        )}
        <div className="relative max-w-4xl mx-auto w-full px-5 md:px-12 pb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0" style={{ background: "color-mix(in srgb, var(--brand) 22%, transparent)", borderRadius: "50%", border: "1.5px solid var(--brand)" }}>
              <IoPlanetOutline size={30} style={{ color: "var(--brand)" }} />
            </div>
            <span className="text-xs uppercase tracking-[0.35em]" style={{ color: "var(--brand)" }}>Station Nexus</span>
          </div>
          {edit ? (
            <input data-testid="about-title-input" value={draft?.title || ""} onChange={(e) => set("title", e.target.value)} className="w-full font-display text-4xl md:text-6xl px-3 py-2 border outline-none" style={btn} />
          ) : (
            <h1 className="font-display text-4xl md:text-6xl leading-tight" style={{ textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}>{data?.title}</h1>
          )}
        </div>
      </div>

      {/* Vision */}
      <div className="max-w-4xl mx-auto px-5 md:px-12 mt-10">
        {edit ? (
          <textarea data-testid="about-body-input" rows={8} value={draft?.body || ""} onChange={(e) => set("body", e.target.value)} className="w-full px-3 py-2 border outline-none resize-none" style={btn} />
        ) : (
          <div className="space-y-4 text-lg md:text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {(data?.body || "").split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}

        {/* Pillars */}
        <div className="grid sm:grid-cols-3 gap-5 mt-12" data-testid="about-pillars">
          {pillars.map((p, i) => {
            const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
            return (
              <div key={i} data-testid={`about-pillar-${i}`} className="p-6" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)" }}>
                <Icon size={26} style={{ color: "var(--brand)" }} />
                {edit ? (
                  <>
                    <input data-testid={`about-pillar-title-${i}`} value={p.title || ""} onChange={(e) => setPillar(i, "title", e.target.value)} className="w-full font-display text-lg mt-3 mb-2 px-2 py-1 border outline-none" style={btn} placeholder="Titre" />
                    <textarea data-testid={`about-pillar-text-${i}`} rows={3} value={p.text || ""} onChange={(e) => setPillar(i, "text", e.target.value)} className="w-full text-sm px-2 py-1 border outline-none resize-none" style={btn} placeholder="Texte" />
                  </>
                ) : (
                  <>
                    <p className="font-display text-lg mt-3 mb-1">{p.title}</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{p.text}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Creator */}
        <div className="mt-14 grid md:grid-cols-[280px_1fr] gap-8 items-center p-6 md:p-8" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 12%, var(--bg-secondary)), var(--bg-secondary))", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)" }} data-testid="about-creator">
          <div className="relative aspect-[3/4] overflow-hidden mx-auto w-full max-w-[280px]" style={{ borderRadius: "var(--radius-base)", border: "1px solid var(--brand)" }}>
            <img src={view?.creator_image} alt="Le créateur" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)" }} />
            {edit && (
              <>
                <input ref={creatorRef} type="file" accept="image/*" hidden onChange={(e) => onImage("creator_image", e.target.files?.[0])} />
                <button data-testid="about-creator-upload" onClick={() => creatorRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer" style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}><IoCloudUploadOutline size={30} /> <span className="text-sm">Changer la photo</span></button>
              </>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] mb-2 flex items-center gap-2" style={{ color: "var(--brand)" }}><IoSparkles /> {edit ? <input value={draft?.creator_title || ""} onChange={(e) => set("creator_title", e.target.value)} className="px-2 py-1 border outline-none" style={btn} /> : data?.creator_title}</p>
            {edit ? (
              <input data-testid="creator-name-input" value={draft?.creator_name || ""} onChange={(e) => set("creator_name", e.target.value)} className="w-full font-display text-2xl md:text-3xl mb-3 px-3 py-2 border outline-none" style={btn} />
            ) : (
              <h2 className="font-display text-2xl md:text-3xl mb-3">{data?.creator_name}</h2>
            )}
            {edit ? (
              <textarea data-testid="creator-body-input" rows={7} value={draft?.creator_body || ""} onChange={(e) => set("creator_body", e.target.value)} className="w-full px-3 py-2 border outline-none resize-none" style={btn} />
            ) : (
              <div className="space-y-3 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {(data?.creator_body || "").split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button data-testid="about-support-cta" onClick={() => { sfx("select"); nav("/soutien"); }} className="sx-support-cta inline-flex items-center gap-2.5 px-7 py-3.5 font-semibold" style={{ border: "2px solid var(--brand)", color: "var(--brand)", borderRadius: "999px", background: "transparent" }}>
            <IoHeartOutline size={18} /> Faire partie de l'aventure
          </button>
        </div>
      </div>
    </div>
  );
}
