import { useEffect, useState } from "react";
import { TextAnimationCollection } from "../shaders/neuform-isolated/NeuformIsolatedEffects";
import "../shaders/threeui.css";

/**
 * Opening beat: ThreeUI's chromatic wordmark assembly ("threeui-intro"), set to GazeHop.
 * Plays once per browser session, fades out after the wordmark lands, and can be skipped
 * with a click or any key. Never shown with reduced motion.
 */
const KEY = "gazehop-intro-seen";

export function IntroOverlay() {
  const [phase, setPhase] = useState<"off" | "on" | "leaving">(() => {
    if (typeof window === "undefined") return "off";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
    try { if (sessionStorage.getItem(KEY)) return "off"; } catch { /* storage blocked: still play */ }
    return "on";
  });

  useEffect(() => {
    if (phase !== "on") return;
    try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    const leave = () => setPhase("leaving");
    const timer = setTimeout(leave, 2600); // wordmark assembles by 1.7 s, holds briefly
    window.addEventListener("keydown", leave, { once: true });
    return () => { clearTimeout(timer); window.removeEventListener("keydown", leave); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("off"), 700);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "off") return null;
  return (
    <div
      onClick={() => setPhase("leaving")}
      className={`fixed inset-0 z-[60] bg-black transition-opacity duration-700 ease-out ${phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      aria-hidden="true"
    >
      <div className="shader-frame h-full w-full">
        <TextAnimationCollection
          variant="threeui-intro"
          mode="dark"
          hue={0}
          saturation={1.00}
          brightness={1.00}
        />
      </div>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] text-white/35">Click or press any key to skip</p>
    </div>
  );
}
