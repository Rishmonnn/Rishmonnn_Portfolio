import { useState } from "react";
import useReveal from "../hooks/useReveal";
import useInView from "../hooks/useInView";
import RoseWindow from "./RoseWindow";
import OperatorId from "./OperatorId";
import DecryptText from "./DecryptText";
import TelemetryStrip from "./TelemetryStrip";
import SkillOrbit from "./SkillOrbit";
import skills from "../data/skills";

import designOne from "../assets/design-1.png";
import designTwo from "../assets/design-2.png";

// Each string is one paragraph. They decrypt one after another.
const bio = [
  "I am a Computer Engineering undergraduate at PHINMA COC and the Secretary of the CpE Student Body Organization. I specialize in the intersection where high-level software architecture meets low-level hardware control.",
  "My work revolves around building systems that solve tangible problems from architecting AERIS, a full-stack student information and AI-advising platform, to prototyping AquaReserve, an automated ESP32-driven rainwater harvesting and UV-C sterilization system. I don't just want to write code; I want to understand the physical circuits and state-machine logic executing it.",
  "Whether I am breadboarding 7400-series logic gates, theorycrafting complex system mechanics and damage formulas, or pacing myself through a 10-week half-marathon training block, my approach remains the same: break the system down to its core components, optimize the variables, and build it back up to run flawlessly.",
];

export default function About() {
  const ref = useReveal();

  // Decrypt sequencing: paragraph i starts once the bio is on screen
  // AND paragraph i-1 has finished.
  const [bioRef, bioInView] = useInView({ threshold: 0.25 });
  const [step, setStep] = useState(0);

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

        <div className="about-grid">
          {/* Left column: decrypting bio + telemetry */}
          <div className="about-left">
            <div className="about-text" ref={bioRef}>
              {bio.map((text, i) => (
                <DecryptText
                  key={i}
                  text={text}
                  active={bioInView && step >= i}
                  onDone={() => setStep((s) => Math.max(s, i + 1))}
                />
              ))}
            </div>

            <TelemetryStrip />
          </div>

          {/* Right column: interactive ID card + skill orbit */}
          <div className="about-right">
            <OperatorId />

            <div className="skills-panel">
              <div className="panel-header">
                <span className="panel-title">// CORE_MODULES</span>
                <span className="status-indicator">ONLINE</span>
              </div>
              <SkillOrbit skills={skills} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
