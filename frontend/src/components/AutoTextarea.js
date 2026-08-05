import { useRef, useEffect, useCallback } from "react";

// Zone de texte qui s'agrandit automatiquement en hauteur selon le contenu (jusqu'à maxHeight).
export default function AutoTextarea({ value, maxHeight = 160, className, style, onInput, ...props }) {
  const ref = useRef(null);
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  }, [maxHeight]);

  useEffect(() => { resize(); }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      onInput={(e) => { resize(); onInput && onInput(e); }}
      className={className}
      style={{ resize: "none", overflowY: "auto", maxHeight, ...style }}
      {...props}
    />
  );
}
