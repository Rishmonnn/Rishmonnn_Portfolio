import { useEffect, useRef } from "react";

/* ---------- motion settings (tweak these) ---------- */
const SCROLL_SPEED = 0.12; // pattern moves at 12% of scroll speed (0 = fixed, 1 = moves with the page)
const DRIFT_X = 3; // ambient sideways drift in px/second (0 = off)
const DRIFT_Y = 1.5; // ambient vertical drift in px/second (0 = off)
const EASE = 0.08; // 0.02 = very floaty and laggy, 1 = no smoothing

export default function PatternBackground() {
  const tilesRef = useRef(null);

  useEffect(() => {
    const el = tilesRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return; // visitors who ask for less motion get a still pattern

    let rafId = 0;
    let last = performance.now();
    let driftX = 0;
    let driftY = 0;
    // Start in sync with the current scroll position so a mid-page reload doesn't jump
    let current = window.scrollY * SCROLL_SPEED;

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Ease toward the scroll target. The pow() keeps the feel the same at any frame rate.
      const target = window.scrollY * SCROLL_SPEED;
      const k = 1 - Math.pow(1 - EASE, dt * 60);
      current += (target - current) * k;

      driftX += DRIFT_X * dt;
      driftY += DRIFT_Y * dt;

      // Scrolling down moves the pattern up, but slower than the content
      el.style.backgroundPosition = `${-driftX}px ${-(current + driftY)}px`;
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="pattern-bg" aria-hidden="true">
      <div className="pattern-tiles" ref={tilesRef} />
      <div className="pattern-shade" />
    </div>
  );
}
