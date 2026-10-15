import { isLightTheme } from "./theme";

// Particle visuals: outlined triangles forming a 3D constellation, plus a drifting ambient field.

export type Point3 = [number, number, number];
export type ShapeFn = (n: number) => Point3[];

// Same hues in both themes; the light set is deepened so outlines stay visible on a pale background.
const PALETTE_DARK = [
  "#7ab8e6", "#7ab8e6", "#7ab8e6", // Nexora sky (weighted)
  "#8052ff", "#8052ff",            // iris
  "#ffb829",                        // saffron
  "#15846e", "#2fc2a3",             // verdant / teal
  "#ff4fa3",                        // magenta
  "#3d7bff",                        // electric blue
];
const PALETTE_LIGHT = [
  "#2b7bc0", "#2b7bc0", "#2b7bc0",
  "#6a3cf0", "#6a3cf0",
  "#d18a00",
  "#0f6e5c", "#139c80",
  "#e0307f",
  "#2b5fe0",
];
const palette = () => (isLightTheme() ? PALETTE_LIGHT : PALETTE_DARK);
const pickColor = () => (Math.random() * PALETTE_DARK.length) | 0;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Shapes (unit space, roughly -1..1) ---------- */

// Organic brain-like cloud: two hemispheres with a folded surface
export const brainShape: ShapeFn = (n) => {
  const pts: Point3[] = [];
  while (pts.length < n) {
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    let x = s * Math.cos(th), y = u, z = s * Math.sin(th);
    const fold = 1 + 0.09 * Math.sin(x * 9 + z * 4) * Math.cos(y * 8 - z * 3);
    const depth = Math.random() < 0.78 ? rand(0.86, 1) : rand(0.2, 0.86);
    const r = fold * depth;
    x *= r * 1.18; y *= r * 0.9; z *= r * 0.98;
    x += Math.sign(x || 1) * 0.06; // fissure between hemispheres
    pts.push([x, y, z]);
  }
  for (let i = 0; i < n * 0.08; i++) {
    const a = Math.random() * Math.PI * 2, b = Math.acos(Math.random() * 2 - 1), r = rand(1.25, 1.8);
    pts.push([r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * 0.8, r * Math.sin(b) * Math.sin(a)]);
  }
  return pts;
};

