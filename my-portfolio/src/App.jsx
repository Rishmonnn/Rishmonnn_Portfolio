import { useState } from "react";
import BlackHole from "./components/BlackHole";
import BlackHoleControls from "./components/BlackHoleControls";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PatternBackground from "./components/PatternBackground";

function ArchDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="arch" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.5 C0,0.2 0.32,0.08 0.5,0 C0.68,0.08 1,0.2 1,0.5 L1,1 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function App() {
  const [bhSettings, setBhSettings] = useState({
    speed: 1,
    glow: 1,
    trailFactor: 1,
  });

  const handleSettingChange = (key, value) => {
    setBhSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <ArchDefs />
      <PatternBackground />
      <BlackHole {...bhSettings} />
      <BlackHoleControls settings={bhSettings} onChange={handleSettingChange} />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
