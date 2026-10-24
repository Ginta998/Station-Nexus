import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listJournal, listJournalCategories } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { JournalCard } from "@/components/journal/JournalParts";

// entrées du journal associées à une création (affichées sur sa fiche)
export default function CreationJournal({ creationId }) {
  const nav = useNavigate();
  const { sfx } = useApp();
  const { data: list = [] } = useQuery({ queryKey: ["journal", "creation", creationId], queryFn: () => listJournal({ creation_id: creationId }).then((l) => l.filter((e) => e.published)) });
  const { data: cats = [] } = useQuery({ queryKey: ["journal-cats"], queryFn: listJournalCategories });
  if (!list.length) return null;
  return (
    <section className="mt-14" data-testid="creation-journal">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-display text-2xl md:text-3xl" style={{ color: "var(--text-primary)" }}>Journal de bord <span style={{ color: "var(--brand)" }}>録</span></h2>
        <button className="mono text-xs" style={{ color: "var(--text-secondary)" }} onClick={() => nav(`/journal?creation=${creationId}`)} data-testid="creation-journal-all">TOUT VOIR →</button>
      </div>
      <div className="jr-grid">
        {list.slice(0, 6).map((e, i) => <JournalCard key={e.id} idx={i} e={e} cat={cats.find((c) => c.id === e.category_id)} onOpen={() => { sfx("select"); nav(`/journal/${e.id}`); }} />)}
      </div>
    </section>
  );
}
