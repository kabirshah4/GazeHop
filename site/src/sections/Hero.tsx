import { motion, useReducedMotion } from "motion/react";
import { AnimatedGridPattern } from "../components/magicui/animated-grid-pattern";
import DecryptedText from "../components/reactbits/DecryptedText";
import LightRays from "../components/reactbits/LightRays";
import ShinyText from "../components/reactbits/ShinyText";
import { BorderBeam } from "../components/magicui/border-beam";
import { DownloadButton, GitHubButton } from "../components/Chrome";
import { BASE } from "../lib/links";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <section className="relative overflow-hidden pb-10 pt-12 md:pt-16" aria-labelledby="hero-title">
      <AnimatedGridPattern
        numSquares={18} maxOpacity={0.07} duration={4} width={56} height={56}
        className="fill-[color:var(--color-track)]/30 stroke-white/[.05] [mask-image:radial-gradient(70%_60%_at_50%_30%,#000_30%,transparent_80%)]"
      />
      {/* Soft silver light falling on the eye (React Bits LightRays) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[110vh] opacity-80 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" aria-hidden="true">
        <LightRays raysOrigin="top-center" raysColor="#D4DEEB" raysSpeed={0.45} lightSpread={0.75} rayLength={1.25}
                   fadeDistance={0.85} saturation={0.3} followMouse mouseInfluence={0.05} noiseAmount={0.04} />
      </div>

      <div className="wrap relative z-10 flex flex-col items-center text-center">
        <motion.p {...rise(0)} className="inline-flex items-center gap-2.5 rounded-full border border-[color:var(--color-line-2)] bg-white/[.03] px-3.5 py-1.5 text-[13px] text-[color:var(--color-fg-2)]">
          <span className="pulse-dot" /> <ShinyText text="Active tracking" color="#A3ACBD" shineColor="#FFFFFF" speed={2.8} delay={1.2} />
          <span className="h-3 w-px bg-white/15" aria-hidden="true" />
          Free and open source for macOS
        </motion.p>

        {/* The 3D eye lands here and follows your pointer */}
        <div data-eye="pointer" className="my-8 size-[clamp(120px,13vw,230px)] md:my-10" aria-hidden="true" />

        <motion.h1 {...rise(0.1)} id="hero-title" className="t-hero max-w-[14ch] text-balance">
          Look at a screen, and your keyboard follows<span className="caret" aria-hidden="true" />
        </motion.h1>

        <motion.p {...rise(0.2)} className="mt-7 max-w-[60ch] text-[clamp(17px,0.6vw+14px,21px)] leading-relaxed text-[color:var(--color-fg-2)]">
          GazeHop is a tiny menu bar app for Macs with two or more screens. Your webcam sees which screen
          you're looking at, and keyboard focus moves to the last window you used there.
        </motion.p>

        <motion.div {...rise(0.3)} className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <DownloadButton />
          <GitHubButton />
        </motion.div>
        <motion.p {...rise(0.35)} className="mt-4 text-[13px] text-[color:var(--color-fg-3)]">
          macOS 14 or later · Any Mac with a camera · MIT license
        </motion.p>
      </div>

      <motion.div {...rise(0.45)} className="wrap relative z-10 mt-16 md:mt-20">
        <DemoVideo />
      </motion.div>
    </section>
  );
}

