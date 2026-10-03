import { useEffect, useRef } from "react";
import { HERO_RUNWAY_VH } from "../config";

/* ---------- small math helpers ---------- */
const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ---------- look & feel (tweak these) ---------- */
const DISK_TILT = 0.4; // how open the disk is: 0 = edge-on, 1 = face-on. Lower = flatter
const OPEN_ON_SCROLL = 0.8; // how much the disk opens up as you fall in (0 = stays the same)
const ARCH = 1; // height of the lensed arch over the hole (1 = a full half-circle)
const LENS_FALLOFF = 0.4; // how far out the arch reaches (higher = the arch reaches further)
const DISK_ROTATION = -0.3; // radians: the slant. Negative = rises to the right
const DISK_OUTER = 10; // how far the disk extends, in hole radii
const DIRECTION = -1; // -1 = left side is the bright side, 1 = right
const BEAMING = 0.75; // Doppler strength (0 = even, 1 = very lopsided)
const TRAIL = 0.09; // streak length, in seconds of orbit
const GLOW = 1;

const INNER = 1.15; // inner edge of the disk, in hole radii

const PALETTE = [
  "rgb(255, 244, 228)",
  "rgb(255, 196, 150)",
  "rgb(255, 130, 70)",
  "rgb(255, 75, 31)",
  "rgb(160, 70, 45)",
];

const TIERS = 4;
const TIER_ALPHA = [0.35, 0.55, 0.8, 1];
const TIER_WIDTH = [0.7, 1.0, 1.4, 1.9];
const tierOf = (e) => (e < 0.3 ? 0 : e < 0.55 ? 1 : e < 0.85 ? 2 : 3);

/* ---------- particle factories ---------- */
// lens: 1 at the inner edge, fading toward 0 further out.
// It decides how strongly this gas gets bent into the arch.
const lensOf = (r) => Math.exp(-(r - INNER) / LENS_FALLOFF);

function makeDisk(count) {
  return Array.from({ length: count }, () => {
    const t = Math.pow(Math.random(), 1.6);
    const r = INNER + t * DISK_OUTER;
    const heat = Math.random() < 0.06 ? 0 : Math.min(4, 1 + Math.floor(t * 4));
    const band = 0.7 + 0.3 * Math.sin(r * 19);
    return {
      r,
      a: Math.random() * TAU,
      omega: 2.2 / Math.pow(r, 1.5),
      heat,
      base: (0.35 + 0.65 * Math.random()) * band * (1.3 - 0.6 * t),
      lift: (Math.random() - 0.5) * 0.05,
      lens: lensOf(r),
    };
  });
}

// The faint lensed arc under the hole
function makeUnder(count) {
  return Array.from({ length: count }, () => {
    const t = Math.pow(Math.random(), 1.8);
    const r = INNER + t * 0.9;
    return {
      r,
      a: Math.random() * Math.PI,
      omega: 2.2 / Math.pow(r, 1.5),
      heat: t < 0.35 ? 0 : t < 0.7 ? 1 : 2,
      base: 0.45 + 0.55 * Math.random(),
      lens: lensOf(r),
    };
  });
}

function makeDust(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    depth: 0.2 + Math.random() * 0.8,
    size: 0.6 + Math.random() * 2,
  }));
}

function makeSparks(count) {
  return Array.from({ length: count }, () => ({
    a: Math.random() * TAU,
    r: 1.0 + Math.random() * 0.2,
    speed: 0.8 + Math.random() * 2.0,
    size: 0.8 + Math.random() * 2.5,
    life: Math.random(),
  }));
}

