#!/usr/bin/env python3
# Construit nexus-base.json depuis la Bible des Univers (.docx) + les PDF de chaque œuvre.
# Fidèle au texte de Brichel : on découpe, on ne réécrit pas.
import docx2txt, re, json, os, html

ATT = "/mnt/user-data/attachments/10210064-d0c5-57dc-b42c-73bc864a8b44"
DOCX = f"{ATT}/1d352c16-Bible_Univers_Brichel_Louzala-1.docx"

UMETA = {  # kanji + couleur par numéro romain (univers de la bible)
 "I": ("死","#7c5cff"), "II": ("天","#3ff0ff"), "III": ("刀","#ff2f5f"),
 "IV": ("音","#ffb340"), "V": ("魂","#ff7ad9"), "VI": ("獣","#00e5a0"),
 "VII": ("王","#f5d98a"), "VIII": ("闘","#ff5a46"), "IX": ("宿","#4fd6ff"),
 "X": ("兎","#ff8fd0"), "XI": ("色","#e8e1cf"),
}
PDFS = {  # PDF rattachés par fragment de titre d'œuvre
 "Born X Burn": ["529be19e-Born_X_Burn_II___La_L_gende_du_Feu_Astral.pdf","dab18635-Fiche_livre_Born_X_Born_X_Burn.pdf"],
 "United Sanctum": ["30384d9f-BIBLE_USF_UNITED_SANCTUM_FORCES.pdf"],
 "Premier Régulateur": ["403641dc-DOSSIER_DE_PROJET_-_LE_PREMIER_R_GULATEUR.pdf"],
 "Régulateurs": ["b71e984c-FDLM_-_REGULATEUR.pdf"],
 "Cité des Cieux": ["90dc5522-LA_CIT__DES_CIEUX_-_ANALYSE.pdf"],
 "Requiem District": ["1f3c5e14-KIT_NARRATIF___Requiem_District.pdf","a33edc25-REQUIEM-DISTRICT.pdf"],
 "Soulfreed": ["40ace221-SOULFREED_BIBLE.pdf"],
 "Proof of the Wild": ["9834cdee-PROOF_THE_WILD.pdf"],
 "Kings of Artists": ["205cce10-KINGS_OF_ARTISTS_SAISON_1____KIT_NARRATIF_.pdf"],
 "Striker": ["bbf8d3f3-STRIKE_GENERATION__1.pdf"],
 "Welcome to Haven": ["1bc1d195-WELCOME_TO_HAVEN.pdf"],
 "Cosmic Bunny": ["2f7b1e2d-COSMIC_BUNNY_-_PR_SENTATION_G_N_RALE_.pdf"],
}
FORMATS = [(r"court", "court"), (r"BD|manga|roman graphique|planche","bd"),
 (r"roman|livre|tome","livre"), (r"film|long m[ée]trage|mini-?s[ée]rie","film"),
 (r"s[ée]rie|sh[oō]nen|saison|reels|verticale|city pop","serie")]

def pdf_text(fn):
    path=f"{ATT}/{fn}"
    if not os.path.exists(path): return ""
    try:
        import pymupdf; d=pymupdf.open(path); return "\n".join(p.get_text() for p in d)
    except Exception:
        try:
            from pypdf import PdfReader; return "\n".join((p.extract_text() or "") for p in PdfReader(path).pages)
        except Exception as e: return ""

