import { useEffect } from "react";

// Effets « Laboratoire » de l'Atelier : titres qui se décodent à chaque changement de vue,
// coordonnées du pointeur, petit son de balayage. N'écrit que dans les nœuds de texte existants
// (React garde la main) et s'arrête si React les modifie entre-temps.
const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ0123456789";
const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";

function decodeNode(node, { speed = 26, delay = 0 } = {}) {
  const text = node.nodeValue; if (!text || text.trim().length < 2 || text.length > 80) return () => {};
  let i = 0, last = null, stop = false, id = 0;
  const run = () => {
    if (stop) return;
    if (last !== null && node.nodeValue !== last) return; // React a changé le texte : on laisse faire
    i += 1;
    last = text.split("").map((ch, k) => (ch === " " ? " " : k < i ? ch : k < i + 3 ? rnd() : " ")).join("");
    node.nodeValue = last;
    if (i > text.length) { node.nodeValue = text; return; }
    id = setTimeout(run, speed);
  };
  const t = setTimeout(run, delay);
  return () => { stop = true; clearTimeout(t); clearTimeout(id); if (last !== null && node.nodeValue === last) node.nodeValue = text; };
}

export function useLabFx(viewKey, sfx) {
  useEffect(() => {
    if (reduced()) return undefined;
    const cleanups = [];
    const t = setTimeout(() => {
      const main = document.querySelector(".at-root .at-main"); if (!main) return;
      const targets = [...main.querySelectorAll(".at-view > .at-head h1, .at-view > header h1, .at-hero-mid h1, .at-view > .at-head .at-eyebrow")].slice(0, 3);
      targets.forEach((el, n) => {
        const node = [...el.childNodes].find((c) => c.nodeType === 3 && c.nodeValue.trim().length > 1);
        if (node) cleanups.push(decodeNode(node, { speed: n === 0 ? 24 : 16, delay: n * 60 }));
      });
    }, 40);
    return () => { clearTimeout(t); cleanups.forEach((f) => f()); };
  }, [viewKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let raf = 0;
    const mv = (e) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const c = document.querySelector(".at-root .at-coord"); if (!c) return;
      c.textContent = `X ${String(Math.round(e.clientX)).padStart(4, "0")} · Y ${String(Math.round(e.clientY)).padStart(4, "0")}`;
    }); };
    window.addEventListener("pointermove", mv, { passive: true });
    return () => { window.removeEventListener("pointermove", mv); cancelAnimationFrame(raf); };
  }, []);
}
