import { useState } from "react";

/*
 * Three concentric rings. Inner rings spin faster, like an accretion disk.
 * `offset` rotates where each ring's first chip starts so the chips don't
 * line up in a row.
 */
const RINGS = [
  { duration: 26, offset: 45 }, // 0: inner
  { duration: 42, offset: 60 }, // 1: middle
  { duration: 64, offset: 90 }, // 2: outer
];

// Draw the outer ring first so inner chips paint on top of it
const DRAW_ORDER = [2, 1, 0];

export default function SkillOrbit({ skills }) {
  const [active, setActive] = useState(null);

  return (
    <>
      <div className="orbit-wrap">
        <div
          className="orbit"
          role="group"
          aria-label="Skill modules orbiting a core"
        >
          <div className="orbit-core" aria-hidden="true" />

          {DRAW_ORDER.map((ringIndex) => {
            const ringSkills = skills.filter((s) => s.ring === ringIndex);
            const { duration, offset } = RINGS[ringIndex];

            return (
              <div
                key={ringIndex}
                className={`orbit-ring orbit-ring-${ringIndex}`}
                data-paused={active?.ring === ringIndex}
                style={{ "--dur": `${duration}s` }}
              >
                {ringSkills.map((skill, i) => {
                  // Spread the chips evenly around the ring, then place each
                  // one on the circle using percentages of the ring's box.
                  const angle = (360 / ringSkills.length) * i + offset;
                  const rad = (angle * Math.PI) / 180;
                  const left = 50 + 50 * Math.cos(rad);
                  const top = 50 + 50 * Math.sin(rad);
                  const isActive = active?.name === skill.name;

                  return (
                    <div
                      key={skill.name}
                      className="orbit-chip"
                      style={{ left: `${left}%`, top: `${top}%` }}
                    >
                      <button
                        type="button"
                        className={`orbit-chip-inner${isActive ? " is-active" : ""}`}
                        aria-label={skill.name}
                        onPointerEnter={() => setActive(skill)}
                        onPointerLeave={(e) => {
                          // On touch screens, keep the last tapped chip selected
                          if (e.pointerType === "mouse") setActive(null);
                        }}
                        onFocus={() => setActive(skill)}
                        onBlur={() => setActive(null)}
                        onClick={() => setActive(skill)}
                      >
                        {skill.short}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="orbit-readout" aria-live="polite">
          {active ? (
            <>
              <span className="orbit-readout-name">{active.name}</span>
              <span className="orbit-readout-note">{active.note}</span>
            </>
          ) : (
            <span className="orbit-readout-note">
              Hover a module to pause its ring and see what I used it for.
            </span>
          )}
        </div>
      </div>

      {/* Plain list for phones and small tablets (CSS swaps which one shows) */}
      <ul className="skills skills-fallback">
        {skills.map((skill) => (
          <li key={skill.name} className="skill">
            {skill.name}
          </li>
        ))}
      </ul>
    </>
  );
}
