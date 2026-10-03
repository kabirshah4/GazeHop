// Crops and compresses the Higgsfield source images in raw/ into public/img/*.webp,
// and builds the 1200x630 social preview (public/og.png). Run: npm run images
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public/img", { recursive: true });

// name, source, crop as fractions of the source {top, height} (full width kept)
const shots = [
  ["controller", "raw/gaming-b.png", { top: 0.42, height: 0.58 }],
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

// Social preview: new dark brand, logo mark, headline.
const W = 1200, H = 630;
const bg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="50%" cy="0%" r="90%"><stop offset="0" stop-color="#143229"/><stop offset=".55" stop-color="#0B0F19"/></radialGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <style>.h{font:700 70px "SF Pro Display", Helvetica, Arial, sans-serif; fill:#F5F7FA; letter-spacing:-2.5px} .s{font:500 28px "SF Pro Text", Helvetica, Arial, sans-serif; fill:#A3ACBD}</style>
  <text x="80" y="345" class="h">Look at a screen, and</text>
  <text x="80" y="428" class="h">your keyboard follows.</text>
  <circle cx="90" cy="512" r="7" fill="#10B981"/>
  <text x="110" y="522" class="s">GazeHop · free and open source for macOS</text>
</svg>`);
const mark = await sharp("brand/logo-mark.svg", { density: 300 }).resize(180).png().toBuffer();
await sharp(bg).composite([{ input: mark, left: 58, top: 60 }]).jpeg({ quality: 86, mozjpeg: true }).toFile("public/og.jpg");

console.log("og.jpg written");
