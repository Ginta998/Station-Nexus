import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { IoMic, IoStop, IoClose } from "react-icons/io5";
import { uploadJournalImage } from "@/lib/api";

/*
  Enregistrer directement au micro (journal de bord, cassette) : on appuie, un voyant rouge et un compteur tournent,
  un vumètre montre le niveau ; « Arrêter » envoie l'enregistrement et le pose sur la cassette.
  Le navigateur demande la permission du micro la première fois.
*/
const pickMime = () => {
  const MR = window.MediaRecorder; if (!MR) return "";
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((m) => MR.isTypeSupported?.(m)) || "";
};
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function MicRecorder({ onDone, label = "Enregistrer au micro", compact = false, testid = "mic-rec" }) {
  const [st, setSt] = useState("idle"); // idle | rec | send
  const [t, setT] = useState(0); const [lvl, setLvl] = useState(0);
  const rec = useRef(null); const stream = useRef(null); const chunks = useRef([]); const raf = useRef(0); const t0 = useRef(0); const ctxR = useRef(null); const cancelled = useRef(false);

  const cleanup = () => {
    cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach((k) => k.stop()); stream.current = null;
    try { ctxR.current?.close(); } catch (_) {} ctxR.current = null; setLvl(0);
  };
  useEffect(() => () => { cancelled.current = true; try { rec.current?.state === "recording" && rec.current.stop(); } catch (_) {} cleanup(); }, []);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast.error("Ce navigateur ne sait pas enregistrer le micro.");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s; chunks.current = []; cancelled.current = false;
      const mime = pickMime(); const r = new MediaRecorder(s, mime ? { mimeType: mime } : undefined); rec.current = r;
      r.ondataavailable = (e) => e.data?.size && chunks.current.push(e.data);
      r.onstop = async () => {
        cleanup(); if (cancelled.current) { setSt("idle"); return; }
        const type = (r.mimeType || mime || "audio/webm").split(";")[0];
        const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const file = new File(chunks.current, `enregistrement-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.${ext}`, { type });
        setSt("send");
        try { const { url } = await uploadJournalImage(file); onDone(url, file); toast.success("Enregistrement posé sur la cassette"); }
        catch (e) { toast.error(e?.response?.data?.detail || "Envoi de l'enregistrement impossible"); }
        setSt("idle");
      };
      // vumètre
      const AC = window.AudioContext || window.webkitAudioContext; const c = new AC(); ctxR.current = c;
      const an = c.createAnalyser(); an.fftSize = 512; c.createMediaStreamSource(s).connect(an); const buf = new Uint8Array(an.fftSize);
      t0.current = performance.now();
      const loop = () => { an.getByteTimeDomainData(buf); let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v - 128)); setLvl(Math.min(1, m / 90)); setT((performance.now() - t0.current) / 1000); raf.current = requestAnimationFrame(loop); };
      loop(); r.start(250); setSt("rec");
    } catch (e) {
      cleanup(); setSt("idle");
      toast.error(e?.name === "NotAllowedError" ? "Le micro a été refusé. Autorise-le dans les réglages du navigateur." : "Impossible d'ouvrir le micro.");
    }
  };
  const stop = () => { try { rec.current?.stop(); } catch (_) {} };
  const cancel = () => { cancelled.current = true; stop(); };

  if (st === "rec") return (
    <span className={"mic-rec on" + (compact ? " compact" : "")} data-testid={testid}>
      <i className="mic-dot" aria-hidden="true" /><b className="mono">REC {mmss(t)}</b>
      <span className="mic-vu" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <i key={k} className={lvl * 8 > k ? "lit" : ""} />)}</span>
      <button type="button" onClick={stop} className="mic-stop" data-testid={`${testid}-stop`}><IoStop /> Arrêter</button>
      <button type="button" onClick={cancel} className="mic-x" aria-label="Annuler l'enregistrement"><IoClose /></button>
    </span>
  );
  return (
    <button type="button" className={"mic-rec" + (compact ? " compact" : "")} onClick={start} disabled={st === "send"} data-testid={testid}>
      <IoMic /> {st === "send" ? "Envoi…" : label}
    </button>
  );
}
