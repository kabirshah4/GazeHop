// Viewport screenshots of key sections after scrolling to them (lets scroll-linked effects settle).
import puppeteer from "puppeteer-core";
const [url, out] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(url, { waitUntil: "networkidle0" });
await page.keyboard.press("Escape"); // skip intro
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: `${out}-hero.png` });
const go = async (sel, offset = 0) => {
  await page.evaluate((sel, offset) => { const el = document.querySelector(sel); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - offset); }, sel, offset);
  await new Promise((r) => setTimeout(r, 2200));
};
await go("#how", -500); await page.screenshot({ path: `${out}-step.png` });
await go("#faq", 60);
await page.evaluate(() => [...document.querySelectorAll("#faq button")][2].click());
await new Promise((r) => setTimeout(r, 250));
await page.screenshot({ path: `${out}-faq-mid.png` });
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: `${out}-faq.png` });
await go("#install", 40);
await page.evaluate(() => [...document.querySelectorAll('#install [role="tab"]')][3].click());
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: `${out}-install.png` });
console.log(JSON.stringify({ errors }));
await browser.close();
