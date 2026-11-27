import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listCreations, listCategories } from "@/lib/api";
import TopBar from "@/components/TopBar";
import { ContextMenuHost } from "@/components/atelier/ContextMenu";
import UniversWindow from "@/components/nexus/UniversWindow";

// Lien direct vers un univers (/univers/<nom>) : la même fenêtre que sur l'accueil, en page.
export default function Univers() {
  const { nom = "" } = useParams();
  const name = decodeURIComponent(nom);
  const nav = useNavigate();
  const { data: all = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  useEffect(() => { window.scrollTo(0, 0); }, [name]);
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <TopBar />
        <UniversWindow page name={name} all={all} cats={cats} onClose={() => nav("/")} />
      </div>
      <ContextMenuHost />
    </div>
  );
}
