import useReveal from "../hooks/useReveal";
import experiences from "../data/experience";

export default function Experience() {
  const ref = useReveal();

  return (
    <section id="experience" className="section">
      <div className="container reveal" ref={ref}>
        <p className="label">02 / Revision Log</p>
        <h2 className="section-title">
          Hardware <em>Timeline</em>
        </h2>

        <div style={{ display: "grid", gap: "2.5rem", maxWidth: "840px" }}>
          {experiences.map((exp) => (
            <div
              key={exp.rev}
              style={{
                position: "relative",
                padding: "2rem",
                background: "rgba(10, 10, 12, 0.6)",
                border: "1px solid var(--line)",
                borderLeft: "3px solid var(--ember)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.8rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                }}
              >
                <span
                  style={{ color: "var(--ember)", letterSpacing: "0.15em" }}
                >
                  {exp.rev} // {exp.period}
                </span>
                <span>{exp.company}</span>
              </div>

              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  marginBottom: "0.6rem",
                }}
              >
                {exp.role}
              </h3>

              <p
                style={{
                  color: "#b9b5ad",
                  marginBottom: "1.2rem",
                  fontSize: "1.05rem",
                }}
              >
                {exp.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {exp.tech.map((t) => (
                  <span
                    key={t}
                    className="skill"
                    style={{ fontSize: "0.7rem", padding: "0.3rem 0.7rem" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
