// Generates the GazeHop logo SVGs, in the website's style (light macOS, dawn sky, focus hopping between screens):
//   brand/logo-mark.svg  full-colour app icon: continuous-corner tile filled with the hero's dawn
//                        sky; a dim screen, a lit screen with the blue caret, and the hop between them
//   brand/logo-tight.svg same tile cropped to its edges (favicons: no macOS icon margin)
//   brand/logo-square.svg full-bleed square (apple-touch-icon: iOS rounds the corners itself)
//   brand/logo-mono.svg  single-colour version for small/one-ink uses
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
const q = (t, a, c, b) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t * t * b;
// The hop: leaves above the dim screen, arcs over, lands on the lit one
const P = [[300, 470], [500, 84], [709, 462]];
const pt = (t) => [q(t, P[0][0], P[1][0], P[2][0]), q(t, P[0][1], P[1][1], P[2][1])];
/** Tapered swoosh as a filled outline: thin where it leaves, full where it lands, round tip. */
function swoosh(w0, w1) {
  const N = 80, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, [x, y] = pt(t), [x2, y2] = pt(Math.min(1, t + 0.001)), [x1, y1] = pt(Math.max(0, t - 0.001));
    const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len, w = w0 + (w1 - w0) * t ** 1.3;
    L.push(`${f(x + nx * w)} ${f(y + ny * w)}`); R.unshift(`${f(x - nx * w)} ${f(y - ny * w)}`);
  }
  return `M${L.join("L")}A${w1} ${w1} 0 0 0 ${R[0]}L${R.join("L")}Z`;
}
const HOP = swoosh(4, 28);
const monitor = (x, op) => `<rect x="${x}" y="500" width="330" height="214" rx="32" fill="#fff"${op}/>
    <path d="M${x + 146} 714h38l8 44h-54z" fill="#fff"${op}/><rect x="${x + 112}" y="756" width="106" height="16" rx="8" fill="#fff"${op}/>`;

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
    <linearGradient id="hop" x1="300" y1="0" x2="709" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".55" stop-color="#fff"/>
    </linearGradient>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0B1E5C" flood-opacity=".30"/>
    </filter>
  </defs>

  <path d="${tile}" fill="url(#sky)"/>
  <path d="${tile}" fill="url(#sun)"/>
  <path d="${tile}" fill="url(#sheen)"/>

  <g filter="url(#lift)">
    ${monitor(150, ' fill-opacity=".36"')}
    ${monitor(544, "")}
  </g>
  <rect x="692" y="552" width="34" height="110" rx="17" fill="#0071E3"/>
  <path d="${HOP}" fill="url(#hop)"/>
</svg>
`;

// One ink: dim screen as an outline, lit screen solid, the hop above (same as the menu bar icon)
const mono = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="120 60 784 744" aria-hidden="true">
  <rect x="166" y="516" width="298" height="182" rx="24" fill="none" stroke="#1d1d1f" stroke-width="32"/>
  <rect x="544" y="500" width="330" height="214" rx="32" fill="#1d1d1f"/>
  <path d="M296 714h38l8 44h-54zM690 714h38l8 44h-54z" fill="#1d1d1f"/><rect x="262" y="756" width="106" height="16" rx="8" fill="#1d1d1f"/><rect x="656" y="756" width="106" height="16" rx="8" fill="#1d1d1f"/>
  <path d="${swoosh(10, 30)}" fill="#1d1d1f"/>
</svg>
`;

writeFileSync("brand/logo-mark.svg", icon(TILE));
writeFileSync("brand/logo-tight.svg", icon(TILE, "100 100 824 824"));
writeFileSync("brand/logo-square.svg", icon("M100 100H924V924H100Z", "100 100 824 824"));
writeFileSync("brand/logo-mono.svg", mono);
console.log("Wrote brand/logo-{mark,tight,square,mono}.svg");
