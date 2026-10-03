import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The GazeHop eye: one 3D eyeball on a fixed, click-through canvas.
 *
 * Sections place empty anchor boxes with `data-eye="<look>"`. The eye flies to whichever anchor
 * is nearest the middle of the viewport, sizes itself to the box, and looks where the anchor says:
 *   pointer  follow the mouse          hop     glance left, then right, like switching screens
 *   left     look at the left screen   right   look at the right screen
 *   camera   mirror the visitor's head in the camera demo (eyeBus.lean)       ahead  straight on
 */
export const eyeBus = { lean: 0 };

type Look = "pointer" | "hop" | "left" | "right" | "camera" | "ahead";

export function FlyingEye() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, stencil: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the page still works, just without the eye
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -4000, 4000);
    camera.position.z = 2000;

    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-0.6, 0.9, 1);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x06b6d4, 1.2);
    rim.position.set(1, -0.4, -0.3);
    scene.add(rim);

    // ---- the eye (eyeball radius 1, scaled to pixels) ----
    // The eyeball is only drawn inside an almond-shaped opening (a stencil mask), with an
    // outline like the logo, so it reads as an eye rather than a ball on any background.
    const root = new THREE.Group();   // position + size
    const ball = new THREE.Group();   // gaze rotation
    const lids = new THREE.Group();   // opening + outline; squashed on blink
    root.add(ball, lids);
    scene.add(root);

    const inside = { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc,
                     stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp };

    const opening = new THREE.Mesh(
      new THREE.ShapeGeometry(almond(1.0, 0.7), 48),
      new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false,
        stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp }),
    );
    opening.position.z = 1.3;
    opening.renderOrder = 0;
    lids.add(opening);

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 64),
      new THREE.MeshPhysicalMaterial({ color: 0xf4f0eb, roughness: 0.6, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 0.3, ...inside }),
    );
    sclera.renderOrder = 1;
    ball.add(sclera);

    const irisR = 0.5;
    const irisTex = new THREE.CanvasTexture(drawIris());
    irisTex.colorSpace = THREE.SRGBColorSpace;
    irisTex.anisotropy = 8;
    const iris = new THREE.Mesh(
      capGeometry(1.004, irisR),
      new THREE.MeshPhysicalMaterial({
        map: irisTex, emissive: 0x10b981, emissiveMap: irisTex, emissiveIntensity: 0.35,
        roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.1, envMapIntensity: 0.7, ...inside,
      }),
    );
    iris.renderOrder = 2;
    ball.add(iris);

    // Shadow cast by the upper lid, and the corners: gives the opening depth
    const shade = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 1.4),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(drawLidShadow()), transparent: true, depthTest: false, depthWrite: false, ...inside }),
    );
    shade.position.z = 1.25;
    shade.renderOrder = 3;
    lids.add(shade);

    // Catchlight: reflection of the light source on the wet surface
    const catchlight = new THREE.Mesh(
      new THREE.CircleGeometry(0.075, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false, ...inside }),
    );
    catchlight.scale.set(1.25, 1, 1);
    catchlight.position.set(-0.14, 0.17, 1.28);
    catchlight.renderOrder = 4;
    root.add(catchlight);

    // Outline, like the logo
    const outlineShape = almond(1.13, 0.83);
    outlineShape.holes.push(almond(1.0, 0.7));
    const outline = new THREE.Mesh(
      new THREE.ShapeGeometry(outlineShape, 64),
      new THREE.MeshBasicMaterial({ color: 0xf5f7fa, depthTest: false, depthWrite: false }),
    );
    outline.position.z = 1.32;
    outline.renderOrder = 5;
    lids.add(outline);

    // Soft neon glow behind the eye
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(drawGlow()), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }),
    );
    glow.position.z = -1.2;
    glow.renderOrder = -1;
    root.add(glow);

    let nextBlink = performance.now() + 2500;

    // ---- layout + motion state ----
    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H, false);
      camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: W / 2, y: H * 0.3 };
    const onMove = (e: PointerEvent) => { pointer.x = e.clientX; pointer.y = e.clientY; };
    window.addEventListener("pointermove", onMove, { passive: true });

    const cur = { x: 0, y: H * 0.2, r: 0, yaw: 0, pitch: 0 };
    let first = true;
    let saccade = { x: 0, y: 0, until: 0 };
    let raf = 0;
    let wasVisible = true;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Nearest visible anchor to the viewport's middle
      let best: { el: HTMLElement; rect: DOMRect; d: number } | null = null;
      document.querySelectorAll<HTMLElement>("[data-eye]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -40 || rect.top > H + 40 || rect.width === 0) return;
        const d = Math.abs(rect.top + rect.height / 2 - H / 2);
        if (!best || d < best.d) best = { el, rect, d };
      });

      let tx = cur.x, ty = cur.y, tr = 0, yaw = 0, pitch = 0;
      if (best) {
        const { el, rect } = best as { el: HTMLElement; rect: DOMRect };
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        tx = cx - W / 2; ty = H / 2 - cy;
        tr = (Math.min(rect.width, rect.height) / 2) * 0.82;
        const look = (el.dataset.eye || "ahead") as Look;
        if (look === "pointer" && !reduce) {
          yaw = clamp(((pointer.x - cx) / W) * 1.6, -0.42, 0.42);
          pitch = clamp(((pointer.y - cy) / H) * 1.1, -0.24, 0.24);
        } else if (look === "hop") {
          yaw = reduce ? 0.38 : (Math.floor(now / 1900) % 2 === 0 ? -0.38 : 0.38);
          pitch = 0.06;
        } else if (look === "left") { yaw = -0.38; pitch = 0.04; }
        else if (look === "right") { yaw = 0.38; pitch = 0.04; }
        else if (look === "camera") { yaw = clamp(-eyeBus.lean * 0.42, -0.42, 0.42); }
      }

      // Tiny involuntary saccades make it feel alive
      if (!reduce && now > saccade.until) {
        saccade = { x: (Math.random() - 0.5) * 0.06, y: (Math.random() - 0.5) * 0.04, until: now + 900 + Math.random() * 2200 };
      }

      const follow = (k: number) => (reduce || first ? 1 : 1 - Math.exp(-dt * k));
      const vx = tx - cur.x, vy = ty - cur.y;
      cur.x += vx * follow(5);
      cur.y += vy * follow(5);
      cur.r += (tr - cur.r) * follow(6);
      cur.yaw += (yaw + saccade.x - cur.yaw) * follow(16);
      cur.pitch += (pitch + saccade.y - cur.pitch) * follow(16);
      first = false;

      root.position.set(cur.x, cur.y, 0);
      root.scale.setScalar(Math.max(cur.r, 0.0001));
      root.visible = cur.r > 2;
      // While flying, roll slightly into the direction of travel
      root.rotation.z = reduce ? 0 : clamp(-vx * 0.0006, -0.35, 0.35);
      ball.rotation.set(cur.pitch, cur.yaw, 0);

      // Blink every few seconds: the opening closes to a line and reopens
      let open = 1;
      if (!reduce) {
        const bt = now - nextBlink;
        if (bt > 0) open = bt < 90 ? 1 - bt / 90 : bt < 200 ? (bt - 90) / 110 : 1;
        if (bt > 200) nextBlink = now + 2600 + Math.random() * 3600;
      }
      lids.scale.y = Math.max(0.04, open);
      catchlight.visible = open > 0.5;

      // Skip GPU work while the eye is off-screen (render one last frame to clear it)
      if (root.visible || wasVisible) renderer.render(scene, camera);
      wasVisible = root.visible;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      renderer.dispose();
      pmrem.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] h-full w-full" />;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** A spherical cap facing +z with planar UVs, so a flat iris texture maps without distortion. */
