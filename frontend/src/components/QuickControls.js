import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoVolumeHigh, IoVolumeMute, IoExpand, IoContract, IoSettingsOutline } from "react-icons/io5";
import { TextSizeButton } from "@/components/TextSizeButton";
import { useApp } from "@/context/AppContext";

// Contrôles présents sur TOUTES les pages : son, plein écran, taille du texte (Aa), paramètres
export default function QuickControls() {
  const nav = useNavigate();
  const { muted, toggleMute, sfx } = useApp();
  const [isFs, setIsFs] = useState(typeof document !== "undefined" && !!document.fullscreenElement);
  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);
  const toggleFs = () => {
    sfx("nav");
    try {
      if (document.fullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      else { const el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el); }
    } catch (_) {}
  };
  const btn = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", background: "var(--bg-secondary)" };
  return (
    <div className="flex items-center gap-2" data-testid="quick-controls">
      <button data-testid="qc-mute" onClick={() => { toggleMute(); sfx("nav"); }} title="Son" className="p-2.5 border transition-colors" style={{ ...btn, color: muted ? "var(--text-secondary)" : "var(--brand)" }}>
        {muted ? <IoVolumeMute size={18} /> : <IoVolumeHigh size={18} />}
      </button>
      <button data-testid="qc-fullscreen" onClick={toggleFs} title="Plein écran" className="p-2.5 border transition-colors" style={{ ...btn, color: isFs ? "var(--brand)" : "var(--text-primary)" }}>
        {isFs ? <IoContract size={18} /> : <IoExpand size={18} />}
      </button>
      <TextSizeButton btnStyle={btn} />
      <button data-testid="qc-settings" onClick={() => { sfx("nav"); nav("/parametres"); }} title="Paramètres" className="p-2.5 border transition-colors" style={{ ...btn, color: "var(--text-primary)" }}>
        <IoSettingsOutline size={18} />
      </button>
    </div>
  );
}
