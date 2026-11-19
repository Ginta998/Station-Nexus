import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoAdd, IoArrowUp, IoArrowDown, IoTrashOutline, IoSend, IoMailOutline, IoCopyOutline, IoCloudUploadOutline, IoCheckmarkCircle, IoAlertCircleOutline, IoPhonePortraitOutline, IoDesktopOutline } from "react-icons/io5";
import { listNewsletters, saveNewsletter, deleteNewsletter, sendNewsletter, emailStatus, emailTest, listCreations, uploadJournalImage } from "@/lib/api";
import { newsletterHtml, NL_THEMES, NL_BLOCKS } from "@/lib/newsletterHtml";
import { labConfirm } from "@/components/atelier/LabDialog";
import { ArtSearch } from "@/components/journal/BlocksEditor";
import "@/components/atelier/newsletter.css";

/*
  Le studio de la newsletter : des blocs (titre, texte, image, œuvre, bouton), l'aperçu exact de l'email,
  un test envoyé à toi, puis l'envoi à tous les abonnés. Les brouillons restent sur le serveur.
*/
const blank = () => ({ subject: "", preheader: "", theme: "nuit", blocks: [{ type: "heading", t: "Des nouvelles de la station" }, { type: "text", t: "" }] });
const STATUS = { draft: "Brouillon", sending: "Envoi en cours…", sent: "Envoyée" };
const fmtD = (d) => (d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "");

