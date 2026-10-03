// Generates the GazeHop logo SVGs (deterministic, so the iris fibres never change):
//   brand/logo-mark.svg  full-colour app icon (graphite tile, glossy eyeball, caret pupil)
//   brand/logo-mono.svg  single-colour mark for small/one-ink uses (intro wordmark, etc.)
// Run: node scripts/make-logo.mjs  then  node scripts/make-app-icon.mjs
import { writeFileSync } from "node:fs";

function rng(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6d2b79f5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const R = rng(20261003);
const C = 512, EYE = 268, IRIS = 142;
const f = (n) => n.toFixed(1);

// Iris fibres: thin radial strokes, light and dark, slightly curved
let fibres = "";
for (let i = 0; i < 220; i++) {
  const a = (i / 220) * Math.PI * 2 + (R() - 0.5) * 0.03;
  const r0 = IRIS * (0.4 + R() * 0.08), r1 = IRIS * (0.78 + R() * 0.2);
  const bend = (R() - 0.5) * 0.06;
  const mx = C + Math.cos(a + bend) * (r0 + r1) / 2, my = C + Math.sin(a + bend) * (r0 + r1) / 2;
  const light = R() < 0.55;
  const op = light ? 0.1 + R() * 0.22 : 0.12 + R() * 0.25;
  fibres += `<path d="M${f(C + Math.cos(a) * r0)} ${f(C + Math.sin(a) * r0)} Q${f(mx)} ${f(my)} ${f(C + Math.cos(a) * r1)} ${f(C + Math.sin(a) * r1)}" stroke="${light ? "#DCE6F3" : "#0E1622"}" stroke-opacity="${op.toFixed(2)}" stroke-width="${(1.2 + R() * 2.2).toFixed(1)}"/>`;
}

// Pupil: a text caret (I-beam), the "you look, you type" idea
const caret = (fill) => `
  <rect x="${C - 15}" y="${C - 62}" width="30" height="124" rx="9" fill="${fill}"/>
  <rect x="${C - 42}" y="${C - 62}" width="84" height="24" rx="9" fill="${fill}"/>
  <rect x="${C - 42}" y="${C + 38}" width="84" height="24" rx="9" fill="${fill}"/>`;

const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="tile" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="#232A36"/><stop offset=".6" stop-color="#11151C"/><stop offset="1" stop-color="#07090D"/>
    </radialGradient>
    <linearGradient id="tileEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="sclera" cx="44%" cy="38%" r="68%">
      <stop offset="0" stop-color="#FBFBFA"/><stop offset=".55" stop-color="#E6E7E9"/><stop offset=".85" stop-color="#B7BCC4"/><stop offset="1" stop-color="#8C929C"/>
    </radialGradient>
    <radialGradient id="iris" cx="50%" cy="50%" r="50%">
      <stop offset=".3" stop-color="#2A3646"/><stop offset=".42" stop-color="#7C93B0"/><stop offset=".62" stop-color="#9DB1CB"/>
      <stop offset=".82" stop-color="#5C7392"/><stop offset=".94" stop-color="#1B2433"/><stop offset="1" stop-color="#0D121A"/>
    </radialGradient>
    <radialGradient id="limbus" cx="50%" cy="50%" r="50%">
      <stop offset=".88" stop-color="#0B1018" stop-opacity="0"/><stop offset="1" stop-color="#0B1018" stop-opacity=".55"/>
    </radialGradient>
    <radialGradient id="gloss" cx="38%" cy="26%" r="55%">
      <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="irisClip"><circle cx="${C}" cy="${C}" r="${IRIS}"/></clipPath>
  </defs>

  <rect x="100" y="100" width="824" height="824" rx="186" fill="url(#tile)"/>
  <rect x="100" y="100" width="824" height="824" rx="186" fill="url(#tileEdge)"/>
  <rect x="101.5" y="101.5" width="821" height="821" rx="184.5" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="3"/>

  <ellipse cx="${C}" cy="${C + EYE * 0.92}" rx="${EYE * 0.8}" ry="${EYE * 0.16}" fill="url(#shadow)"/>
  <circle cx="${C}" cy="${C}" r="${EYE}" fill="url(#sclera)"/>

  <g clip-path="url(#irisClip)">
    <circle cx="${C}" cy="${C}" r="${IRIS}" fill="url(#iris)"/>
    <g fill="none" stroke-linecap="round">${fibres}</g>
    <circle cx="${C}" cy="${C}" r="${IRIS}" fill="url(#limbus)"/>
  </g>
  ${caret("#05070B")}

  <ellipse cx="${C - 62}" cy="${C - 70}" rx="34" ry="24" transform="rotate(-28 ${C - 62} ${C - 70})" fill="#fff" opacity=".92"/>
  <circle cx="${C}" cy="${C}" r="${EYE}" fill="url(#gloss)"/>
  <circle cx="${C}" cy="${C}" r="${EYE - 1}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
</svg>
`;

// One ink: a disc with the iris drawn as a cut ring and the caret pupil cut out
const mono = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
  <defs>
    <mask id="gazehop-mark-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
      <rect width="512" height="512" fill="#000"/>
      <circle cx="256" cy="256" r="216" fill="#fff"/>
      <circle cx="256" cy="256" r="112" fill="none" stroke="#000" stroke-width="22"/>
      <rect x="244" y="200" width="24" height="112" rx="8" fill="#000"/>
      <rect x="220" y="200" width="72" height="22" rx="8" fill="#000"/>
      <rect x="220" y="290" width="72" height="22" rx="8" fill="#000"/>
    </mask>
  </defs>
  <rect width="512" height="512" fill="#f5f5f7" mask="url(#gazehop-mark-cut)"/>
</svg>
`;

writeFileSync("brand/logo-mark.svg", full);
writeFileSync("brand/logo-mono.svg", mono);
console.log("Wrote brand/logo-mark.svg and brand/logo-mono.svg");
