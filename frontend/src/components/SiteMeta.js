import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/api";

// Met à jour la description du site (Google, aperçus de lien) depuis les paramètres.
const setMeta = (sel, attr, val) => { const el = document.head.querySelector(sel); if (el && val) el.setAttribute(attr, val); };

export default function SiteMeta() {
  const { data: s } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  useEffect(() => {
    const d = s?.site_description;
    setMeta('meta[name="description"]', "content", d);
    setMeta('meta[property="og:description"]', "content", d);
  }, [s?.site_description]);
  return null;
}
