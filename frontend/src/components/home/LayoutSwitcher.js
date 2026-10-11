import { IoGridOutline, IoListOutline, IoExpandOutline } from "react-icons/io5";
import { useApp } from "@/context/AppContext";

const OPTIONS = [
  { id: "steam", label: "Steam", icon: IoGridOutline, testid: "layout-option-steam" },
  { id: "overwatch", label: "Overwatch", icon: IoListOutline, testid: "layout-option-overwatch" },
  { id: "valorant", label: "Valorant", icon: IoExpandOutline, testid: "layout-option-valorant" },
];

export const LayoutSwitcher = () => {
  const { homeLayout, setHomeLayout, sfx } = useApp();
  return (
    <div
      data-testid="layout-switcher-toggle"
      className="flex items-center gap-1 p-1"
      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "999px", backdropFilter: "blur(10px)" }}
    >
      {OPTIONS.map((o) => {
        const active = homeLayout === o.id;
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            data-testid={o.testid}
            onClick={() => { if (!active) { sfx("nav"); setHomeLayout(o.id); } }}
            title={o.label}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300"
            style={{
              borderRadius: "999px",
              color: active ? "var(--bg-primary)" : "var(--on-media-2)",
              background: active ? "var(--brand)" : "transparent",
              boxShadow: active ? "0 0 16px color-mix(in srgb, var(--brand) 50%, transparent)" : "none",
            }}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LayoutSwitcher;
