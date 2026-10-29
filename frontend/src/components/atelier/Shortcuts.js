import { useState } from "react";
import { IoChevronUp, IoChevronDown, IoAdd } from "react-icons/io5";
import { toast } from "sonner";
import { KINDS, isOeuvre } from "@/lib/atelier";
import { DEFAULT_APPS, popOut } from "@/lib/embed";

// Raccourcis de la barre du bas (téléphone) : vers n'importe quel endroit de l'Atelier
export const SECTIONS = [
  ["home", "Pont", "艦"], ["universes", "Univers", "界"], ["inbox", "Inbox", "箱"], ["tasks", "Cockpit", "務"],
  ["bureau", "Bureau", "机"], ["salon", "Salon", "映"], ["settings", "Réglages", "設"],
  ["search", "Recherche", "探"], ["bunny", "Bunny", "兎"], ["focus", "Focus", "禅"],
];
const ACTIONS = ["search", "bunny", "focus"];

export const scKey = (s) => `${s.t}:${s.id || s.v || s.key}`;

export function scInfo(s, at) {
  if (s.t === "view") { const x = SECTIONS.find(([k]) => k === s.v); return x ? { label: x[1], kanji: x[2] } : null; }
  if (s.t === "universe") { const u = at.universes.find((x) => x.id === s.id); return u ? { label: u.name, kanji: u.kanji || u.name[0], color: u.color } : null; }
  if (s.t === "item") {
    const it = at.items.find((x) => x.id === s.id); if (!it) return null;
    return { label: it.title || "Sans titre", kanji: isOeuvre(it) ? "作" : KINDS[it.kind]?.kanji || "・", color: at.universes.find((u) => u.id === it.universe_id)?.color };
  }
  if (s.t === "app") return { label: s.title, kanji: s.k || s.title[0], color: s.color };
  return null;
}

export function runShortcut(s, a) {
  if (s.t === "view") return ACTIONS.includes(s.v) ? a.action(s.v) : a.go({ name: s.v });
  if (s.t === "universe") return a.go({ name: "universe", id: s.id });
  if (s.t === "item") { const it = a.at.items.find((x) => x.id === s.id); return isOeuvre(it) ? a.go({ name: "oeuvre", id: s.id }) : a.open(s.id); }
  if (s.t === "app") {
    const m = (() => { try { return JSON.parse(localStorage.getItem("nexus-app-mode") || "{}")[s.key]; } catch { return null; } })();
    if (m === "tab") return window.open(s.url, "_blank", "noopener");
    if (m === "embed") return a.launch({ title: s.title, url: s.url });
    return popOut(s.url, "nexus-" + s.key);
  }
}

export const addShortcut = async (at, s) => {
  const list = at.config.shortcuts || [];
  if (list.some((x) => scKey(x) === scKey(s))) return toast.message("Déjà dans tes raccourcis");
  await at.saveConfig({ shortcuts: [...list, s] }); toast.success("Ajouté aux raccourcis");
};
export const appShortcut = (a) => ({ t: "app", key: a.key, title: a.title, url: a.url, color: a.color, k: a.k });
export const allApps = (at) => [...DEFAULT_APPS, ...at.links.filter((l) => l.kind === "app").map((l) => ({ key: l.id, title: l.title, url: l.url, color: l.color, k: l.title[0] }))];

export function ShortcutBar({ at, run, onAdd }) {
  const list = (at.config.shortcuts || []).map((s) => ({ s, i: scInfo(s, at) })).filter((x) => x.i);
  const [open, setOpen] = useState(() => localStorage.getItem("nexus-sc-open") === "1");
  if (!list.length) return null;
  const toggle = () => setOpen((o) => { localStorage.setItem("nexus-sc-open", o ? "0" : "1"); return !o; });
  return (
    <nav className={"at-scbar" + (open ? " open" : "")} data-testid="atelier-shortcuts">
      <button className="at-sc-toggle" onClick={toggle} aria-label={open ? "Remettre en bas" : "Déployer"} data-testid="atelier-shortcuts-toggle">{open ? <IoChevronDown size={16} /> : <IoChevronUp size={16} />}</button>
      <div className="at-sc-list">
        {list.map(({ s, i }) => (
          <button key={scKey(s)} className="at-sc" style={{ "--u": i.color || "var(--brand)" }} onClick={() => { if (open) toggle(); run(s); }} data-testid={`atelier-shortcut-${scKey(s).replace(/[^\w-]/g, "-")}`}>
            <span className="kj">{i.kanji}</span><span className="lb">{i.label}</span>
          </button>
        ))}
        <button className="at-sc add" onClick={onAdd} data-testid="atelier-shortcuts-manage"><span className="kj"><IoAdd size={16} /></span><span className="lb">Gérer</span></button>
      </div>
    </nav>
  );
}
