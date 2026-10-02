import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";

export default function ProjectCard({ project, index }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { title, description, category, year, tech, live, code } = project;

  // 0 = card just entering at the bottom, 0.5 = centered, 1 = leaving at the top
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const dir = index % 2 === 0 ? 1 : -1; // alternate the tilt direction
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [38, 0, -38]);
  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [14 * dir, 0, -14 * dir],
  );
  const rotateZ = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [5 * dir, 0, -5 * dir],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.82, 1, 0.82]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0, 1, 1, 0],
  );

  return (
    <div className="card-stage" ref={ref}>
      <motion.article
        className={`pcard ${index % 2 === 0 ? "pcard-dark" : "pcard-light"}`}
        style={
          reduce ? undefined : { rotateX, rotateY, rotateZ, scale, opacity }
        }
      >
        <div className="pcard-top label">
          <span>
            {String(index + 1).padStart(2, "0")} / {category}
          </span>
          <span>{year}</span>
        </div>

        <div className="pcard-main">
          <div className="pcard-text">
            <h3 className="pcard-title">{title}</h3>
            <p>{description}</p>
            <ul className="tech-list">
              {tech.map((item) => (
                <li key={item} className="tech">
                  {item}
                </li>
              ))}
            </ul>
            <div className="project-links">
              <a href={live} target="_blank" rel="noreferrer">
                Live ↗
              </a>
              <a href={code} target="_blank" rel="noreferrer">
                Code ↗
              </a>
            </div>
          </div>

          {/* Pointed-arch window. Swap the glyph for <img src=... alt=... /> later */}
          <div className="arch" aria-hidden="true">
            <span className="arch-glyph">{title.charAt(0)}</span>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
