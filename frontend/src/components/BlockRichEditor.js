import { useEffect, useRef, useState } from "react";
import { BlocksEditor } from "@/components/journal/BlocksEditor";
import { blocksToHtml, htmlToBlocks } from "@/lib/blocks";
import { uploadAsset, assetUrl } from "@/lib/api";

// remplace l'ancien éditeur de texte : édite en blocs, enregistre le HTML lu par le lecteur
export default function BlockRichEditor({ value, onChange, creationId }) {
  const [blocks, setBlocks] = useState(() => htmlToBlocks(value || ""));
  const last = useRef(value);
  useEffect(() => { if (value !== last.current) { last.current = value; setBlocks(htmlToBlocks(value || "")); } }, [value]);
  const change = (b) => { setBlocks(b); const html = blocksToHtml(b); last.current = html; onChange(html); };
  const up = (kind) => async (file) => {
    if (!creationId) throw new Error("Enregistre d'abord la création");
    const a = await uploadAsset(creationId, file, kind, kind === "audio" ? file.name.replace(/\.[^.]+$/, "") : "");
    return assetUrl(a.id);
  };
  return <BlocksEditor blocks={blocks} onChange={change} uploadImage={up("image")} uploadAudio={up("audio")} />;
}
