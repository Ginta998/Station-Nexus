import { useEffect, useRef, useState } from "react";
import { playUiSound } from "@/lib/sound";

// Fenêtres de confirmation et de saisie au style Laboratoire (remplacent confirm()/prompt() du navigateur).
// labConfirm(msg) → Promise<boolean> ; labPrompt(msg, valeur) → Promise<string|null>.
let hostReady = false;
const ask = (detail) => new Promise((resolve) => {
  if (!hostReady) { resolve(detail.kind === "prompt" ? window.prompt(detail.msg, detail.value || "") : window.confirm(detail.msg)); return; }
  window.dispatchEvent(new CustomEvent("lab-dialog", { detail: { ...detail, resolve } }));
});
export const labConfirm = (msg) => ask({ kind: "confirm", msg });
export const labPrompt = (msg, value = "") => ask({ kind: "prompt", msg, value });

const DANGER = /supprim|retir|vider|irréversible|efface/i;

export function LabDialogHost() {
  const [d, setD] = useState(null);
  const [val, setVal] = useState("");
  const input = useRef(null);
  const okBtn = useRef(null);
  useEffect(() => {
    hostReady = true;
    const on = (e) => { setD(e.detail); setVal(e.detail.value || ""); try { playUiSound("open"); } catch (_) {} };
    window.addEventListener("lab-dialog", on);
    return () => { hostReady = false; window.removeEventListener("lab-dialog", on); };
  }, []);
  useEffect(() => { if (d) setTimeout(() => (d.kind === "prompt" ? input.current?.select() : okBtn.current?.focus()), 30); }, [d]);
  if (!d) return null;
  const done = (ok) => { try { playUiSound(ok ? "select" : "close"); } catch (_) {} d.resolve(d.kind === "prompt" ? (ok ? val : null) : ok); setD(null); };
  const danger = d.kind === "confirm" && DANGER.test(d.msg);
  return (
    <div className="ld-wrap" onMouseDown={(e) => e.target === e.currentTarget && done(false)} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); done(false); } }} data-testid="lab-dialog">
      <form className={"ld" + (danger ? " danger" : "")} role="alertdialog" aria-modal="true" aria-labelledby="ld-msg" onSubmit={(e) => { e.preventDefault(); done(true); }}>
        <p className="ld-top mono"><span>{danger ? "AVERTISSEMENT · 警告" : d.kind === "prompt" ? "SAISIE · 入力" : "CONFIRMATION · 確認"}</span><i aria-hidden="true" /></p>
        <p id="ld-msg" className="ld-msg">{d.msg}</p>
        {d.kind === "prompt" && <input ref={input} value={val} onChange={(e) => setVal(e.target.value)} className="ld-in" aria-label={d.msg} data-testid="lab-dialog-input" />}
        <div className="ld-acts">
          <button type="button" className="ld-btn ghost" onClick={() => done(false)} data-testid="lab-dialog-cancel">ANNULER <kbd>ÉCHAP</kbd></button>
          <button ref={okBtn} type="submit" className={"ld-btn" + (danger ? " red" : "")} data-testid="lab-dialog-ok">{danger ? "CONFIRMER" : "VALIDER"} <kbd>ENTRÉE</kbd></button>
        </div>
      </form>
    </div>
  );
}
