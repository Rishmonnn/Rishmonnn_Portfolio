import useReveal from "../hooks/useReveal";
import RoseWindow from "./RoseWindow";

const skills = [
  "C / C++",
  "Python",
  "Verilog",
  "Embedded Systems",
  "Linux",
  "React",
  "Git",
  "PCB Design",
];

export default function About() {
  const ref = useReveal();

  return (
    <section id="about" className="section">
      <RoseWindow />
      <div className="container reveal" ref={ref}>
        <p className="label">01 / About</p>
        <h2 className="section-title">
          About <em>me</em>
        </h2>

        <div className="about-grid">
          <div className="about-text">
            <p>
              Write two or three short paragraphs: who you are, what drew you to
              computer engineering, and what you are looking for next.
            </p>
            <p>
              Mention the thing that connects your work, such as a love of
              low-level systems or building things that sit between hardware and
              software.
            </p>
          </div>

          <div>
            <p className="label skills-label">Stack</p>
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
    </section>
  );
}
