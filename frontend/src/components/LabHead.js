// En-tête de page façon Rhine Lab : repère en chasse fixe, grand titre, filet avec le segment de couleur, crochets d'angle.
export default function LabHead({ code, label, title, icon, children, testid }) {
  return (
    <header className="lab-head" data-testid={testid ? `${testid}-head` : undefined}>
      <span className="lab-head-c tl" aria-hidden="true" /><span className="lab-head-c br" aria-hidden="true" />
      <p className="lab-head-k">STATION NEXUS <i>/</i> {label}{code && <b>{code}</b>}</p>
      <h1 className="lab-head-t font-display" data-testid={testid}>{icon && <span className="lab-head-ic">{icon}</span>}{title}</h1>
      <span className="lab-head-rule" aria-hidden="true" />
      {children}
    </header>
  );
}
