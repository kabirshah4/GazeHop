// Builds the 1200x630 social preview (public/og.jpg). Run: npm run og
import sharp from "sharp";

// Social preview in the site's world: dawn sky, serif headline, the app icon.
const W = 1200, H = 630;
const bg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2350C0"/><stop offset=".6" stop-color="#3A68D8"/><stop offset=".84" stop-color="#8EACEE"/>
      <stop offset=".95" stop-color="#EED6DC"/><stop offset="1" stop-color="#F6E3DA"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="112%" r="50%"><stop offset="0" stop-color="#FFC9A6" stop-opacity=".6"/><stop offset="1" stop-color="#FFC9A6" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  <rect width="100%" height="100%" fill="url(#sun)"/>
  <style>.h{font:400 76px "New York", "Iowan Old Style", Georgia, serif; fill:#fff; letter-spacing:-1.5px} .s{font:500 27px "SF Pro Text", Helvetica, Arial, sans-serif; fill:#fff; fill-opacity:.92}</style>
  <text x="600" y="300" text-anchor="middle" class="h">Look at a screen, and</text>
  <text x="600" y="388" text-anchor="middle" class="h">your keyboard follows.</text>
  <text x="600" y="462" text-anchor="middle" class="s">GazeHop · free for macOS</text>
</svg>`);
const mark = await sharp("brand/logo-tight.svg", { density: 300 }).resize(120).png().toBuffer();
await sharp(bg).composite([{ input: mark, left: (W - 120) / 2, top: 74 }]).jpeg({ quality: 88, mozjpeg: true }).toFile("public/og.jpg");

console.log("og.jpg written");
