// Close-ups of the hero eye at a few pointer positions.
import puppeteer from "puppeteer-core";
const [url, out] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle0" });
const box = await page.$eval('[data-eye="pointer"]', (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
const pad = 60;
const clip = { x: box.x - pad, y: box.y - pad, width: box.w + pad * 2, height: box.h + pad * 2 };
for (const [name, x, y] of [["center", 720, box.y + box.h / 2], ["left", 80, 700], ["right", 1360, 700], ["up", 720, 70]]) {
  await page.mouse.move(x, y);
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: `${out}-${name}.png`, clip });
}
await browser.close();
