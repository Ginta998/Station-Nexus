import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DOCS, DOC_ORDER } from "@/lib/legalDocs";
import { LEGAL } from "@/lib/legal";
import { useLegal } from "@/lib/useLegal";
import { useApp } from "@/context/AppContext";
import { Paras, visibleLines } from "@/components/LegalText";
import LegalNav from "@/components/LegalNav";

// Pages légales : /legal/mentions, /legal/cgu, /legal/cgv, /legal/confidentialite, /legal/cookies, /legal/communaute
export default function Legal() {
  const { doc } = useParams();
  const v = useLegal();
  const { isAdmin } = useApp();
  const key = DOCS[doc] ? doc : "mentions";
  const d = DOCS[key];
  useEffect(() => { window.scrollTo(0, 0); document.title = `${d.title} · Station Nexus`; }, [key, d.title]);
  return (
    <div className="lg-page" data-testid={`legal-${key}`}>
      <div className="lg-wrap">
        <LegalNav />
        <nav className="lg-tabs" aria-label="Documents légaux">
          {DOC_ORDER.map(([k, l]) => <Link key={k} to={`/legal/${k}`} className={k === key ? "on" : ""}>{l}</Link>)}
        </nav>
        <h1 className="lg-title">{d.title}</h1>
        <p className="lg-meta mono">Version du {LEGAL.maj}</p>
        {d.sections.filter((s) => visibleLines(s.p, v, isAdmin).length).map((s, i) => (
          <section key={i} className={"lg-sec" + (s.box ? " box" : "")}>
            {s.h && <h2>{s.h}</h2>}
            <Paras lines={s.p} />
          </section>
        ))}
      </div>
    </div>
  );
}