function DemoVideo() {
  return (
    <figure className="mx-auto max-w-[1100px]">
      <div className="relative overflow-hidden rounded-[18px] border border-[color:var(--color-line-2)] bg-[color:var(--color-panel)] shadow-[0_40px_120px_-40px_rgba(143,168,200,.35),0_30px_80px_-30px_rgba(0,0,0,.8)]">
        <div className="flex items-center gap-2 border-b border-[color:var(--color-line)] px-4 py-3">
          <span className="size-3 rounded-full bg-[#FF5F57]" /><span className="size-3 rounded-full bg-[#FEBC2E]" /><span className="size-3 rounded-full bg-[#28C840]" />
          <span className="ml-3 text-[12px] text-[color:var(--color-fg-3)]">GazeHop in 15 seconds</span>
        </div>
        <video
          className="block aspect-video w-full bg-black"
          src={`${BASE}demo.mp4`}
          poster={`${BASE}demo-poster.jpg`}
          autoPlay muted loop playsInline preload="metadata"
          aria-label="Animation: typing on the left screen, looking at the right screen, and the typing continuing there without a click"
        />
        <BorderBeam size={140} duration={9} colorFrom="#8FA8C8" colorTo="#C3D2E6" borderWidth={1.5} />
      </div>
      <figcaption className="mt-3 text-center text-[13px] text-[color:var(--color-fg-3)]">
        Animated walkthrough of the switching flow. No clicks between screens.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Zero-knowledge privacy banner, styled like a certificate            */
/* ------------------------------------------------------------------ */

export function PrivacyCertificate() {
  const rows: [string, string][] = [
    ["Processing", "Apple Vision framework, on your Mac"],
    ["Camera frames", "Read in memory, discarded instantly"],
    ["Storage", "None. Calibration is a few numbers per screen"],
    ["Network", "None. The app contains no networking code"],
  ];
  return (
    <section id="privacy" className="scroll-mt-20 py-16 md:py-24" aria-labelledby="privacy-title">
      <div className="wrap relative z-10">
        <div className="relative mx-auto max-w-[1100px] rounded-[22px] border border-[color:var(--color-track)]/35 bg-[color:var(--color-bg-2)] p-2">
          <div className="relative overflow-hidden rounded-[16px] border border-dashed border-white/12 px-6 py-10 md:px-12 md:py-12">
            <Guilloche />
            <div className="relative grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-14">
              <Seal />
              <div>
                <p className="eyebrow mb-3"><ShinyText text="Zero-knowledge privacy" color="#8FA8C8" shineColor="#E6EDF7" speed={3} delay={1.5} /></p>
                <h2 id="privacy-title" className="t-h2">100% on-device. No network code.</h2>
                <p className="mt-4 max-w-[62ch] text-[color:var(--color-fg-2)]">
                  GazeHop processes camera frames purely in memory using Apple's local Vision framework and
                  discards them instantly. Nothing is recorded, stored or uploaded, and there are no accounts or analytics.
                </p>
                <dl className="mt-8 grid gap-x-10 gap-y-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                  {rows.map(([k, v]) => (
                    <div key={k}>
                      <dt className="eyebrow mb-1">{k}</dt>
                      <dd className="text-[15px]"><DecryptedText text={v} animateOn="view" sequential speed={18} encryptedClassName="text-white/25" /></dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-8 text-[14px] text-[color:var(--color-fg-3)]">
                  Verified by: you. <a className="font-semibold text-[color:var(--color-track)] hover:underline" href="https://github.com/kabirshah4/GazeHop/tree/main/Sources/GazeHop">Read every line of the source →</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Seal() {
  const text = "ON-DEVICE · OPEN SOURCE · NO NETWORK CODE · ";
  return (
    <div className="relative mx-auto size-40 shrink-0 md:size-48" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-[spin_40s_linear_infinite] motion-reduce:animate-none">
        <defs><path id="seal-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
        <text fill="#8FA8C8" fontSize="12.5" letterSpacing="3" fontFamily="SF Mono, ui-monospace, monospace">
          <textPath href="#seal-circle">{text.repeat(2)}</textPath>
        </text>
      </svg>
      <div className="absolute inset-[22%] grid place-items-center rounded-full border border-[color:var(--color-track)]/50 bg-[radial-gradient(circle_at_35%_30%,rgba(143,168,200,.25),rgba(11,15,25,.9))] shadow-[0_0_40px_rgba(143,168,200,.25)]">
        <svg viewBox="0 0 24 24" className="size-10 text-[color:var(--color-track)]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      </div>
    </div>
  );
}

/** Fine engraved line pattern, like the background of a certificate */
function Guilloche() {
  const paths = Array.from({ length: 18 }, (_, i) => {
    const a = 18 + i * 4;
    return `M0 ${60 + i * 2} C 200 ${60 - a}, 400 ${60 + a}, 600 ${60 + i * 2} S 1000 ${60 - a}, 1200 ${60 + i * 2}`;
  });
  return (
    <svg className="pointer-events-none absolute inset-x-0 top-0 h-40 w-full opacity-[.07]" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke="#8FA8C8" strokeWidth="1" />)}
    </svg>
  );
}
