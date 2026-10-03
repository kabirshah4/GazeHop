// Crops and compresses the Higgsfield source images in raw/ into public/img/*.webp,
// and builds the 1200x630 social preview (public/og.png). Run: npm run images
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public/img", { recursive: true });

// name, source, crop as fractions of the source {top, height} (full width kept)
const shots = [
  ["webcam", "raw/webcam-a.png", { top: 0, height: 1 }],
  ["three-screens", "raw/three-b.png", { top: 0.1, height: 0.9 }],
  ["controller", "raw/gaming-b.png", { top: 0.42, height: 0.58 }],
  ["keyboard", "raw/desk-c.png", { top: 0.3, height: 0.7 }],
];

for (const [name, src, crop] of shots) {
  const img = sharp(src);
  const { width, height } = await img.metadata();
  const region = { left: 0, top: Math.round(height * crop.top), width, height: Math.round(height * crop.height) };
  for (const w of [800, 1600]) {
    await sharp(src).extract(region).resize({ width: w }).webp({ quality: 74 }).toFile(`public/img/${name}-${w}.webp`);
  }
  console.log(`${name}: ${region.width}x${region.height}`);
}

// Social preview: keyboard shot, darkened, with icon and the headline.
const W = 1200, H = 630;
const bg = await sharp("raw/desk-c.png").extract({ left: 0, top: 380, width: 2048, height: 1075 > 1152 - 380 ? 1152 - 380 : 1075 })
  .resize(W, H, { fit: "cover" }).modulate({ brightness: 0.55 }).toBuffer();
const icon = await sharp("public/icon.png").resize(150).toBuffer();
const text = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>.h{font:700 66px Menlo, monospace; fill:#fff} .s{font:500 30px Helvetica, Arial, sans-serif; fill:#C9CDF5}</style>
  <text x="80" y="330" class="h">Look at a screen.</text>
  <text x="80" y="410" class="h">Your keyboard <tspan fill="#FFD43B">follows.</tspan></text>
  <text x="80" y="500" class="s">GazeHop · free, open-source macOS menu bar app</text>
</svg>`);
await sharp(bg).composite([{ input: icon, left: 64, top: 60 }, { input: text, left: 0, top: 0 }]).jpeg({ quality: 82, mozjpeg: true }).toFile("public/og.jpg");

// Favicons
await sharp("public/icon.png").resize(32).png().toFile("public/favicon-32.png");
await sharp("public/icon.png").resize(180).png().toFile("public/apple-touch-icon.png");
console.log("og.jpg + favicons written");
