import { useState } from "react";
import html2canvas from "html2canvas";
import { IoShareSocial, IoLogoWhatsapp, IoLogoFacebook, IoLink, IoDownloadOutline, IoClose, IoPaperPlaneOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

export default function ShareMenu({ item, cardRef, prominent, className, style, testid = "detail-share" }) {
  const { sfx } = useApp();
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `${item.title} — ${item.tagline || "sur Stationexus"}`;

  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: item.title, text, url }); setOpen(false); }
      catch { /* cancelled */ }
    } else { copy(); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast.success("Lien copié"); } catch { toast.error("Copie impossible"); } setOpen(false); };
  const openWin = (u) => { window.open(u, "_blank", "noopener,noreferrer"); setOpen(false); };
  const enc = encodeURIComponent;

  const downloadCard = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
      const file = new File([blob], `${item.title}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: item.title, text });
      } else {
        const u = URL.createObjectURL(blob); const a = document.createElement("a");
        a.href = u; a.download = `${item.title}.png`; a.click(); URL.revokeObjectURL(u);
        toast.success("Carte téléchargée");
      }
    } catch { toast.error("Impossible de générer la carte"); }
    setOpen(false);
  };

  const btn = { borderColor: "rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)", color: "#fff", background: "rgba(0,0,0,0.25)" };
  const row = "flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-colors";

  const Item = ({ testid, icon, label, onClick }) => (
    <button data-testid={testid} onClick={onClick} className={row} style={{ color: "var(--text-primary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      {icon} {label}
    </button>
  );

  return (
    <>
      {prominent ? (
        <button data-testid={testid} onClick={() => { sfx("nav"); setOpen(true); }}
          className={className} style={style}>
          <IoShareSocial size={18} /> Partager
        </button>
      ) : (
        <button data-testid={testid} onClick={() => { sfx("nav"); setOpen(true); }} className="p-2.5 border" style={btn}><IoShareSocial size={18} /></button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setOpen(false)} data-testid="share-menu">
          <div className="w-full sm:max-w-sm border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-c)" }}>
              <span className="font-display text-lg" style={{ color: "var(--text-primary)" }}>Partager</span>
              <button onClick={() => setOpen(false)} style={{ color: "var(--text-secondary)" }}><IoClose size={20} /></button>
            </div>
            <div className="py-2">
              {typeof navigator !== "undefined" && navigator.share && (
                <Item testid="share-native" icon={<IoPaperPlaneOutline size={18} style={{ color: "var(--brand)" }} />} label="Partager via…" onClick={nativeShare} />
              )}
              <Item testid="share-x" icon={<span style={{ color: "var(--brand)", fontWeight: 700 }}>𝕏</span>} label="Partager sur X" onClick={() => openWin(`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`)} />
              <Item testid="share-whatsapp" icon={<IoLogoWhatsapp size={18} style={{ color: "var(--brand)" }} />} label="Partager sur WhatsApp" onClick={() => openWin(`https://wa.me/?text=${enc(text + " " + url)}`)} />
              <Item testid="share-facebook" icon={<IoLogoFacebook size={18} style={{ color: "var(--brand)" }} />} label="Partager sur Facebook" onClick={() => openWin(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`)} />
              <Item testid="share-copy" icon={<IoLink size={18} style={{ color: "var(--brand)" }} />} label="Copier le lien" onClick={copy} />
              <Item testid="share-card" icon={<IoDownloadOutline size={18} style={{ color: "var(--brand)" }} />} label="Enregistrer la carte (image)" onClick={downloadCard} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
