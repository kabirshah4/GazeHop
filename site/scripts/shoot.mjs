// Visual check: scrolls the page like a visitor and screenshots it. node scripts/shoot.mjs <url> <out-prefix> [width] [height]
import puppeteer from "puppeteer-core";
const [url, out, w = "1440", h = "900"] = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new", args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(url, { waitUntil: "networkidle0" });
// Scroll through so every reveal triggers, then return to top.
const total = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < total; y += 400) { await page.evaluate((y) => window.scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 120)); }
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 4500)); // let the hero typing finish
await page.screenshot({ path: `${out}-full.png`, fullPage: true });
console.log("height", total, "errors", JSON.stringify(errors));
await browser.close();
