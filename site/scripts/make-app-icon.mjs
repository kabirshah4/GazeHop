// Renders brand/logo-mark.svg into every icon GazeHop needs:
//   ../Resources/AppIcon.icns (macOS app), ../docs/logo.png (README), public/ favicons.
// Run: node scripts/make-app-icon.mjs
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const svg = "brand/logo-mark.svg";
const iconset = join(mkdtempSync(join(tmpdir(), "gazehop-")), "AppIcon.iconset");
execFileSync("mkdir", ["-p", iconset]);
for (const base of [16, 32, 128, 256, 512]) {
  await sharp(svg, { density: 384 }).resize(base).png().toFile(join(iconset, `icon_${base}x${base}.png`));
  await sharp(svg, { density: 384 }).resize(base * 2).png().toFile(join(iconset, `icon_${base}x${base}@2x.png`));
}
execFileSync("iconutil", ["-c", "icns", iconset, "-o", "../Resources/AppIcon.icns"]);
await sharp(svg, { density: 384 }).resize(512).png().toFile("../docs/logo.png");
await sharp(svg, { density: 384 }).resize(512).png().toFile("public/icon.png");
await sharp(svg).resize(32).png().toFile("public/favicon-32.png");
await sharp(svg).resize(180).png().toFile("public/apple-touch-icon.png");
copyFileSync(svg, "public/logo-mark.svg");
console.log("Wrote AppIcon.icns, docs/logo.png and site favicons");
