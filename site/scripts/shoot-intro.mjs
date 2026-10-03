// Captures the intro overlay at a few moments, plus skip-by-key behaviour.
import puppeteer from "puppeteer-core";
const [url, out] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const t0 = Date.now();
await page.goto(url, { waitUntil: "domcontentloaded" });
for (const ms of [400, 900, 1800, 3600]) {
  const wait = ms - (Date.now() - t0);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  await page.screenshot({ path: `${out}-${ms}.png` });
}
const overlayGone = await page.evaluate(() => !document.querySelector(".fixed.inset-0.z-\\[60\\]"));
// Second visit in the same session: no intro
await page.reload({ waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 300));
const replayed = await page.evaluate(() => !!document.querySelector(".fixed.inset-0.z-\\[60\\]"));
console.log(JSON.stringify({ overlayGoneAfter3_6s: overlayGone, replayedOnReload: replayed, errors }));
await browser.close();
