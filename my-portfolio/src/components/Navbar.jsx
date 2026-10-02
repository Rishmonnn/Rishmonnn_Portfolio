import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

const links = [
  { href: "#about", label: "About", n: "01" },
  { href: "#experience", label: "Logs", n: "02" },
  { href: "#projects", label: "Projects", n: "03" },
  { href: "#contact", label: "Contact", n: "04" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(0);
  const [statusTag, setStatusTag] = useState("ONLINE");
  const [statusColor, setStatusColor] = useState("var(--muted)");

  const { scrollYProgress } = useScroll(); // whole-page progress, 0 to 1

  // Updates state, status tags, and readout colors based on scroll depth
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const p = Math.round(v * 100);
    setPercent(p);

    if (p < 30) {
      setStatusTag("ONLINE");
      setStatusColor("var(--muted)");
    } else if (p < 70) {
      setStatusTag("STABLE");
      setStatusColor("var(--bone)");
    } else if (p < 95) {
      setStatusTag("WARP");
      setStatusColor("var(--ember)");
    } else {
      setStatusTag("CRITICAL");
      setStatusColor("#ff3333");
    }
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
          <span
            className="label scroll-readout"
            style={{ color: statusColor, transition: "color 0.3s ease" }}
          >
            SYS:// {String(percent).padStart(3, "0")}% [{statusTag}]
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
