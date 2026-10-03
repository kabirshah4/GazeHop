import { motion, useReducedMotion } from "motion/react";

type Props = {
  /** -1 = looking toward the first screen, 1 = the second, 0 = straight ahead */
  look: -1 | 0 | 1;
  /** "x" when screens sit side by side, "y" when stacked (phones) */
  axis?: "x" | "y";
  /** 0..1, how far through the dwell time before focus hops */
  dwell?: number;
  className?: string;
};

/** The GazeHop eye: same shape as the menu bar icon, with a dwell meter under it. */
export function Eye({ look, axis = "x", dwell = 0, className = "" }: Props) {
  const reduce = useReducedMotion();
  const offset = look * 9;
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 40" className="w-14 md:w-16 overflow-visible">
        <path
          d="M3 20 C 16 2, 48 2, 61 20 C 48 38, 16 38, 3 20 Z"
          fill="var(--color-card)"
          stroke="var(--color-ink)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <motion.g
          animate={axis === "x" ? { x: offset, y: 0 } : { x: 0, y: look * 5 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 18 }}
        >
          <circle cx="32" cy="20" r="10.5" fill="var(--color-cobalt)" />
          <circle cx="32" cy="20" r="5" fill="var(--color-ink)" />
          <circle cx="35.5" cy="16.5" r="2.4" fill="#fff" />
        </motion.g>
      </svg>
      <div className="h-[3px] w-12 overflow-hidden rounded-full bg-[color:var(--color-hairline)]">
        <div
          className="h-full w-full origin-left rounded-full bg-[color:var(--color-caret)]"
          style={{ transform: `scaleX(${dwell})`, transition: dwell === 0 ? "none" : "transform 80ms linear" }}
        />
      </div>
    </div>
  );
}
