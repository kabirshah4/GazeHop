import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Momentum-smoothed scrolling (Lenis). Off when the visitor prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.085,              // lower = smoother, longer glide
      wheelMultiplier: 0.95,
      smoothWheel: true,
      autoRaf: true,
      anchors: true,            // sections set scroll-margin-top to clear the sticky nav
    });
    document.documentElement.classList.add("has-lenis");
    return () => { lenis.destroy(); document.documentElement.classList.remove("has-lenis"); };
  }, []);
  return null;
}
