import { useEffect, useRef, useState } from "react";

/**
 * Tells you when an element has scrolled into view.
 *
 *   const [ref, inView] = useInView({ threshold: 0.3 });
 *   <div ref={ref}>...</div>
 *
 * Unlike useReveal (which only adds a CSS class), this gives you a boolean
 * so React components can start an animation at the right moment.
 * With once: true (the default) it flips to true a single time and stops watching.
 */
export default function useInView({ threshold = 0.3, once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Very old browsers: skip the animation gate and just show everything
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, inView];
}