function capGeometry(radius: number, capRadius: number) {
  const theta = Math.asin(capRadius / radius);
  const g = new THREE.SphereGeometry(radius, 96, 32, 0, Math.PI * 2, 0, theta);
  g.rotateX(Math.PI / 2);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / capRadius / 2 + 0.5, pos.getY(i) / capRadius / 2 + 0.5);
  }
  uv.needsUpdate = true;
  return g;
}

/** Almond (eye opening) as a closed shape: half-width w, curve height h (peak = 0.75h). */
function almond(w: number, h: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-w, 0);
  shape.bezierCurveTo(-w * 0.53, h, w * 0.53, h, w, 0);
  shape.bezierCurveTo(w * 0.53, -h, -w * 0.53, -h, -w, 0);
  return shape;
}

function drawIris() {
  const S = 1024, c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const m = S / 2;

  // Base colour: green-teal iris with a dark limbal ring at the edge
  const base = g.createRadialGradient(m, m, 0, m, m, m);
  base.addColorStop(0, "#0b3b2c");
  base.addColorStop(0.36, "#1e9e74");
  base.addColorStop(0.5, "#34d399");
  base.addColorStop(0.7, "#10b981");
  base.addColorStop(0.86, "#0b6b52");
  base.addColorStop(0.95, "#05261d");
  base.addColorStop(1, "#04140f");
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);

  // Radial fibres
  for (let i = 0; i < 2600; i++) {
    const a = Math.random() * Math.PI * 2;
    const r0 = m * (0.34 + Math.random() * 0.08), r1 = m * (0.6 + Math.random() * 0.32);
    const light = Math.random() < 0.55;
    g.strokeStyle = light ? `rgba(209,250,229,${0.04 + Math.random() * 0.12})` : `rgba(2,44,34,${0.08 + Math.random() * 0.2})`;
    if (Math.random() < 0.15) g.strokeStyle = `rgba(103,232,249,${0.06 + Math.random() * 0.12})`;
    g.lineWidth = 0.8 + Math.random() * 2.2;
    const wob = (Math.random() - 0.5) * 0.06;
    g.beginPath();
    g.moveTo(m + Math.cos(a) * r0, m + Math.sin(a) * r0);
    g.quadraticCurveTo(m + Math.cos(a + wob) * (r0 + r1) / 2, m + Math.sin(a + wob) * (r0 + r1) / 2, m + Math.cos(a) * r1, m + Math.sin(a) * r1);
    g.stroke();
  }

  // Collarette: the lighter, wavy ring around the pupil
  g.strokeStyle = "rgba(167,243,208,0.35)";
  g.lineWidth = 10;
  g.beginPath();
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2, r = m * (0.44 + Math.sin(a * 9) * 0.015 + Math.sin(a * 23) * 0.008);
    i === 0 ? g.moveTo(m + Math.cos(a) * r, m + Math.sin(a) * r) : g.lineTo(m + Math.cos(a) * r, m + Math.sin(a) * r);
  }
  g.stroke();

  // Crypts: small dark flecks
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2, r = m * (0.45 + Math.random() * 0.35);
    g.fillStyle = `rgba(2,30,24,${0.15 + Math.random() * 0.25})`;
    g.beginPath();
    g.ellipse(m + Math.cos(a) * r, m + Math.sin(a) * r, 6 + Math.random() * 10, 3 + Math.random() * 5, a, 0, Math.PI * 2);
    g.fill();
  }

  // Round pupil with a soft edge
  const pupil = g.createRadialGradient(m, m, m * 0.3, m, m, m * 0.36);
  pupil.addColorStop(0, "#020403");
  pupil.addColorStop(1, "rgba(2,4,3,0)");
  g.fillStyle = pupil;
  g.beginPath(); g.arc(m, m, m * 0.36, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#020403";
  g.beginPath(); g.arc(m, m, m * 0.31, 0, Math.PI * 2); g.fill();
  return c;
}

/** Darkening under the upper lid and toward the corners, inside the opening. */
function drawLidShadow() {
  const W = 512, H = 326, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const top = g.createLinearGradient(0, 0, 0, H);
  top.addColorStop(0, "rgba(5,8,15,0.75)");
  top.addColorStop(0.32, "rgba(5,8,15,0.18)");
  top.addColorStop(0.5, "rgba(5,8,15,0)");
  top.addColorStop(1, "rgba(5,8,15,0.25)");
  g.fillStyle = top;
  g.fillRect(0, 0, W, H);
  const side = g.createLinearGradient(0, 0, W, 0);
  side.addColorStop(0, "rgba(5,8,15,0.55)");
  side.addColorStop(0.2, "rgba(5,8,15,0)");
  side.addColorStop(0.8, "rgba(5,8,15,0)");
  side.addColorStop(1, "rgba(5,8,15,0.55)");
  g.fillStyle = side;
  g.fillRect(0, 0, W, H);
  return c;
}

function drawGlow() {
  const S = 256, c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, "rgba(16,185,129,0.32)");
  grad.addColorStop(0.45, "rgba(6,182,212,0.10)");
  grad.addColorStop(1, "rgba(6,182,212,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  return c;
}
