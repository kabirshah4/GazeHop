import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BASE } from "../lib/links";

/**
 * Opening beat: the GazeHop mark opens like an eye and the wordmark comes into focus,
 * letter by letter, as a faint colour fringe settles. Plays once per browser session,
 * fades out after the wordmark lands, and can be skipped with a click or any key.
 * Never shown with reduced motion.
 */
const KEY = "gazehop-intro-seen";
const WORD = "GazeHop";
const ease = [0.22, 1, 0.36, 1] as const;

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
    const timer = setTimeout(leave, 2500);
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
      className={`fixed inset-0 z-[60] grid place-items-center bg-black transition-opacity duration-700 ease-out ${phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-[0.22em] text-[clamp(56px,10vw,132px)] font-bold tracking-[-0.045em] text-[#f5f5f7]">
        {/* Mark: opens like an eyelid, then settles */}
        <motion.img
          src={`${BASE}logo-mono.svg`} alt="" className="size-[0.82em]"
          initial={{ scaleY: 0.08, scale: 0.7, opacity: 0, filter: "blur(8px)" }}
          animate={{ scaleY: 1, scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.75, delay: 0.15, ease }}
        />
        <span className="flex">
          {WORD.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: "0.25em", filter: "blur(14px)", textShadow: "-0.08em 0 rgba(255,70,90,.7), 0.08em 0 rgba(90,170,255,.7)" }}
              animate={{ opacity: 1, y: "0em", filter: "blur(0px)", textShadow: "0em 0 rgba(255,70,90,0), 0em 0 rgba(90,170,255,0)" }}
              transition={{ duration: 0.9, delay: 0.35 + i * 0.07, ease }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      </div>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] text-white/35">Click or press any key to skip</p>
    </div>
  );
}
