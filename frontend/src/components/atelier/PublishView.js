import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoCloudUploadOutline, IoJournalOutline, IoEyeOutline, IoOpenOutline, IoRefresh, IoDownloadOutline, IoLinkOutline } from "react-icons/io5";
import { getCreation, getJournalEntry, posterUrl } from "@/lib/api";
import { isOeuvre, stripHtml } from "@/lib/atelier";
import { pressMenu, showMenu } from "@/components/atelier/ContextMenu";
import { askPublish, goStation } from "@/components/atelier/StationLink";
import { canPublish } from "@/components/atelier/itemActions";
import { syncState, SYNC_LABEL, republish, pullRemote, stationUrl } from "@/lib/publish";
import "@/components/atelier/station.css";

/*
  Le panneau de publication : tout ce qui relie l'atelier à la station, au même endroit.
  - À traiter : ce qui a bougé depuis la publication (dans l'atelier, en ligne, ou les deux), réglé en un geste.
  - Œuvres : reliées à leur création ou pas encore.
  - En ligne : chaque élément publié, rangé par création puis le journal, avec son état.
  - Prêts à partir : les documents des œuvres reliées qui ne sont pas encore en ligne.
*/
const pubsOf = (it) => [it.fields?.published && { it, p: it.fields.published }, it.fields?.published_j && { it, p: it.fields.published_j }].filter(Boolean);
const where = (p, cTitle) => (p.target === "journal" ? "JOURNAL DE BORD" : `CH. ${(p.index ?? 0) + 1}${cTitle ? ` · ${cTitle.toUpperCase()}` : ""}`);

