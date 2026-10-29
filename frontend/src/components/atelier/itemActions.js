import { IoOpenOutline, IoPin, IoTrashOutline, IoSwapHorizontal, IoPricetagOutline, IoCopyOutline, IoCreateOutline, IoPrintOutline } from "react-icons/io5";
import { toast } from "sonner";
import { KINDS } from "@/lib/atelier";
import { exportItem } from "@/lib/exportPdf";
import { addShortcut } from "@/components/atelier/Shortcuts";

// Entrées du menu contextuel d'un élément (ouvrir, épingler, déplacer, catégorie, dupliquer, supprimer)
export function itemMenu(it, at, open) {
  const move = (uid) => at.saveItem({ ...it, universe_id: uid }).then(() => toast.success(`Déplacé vers ${at.universes.find((u) => u.id === uid)?.name || "l'Inbox"}`));
  return {
    title: it.title || "Sans titre",
    entries: [
      { id: "open", label: "Ouvrir", icon: <IoOpenOutline size={14} />, onClick: () => open(it.id) },
      { id: "rename", label: "Renommer", icon: <IoCreateOutline size={14} />, onClick: () => { const t = window.prompt("Titre de l'élément", it.title || ""); if (t !== null) at.saveItem({ ...it, title: t.trim() }).then(() => toast.success("Titre modifié")); } },
      { id: "pin", label: it.pinned ? "Désépingler" : "Épingler en haut", icon: <IoPin size={14} />, onClick: () => at.saveItem({ ...it, pinned: !it.pinned }) },
      { id: "move", label: "Déplacer vers", icon: <IoSwapHorizontal size={14} />, sub: [
        { id: "move-inbox", label: "Inbox", on: !it.universe_id, onClick: () => move(null) },
        ...at.universes.map((u) => ({ id: `move-${u.id}`, label: u.name, on: it.universe_id === u.id, onClick: () => move(u.id) })),
      ] },
      { id: "kind", label: "Changer de catégorie", icon: <IoPricetagOutline size={14} />, sub: Object.entries(KINDS).map(([k, v]) => ({ id: `kind-${k}`, label: `${v.kanji}  ${v.label}`, on: it.kind === k, onClick: () => at.saveItem({ ...it, kind: k }).then(() => toast.success(`Rangé dans ${v.plural}`)) })) },
      { id: "dup", label: "Dupliquer", icon: <IoCopyOutline size={14} />, onClick: () => { const { id, created_at, updated_at, ...rest } = it; at.createItem({ ...rest, title: `${it.title || "Sans titre"} (copie)` }); } },
      { id: "shortcut", label: "Ajouter aux raccourcis", icon: <IoPin size={14} />, onClick: () => addShortcut(at, { t: "item", id: it.id }) },
      { id: "pdf", label: "Exporter en PDF", icon: <IoPrintOutline size={14} />, onClick: () => exportItem(it, at.universes) },
      "-",
      { id: "delete", label: "Supprimer", danger: true, icon: <IoTrashOutline size={14} />, onClick: () => window.confirm(`Supprimer « ${it.title || "Sans titre"} » ?`) && at.removeItem(it.id).then(() => toast.success("Supprimé")) },
    ],
  };
}

// Déposer un élément attrapé : vers un univers (null = Inbox) ou une catégorie
export const dropToUniverse = (at, uid) => (id) => { const it = at.items.find((x) => x.id === id); if (it && it.universe_id !== uid) at.saveItem({ ...it, universe_id: uid }).then(() => toast.success(`Déplacé vers ${at.universes.find((u) => u.id === uid)?.name || "l'Inbox"}`)); };
export const dropToKind = (at, kind) => (id) => { const it = at.items.find((x) => x.id === id); if (it && it.kind !== kind) at.saveItem({ ...it, kind }).then(() => toast.success(`Rangé dans ${KINDS[kind].plural}`)); };
