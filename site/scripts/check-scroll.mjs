// Checks smooth scrolling: Lenis active, wheel input glides over frames, anchor links land below the nav.
import puppeteer from "puppeteer-core";
const [url, shot] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(url, { waitUntil: "networkidle0" });
const lenis = await page.evaluate(() => document.documentElement.className);

await page.mouse.move(700, 500);
await page.mouse.wheel({ deltaY: 600 });
const samples = [];
for (let i = 0; i < 12; i++) { await new Promise((r) => setTimeout(r, 50)); samples.push(await page.evaluate(() => Math.round(scrollY))); }

await page.evaluate(() => [...document.querySelectorAll("a")].find((a) => a.textContent === "How it works")?.click());
await new Promise((r) => setTimeout(r, 2200));
const anchorTop = await page.evaluate(() => Math.round(document.getElementById("how").getBoundingClientRect().top));

await page.evaluate(() => document.getElementById("features-title").scrollIntoView());
await new Promise((r) => setTimeout(r, 1500));
const card = await page.evaluateHandle(() => [...document.querySelectorAll("article")].find((a) => a.textContent.includes("Leave some screens out")));
await card.asElement().screenshot({ path: shot });
console.log(JSON.stringify({ htmlClass: lenis, wheelScrollY: samples, howSectionTopAfterNavClick: anchorTop, errors }));
await browser.close();
