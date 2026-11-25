def rep(p,a,b,cnt=1):
    s=open(p).read(); assert a in s, (p,a[:60]); open(p,'w').write(s.replace(a,b,cnt))
F='/app/frontend/src/components/'
A=F+'atelier/AlexCore.js'
# 1) la barre de musique qui apparaît ne fait plus perdre sa page : on se recale sur le passage lu
rep(A,'''  useEffect(() => { const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 30); return () => clearTimeout(t); }, [!!musicBar, !!musicMini]); // eslint-disable-line react-hooks/exhaustive-deps''','''  const anchorR = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const si = anchorR.current; measure();
      const el = si != null && flow.current?.querySelector(`[data-si="${si}"]`); if (!el) return;
      const g = geom(); const pg = Math.max(0, Math.floor((el.offsetLeft - g.pad + 4) / g.step)); const sp = Math.floor(pg / g.p) * g.p;
      setPage(sp); g.el.scrollLeft = Math.round(sp * g.step);
    }, 30);
    return () => clearTimeout(t);
  }, [!!musicBar, !!musicMini]); // eslint-disable-line react-hooks/exhaustive-deps''')
rep(A,'''  useEffect(() => {
    if (!flow.current) return;
    const g = geom(); const left = Math.round(spread * g.step);''','''  // le premier passage visible de la page : sert de repère si la mise en page change
  useEffect(() => { const fl = flow.current; if (!fl) return; const g = geom(); const left = spread * g.step + g.pad - 4;
    const el = [...fl.querySelectorAll("[data-si]")].find((e) => e.offsetLeft + e.offsetWidth > left); anchorR.current = el ? el.dataset.si : null; }, [spread, pages]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!flow.current) return;
    const g = geom(); const left = Math.round(spread * g.step);''')
# 2) bouton musique du texte : une icône lecture bien visible
rep(A,'''data-testid="alex-cue"><IoMusicalNotes size={14} /> <span>{b.x}</span></button>''','''data-testid="alex-cue"><span className="ax-cue-play"><IoPlay size={12} /></span><IoMusicalNotes size={14} /> <span>{b.x}</span></button>''')
open(F+'atelier/alexandrie.css','a').write('''.ax-cue-play{flex-shrink:0;width:24px;height:24px;margin-left:-6px;border-radius:50%;display:grid;place-items:center;background:var(--acc,var(--brand));color:#fff;box-shadow:0 2px 8px color-mix(in srgb,var(--acc,var(--brand)) 45%,transparent)}
.ax-cue-play svg{margin-left:2px}
''')
# 3) la tranche prend la couleur choisie dans l'éditeur (Couleur)
rep(F+'nexus/NexusHome.js','''    return { id: it.id, it, title: it.title || "Sans titre", sub: it.tagline || "", format: fmtOfCreation(it, c?.label),''','''    return { id: it.id, it, title: it.title || "Sans titre", sub: it.tagline || "", format: fmtOfCreation(it, c?.label), color: hexHue(it.accent),''')
rep(F+'nexus/NexusHome.js','''export const fmtOfCreation = (it, catLabel = "") => {''','''// teinte (0-360) d'une couleur #rrggbb : la tranche suit la couleur de l'œuvre
const hexHue = (h) => {
  const m = /^#?([\\da-f]{2})([\\da-f]{2})([\\da-f]{2})$/i.exec(h || ""); if (!m) return undefined;
  const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0; const k = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return Math.round((k * 60 + 360) % 360);
};
export const fmtOfCreation = (it, catLabel = "") => {''')
print('ok')
