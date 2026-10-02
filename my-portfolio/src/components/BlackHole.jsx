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
const DISK_TILT = 1; // flatness of the NEAR sweep (1 = face-on, 0 = edge-on)
const ARCH = 1; // height of the lensed FAR arch (1 = perfect circle)
const DISK_ROTATION = -0.2; // radians, rolls the whole picture slightly
const DIRECTION = -1; // orbit direction: -1 = left side is the bright side, 1 = right
const BEAMING = 0.75; // Doppler strength (0 = even, 1 = very lopsided)
const TRAIL = 0.07; // streak length, in seconds of orbit
const GLOW = 1; // overall glow strength

// Colors from hottest to coolest (your original palette)
const PALETTE = [
  "rgb(255, 244, 228)", // white-hot
  "rgb(255, 196, 150)", // peach
  "rgb(255, 130, 70)", // orange
  "rgb(255, 75, 31)", // ember
  "rgb(160, 70, 45)", // dim
];

// Streaks are batched into buckets (color x brightness tier) for speed.
// Brighter tiers are drawn thicker and more opaque.
const TIERS = 4;
const TIER_ALPHA = [0.35, 0.55, 0.8, 1];
const TIER_WIDTH = [0.7, 1.0, 1.4, 1.9];
const tierOf = (e) => (e < 0.3 ? 0 : e < 0.55 ? 1 : e < 0.85 ? 2 : 3);

/* ---------- particle factories ---------- */
// Radii are in "horizon units": 1 = the edge of the black hole.
function makeDisk(count) {
  return Array.from({ length: count }, () => {
    const t = Math.pow(Math.random(), 1.6); // bias toward the inner edge
    const r = 1.14 + t * 4;
    const heat = Math.random() < 0.06 ? 0 : Math.min(4, 1 + Math.floor(t * 4));
    const band = 0.7 + 0.3 * Math.sin(r * 19); // fine radial filament bands
    return {
      r,
      a: Math.random() * TAU,
      omega: 2.2 / Math.pow(r, 1.5), // inner particles orbit faster
      heat,
      base: (0.35 + 0.65 * Math.random()) * band * (1.3 - 0.6 * t),
      lift: (Math.random() - 0.5) * 0.08, // slight vertical thickness
    };
  });
}

// The thin lensed crescent under the hole
function makeUnder(count) {
  return Array.from({ length: count }, () => {
    const t = Math.pow(Math.random(), 1.8);
    const r = 1.14 + t * 1.0;
    return {
      r,
      a: Math.random() * Math.PI, // spans the lower semicircle only
      omega: 2.2 / Math.pow(r, 1.5),
      heat: t < 0.35 ? 0 : t < 0.7 ? 1 : 2,
      base: 0.45 + 0.55 * Math.random(),
    };
  });
}

// Floating specks that drift with scroll and bend around the hole
function makeDust(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    depth: 0.2 + Math.random() * 0.8, // 1 = close, 0.2 = far
    size: 0.6 + Math.random() * 1.4,
  }));
}

