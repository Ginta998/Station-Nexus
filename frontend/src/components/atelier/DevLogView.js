import { useState } from "react";
import { IoCheckboxOutline, IoSquareOutline, IoAdd, IoTrashOutline } from "react-icons/io5";
import data from "@/data/changelog.json";

const KEY = "nexus-devlog-done", UKEY = "nexus-devlog-user";
const load = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return new Set(); } };
const loadU = () => { try { const v = JSON.parse(localStorage.getItem(UKEY) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
const STATUS = [["done", "Fait"], ["wip", "En cours"], ["todo", "À faire"]];
const TAGCLASS = { "Nouveau": "nv", "Amélioré": "am", "Corrigé": "fx" };

// Page Dev : patch notes datés (façon Overwatch) + backlog cochable
export default function DevLogView() {
  const [done, setDone] = useState(load);
  const [uitems, setUitems] = useState(loadU);
  const [nt, setNt] = useState("");
  const [tab, setTab] = useState("patch");
  const toggle = (id) => setDone((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); try { localStorage.setItem(KEY, JSON.stringify([...n])); } catch (_) {} return n; });
  const saveU = (n) => { setUitems(n); try { localStorage.setItem(UKEY, JSON.stringify(n)); } catch (_) {} };
  const addItem = () => { const t = nt.trim(); if (!t) return; saveU([...uitems, { id: "u" + Date.now(), t, cat: "Perso", status: "todo", user: true }]); setNt(""); };
  const delItem = (id) => saveU(uitems.filter((x) => x.id !== id));
  const backlog = [...data.backlog, ...uitems];
  const eff = (it) => (it.status === "done" || done.has(it.id)) ? "done" : it.status;
  const total = backlog.length;
  const doneCount = backlog.filter((it) => eff(it) === "done").length;

  return (
    <section className="at-view" data-testid="atelier-devlog">
      <header className="at-head"><p className="at-eyebrow mono">// JOURNAL DE DÉVELOPPEMENT · v{data.version}</p><h1>Dev & Patch notes</h1><p className="at-sub">Tout ce qu'on a fait et ce qui reste. {doneCount}/{total} au backlog.</p></header>
      <nav className="at-tabs">
        <button className={tab === "patch" ? "on" : ""} onClick={() => setTab("patch")}>Patch notes<small>{data.patches.length}</small></button>
        <button className={tab === "backlog" ? "on" : ""} onClick={() => setTab("backlog")}>Backlog<small>{total - doneCount}</small></button>
      </nav>

      {tab === "patch" ? (
        <div className="dl-patches">
          {data.patches.map((p) => (
            <article key={p.v} className="dl-patch" data-testid={`devlog-patch-${p.v}`}>
              <div className="dl-ph"><span className="dl-v mono">v{p.v}</span><b>{p.title}</b><time className="mono">{p.date}</time></div>
              {Object.entries(p.groups).map(([g, items]) => (
                <div key={g} className="dl-grp">
                  <span className={"dl-tag " + (TAGCLASS[g] || "")}>{g}</span>
                  <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              ))}
            </article>
          ))}
        </div>
      ) : (
        <>
          <form className="at-tadd dl-add" onSubmit={(e) => { e.preventDefault(); addItem(); }}>
            <input value={nt} onChange={(e) => setNt(e.target.value)} placeholder="Ajouter une idée au backlog…" data-testid="devlog-add-input" />
            <button className="at-btn" type="submit"><IoAdd size={15} /> Ajouter</button>
          </form>
          <div className="dl-backlog">
            {STATUS.map(([st, label]) => {
              const list = backlog.filter((it) => eff(it) === st);
              if (!list.length) return null;
              return (
                <div key={st} className="dl-col">
                  <h2 className={"dl-coltitle " + st}>{label}<small>{list.length}</small></h2>
                  {list.map((it) => (
                    <div key={it.id} className={"dl-item " + eff(it)} data-testid={`devlog-item-${it.id}`}>
                      <button className="chk" onClick={() => toggle(it.id)} aria-label="Cocher">{eff(it) === "done" ? <IoCheckboxOutline size={18} /> : <IoSquareOutline size={18} />}</button>
                      <span className="t" onClick={() => toggle(it.id)}>{it.t}</span>
                      <span className="cat mono">{it.cat}</span>
                      {it.user && <button className="del" onClick={() => delItem(it.id)} aria-label="Supprimer"><IoTrashOutline size={14} /></button>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
