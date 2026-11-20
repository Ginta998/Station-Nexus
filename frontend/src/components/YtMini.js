import { createPortal } from "react-dom";
import { IoClose, IoMusicalNotes } from "react-icons/io5";
import { useApp } from "@/context/AppContext";

// La petite fenêtre du lecteur YouTube : visible (règles de YouTube), discrète, en bas à droite, au-dessus de la lecture.
export default function YtMini() {
  const { ytMini, setYtMini } = useApp();
  if (!ytMini) return null;
  return createPortal(
    <div className="yt-mini" role="region" aria-label={`Musique : ${ytMini.title}`} data-testid="yt-mini">
      <div className="yt-mini-h"><IoMusicalNotes size={13} /><b>{ytMini.title}</b><button onClick={() => setYtMini(null)} aria-label="Arrêter la musique" data-testid="yt-mini-close"><IoClose size={15} /></button></div>
      <iframe key={ytMini.vid} title={ytMini.title} src={`https://www.youtube.com/embed/${ytMini.vid}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
    </div>,
    document.body
  );
}
