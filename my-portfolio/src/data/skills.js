/*
 * Skills shown in the About section.
 *
 *   name  full label (used in the readout and the mobile list)
 *   short label printed on the orbiting chip (keep it under ~8 characters)
 *   ring  0 = inner ring (closest to the core), 1 = middle, 2 = outer
 *   note  what you used it for. Shown when a chip is hovered or focused.
 *
 * The notes below are drafts written from your bio. Edit any that
 * don't match what you actually did.
 */
const skills = [
  // Inner ring: hardware, closest to the core
  {
    name: "ESP32 Architecture",
    short: "ESP32",
    ring: 0,
    note: "AquaReserve: the ESP32-driven rainwater harvesting and UV-C sterilization controller.",
  },
  {
    name: "Digital Logic (TTL)",
    short: "TTL",
    ring: 0,
    note: "Breadboarding 7400-series gates and working through state-machine logic.",
  },

  // Middle ring: the bridge between hardware and software
  {
    name: "C++ / Arduino",
    short: "C++",
    ring: 1,
    note: "Firmware and sensor prototyping for embedded builds.",
  },
  {
    name: "HTML5 Canvas",
    short: "Canvas",
    ring: 1,
    note: "The black hole you just fell through.",
  },
  {
    name: "Systems Architecture",
    short: "Systems",
    ring: 1,
    note: "Breaking a system into core components, then building it back up.",
  },

  // Outer ring: software
  {
    name: "React.js / Vite",
    short: "React",
    ring: 2,
    note: "This portfolio, and the front end of AERIS.",
  },
  {
    name: "Python / Flask",
    short: "Python",
    ring: 2,
    note: "Back-end services behind AERIS.",
  },
  {
    name: "MySQL",
    short: "MySQL",
    ring: 2,
    note: "The relational data layer for AERIS.",
  },
];

export default skills;
