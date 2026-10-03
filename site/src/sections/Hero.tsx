import { motion, useReducedMotion } from "motion/react";
import { DownloadGlyph } from "../components/Chrome";
import { DOWNLOAD, REPO } from "../lib/links";
import { MacDemo } from "./MacDemo";

/*
  THESIS: The page is a Mac. The first viewport shows GazeHop doing its job on a two-display desktop,
  instead of describing it. Refuses the dark dev-tool landing and the generic SaaS hero.
  OWN-WORLD: macOS light: Apple grey ground, white continuous-corner cards with hairlines, frosted
  glass only for menu bar / HUD / nav, system blue as the one accent, New York serif for the hero line,
  SF Pro everywhere else. Dawn sky in the hero and the close.
  STORY: see focus follow a glance -> understand the mechanism -> trust it (on-device, open source)
  -> download.
  FIRST VIEWPORT: frosted nav; serif headline centred on the sky; one-line explanation; white pill
  "Download for Mac" with "View the source" beside it; the two-display desktop rises out of the sky.
  FORM: pinned by the brief (Apple/iOS, cluely.com as reference); App Store-style landing.
  Concept roll bypassed: the brief pinned the form, so no seed key was drawn.
*/

const spring = { type: "spring", bounce: 0, duration: 0.9 } as const;

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { ...spring, delay },
  });

  return (
    <section className="relative -mt-[52px] overflow-hidden pt-[52px]" aria-labelledby="hero-title">
      <Sky variant="hero" />
      <div className="wrap relative z-10 flex flex-col items-center pt-[clamp(48px,6vw,88px)] text-center text-white">
        <motion.h1 {...rise(0)} id="hero-title" className="t-hero max-w-[18ch] text-balance [text-shadow:0_1px_24px_rgba(20,40,120,.25)]">
          Look at a screen, and your keyboard follows.
        </motion.h1>
        <motion.p {...rise(0.08)} className="mt-6 max-w-[38ch] text-[clamp(18px,1.5vw,22px)] leading-[1.4] tracking-[-0.015em] text-white/90">
          GazeHop sees which display you're looking at and moves keyboard focus there. No clicking first.
        </motion.p>
        <motion.div {...rise(0.16)} className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <a href={DOWNLOAD} className="btn bg-white !text-[color:var(--color-ink)] shadow-[0_8px_24px_-10px_rgba(20,30,90,.55)] hover:bg-white/90">
            <DownloadGlyph className="size-[17px]" /> Download for Mac
          </a>
          <a href={REPO} className="btn text-white hover:underline hover:underline-offset-4">View the source <span aria-hidden="true">›</span></a>
        </motion.div>
        <motion.p {...rise(0.22)} className="mt-4 text-[14px] text-white">Free and open source · macOS 14 or later</motion.p>
      </div>

      <motion.div
        className="wrap relative z-10 mt-[clamp(36px,3.5vw,52px)] pb-24"
        initial={reduce ? false : { opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...spring, duration: 1.2, delay: 0.25 }}
      >
        <MacDemo />
      </motion.div>
    </section>
  );
}

/** Dawn sky: deep morning blue where the hero text sits, warming to a peach horizon behind the
 *  desk and settling into page grey at the section edge, so there is never a hard seam. */
export function Sky({ className = "", variant = "close" }: { className?: string; variant?: "hero" | "close" }) {
  const layers = variant === "hero"
    ? [
        // clouds high in the sky, kept faint so white text stays above 4.5:1
        "radial-gradient(30% 90px at 16% 150px, rgba(255,255,255,.16), transparent 70%)",
        "radial-gradient(24% 70px at 30% 210px, rgba(255,255,255,.10), transparent 70%)",
        "radial-gradient(26% 80px at 84% 110px, rgba(255,255,255,.14), transparent 70%)",
        "radial-gradient(20% 60px at 70% 300px, rgba(255,255,255,.08), transparent 70%)",
        // sunrise behind the desk + base gradient: tuned per breakpoint in styles.css
        "var(--sky-sun)",
        "var(--sky-hero)",
      ]
    : [
        "radial-gradient(30% 120px at 20% 34%, rgba(255,255,255,.7), transparent 70%)",
        "radial-gradient(26% 100px at 80% 40%, rgba(255,255,255,.6), transparent 70%)",
        "radial-gradient(50% 45% at 50% 62%, rgba(255,200,170,.45), transparent 70%)",
        "linear-gradient(180deg, var(--color-ground) 0%, #DCE6FB 26%, #CFDDFA 44%, #F3DCDA 66%, #F2E6E3 82%, var(--color-ground) 100%)",
      ];
  return <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true" style={{ background: layers.join(",") }} />;
}
