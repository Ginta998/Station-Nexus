import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getJournalEntry } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import TapePlayer from "@/components/journal/TapePlayer";
import WorkReader from "@/components/nexus/WorkReader";
import JournalEditor from "@/pages/JournalEditor";

// Une entrée du journal s'ouvre directement, par-dessus la page d'où l'on vient (journal, accueil, fiche d'une création) :
// la cassette dans le magnéto, le reste dans le lecteur (livre, VHS, vinyle). Fermer ramène exactement au même endroit.
// Pour l'admin, un seul bouton « Modifier » : la cassette se modifie sur place (crayon) ; un livre, une VHS ou un vinyle
// ouvre l'éditeur complet par-dessus, puis revient à la lecture.
export function JournalEditLayer({ id, onDone }) {
  return createPortal(<div className="jr-editlayer" data-testid="journal-edit-layer"><JournalEditor id={id} onDone={onDone} /></div>, document.body);
}
export default function JournalOverlay({ id, onClose, onEdit }) {
  const { isAdmin } = useApp(); const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { data: e } = useQuery({ queryKey: ["journal-entry", id], queryFn: () => getJournalEntry(id), enabled: !!id });
  if (!id || !e) return null;
  if (editing) return <JournalEditLayer id={id} onDone={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["journal-entry", id] }); qc.invalidateQueries({ queryKey: ["journal"] }); }} />;
  if (e.format === "cassette") return <TapePlayer entry={e} onClose={onClose} />;
  const edit = onEdit || (isAdmin ? () => setEditing(true) : null);
  return <WorkReader entry={e} onClose={onClose} onEditUnit={edit ? () => edit() : undefined} />;
}
