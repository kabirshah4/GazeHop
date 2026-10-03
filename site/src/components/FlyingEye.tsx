import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The GazeHop eye: one photographic 3D eyeball on a fixed, click-through canvas.
 *
 * Sections place empty anchor boxes with `data-eye="<look>"`. The eye flies to whichever anchor
 * is nearest the middle of the viewport, sizes itself to the box, and looks where the anchor says:
 *   pointer  follow the mouse          hop     glance left, then right, like switching screens
 *   left     look at the left screen   right   look at the right screen
 *   camera   mirror the visitor's head in the camera demo (eyeBus.lean)       ahead  straight on
 *
 * Rendering: the eyeball (sclera + iris + pupil) is a custom shader with the iris recessed under
 * the cornea (parallax), plus two clear gloss layers (whole eye + corneal bulge) that only add
 * reflections of a studio softbox setup, which is what makes it read as wet and real.
 */
export const eyeBus = { lean: 0 };

type Look = "pointer" | "hop" | "left" | "right" | "camera" | "ahead";

const IRIS = 0.5; // iris radius on the front of a unit eyeball

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
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();

    // Studio lighting for reflections: a big key softbox, a rim strip, a faint floor bounce.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const studio = new THREE.Scene();
    studio.background = new THREE.Color(0x05070b);
    const softbox = (w: number, h: number, pos: [number, number, number], strength: number, tint = 0xffffff) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(strength), side: THREE.DoubleSide, toneMapped: false }),
      );
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      studio.add(m);
    };
    softbox(3.2, 2.2, [-2.6, 2.4, 3.6], 7);            // key, upper left
    softbox(0.5, 4.5, [4.2, 0.2, 1.4], 2.6, 0xdfe8f5); // rim strip, right
    softbox(5, 0.8, [0, -3.6, 2.2], 0.6);              // floor bounce
    const envMap = pmrem.fromScene(studio, 0).texture;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -4000, 4000);
    camera.position.z = 2000;

    // ---- the eye ----
    const root = new THREE.Group(); // position + size
    const ball = new THREE.Group(); // gaze rotation
    root.add(ball);
    scene.add(root);

    const uniforms = {
      uViewObj: { value: new THREE.Vector3(0, 0, 1) },
      uLightObj: { value: new THREE.Vector3(-0.5, 0.55, 0.68).normalize() },
      uPupil: { value: 0.34 },
    };
    const eyeball = new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 96),
      new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, toneMapped: false }),
    );
    ball.add(eyeball);

    // Gloss layers: black and additive, so they contribute only reflections.
    const gloss = (roughness: number, intensity: number) => new THREE.MeshPhysicalMaterial({
      color: 0x000000, roughness, metalness: 0, envMap, envMapIntensity: intensity,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    ball.add(new THREE.Mesh(new THREE.SphereGeometry(1.002, 96, 64), gloss(0.16, 2.2)));
    // Corneal bulge: a cap of a smaller sphere that meets the eyeball at the edge of the iris.
    ball.add(new THREE.Mesh(corneaGeometry(), gloss(0.02, 4.5)));

    // Soft halo so it sits in the page rather than on it
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(drawHalo()), transparent: true, depthWrite: false, depthTest: false }),
    );
    halo.position.z = -1.5;
    halo.renderOrder = -1;
    root.add(halo);

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
    const keyWorld = new THREE.Vector3(-0.5, 0.55, 0.68).normalize();
    const q = new THREE.Quaternion();
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
        tr = (Math.min(rect.width, rect.height) / 2) * 0.86;
        const look = (el.dataset.eye || "ahead") as Look;
        if (look === "pointer" && !reduce) {
          yaw = clamp(((pointer.x - cx) / W) * 1.9, -0.55, 0.55);
          pitch = clamp(((pointer.y - cy) / H) * 1.4, -0.36, 0.36);
        } else if (look === "hop") {
          yaw = reduce ? 0.45 : (Math.floor(now / 1900) % 2 === 0 ? -0.45 : 0.45);
          pitch = 0.08;
        } else if (look === "left") { yaw = -0.45; pitch = 0.06; }
        else if (look === "right") { yaw = 0.45; pitch = 0.06; }
        else if (look === "camera") { yaw = clamp(-eyeBus.lean * 0.5, -0.5, 0.5); }
      }

      // Tiny involuntary saccades make it feel alive
      if (!reduce && now > saccade.until) {
        saccade = { x: (Math.random() - 0.5) * 0.06, y: (Math.random() - 0.5) * 0.04, until: now + 900 + Math.random() * 2400 };
      }

      const follow = (k: number) => (reduce || first ? 1 : 1 - Math.exp(-dt * k));
      const vx = tx - cur.x;
      cur.x += vx * follow(5);
      cur.y += (ty - cur.y) * follow(5);
      cur.r += (tr - cur.r) * follow(6);
      cur.yaw += (yaw + saccade.x - cur.yaw) * follow(14);
      cur.pitch += (pitch + saccade.y - cur.pitch) * follow(14);
      first = false;

      root.position.set(cur.x, cur.y, 0);
      root.scale.setScalar(Math.max(cur.r, 0.0001));
      root.visible = cur.r > 2;
      root.rotation.z = reduce ? 0 : clamp(-vx * 0.0005, -0.3, 0.3);
      ball.rotation.set(cur.pitch, cur.yaw, 0);

      // View + key light in the eyeball's own space (for iris parallax and shading)
      ball.updateMatrixWorld();
      ball.getWorldQuaternion(q).invert();
      uniforms.uViewObj.value.set(0, 0, 1).applyQuaternion(q);
      uniforms.uLightObj.value.copy(keyWorld).applyQuaternion(q);
      uniforms.uPupil.value = reduce ? 0.34 : 0.335 + Math.sin(now * 0.0007) * 0.025; // pupil breathes

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

