// Splashs premium alignés sur le favicon (réticule HUD + 天) et la DA cosmique
const Brand = ({ delay }) => (
  <div className="pi-brand" style={{ animationDelay: `${delay}s` }}>
    <span className="pi-brand-w">STATION<b>NEXUS</b></span>
    <span className="pi-brand-s">STATION · 天国 · ONLINE</span>
  </div>
);
const Corners = () => <div className="pi-corners" aria-hidden="true"><i /><i /><i /><i /></div>;

const Reticle = ({ size = "46vmin", delay = 0 }) => (
  <svg className="pi-reticle" viewBox="0 0 200 200" style={{ width: size, height: size, "--d": `${delay}s` }} aria-hidden="true">
    <circle className="r1" cx="100" cy="100" r="92" />
    <circle className="r2" cx="100" cy="100" r="78" />
    <circle className="r3" cx="100" cy="100" r="62" />
    <circle className="r4" cx="100" cy="100" r="48" />
    <g className="ticks">{Array.from({ length: 48 }).map((_, i) => <line key={i} x1="100" y1="4" x2="100" y2={i % 4 ? 9 : 14} transform={`rotate(${i * 7.5} 100 100)`} />)}</g>
    <g className="cross"><line x1="100" y1="0" x2="100" y2="30" /><line x1="100" y1="170" x2="100" y2="200" /><line x1="0" y1="100" x2="30" y2="100" /><line x1="170" y1="100" x2="200" y2="100" /></g>
    <circle className="dot" cx="38" cy="132" r="2.6" />
  </svg>
);

export function HudAnim() {
  return (
    <div className="pi-root pi-hud">
      <Corners />
      <div className="pi-scan" />
      <div className="pi-stack">
        <div className="pi-emblem">
          <Reticle />
          <span className="pi-kanji">天</span>
        </div>
        <Brand delay={2.1} />
      </div>
      <div className="pi-read mono"><span>SYS.BOOT</span><span>NAV-LINK ▸ OK</span><span>天-07</span></div>
    </div>
  );
}

export function WarpAnim() {
  const streaks = Array.from({ length: 56 });
  return (
    <div className="pi-root pi-warp">
      <div className="pi-streaks" aria-hidden="true">
        {streaks.map((_, i) => <i key={i} style={{ transform: `rotate(${(i * 360) / streaks.length + (i % 3) * 2}deg)`, "--len": `${24 + (i % 5) * 9}vmax` }}><b style={{ animationDelay: `${(i % 7) * 0.06}s` }} /></i>)}
      </div>
      <div className="pi-flash" />
      <div className="pi-stack">
        <div className="pi-emblem late">
          <Reticle size="40vmin" delay={1.3} />
          <span className="pi-kanji">天</span>
        </div>
        <Brand delay={2.2} />
      </div>
      <Corners />
    </div>
  );
}

export function EclipseAnim() {
  return (
    <div className="pi-root pi-eclipse">
      <div className="pi-stack">
        <div className="pi-planet">
          <div className="corona" />
          <div className="disk"><span className="pi-kanji">天</span></div>
          <span className="diamond" />
        </div>
        <Brand delay={2.3} />
      </div>
      <div className="pi-horizon" />
      <Corners />
    </div>
  );
}
