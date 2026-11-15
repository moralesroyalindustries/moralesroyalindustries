/*
  MRI 3D Effects — Morales Royal Industries
  One file, three effects. It never changes your texts or sections.

  1) mountGlobeBackground()  A fixed 3D planet behind the whole page that turns,
                             travels and opens its rings as the visitor scrolls.
  2) mountScrollEffects()    a) [data-zoom]  a photo that grows to full screen and keeps zooming in
                             b) [data-tilt]  cards that swing in on scroll and tilt under the cursor

  Requires:  npm install three

  Usage (React):
      import { useEffect } from "react";
      import { mountGlobeBackground, mountScrollEffects } from "./mri-3d-effects";

      useEffect(() => {
        const stopGlobe = mountGlobeBackground();
        const stopFx = mountScrollEffects();
        return () => { stopGlobe(); stopFx(); };
      }, []);
*/
import * as THREE from "three";

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, v) => { const u = clamp((v - a) / (b - a)); return u * u * (3 - 2 * u); };
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/* ------------------------------------------------------------------ */
/* 1) 3D planet background                                             */
/* ------------------------------------------------------------------ */
export function mountGlobeBackground(options = {}) {
  const opt = {
    color: 0x0bd3ff,          // main neon color
    accent: 0xd9b25a,         // middle ring (gold)
    zIndex: -1,               // behind the content; sections must be transparent or semi-transparent
    fadeSelector: "[data-zoom]", // the planet fades out while these elements fill the screen
    mobileBreakpoint: 760,
    ...options,
  };
  if (typeof window === "undefined") return () => {};
  const reduce = reducedMotion();

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: String(opt.zIndex), pointerEvents: "none", display: "block" });
  document.body.prepend(canvas);

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { canvas.remove(); return () => {}; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const add = THREE.AdditiveBlending, r = rng(9), R = 1.7;
  const onSphere = (rad) => { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); return new THREE.Vector3(Math.cos(a) * s * rad, u * rad, Math.sin(a) * s * rad); };

  // planet: dark core, dots, wire mesh, nodes joined by arcs, three rings
  const globe = new THREE.Group();
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 32), new THREE.MeshBasicMaterial({ color: 0x04101c, transparent: true, opacity: 0.9 })));
  const N = 1500, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, s = Math.sqrt(1 - y * y), a = i * 2.39996; pos[i * 3] = Math.cos(a) * s * R; pos[i * 3 + 1] = y * R; pos[i * 3 + 2] = Math.sin(a) * s * R; }
  const dots = new THREE.BufferGeometry(); dots.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  globe.add(new THREE.Points(dots, new THREE.PointsMaterial({ color: opt.color, size: 0.035, transparent: true, opacity: 0.9, blending: add, depthWrite: false })));
  globe.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R * 1.01, 2)), new THREE.LineBasicMaterial({ color: opt.color, transparent: true, opacity: 0.16, blending: add })));
  const nodes = [];
  for (let i = 0; i < 16; i++) { const p = onSphere(R * 1.01); nodes.push(p); const m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({ color: 0xbff3ff })); m.position.copy(p); globe.add(m); }
  const arcMat = new THREE.LineBasicMaterial({ color: 0x7fe9ff, transparent: true, opacity: 0.75, blending: add });
  for (let i = 0; i < 14; i++) {
    const a = nodes[i], b = nodes[(i * 5 + 3) % nodes.length]; if (a === b) continue;
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.15 + a.distanceTo(b) * 0.18));
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(40)), arcMat));
  }
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(R * 1.28 + i * 0.34, 0.008, 8, 180), new THREE.MeshBasicMaterial({ color: i === 1 ? opt.accent : opt.color, transparent: true, opacity: 0.75, blending: add }));
    t.userData = { rx: Math.PI / 2 + (i - 1) * 0.35, rz: i * 0.5 }; globe.add(t); rings.push(t);
  }
  scene.add(globe);

  // star field and floating glass panels (parallax)
  const sN = 420, sp = new Float32Array(sN * 3);
  for (let i = 0; i < sN; i++) { sp[i * 3] = (r() - 0.5) * 18; sp[i * 3 + 1] = (r() - 0.5) * 26; sp[i * 3 + 2] = -6 + r() * 7; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x9fe8ff, size: 0.03, transparent: true, opacity: 0.7, blending: add, depthWrite: false }));
  scene.add(stars);
  const panels = [];
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group(), w = 0.9 + r() * 0.7, h = 0.5 + r() * 0.4, geo = new THREE.PlaneGeometry(w, h);
    g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: opt.color, transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: add, depthWrite: false })));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: opt.color, transparent: true, opacity: 0.55, blending: add })));
    for (let j = 0; j < 3; j++) { const bar = new THREE.Mesh(new THREE.PlaneGeometry(w * (0.3 + r() * 0.4), 0.03), new THREE.MeshBasicMaterial({ color: opt.color, transparent: true, opacity: 0.45, blending: add, side: THREE.DoubleSide })); bar.position.set(-w * 0.12, h * 0.22 - j * 0.14, 0.001); g.add(bar); }
    g.userData = { x: (i % 2 ? 1 : -1) * (2.8 + r() * 3.2), y: 3 - i * 2.7, z: -3 + r() * 3.5, s: 0.7 + r() * 0.9, ph: r() * 6 };
    g.rotation.set((r() - 0.5) * 0.5, (r() - 0.5) * 1.2, (r() - 0.5) * 0.2); scene.add(g); panels.push(g);
  }

  function size() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  size(); window.addEventListener("resize", size);

  const cur = { x: 0, y: 0, s: 1, e: 0, o: 1 }, t0 = performance.now();
  let raf = 0, alive = true;
  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const vw = window.innerWidth, vh = window.innerHeight, sy = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - vh), p = clamp(sy / max);
    const time = reduce ? 0 : (performance.now() - t0) / 1000, mobile = vw < opt.mobileBreakpoint;

    // travel: right -> left -> right across the page; rings open in the first third
    const a = ss(0.04, 0.3, p), b = ss(0.62, 0.92, p);
    const x = mobile ? 0 : 2.3 - 4.6 * a + 4.6 * b;
    const y = mobile ? lerp(-1.5, 1.5, a) : Math.sin(p * Math.PI * 2) * 0.25;
    const s = mobile ? 0.62 : 1;
    const open = ss(0.1, 0.26, p) * (1 - ss(0.4, 0.56, p));

    // fade out while a full-screen element (the zoom photo) covers the viewport
    let cover = 0;
    if (opt.fadeSelector) document.querySelectorAll(opt.fadeSelector).forEach((el) => {
      const q = el.getBoundingClientRect(); cover = Math.max(cover, clamp((Math.min(q.bottom, vh) - Math.max(q.top, 0)) / vh));
    });
    const k = reduce ? 1 : 0.09;
    cur.x += (x - cur.x) * k; cur.y += (y - cur.y) * k; cur.s += (s - cur.s) * k; cur.e += (open - cur.e) * k; cur.o += (1 - ss(0.25, 0.8, cover) - cur.o) * 0.15;

    globe.position.set(cur.x, cur.y, 0); globe.scale.setScalar(cur.s);
    globe.rotation.set(0.32 + (a - 0.5) * 0.3, time * 0.16 + sy * 0.0035, 0.12);
    rings.forEach((rg, i) => {
      const u = rg.userData, dir = i % 2 ? -1 : 1;
      rg.rotation.set(u.rx + cur.e * (i - 1) * 0.9 + Math.sin(time * 0.4 + i) * 0.05, time * 0.2 * dir, u.rz + time * 0.12 * (i + 1) * dir);
      rg.scale.setScalar(1 + cur.e * (0.18 + i * 0.16));
    });
    stars.position.y = sy * 0.0016; stars.rotation.y = time * 0.01;
    for (const f of panels) {
      const u = f.userData;
      f.position.set(u.x + Math.sin(time * 0.3 + u.ph) * 0.3, u.y + sy * 0.0046 * u.s + Math.sin(time * 0.5 + u.ph) * 0.2, u.z);
      if (f.position.y > 8) u.y -= 20; if (f.position.y < -12) u.y += 20;
    }
    canvas.style.opacity = cur.o.toFixed(3);
    if (cur.o > 0.01) renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return function destroy() {
    alive = false; cancelAnimationFrame(raf); window.removeEventListener("resize", size);
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    renderer.dispose(); canvas.remove();
  };
}

