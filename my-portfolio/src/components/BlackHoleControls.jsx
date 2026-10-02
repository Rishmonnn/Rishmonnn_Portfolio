import { useState } from "react";

export default function BlackHoleControls({ settings, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 1000 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn"
        style={{
          background: "rgba(10, 10, 12, 0.85)",
          backdropFilter: "blur(8px)",
          borderColor: "var(--ember)",
        }}
      >
        {isOpen ? "Close Config [X]" : "⚙ Reactor HUD"}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: 0,
            width: "280px",
            background: "rgba(10, 10, 12, 0.95)",
            border: "1px solid var(--line)",
            backdropFilter: "blur(12px)",
            padding: "1.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--bone)",
            display: "grid",
            gap: "1.2rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
          }}
        >
          <p
            style={{
              color: "var(--ember)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            // REACTOR TELEMETRY
          </p>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Orbit Velocity: {settings.speed}x</span>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={settings.speed}
              onChange={(e) => onChange("speed", parseFloat(e.target.value))}
              style={{ accentColor: "var(--ember)", cursor: "pointer" }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Thermal Glow: {settings.glow}x</span>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.1"
              value={settings.glow}
              onChange={(e) => onChange("glow", parseFloat(e.target.value))}
              style={{ accentColor: "var(--ember)", cursor: "pointer" }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Accretion Trail: {settings.trailFactor}x</span>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.trailFactor}
              onChange={(e) =>
                onChange("trailFactor", parseFloat(e.target.value))
              }
              style={{ accentColor: "var(--ember)", cursor: "pointer" }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
