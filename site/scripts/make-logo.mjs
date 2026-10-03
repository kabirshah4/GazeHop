// Generates the GazeHop logo SVGs, in the website's style (light macOS, dawn sky, focus hopping onto a screen):
//   brand/logo-mark.svg  full-colour app icon: continuous-corner tile filled with the hero's dawn
//                        sky; one monitor with the blue caret, and the hop arriving on it from the left
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
/** Tapered swoosh along a quadratic, as a filled outline: thin where it leaves, full where it lands. */
function swoosh(P, w0, w1) {
  const pt = (t) => [q(t, P[0][0], P[1][0], P[2][0]), q(t, P[0][1], P[1][1], P[2][1])];
  const N = 80, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, [x, y] = pt(t), [x2, y2] = pt(Math.min(1, t + 0.001)), [x1, y1] = pt(Math.max(0, t - 0.001));
    const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len, w = w0 + (w1 - w0) * t ** 1.3;
    L.push(`${f(x + nx * w)} ${f(y + ny * w)}`); R.unshift(`${f(x - nx * w)} ${f(y - ny * w)}`);
  }
  return `M${L.join("L")}A${w1} ${w1} 0 0 0 ${R[0]}L${R.join("L")}Z`;
}
// One monitor (screen top-left at 300,420), the caret where focus lands, and the hop arriving from the left
const HOP_PATH = [[190, 520], [250, 180], [470, 380]];
const SCREEN = `<rect x="300" y="420" width="460" height="296" rx="41" />`;
const STAND = `<path d="M502.4 716h55.2l11.5 59.2h-78.2z"/><rect x="451.6" y="772.2" width="156.4" height="20.7" rx="10.4"/>`;
const CARET = `<rect x="509.2" y="503" width="41.6" height="130" rx="20.8"/>`;

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
    <linearGradient id="hop" x1="190" y1="0" x2="490" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".6" stop-color="#fff"/>
    </linearGradient>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0B1E5C" flood-opacity=".30"/>
    </filter>
  </defs>

  <path d="${tile}" fill="url(#sky)"/>
  <path d="${tile}" fill="url(#sun)"/>
  <path d="${tile}" fill="url(#sheen)"/>

  <g filter="url(#lift)" fill="#fff">${SCREEN}${STAND}</g>
  <g fill="#0071E3">${CARET}</g>
  <path d="${swoosh(HOP_PATH, 4, 30)}" fill="url(#hop)"/>
</svg>
`;

// One ink: the monitor solid with the caret cut out, and the hop (same as the menu bar icon)
const mono = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 150 724 724" aria-hidden="true">
  <defs><mask id="gazehop-caret" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#fff"/><g fill="#000">${CARET}</g></mask></defs>
  <g fill="#1d1d1f"><g mask="url(#gazehop-caret)">${SCREEN}</g>${STAND}<path d="${swoosh(HOP_PATH, 5, 32)}"/></g>
</svg>
`;

writeFileSync("brand/logo-mark.svg", icon(TILE));
writeFileSync("brand/logo-tight.svg", icon(TILE, "100 100 824 824"));
writeFileSync("brand/logo-square.svg", icon("M100 100H924V924H100Z", "100 100 824 824"));
writeFileSync("brand/logo-mono.svg", mono);
console.log("Wrote brand/logo-{mark,tight,square,mono}.svg");
