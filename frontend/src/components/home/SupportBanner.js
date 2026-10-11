import { IoHeart, IoArrowForward } from "react-icons/io5";

// Distinct, clearly-separated "Soutien" section (never blended with the rest).
export const SupportBanner = ({ memberPlan, membershipActive, onOpen, focused }) => {
  if (!memberPlan?.enabled || membershipActive) return null;
  return (
    <button
      data-testid="soutien-section-container"
      onClick={onOpen}
      className="group relative w-full overflow-hidden text-left transition-transform hover:scale-[1.01]"
      style={{
        borderRadius: "calc(var(--radius-base) * 2)",
        padding: "1.6rem 1.8rem",
        background: "linear-gradient(100deg, color-mix(in srgb, var(--brand) 28%, var(--bg-secondary)), var(--bg-secondary) 55%, var(--bg-primary))",
        border: focused ? "2px solid var(--brand)" : "1px solid color-mix(in srgb, var(--brand) 35%, transparent)",
        boxShadow: focused ? "0 0 36px color-mix(in srgb, var(--brand) 35%, transparent)" : "var(--shadow-1)",
      }}
    >
      <div className="absolute -right-6 -top-10 opacity-10 pointer-events-none">
        <IoHeart size={160} style={{ color: "var(--brand)" }} />
      </div>
      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--brand)" }}>Soutien</p>
          <p className="font-display text-xl md:text-2xl mt-1" style={{ color: "#fff" }}>Soutiens la station</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Accède aux avantages membres et aide les créations à grandir.</p>
        </div>
        <span className="flex items-center gap-2 px-5 py-2.5 font-semibold flex-shrink-0" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "999px" }}>
          Découvrir <IoArrowForward size={16} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
};

export default SupportBanner;
