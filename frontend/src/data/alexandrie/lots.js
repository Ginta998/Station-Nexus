// Les lots : des mises à jour de livres, à coller en une seule fois.
// Un lot commence par « LOT : identifiant ou titre du livre ». Plusieurs lots se suivent dans le même texte.
// Dans un lot :
//   - des lignes d'en-tête (À PROPOS, SOUS-TITRE, LIEN…) avant la ligne --- mettent à jour la fiche (LIEN s'ajoute) ;
//   - MODE : remplacer   remplace tout le texte du livre par celui du lot ;
//   - « # Titre » : un chapitre qui existe déjà (même titre) est remplacé ; sinon il est ajouté à la fin ;
//   - >> APRÈS LE CHAPITRE : Titre        les nouveaux chapitres qui suivent se placent après ce chapitre ;
//   - >> À LA FIN DU CHAPITRE : Titre     les paragraphes qui suivent s'ajoutent à la fin de ce chapitre ;
//   - >> APRÈS LE PARAGRAPHE : début…     les paragraphes qui suivent s'insèrent après le paragraphe qui contient ce texte ;
//   - >> SUPPRIMER LE CHAPITRE : Titre    retire ce chapitre.
// Un lot qui vise un livre inexistant, et qui a une ligne TITRE, crée un nouveau livre.

const norm = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").replace(/[^a-z0-9']+/g, " ").trim();
export const countWords = (body) => String(body || "").split("\n").filter((l) => !/^\s*@(img|yt|art) /.test(l)).join(" ").split(/\s+/).filter(Boolean).length;

// Découper un texte collé en lots
export function splitLots(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const lots = []; let cur = null;
  lines.forEach((l) => {
    const m = l.match(/^\s*lot\s*:\s*(.+?)\s*$/i);
    if (m) { cur = { target: m[1], lines: [] }; lots.push(cur); return; }
    if (/^\s*={5,}\s*$/.test(l)) { cur = null; return; }
    if (cur) cur.lines.push(l);
  });
  return lots.map((x) => ({ target: x.target, text: x.lines.join("\n").replace(/^\n+|\n+$/g, "") }));
}
export const hasLots = (text) => /^\s*lot\s*:/im.test(String(text || ""));

