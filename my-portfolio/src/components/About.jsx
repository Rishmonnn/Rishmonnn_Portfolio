import useReveal from "../hooks/useReveal";
import RoseWindow from "./RoseWindow";
import OperatorId from "./OperatorId";

import designOne from "../assets/design-1.png";
import designTwo from "../assets/design-2.png";

const skills = [
  "React.js / Vite",
  "Python / Flask",
  "C++ / Arduino",
  "ESP32 Architecture",
  "MySQL",
  "HTML5 Canvas",
  "Digital Logic (TTL)",
  "Systems Architecture",
];

export default function About() {
  const ref = useReveal();

  return (
    <section id="about" className="section">
      <RoseWindow src={designOne} />
      <div className="container reveal" ref={ref}>
        <p className="label">01 / About</p>
        <h2 className="section-title">
          About <em>me</em>
        </h2>

        <RoseWindow
          src={designTwo}
          style={{
            top: "10%",
            right: "auto",
            left: "-5%",
            width: "500px",
            opacity: 0.3,
          }}
        />

        <div
          className="about-grid"
          style={{ alignItems: "stretch", gridTemplateColumns: "1fr 1fr" }}
        >
          {/* Left Column: Description */}
          <div className="about-text">
            <p>
              I am a Computer Engineering undergraduate at PHINMA COC and the
              Secretary of the CpE Student Body Organization. I specialize in
              the intersection where high-level software architecture meets
              low-level hardware control.
            </p>
            <p>
              My work revolves around building systems that solve tangible
              problems from architecting AERIS, a full-stack student information
              and AI-advising platform, to prototyping AquaReserve, an automated
              ESP32-driven rainwater harvesting and UV-C sterilization system. I
              don't just want to write code; I want to understand the physical
              circuits and state-machine logic executing it.
            </p>
            <p>
              Whether I am breadboarding 7400-series logic gates, theorycrafting
              complex system mechanics and damage formulas, or pacing myself
              through a 10-week half-marathon training block, my approach
              remains the same: break the system down to its core components,
              optimize the variables, and build it back up to run flawlessly.
            </p>
          </div>

          {/* Right Column: Landscape ID & Skills Panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              height: "100%",
            }}
          >
            <OperatorId />

            <div
              className="skills-panel"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                marginTop: 0,
              }}
            >
              <div className="panel-header">
                <span className="panel-title">// CORE_MODULES</span>
                <span className="status-indicator">ONLINE</span>
              </div>
              <ul className="skills">
                {skills.map((skill) => (
                  <li key={skill} className="skill">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
