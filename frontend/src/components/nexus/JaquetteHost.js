import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SpineDialog } from "@/components/atelier/AlexCore";
import { getCreation, updateCreation } from "@/lib/api";
import { kindOfCreation, mergeJaq, useJaqDefault, legacyRel } from "@/lib/jaquette";

// « Modifier la jaquette » au clic droit d'un livre, d'une cassette ou d'un disque, partout dans la Station (admin).
// Ouvre directement l'éditeur de jaquette de l'œuvre : modèles, tranche, bande, titre sur la couverture.
// Déclenché par window.dispatchEvent(new CustomEvent("nx-jaquette", { detail: { id, b, cover } })).
export const openJaquette = (detail) => window.dispatchEvent(new CustomEvent("nx-jaquette", { detail }));


export default function JaquetteHost() {
  const [cur, setCur] = useState(null);
  const def = useJaqDefault();
  const qc = useQueryClient();
  useEffect(() => {
    const on = async (e) => {
      const { id, b, cover } = e.detail || {};
      if (!id) return;
      try { const it = await getCreation(id); setCur({ it, b, cover }); } catch (_) { toast.error("Œuvre introuvable"); }
    };
    window.addEventListener("nx-jaquette", on);
    return () => window.removeEventListener("nx-jaquette", on);
  }, []);
  if (!cur) return null;
  const { it, b, cover } = cur;
  const save = async (v) => {
    try {
      await updateCreation(it.id, { ...it, jaquette: v || {} });
      toast.success(v ? "Jaquette enregistrée" : "Jaquette remise au style de la Station");
      qc.invalidateQueries();
    } catch (_) { toast.error("La jaquette n'a pas pu être enregistrée"); }
    setCur(null);
  };
  const fmt = b?.format || "livre";
  return (
    <SpineDialog b={{ ...(b || {}), id: "jaq-" + it.id, title: it.title, sub: it.tagline || "", format: fmt, kind: kindOfCreation(it, fmt), spine: mergeJaq(def, it.jaquette) }}
      cover={cover} current={it.jaquette && Object.keys(it.jaquette).length ? legacyRel(it.jaquette) : null} heading="JAQUETTE ET RELIURE DE L'ŒUVRE"
      note="Ne vaut que pour cette œuvre ; le reste suit le style commun de la Station (Paramètres › Jaquettes)." resetLabel="Revenir au style de la Station"
      onSave={save} onClose={() => setCur(null)} />
  );
}
