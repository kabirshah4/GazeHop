// Generates the GazeHop logo SVGs, in the website's style (light macOS, dawn sky, one white eye):
//   brand/logo-mark.svg  full-colour app icon: continuous-corner tile filled with the hero's dawn
//                        sky, a white eye glancing right (the same eye as the menu bar and HUD)
//   brand/logo-tight.svg same tile cropped to its edges (favicons: no macOS icon margin)
//   brand/logo-square.svg full-bleed square (apple-touch-icon: iOS rounds the corners itself)
//   brand/logo-mono.svg  single-colour eye for small/one-ink uses
// Run: node scripts/make-logo.mjs  then  node scripts/make-app-icon.mjs
import { writeFileSync } from "node:fs";

const f = (n) => n.toFixed(1);

/** Apple-style continuous-corner tile: a superellipse, not a rounded rect. */
function squircle(cx, cy, size, n = 5, steps = 256) {
  const r = size / 2;
  let d = "";
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    const x = cx + r * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = cy + r * Math.sign(s) * Math.abs(s) ** (2 / n);
    d += `${i ? "L" : "M"}${f(x)} ${f(y)}`;
  }
  return d + "Z";
}

const TILE = squircle(512, 512, 824);
// Almond eye: two arcs meeting at sharp corners, like the menu bar glyph
const EYE = "M192 512C296 344 728 344 832 512C728 680 296 680 192 512Z";
const PX = 570, PY = 512; // pupil sits right of centre: the glance that moves focus

const icon = (tile, viewBox = "0 0 1024 1024") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <defs>
    <linearGradient id="sky" x1="0" y1="100" x2="0" y2="924" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#2350C0"/><stop offset=".38" stop-color="#3A68D8"/>
      <stop offset=".66" stop-color="#8EACEE"/><stop offset=".86" stop-color="#E9CFDB"/><stop offset="1" stop-color="#F8DCCB"/>
    </linearGradient>
    <radialGradient id="sun" cx="512" cy="930" r="420" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFC9A6" stop-opacity=".85"/><stop offset="1" stop-color="#FFC9A6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0" y1="100" x2="0" y2="560" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sclera" x1="0" y1="380" x2="0" y2="650" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8EEFB"/>
    </linearGradient>
    <radialGradient id="iris" cx="${PX - 18}" cy="${PY - 22}" r="128" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#2C62E0"/><stop offset=".7" stop-color="#0B3FAE"/><stop offset="1" stop-color="#082C7C"/>
    </radialGradient>
    <filter id="lift" x="-20%" y="-40%" width="140%" height="200%">
      <feDropShadow dx="0" dy="22" stdDeviation="26" flood-color="#0B1E5C" flood-opacity=".32"/>
    </filter>
    <clipPath id="eyeClip"><path d="${EYE}"/></clipPath>
  </defs>

  <path d="${tile}" fill="url(#sky)"/>
  <path d="${tile}" fill="url(#sun)"/>
  <path d="${tile}" fill="url(#sheen)"/>

  <g filter="url(#lift)">
    <path d="${EYE}" fill="url(#sclera)"/>
  </g>
  <g clip-path="url(#eyeClip)">
    <circle cx="${PX}" cy="${PY}" r="128" fill="url(#iris)"/>
    <circle cx="${PX}" cy="${PY}" r="56" fill="#0A1433"/>
  </g>
  <circle cx="${PX - 42}" cy="${PY - 46}" r="24" fill="#fff" opacity=".95"/>
</svg>
`;

// One ink: almond outline with a filled pupil, the same glyph as the menu bar icon
const mono = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
  <path d="M40 256C120 128 392 128 472 256C392 384 120 384 40 256Z" fill="none" stroke="#1d1d1f" stroke-width="36" stroke-linejoin="round"/>
  <circle cx="282" cy="256" r="78" fill="#1d1d1f"/>
</svg>
`;

writeFileSync("brand/logo-mark.svg", icon(TILE));
writeFileSync("brand/logo-tight.svg", icon(TILE, "100 100 824 824"));
writeFileSync("brand/logo-square.svg", icon("M100 100H924V924H100Z", "100 100 824 824"));
writeFileSync("brand/logo-mono.svg", mono);
console.log("Wrote brand/logo-{mark,tight,square,mono}.svg");
