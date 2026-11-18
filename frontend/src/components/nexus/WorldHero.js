import { forwardRef, useEffect, useState } from "react";
import { IoHeart, IoHeartOutline, IoMusicalNotes } from "react-icons/io5";
import Box3D from "@/components/nexus/Box3D";

// L'écran d'entrée d'une œuvre, comme l'écran titre d'un jeu : chaque ambiance a sa propre mise en page.
// Le menu reprend les onglets du monde ; « Lancer » démarre l'œuvre.
const WorldHero = forwardRef(function WorldHero({ ws, item, box, cover, bg, catLabel, tabs, onTab, onLaunch, launchLabel, progress, onAmbient, fav, onFav }, ref) {
  const menu = [["__launch", launchLabel], ...tabs.filter(([k]) => k !== "all")];
  const [cur, setCur] = useState(0);
  // Clavier : ↑ ↓ pour choisir dans le menu, Entrée pour valider (comme une manette)
  useEffect(() => {
    const k = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName) || e.target?.isContentEditable || document.querySelector("[role=dialog],.reader-root,.cinema-root")) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setCur((c) => (c + 1) % menu.length); }
      if (e.key === "ArrowUp") { e.preventDefault(); setCur((c) => (c - 1 + menu.length) % menu.length); }
      if (e.key === "Enter" && document.activeElement === document.body) { e.preventDefault(); pick(menu[cur][0]); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  const pick = (k) => (k === "__launch" ? onLaunch() : onTab(k));
  const Menu = ({ className = "", num }) => (
    <nav className={"wh-menu " + className} aria-label="Menu de l'œuvre">
      {menu.map(([k, label], i) => (
        <button key={k} className={(i === cur ? "on " : "") + (k === "__launch" ? "go" : "")} onMouseEnter={() => setCur(i)} onFocus={() => setCur(i)} onClick={() => pick(k)} data-testid={`wh-${k}`}>
          {num && <i className="mono">{num(i)}</i>}<span>{label}</span>
        </button>
      ))}
    </nav>
  );
  const Extras = () => (
    <div className="wh-extras">
      {onAmbient && <button onClick={onAmbient} title="Écouter l'ambiance"><IoMusicalNotes size={16} /></button>}
      <button onClick={onFav} title={fav ? "Retirer des favoris" : "Ajouter aux favoris"} className={fav ? "on" : ""}>{fav ? <IoHeart size={16} /> : <IoHeartOutline size={16} />}</button>
    </div>
  );
  const Prog = () => (progress ? <p className="wh-prog mono">{progress.label}<span><i style={{ width: `${Math.round(progress.ratio * 100)}%` }} /></span></p> : null);
  const Title = ({ as: T = "h1" }) => <T className="wh-title" data-testid="detail-title">{item.title}</T>;

  let body;
  if (ws === "cinema") body = (
    <div className="wh-cine">
      <div className="wh-cine-txt">
        <p className="wh-k mono">{catLabel} · {new Date(item.created_at || Date.now()).getFullYear()}</p>
        <Title />
        {item.tagline && <p className="wh-tag">{item.tagline}</p>}
        {item.synopsis && <p className="wh-syn">{item.synopsis}</p>}
        <Prog /><Extras />
      </div>
      <Menu className="wh-dvd" />
    </div>
  );
  else if (ws === "vhs") body = (
    <div className="wh-vhs">
      <div className="wh-tv">
        <div className="wh-screen" style={bg ? { backgroundImage: `url(${bg})` } : undefined}>
          <span className="wh-osd mono">▶ PLAY<em>SP</em></span>
          <span className="wh-osd r mono">{String(new Date().getHours()).padStart(2, "0")}:{String(new Date().getMinutes()).padStart(2, "0")}</span>
          <div className="wh-screen-in">
            <Title />
            {item.tagline && <p className="wh-tag">{item.tagline}</p>}
            <Menu className="wh-vcr" num={(i) => String(i + 1).padStart(2, "0")} />
          </div>
        </div>
        <div className="wh-tv-foot mono"><span>STATION NEXUS</span><span>● REC</span></div>
      </div>
      <aside className="wh-vhs-side">
        <Box3D b={box} cover={cover} />
        {item.synopsis && <p className="wh-syn">{item.synopsis}</p>}
        <Prog /><Extras />
      </aside>
    </div>
  );
  else if (ws === "arcade") body = (
    <div className="wh-arc">
      {bg && <div className="wh-arc-art" style={{ backgroundImage: `url(${bg})` }} />}
      <div className="wh-arc-mid">
        <p className="wh-k mono">© {new Date(item.created_at || Date.now()).getFullYear()} STATION NEXUS</p>
        <Title />
        {item.tagline && <p className="wh-tag">{item.tagline}</p>}
        <Menu className="wh-pix" />
        <p className="wh-credit mono">CREDIT 01 · PLAYER 1</p>
        <Prog /><Extras />
      </div>
    </div>
  );
  else if (ws === "manga") body = (
    <div className="wh-manga">
      <div className="wh-panel p-art" style={cover ? { backgroundImage: `url(${cover})` } : undefined} />
      <div className="wh-panel p-title"><Title /><span className="wh-sfx" aria-hidden="true">ドン</span></div>
      {item.synopsis && <div className="wh-panel p-syn"><p className="wh-bubble">{item.synopsis}</p></div>}
      <div className="wh-panel p-menu"><Menu className="wh-ink" /><Prog /><Extras /></div>
      {bg && bg !== cover && <div className="wh-panel p-bg" style={{ backgroundImage: `url(${bg})` }} />}
    </div>
  );
  else if (ws === "vinyle") body = (
    <div className="wh-vin">
      <div className="wh-sleeve">
        <span className="wh-disc" aria-hidden="true" style={cover ? { "--lbl": `url(${cover})` } : undefined} />
        <span className="wh-cover" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>{!cover && item.title}</span>
      </div>
      <div className="wh-vin-txt">
        <p className="wh-k mono">FACE A · {catLabel}</p>
        <Title />
        {item.tagline && <p className="wh-tag">{item.tagline}</p>}
        <Menu className="wh-tracks" num={(i) => (i < 4 ? "A" + (i + 1) : "B" + (i - 3))} />
        <Prog /><Extras />
      </div>
    </div>
  );
  else body = (
    <div className="wh-book">
      <div className="wh-page l"><Box3D b={box} cover={cover} /></div>
      <div className="wh-page r">
        <p className="wh-k mono">{catLabel}</p>
        <Title />
        {item.tagline && <p className="wh-tag">{item.tagline}</p>}
        <span className="wh-orn" aria-hidden="true">❦</span>
        {item.synopsis && <p className="wh-syn">{item.synopsis}</p>}
        <Menu className="wh-toc" num={(i) => (i === 0 ? "" : ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][i - 1])} />
        <Prog /><Extras />
      </div>
    </div>
  );
  return <section ref={ref} className={"wh wsx-" + ws} data-testid="world-hero">{body}</section>;
});
export default WorldHero;