/* ------------------------------------------------------------------ */
/* 2) Scroll zoom photo  +  3D tilt cards                              */
/* ------------------------------------------------------------------ */
/*
  ZOOM markup (put it where you want the effect):

    <section data-zoom data-zoom-origin="69% 33%" data-zoom-scale="2.5">
      <div data-zoom-stick>
        <div data-zoom-title>  ...title shown at the start...  </div>
        <div data-zoom-frame><img src="/office.webp" alt="..." /></div>
        <div data-zoom-caption>  ...phrase shown at the end...  </div>
      </div>
    </section>

    data-zoom-origin = the point of the photo the zoom travels to (x% y%)
    data-zoom-scale  = how far it zooms in (2.5 = 250%)

  TILT: add  data-tilt  to any card.   data-tilt="up"  enters from below,
        data-tilt="side" (default) swings in from the right.
*/
const FX_CSS = `
html,body{overflow-x:clip}
[data-zoom]{height:280vh;position:relative}
[data-zoom-stick]{position:sticky;top:0;height:100vh;overflow:hidden;display:grid;place-items:center}
[data-zoom-title]{position:absolute;top:clamp(56px,9vh,96px);left:0;right:0;text-align:center;padding:0 20px;z-index:2}
[data-zoom-frame]{position:relative;overflow:hidden;width:min(64vw,330px);height:min(58vh,480px);border-radius:18px;margin-top:14vh;will-change:width,height}
[data-zoom-frame] img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;will-change:transform}
[data-zoom-caption]{position:absolute;left:0;right:0;bottom:clamp(28px,8vh,80px);text-align:center;padding:0 20px;z-index:2;opacity:0;pointer-events:none}
[data-tilt]{will-change:transform}
`;

