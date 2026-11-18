import { IoEyeOutline, IoClose } from "react-icons/io5";
import { useApp } from "@/context/AppContext";

// Rappel discret du mode spectateur : l'admin voit la station comme un visiteur, un clic pour revenir
export default function SpectatorBadge() {
  const { realAdmin, spectator, setSpectator, sfx } = useApp();
  if (!realAdmin || !spectator) return null;
  return (
    <button className="sx-spectator" onClick={() => { sfx("select"); setSpectator(false); }} data-testid="spectator-badge" title="Revenir en admin">
      <IoEyeOutline size={15} /> <span>Vue visiteur</span> <IoClose size={14} />
    </button>
  );
}
