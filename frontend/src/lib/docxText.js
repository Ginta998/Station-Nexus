// Lire le texte d'un fichier Word (.docx) dans le navigateur, sans bibliothèque :
// un .docx est une archive zip ; on y prend word/document.xml et on le décompresse avec DecompressionStream.
// Les titres (styles Titre 1, Heading 1…) deviennent « # Titre », les sous-titres « ## ».

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

async function unzipEntry(buf, name) {
  const b = new Uint8Array(buf);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) { if (u32(b, i) === 0x06054b50) { eocd = i; break; } }
  if (eocd < 0) throw new Error("Ce fichier n'est pas un document Word (.docx)");
  let p = u32(b, eocd + 16); const n = u16(b, eocd + 10);
  const dec = new TextDecoder();
  for (let k = 0; k < n; k++) {
    if (u32(b, p) !== 0x02014b50) break;
    const method = u16(b, p + 10), csize = u32(b, p + 20), nlen = u16(b, p + 28), xlen = u16(b, p + 30), clen = u16(b, p + 32), off = u32(b, p + 42);
    const fname = dec.decode(b.subarray(p + 46, p + 46 + nlen));
    if (fname === name) {
      const start = off + 30 + u16(b, off + 26) + u16(b, off + 28);
      const data = b.subarray(start, start + csize);
      if (method === 0) return dec.decode(data);
      if (method !== 8 || typeof DecompressionStream === "undefined") throw new Error("Ton navigateur ne sait pas ouvrir ce .docx : enregistre-le en .txt");
      const out = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer();
      return dec.decode(out);
    }
    p += 46 + nlen + xlen + clen;
  }
  throw new Error("Document Word sans texte");
}

export async function docxToText(file) {
  const xml = await unzipEntry(await file.arrayBuffer(), "word/document.xml");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const out = [];
  for (const p of doc.getElementsByTagNameNS(W, "p")) {
    const st = p.getElementsByTagNameNS(W, "pStyle")[0]?.getAttributeNS(W, "val") || p.getElementsByTagNameNS(W, "pStyle")[0]?.getAttribute("w:val") || "";
    let t = "";
    for (const r of p.getElementsByTagNameNS(W, "r")) {
      const it = r.getElementsByTagNameNS(W, "i")[0];
      let s = "";
      for (const c of r.childNodes) {
        if (c.localName === "t") s += c.textContent;
        else if (c.localName === "tab") s += " ";
        else if (c.localName === "br") s += "\n";
      }
      t += it && s.trim() && it.getAttributeNS(W, "val") !== "0" && it.getAttribute("w:val") !== "0" ? `*${s}*` : s;
    }
    t = t.replace(/\*\*/g, "").trim();
    if (!t) continue;
    if (/^title$/i.test(st) && !out.length) out.push(`TITRE : ${t}\n---`);
    else if (/^(heading|titre|title)\s*1$|^heading1$|^titre1$|^title$/i.test(st)) out.push(`# ${t}`);
    else if (/^(heading|titre)\s*[2-3]$|^heading[23]$|^titre[23]$|^subtitle$/i.test(st)) out.push(`## ${t}`);
    else out.push(t);
  }
  return out.join("\n\n");
}

export async function fileToText(file) {
  return /\.docx$/i.test(file.name) ? docxToText(file) : file.text();
}
