import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

const links = [
  { href: "#about", label: "About", n: "01" },
  { href: "#projects", label: "Projects", n: "02" },
  { href: "#contact", label: "Contact", n: "03" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(0);
  const { scrollYProgress } = useScroll(); // whole-page progress, 0 to 1

  // Only updates React state when the rounded number actually changes
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setPercent(Math.round(v * 100));
  });

  return (
    <header className="navbar">
      <nav className="container nav-inner" aria-label="Main">
        <a href="#home" className="logo" aria-label="Back to top">
          YN
        </a>

        <ul className={`nav-links ${open ? "open" : ""}`}>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setOpen(false)}>
                <span>{link.n}</span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <span className="label scroll-readout">
            Scroll {String(percent).padStart(3, "0")}%
          </span>
          <button
            className="menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      <motion.div
        className="progress-bar"
        style={{ scaleX: scrollYProgress }}
      />
    </header>
  );
}
