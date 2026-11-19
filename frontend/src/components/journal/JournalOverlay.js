import { useQuery } from "@tanstack/react-query";
import { getJournalEntry } from "@/lib/api";
import TapePlayer from "@/components/journal/TapePlayer";
import WorkReader from "@/components/nexus/WorkReader";

// Une entrée du journal s'ouvre directement, par-dessus la page d'où l'on vient (journal, accueil, fiche d'une création) :
// la cassette dans le magnéto, le reste dans le lecteur (livre, VHS, vinyle). Fermer ramène exactement au même endroit.
export default function JournalOverlay({ id, onClose }) {
  const { data: e } = useQuery({ queryKey: ["journal-entry", id], queryFn: () => getJournalEntry(id), enabled: !!id });
  if (!id || !e) return null;
  return e.format === "cassette" ? <TapePlayer entry={e} onClose={onClose} /> : <WorkReader entry={e} onClose={onClose} />;
}
