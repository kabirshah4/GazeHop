// One-monitor logo concepts. Run from site/: node brand/concepts/make-single.mjs
import { writeFileSync } from "node:fs";
const f = (n) => n.toFixed(1);
function squircle(cx, cy, size, n = 5, steps = 256) {
  const r = size / 2; let d = "";
  for (let i = 0; i < steps; i++) { const t = (i / steps) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    d += `${i ? "L" : "M"}${f(cx + r * Math.sign(c) * Math.abs(c) ** (2 / n))} ${f(cy + r * Math.sign(s) * Math.abs(s) ** (2 / n))}`; }
  return d + "Z";
}
const TILE = squircle(512, 512, 824);
const q = (t, a, c, b) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t * t * b;
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
const defs = `<linearGradient id="sky" x1="0" y1="100" x2="0" y2="924" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#2350C0"/><stop offset=".38" stop-color="#3A68D8"/><stop offset=".66" stop-color="#8EACEE"/><stop offset=".86" stop-color="#E9CFDB"/><stop offset="1" stop-color="#F8DCCB"/></linearGradient>
  <radialGradient id="sun" cx="512" cy="930" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFC9A6" stop-opacity=".85"/><stop offset="1" stop-color="#FFC9A6" stop-opacity="0"/></radialGradient>
  <linearGradient id="sheen" x1="0" y1="100" x2="0" y2="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <filter id="lift" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0B1E5C" flood-opacity=".30"/></filter>
  <linearGradient id="hop" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".6" stop-color="#fff"/></linearGradient>`;
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs>${defs}</defs><path d="${TILE}" fill="url(#sky)"/><path d="${TILE}" fill="url(#sun)"/><path d="${TILE}" fill="url(#sheen)"/>${body}</svg>\n`;
// One monitor, centred a little low; x, y = screen top-left
const mon = (x, y, w, h) => `<g filter="url(#lift)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.14}" fill="#fff"/>
  <path d="M${x + w / 2 - w * 0.06} ${y + h}h${w * 0.12}l${w * 0.025} ${h * 0.2}h-${w * 0.17}z" fill="#fff"/>
  <rect x="${x + w / 2 - w * 0.17}" y="${y + h * 1.19}" width="${w * 0.34}" height="${h * 0.07}" rx="${h * 0.035}" fill="#fff"/></g>`;
const caret = (cx, cy, h) => `<rect x="${cx - h * 0.16}" y="${cy - h / 2}" width="${h * 0.32}" height="${h}" rx="${h * 0.16}" fill="#0071E3"/>`;

// G: monitor + hop arriving from the upper left
const G = svg(mon(300, 420, 460, 296) + caret(530, 568, 130) + `<path d="${swoosh([[190, 520], [250, 180], [470, 380]], 4, 30)}" fill="url(#hop)"/>`);
// H: just the monitor and caret
const H = svg(mon(272, 360, 480, 310) + caret(512, 515, 140));
// I: monitor, caret, small hop arc over the top
const I = svg(mon(272, 400, 480, 300) + caret(512, 550, 130) + `<path d="${swoosh([[300, 330], [512, 120], [700, 330]], 4, 28)}" fill="url(#hop)"/>`);
for (const [k, s] of Object.entries({ G, H, I })) writeFileSync(`brand/concepts/${k}.svg`, s);
console.log("written");