// Globe with orbital rings
export const globeShape: ShapeFn = (n) => {
  const pts: Point3[] = [];
  const surface = Math.floor(n * 0.6);
  for (let i = 0; i < surface; i++) {
    const y = 1 - (i / (surface - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    const j = rand(0.94, 1.02);
    pts.push([Math.cos(th) * r * j * 0.8, y * j * 0.8, Math.sin(th) * r * j * 0.8]);
  }
  const rings: [number, number][] = [[1.15, 0.35], [1.35, -0.6], [1.55, 1.1]];
  const per = Math.floor((n - surface) / rings.length);
  for (const [R, tilt] of rings) {
    for (let i = 0; i < per; i++) {
      const a = Math.random() * Math.PI * 2;
      const rr = R + rand(-0.04, 0.04);
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      pts.push([x, z * Math.sin(tilt), z * Math.cos(tilt)]);
    }
  }
  return pts;
};

// Undulating surface — the web as a flowing plane
export const waveShape: ShapeFn = (n) => {
  const pts: Point3[] = [];
  for (let i = 0; i < n; i++) {
    const x = rand(-1.3, 1.3), z = rand(-1.3, 1.3);
    if (x * x + z * z > 1.7) { i--; continue; }
    const y = 0.28 * Math.sin(x * 2.6) * Math.cos(z * 2.2) + rand(-0.03, 0.03);
    pts.push([x, y, z]);
  }
  return pts;
};

// Nested cube lattice — connected modules of one system
export const latticeShape: ShapeFn = (n) => {
  const pts: Point3[] = [];
  const cubes = [0.95, 0.5];
  for (let i = 0; i < n; i++) {
    const s = cubes[Math.random() < 0.7 ? 0 : 1];
    // a point on one of the 12 cube edges
    const t = rand(-s, s);
    const a = Math.random() < 0.5 ? -s : s, b = Math.random() < 0.5 ? -s : s;
    const axis = (Math.random() * 3) | 0;
    const j = () => rand(-0.025, 0.025);
    pts.push(axis === 0 ? [t, a + j(), b + j()] : axis === 1 ? [a + j(), t, b + j()] : [a + j(), b + j(), t]);
  }
  return pts;
};

// Torus — the loop of sale, stock and report
export const torusShape: ShapeFn = (n) => {
  const pts: Point3[] = [];
  const R = 0.85, r = 0.32;
  for (let i = 0; i < n; i++) {
    const u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2;
    const rr = r * rand(0.85, 1.02);
    const x = (R + rr * Math.cos(v)) * Math.cos(u), y = rr * Math.sin(v), z = (R + rr * Math.cos(v)) * Math.sin(u);
    // tip the ring toward the viewer so it reads as a loop, not a line
    pts.push([x, y * Math.cos(1.1) - z * Math.sin(1.1), y * Math.sin(1.1) + z * Math.cos(1.1)]);
  }
  return pts;
};

// Rounded slab — a phone outline with a scattered screen
export const phoneShape: ShapeFn = (n) => {
  const pts: Point3[] = [];
  const w = 0.62, h = 1.2, rc = 0.18;
  const edge = Math.floor(n * 0.55);
  for (let i = 0; i < edge; i++) {
    // walk the rounded-rect perimeter
    let x = rand(-w, w), y = rand(-h, h);
    if (Math.random() < 0.5) x = Math.sign(x) * w; else y = Math.sign(y) * h;
    const cx = Math.max(Math.abs(x) - (w - rc), 0), cy = Math.max(Math.abs(y) - (h - rc), 0);
    if (cx > 0 && cy > 0) {
      const a = Math.atan2(cy, cx);
      x = Math.sign(x) * (w - rc + Math.cos(a) * rc);
      y = Math.sign(y) * (h - rc + Math.sin(a) * rc);
    }
    pts.push([x, y, rand(-0.06, 0.06)]);
  }
  while (pts.length < n) {
    pts.push([rand(-w * 0.85, w * 0.85), rand(-h * 0.85, h * 0.85), rand(-0.02, 0.02)]);
  }
  return pts;
};

function triangle(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.beginPath();
  for (let k = 0; k < 3; k++) {
    const a = rot + k * 2.0944;
    const px = x + Math.cos(a) * s, py = y + Math.sin(a) * s;
    if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

/* ---------- Constellation ---------- */

export interface ConstellationOptions {
  shape: ShapeFn;
  count: number;
  scale?: number;
  speed?: number;
  interactive?: boolean;
}

/** Starts rendering into `canvas`; returns a cleanup function. */
export function startConstellation(
  canvas: HTMLCanvasElement,
  { shape, count, scale = 0.36, speed = 0.0016, interactive = true }: ConstellationOptions,
) {
  const ctx = canvas.getContext("2d")!;
  const reduce = prefersReducedMotion();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const parts = shape(count).map(([x, y, z]) => ({
    x, y, z,
    c: pickColor(),
    s: rand(2.2, 5.2),
    rot: Math.random() * Math.PI * 2,
    spin: rand(-0.02, 0.02),
    tw: Math.random() * Math.PI * 2,
  }));
  let w = 0, h = 0, angle = 0;
  let tiltX = -0.25, tiltY = 0, targetTX = -0.25, targetTY = 0;
  let running = false, raf = 0, visible = true;

  function draw(t: number) {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * scale;
    const ca = Math.cos(angle + tiltY), sa = Math.sin(angle + tiltY);
    const cb = Math.cos(tiltX), sb = Math.sin(tiltX);
    const proj = parts.map((p) => {
      const x = p.x * ca - p.z * sa;
      let z = p.x * sa + p.z * ca;
      const y = p.y * cb - z * sb;
      z = p.y * sb + z * cb;
      const persp = 3 / (3 + z);
      return { p, X: cx + x * R * persp, Y: cy + y * R * persp, z, persp };
    });
    proj.sort((a, b) => b.z - a.z);
    const pal = palette();
    ctx.lineWidth = 1.1;
    for (const q of proj) {
      const { p } = q;
      const depth = (1 - q.z) / 2;
      const twinkle = 0.75 + 0.25 * Math.sin(t * 0.002 + p.tw);
      ctx.globalAlpha = Math.max(0.08, Math.min(1, (0.25 + depth * 0.85) * twinkle));
      ctx.strokeStyle = pal[p.c];
      const s = p.s * q.persp * (0.7 + depth * 0.5);
      triangle(ctx, q.X, q.Y, s, p.rot + (reduce ? 0 : t * p.spin * 0.05));
    }
    ctx.globalAlpha = 1;
  }

  function loop(t: number) {
    angle += speed;
    tiltX += (targetTX - tiltX) * 0.04;
    tiltY += (targetTY - tiltY) * 0.04;
    draw(t);
    raf = requestAnimationFrame(loop);
  }
  const start = () => {
    if (!running && !reduce && visible) { running = true; raf = requestAnimationFrame(loop); }
  };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  function resize() {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!running) draw(0);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start(); else stop();
  });
  io.observe(canvas);

  const onMove = (e: PointerEvent) => {
    targetTY = (e.clientX / window.innerWidth - 0.5) * 0.6;
    targetTX = -0.25 + (e.clientY / window.innerHeight - 0.5) * 0.4;
  };
  if (interactive && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

  resize();
  start();

  return () => {
    stop();
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("pointermove", onMove);
  };
}

/* ---------- Ambient field ---------- */

export function startAmbient(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const reduce = prefersReducedMotion();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, raf = 0;
  let parts: { x: number; y: number; vx: number; vy: number; s: number; rot: number; spin: number; c: number; a: number }[] = [];

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    const pal = palette();
    for (const p of parts) {
      ctx.globalAlpha = p.a;
      ctx.strokeStyle = pal[p.c];
      triangle(ctx, p.x, p.y, p.s, p.rot);
    }
  }
  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = Array.from({ length: Math.round((w * h) / 22000) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: rand(-0.08, 0.08), vy: rand(-0.12, -0.02),
      s: rand(1.8, 3.6), rot: Math.random() * 6.28, spin: rand(-0.004, 0.004),
      c: pickColor(), a: rand(0.12, 0.35),
    }));
    draw();
  }
  function loop() {
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.rot += p.spin;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  if (!reduce) raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}
