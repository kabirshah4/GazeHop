// Viewport screenshots centred on each 3D-eye anchor, to check the flying eye.
import puppeteer from "puppeteer-core";
const [url, out] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "networkidle0" });
const n = await page.$$eval("[data-eye]", (els) => els.length);
for (let i = 0; i < n; i++) {
  await page.evaluate((i) => { const el = document.querySelectorAll("[data-eye]")[i]; const r = el.getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - innerHeight / 2); }, i);
  await new Promise((r) => setTimeout(r, 2200));
  await page.screenshot({ path: `${out}-${i}.png` });
}
console.log("anchors", n);
await browser.close();
