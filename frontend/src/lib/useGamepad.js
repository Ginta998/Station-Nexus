import { useEffect, useRef } from "react";

// Lightweight gamepad poller: maps D-pad / left-stick / face buttons to callbacks.
// handlers: { left, right, up, down, confirm, back, catPrev, catNext }
export function useGamepad(handlers, active = true) {
  const h = useRef(handlers);
  h.current = handlers;

  useEffect(() => {
    if (!active) return;
    if (typeof navigator === "undefined" || !navigator.getGamepads) return;

    let raf;
    const prev = {};
    const repeatAt = {};
    const EDGE = (name, pressed) => {
      const was = !!prev[name];
      prev[name] = pressed;
      if (pressed && !was) return true;       // fresh press
      if (pressed && was) {                    // held -> repeat
        const now = performance.now();
        if (!repeatAt[name]) repeatAt[name] = now + 400;
        if (now >= repeatAt[name]) { repeatAt[name] = now + 140; return true; }
      } else { repeatAt[name] = 0; }
      return false;
    };

    const poll = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = Array.from(pads).find(Boolean);
      if (gp) {
        const b = gp.buttons || [];
        const ax = gp.axes || [];
        const btn = (i) => !!(b[i] && b[i].pressed);
        const up = btn(12) || ax[1] < -0.5;
        const down = btn(13) || ax[1] > 0.5;
        const left = btn(14) || ax[0] < -0.5;
        const right = btn(15) || ax[0] > 0.5;
        const cb = h.current || {};
        if (EDGE("up", up)) cb.up && cb.up();
        if (EDGE("down", down)) cb.down && cb.down();
        if (EDGE("left", left)) cb.left && cb.left();
        if (EDGE("right", right)) cb.right && cb.right();
        if (EDGE("confirm", btn(0))) cb.confirm && cb.confirm();
        if (EDGE("back", btn(1))) cb.back && cb.back();
        if (EDGE("lb", btn(4))) cb.catPrev && cb.catPrev();
        if (EDGE("rb", btn(5))) cb.catNext && cb.catNext();
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
