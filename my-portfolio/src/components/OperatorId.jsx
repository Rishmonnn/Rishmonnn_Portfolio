import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import useReveal from "../hooks/useReveal";
import profileImg from "../assets/profile.jpg";

/* ---------- EDIT THESE ---------- */

// Same placeholders as Contact.jsx. Replace with your real links.
const CHANNELS = [
  { key: "COMMS", label: "you@example.com", href: "mailto:you@example.com" },
  {
    key: "SOURCE",
    label: "github.com/your-username",
    href: "https://github.com/your-username",
    external: true,
  },
  {
    key: "NETWORK",
    label: "linkedin.com/in/your-username",
    href: "https://linkedin.com/in/your-username",
    external: true,
  },
];

/* ---------- feel (tweak these) ---------- */
const MAX_TILT = 12; // degrees the card leans toward the cursor
const SPRING = { stiffness: 180, damping: 18, mass: 0.6 }; // lower stiffness = floatier

// The shine layers. Both faces get the same pair.
function Sheen({ position }) {
  return (
    <>
      <motion.div
        className="id-holo"
        style={{ backgroundPosition: position }}
        aria-hidden="true"
      />
      <div className="id-glint" aria-hidden="true" />
    </>
  );
}

export default function OperatorId() {
  const revealRef = useReveal(); // fade-up on scroll, same as before
  const sceneRef = useRef(null); // used to measure the card for the tilt
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);

  /* Cursor position inside the card, from -0.5 (left/top) to 0.5 (right/bottom) */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  // Move the cursor right, the right edge dips away. Move it down, the bottom edge dips away.
  const rotateY = useTransform(sx, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]);

  // The holographic band slides to follow the cursor
  const holoPosition = useTransform(
    [sx, sy],
    ([x, y]) => `${(x + 0.5) * 100}% ${(y + 0.5) * 100}%`,
  );

  function handlePointerMove(event) {
    // Touch drags are for scrolling, not tilting
    if (reduce || event.pointerType === "touch") return;
    const rect = sceneRef.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function resetTilt() {
    px.set(0);
    py.set(0);
  }

  // Clicking the card body flips it, but clicks on links/buttons do their own job
  function handleSceneClick(event) {
    if (event.target.closest("a, button")) return;
    setFlipped((f) => !f);
  }

  return (
    <div className="id-reveal reveal" ref={revealRef}>
      <div
        className="id-scene"
        ref={sceneRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        onClick={handleSceneClick}
      >
        <motion.div
          className="id-tilt"
          style={reduce ? undefined : { rotateX, rotateY }}
        >
          <motion.div
            className="id-flip"
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
            }
          >
            {/* ================= FRONT ================= */}
            <div
              className="id-face id-front operator-id landscape"
              aria-hidden={flipped}
            >
              <div className="id-punch-hole"></div>
              <button
                type="button"
                className="id-flip-btn"
                onClick={() => setFlipped(true)}
                tabIndex={flipped ? -1 : 0}
                aria-label="Flip the card to see contact channels"
              >
                FLIP ↻
              </button>

              <div className="id-main-content">
                <div className="id-photo-container">
                  <img
                    src={profileImg}
                    alt="Operator Biometric"
                    className="id-photo"
                  />
                  <div className="id-photo-overlay">
                    <div className="crosshair-x"></div>
                    <div className="crosshair-y"></div>
                  </div>
                  <div className="id-scan" aria-hidden="true"></div>
                </div>

                <div className="id-data-section">
                  <div className="id-header">
                    <span className="id-dept">PHINMA COC // CPE</span>
                    <span className="id-status">ACTIVE</span>
                  </div>

                  <div className="id-details">
                    <div className="id-data-group">
                      <p className="id-label">ID_OBJ</p>
                      <p className="id-value">AJIAS, RICHMOND D.</p>
                    </div>

                    <div className="id-data-group">
                      <p className="id-label">DESIGNATION</p>
                      <p className="id-value">Systems Eng / CpESBO Sec</p>
                    </div>

                    <div className="id-data-group">
                      <p className="id-label">CLEARANCE</p>
                      <p className="id-value ember-text">LEVEL-04 // ROOT</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="id-footer-row">
                <div className="id-barcode" aria-hidden="true"></div>
                <p className="id-serial">SN: 2006-0825-REV3</p>
              </div>

              <Sheen position={holoPosition} />
            </div>

            {/* ================= BACK ================= */}
            <div
              className="id-face id-back operator-id landscape"
              aria-hidden={!flipped}
            >
              <div className="id-punch-hole"></div>
              <button
                type="button"
                className="id-flip-btn"
                onClick={() => setFlipped(false)}
                tabIndex={flipped ? 0 : -1}
                aria-label="Flip the card back to the front"
              >
                ↻ FRONT
              </button>

              <div className="id-header">
                <span className="id-dept">COMMS // CHANNELS</span>
                <span className="id-status">OPEN</span>
              </div>

              <ul className="id-channels">
                {CHANNELS.map((channel) => (
                  <li key={channel.key}>
                    <span className="id-label">{channel.key}</span>
                    <a
                      className="id-link"
                      href={channel.href}
                      tabIndex={flipped ? 0 : -1}
                      {...(channel.external
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                    >
                      {channel.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="id-footer-row">
                <div className="id-barcode" aria-hidden="true"></div>
                <p className="id-serial">REV3 // VERIFIED</p>
              </div>

              <Sheen position={holoPosition} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
