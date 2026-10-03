import sharp from "sharp";
const ks = process.argv.slice(3).length ? process.argv.slice(3) : ["A", "B", "C", "D"], W = 1240, H = 330 * ks.length / 2 + 40;
const comps = [];
for (const [i, k] of ks.entries()) {
  const x = (i % 2) * 620 + 20, y = Math.floor(i / 2) * 330 + 20;
  comps.push({ input: await sharp(`brand/concepts/${k}.svg`, { density: 144 }).resize(256).png().toBuffer(), left: x, top: y });
  let cx = x + 276;
  for (const s of [64, 32, 16]) { comps.push({ input: await sharp(`brand/concepts/${k}.svg`, { density: 384 }).resize(s).png().toBuffer(), left: cx, top: y + 100 }); cx += s + 24; }
  comps.push({ input: Buffer.from(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><text x="0" y="44" font-family="Helvetica" font-weight="700" font-size="44" fill="#1d1d1f">${k}</text></svg>`), left: x + 276, top: y + 10 });
}
await sharp({ create: { width: W, height: Math.ceil(ks.length / 2) * 330 + 40, channels: 4, background: "#F5F5F7" } }).composite(comps).png().toFile(process.argv[2]);
