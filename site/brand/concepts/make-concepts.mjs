// Logo concepts for GazeHop (no eye). Run from site/: node brand/concepts/make-concepts.mjs
import { writeFileSync } from "node:fs";
const f = (n) => n.toFixed(1);
function squircle(cx, cy, size, n = 5, steps = 256) {
  const r = size / 2; let d = "";
  for (let i = 0; i < steps; i++) { const t = (i / steps) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    d += `${i ? "L" : "M"}${f(cx + r * Math.sign(c) * Math.abs(c) ** (2 / n))} ${f(cy + r * Math.sign(s) * Math.abs(s) ** (2 / n))}`; }
  return d + "Z";
}
const TILE = squircle(512, 512, 824);
const defs = `
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
    <filter id="lift" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0B1E5C" flood-opacity=".30"/>
    </filter>`;
const tile = `<path d="${TILE}" fill="url(#sky)"/><path d="${TILE}" fill="url(#sun)"/><path d="${TILE}" fill="url(#sheen)"/>`;
const svg = (body, extra = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs>${defs}${extra}</defs>${tile}${body}</svg>\n`;

// A: Hop. Dim screen -> arc -> bright screen with the blue caret where focus lands.
const A = svg(`
  <g filter="url(#lift)">
    <rect x="190" y="500" width="300" height="200" rx="34" fill="#fff" fill-opacity=".38"/>
    <rect x="534" y="500" width="300" height="200" rx="34" fill="#fff"/>
  </g>
  <path d="M340 468C390 250 634 250 684 468" fill="none" stroke="url(#arcA)" stroke-width="40" stroke-linecap="round"/>
  <rect x="664" y="548" width="34" height="104" rx="17" fill="#0071E3"/>`,
  `<linearGradient id="arcA" x1="340" y1="0" x2="684" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff"/></linearGradient>`);

// B: Keycap. A white key, an arc leaving it, landing on a dot.
const B = svg(`
  <g filter="url(#lift)">
    <rect x="236" y="470" width="300" height="300" rx="64" fill="#fff"/>
  </g>
  <rect x="262" y="490" width="248" height="236" rx="46" fill="#F1F4FB"/>
  <rect x="369" y="540" width="34" height="136" rx="17" fill="#0071E3"/>
  <path d="M440 440C500 230 720 230 770 470" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round"/>
  <circle cx="776" cy="560" r="44" fill="#fff"/>`);

// C: G arc. One stroke that hops and lands.
const C = svg(`
  <g filter="url(#lift)">
    <path d="M700 330A250 250 0 1 0 762 512H560" fill="none" stroke="#fff" stroke-width="96" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <circle cx="560" cy="512" r="30" fill="#0071E3"/>`);

// D: Focus. Two windows; the front one is lit and ringed in blue.
const D = svg(`
  <g filter="url(#lift)">
    <rect x="196" y="300" width="420" height="300" rx="44" fill="#fff" fill-opacity=".4"/>
    <rect x="408" y="430" width="420" height="300" rx="44" fill="#fff"/>
  </g>
  <rect x="408" y="430" width="420" height="300" rx="44" fill="none" stroke="#0071E3" stroke-width="22"/>
  <circle cx="466" cy="486" r="16" fill="#FF5F57"/><circle cx="512" cy="486" r="16" fill="#FEBC2E"/><circle cx="558" cy="486" r="16" fill="#28C840"/>
  <rect x="470" y="560" width="30" height="110" rx="15" fill="#0071E3"/>`);

// Shared desk: dim monitor left, lit monitor right (where focus lands), both on stands
const desk = (caret = true) => `
  <g filter="url(#lift)">
    <rect x="150" y="500" width="330" height="214" rx="32" fill="#fff" fill-opacity=".36"/>
    <path d="M296 714h38l8 44h-54z" fill="#fff" fill-opacity=".36"/><rect x="262" y="756" width="106" height="16" rx="8" fill="#fff" fill-opacity=".36"/>
    <rect x="544" y="500" width="330" height="214" rx="32" fill="#fff"/>
    <path d="M690 714h38l8 44h-54z" fill="#fff"/><rect x="656" y="756" width="106" height="16" rx="8" fill="#fff"/>
  </g>
  ${caret ? `<rect x="692" y="552" width="34" height="110" rx="17" fill="#0071E3"/>` : ""}`;
const q = (t, a, c, b) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t * t * b;
// Hop path: from above the dim screen, over, down into the lit one
const P = [[300, 470], [500, 84], [709, 462]];
const pt = (t) => [q(t, P[0][0], P[1][0], P[2][0]), q(t, P[0][1], P[1][1], P[2][1])];

// E: dotted hop trail, growing and brightening toward the landing
let dots = "";
for (let i = 0; i < 7; i++) { const t = 0.06 + i * 0.145, [x, y] = pt(t); dots += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(12 + i * 4.2)}" fill="#fff" fill-opacity="${(0.35 + i * 0.108).toFixed(2)}"/>`; }
const E = svg(desk() + dots);

// F: tapered swoosh, thin where it leaves, full where it lands
const N = 80, L = [], R = [];
for (let i = 0; i <= N; i++) {
  const t = i / N, [x, y] = pt(t), [x2, y2] = pt(Math.min(1, t + 0.001)), [x1, y1] = pt(Math.max(0, t - 0.001));
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, w = 4 + 24 * t ** 1.3;
  L.push(`${f(x + nx * w)} ${f(y + ny * w)}`); R.unshift(`${f(x - nx * w)} ${f(y - ny * w)}`);
}
const [ex, ey] = pt(1);
const F = svg(desk() + `<path d="M${L.join("L")}A28 28 0 0 0 ${R[0]}L${R.join("L")}Z" fill="url(#arcF)"/>`,
  `<linearGradient id="arcF" x1="300" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".55" stop-color="#fff"/></linearGradient>`);

for (const [k, s] of Object.entries({ A, B, C, D, E, F })) writeFileSync(`brand/concepts/${k}.svg`, s);
console.log("concepts written");
