import "@/components/journal/tape.css";

// La cassette comme objet (listes du journal, Making of) : on sait que c'est un enregistrement avant de l'ouvrir.
export default function TapeObject({ e, small }) {
  return (
    <span className={"tpo" + (small ? " sm" : "")} aria-label="Cassette audio" data-testid={`tape-object-${e.id}`}>
      <span className="tpo-label">
        <b>{e.tape_label || e.title}</b>
        <span className="tpo-win"><i /><i /></span>
      </span>
      <span className="tpo-mouth" />
    </span>
  );
}
