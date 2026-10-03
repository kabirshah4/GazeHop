// Builds public/third-party-notices.txt from the license files of everything the website ships.
// Run: node scripts/make-notices.mjs   (after npm install; re-run when dependencies change)
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const pkgs = [
  ["react", "Website UI"], ["react-dom", "Website UI"], ["scheduler", "Website UI (used by React)"],
  ["motion", "Website animation"], ["framer-motion", "Website animation (used by Motion)"],
  ["motion-dom", "Website animation (used by Motion)"], ["motion-utils", "Website animation (used by Motion)"],
  ["lenis", "Smooth scrolling"], ["tailwindcss", "Generated styles"],
  ["@fontsource-variable/inter", "Inter typeface"], ["@fontsource/eb-garamond", "EB Garamond typeface"],
];
const licenseFile = (p) => ["LICENSE", "LICENSE.md", "LICENSE.txt", "license"].map((f) => `node_modules/${p}/${f}`).find(existsSync);

let out = `Third-party notices for the GazeHop website
============================================

GazeHop itself is copyright (c) 2026 Kabir Shah, all rights reserved (see
https://github.com/kabirshah4/GazeHop/blob/main/LICENSE). The macOS app uses only
Apple's system frameworks. This website includes the third-party software and
fonts below, each under its own license, reproduced in full.
`;
for (const [p, use] of pkgs) {
  const meta = JSON.parse(readFileSync(`node_modules/${p}/package.json`, "utf8"));
  const file = licenseFile(p);
  if (!file) throw new Error(`No license file for ${p}`);
  out += `\n\n--------------------------------------------------------------------------------\n${p} ${meta.version} (${meta.license}): ${use}\n--------------------------------------------------------------------------------\n\n${readFileSync(file, "utf8").trim()}\n`;
}
const mp = JSON.parse(readFileSync("node_modules/@mediapipe/tasks-vision/package.json", "utf8"));
out += `\n\n--------------------------------------------------------------------------------\n@mediapipe/tasks-vision ${mp.version} (${mp.license}) and the MediaPipe face landmarker model: camera demo\nCopyright The MediaPipe Authors. Served unmodified from /vendor/mediapipe/.\n--------------------------------------------------------------------------------\n\n${readFileSync("licenses/Apache-2.0.txt", "utf8").trim()}\n`;
writeFileSync("public/third-party-notices.txt", out);
console.log("Wrote public/third-party-notices.txt");
