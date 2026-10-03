import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import useInView from "../hooks/useInView";
import projects from "../data/projects";

/* ---------- EDIT THESE ---------- */

// The line under the counters. One short phrase about what you're on right now.
const CURRENTLY = "AquaReserve prototype // AERIS architecture";

const stats = [
  // Pulled live from your projects data, so it updates when you add a project
  { label: "Systems shipped", value: projects.length },
  // TODO: replace with your real number
  { label: "Gates breadboarded", value: 24 },
  // From your bio: the 10-week half-marathon block
  { label: "Training weeks", value: 10 },
];

/* ---------- count-up number ---------- */
function Counter({ value, active, duration = 1600 }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active || reduce) return;

    let raf = 0;
    let start;

    function frame(now) {
      start ??= now;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // fast start, soft landing
      setN(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, reduce, value, duration]);

  const shown = reduce ? value : n;

  return (
    <>
      <span aria-hidden="true">{String(shown).padStart(2, "0")}</span>
      <span className="sr-only">{value}</span>
    </>
  );
}

export default function TelemetryStrip() {
  const [ref, inView] = useInView({ threshold: 0.35 });

  return (
    <div className="telemetry" ref={ref}>
      <div className="panel-header">
        <span className="panel-title">// LIVE_TELEMETRY</span>
        <span className="status-indicator">SYNCED</span>
      </div>

      <div className="telemetry-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="telemetry-cell">
            <span className="telemetry-value">
              <Counter value={stat.value} active={inView} />
            </span>
            <span className="telemetry-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <p className="telemetry-now">
        <span className="telemetry-now-key">CURRENTLY:</span>
        {CURRENTLY}
        <span className="telemetry-caret" aria-hidden="true" />
      </p>
    </div>
  );
}
