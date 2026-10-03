import useReveal from "../hooks/useReveal";
import experiences from "../data/experience";

function CommitNode({ exp }) {
  const nodeRef = useReveal();

  return (
    <div className="commit-node reveal" ref={nodeRef}>
      <div className="commit-marker" aria-hidden="true">
        <div className="commit-dot"></div>
      </div>

      <div className="commit-content">
        <div className="commit-meta">
          <span className="commit-rev">{exp.rev}</span>
          <span className="commit-date">{exp.period}</span>
        </div>
        <h3 className="commit-role">{exp.role}</h3>
        <p className="commit-company">{exp.company}</p>
        <p className="commit-desc">{exp.description}</p>

        <div className="tech-list">
          {exp.tech.map((t) => (
            <span key={t} className="tech">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  const headerRef = useReveal();

  return (
    <section id="experience" className="section">
      <div className="container experience-layout">
        {/* STICKY SIDEBAR: Stays pinned on desktop */}
        <div className="experience-sticky-sidebar reveal" ref={headerRef}>
          <p className="label">02 / Revision Log</p>
          <h2 className="section-title">
            Hardware <br />
            <em>Timeline</em>
          </h2>
        </div>

        {/* SCROLL CONTENT: The commit log slides up beside it */}
        <div className="commit-log">
          <div className="commit-track" aria-hidden="true"></div>

          {experiences.map((exp) => (
            <CommitNode key={exp.rev} exp={exp} />
          ))}
        </div>
      </div>
    </section>
  );
}
