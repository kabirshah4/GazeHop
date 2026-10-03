import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { BorderBeam } from "../components/magicui/border-beam";
import { NumberTicker } from "../components/magicui/number-ticker";
import DecryptedText from "../components/reactbits/DecryptedText";
import LightRays from "../components/reactbits/LightRays";
import ScrollReveal from "../components/reactbits/ScrollReveal";
import ShinyText from "../components/reactbits/ShinyText";
import SpotlightCard from "../components/reactbits/SpotlightCard";
import { DownloadButton, GitHubButton, LogoMark } from "../components/Chrome";
import { Eye3D, eyeBus } from "../components/Eye3D";
import { DOWNLOAD, ISSUES, SOURCE } from "../lib/links";
import { useHeadGaze, type GazeStatus } from "../lib/useHeadGaze";

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay, ease }}>
      {children}
    </motion.div>
  );
}

/** Section label with a slow silver sheen (React Bits ShinyText). */
export function Eyebrow({ children, className = "" }: { children: string; className?: string }) {
  return (
    <p className={`eyebrow mb-4 ${className}`}>
      <ShinyText text={children} color="#6B7486" shineColor="#D7E0EC" speed={3.2} delay={1.4} />
    </p>
  );
}

/** Heading whose words rise out of a blur, one after another. */
function WordsIn({ text, as: Tag = "h2", className = "", id }: { text: string; as?: "h2" | "h3"; className?: string; id?: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag id={id} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden="true">
          <motion.span className="inline-block"
            initial={reduce ? false : { y: "70%", opacity: 0, filter: "blur(10px)" }}
            whileInView={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay: i * 0.07, ease }}>
            {w}{i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Shared clock so the mini screens hop in time with the 3D eye's "hop" glance. */
function useHop(period = 1900) {
  const [side, setSide] = useState<0 | 1>(0);
  useEffect(() => {
    const id = setInterval(() => setSide(Math.floor(performance.now() / period) % 2 === 0 ? 0 : 1), 100);
    return () => clearInterval(id);
  }, [period]);
  return side;
}

/* ------------------------------------------------------------------ */
/* How it works: three scenes on a progress rail the eye travels down  */
/* ------------------------------------------------------------------ */

export function HowItWorks() {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 65%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <section id="how" className="scroll-mt-16" aria-labelledby="how-title">
      <div className="wrap relative z-10 pt-16 md:pt-24">
        <Eyebrow>How it works</Eyebrow>
        <WordsIn id="how-title" text="Set it up once. Then forget it's there." className="t-h2 max-w-[18ch]" />
      </div>

      <div ref={railRef} className="relative">
        {/* Progress rail */}
        <div className="pointer-events-none absolute inset-y-16 left-[max(14px,calc(50vw-604px))] hidden w-px bg-white/[.08] lg:block min-[1800px]:left-[calc(50vw-700px)]" aria-hidden="true">
          <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-[color:var(--color-cyan)] via-[color:var(--color-track)] to-transparent" style={{ scaleY: fill }} />
        </div>

        <Scene n={1} title="Calibrate once." body="Follow a dot to a few spots on each screen. GazeHop learns where your head and eyes point for every display you have, in about ten seconds a screen.">
          <CalibrationArt />
        </Scene>

        <Scene n={2} flip title="Look at a screen." body="Your webcam reads head direction and pupil position many times a second with Apple's Vision framework. Hold your look for a quarter of a second and GazeHop decides.">
          <div className="relative">
            <Eye3D look="hop" className="mx-auto mb-6 size-[clamp(110px,11vw,170px)]" />
            <HopScreens />
          </div>
        </Scene>

        <Scene n={3} title="Keep typing." body="The last window you used on that screen comes forward with keyboard focus, and the pointer follows so scrolling works too. No click needed.">
          <TypingWindow />
        </Scene>
      </div>
    </section>
  );
}

function Scene({ n, title, body, flip = false, children }: { n: number; title: string; body: string; flip?: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);
  return (
    <div ref={ref} className="wrap relative z-10 grid min-h-[64vh] items-center gap-10 py-12 md:grid-cols-2 md:gap-20 lg:pl-20">
      {/* Marker on the rail */}
      <span className={`absolute left-[10px] top-1/2 hidden size-[9px] -translate-y-1/2 rounded-full border transition-all duration-500 lg:block min-[1240px]:left-[11.5px] min-[1800px]:left-[15.5px] ${inView ? "border-[color:var(--color-cyan)] bg-[color:var(--color-cyan)] shadow-[0_0_0_5px_rgba(195,210,230,.12)]" : "border-white/25 bg-[color:var(--color-bg)]"}`} aria-hidden="true" />
      <div className={flip ? "md:order-2" : ""}>
        <p className="mb-5 font-mono text-[13px] text-[color:var(--color-cyan)]">
          <DecryptedText text={`Step ${n} of 3`} animateOn="view" sequential speed={45} revealDirection="start" encryptedClassName="text-white/30" />
        </p>
        <WordsIn as="h3" text={title} className="t-h2" />
        <ScrollReveal className="mt-5 max-w-[46ch] text-[clamp(17px,0.5vw+14px,20px)] text-[color:var(--color-fg-2)]" baseOpacity={0.15} blurStrength={3} wordAnimationEnd="center 55%">
          {body}
        </ScrollReveal>
      </div>
      <motion.div style={{ y: drift }} className={flip ? "md:order-1" : ""}>
        <Reveal delay={0.1}>{children}</Reveal>
      </motion.div>
    </div>
  );
}

function CalibrationArt() {
  const reduce = useReducedMotion();
  const pts = [[50, 50], [24, 30], [76, 30], [24, 72], [76, 72]];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((v) => (v + 1) % 10), 900);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <div className="grid grid-cols-2 gap-4" aria-hidden="true">
      {[0, 1].map((s) => {
        const done = i >= (s + 1) * 5 || reduce;
        return (
          <div key={s} className="relative aspect-[16/10] rounded-[14px] border border-[color:var(--color-line-2)] bg-[color:var(--color-panel)]">
            {pts.map(([x, y], k) => {
              const active = !reduce && i === s * 5 + k;
              return (
                <span key={k} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${active ? "size-4 bg-[color:var(--color-cyan)] shadow-[0_0_0_6px_rgba(195,210,230,.18),0_0_24px_rgba(195,210,230,.6)]" : "size-2 bg-white/20"}`}
                      style={{ left: `${x}%`, top: `${y}%` }} />
              );
            })}
            <span className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] transition-opacity ${done ? "bg-[color:var(--color-cyan)]/15 text-[color:var(--color-cyan)] opacity-100" : "opacity-0"}`}>
              ✓ Calibrated
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HopScreens() {
  const side = useHop();
  return (
    <div className="grid grid-cols-2 gap-4" aria-hidden="true">
      {[0, 1].map((s) => {
        const on = side === s;
        return (
          <div key={s} className={`relative aspect-[16/10] rounded-[14px] border bg-[color:var(--color-panel)] p-4 transition-all duration-300 ${on ? "border-[color:var(--color-track)] shadow-[0_0_0_3px_rgba(143,168,200,.18),0_20px_60px_-20px_rgba(143,168,200,.45)]" : "border-[color:var(--color-line-2)] opacity-60"}`}>
            <div className="mb-3 flex gap-1.5">{["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} className="size-2 rounded-full" style={{ background: on ? c : "rgba(255,255,255,.15)" }} />)}</div>
            <div className="space-y-2">
              <div className="h-2 w-3/4 rounded bg-white/15" /><div className="h-2 w-1/2 rounded bg-white/10" />
              <div className="flex items-center gap-1"><div className="h-2 w-1/3 rounded bg-white/10" />{on && <span className="h-3 w-[3px] animate-pulse rounded bg-[color:var(--color-track)]" />}</div>
            </div>
            <span className={`absolute right-3 top-3 font-mono text-[10px] uppercase tracking-wider transition-opacity ${on ? "text-[color:var(--color-track)] opacity-100" : "opacity-0"}`}>Focused</span>
          </div>
        );
      })}
    </div>
  );
}

function TypingWindow() {
  const reduce = useReducedMotion();
  const full = "sounds good, sending the build now";
  const [n, setN] = useState(reduce ? full.length : 0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduce) return;
    let started = false, id = 0;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        started = true;
        id = window.setInterval(() => setN((v) => (v >= full.length ? (clearInterval(id), v) : v + 1)), 55);
      }
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); clearInterval(id); };
  }, [reduce]);
  return (
    <div ref={ref} className="relative rounded-[16px] border border-[color:var(--color-track)] bg-[color:var(--color-panel)] shadow-[0_0_0_3px_rgba(143,168,200,.15),0_30px_80px_-30px_rgba(143,168,200,.5)]">
      <div className="flex items-center gap-2 border-b border-[color:var(--color-line)] px-4 py-3">
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} className="size-2.5 rounded-full" style={{ background: c }} />)}
        <span className="ml-2 text-[12px] text-[color:var(--color-fg-2)]">Messages</span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-track)]"><span className="pulse-dot !size-1.5" /> Focused by gaze</span>
      </div>
      <div className="space-y-3 p-5">
        <p className="w-fit rounded-2xl rounded-bl-md bg-white/[.06] px-4 py-2 text-[15px]">is the build ready?</p>
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[color:var(--color-track)]/20 px-4 py-2 text-[15px]">
          {full.slice(0, n)}<span className="caret" />
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The 250 ms moment                                                    */
/* ------------------------------------------------------------------ */

export function Quarter() {
  const stats: [string, string][] = [["0.6 s", "between switches, so a quick glance back doesn't bounce focus"], ["1 face", "tracked at a time; people walking behind you are ignored"], ["0", "network connections. Ever."]];
  return (
    <section className="relative overflow-hidden border-y border-[color:var(--color-line)] bg-[color:var(--color-bg-2)] py-24 md:py-32" aria-labelledby="quarter-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_100%,rgba(195,210,230,.12),transparent)]" aria-hidden="true" />
      <div className="wrap relative z-10 text-center">
        <Eyebrow className="mb-6">The only number you need</Eyebrow>
        <h2 id="quarter-title" className="sr-only">250 milliseconds</h2>
        <p className="font-semibold leading-none tracking-[-0.06em] text-[clamp(110px,24vw,340px)]" aria-hidden="true">
          <NumberTicker value={250} className="!text-white !tracking-[-0.06em]" />
          <span className="ml-2 align-top text-[0.28em] tracking-[-0.03em] text-[color:var(--color-track)]">ms</span>
        </p>
        <p className="mx-auto mt-6 max-w-[48ch] text-[clamp(17px,0.6vw+14px,21px)] text-[color:var(--color-fg-2)]">
          How long you look at a screen before your keyboard moves there. Long enough to ignore a glance, short enough to feel instant. You can change it in Settings.
        </p>
        <div className="mx-auto mt-16 grid max-w-[1000px] gap-px overflow-hidden rounded-[16px] border border-[color:var(--color-line)] bg-[color:var(--color-line)] md:grid-cols-3">
          {stats.map(([v, l]) => (
            <div key={v} className="bg-[color:var(--color-bg-2)] px-6 py-7 text-left">
              <p className="text-[28px] font-semibold tracking-[-0.03em]">{v}</p>
              <p className="mt-1 text-[15px] text-[color:var(--color-fg-2)]">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features bento                                                       */
/* ------------------------------------------------------------------ */

export function Features() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="features-title">
      <div className="wrap relative z-10">
        <Reveal className="mb-14">
          <Eyebrow>Built for real desks</Eyebrow>
          <h2 id="features-title" className="t-h2 max-w-[16ch]">Small app. Careful details.</h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="md:col-span-4" title="Two screens or six" body="Calibrates every display you connect. Unplug one and it's ignored until it's back. Plug in a new one and GazeHop asks to calibrate it.">
            <MultiScreenArt />
          </Card>
          <Card className="md:col-span-2" title="One person, not the room" body="Locks onto your face and ignores anyone walking behind you. Step away and it waits for you.">
            <FaceArt />
          </Card>
          <Card className="md:col-span-2" title="Pause from anywhere" body="Gaming on one screen, video on the other? Press the shortcut and glances stop moving focus.">
            <div className="flex h-full items-center justify-center gap-2 text-[26px]"><span className="kbd">⌘</span><span className="kbd">F1</span></div>
          </Card>
          <Card className="md:col-span-4" title="Leave some screens out" body="Turn off any display you only watch, like a TV or a stream on a side monitor. GazeHop never moves your keyboard there.">
            <ExcludeArt />
          </Card>
          <Card className="md:col-span-3" title="Tune how it feels" body="Try it: drag the sliders. The same controls live in GazeHop's Settings and apply the moment you change them.">
            <SlidersArt />
          </Card>
          <Card className="md:col-span-3" title="Quiet in the menu bar" body="One small eye next to your clock. A slash when paused, a dot when it needs you.">
            <MenuBarArt />
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ title, body, children, media, className = "" }: { title: string; body: string; children?: React.ReactNode; media?: React.ReactNode; className?: string }) {
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Reveal className={`min-w-0 ${className}`}>
      <article onPointerMove={onMove} className="spot flex h-full flex-col overflow-hidden rounded-[18px] border border-[color:var(--color-line)] bg-[color:var(--color-panel)]/70 transition-colors hover:border-[color:var(--color-line-2)]">
        {media}
        {children && <div className="min-h-44 flex-1 border-b border-[color:var(--color-line)] p-6">{children}</div>}
        <div className="p-6">
          <h3 className="t-h3 mb-2">{title}</h3>
          <p className="text-[15.5px] text-[color:var(--color-fg-2)]">{body}</p>
        </div>
      </article>
    </Reveal>
  );
}

function MultiScreenArt() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(1);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setOn((v) => (v + 1) % 3), 1600);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <div className="flex h-full items-end justify-center gap-3 pt-2 [perspective:600px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex min-w-0 max-w-40 flex-1 flex-col items-center" style={{ transform: `rotateY(${(1 - i) * 18}deg)` }}>
          <div className={`aspect-[16/10] w-full rounded-[8px] border transition-all duration-300 ${on === i ? "border-[color:var(--color-track)] bg-[color:var(--color-track)]/10 shadow-[0_0_30px_rgba(143,168,200,.35)]" : "border-white/15 bg-white/[.03]"}`} />
          <div className="h-3 w-1.5 bg-white/15" /><div className="h-1 w-10 rounded bg-white/15" />
        </div>
      ))}
    </div>
  );
}