export default function BlackHole({ speed = 1, glow = 1, trailFactor = 1 }) {
  const canvasRef = useRef(null);

  // Keep settings fresh without resetting the canvas context or particles
  const settingsRef = useRef({ speed, glow, trailFactor });
  useEffect(() => {
    settingsRef.current = { speed, glow, trailFactor };
  }, [speed, glow, trailFactor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const small = window.innerWidth < 768;

    // Denser than before: a flatter disk needs more particles to look solid
    const disk = makeDisk(small ? 800 : 2400);
    const under = makeUnder(small ? 160 : 400);
    const dust = makeDust(small ? 40 : 90);
    const sparks = makeSparks(small ? 20 : 45);

    let w = 0;
    let h = 0;
    let rafId = 0;
    let lastTime = performance.now();
    let lastScroll = window.scrollY;
    let velocity = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const paths = new Array(PALETTE.length * TIERS);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function holeGeometry(progress, vel) {
      const fall = progress * progress;
      const zoom = 1 + fall * 5.5;
      const spin =
        (1 + progress * 4 + clamp(Math.abs(vel) / 900, 0, 3)) *
        settingsRef.current.speed;
      const R = Math.min(w, h) * (small ? 0.1 : 0.12) * zoom;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      return {
        zoom,
        spin,
        R,
        cx: w * lerp(small ? 0.5 : 0.7, 0.5, progress) + mouse.x * R * 0.12,
        cy: h * lerp(small ? 0.3 : 0.5, 0.5, progress) + mouse.y * R * 0.08,
        // The disk opens a little as you fall in, and tilts with the mouse
        tilt: Math.max(
          0.08,
          DISK_TILT * (1 + progress * OPEN_ON_SCROLL) + mouse.y * 0.03,
        ),
        rot: DISK_ROTATION + mouse.x * 0.04,
      };
    }

    function drawDust(scrollY, vel, lens) {
      const streak = clamp(Math.abs(vel) * 0.012, 0, 28);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgb(236, 231, 223)";
      for (const d of dust) {
        let x = d.x * w;
        let y = (((d.y * h - scrollY * d.depth * 0.5) % h) + h) % h;
        if (lens) {
          const dx = x - lens.cx;
          const dy = y - lens.cy;
          const d2 = dx * dx + dy * dy + 1;
          const rE = lens.R * 2.2;
          const f = 1 + (0.35 * lens.amount * rE * rE) / d2;
          x = lens.cx + dx * f;
          y = lens.cy + dy * f;
        }
        ctx.globalAlpha = 0.4 + d.depth * 0.6;
        ctx.fillRect(x, y, d.size, d.size + streak * d.depth);
      }
      ctx.globalAlpha = 1;
    }

    function drawHole(dt, g, alpha) {
      const { cx, cy, R, spin, zoom, tilt, rot } = g;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const sizeScale = 1 + (zoom - 1) * 0.25;
      const trail = TRAIL * Math.min(spin, 6) * settingsRef.current.trailFactor;

      const step = DIRECTION * dt * spin;
      for (const p of disk) p.a = (p.a + p.omega * step) % TAU;
      for (const p of under) {
        p.a = (((p.a + p.omega * step) % Math.PI) + Math.PI) % Math.PI;
      }

      let px = 0;
      let py = 0;

      // How tall the arch is. Inner gas (lens near 1) bends up into a tall arch;
      // outer gas (lens near 0) stays a flat sweep. The smoothstep rounds the
      // join where the arch meets the sweep at the left and right tips.
      const archK = (lens, sAbs) =>
        tilt + (ARCH - tilt) * lens * smoothstep(0, 0.45, sAbs);

      // Far half (above the hole) = lensed arch. Near half = flat sweep in front.
      const place = (rad, ang, lift, lens) => {
        const s = Math.sin(ang);
        const k = s < 0 ? archK(lens, -s) : tilt;
        const dx = Math.cos(ang) * rad;
        const dy = (s * k + lift) * rad;
        px = cx + dx * cosR - dy * sinR;
        py = cy + dx * sinR + dy * cosR;
      };

      // The arc under the hole: the SAME shape as the arch, mirrored downward,
      // so its radius always matches the top
      const placeUnder = (rad, ang, lens) => {
        const s = Math.abs(Math.sin(ang));
        const dx = Math.cos(ang) * rad;
        const dy = s * archK(lens, s) * rad;
        px = cx + dx * cosR - dy * sinR;
        py = cy + dx * sinR + dy * cosR;
      };

      const newPaths = () => {
        for (let i = 0; i < paths.length; i++) paths[i] = new Path2D();
      };

      const flush = (a) => {
        ctx.lineCap = "round";
        for (let ci = 0; ci < PALETTE.length; ci++) {
          ctx.strokeStyle = PALETTE[ci];
          for (let t = 0; t < TIERS; t++) {
            const path = paths[ci * TIERS + t];
            ctx.globalAlpha =
              a * TIER_ALPHA[t] * 0.2 * GLOW * settingsRef.current.glow;
            ctx.lineWidth = TIER_WIDTH[t] * sizeScale * 3.4;
            ctx.stroke(path);
            ctx.globalAlpha = a * TIER_ALPHA[t] * settingsRef.current.glow;
            ctx.lineWidth = TIER_WIDTH[t] * sizeScale;
            ctx.stroke(path);
          }
        }
      };

      const drawDisk = (far) => {
        newPaths();
        for (const p of disk) {
          const sin = Math.sin(p.a);
          if (sin < 0 !== far) continue;

          const c = DIRECTION * Math.cos(p.a);
          const e = p.base * (1 + BEAMING * c);
          if (e < 0.12) continue;

          const ci = clamp(
            p.heat - (c > 0.45 ? 1 : 0) + (c < -0.45 ? 1 : 0),
            0,
            4,
          );
          const path = paths[ci * TIERS + tierOf(e)];

          const turbulence = Math.sin(p.a * 4 + p.r * 15) * 0.025 * R;
          const rad = p.r * R + turbulence;

          place(rad, p.a, p.lift, p.lens);
          path.moveTo(px, py);
          place(rad, p.a - DIRECTION * p.omega * trail, p.lift, p.lens);
          path.lineTo(px, py);
        }
        flush(alpha);
      };

      const drawUnder = () => {
        newPaths();
        for (const p of under) {
          const s = Math.sin(p.a); // 0 at the ends, 1 at the bottom
          const c = DIRECTION * Math.cos(p.a);
          // Fades toward the ends so the arc melts into the disk
          const e = p.base * Math.pow(s, 0.6) * (1 + BEAMING * c) * 0.8;
          if (e < 0.1) continue;
          const ci = clamp(p.heat - (c > 0.45 ? 1 : 0), 0, 4);
          const path = paths[ci * TIERS + tierOf(e)];
          const rad = p.r * R;
          placeUnder(rad, p.a, p.lens);
          path.moveTo(px, py);
          placeUnder(rad, p.a - DIRECTION * p.omega * trail, p.lens);
          path.lineTo(px, py);
        }
        flush(alpha * 0.85);
      };

      const drawRing = () => {
        const grad = ctx.createLinearGradient(
          cx - R * 1.15,
          cy,
          cx + R * 1.15,
          cy,
        );
        const hot = "rgb(255, 244, 228)";
        const cool = "rgba(255, 90, 40, 0.5)";
        grad.addColorStop(0, DIRECTION < 0 ? hot : cool);
        grad.addColorStop(1, DIRECTION < 0 ? cool : hot);
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.06, 0, TAU);
        const layers = [
          [R * 0.2, 0.1],
          [R * 0.07, 0.28],
          [Math.max(1.4, R * 0.02), 1],
        ];
        for (const [width, a] of layers) {
          ctx.lineWidth = width;
          ctx.globalAlpha = alpha * a * settingsRef.current.glow;
          ctx.stroke();
        }
      };

      /* ---- 1) ambient glows behind everything ---- */
      ctx.globalCompositeOperation = "lighter";

      const nebula = ctx.createRadialGradient(cx, cy, R * 2, cx, cy, R * 14);
      nebula.addColorStop(0, "rgba(255, 75, 31, 0.12)");
      nebula.addColorStop(0.4, "rgba(160, 70, 45, 0.05)");
      nebula.addColorStop(1, "rgba(0, 0, 0, 0)");

      const halo = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 6);
      halo.addColorStop(0, "rgba(255, 75, 31, 0.26)");
      halo.addColorStop(0.3, "rgba(255, 75, 31, 0.09)");
      halo.addColorStop(1, "rgba(255, 75, 31, 0)");

      const inner = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 2.4);
      inner.addColorStop(0, "rgba(255, 150, 90, 0.2)");
      inner.addColorStop(1, "rgba(255, 150, 90, 0)");

      ctx.globalAlpha = alpha * GLOW * settingsRef.current.glow;
      ctx.fillStyle = nebula;
      ctx.fillRect(cx - R * 14, cy - R * 14, R * 28, R * 28);
      ctx.fillStyle = halo;
      ctx.fillRect(cx - R * 6, cy - R * 6, R * 12, R * 12);
      ctx.fillStyle = inner;
      ctx.fillRect(cx - R * 2.4, cy - R * 2.4, R * 4.8, R * 4.8);

      /* ---- 2) far side: the lensed arch over the top ---- */
      drawDisk(true);

      /* ---- 3) the event horizon ---- */
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = alpha;

      const abyss = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R);
      abyss.addColorStop(0, "#000");
      abyss.addColorStop(0.9, "#000");
      abyss.addColorStop(1, "rgba(160, 70, 45, 0.6)");

      ctx.fillStyle = abyss;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();

      /* ---- 4) photon ring, lower arc, near sweep (in front) ---- */
      ctx.globalCompositeOperation = "lighter";
      drawRing();
      drawUnder();
      drawDisk(false);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }

    function drawSparks(dt, g, alpha) {
      const { cx, cy, R, zoom } = g;
      ctx.globalCompositeOperation = "lighter";

      for (const s of sparks) {
        s.life -= dt * 0.8;
        s.r += s.speed * dt;

        if (s.life <= 0) {
          s.life = 1;
          s.r = 1.0 + Math.random() * 0.2;
          s.a = Math.random() * TAU;
        }

        const sparkAlpha =
          Math.max(0, s.life) * alpha * settingsRef.current.glow;
        const px = cx + Math.cos(s.a) * (s.r * R);
        const py = cy + Math.sin(s.a) * (s.r * R);

        ctx.globalAlpha = sparkAlpha;
        ctx.fillStyle = "rgb(255, 196, 150)";
        ctx.beginPath();
        ctx.arc(px, py, s.size * zoom, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function draw(dt, progress, vel, scrollY) {
      ctx.clearRect(0, 0, w, h);
      const holeAlpha = 1 - smoothstep(0.86, 1, progress);
      const g = holeAlpha > 0.01 ? holeGeometry(progress, vel) : null;

      drawDust(
        scrollY,
        vel,
        g && { cx: g.cx, cy: g.cy, R: g.R, amount: holeAlpha },
      );

      if (g) {
        drawHole(dt, g, holeAlpha);
        drawSparks(dt, g, holeAlpha);
      }
    }

    function frame(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const y = window.scrollY;
      const instant = dt > 0 ? (y - lastScroll) / dt : 0;
      lastScroll = y;
      velocity += (instant - velocity) * 0.12;

      const progress = clamp(y / ((HERO_RUNWAY_VH - 1) * h), 0, 1);
      draw(dt, progress, velocity, y);
      rafId = requestAnimationFrame(frame);
    }

    function drawStill() {
      draw(0, window.scrollY > h * 0.8 ? 1 : 0, 0, 0);
    }

    function onPointerMove(e) {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    resize();
    if (reduceMotion) {
      drawStill();
      window.addEventListener("scroll", drawStill, { passive: true });
    } else {
      rafId = requestAnimationFrame(frame);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    const onResize = () => {
      resize();
      if (reduceMotion) drawStill();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", drawStill);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="bh-canvas" aria-hidden="true" />;
}
