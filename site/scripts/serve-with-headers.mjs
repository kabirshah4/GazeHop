// Serves dist/ with the global headers from public/_headers, to test the CSP locally.
// Usage: node scripts/serve-with-headers.mjs [port]
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const port = Number(process.argv[2] || 4180);
const headers = {};
let inGlobal = false;
for (const line of readFileSync("public/_headers", "utf8").split("\n")) {
  if (/^\S/.test(line)) inGlobal = line.trim() === "/*";
  else if (inGlobal && line.includes(":")) { const i = line.indexOf(":"); headers[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
}
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".mp4": "video/mp4", ".wasm": "application/wasm", ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon", ".task": "application/octet-stream", ".json": "application/json" };
createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = join("dist", path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
  const status = existsSync(file) ? 200 : 404;
  if (status === 404) file = "dist/404.html";
  res.writeHead(status, { ...headers, "Content-Type": types[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`serving dist with production headers on http://localhost:${port}`));
