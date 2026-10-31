import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import DocView from "@/components/atelier/DocView";
import "@/components/atelier/docs.css";

// Lecture seule d'un document partagé par lien
export default function SharedDoc() {
  const { token } = useParams();
  const [it, setIt] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api.get(`/share/${token}`).then((r) => setIt(r.data)).catch(() => setErr("Ce lien n'est plus actif.")); }, [token]);
  if (err) return <div className="dv-root" style={{ display: "grid", placeItems: "center", color: "#ccc" }} data-testid="shared-doc-error">{err}</div>;
  if (!it) return <div className="dv-root" />;
  return <DocView it={it} eyebrow="STATION NEXUS" shared />;
}
