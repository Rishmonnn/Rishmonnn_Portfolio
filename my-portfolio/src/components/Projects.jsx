import { useState } from "react";
import projects from "../data/projects";
import ProjectCard from "./ProjectCard";
import RoseWindow from "./RoseWindow";
import designThree from "../assets/design-3.png";

const categories = ["All", ...new Set(projects.map((p) => p.category))];

export default function Projects() {
  const [active, setActive] = useState("All");
  const visible =
    active === "All"
      ? projects
      : projects.filter((project) => project.category === active);

  return (
    <section id="projects" className="section">
      <RoseWindow
        src={designThree}
        style={{
          top: "30%",
          right: "-15%",
          left: "auto",
          width: "600px",
          opacity: 1,
        }}
      />
      <RoseWindow
        src={designThree}
        style={{
          top: "70%",
          right: "auto",
          left: "-5%",
          width: "350px",
          opacity: 0.5,
        }}
      />

      <div className="container projects-layout">
        {/* STICKY SIDEBAR: Stays pinned on desktop */}
        <div className="projects-sticky-sidebar">
          <p className="label">03 / Projects</p>
          <h2 className="section-title">
            Selected <em>works</em>
          </h2>
          <div className="filters" role="group" aria-label="Filter projects">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${active === category ? "active" : ""}`}
                onClick={() => setActive(category)}
                aria-pressed={active === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLL CONTENT: Cards slide up beside the pinned sidebar */}
        <div className="projects-scroll-content">
          {visible.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
