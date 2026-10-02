import { useState } from "react";
import projects from "../data/projects";
import ProjectCard from "./ProjectCard";

const categories = ["All", ...new Set(projects.map((p) => p.category))];

export default function Projects() {
  const [active, setActive] = useState("All");

  const visible =
    active === "All"
      ? projects
      : projects.filter((project) => project.category === active);

  return (
    <section id="projects" className="section">
      <div className="container">
        <p className="label">02 / Projects</p>
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

      <div className="container">
        {visible.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