export default function PublishView({ at, go, open }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState("");
  const oeuvres = at.items.filter(isOeuvre);
  const pubs = useMemo(() => at.items.flatMap(pubsOf), [at.items]);
  const cids = useMemo(() => [...new Set([...oeuvres.map((o) => o.fields?.creation_id), ...pubs.filter((x) => x.p.target === "chapter").map((x) => x.p.creation_id)].filter(Boolean))].sort(), [oeuvres, pubs]);
  const eids = useMemo(() => [...new Set(pubs.filter((x) => x.p.target === "journal").map((x) => x.p.entry_id))].sort(), [pubs]);
  // ce qui est en ligne, lu sur la station (une lecture par création, une par entrée du journal)
  const { data: R = { c: {}, e: {} }, isFetching, refetch } = useQuery({
    queryKey: ["pub-panel", cids.join(","), eids.join(",")],
    queryFn: async () => {
      const c = {}; const e = {};
      await Promise.all([
        ...cids.map(async (id) => { try { c[id] = await getCreation(id); } catch (err) { c[id] = err?.response?.status === 404 ? null : undefined; } }),
        ...eids.map(async (id) => { try { e[id] = await getJournalEntry(id); } catch (err) { e[id] = err?.response?.status === 404 ? null : undefined; } }),
      ]);
      return { c, e };
    },
    staleTime: 15000,
  });
  const remoteOf = (p) => {
    if (p.target === "journal") return R.e[p.entry_id];
    const c = R.c[p.creation_id]; if (c === undefined) return undefined; if (c === null) return null;
    return (c.chapters || []).find((x) => x.id === p.chapter_id) || null;
  };
  const rows = pubs.map((x) => ({ ...x, st: isFetching && !R.c[x.p.creation_id] && !R.e[x.p.entry_id] ? "?" : syncState(x.it, x.p, remoteOf(x.p)) }));
  const todo = rows.filter((x) => ["local", "remote", "both", "gone"].includes(x.st));
  const linkedOf = (it) => at.items.find((o) => o.id === it.fields?.oeuvre_id)?.fields?.creation_id;
  const ready = at.items.filter((it) => canPublish(it) && !it.fields?.published && !it.fields?.published_j && linkedOf(it) && stripHtml(it.content || "").trim());
  const linked = oeuvres.filter((o) => o.fields?.creation_id);
  const reload = () => { refetch(); qc.invalidateQueries({ queryKey: ["creation-atelier"] }); qc.invalidateQueries({ queryKey: ["journal"] }); };

  const run = async (key, fn, ok) => { setBusy(key); try { await fn(); toast.success(ok); reload(); } catch (e) { toast.error(e?.response?.data?.detail || "Action impossible"); } setBusy(""); };
  const doRepublish = (x) => run(x.it.id + x.p.target, () => republish(at, x.it, x.p), x.p.target === "journal" ? "Entrée du journal mise à jour" : `Chapitre ${(x.p.index ?? 0) + 1} mis à jour`);
  const doPull = (x) => run(x.it.id + x.p.target, () => pullRemote(at, x.it, x.p), "Version en ligne récupérée dans le brouillon");
  const forget = (x) => at.saveItem({ ...x.it, fields: { ...x.it.fields, [x.p.target === "journal" ? "published_j" : "published"]: null } }).then(() => toast.success("Lien oublié (rien n'a changé en ligne)"));
  const rowMenu = (x) => ({ title: x.it.title, entries: [
    { id: "open", label: "Ouvrir le brouillon", icon: <IoOpenOutline size={14} />, onClick: () => open(x.it.id) },
    { id: "see", label: "Voir sur la station", icon: <IoEyeOutline size={14} />, onClick: () => goStation(stationUrl(x.p)) },
    { id: "re", label: x.p.target === "journal" ? "Republier dans le journal…" : "Republier le chapitre…", icon: <IoCloudUploadOutline size={14} />, onClick: () => askPublish(x.it.id, x.p.target) },
    ...(x.st === "remote" || x.st === "both" ? [{ id: "pull", label: "Récupérer la version en ligne", icon: <IoDownloadOutline size={14} />, onClick: () => doPull(x) }] : []),
    "-",
    { id: "forget", label: "Oublier le lien (garder en ligne)", danger: true, onClick: () => forget(x) },
  ] });
  const cTitle = (id) => R.c[id]?.title || "";

  const Row = ({ x, actions = true }) => (
    <div className={"pb-row s-" + x.st} {...pressMenu(() => rowMenu(x))} data-testid={`pub-row-${x.it.id}-${x.p.target}`}>
      <button className="pb-main" onClick={() => open(x.it.id)}>
        <span className="pb-ic">{x.p.target === "journal" ? <IoJournalOutline size={15} /> : <IoCloudUploadOutline size={15} />}</span>
        <span className="pb-txt"><b>{x.it.title || "Sans titre"}</b><small className="mono">{where(x.p, x.p.target === "chapter" ? cTitle(x.p.creation_id) : "")} · {new Date(x.p.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</small></span>
        <em className={"pb-st mono s-" + x.st}>{x.st === "?" ? "…" : SYNC_LABEL[x.st]}</em>
      </button>
      {actions && <span className="pb-acts">
        {(x.st === "local" || x.st === "gone") && <button className="at-btn" disabled={!!busy} onClick={() => doRepublish(x)} data-testid={`pub-update-${x.it.id}`}><IoRefresh size={14} /> {x.st === "gone" ? "Recréer" : "Mettre à jour"}</button>}
        {(x.st === "remote" || x.st === "both") && <>
          <button className="at-btn ghost" disabled={!!busy} onClick={() => doPull(x)} data-testid={`pub-pull-${x.it.id}`}><IoDownloadOutline size={14} /> Récupérer</button>
          <button className="at-btn ghost" disabled={!!busy} onClick={() => askPublish(x.it.id, x.p.target)}>Écraser…</button>
        </>}
        <button className="pb-more" aria-label="Plus d'actions" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); const m = rowMenu(x); showMenu(r.left, r.bottom + 4, m.entries, m.title); }}>⋯</button>
      </span>}
    </div>
  );

  const groups = [...new Set(rows.filter((x) => x.p.target === "chapter").map((x) => x.p.creation_id))];
  const jrows = rows.filter((x) => x.p.target === "journal");

  return (
    <section className="at-view pb" data-testid="atelier-publish">
      <header className="at-head">
        <p className="at-eyebrow mono">// ATELIER → STATION</p>
        <h1>Publication</h1>
        <p className="at-sub">Tout ce qui part de l'atelier vers la station : ce qui est en ligne, ce qui a bougé, ce qui est prêt. Clic droit (appui long) sur une ligne pour le reste.</p>
      </header>
      <div className="pb-stats">
        <div><b>{linked.length}<small>/{oeuvres.length}</small></b><span className="mono">ŒUVRES RELIÉES</span></div>
        <div><b>{rows.length}</b><span className="mono">EN LIGNE</span></div>
        <div className={todo.length ? "hot" : ""}><b>{todo.length}</b><span className="mono">À TRAITER</span></div>
        <div><b>{ready.length}</b><span className="mono">PRÊTS À PARTIR</span></div>
        <button className="pb-sync" onClick={() => refetch()} disabled={isFetching} title="Relire la station"><IoRefresh size={15} className={isFetching ? "spin" : ""} /></button>
      </div>

      {todo.length > 0 && <>
        <p className="ar-sec mono"><b>01</b> À TRAITER <i>· ce qui a bougé depuis la publication</i></p>
        <div className="pb-list">{todo.map((x) => <Row key={x.it.id + x.p.target} x={x} />)}</div>
      </>}

      <p className="ar-sec mono"><b>{todo.length ? "02" : "01"}</b> ŒUVRES <i>· {linked.length} reliée{linked.length > 1 ? "s" : ""} à la station</i></p>
      {oeuvres.length === 0 ? <p className="st-note">Aucune œuvre dans l'atelier pour l'instant.</p> : (
        <div className="pb-works">
          {oeuvres.map((o) => {
            const cid = o.fields?.creation_id; const c = cid ? R.c[cid] : null;
            const n = at.items.filter((it) => it.fields?.oeuvre_id === o.id && (it.fields?.published || it.fields?.published_j)).length;
            return (
              <button key={o.id} className={"pb-work" + (cid ? "" : " off")} onClick={() => go({ name: "oeuvre", id: o.id })} data-testid={`pub-work-${o.id}`}>
                {cid ? <img src={posterUrl(cid, c?.updated_at, 200)} alt="" /> : <span className="pb-k" style={{ color: o.fields?.color }}>{o.fields?.kanji || "作"}</span>}
                <span className="pb-wt"><b>{o.title}</b>
                  {cid ? <small className="mono">{c?.title ? `→ ${c.title.toUpperCase()}` : "→ …"} · {(c?.chapters || []).length} CH. EN LIGNE{n ? ` · ${n} PUBLIÉ${n > 1 ? "S" : ""} D'ICI` : ""}</small>
                    : <small className="mono pb-link"><IoLinkOutline size={12} /> PAS ENCORE RELIÉE — RELIER</small>}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {ready.length > 0 && <>
        <p className="ar-sec mono"><b>{todo.length ? "03" : "02"}</b> PRÊTS À PARTIR <i>· documents des œuvres reliées, pas encore en ligne</i></p>
        <div className="pb-list">
          {ready.map((it) => (
            <div key={it.id} className="pb-row" data-testid={`pub-ready-${it.id}`}>
              <button className="pb-main" onClick={() => open(it.id)}>
                <span className="pb-ic"><IoOpenOutline size={15} /></span>
                <span className="pb-txt"><b>{it.title || "Sans titre"}</b><small className="mono">{stripHtml(it.content).split(/\s+/).filter(Boolean).length} MOTS · {(at.items.find((o) => o.id === it.fields?.oeuvre_id)?.title || "").toUpperCase()}</small></span>
              </button>
              <span className="pb-acts">
                <button className="at-btn" onClick={() => askPublish(it.id, "chapter")} data-testid={`pub-ready-ch-${it.id}`}><IoCloudUploadOutline size={14} /> Chapitre</button>
                <button className="at-btn ghost" onClick={() => askPublish(it.id, "journal")}><IoJournalOutline size={14} /> Journal</button>
              </span>
            </div>
          ))}
        </div>
      </>}

      <p className="ar-sec mono"><b>{["01", "02", "03", "04"][(todo.length ? 1 : 0) + (ready.length ? 1 : 0) + 1]}</b> EN LIGNE <i>· {rows.length} élément{rows.length > 1 ? "s" : ""} publié{rows.length > 1 ? "s" : ""} depuis l'atelier</i></p>
      {rows.length === 0 ? <p className="st-note">Rien n'est encore parti de l'atelier. Clic droit sur un document → « Publier comme chapitre… » ou « Mettre dans le journal de bord… ».</p> : <>
        {groups.map((cid) => (
          <div key={cid} className="pb-group">
            <p className="pb-gt mono">{(cTitle(cid) || "Création").toUpperCase()}</p>
            <div className="pb-list">{rows.filter((x) => x.p.target === "chapter" && x.p.creation_id === cid).sort((a, b) => (a.p.index ?? 0) - (b.p.index ?? 0)).map((x) => <Row key={x.it.id + "c"} x={x} actions={!todo.includes(x)} />)}</div>
          </div>
        ))}
        {jrows.length > 0 && <div className="pb-group">
          <p className="pb-gt mono">JOURNAL DE BORD</p>
          <div className="pb-list">{jrows.map((x) => <Row key={x.it.id + "j"} x={x} actions={!todo.includes(x)} />)}</div>
        </div>}
      </>}
    </section>
  );
}