export default function BlackHole() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const small = window.innerWidth < 768;

    // Fewer particles on phones
    const disk = makeDisk(small ? 650 : 1700);
    const under = makeUnder(small ? 150 : 380);
    const dust = makeDust(small ? 40 : 90);

    let w = 0;
    let h = 0;
    let rafId = 0;
    let lastTime = performance.now();
    let lastScroll = window.scrollY;
    let velocity = 0; // smoothed scroll speed in px/second
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

    /* ----- where the hole is, and how big, for this scroll position ----- */
    function holeGeometry(progress, vel) {
      const fall = progress * progress; // slow start, fast finish
      const zoom = 1 + fall * 5.5; // the hole swells as you "fall in"
      const spin = 1 + progress * 4 + clamp(Math.abs(vel) / 900, 0, 3);
      const R = Math.min(w, h) * (small ? 0.1 : 0.12) * zoom;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      return {
        zoom,
        spin,
        R,
        // Starts beside the text, drifts to the middle as you fall in
        cx: w * lerp(small ? 0.5 : 0.7, 0.5, progress) + mouse.x * R * 0.12,
        cy: h * lerp(small ? 0.3 : 0.5, 0.5, progress) + mouse.y * R * 0.08,
        tilt: DISK_TILT,
        rot: DISK_ROTATION + mouse.x * 0.04,
      };
    }

    /* ----- ambient dust: runs for the whole page ----- */
    function drawDust(scrollY, vel, lens) {
      const streak = clamp(Math.abs(vel) * 0.012, 0, 28);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgb(236, 231, 223)";
      for (const d of dust) {
        let x = d.x * w;
        // Parallax: closer specks move more as you scroll
        let y = (((d.y * h - scrollY * d.depth * 0.5) % h) + h) % h;
        if (lens) {
          // Gravitational lensing: push specks outward around the hole
          const dx = x - lens.cx;
          const dy = y - lens.cy;
          const d2 = dx * dx + dy * dy + 1;
          const rE = lens.R * 2.2;
          const f = 1 + (0.35 * lens.amount * rE * rE) / d2;
          x = lens.cx + dx * f;
          y = lens.cy + dy * f;
        }
        ctx.globalAlpha = 0.15 + d.depth * 0.35;
        ctx.fillRect(x, y, d.size, d.size + streak * d.depth);
      }
      ctx.globalAlpha = 1;
    }

    /* ----- the black hole: only in the hero ----- */
    function drawHole(dt, g, alpha) {
      const { cx, cy, R, spin, zoom, tilt, rot } = g;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const sizeScale = 1 + (zoom - 1) * 0.25;
      const trail = TRAIL * Math.min(spin, 6);

      // Advance every orbit
      const step = DIRECTION * dt * spin;
      for (const p of disk) p.a = (p.a + p.omega * step) % TAU;
      for (const p of under) {
        p.a = (((p.a + p.omega * step) % Math.PI) + Math.PI) % Math.PI;
      }

      // Projects a point on the disk to the screen.
      // Far half (sin < 0) uses a tall circle = the lensed arch over the top.
      // Near half uses a flat ellipse = the sweep passing in front.
      let px = 0;
      let py = 0;
      const place = (rad, ang, lift) => {
        const s = Math.sin(ang);
        const k = s < 0 ? ARCH : tilt;
        const dx = Math.cos(ang) * rad;
        const dy = (s * k + lift) * rad;
        px = cx + dx * cosR - dy * sinR;
        py = cy + dx * sinR + dy * cosR;
      };
      // The crescent under the hole: same circle as the arch, mirrored down

      const newPaths = () => {
        for (let i = 0; i < paths.length; i++) paths[i] = new Path2D();
      };

      // Strokes every bucket twice: a wide faint pass (glow) + a crisp pass
      const flush = (a) => {
        ctx.lineCap = "round";
        for (let ci = 0; ci < PALETTE.length; ci++) {
          ctx.strokeStyle = PALETTE[ci];
          for (let t = 0; t < TIERS; t++) {
            const path = paths[ci * TIERS + t];
            ctx.globalAlpha = a * TIER_ALPHA[t] * 0.2 * GLOW;
            ctx.lineWidth = TIER_WIDTH[t] * sizeScale * 3.4;
            ctx.stroke(path);
            ctx.globalAlpha = a * TIER_ALPHA[t];
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
          // c: +1 = moving toward you (bright, hot), -1 = moving away (dim, cool)
          const c = DIRECTION * Math.cos(p.a);
          const e = p.base * (1 + BEAMING * c);
          if (e < 0.12) continue;
          const ci = clamp(
            p.heat - (c > 0.45 ? 1 : 0) + (c < -0.45 ? 1 : 0),
            0,
            4,
          );
          const path = paths[ci * TIERS + tierOf(e)];
          const rad = p.r * R;
          place(rad, p.a, p.lift);
          path.moveTo(px, py);
          // The trail extends behind the direction of motion
          place(rad, p.a - DIRECTION * p.omega * trail, p.lift);
          path.lineTo(px, py);
        }
        flush(alpha);
      };

      // The thin photon ring: brightest on the approaching side
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
          [R * 0.2, 0.1], // wide soft halo
          [R * 0.07, 0.28], // ember rim
          [Math.max(1.4, R * 0.02), 1], // razor-thin white-hot core
        ];
        for (const [width, a] of layers) {
          ctx.lineWidth = width;
          ctx.globalAlpha = alpha * a;
          ctx.stroke();
        }
      };

      /* ---- 1) wide ember glow behind everything ---- */
      ctx.globalCompositeOperation = "lighter";
      const halo = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 6);
      halo.addColorStop(0, "rgba(255, 75, 31, 0.26)");
      halo.addColorStop(0.3, "rgba(255, 75, 31, 0.09)");
      halo.addColorStop(1, "rgba(255, 75, 31, 0)");
      const inner = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 2.4);
      inner.addColorStop(0, "rgba(255, 150, 90, 0.2)");
      inner.addColorStop(1, "rgba(255, 150, 90, 0)");
      ctx.globalAlpha = alpha * GLOW;
      ctx.fillStyle = halo;
      ctx.fillRect(cx - R * 6, cy - R * 6, R * 12, R * 12);
      ctx.fillStyle = inner;
      ctx.fillRect(cx - R * 2.4, cy - R * 2.4, R * 4.8, R * 4.8);

      /* ---- 2) far side: the lensed arch over the top ---- */
      drawDisk(true);

      /* ---- 3) the event horizon: a solid black disc ---- */
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();

      /* ---- 4) photon ring, lower crescent, near side (in front) ---- */
      ctx.globalCompositeOperation = "lighter";
      drawRing();
      drawDisk(false);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }

    function draw(dt, progress, vel, scrollY) {
      ctx.clearRect(0, 0, w, h);
      // The hole fades out as the hero ends
      const holeAlpha = 1 - smoothstep(0.86, 1, progress);
      const g = holeAlpha > 0.01 ? holeGeometry(progress, vel) : null;
      drawDust(
        scrollY,
        vel,
        g && { cx: g.cx, cy: g.cy, R: g.R, amount: holeAlpha },
      );
      if (g) drawHole(dt, g, holeAlpha);
    }

    function frame(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const y = window.scrollY;
      const instant = dt > 0 ? (y - lastScroll) / dt : 0;
      lastScroll = y;
      velocity += (instant - velocity) * 0.12; // smooth it out

      // Same distance the sticky hero travels (see Hero.jsx)
      const progress = clamp(y / ((HERO_RUNWAY_VH - 1) * h), 0, 1);
      draw(dt, progress, velocity, y);
      rafId = requestAnimationFrame(frame);
    }

    // Reduced-motion visitors get a still image, hidden once they scroll on
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
