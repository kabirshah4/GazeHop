// Smoke test against a deployed URL: page errors, links, 404, camera demo boot (fake camera, no face).
import puppeteer from "puppeteer-core";
const base = process.argv[2];
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const failed = [];
page.on("requestfailed", (r) => failed.push(r.url()));
page.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));

await page.goto(base, { waitUntil: "networkidle0" });
const title = await page.title();
const hrefs = await page.$$eval("a", (as) => [...new Set(as.map((a) => a.href))]);
const og = await page.$eval('meta[property="og:image"]', (m) => m.content);

// Camera demo
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Turn on camera"))?.click());
let status = "";
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 500));
  status = await page.evaluate(() => document.body.innerText.match(/(Loading the face model[^\n]*|Look straight ahead[^\n]*|Active tracking\. Turn[^\n]*|Can't see a face[^\n]*|Camera access is blocked[^\n]*|couldn't start[^\n]*)/)?.[0] ?? "");
  if (status && !status.startsWith("Loading") && !status.startsWith("Look straight")) break;
}
console.log(JSON.stringify({ title, og, demoStatus: status, internalLinks: hrefs.filter((h) => h.startsWith(base)), errors, failed }, null, 1));

for (const p of ["privacy", "terms", "definitely-missing"]) {
  const r = await page.goto(base + p, { waitUntil: "networkidle0" });
  console.log(p, r.status(), await page.title());
}
await browser.close();
