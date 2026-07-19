import { useNavigate } from "react-router-dom";
import { IoSettingsOutline, IoAddOutline, IoLockClosed, IoLockOpen, IoVolumeMute, IoVolumeHigh } from "react-icons/io5";
import { useApp } from "@/context/AppContext";

export default function TopBar({ onAdd }) {
  const nav = useNavigate();
  const { isAdmin, isPlaying, stopAmbient } = useApp();

  return (
    <header className="relative z-20 flex items-center justify-between px-5 md:px-12 pt-6 md:pt-8">
      <button
        data-testid="logo-home"
        onClick={() => nav("/")}
        className="flex items-baseline gap-2 outline-none"
      >
        <span className="font-display text-2xl md:text-3xl" style={{ color: "var(--text-primary)" }}>
          STATION<span style={{ color: "var(--brand)" }}>EXUS</span>
        </span>
        <span className="font-display text-lg" style={{ color: "var(--brand)", opacity: 0.7 }}>天</span>
      </button>

      <div className="flex items-center gap-2 md:gap-3">
        {isPlaying && (
          <button
            data-testid="stop-ambient-top"
            onClick={stopAmbient}
            title="Couper l'ambiance"
            className="p-2.5 border transition-colors"
            style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--brand)" }}
          >
            <IoVolumeHigh size={18} />
          </button>
        )}

        {isAdmin && onAdd && (
          <button
            data-testid="add-creation-btn"
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2.5 font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}
          >
            <IoAddOutline size={18} /> <span className="hidden sm:inline">Créer</span>
          </button>
        )}

        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 border text-xs"
          style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-secondary)" }}
          data-testid="admin-badge"
        >
          {isAdmin ? <IoLockOpen size={14} style={{ color: "var(--brand)" }} /> : <IoLockClosed size={14} />}
          {isAdmin ? "Création" : "Visiteur"}
        </div>

        <button
          data-testid="settings-btn"
          onClick={() => nav("/parametres")}
          className="p-2.5 border transition-colors hover:scale-105"
          style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)" }}
        >
          <IoSettingsOutline size={18} />
        </button>
      </div>
    </header>
  );
}