function ExcludeArt() {
  const screens: [string, string, boolean][] = [["Studio Display", "Editor", true], ["DELL U2723", "Browser", true], ["Living room TV", "Stream", false]];
  return (
    <div className="grid h-full grid-cols-3 items-end gap-4" aria-hidden="true">
      {screens.map(([name, app, on]) => (
        <div key={name} className="flex flex-col items-center gap-3">
          <div className={`relative grid aspect-[16/10] w-full place-items-center rounded-[8px] border text-[11px] ${on ? "border-white/15 bg-white/[.04] text-[color:var(--color-fg-2)]" : "border-dashed border-white/15 text-[color:var(--color-fg-3)]"}`}>
            {app}
            {!on && <span className="absolute inset-0 rounded-[8px] bg-[repeating-linear-gradient(135deg,transparent_0_8px,rgba(255,255,255,.03)_8px_16px)]" />}
          </div>
          <div className="flex w-full items-center justify-between gap-2 text-[12px]">
            <span className="truncate text-[color:var(--color-fg-2)]">{name}</span>
            <span className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors ${on ? "bg-[color:var(--color-track)]" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 size-[14px] rounded-full bg-white shadow transition-[left] ${on ? "left-[16px]" : "left-0.5"}`} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FaceArt() {
  return (
    <svg viewBox="0 0 200 110" className="mx-auto h-full max-h-32" aria-hidden="true">
      <g opacity=".35" stroke="#A3ACBD" strokeWidth="2" strokeDasharray="4 4" fill="none">
        <circle cx="34" cy="48" r="15" /><circle cx="168" cy="52" r="12" />
      </g>
      <rect x="68" y="12" width="64" height="78" rx="14" fill="none" stroke="#8FA8C8" strokeWidth="2.5" />
      <circle cx="100" cy="48" r="21" fill="rgba(143,168,200,.12)" stroke="#F5F7FA" strokeWidth="2" />
      <text x="100" y="104" textAnchor="middle" fontFamily="SF Mono, ui-monospace, monospace" fontSize="9" fill="#8FA8C8" letterSpacing="1">TRACKING</text>
    </svg>
  );
}

/** Interactive version of GazeHop's Tracking settings, with a live preview of the look timer. */
function SlidersArt() {
  const reduce = useReducedMotion();
  const [look, setLook] = useState(250);       // ms, same range and default as the app
  const [strict, setStrict] = useState(20);    // %
  const [smooth, setSmooth] = useState(55);    // %
  const [phase, setPhase] = useState({ side: 0, start: performance.now() });
  const [now, setNow] = useState(performance.now());

  // Preview loop: dwell bar fills over `look` ms, focus hops, short pause, glance back.
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const loop = (t: number) => {
      setNow(t);
      setPhase((p) => (t - p.start > look + 900 ? { side: 1 - p.side, start: t } : p));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [look, reduce]);

  const elapsed = reduce ? look : now - phase.start;
  const dwell = Math.min(1, elapsed / look);
  const focused = dwell >= 1 ? 1 - phase.side : phase.side; // gaze is on the *other* screen until the timer completes
  const gazeOn = 1 - phase.side;

  const rows: { label: string; value: number; set: (v: number) => void; min: number; max: number; step: number; fmt: string }[] = [
    { label: "Look time", value: look, set: setLook, min: 100, max: 1000, step: 50, fmt: `${look} ms` },
    { label: "Strictness", value: strict, set: setStrict, min: 5, max: 60, step: 5, fmt: `${strict}%` },
    { label: "Smoothing", value: smooth, set: setSmooth, min: 0, max: 90, step: 5, fmt: `${smooth}%` },
  ];
  const summary = `Focus moves after ${look} ms, ${strict >= 35 ? "only on a clear look" : strict >= 15 ? "on a confident look" : "on any look"}, ${smooth >= 60 ? "very steady" : smooth >= 30 ? "balanced" : "quick to react"}.`;

  return (
    <div className="flex h-full flex-col justify-center gap-3.5">
      <div className="grid grid-cols-2 gap-2" aria-hidden="true">
        {[0, 1].map((i) => (
          <div key={i} className={`relative h-10 rounded-[7px] border transition-colors duration-200 ${focused === i ? "border-[color:var(--color-cyan)] bg-[color:var(--color-cyan)]/[.08]" : "border-white/10 bg-white/[.02]"}`}>
            {gazeOn === i && dwell < 1 && (
              <div className="absolute inset-x-2 bottom-1.5 h-[3px] overflow-hidden rounded-full bg-white/10">
                <div className="h-full origin-left rounded-full bg-[color:var(--color-cyan)]" style={{ transform: `scaleX(${dwell})` }} />
              </div>
            )}
            {focused === i && <span className="absolute right-2 top-1.5 font-mono text-[9px] uppercase tracking-wider text-[color:var(--color-cyan)]">Focused</span>}
          </div>
        ))}
      </div>
      {rows.map((r) => (
        <label key={r.label} className="block">
          <span className="mb-1.5 flex justify-between text-[13px]">
            <span>{r.label}</span>
            <span className="font-mono text-[12px] text-[color:var(--color-fg-2)]">{r.fmt}</span>
          </span>
          <input type="range" className="gh-range" min={r.min} max={r.max} step={r.step} value={r.value}
                 onChange={(e) => r.set(Number(e.target.value))}
                 style={{ "--p": `${((r.value - r.min) / (r.max - r.min)) * 100}%` } as React.CSSProperties} />
        </label>
      ))}
      <p className="text-[12.5px] text-[color:var(--color-fg-3)]" aria-live="polite">{summary}</p>
    </div>
  );
}

function MenuBarArt() {
  return (
    <div className="flex h-full flex-col justify-center gap-5" aria-hidden="true">
      <div className="flex items-center justify-end gap-4 rounded-[10px] border border-white/10 bg-black/40 px-4 py-2 text-[12px] text-white/80 backdrop-blur">
        <span>Wi-Fi</span><EyeGlyph /><span>Fri 9:41</span>
      </div>
      <div className="flex justify-around text-[12px] text-[color:var(--color-fg-3)]">
        <span className="flex flex-col items-center gap-1.5"><EyeGlyph />Watching</span>
        <span className="flex flex-col items-center gap-1.5"><EyeGlyph slash />Paused</span>
        <span className="flex flex-col items-center gap-1.5"><EyeGlyph dot />Needs you</span>
      </div>
    </div>
  );
}

function EyeGlyph({ slash = false, dot = false }: { slash?: boolean; dot?: boolean }) {
  return (
    <svg viewBox="0 0 20 16" className="h-4 w-5 text-white">
      <path d="M1.5 8 C5.5 14.6 14.5 14.6 18.5 8 C14.5 1.4 5.5 1.4 1.5 8 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="10" cy="8" r="3.4" fill="currentColor" />
      {slash && <line x1="3" y1="1" x2="17" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      {dot && <circle cx="17" cy="13" r="2.5" fill="currentColor" />}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Try it in the browser                                                */
/* ------------------------------------------------------------------ */

const STATUS: Record<GazeStatus, string> = {
  off: "Camera off",
  loading: "Loading the face model (about 4 MB)",
  calibrating: "Look straight ahead for a moment",
  tracking: "Active tracking. Turn your head toward a pane, then type",
  "no-face": "Can't see a face. Check your lighting and that you're in frame",
  denied: "Camera access is blocked. Allow it in your browser's site settings, then try again",
  error: "The demo couldn't start in this browser. Try a recent Chrome, Edge or Safari",
};

export function TryIt() {
  const [live, setLive] = useState(false);
  const gaze = useHeadGaze(live);
  const a = useRef<HTMLTextAreaElement>(null), b = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { eyeBus.lean = live ? gaze.lean : 0; }, [live, gaze.lean]);
  useEffect(() => {
    if (live && gaze.status === "tracking") (gaze.side === "first" ? a : b).current?.focus({ preventScroll: true });
  }, [live, gaze.side, gaze.status]);
  const focused = live && gaze.status === "tracking" ? gaze.side : null;

  return (
    <section className="hidden py-24 md:block md:py-32" aria-labelledby="try-title">
      <div className="wrap relative z-10">
        <Reveal className="mx-auto mb-12 max-w-[640px] text-center">
          <Eyebrow>Try it without installing</Eyebrow>
          <h2 id="try-title" className="t-h2">Turn your head. Watch the cursor move.</h2>
          <p className="mt-5 text-[color:var(--color-fg-2)]">A browser version of the same idea. It runs in this tab, and your video never leaves your browser.</p>
        </Reveal>
        <div className="mx-auto grid max-w-[1100px] grid-cols-[1fr_auto_1fr] items-center gap-6">
          {[a, b].map((r, i) => {
            const on = focused === (i === 0 ? "first" : "second");
            return (
              <div key={i} className={`overflow-hidden rounded-[16px] border bg-[color:var(--color-panel)] transition-all duration-300 ${i === 1 ? "order-3" : ""} ${on ? "border-[color:var(--color-track)] shadow-[0_0_0_3px_rgba(143,168,200,.18)]" : "border-[color:var(--color-line-2)]"}`}>
                <div className="flex items-center gap-2 border-b border-[color:var(--color-line)] px-4 py-2.5 text-[12px] text-[color:var(--color-fg-2)]">
                  {i === 0 ? "Left pane" : "Right pane"}
                  {on && <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-track)]">Focused</span>}
                </div>
                <textarea ref={r} disabled={!live} aria-label={i === 0 ? "Left pane" : "Right pane"}
                          placeholder={live ? (i === 0 ? "Look this way and type." : "Now look here and keep typing.") : "Turn on the camera to try it."}
                          className="h-40 w-full resize-none bg-transparent p-4 outline-none placeholder:text-white/25" />
              </div>
            );
          })}
          <Eye3D look={live ? "camera" : "hop"} className="order-2 size-28" />
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 text-[15px]">
          <p className="inline-flex items-center gap-2.5 text-[color:var(--color-fg-2)]">
            {gaze.status === "tracking" ? <span className="pulse-dot" /> : <span className="size-2 rounded-full bg-white/25" />}
            {STATUS[live ? gaze.status : "off"]}
          </p>
          <button onClick={() => setLive((v) => !v)} className="rounded-[12px] border border-[color:var(--color-line-2)] bg-white/[.04] px-5 py-2.5 font-semibold hover:border-white/30">
            {live ? "Turn camera off" : "Turn on camera"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Gatekeeper guide                                                     */
/* ------------------------------------------------------------------ */

type Step = { title: string; badge: React.ReactNode; body: React.ReactNode; mock: React.ReactNode };

const Badge = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
  <span className="grid size-7 shrink-0 place-items-center rounded-[7px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25)]" style={{ background: bg }}>{children}</span>
);
const I = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

const STEPS: Step[] = [
  { title: "Download", badge: <Badge bg="linear-gradient(#5B7AA6,#34507A)"><I d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" /></Badge>,
    body: <>Download <b>GazeHop-x.y.zip</b> from the latest GitHub release and double-click it to unzip.</>,
    mock: <MockFile /> },
  { title: "Move to Applications", badge: <Badge bg="linear-gradient(#6F8DB8,#3E5C8A)"><I d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></Badge>,
    body: <>Drag <b>GazeHop.app</b> into your <b>Applications</b> folder.</>,
    mock: <MockFile apps /> },
  { title: "Open it once", badge: <Badge bg="linear-gradient(#9ca3af,#4b5563)"><I d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></Badge>,
    body: <>macOS says it can't verify the developer, because GazeHop isn't notarized. Click <b>Done</b>. This is expected for independent apps.</>,
    mock: <MockDialog /> },
  { title: "Privacy & Security", badge: <Badge bg="linear-gradient(#5B7AA6,#2E4670)"><I d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /></Badge>,
    body: <>Open <b>System Settings › Privacy &amp; Security</b>, scroll down, and click <b>Open Anyway</b> next to GazeHop. Confirm with your password.</>,
    mock: <MockOpenAnyway /> },
  { title: "Camera & Accessibility", badge: <Badge bg="linear-gradient(#7F97B5,#4A5F7A)"><I d="M15 10l4.5-2.5v9L15 14M4 7h11v10H4z" /></Badge>,
    body: <>Allow <b>Camera</b> when asked. Then turn on GazeHop in <b>Privacy &amp; Security › Accessibility</b> so it can bring windows forward.</>,
    mock: <MockToggles /> },
  { title: "Calibrate", badge: <span className="grid size-7 place-items-center"><LogoMark className="size-7" /></span>,
    body: <>Follow the dot on each screen for a few seconds. When the eye appears in your menu bar, it's watching.</>,
    mock: <div className="grid h-full place-items-center"><CalibrationArt /></div> },
];

export function GatekeeperGuide() {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const cmd = "xattr -dr com.apple.quarantine /Applications/GazeHop.app";
  return (
    <section id="install" className="scroll-mt-16 py-24 md:py-32" aria-labelledby="install-title">
      <div className="wrap relative z-10">
        <Reveal className="mb-12 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <Eyebrow>Install guide</Eyebrow>
            <WordsIn id="install-title" text="Installing free and open-source software on macOS" className="t-h2" />
          </div>
          <p className="text-[color:var(--color-fg-2)]">
            Independent apps on GitHub often aren't notarized, since Apple's developer program costs $99 a year.
            macOS asks you to confirm them once. It's the standard process, it takes a minute, and you can read
            GazeHop's <a className="text-[color:var(--color-cyan)] hover:underline" href={SOURCE}>full source</a> first.
          </p>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden rounded-[18px] border border-[color:var(--color-line-2)] bg-[color:var(--color-panel)] shadow-[0_30px_80px_-40px_rgba(0,0,0,.9)]">
            <div className="flex items-center gap-2 border-b border-[color:var(--color-line)] px-4 py-3">
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} className="size-3 rounded-full" style={{ background: c }} />)}
              <span className="mx-auto text-[13px] font-medium text-[color:var(--color-fg-2)]">Install GazeHop</span>
            </div>
            <div className="h-[2px] bg-white/[.05]" aria-hidden="true">
              <motion.div className="h-full origin-left bg-gradient-to-r from-[color:var(--color-track)] to-[color:var(--color-cyan)]"
                          initial={false} animate={{ scaleX: (i + 1) / STEPS.length }} transition={{ duration: 0.6, ease }} />
            </div>
            <div className="grid md:grid-cols-[280px_1fr]">
              <ol className="border-b border-[color:var(--color-line)] p-3 md:border-b-0 md:border-r" role="tablist" aria-label="Install steps">
                {STEPS.map((s, k) => (
                  <li key={s.title}>
                    <button role="tab" aria-selected={i === k} onClick={() => setI(k)}
                            className={`relative flex w-full items-center gap-3 rounded-[9px] px-2.5 py-2 text-left text-[14.5px] transition-colors ${i === k ? "text-white" : "text-[color:var(--color-fg-2)] hover:bg-white/[.03]"}`}>
                      {i === k && <motion.span layoutId="install-active" className="absolute inset-0 -z-10 rounded-[9px] bg-white/[.07] ring-1 ring-white/[.08]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                      {s.badge}
                      <span className="flex-1">{s.title}</span>
                      <span className="font-mono text-[11px] text-[color:var(--color-fg-3)]">{k + 1}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <AnimatePresence mode="wait" initial={false}>
              <motion.div key={i} className="grid gap-8 p-6 md:grid-cols-[1fr_1.1fr] md:p-10" role="tabpanel"
                          initial={{ opacity: 0, x: 18, filter: "blur(6px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, x: -12, filter: "blur(6px)" }} transition={{ duration: 0.35, ease }}>
                <div>
                  <p className="font-mono text-[13px] text-[color:var(--color-cyan)]">
                    <DecryptedText text={`Step ${i + 1} of ${STEPS.length}`} animateOn="view" sequential speed={35} encryptedClassName="text-white/30" />
                  </p>
                  <h3 className="t-h3 mt-2 !text-[26px]">{STEPS[i].title}</h3>
                  <p className="mt-3 text-[color:var(--color-fg-2)] [&_b]:text-white">{STEPS[i].body}</p>
                  <div className="mt-6 flex gap-2">
                    <button disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-[10px] border border-[color:var(--color-line-2)] px-4 py-2 text-[14px] font-semibold disabled:opacity-30">Back</button>
                    {i < STEPS.length - 1
                      ? <button onClick={() => setI(i + 1)} className="rounded-[10px] bg-white px-4 py-2 text-[14px] font-semibold text-[color:var(--color-bg)]">Next step</button>
                      : <a href={DOWNLOAD} className="rounded-[10px] bg-white px-4 py-2 text-[14px] font-semibold text-[color:var(--color-bg)]">Download GazeHop</a>}
                  </div>
                </div>
                <div className="min-h-56 rounded-[14px] border border-[color:var(--color-line)] bg-black/30 p-5">{STEPS[i].mock}</div>
              </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-6">
          <div className="flex flex-col gap-3 rounded-[14px] border border-[color:var(--color-line)] bg-black/30 p-4 md:flex-row md:items-center">
            <p className="text-[14px] text-[color:var(--color-fg-2)] md:w-64">Prefer Terminal? This does steps 3 and 4 in one go:</p>
            <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-[9px] bg-white/[.04] px-3 py-2 font-mono text-[13px] text-[color:var(--color-track)]">{cmd}</code>
            <button onClick={() => { navigator.clipboard?.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
                    className="rounded-[9px] border border-[color:var(--color-line-2)] px-3 py-2 text-[13px] font-semibold hover:border-white/30">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MockFile({ apps = false }: { apps?: boolean }) {
  return (
    <div className="flex h-full items-center justify-center gap-6" aria-hidden="true">
      <div className="flex flex-col items-center gap-2 text-[12px] text-[color:var(--color-fg-2)]">
        <LogoMark className="size-16" />GazeHop.app
      </div>
      {apps && <>
        <span className="text-2xl text-[color:var(--color-fg-3)]">→</span>
        <div className="flex flex-col items-center gap-2 text-[12px] text-[color:var(--color-fg-2)]">
          <div className="grid size-16 place-items-center rounded-[14px] bg-gradient-to-b from-[#6F8DB8] to-[#34507A]"><I d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></div>Applications
        </div>
      </>}
    </div>
  );
}

function MockDialog() {
  return (
    <div className="mx-auto max-w-[280px] rounded-[14px] border border-white/10 bg-[#1f2330] p-5 text-center text-[13px]" aria-hidden="true">
      <LogoMark className="mx-auto mb-3 size-12" />
      <p className="font-semibold">"GazeHop" Not Opened</p>
      <p className="mt-1 text-[12px] text-[color:var(--color-fg-2)]">Apple could not verify "GazeHop" is free of malware.</p>
      <div className="mt-4 grid gap-2">
        <span className="rounded-[7px] bg-white/10 py-1.5">Move to Trash</span>
        <span className="rounded-[7px] bg-[color:var(--color-cyan)] py-1.5 font-semibold text-black ring-2 ring-[color:var(--color-cyan)]/40">Done</span>
      </div>
    </div>
  );
}

function MockOpenAnyway() {
  return (
    <div className="space-y-3 text-[13px]" aria-hidden="true">
      <p className="text-[12px] text-[color:var(--color-fg-3)]">Privacy &amp; Security › Security</p>
      <div className="rounded-[10px] border border-white/10 bg-[#1f2330] p-4">
        <p className="text-[color:var(--color-fg-2)]">"GazeHop" was blocked to protect your Mac.</p>
        <div className="mt-3 flex justify-end">
          <span className="rounded-[7px] bg-[color:var(--color-cyan)] px-3 py-1.5 font-semibold text-black ring-2 ring-[color:var(--color-cyan)]/40">Open Anyway</span>
        </div>
      </div>
    </div>
  );
}

function MockToggles() {
  return (
    <div className="space-y-2 text-[13px]" aria-hidden="true">
      {[["Camera", "linear-gradient(#7F97B5,#4A5F7A)"], ["Accessibility", "linear-gradient(#5B7AA6,#34507A)"]].map(([l, bg]) => (
        <div key={l} className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#1f2330] p-3">
          <span className="size-6 rounded-[6px]" style={{ background: bg }} />
          <span className="flex-1">{l}</span>
          <span className="flex items-center gap-2 text-[12px] text-[color:var(--color-fg-2)]"><LogoMark className="size-5" />GazeHop</span>
          <span className="relative h-5 w-9 rounded-full bg-[color:var(--color-track)]"><span className="absolute right-0.5 top-0.5 size-4 rounded-full bg-white" /></span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ + final CTA                                                      */
/* ------------------------------------------------------------------ */

const FAQ: [string, React.ReactNode][] = [
  ["Does GazeHop record or upload video?", "No. Each camera frame is read in memory to find your head direction and eye position, then discarded. The app contains no networking code."],
  ["Why isn't it notarized?", <>Notarization needs Apple's $99/year developer program. GazeHop is a free, open-source project, so for now you confirm it once in System Settings (see the <a className="text-[color:var(--color-cyan)] underline underline-offset-4" href="#install">install guide</a>). You can also build it from source.</>],
  ["Which Macs does it work on?", "macOS 14 or later, any Mac with a camera (built in or external) and two or more displays. Tested most on Apple silicon."],
  ["Why does it need Accessibility access?", "macOS only lets apps bring another app's window to the front with Accessibility permission. GazeHop uses it to raise the window on the screen you look at, and for nothing else. It doesn't read what you type."],
  ["Does it work with glasses?", "Usually. Strong reflections make eye tracking noisier, but head direction still works, and the two are combined."],
  ["How accurate is it?", "Best when your screens sit at clearly different angles from you. Recalibrate if you move your chair, camera or screens. If switching feels too eager or slow, adjust look time and strictness in Settings."],
  ["What does it cost?", <>Nothing. It's MIT licensed. Found a bug? <a className="text-[color:var(--color-cyan)] underline underline-offset-4" href={ISSUES}>Open an issue</a>.</>],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const t = (d: number) => (reduce ? { duration: 0 } : { duration: d, ease });
  return (
    <section id="faq" className="scroll-mt-16 py-24 md:py-32" aria-labelledby="faq-title">
      <div className="wrap relative z-10 grid gap-12 md:grid-cols-[1fr_1.6fr]">
        <div className="md:sticky md:top-28 md:self-start">
          <Eyebrow>Questions</Eyebrow>
          <WordsIn id="faq-title" text="Before you install." className="t-h2" />
          <ScrollReveal className="mt-5 max-w-[34ch] text-[color:var(--color-fg-2)]" baseOpacity={0.2} blurStrength={2} wordAnimationEnd="center 60%">
            Straight answers about the camera, permissions and the macOS warning.
          </ScrollReveal>
          <a href={ISSUES} className="mt-7 inline-flex items-center gap-2 text-[14px] font-semibold text-[color:var(--color-cyan)] hover:underline">Ask something else on GitHub <span aria-hidden="true">→</span></a>
        </div>

        <motion.ul className="space-y-3" initial={reduce ? false : "hidden"} whileInView="show" viewport={{ once: true, margin: "-60px" }}
                   variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
          {FAQ.map(([q, a], k) => {
            const isOpen = open === k;
            return (
              <motion.li key={q} variants={{ hidden: { opacity: 0, y: 18, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } } }}>
                <SpotlightCard className="rounded-[16px]! border-white/[.08]! bg-white/[.02]! p-0! transition-colors hover:border-white/[.14]!" spotlightColor="rgba(195, 210, 230, 0.07)">
                  <motion.span aria-hidden="true" className="absolute inset-y-4 left-0 w-[2px] origin-top rounded-full bg-[color:var(--color-cyan)]"
                               initial={false} animate={{ scaleY: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }} transition={t(0.5)} />
                  <h3>
                    <button className="relative flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-[17.5px] font-semibold"
                            aria-expanded={isOpen} aria-controls={`faq-${k}`} onClick={() => setOpen(isOpen ? null : k)}>
                      {q}
                      <span className={`grid size-8 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${isOpen ? "border-[color:var(--color-cyan)]/50 text-white" : "border-white/[.12] text-[color:var(--color-fg-2)]"}`} aria-hidden="true">
                        <motion.span className="block text-[18px] leading-none" initial={false} animate={{ rotate: isOpen ? 45 : 0 }} transition={t(0.35)}>+</motion.span>
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div id={`faq-${k}`} key="answer" className="overflow-hidden"
                                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={t(0.45)}>
                        <motion.div className="px-6 pb-6 pr-14 text-[color:var(--color-fg-2)]"
                                    initial={reduce ? false : { y: -6, filter: "blur(4px)" }} animate={{ y: 0, filter: "blur(0px)" }} transition={t(0.5)}>
                          {a}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SpotlightCard>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="pb-24 md:pb-32">
      <div className="wrap relative z-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[26px] border border-[color:var(--color-line-2)] bg-[color:var(--color-bg-2)] px-6 py-16 text-center md:py-24">
            <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
              <LightRays raysOrigin="top-center" raysColor="#C9D6E8" raysSpeed={0.5} lightSpread={0.8} rayLength={1.3}
                         fadeDistance={0.9} saturation={0.35} followMouse mouseInfluence={0.06} />
            </div>
            <Eye3D look="pointer" className="mx-auto mb-8 size-24 md:size-28" />
            <WordsIn text="Stop typing into the wrong window." className="t-h2 relative mx-auto max-w-[18ch]" />
            <p className="relative mx-auto mt-5 max-w-xl text-[color:var(--color-fg-2)]">Free for macOS. About a minute to set up.</p>
            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <DownloadButton />
              <GitHubButton label="Star on GitHub" />
            </div>
            <BorderBeam size={180} duration={12} colorFrom="#8FA8C8" colorTo="#E6EDF7" borderWidth={1} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
