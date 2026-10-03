import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A photographic 3D eyeball that lives in the page like any other element and scrolls with it.
 * Each instance renders into its own canvas, only while it's on screen.
 *
 *   look="pointer"  follows the mouse          look="hop"     glances left, then right
 *   look="left"     looks at the left screen   look="right"   looks at the right screen
 *   look="camera"   mirrors the visitor's head in the camera demo (eyeBus.lean)
 *
 * Rendering: the eyeball (sclera + iris + pupil) is a custom shader with the iris recessed under
 * the cornea (parallax), plus two clear gloss layers (whole eye + corneal bulge) that only add
 * reflections of a small studio softbox setup, which is what makes it read as wet and real.
 */
export const eyeBus = { lean: 0 };

export type Look = "pointer" | "hop" | "left" | "right" | "camera" | "ahead";

const IRIS = 0.5;       // iris radius on the front of a unit eyeball
const FILL = 0.86;      // eyeball diameter as a share of the box

export function Eye3D({ look = "ahead", className = "" }: { look?: Look; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef<Look>(look);
  lookRef.current = look;

  useEffect(() => {
    const box = boxRef.current!, canvas = canvasRef.current!;
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

    const scene = new THREE.Scene();

    // Studio lighting for reflections: a small key softbox up-left, a rim strip, a faint floor bounce.
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
    softbox(0.9, 0.7, [-3.0, 3.1, 2.4], 9);
    softbox(0.35, 3.2, [4.4, 0.3, 0.9], 1.8, 0xdfe8f5);
    softbox(5, 0.8, [0, -3.6, 2.2], 0.3);
    const envMap = pmrem.fromScene(studio, 0).texture;

    const half = 1 / FILL;
    const camera = new THREE.OrthographicCamera(-half, half, half, -half, -10, 10);
    camera.position.z = 5;

    const ball = new THREE.Group();
    scene.add(ball);
    const uniforms = {
      uViewObj: { value: new THREE.Vector3(0, 0, 1) },
      uLightObj: { value: new THREE.Vector3(-0.5, 0.55, 0.68).normalize() },
      uPupil: { value: 0.34 },
    };
    ball.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 96),
      new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, toneMapped: false }),
    ));
    const gloss = (roughness: number, intensity: number) => new THREE.MeshPhysicalMaterial({
      color: 0x000000, roughness, metalness: 0, envMap, envMapIntensity: intensity,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    ball.add(new THREE.Mesh(new THREE.SphereGeometry(1.002, 96, 64), gloss(0.16, 2.2)));
    ball.add(new THREE.Mesh(corneaGeometry(), gloss(0.03, 3)));

    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(2.3, 2.3),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(drawHalo()), transparent: true, depthWrite: false, depthTest: false }),
    );
    halo.position.z = -2;
    halo.renderOrder = -1;
    scene.add(halo);

    const resize = () => {
      const r = box.getBoundingClientRect();
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight * 0.3 };
    const onMove = (e: PointerEvent) => { pointer.x = e.clientX; pointer.y = e.clientY; };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Only animate while visible
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }, { rootMargin: "100px" });
    io.observe(box);

    const cur = { yaw: 0, pitch: 0 };
    const keyWorld = new THREE.Vector3(-0.5, 0.55, 0.68).normalize();
    const q = new THREE.Quaternion();
    let saccade = { x: 0, y: 0, until: 0 };
    let raf = 0;
    let first = true;
    let last = performance.now();

    function tick(now: number) {
      if (!visible) { raf = 0; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const r = box.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const W = window.innerWidth, H = window.innerHeight;
      let yaw = 0, pitch = 0;
      const mode = lookRef.current;
      if (mode === "pointer" && !reduce) {
        yaw = clamp(((pointer.x - cx) / W) * 1.9, -0.55, 0.55);
        pitch = clamp(((pointer.y - cy) / H) * 1.4, -0.36, 0.36);
      } else if (mode === "hop") {
        yaw = reduce ? 0.45 : (Math.floor(now / 1900) % 2 === 0 ? -0.45 : 0.45);
        pitch = 0.08;
      } else if (mode === "left") { yaw = -0.45; pitch = 0.06; }
      else if (mode === "right") { yaw = 0.45; pitch = 0.06; }
      else if (mode === "camera") { yaw = clamp(-eyeBus.lean * 0.5, -0.5, 0.5); }

      if (!reduce && now > saccade.until) {
        saccade = { x: (Math.random() - 0.5) * 0.06, y: (Math.random() - 0.5) * 0.04, until: now + 900 + Math.random() * 2400 };
      }
      const k = reduce || first ? 1 : 1 - Math.exp(-dt * 14);
      cur.yaw += (yaw + saccade.x - cur.yaw) * k;
      cur.pitch += (pitch + saccade.y - cur.pitch) * k;
      first = false;
      ball.rotation.set(cur.pitch, cur.yaw, 0);

      ball.updateMatrixWorld();
      ball.getWorldQuaternion(q).invert();
      uniforms.uViewObj.value.set(0, 0, 1).applyQuaternion(q);
      uniforms.uLightObj.value.copy(keyWorld).applyQuaternion(q);
      uniforms.uPupil.value = reduce ? 0.34 : 0.335 + Math.sin(now * 0.0007) * 0.025; // pupil breathes

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      visible = false;
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      renderer.dispose();
      pmrem.dispose();
    };
  }, []);

  return (
    <div ref={boxRef} className={`relative ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
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