/** Cap of a sphere that bulges ~6% in front of the eyeball and meets it at the iris edge. */
function corneaGeometry() {
  const limbusZ = Math.sqrt(1 - IRIS * IRIS);
  const apex = 1.06;
  const c = (apex * apex - IRIS * IRIS - limbusZ * limbusZ) / (2 * (apex - limbusZ)); // sphere centre on z
  const rc = apex - c;
  const theta = Math.acos((limbusZ - c) / rc);
  const g = new THREE.SphereGeometry(rc, 96, 32, 0, Math.PI * 2, 0, theta);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, c);
  return g;
}

function drawHalo() {
  const S = 256, c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(S / 2, S / 2, S * 0.18, S / 2, S / 2, S / 2);
  grad.addColorStop(0, "rgba(160,180,210,0.16)");
  grad.addColorStop(0.5, "rgba(120,140,170,0.05)");
  grad.addColorStop(1, "rgba(120,140,170,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  return c;
}

const VERT = /* glsl */ `
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vPos;
uniform vec3 uViewObj;
uniform vec3 uLightObj;
uniform float uPupil;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
float noise3(vec3 p) { return noise(p.xy + p.z * 1.7) * 0.5 + noise(p.yz * 1.3 - p.x) * 0.5; }

void main() {
  vec3 n = normalize(vPos);
  vec3 v = normalize(uViewObj);

  // Iris sits ~0.11 behind the cornea: shift its lookup against the view direction (parallax).
  float front = smoothstep(0.55, 0.95, n.z);
  vec2 qi = n.xy - v.xy * 0.11 * front;
  float rr = length(qi) / ${IRIS.toFixed(3)};   // 0 at centre, 1 at the limbus
  float a = atan(qi.y, qi.x);

  // ---- iris: grey-blue steel ----
  vec3 cDeep  = vec3(0.10, 0.13, 0.18);
  vec3 cMid   = vec3(0.30, 0.38, 0.48);
  vec3 cLight = vec3(0.62, 0.69, 0.78);
  vec3 cWarm  = vec3(0.50, 0.46, 0.40);

  float fib  = fbm(vec2(a * 9.549, rr * 2.2));        // coarse radial strands
  float fib2 = fbm(vec2(a * 31.83, rr * 1.2 + 7.0));  // fine strands
  vec3 iris = mix(cMid, cDeep, smoothstep(0.55, 1.0, rr));
  iris = mix(iris, cLight, smoothstep(0.45, 0.85, fib) * 0.75 * (1.0 - smoothstep(0.78, 1.0, rr)));
  iris *= 0.72 + 0.55 * fib2;

  // Collarette: a lighter, wavy ring a little outside the pupil
  float cr = uPupil + 0.17 + 0.025 * sin(a * 9.0) + 0.012 * sin(a * 23.0);
  float collarette = exp(-pow((rr - cr) / 0.045, 2.0));
  iris = mix(iris, cWarm, collarette * 0.45);

  // Crypts: small darker pits
  float crypts = smoothstep(0.6, 0.74, fbm(vec2(a * 4.0, rr * 7.0) + 11.0));
  iris *= 1.0 - crypts * 0.4 * step(cr, rr);

  // Dark limbal ring at the edge
  iris *= mix(1.0, 0.18, smoothstep(0.8, 1.0, rr));

  // Pupil with a soft edge
  float pupil = 1.0 - smoothstep(uPupil - 0.02, uPupil + 0.02, rr);
  iris = mix(iris, vec3(0.006, 0.007, 0.01), pupil);

  // ---- sclera ----
  vec3 sclera = vec3(0.925, 0.92, 0.91);
  float back = smoothstep(0.35, -0.7, n.z);
  sclera = mix(sclera, vec3(0.72, 0.69, 0.68), back * 0.7);
  float veinN = noise3(n * 5.5) * 0.65 + noise3(n * 13.0) * 0.35;
  float vein = 1.0 - smoothstep(0.0, 0.03, abs(veinN - 0.5));
  float veinMask = smoothstep(${IRIS.toFixed(3)} + 0.12, ${IRIS.toFixed(3)} + 0.6, length(n.xy)) * smoothstep(-0.4, 0.4, n.z);
  sclera = mix(sclera, vec3(0.70, 0.42, 0.44), vein * veinMask * 0.11);
  // Slight grey shadow at the limbus where sclera meets cornea
  sclera *= 1.0 - 0.18 * exp(-pow((rr - 1.0) / 0.12, 2.0)) * front;

  float irisMask = (1.0 - smoothstep(0.985, 1.025, rr)) * step(0.0, n.z);
  vec3 base = mix(sclera, iris, irisMask);

  // ---- lighting: soft wrapped key, cool fill, darkened silhouette ----
  float ndl = dot(n, normalize(uLightObj));
  float diff = clamp((ndl + 0.45) / 1.45, 0.0, 1.0);
  vec3 col = base * (0.22 + 0.95 * diff);
  col += vec3(0.05, 0.015, 0.012) * (1.0 - diff) * (1.0 - irisMask);  // warm subsurface in shadow
  col += vec3(0.02, 0.03, 0.05) * smoothstep(0.2, -0.8, ndl);        // cool fill from the right
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.2);
  col *= 1.0 - rim * 0.55;

  gl_FragColor = vec4(col, 1.0);
}`;
