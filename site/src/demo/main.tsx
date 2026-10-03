import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { useState } from "react";
import "../styles.css";
import { DemoScene } from "./DemoScene";

// Recording harness: scripts/record-demo.mjs calls window.setT(ms) for each frame.
let setTime: (t: number) => void = () => {};
function App() {
  const [t, setT] = useState(0);
  setTime = setT;
  return <DemoScene t={t} />;
}
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
(window as unknown as { setT: (t: number) => Promise<void> }).setT = (t) =>
  new Promise((res) => { flushSync(() => setTime(t)); requestAnimationFrame(() => res()); });

// Preview in a browser: play in real time unless ?record is set.
if (!location.search.includes("record")) {
  const start = performance.now();
  const loop = () => { setTime((performance.now() - start) % 15000); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
