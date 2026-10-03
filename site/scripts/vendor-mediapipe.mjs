// Copies MediaPipe's WebAssembly runtime and downloads the face model into public/vendor/,
// so the camera demo never loads anything from third-party servers at runtime.
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";

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
  writeFileSync(model, Buffer.from(await res.arrayBuffer()));
}
console.log("MediaPipe runtime + face model in", out);
