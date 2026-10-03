// Renders src/demo/DemoScene.tsx frame by frame into public/demo.mp4 + public/demo-poster.jpg.
// Run: node scripts/record-demo.mjs   (needs ffmpeg and Google Chrome)
import { spawn } from "node:child_process";
import { createServer } from "vite";
import puppeteer from "puppeteer-core";

const FPS = 30, SECONDS = 15, W = 1920, H = 1080;
const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: "error", base: "/" });
await server.listen();

const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto("http://localhost:5199/demo-scene.html?record", { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);

const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "public/demo.mp4"],
  { stdio: ["pipe", "inherit", "inherit"] });

for (let f = 0; f < FPS * SECONDS; f++) {
  await page.evaluate((t) => window.setT(t), (f * 1000) / FPS);
  ff.stdin.write(await page.screenshot({ type: "jpeg", quality: 92 }));
  if (f === 170) await page.screenshot({ path: "public/demo-poster.jpg", type: "jpeg", quality: 80 });
  if (f % 90 === 0) console.log(`frame ${f}/${FPS * SECONDS}`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
await server.close();
console.log("Wrote public/demo.mp4 and public/demo-poster.jpg");
