// Renders brand/logo-mark.svg into every icon GazeHop needs:
//   ../Resources/AppIcon.icns (macOS app), ../docs/logo.png (README), public/ favicons.
// Run: node scripts/make-app-icon.mjs
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync, writeFileSync } from "node:fs";
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
// Favicons carry a version in the name: browsers cache favicons hard, so a new design needs a new URL.
const V = "v3";
const png32 = await sharp(svg, { density: 384 }).resize(32).png().toBuffer();
const png48 = await sharp(svg, { density: 384 }).resize(48).png().toBuffer();
writeFileSync(`public/favicon-${V}-32.png`, png32);
await sharp(svg, { density: 384 }).resize(180).png().toFile(`public/apple-touch-icon-${V}.png`);
copyFileSync(svg, `public/favicon-${V}.svg`);
writeFileSync("public/favicon.ico", ico([[16, await sharp(svg, { density: 384 }).resize(16).png().toBuffer()], [32, png32], [48, png48]]));
copyFileSync(svg, "public/logo-mark.svg");
console.log("Wrote AppIcon.icns, docs/logo.png and site favicons");

/** Minimal .ico writer: ICO files can hold PNG images directly. */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(([size, png], i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e); header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(png.length, e + 8); header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(([, png]) => png)]);
}
