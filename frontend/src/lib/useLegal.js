import { useQuery } from "@tanstack/react-query";
import { getLegalInfo } from "@/lib/api";
import { LEGAL, tvaOf } from "@/lib/legal";

// Valeurs légales = valeurs par défaut du code + ce que l'admin a renseigné (Paramètres → Admin).
export function useLegal() {
  const { data } = useQuery({ queryKey: ["legal-info"], queryFn: getLegalInfo, staleTime: 300000, retry: 0 });
  const filled = Object.fromEntries(Object.entries(data || {}).filter(([k, x]) => k !== "updated_at" && typeof x === "string" && x.trim()));
  const v = { ...LEGAL, ...filled };
  return { ...v, tva_mention: tvaOf(v) };
}
