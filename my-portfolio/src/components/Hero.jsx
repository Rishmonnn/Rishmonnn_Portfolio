import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { HERO_RUNWAY_VH } from "../config";

export default function Hero() {
  const ref = useRef(null);

  // 0 when the hero starts scrolling, 1 when its runway ends.
  // This matches the "progress" the black hole uses.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Text fades and drifts up as you begin to fall in
  const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.45], [0, -80]);

  return (
    <section
      id="home"
      ref={ref}
      className="hero-runway"
      style={{ height: `${HERO_RUNWAY_VH * 100}vh` }}
    >
      <div className="hero-stage">
        <div className="container">
          <motion.div className="hero-copy" style={{ opacity, y }}>
            <p className="label">00 / Initialize</p>
            <h1 className="hero-name">
              <span>Richmond</span>
              <span>Ajias</span>
            </h1>
            <p className="hero-role">
              Computer engineer. I design the hardware and write the software
              that makes it think.
            </p>
            <a href="#projects" className="btn btn-primary">
              Descend ↓
            </a>
          </motion.div>
        </div>

        <motion.div className="scroll-hint label" style={{ opacity }}>
          Scroll to fall in
        </motion.div>
      </div>
    </section>
  );
}
