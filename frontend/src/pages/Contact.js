import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoMail, IoLogoInstagram, IoLogoYoutube, IoCreateOutline, IoSaveOutline, IoCloudUploadOutline, IoNotifications } from "react-icons/io5";
import { toast } from "sonner";
import { getSettings, updateSettings, addSubscriber } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import MobileMenu from "@/components/MobileMenu";

const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };

export default function Contact() {
  const nav = useNavigate();
  const { isAdmin, sfx } = useApp();
  const { data, refetch } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => { if (data) setForm(data); }, [data]);
  const s = edit && form ? form : data;
  if (!s) return <div className="h-screen flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>Chargement…</div>;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => { await updateSettings(form); toast.success("Profil mis à jour"); setEdit(false); refetch(); };
  const onAvatar = (file) => { if (!file || file.size > 3 * 1024 * 1024) return toast.error("Image trop lourde (max 3 Mo)"); const r = new FileReader(); r.onload = () => set("avatar", r.result); r.readAsDataURL(file); };

  const subscribe = async () => {
    if (!email.trim()) return;
    try { await addSubscriber(email.trim()); toast.success("Inscription réussie — tu ne rateras rien !"); setEmail(""); sfx("select"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Email invalide"); }
  };

  const igUrl = `https://instagram.com/${(s.instagram || "").replace(/^@/, "")}`;
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(s.youtube || "")}`;

  const social = (label, value, url, Icon) => (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={() => sfx("nav")} data-testid={`social-${label}`}
      className="flex items-center gap-3 p-4 border transition-transform hover:scale-[1.02]" style={{ ...fs, background: "var(--bg-secondary)" }}>
      <Icon size={24} style={{ color: "var(--brand)" }} />
      <div><p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</p><p className="text-sm" style={{ color: "var(--text-primary)" }}>{value}</p></div>
    </a>
  );

  return (
    <div className="relative min-h-screen w-full" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button data-testid="contact-back" onClick={() => { sfx("back"); nav("/"); }} className="flex items-center gap-2 px-3 py-2 border" style={fs}><IoArrowBack /> <span className="text-sm">Retour</span></button>
          <div className="flex items-center gap-2">
          {isAdmin && (edit ? (
            <button data-testid="contact-save" onClick={save} className="flex items-center gap-1.5 px-4 py-2 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}><IoSaveOutline /> Enregistrer</button>
          ) : (
            <button data-testid="contact-edit" onClick={() => { setForm(data); setEdit(true); }} className="flex items-center gap-1.5 px-4 py-2 border" style={fs}><IoCreateOutline /> Modifier</button>
          ))}
          <MobileMenu />
          </div>
        </div>

        <div className="flex flex-col items-center text-center mb-10 fade-up">
          <div className="w-28 h-28 rounded-full overflow-hidden border mb-4 flex items-center justify-center relative" style={{ borderColor: "var(--brand)", background: "var(--bg-secondary)" }}>
            {s.avatar ? <img src={s.avatar} alt="" className="w-full h-full object-cover" /> : <span className="font-display text-4xl" style={{ color: "var(--brand)" }}>天</span>}
            {edit && <label className="absolute inset-0 flex items-center justify-center cursor-pointer" style={{ background: "rgba(0,0,0,0.5)" }}><IoCloudUploadOutline size={24} style={{ color: "#fff" }} /><input type="file" accept="image/*" hidden onChange={(e) => onAvatar(e.target.files?.[0])} /></label>}
          </div>
          {edit ? (
            <>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className="text-center font-display text-3xl px-3 py-1 border mb-3 w-full" style={fs} data-testid="edit-name" />
              <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} className="w-full text-center px-3 py-2 border resize-none" style={fs} data-testid="edit-bio" />
            </>
          ) : (
            <>
              <h1 className="font-display text-4xl md:text-5xl" style={{ color: "var(--text-primary)" }} data-testid="contact-name">{s.name}</h1>
              <p className="mt-3 max-w-md leading-relaxed" style={{ color: "var(--text-secondary)" }} data-testid="contact-bio">{s.bio}</p>
            </>
          )}
        </div>

        {edit ? (
          <div className="space-y-3 mb-10">
            <div><label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Mail</label><input value={form.mail} onChange={(e) => set("mail", e.target.value)} className="w-full px-3 py-2 border" style={fs} data-testid="edit-mail" /></div>
            <div><label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Instagram</label><input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className="w-full px-3 py-2 border" style={fs} data-testid="edit-instagram" /></div>
            <div><label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>YouTube</label><input value={form.youtube} onChange={(e) => set("youtube", e.target.value)} className="w-full px-3 py-2 border" style={fs} data-testid="edit-youtube" /></div>
          </div>
        ) : (
          <div className="grid gap-3 mb-12">
            {social("Mail", s.mail, `mailto:${s.mail}`, IoMail)}
            {social("Instagram", "@" + (s.instagram || "").replace(/^@/, ""), igUrl, IoLogoInstagram)}
            {social("YouTube", s.youtube, ytUrl, IoLogoYoutube)}
          </div>
        )}

        {/* Newsletter */}
        <div className="p-6 border" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="newsletter">
          <div className="flex items-center gap-2 mb-2"><IoNotifications style={{ color: "var(--brand)" }} /><h2 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>Ne rate rien</h2></div>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Laisse ton email pour être prévenu des nouvelles créations.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input data-testid="newsletter-email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && subscribe()} placeholder="ton@email.com" className="flex-1 px-3 py-2.5 border outline-none" style={fs} />
            <button data-testid="newsletter-submit" onClick={subscribe} className="px-5 py-2.5 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>S'abonner</button>
          </div>
        </div>
      </div>
    </div>
  );
}
