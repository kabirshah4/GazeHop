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
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
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

    // ---- the eye (radius 1, scaled to pixels) ----
    const root = new THREE.Group();   // position + size
    const ball = new THREE.Group();   // gaze rotation
    root.add(ball);
    scene.add(root);

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 64),
      new THREE.MeshPhysicalMaterial({ color: 0xeef1f5, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.06 }),
    );
    ball.add(sclera);

    const irisR = 0.54;
    const irisTex = new THREE.CanvasTexture(drawIris());
    irisTex.colorSpace = THREE.SRGBColorSpace;
    irisTex.anisotropy = 8;
    const iris = new THREE.Mesh(
      capGeometry(1.004, irisR),
      new THREE.MeshPhysicalMaterial({
        map: irisTex, emissive: 0x10b981, emissiveMap: irisTex, emissiveIntensity: 0.7,
        roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03,
      }),
    );
    ball.add(iris);

    // Soft neon glow behind the eye
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(drawGlow()), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    glow.position.z = -1.2;
    root.add(glow);

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
        tr = (Math.min(rect.width, rect.height) / 2) * 0.86;
        const look = (el.dataset.eye || "ahead") as Look;
        if (look === "pointer" && !reduce) {
          yaw = clamp(((pointer.x - cx) / W) * 2.2, -0.75, 0.75);
          pitch = clamp(((pointer.y - cy) / H) * 1.6, -0.5, 0.5);
        } else if (look === "hop") {
          yaw = reduce ? 0.5 : (Math.floor(now / 1900) % 2 === 0 ? -0.6 : 0.6);
          pitch = 0.08;
        } else if (look === "left") { yaw = -0.6; pitch = 0.05; }
        else if (look === "right") { yaw = 0.6; pitch = 0.05; }
        else if (look === "camera") { yaw = clamp(-eyeBus.lean * 0.7, -0.7, 0.7); }
      }

      // Tiny involuntary saccades make it feel alive
      if (!reduce && now > saccade.until) {
        saccade = { x: (Math.random() - 0.5) * 0.08, y: (Math.random() - 0.5) * 0.06, until: now + 900 + Math.random() * 2200 };
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

      renderer.render(scene, camera);
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

function drawIris() {
  const S = 1024, c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const m = S / 2;

  const base = g.createRadialGradient(m, m, 0, m, m, m);
  base.addColorStop(0, "#04120d");
  base.addColorStop(0.2, "#0f766e");
  base.addColorStop(0.42, "#10b981");
  base.addColorStop(0.62, "#34d399");
  base.addColorStop(0.82, "#047857");
  base.addColorStop(0.93, "#022c22");
  base.addColorStop(1, "#0b0f19");
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);

  // Fibres
  for (let i = 0; i < 1400; i++) {
    const a = Math.random() * Math.PI * 2;
    const r0 = m * (0.2 + Math.random() * 0.1), r1 = m * (0.55 + Math.random() * 0.35);
    g.strokeStyle = Math.random() < 0.25 ? `rgba(103,232,249,${0.05 + Math.random() * 0.12})` : `rgba(236,253,245,${0.03 + Math.random() * 0.1})`;
    g.lineWidth = 1 + Math.random() * 2;
    g.beginPath();
    g.moveTo(m + Math.cos(a) * r0, m + Math.sin(a) * r0);
    g.lineTo(m + Math.cos(a + (Math.random() - 0.5) * 0.08) * r1, m + Math.sin(a) * r1);
    g.stroke();
  }

  // Pupil: the typing caret from the logo
  g.fillStyle = "#03050a";
  const rr = (x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
  rr(m - 30, m - 150, 60, 300, 18);
  rr(m - 92, m - 150, 184, 48, 18);
  rr(m - 92, m + 102, 184, 48, 18);
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