export function mountScrollEffects() {
  if (typeof window === "undefined") return () => {};
  const reduce = reducedMotion();
  const style = document.createElement("style"); style.setAttribute("data-mri-3d", ""); style.textContent = FX_CSS; document.head.appendChild(style);

  const hover = new Map(), fine = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  const onMove = (e) => { const c = e.target.closest && e.target.closest("[data-tilt]"); if (!c) return; const b = c.getBoundingClientRect(); hover.set(c, [(e.clientX - b.left) / b.width - 0.5, (e.clientY - b.top) / b.height - 0.5]); };
  const onOut = (e) => { const c = e.target.closest && e.target.closest("[data-tilt]"); if (c && !c.contains(e.relatedTarget)) hover.delete(c); };
  if (fine && !reduce) { document.addEventListener("pointermove", onMove, { passive: true }); document.addEventListener("pointerout", onOut, { passive: true }); }

  let raf = 0, alive = true;
  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const vw = window.innerWidth, vh = window.innerHeight;

    document.querySelectorAll("[data-zoom]").forEach((sec) => {
      const fr = sec.querySelector("[data-zoom-frame]"); if (!fr) return;
      const img = fr.querySelector("img"), title = sec.querySelector("[data-zoom-title]"), cap = sec.querySelector("[data-zoom-caption]");
      const q = sec.getBoundingClientRect(), pz = clamp(-q.top / Math.max(1, q.height - vh)), e = ss(0, 0.5, pz);
      const w0 = Math.min(vw * 0.64, 330), h0 = Math.min(vh * 0.58, 480), maxScale = parseFloat(sec.dataset.zoomScale) || 2.5;
      fr.style.width = lerp(w0, vw, e) + "px"; fr.style.height = lerp(h0, vh, e) + "px";
      fr.style.borderRadius = lerp(18, 0, e) + "px"; fr.style.marginTop = lerp(vh * 0.14, 0, e) + "px";
      if (img) { img.style.transformOrigin = sec.dataset.zoomOrigin || "50% 50%"; img.style.transform = "scale(" + (1 + (maxScale - 1) * ss(0.3, 1, pz)) + ")"; }
      if (title) { title.style.opacity = 1 - ss(0.04, 0.25, pz); title.style.transform = "translateY(" + -60 * ss(0, 0.25, pz) + "px)"; }
      if (cap) { cap.style.opacity = ss(0.7, 0.86, pz); cap.style.transform = "translateY(" + 30 * (1 - ss(0.7, 0.86, pz)) + "px)"; }
    });

    document.querySelectorAll("[data-tilt]").forEach((c) => {
      // measure the untransformed box so the card does not chase its own animation
      const prev = c.style.transform; c.style.transform = "none"; const b = c.getBoundingClientRect(); c.style.transform = prev;
      const t = reduce ? 1 : ss(0, 1, clamp((vh * 1.02 - b.top) / (vh * 0.5))), h = hover.get(c), up = c.dataset.tilt === "up";
      const hx = h ? h[0] * 14 : 0, hy = h ? -h[1] * 12 : 0;
      c.style.transform = up
        ? "perspective(1100px) translateY(" + (1 - t) * 70 + "px) rotateX(" + ((1 - t) * 30 + hy) + "deg) rotateY(" + hx + "deg)"
        : "perspective(1100px) translateX(" + (1 - t) * 90 + "px) rotateY(" + ((1 - t) * -38 + hx) + "deg) rotateX(" + hy + "deg)";
    });
  }
  raf = requestAnimationFrame(frame);

  return function destroy() {
    alive = false; cancelAnimationFrame(raf); style.remove();
    document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerout", onOut);
    document.querySelectorAll("[data-tilt]").forEach((c) => { c.style.transform = ""; });
  };
}
