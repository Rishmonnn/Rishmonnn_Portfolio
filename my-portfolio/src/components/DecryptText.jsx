import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/* ---------- glitch alphabet ---------- */
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const NOISE = "01#%/<>=+";

const pick = (set) => set[Math.floor(Math.random() * set.length)];

// Swap a character for a random one of the same kind, so word lengths and
// capital letters stay roughly the same while the text is "encrypted".
// Punctuation is left alone so you can already see the sentence skeleton.
function glitch(ch) {
  if (Math.random() < 0.22) return pick(NOISE);
  if (/[a-z]/.test(ch)) return pick(LOWER);
  if (/[A-Z]/.test(ch)) return pick(UPPER);
  if (/[0-9]/.test(ch)) return pick(DIGITS);
  return ch;
}

/**
 * A paragraph that unscrambles from glitch characters into the real text.
 *
 * Props
 *   text            the final sentence(s)
 *   active          start decrypting when this becomes true
 *   onDone          called once, when the last character locks in
 *   charsPerSecond  decrypt speed
 *   tail            how many glitch characters trail the "decoding head"
 *
 * Why it is built this way:
 *  - The real text is rendered twice: once invisible (.decrypt-sizer) to
 *    reserve the exact final height, and once screen-reader-only (.sr-only)
 *    so assistive tech always reads the real sentence, never the noise.
 *  - Only plain text changes. No per-letter <span>s, opacity or transforms,
 *    because those would break your gradient-pulse (background-clip: text)
 *    on .about-text.
 */
export default function DecryptText({
  text,
  active = false,
  onDone,
  charsPerSecond = 180,
  tail = 16,
  className = "",
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState("");
  const [finished, setFinished] = useState(false);

  // Keep the latest onDone without restarting the animation when it changes
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    if (!active || reduce) return;

    let raf = 0;
    let start;
    let lastTick = 0;
    let lastRevealed = -1;

    function frame(now) {
      start ??= now;
      const revealed = Math.min(
        text.length,
        Math.floor(((now - start) / 1000) * charsPerSecond),
      );

      if (revealed >= text.length) {
        setDisplay(text);
        setFinished(true);
        doneRef.current?.();
        return;
      }

      // Re-roll the glitch characters about every 45ms (not every frame, which
      // would look like static), or right away when a new letter locks in.
      if (revealed !== lastRevealed || now - lastTick > 45) {
        const locked = text.slice(0, revealed);
        const noise = text
          .slice(revealed, revealed + tail)
          .replace(/\S/g, (c) => glitch(c));
        setDisplay(locked + noise);
        lastTick = now;
        lastRevealed = revealed;
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, reduce, text, charsPerSecond, tail]);

  // Visitors who prefer reduced motion just get the finished text
  const shown = reduce || finished ? text : display;

  return (
    <p className={`decrypt ${className}`.trim()}>
      <span className="sr-only">{text}</span>
      <span className="decrypt-sizer" aria-hidden="true">
        {text}
      </span>
      <span className="decrypt-live" aria-hidden="true">
        {shown}
      </span>
    </p>
  );
}