export default function NewsletterView() {
  const qc = useQueryClient();
  const { data: list = [], refetch } = useQuery({ queryKey: ["newsletters"], queryFn: listNewsletters, refetchInterval: (q) => ((q.state.data || []).some((n) => n.status === "sending") ? 4000 : false) });
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: mail, refetch: refetchMail } = useQuery({ queryKey: ["emailStatus"], queryFn: emailStatus });
  const [n, setN] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [phone, setPhone] = useState(false);
  const [diag, setDiag] = useState(null);
  const set = (p) => { setN((o) => ({ ...o, ...p })); setDirty(true); };
  const setB = (i, p) => set({ blocks: n.blocks.map((b, k) => (k === i ? { ...b, ...p } : b)) });
  const move = (i, d) => { const b = [...n.blocks]; const j = i + d; if (j < 0 || j >= b.length) return; [b[i], b[j]] = [b[j], b[i]]; set({ blocks: b }); };
  const add = (type) => set({ blocks: [...n.blocks, { type, ...(type === "oeuvre" && creations[0] ? { id: creations[0].id } : {}) }] });
  const html = useMemo(() => (n ? newsletterHtml(n, creations) : ""), [n, creations]);
  const locked = n && (n.status === "sending" || n.status === "sent");

  useEffect(() => { if (!n && list.length) { const d = list.find((x) => x.status === "draft"); if (d) setN(d); } }, [list]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (quiet) => {
    setBusy("save");
    try { const r = await saveNewsletter({ ...n, html }); setN(r); setDirty(false); await refetch(); if (!quiet) toast.success("Brouillon enregistré"); return r; }
    catch (e) { toast.error(e?.response?.data?.detail || "Enregistrement impossible"); return null; } finally { setBusy(""); }
  };
  const test = async () => {
    setBusy("test");
    try { const r = await emailTest({ subject: `[Test] ${n?.subject || "Station Nexus"}`, html: n ? html : undefined }); setDiag(r); r.ok ? toast.success(`Test envoyé à ${r.to}`) : toast.error("Le test n'est pas parti : regarde le diagnostic"); }
    catch (e) { setDiag({ ok: false, error: e?.response?.status === 404 ? "Le serveur de la station n'a pas encore la mise à jour newsletter (backend Emergent)." : e?.response?.data?.detail || e.message }); }
    finally { setBusy(""); refetchMail(); }
  };
  const send = async () => {
    if (!n.subject?.trim()) { toast.error("Écris l'objet de l'email"); return; }
    const total = mail?.subscribers ?? "tous les";
    if (!(await labConfirm(`Envoyer « ${n.subject} » à ${total} abonné${total === 1 ? "" : "s"} ? On ne peut pas l'annuler une fois partie.`))) return;
    const saved = dirty || !n.id ? await save(true) : n; if (!saved) return;
    setBusy("send");
    try { const r = await sendNewsletter(saved.id); toast.success(`Envoi lancé à ${r.total} abonné${r.total > 1 ? "s" : ""}`); await refetch(); setN((o) => ({ ...o, status: "sending" })); }
    catch (e) { toast.error(e?.response?.data?.detail || "Envoi impossible"); } finally { setBusy(""); }
  };
  const duplicate = (x) => { const { id, status, sent_at, sent, failed, total, created_at, updated_at, ...rest } = x; setN({ ...rest, subject: rest.subject ? rest.subject + " (copie)" : "" }); setDirty(true); }; // eslint-disable-line no-unused-vars
  const remove = async (x) => { if (!(await labConfirm(`Supprimer « ${x.subject || "Sans objet"} » ?`))) return; await deleteNewsletter(x.id); if (n?.id === x.id) setN(null); refetch(); qc.invalidateQueries({ queryKey: ["newsletters"] }); };
  const upload = async (i, f) => { if (!f) return; try { setB(i, { url: (await uploadJournalImage(f)).url }); } catch (_) { toast.error("Image non envoyée"); } };

  const ready = mail?.configured && !mail?.test_sender;
  return (
    <section className="at-view nl" data-testid="atelier-newsletter">
      <header className="at-head">
        <p className="at-eyebrow mono">// LETTRE AUX ABONNÉS</p>
        <h1>Newsletter</h1>
        <p className="at-sub">Compose, regarde l'email tel qu'il arrivera, envoie-toi un test, puis envoie-la à tes {mail?.subscribers ?? "…"} abonné{mail?.subscribers === 1 ? "" : "s"}.</p>
      </header>

      <div className={"nl-diag" + (ready ? " ok" : "")} data-testid="nl-diag">
        {ready ? <IoCheckmarkCircle size={18} /> : <IoAlertCircleOutline size={18} />}
        <div>
          <b>{!mail ? "Vérification de l'envoi…" : !mail.configured ? "L'envoi n'est pas encore branché" : mail.test_sender ? "Adresse d'envoi de test" : `Envoi prêt · depuis ${mail.sender}`}</b>
          <small>{!mail ? "" : !mail.configured ? "Il manque RESEND_API_KEY dans les variables du serveur (Emergent). Les étapes sont dans la réponse de Claude." : mail.test_sender ? "Avec @resend.dev, Resend n'envoie qu'à l'adresse de ton compte Resend. Vérifie ton domaine chez Resend puis mets SENDER_EMAIL (ex. lettre@ton-domaine.fr)." : "Fais un test avant chaque envoi."}</small>
          {diag && <small className={diag.ok ? "good" : "bad"} data-testid="nl-diag-result">{diag.ok ? `Test parti vers ${diag.to}. Regarde aussi les indésirables.` : `Resend répond : ${diag.error}`}</small>}
        </div>
        <button className="at-btn ghost" onClick={test} disabled={!!busy} data-testid="nl-test">{busy === "test" ? "Envoi…" : <><IoMailOutline size={15} /> M'envoyer un test</>}</button>
      </div>

      <div className="nl-grid">
        <aside className="nl-list">
          <button className="at-btn" onClick={() => { setN(blank()); setDirty(true); }} data-testid="nl-new"><IoAdd size={15} /> Nouvelle lettre</button>
          {list.map((x) => (
            <div key={x.id} className={"nl-li" + (n?.id === x.id ? " on" : "")} onClick={() => { setN(x); setDirty(false); }} data-testid={`nl-li-${x.id}`}>
              <b>{x.subject || "Sans objet"}</b>
              <small className={"st-" + x.status}>{STATUS[x.status] || x.status}{x.status === "sent" ? ` · ${fmtD(x.sent_at)} · ${x.sent ?? 0}/${x.total ?? 0}` : ` · ${fmtD(x.updated_at)}`}</small>
              <span className="nl-li-acts" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => duplicate(x)} title="Dupliquer"><IoCopyOutline size={13} /></button>
                {x.status !== "sending" && <button onClick={() => remove(x)} title="Supprimer"><IoTrashOutline size={13} /></button>}
              </span>
            </div>
          ))}
          {!list.length && <p className="nl-empty">Pas encore de lettre.</p>}
        </aside>

        {!n ? <div className="nl-start"><p>Commence une lettre : un titre, quelques mots, une œuvre à mettre en avant, et c'est parti.</p><button className="at-btn" onClick={() => { setN(blank()); setDirty(true); }}><IoAdd size={15} /> Nouvelle lettre</button></div> : (<>
          <div className="nl-ed">
            {locked && <p className="nl-lock">Cette lettre est {n.status === "sent" ? "partie" : "en train de partir"}. Duplique-la pour en faire une nouvelle.</p>}
            <fieldset disabled={locked}>
              <label>Objet<input value={n.subject || ""} onChange={(e) => set({ subject: e.target.value })} placeholder="Le chapitre 12 est sorti" data-testid="nl-subject" /></label>
              <label>Phrase d'aperçu <small>ce qu'on lit à côté de l'objet dans la boîte de réception</small><input value={n.preheader || ""} onChange={(e) => set({ preheader: e.target.value })} placeholder="Et une surprise dans les coulisses…" /></label>
              <div className="nl-themes-w"><p className="mono">HABILLAGE · {(NL_THEMES[n.theme] || NL_THEMES.nuit).t.toUpperCase()}{(NL_THEMES[n.theme] || {}).info ? ` · ${NL_THEMES[n.theme].info}` : ""}</p>
                <div className="nl-themes">{Object.entries(NL_THEMES).map(([k, t]) => <button type="button" key={k} className={(n.theme || "nuit") === k ? "on" : ""} onClick={() => set({ theme: k })} style={{ "--a": t.acc, "--b": t.card, "--i": t.ink, "--f": t.head }} title={t.info} data-testid={`nl-theme-${k}`}><i />{t.t}</button>)}</div></div>

              <div className="nl-blocks">
                {n.blocks.map((b, i) => (
                  <div key={i} className="nl-b" data-testid={`nl-b-${i}`}>
                    <div className="nl-b-h"><span className="mono">{(NL_BLOCKS.find((x) => x[0] === b.type) || [])[1]}</span>
                      <span><button type="button" onClick={() => move(i, -1)} aria-label="Monter"><IoArrowUp size={13} /></button><button type="button" onClick={() => move(i, 1)} aria-label="Descendre"><IoArrowDown size={13} /></button><button type="button" onClick={() => set({ blocks: n.blocks.filter((_, k) => k !== i) })} aria-label="Retirer"><IoTrashOutline size={13} /></button></span></div>
                    {b.type === "heading" && <input value={b.t || ""} onChange={(e) => setB(i, { t: e.target.value })} placeholder="Titre" />}
                    {b.type === "text" && <textarea rows={5} value={b.t || ""} onChange={(e) => setB(i, { t: e.target.value })} placeholder={"Ton message.\n\nUne ligne vide = un nouveau paragraphe. **gras**, *italique*."} data-testid={`nl-text-${i}`} />}
                    {b.type === "image" && <>
                      {b.url && <img className="nl-b-img" src={b.url} alt="" />}
                      <div className="nl-row"><label className="at-btn ghost nl-up"><IoCloudUploadOutline size={14} /> {b.url ? "Changer" : "Choisir une image"}<input hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; upload(i, f); }} /></label><ArtSearch label="Chercher un artwork" term={n.subject} onPick={(u) => setB(i, { url: u })} /></div>
                      <input value={b.caption || ""} onChange={(e) => setB(i, { caption: e.target.value })} placeholder="Légende (facultatif)" />
                      <input value={b.link || ""} onChange={(e) => setB(i, { link: e.target.value })} placeholder="Lien au clic (facultatif)" />
                    </>}
                    {b.type === "oeuvre" && <>
                      <select value={b.id || ""} onChange={(e) => setB(i, { id: e.target.value })} data-testid={`nl-oeuvre-${i}`}>{creations.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
                      <div className="nl-row"><input value={b.kicker || ""} onChange={(e) => setB(i, { kicker: e.target.value })} placeholder="Petit titre (Sur la station)" /><input value={b.label || ""} onChange={(e) => setB(i, { label: e.target.value })} placeholder="Bouton (Entrer dans l'univers)" /></div>
                      <textarea rows={2} value={b.t || ""} onChange={(e) => setB(i, { t: e.target.value })} placeholder="Ton mot sur l'œuvre (sinon son accroche)" />
                    </>}
                    {b.type === "button" && <div className="nl-row"><input value={b.label || ""} onChange={(e) => setB(i, { label: e.target.value })} placeholder="Texte du bouton" /><input value={b.url || ""} onChange={(e) => setB(i, { url: e.target.value })} placeholder="https://…" /></div>}
                  </div>
                ))}
              </div>
              <div className="nl-add">{NL_BLOCKS.map(([k, t]) => <button type="button" key={k} onClick={() => add(k)} data-testid={`nl-add-${k}`}><IoAdd size={13} /> {t}</button>)}</div>
            </fieldset>
            <div className="nl-acts">
              {!locked && <button className="at-btn ghost" onClick={() => save()} disabled={!!busy} data-testid="nl-save">{dirty ? "Enregistrer le brouillon" : "Enregistré"}</button>}
              {!locked && <button className="at-btn" onClick={send} disabled={!!busy || !mail?.configured} data-testid="nl-send"><IoSend size={14} /> Envoyer à {mail?.subscribers ?? "…"} abonné{mail?.subscribers === 1 ? "" : "s"}</button>}
            </div>
          </div>

          <div className="nl-prev">
            <div className="nl-prev-bar"><span className="mono">APERÇU</span><span><button className={phone ? "" : "on"} onClick={() => setPhone(false)} aria-label="Ordinateur"><IoDesktopOutline size={15} /></button><button className={phone ? "on" : ""} onClick={() => setPhone(true)} aria-label="Téléphone"><IoPhonePortraitOutline size={15} /></button></span></div>
            <div className="nl-inbox"><b>{n.subject || "Objet de l'email"}</b><small>Station Nexus · {n.preheader || "Phrase d'aperçu"}</small></div>
            <Frame html={html} phone={phone} />
          </div>
        </>)}
      </div>
    </section>
  );
}

// L'aperçu dans un cadre isolé : les styles de l'atelier n'y entrent pas, comme dans une vraie messagerie
function Frame({ html, phone }) {
  const ref = useRef(null);
  return <iframe ref={ref} className={"nl-frame" + (phone ? " phone" : "")} title="Aperçu de la newsletter" sandbox="allow-same-origin allow-popups" srcDoc={html.replace("%%UNSUB%%", "#")} data-testid="nl-frame" />;
}
