import { useEffect, useState } from "react";
import { IoTrashOutline, IoAdd, IoSaveOutline } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi } from "@/lib/atelier";

// « Qui est le capitaine » + souvenirs : ce que Bunny sait de toi, entièrement modifiable
export default function BunnyMind() {
  const [m, setM] = useState(null);
  const [prof, setProf] = useState({});
  const [mem, setMem] = useState("");
  const load = () => atelierApi.bunnyMind().then((d) => { setM(d); setProf(d.profile || {}); });
  useEffect(() => { load().catch(() => toast.error("Mémoire de Bunny indisponible")); }, []);
  if (!m) return <p className="at-empty">Chargement de sa mémoire…</p>;
  const save = async () => { try { await atelierApi.saveProfile(prof); toast.success("Bunny a mis ton profil à jour !"); load(); } catch { toast.error("Enregistrement impossible"); } };
  const add = async () => { if (!mem.trim()) return; try { await atelierApi.addMemory(mem); setMem(""); load(); } catch { toast.error("Souvenir non enregistré"); } };
  const del = async (id) => { await atelierApi.deleteMemory(id); load(); };
  return (
    <>
      <section data-testid="bunny-profile">
        <h3 className="mono">// QUI EST LE CAPITAINE {m.interview_done ? "· INTERVIEW FAITE" : "· INTERVIEW À FAIRE"}</h3>
        <p className="at-sub">Bunny lit ce profil avant chaque réponse. Corrige ou complète-le librement.</p>
        <div className="bn-prof">
          {m.fields.map((f) => (
            <label key={f.key}><small className="mono">{f.label.toUpperCase()}</small>
              <textarea rows={f.key === "vision" || f.key === "univers" ? 3 : 1} value={prof[f.key] || ""} onChange={(e) => setProf({ ...prof, [f.key]: e.target.value })} data-testid={`bunny-profile-${f.key}`} />
            </label>
          ))}
        </div>
        <button className="at-btn" onClick={save} data-testid="bunny-profile-save"><IoSaveOutline size={14} />Enregistrer le profil</button>
      </section>
      <section data-testid="bunny-memories">
        <h3 className="mono">// SES SOUVENIRS DE TOI · {m.memories.length}</h3>
        {!m.memories.length && <p className="at-sub">Aucun souvenir pour l'instant. Pendant vos discussions, Bunny te proposera d'en garder.</p>}
        <div className="bn-mems">
          {m.memories.slice().reverse().map((x) => (
            <div key={x.id} className="bn-mem" data-testid={`bunny-memory-${x.id}`}><span>{x.text}</span><small className="mono">{x.source === "manuel" ? "AJOUTÉ PAR TOI" : "APPRIS EN DISCUTANT"}</small>
              <button className="at-icon danger" onClick={() => del(x.id)} title="Oublier" data-testid={`bunny-memory-delete-${x.id}`}><IoTrashOutline size={13} /></button></div>
          ))}
        </div>
        <div className="at-inline bn-mem-add">
          <input value={mem} onChange={(e) => setMem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex. : Il écrit mieux la nuit, avec de la synthwave." data-testid="bunny-memory-input" />
          <button className="at-btn" onClick={add} data-testid="bunny-memory-add"><IoAdd size={14} />Retenir</button>
        </div>
      </section>
    </>
  );
}
