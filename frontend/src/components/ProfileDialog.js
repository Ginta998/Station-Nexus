import { useEffect, useRef, useState } from "react";
import { IoClose, IoCloudUploadOutline, IoPersonCircle, IoTrashOutline, IoLogOutOutline, IoCloudDoneOutline, IoSyncOutline, IoLogInOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };
const Label = ({ children }) => <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-secondary)" }}>{children}</label>;

export default function ProfileDialog({ open, onClose }) {
  const { profile, saveProfile, clearProfile, sfx } = useApp();
  const { user, openAuth } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [instagram, setInstagram] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) { setName(profile?.name || user?.name || ""); setAvatar(profile?.avatar || user?.avatar || ""); setInstagram(profile?.instagram || ""); }
  }, [open]); // eslint-disable-line

  if (!open) return null;
  const isEdit = !!profile;

  const onFile = (f) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return toast.error("Image trop lourde (max 2 Mo)");
    const r = new FileReader(); r.onload = () => setAvatar(r.result); r.readAsDataURL(f);
  };

  const save = () => {
    if (!name.trim()) return toast.error("Choisis un nom de profil");
    saveProfile({ name: name.trim(), avatar, email: profile?.email || "", instagram: instagram.trim() });
    sfx && sfx("select");
    toast.success("Profil enregistré");
    onClose();
  };

  const remove = () => {
    clearProfile();
    toast.success("Profil supprimé");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} data-testid="profile-dialog" onClick={onClose}>
      <div className="w-full max-w-md border" style={{ ...fs, background: "var(--bg-secondary)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border-c)" }}>
          <h2 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>{isEdit ? "Mon profil" : "Créer mon profil"}</h2>
          <button data-testid="profile-close" onClick={onClose} className="p-1" style={{ color: "var(--text-secondary)" }}><IoClose size={22} /></button>
        </div>

        <div className="p-5 space-y-4">
          {user ? (
            <div data-testid="profile-sync-ok" className="flex items-start gap-2.5 px-3 py-2.5 border" style={{ borderColor: "var(--brand)", borderRadius: "var(--radius-base)", background: "color-mix(in srgb, var(--brand) 12%, transparent)" }}>
              <IoCloudDoneOutline size={20} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                Profil synchronisé sur ton compte <span style={{ color: "var(--brand)", fontWeight: 600 }}>{user.name || user.email}</span>. Il te suit sur tous tes appareils et tu seras prévenu·e des nouveautés par email. 🐰
              </p>
            </div>
          ) : (
            <div data-testid="profile-sync-cta" className="px-3 py-3 border" style={{ borderColor: "var(--brand)", borderRadius: "var(--radius-base)", background: "color-mix(in srgb, var(--brand) 10%, transparent)" }}>
              <div className="flex items-start gap-2.5 mb-2.5">
                <IoSyncOutline size={20} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                  Ce profil est enregistré <span style={{ fontWeight: 600 }}>uniquement sur cet appareil</span>. Crée un compte gratuit pour retrouver ton profil et tes favoris sur ton téléphone, ta tablette et ton PC.
                </p>
              </div>
              <button data-testid="profile-create-account" onClick={() => { sfx && sfx("select"); onClose(); openAuth(); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 font-semibold text-sm transition-transform hover:scale-[1.02]"
                style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
                <IoLogInOutline size={18} /> {isEdit ? "Synchroniser ce profil (créer un compte)" : "Créer un compte pour synchroniser"}
              </button>
            </div>
          )}
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => fileRef.current?.click()} data-testid="profile-avatar-upload"
              className="w-28 h-28 rounded-full overflow-hidden border-2 flex items-center justify-center"
              style={{ borderColor: "var(--brand)", background: "var(--bg-primary)" }}>
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : <IoPersonCircle size={72} style={{ color: "var(--text-secondary)" }} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <div className="flex items-center gap-3">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border" style={fs} data-testid="profile-photo-btn">
                <IoCloudUploadOutline /> {avatar ? "Changer la photo" : "Ajouter une photo"}
              </button>
              {avatar && <button onClick={() => setAvatar("")} className="text-xs" style={{ color: "var(--brand)" }} data-testid="profile-photo-remove"><IoTrashOutline /></button>}
            </div>
          </div>

          <div><Label>Nom du profil</Label>
            <input data-testid="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="Ton pseudo" className="w-full px-3 py-2 border outline-none" style={fs} /></div>

          <div><Label>Instagram (optionnel)</Label>
            <input data-testid="profile-instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@ton_pseudo" className="w-full px-3 py-2 border outline-none" style={fs} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-5 border-t" style={{ borderColor: "var(--border-c)" }}>
          {isEdit ? (
            <button onClick={remove} className="flex items-center gap-1.5 text-sm" style={{ color: "var(--brand)" }} data-testid="profile-delete"><IoLogOutOutline /> Supprimer</button>
          ) : <span />}
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border text-sm" style={{ ...fs, color: "var(--text-secondary)" }}>Annuler</button>
            <button data-testid="profile-save" onClick={save} className="px-5 py-2 font-semibold text-sm transition-transform hover:scale-105"
              style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
