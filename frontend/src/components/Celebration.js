import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoClose, IoSparkles, IoChatbubbles, IoRocketOutline } from "react-icons/io5";
import { getSettings } from "@/lib/api";

const COLORS = ["#ff5da2", "#ffd166", "#58c7ff", "#7cf5c4", "#c39bff", "#ff8f6b", "#ffffff"];

// Overlay de célébration (abonnement) : feux d'artifice + Cosmic Bunny + message chaleureux modifiable.
export default function Celebration({ onClose, overrideTitle, overrideBody }) {
  const nav = useNavigate();
  const canvasRef = useRef(null);
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const title = overrideTitle ?? (settings?.subscribe_celebration_title || "Bienvenue dans la station ! 🎉");
  const body = overrideBody ?? (settings?.subscribe_celebration_body || "Merci pour ton soutien 💛 Tu as désormais accès à toutes les créations !");
  const bunny = settings?.cosmic_bunny_image || "/cosmic-bunny/excited.png";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, running = true;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    let particles = [];
    const burst = (x, y) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const n = 46 + Math.floor(Math.random() * 24);
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n;
        const sp = 2 + Math.random() * 4.5;
        particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 60 + Math.random() * 30, max: 90, color, r: 1.5 + Math.random() * 2 });
      }
    };

    let frame = 0;
    const loop = () => {
      if (!running) return;
      frame++;
      ctx.fillStyle = "rgba(8,6,12,0.28)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (frame % 26 === 0) burst(canvas.width * (0.15 + Math.random() * 0.7), canvas.height * (0.12 + Math.random() * 0.4));
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.035; p.life -= 1;
        const alpha = Math.max(0, p.life / p.max);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      particles = particles.filter((p) => p.life > 0);
      raf = requestAnimationFrame(loop);
    };
    // premiers feux immédiats
    burst(canvas.width * 0.3, canvas.height * 0.28);
    burst(canvas.width * 0.7, canvas.height * 0.22);
    loop();

    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const go = (to) => { onClose?.(); nav(to); };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-5" data-testid="celebration-overlay" style={{ background: "rgba(8,6,12,0.75)", backdropFilter: "blur(4px)" }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="relative w-full max-w-md text-center px-6 py-8 sx-celebrate-pop" style={{ background: "var(--bg-secondary)", border: "1px solid var(--brand)", borderRadius: "var(--radius-lg, 18px)", boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 4px color-mix(in srgb, var(--brand) 18%, transparent)" }}>
        <button data-testid="celebration-close" onClick={onClose} className="absolute top-3 right-3 p-1.5" style={{ color: "var(--text-secondary)" }}><IoClose size={22} /></button>

        <div className="flex justify-center mb-3">
          <div className="sx-celebrate-bounce" style={{ width: 132, height: 132, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--brand)", boxShadow: "0 0 30px color-mix(in srgb, var(--brand) 45%, transparent)" }}>
            <img src={bunny} alt="Cosmic Bunny" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/cosmic-bunny/wave.png"; }} />
          </div>
        </div>

        <h2 className="font-display text-3xl mb-3 leading-tight" style={{ color: "var(--brand)" }} data-testid="celebration-title">{title}</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line mb-6" style={{ color: "var(--text-primary)" }} data-testid="celebration-body">{body}</p>

        <div className="flex flex-col gap-2">
          <button data-testid="celebration-discover" onClick={() => go("/")} className="flex items-center justify-center gap-2 px-5 py-3 font-semibold transition-transform hover:scale-105" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
            <IoRocketOutline size={18} /> Découvrir les créations
          </button>
          <button data-testid="celebration-salon" onClick={() => go("/salon")} className="flex items-center justify-center gap-2 px-5 py-3 font-medium border transition-transform hover:scale-105" style={{ borderColor: "var(--border-c)", color: "var(--text-primary)", borderRadius: "var(--radius-base)" }}>
            <IoChatbubbles size={18} style={{ color: "var(--brand)" }} /> Écrire au créateur dans le Salon
          </button>
          <button data-testid="celebration-dismiss" onClick={onClose} className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            <IoSparkles size={11} className="inline mr-1" /> Rester ici
          </button>
        </div>
      </div>
    </div>
  );
}