// En-tête et corps d'un texte de livre ou de lot
function cut(text) {
  const t = String(text || "");
  const sep = t.match(/^\s*-{3,}\s*$/m); const h1 = t.match(/^(# |>>)/m);
  const i = sep ? sep.index : h1 ? h1.index : -1;
  if (i < 0) return { head: t.trim() ? t : "", body: "", sep: false };
  const head = t.slice(0, i); const rest = sep && sep.index === i ? t.slice(i + sep[0].length) : t.slice(i);
  return { head, body: rest.replace(/^\n+/, ""), sep: !!(sep && sep.index === i) };
}
const headKey = (l) => { const m = l.match(/^\s*([^:\n/][^:\n]*?)\s*:\s*(.*)$/); return m ? norm(m[1]) : null; };

// Chapitres : [{ title, blocks: [..] }], avec un préambule éventuel avant le premier titre
function chapters(body) {
  const blocks = String(body || "").split(/\n\s*\n/).map((b) => b.replace(/^\n+|\n+$/g, "")).filter((b) => b.trim());
  const pre = []; const chs = [];
  blocks.forEach((b) => {
    // un bloc peut commencer par un titre collé à son premier paragraphe
    const m = b.match(/^# (.+?)(?:\n([\s\S]*))?$/);
    if (m) { chs.push({ title: m[1].trim(), blocks: m[2] && m[2].trim() ? [m[2]] : [] }); return; }
    (chs.length ? chs[chs.length - 1].blocks : pre).push(b);
  });
  return { pre, chs };
}
const join = ({ pre, chs }) => [...pre, ...chs.flatMap((c) => [`# ${c.title}`, ...c.blocks])].join("\n\n") + "\n";

// Appliquer un lot à un texte de livre (format collage complet). Renvoie le nouveau texte, la liste des changements et des erreurs.
export function applyLot(src, lotText) {
  const ops = []; const errors = [];
  const L = cut(lotText); const B = cut(src);
  const headLines = L.head.split("\n").filter((l) => l.trim() && !l.trim().startsWith("//"));
  const mode = headLines.find((l) => headKey(l) === "mode");
  // 1) l'en-tête
  let head = B.head.replace(/\n+$/, "");
  headLines.forEach((l) => {
    const k = headKey(l); if (!k || k === "mode") return;
    const hl = head.split("\n");
    if (k === "lien") { if (!hl.some((x) => norm(x) === norm(l))) { const last = hl.map(headKey).lastIndexOf("lien"); hl.splice(last >= 0 ? last + 1 : hl.length, 0, l.trim()); head = hl.join("\n"); ops.push("lien ajouté"); } return; }
    const i = hl.findIndex((x) => headKey(x) === k);
    if (i >= 0) { if (hl[i].trim() !== l.trim()) { hl[i] = l.trim(); ops.push(`${k} mis à jour`); } } else { hl.push(l.trim()); ops.push(`${k} ajouté`); }
    head = hl.join("\n");
  });
  // 2) le corps
  let body = B.body;
  if (mode && /remplac/i.test(mode)) {
    if (!L.body.trim()) errors.push("MODE : remplacer, mais le lot n'a pas de texte");
    else { body = L.body; ops.push("texte entier remplacé"); }
    return { text: `${head}\n---\n\n${body.replace(/^\n+/, "")}`, ops, errors };
  }
  const doc = chapters(body);
  const findCh = (t) => { const n = norm(t); const i = doc.chs.findIndex((c) => norm(c.title) === n); return i; };
  let after = null; // index du chapitre après lequel placer les nouveaux
  let target = null; // { kind: "end", ch } ou { kind: "para", ch, at }
  const lotBlocks = String(L.body || "").split(/\n\s*\n/).map((b) => b.replace(/^\n+|\n+$/g, "")).filter((b) => b.trim());
  let curNew = null; // chapitre en cours de remplacement ou d'ajout
  const flushTo = (b) => {
    if (curNew) { curNew.blocks.push(b); return; }
    if (target?.kind === "end") { doc.chs[target.ch].blocks.push(b); return; }
    if (target?.kind === "para") { doc.chs[target.ch].blocks.splice(target.at + 1, 0, b); target.at++; return; }
    errors.push(`Paragraphe sans destination : « ${b.slice(0, 50)}… » (mets un titre « # » ou une ligne >> avant)`);
  };
  const queue = [...lotBlocks];
  while (queue.length) {
    const raw = queue.shift();
    // un bloc peut contenir une directive suivie de texte sur les lignes suivantes
    const lines = raw.split("\n"); const first = lines[0].trim(); const rest = lines.slice(1).join("\n").trim();
    const d = first.match(/^>>\s*(.+?)\s*:\s*(.+)$/);
    if (d) {
      const what = norm(d[1]); const arg = d[2].trim(); curNew = null;
      if (/^apres le chapitre/.test(what)) { const i = findCh(arg); if (i < 0) errors.push(`Chapitre introuvable : « ${arg} »`); else { after = i; target = null; } }
      else if (/^a la fin du chapitre/.test(what)) { const i = findCh(arg); if (i < 0) errors.push(`Chapitre introuvable : « ${arg} »`); else { target = { kind: "end", ch: i }; ops.push(`ajout à la fin de « ${doc.chs[i].title} »`); } }
      else if (/^apres le paragraphe/.test(what)) {
        const n = norm(arg.replace(/…$|\.\.\.$/, "")); const hits = [];
        doc.chs.forEach((c, ci) => c.blocks.forEach((b, bi) => { if (norm(b).includes(n)) hits.push({ ch: ci, at: bi }); }));
        if (!hits.length) errors.push(`Paragraphe introuvable : « ${arg.slice(0, 60)} »`);
        else if (hits.length > 1) errors.push(`Plusieurs paragraphes contiennent « ${arg.slice(0, 60)} » : donne quelques mots de plus`);
        else { target = { kind: "para", ...hits[0] }; ops.push(`insertion dans « ${doc.chs[hits[0].ch].title} »`); }
      }
      else if (/^supprimer le chapitre/.test(what)) { const i = findCh(arg); if (i < 0) errors.push(`Chapitre introuvable : « ${arg} »`); else { ops.push(`chapitre « ${doc.chs[i].title} » supprimé`); doc.chs.splice(i, 1); if (after != null && after >= i) after--; target = null; } }
      else errors.push(`Ligne inconnue : « ${first} »`);
      if (rest) queue.unshift(rest); // le texte qui suit la directive (un paragraphe, ou un titre de chapitre)
      continue;
    }
    const h = raw.match(/^# (.+?)(?:\n([\s\S]*))?$/);
    if (h) {
      const title = h[1].trim(); const i = findCh(title); target = null;
      if (i >= 0) { doc.chs[i] = { title, blocks: [] }; curNew = doc.chs[i]; ops.push(`chapitre « ${title} » remplacé`); }
      else { const c = { title, blocks: [] }; const at = after != null ? after + 1 : doc.chs.length; doc.chs.splice(at, 0, c); if (after != null) after = at; curNew = c; ops.push(`chapitre « ${title} » ajouté`); }
      if (h[2] && h[2].trim()) curNew.blocks.push(h[2].trim());
      continue;
    }
    flushTo(raw);
  }
  return { text: `${head}\n---\n\n${join(doc)}`, ops, errors };
}

// Résoudre la cible d'un lot parmi les livres (identifiant, ou titre)
export function findTarget(target, books) {
  const t = String(target || "").trim(); const n = norm(t);
  const exact = books.find((b) => b.id === t || b.id.toLowerCase() === t.toLowerCase()) || books.find((b) => norm(b.title) === n);
  if (exact) return exact;
  // sinon, un seul livre dont le titre contient ces mots (« Lumumba » pour « Patrice Lumumba »)
  const part = n.length >= 4 ? books.filter((b) => ` ${norm(b.title)} `.includes(` ${n} `)) : [];
  return part.length === 1 ? part[0] : null;
}

// Modèle à copier : ce qu'une conversation avec Claude peut préparer pour toi
export const LOT_TEMPLATE = `// Un lot met à jour un livre existant. Plusieurs lots se suivent : chacun commence par sa ligne LOT.
// LOT : l'identifiant du livre (ex. lumumba) ou son titre exact. Un livre qui n'existe pas encore est créé s'il y a une ligne TITRE.
LOT : lumumba
// Lignes d'en-tête facultatives : elles remplacent celles du livre (LIEN s'ajoute).
À PROPOS : Un nouveau résumé.
LIEN : Un livre pour aller plus loin | Pourquoi le lire.
---
# Titre d'un chapitre qui existe déjà
Ce chapitre remplace entièrement l'ancien.

>> APRÈS LE CHAPITRE : Onalua
# Un chapitre nouveau
Il se place après le chapitre « Onalua ». Sans cette ligne, un nouveau chapitre va à la fin.

>> À LA FIN DU CHAPITRE : Trente juin
Ces paragraphes s'ajoutent à la fin du chapitre « Trente juin ».

>> APRÈS LE PARAGRAPHE : Le 30 juin 1960, au palais de la Nation
— Une réplique de dialogue, insérée juste après le paragraphe qui contient ces mots.

>> SUPPRIMER LE CHAPITRE : Un chapitre à retirer

LOT : robespierre
>> À LA FIN DU CHAPITRE : La table
Un autre livre, dans le même collage.
`;
