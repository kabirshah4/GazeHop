// Copies MediaPipe's WebAssembly runtime and downloads the face model into public/vendor/,
// so the camera demo never loads anything from third-party servers at runtime.
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// SHA-256 of the official float16 face landmarker model. A download (or a cached copy) that
// doesn't match is rejected, so a tampered model can never ship with the site.
const MODEL_SHA256 = "64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff";
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

const out = "public/vendor/mediapipe";
mkdirSync(out, { recursive: true });
for (const f of ["vision_wasm_internal.js", "vision_wasm_internal.wasm",
                 "vision_wasm_nosimd_internal.js", "vision_wasm_nosimd_internal.wasm"]) {
  cpSync(`node_modules/@mediapipe/tasks-vision/wasm/${f}`, `${out}/${f}`);
}
const model = `${out}/face_landmarker.task`;
if (!existsSync(model)) {
  const url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`model download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (sha256(buf) !== MODEL_SHA256) throw new Error("face model checksum mismatch: refusing to use it");
  writeFileSync(model, buf);
}
if (sha256(readFileSync(model)) !== MODEL_SHA256) {
  throw new Error(`${model} does not match the pinned checksum. Delete it and rebuild.`);
}
console.log("MediaPipe runtime + face model in", out);