def split_blocks(text): return [b.strip() for b in re.split(r"\n\s*\n", (text or "").strip()) if b.strip()]
def esc(s): return (s or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")  # minimal : garde apostrophes/accents
def to_html(text, lead=""):
    blocks = split_blocks(text)
    out = []
    if lead: out.append(f"<p><strong>{esc(lead)}</strong></p>")
    # liste si plusieurs blocs courts d'une seule ligne (ex. règles, pistes)
    oneliners = [b for b in blocks if "\n" not in b and len(b) <= 180]
    if len(blocks) >= 3 and len(oneliners) == len(blocks):
        out.append("<ul>" + "".join(f"<li>{esc(b)}</li>" for b in blocks) + "</ul>")
    else:
        for b in blocks:
            out.append("<p>" + esc(b).replace("\n", "<br/>") + "</p>")
    return "".join(out)
def para_html(text): return to_html(text)

KNOWN_HEAD={"Synopsis","Personnages","Pistes de développement","Direction artistique",
 "Règles de l'univers","Règles communes de l'univers","Règles du monde","Lien avec l'univers",
 "Présentation","Thèmes & direction artistique","Thèmes & pistes","Édition & crédits","Mise en scène",
 "Architecture du pouvoir","Skyren & le commandement","Les forces en présence","La toile des liens",
 "Masques & entités","Ton & références","Thèmes, ton & DA","Une enfance en cité","Géographie",
 "Carte & lieux","Lieux","Thèmes","Mécanique","Format & structure","Note d'intention","Concept"}

def is_head(line, nxt):
    s=line.strip()
    if not s or len(s)>52: return False
    if s.endswith(('.',':','!','?')) or '·' in s or '—' in s: return False
    if s in KNOWN_HEAD: return True
    return s[0].isupper() and bool(nxt) and len(nxt.strip())>len(s)

def kind_for(title):
    t=title.lower()
    if "personnage" in t: return "character"
    if any(w in t for w in ("synopsis","pitch","récit","arc","séquence","scène","histoire")): return "scene"
    if any(w in t for w in ("lieu","géograph","carte","ville","cité","district","skyren")): return "place"
    if any(w in t for w in ("règle","pouvoir","cosmolog","univers","masque","entité","lore","architecture","force","toile","lien","monde")): return "lore"
    if any(w in t for w in ("piste","thème","référence","crédit","mise en scène","ton","direction artistique","intention"," da")): return "note"
    return "document"

def parse_people(block_text):
    out=[]
    for b in split_blocks(block_text):
        line=b.replace("\n"," ").strip()
        m=re.split(r"\s*·\s*", line, maxsplit=1); name=m[0].strip(); role=""; desc=line
        if len(m)>1:
            m2=re.split(r"\s*—\s*", m[1], maxsplit=1); role=m2[0].strip(); desc=(m2[1].strip() if len(m2)>1 else m[1].strip())
        if 1<len(name)<=48: out.append((name,role,desc))
        else: out.append((line[:46],"",line))
    return out

def sectionize(lines):
    secs=[]; intro=[]; cur=None; buf=[]
    for i,l in enumerate(lines):
        nxt=lines[i+1] if i+1<len(lines) else ""
        if is_head(l,nxt):
            if cur is None: intro=buf[:]
            else: secs.append((cur,"\n".join(buf).strip()))
            cur=l.strip(); buf=[]
        else: buf.append(l)
    if cur is None: intro=buf[:]
    else: secs.append((cur,"\n".join(buf).strip()))
    return "\n".join(intro).strip(), secs

C=[0]
def nid(p):
    C[0]+=1; return f"{p}{C[0]}"

def strip_tags(h): return re.sub(r"\s+"," ",re.sub(r"<[^>]+>"," ",(h or ""))).strip()
def first_sentences(text, n=2, cap=300):
    t=(text or "").strip()
    segs=re.split(r'(?<=[.!?…])\s+', t); out=""
    for seg in segs[:n]:
        cand=(out+" "+seg).strip()
        if out and len(cand)>cap: break
        out=cand
    return out

def detect_format(blocks):
    for b in blocks[:3]:
        for pat,f in FORMATS:
            if re.search(pat,b,re.I): return f
    return "autre"

def main():
    t=docx2txt.process(DOCX); t=t.replace("&amp;","&").replace("&#39;","'"); lines=t.split("\n")
    # couper le récap de fin : on s'arrête à la 2e occurrence de "Univers I —"
    first=[i for i,l in enumerate(lines) if re.match(r"^Univers I —", l.strip())]
    if len(first)>=2: lines=lines[first[0]:first[1]]
    else: lines=lines[(first[0] if first else 0):]
    uni_starts=[i for i,l in enumerate(lines) if re.match(r"^Univers [IVX]+ —", l.strip())]
    universes=[]
    for k,start in enumerate(uni_starts):
        end=uni_starts[k+1] if k+1<len(uni_starts) else len(lines)
        blk=lines[start:end]; head=blk[0].strip()
        m=re.match(r"^Univers ([IVX]+) —\s*(.+)$", head); rn=m.group(1); uname=m.group(2).strip()
        # vraies œuvres = titres SANS phrase descriptive (le sommaire met "Œuvre — Titre. desc")
        def _real_oeuvre(l):
            if not re.match(r"^Œuvre [IVX]+ —", l.strip()): return False
            after=l.split("—",1)[1].strip()
            return not re.search(r"\.\s", after) and not after.endswith(".")  # le sommaire ajoute ". phrase"
        oidx=[j for j,l in enumerate(blk) if _real_oeuvre(l)]
        kanji,color=UMETA.get(rn,("星","#8392a8"))
        uni_lines=blk[1:(oidx[0] if oidx else len(blk))]
        intro,secs=sectionize(uni_lines)
        clean=lambda b: re.sub(r"^L['’]univers[^\n]*?r[eè]gles\s+", "", (b or "")).strip()
        raw=split_blocks(intro) + [x for (tt,b) in secs if tt in ("Présentation","Concept") for x in split_blocks(b)]
        ib=[clean(b) for b in raw]; ib=[b for b in ib if b and b not in ("Présentation","Concept")]
        full="\n\n".join(ib)
        # la 1re ligne courte sans ponctuation finale est une tagline -> gardée dans la fiche mais pas dans la logline
        desc_src="\n\n".join(ib[1:]) if (len(ib)>1 and len(ib[0])<64 and not re.search(r"[.!?]$", ib[0])) else full
        desc=clean(first_sentences(desc_src))  # logline : 1 à 2 phrases
        uni={"tmp":nid("u"),"name":uname,"kanji":kanji,"color":color,"description":desc,"elements":[],"oeuvres":[]}
        if full:
            uni["elements"].append({"tmp":nid("e"),"kind":"lore","title":"Concept & règles","content":to_html(full),"tags":[],"links":[]})
        for (tt,b) in secs:
            if tt in ("Présentation","Concept") or not b: continue
            uni["elements"].append({"tmp":nid("e"),"kind":kind_for(tt),"title":tt,"content":para_html(b),"tags":[],"links":[]})
        for oi,jj in enumerate(oidx):
            oend=oidx[oi+1] if oi+1<len(oidx) else len(blk)
            ob=blk[jj:oend]; oh=ob[0].strip()
            om=re.match(r"^Œuvre [IVX]+ —\s*(.+?)(?:\s*\((.+)\))?$", oh)
            otitle=re.split(r"\s*\.\s*",(om.group(1).strip() if om else oh))[0].strip()
            ointro,osecs=sectionize(ob[1:]); ib=split_blocks(ointro)
            fmt=detect_format(ib)
            logline=(ib[1] if len(ib)>1 else (ib[0] if ib else "")).replace("\n"," ").strip()
            oeuv={"tmp":nid("o"),"title":otitle,"format":fmt,"status":"en cours","pitch":logline[:400],"image":"","elements":[],"links":[]}
            for (tt,b) in osecs:
                if not b: continue
                if tt=="Personnages":
                    for b2 in split_blocks(b):
                        line=b2.replace("\n"," ").strip()
                        if "·" in line:  # vrai personnage : "Nom · rôle — description"
                            m=re.split(r"\s*·\s*", line, maxsplit=1); name=m[0].strip()
                            m2=re.split(r"\s*—\s*", m[1], maxsplit=1) if len(m)>1 else [""]
                            role=m2[0].strip(); desc=(m2[1].strip() if len(m2)>1 else (m[1].strip() if len(m)>1 else line))
                            oeuv["elements"].append({"tmp":nid("e"),"kind":"character","title":name[:48],"fields":{"role":role},"content":to_html(desc, lead=role),"tags":[],"links":[]})
                        else:  # concept / règle glissé dans la liste -> lore
                            title=re.split(r"\s*[—:]\s*", line, maxsplit=1)[0][:48]
                            oeuv["elements"].append({"tmp":nid("e"),"kind":"lore","title":title,"content":para_html(b2),"tags":[],"links":[]})
                else:
                    oeuv["elements"].append({"tmp":nid("e"),"kind":kind_for(tt),"title":tt,"content":para_html(b),"tags":[],"links":[]})
            # NB : les fichiers PDF originaux seront rattachés en média-référence à la 2e passe (pas de pavé de texte brut ici)
            uni["oeuvres"].append(oeuv)
        if not uni["description"]:  # secours : 1re fiche de contenu, sinon pitch de la 1re œuvre
            cand=next((strip_tags(e["content"]) for e in uni["elements"] if strip_tags(e.get("content",""))), "")
            uni["description"]=first_sentences(cand) or (uni["oeuvres"][0]["pitch"] if uni["oeuvres"] else "")
        universes.append(uni)

    # — CORRECTION 1 : USF devient son propre univers (Tome 1 = œuvre)
    fdlm=next((u for u in universes if "Fonctionnaires" in u["name"]), None)
    if fdlm:
        usf=next((o for o in fdlm["oeuvres"] if "united sanctum" in o["title"].lower()), None)
        if usf:
            fdlm["oeuvres"].remove(usf)
            uni={"tmp":nid("u"),"name":"United Sanctum Forces","kanji":"聖","color":"#4da6ff","description":usf["pitch"],"elements":[],"oeuvres":[]}
            tome={"tmp":nid("o"),"title":"Tome 1","format":(usf["format"] if usf["format"]!="autre" else "serie"),"status":"en cours","pitch":usf["pitch"],"image":"","elements":[],"links":[]}
            for el in usf["elements"]:
                (tome["elements"] if el["kind"] in ("character","scene","note") else uni["elements"]).append(el)
            uni["oeuvres"].append(tome)
            universes.insert(universes.index(fdlm)+1, uni)

    # — CORRECTION 2 : RedWood History appartient à La Cité des Cieux (le fichier sera rattaché en média-référence à la 2e passe)

    # réseau narratif : relie les œuvres d'un même univers entre elles
    for u in universes:
        oids=[o["tmp"] for o in u["oeuvres"]]
        if len(oids)>1:
            for o in u["oeuvres"]: o["links"]=[x for x in oids if x!=o["tmp"]]

    # — garde-fou final : descriptions = loglines propres (pas de titre résiduel, pas d'entités)
    for u in universes:
        d=(u["description"] or "").replace("&amp;","&").replace("&#39;","'").replace("&#x27;","'")
        _rx=r"^L['’]univers\s*[—–-]?\s*concept[^.\n]*[\s]*"
        d=re.sub(_rx,"",d).strip()
        if not d:
            cand=next((strip_tags(e["content"]) for e in u["elements"] if strip_tags(e.get("content",""))),"")
            d=re.sub(_rx,"",cand).strip() or (u["oeuvres"][0]["pitch"] if u["oeuvres"] else "")
        u["description"]=first_sentences(d)

    base={"version":1,"universes":universes}
    out="/home/claude/station-nexus/frontend/src/data/nexus-base.json"
    os.makedirs(os.path.dirname(out),exist_ok=True)
    json.dump(base,open(out,"w"),ensure_ascii=False,indent=1)
    noe=sum(len(u["oeuvres"]) for u in universes)
    nel=sum(len(u["elements"])+sum(len(o["elements"]) for o in u["oeuvres"]) for u in universes)
    print(f"Univers: {len(universes)}  Œuvres: {noe}  Éléments: {nel}  ({os.path.getsize(out)} octets)")
    for u in universes:
        print(f"  {u['name']} [{u['kanji']}] — {len(u['elements'])} elts univers, {len(u['oeuvres'])} œuvre(s)")
        for o in u["oeuvres"]:
            ch=sum(1 for e in o['elements'] if e['kind']=='character')
            print(f"      - {o['title']} ({o['format']}) : {len(o['elements'])} elts dont {ch} perso")

main()
