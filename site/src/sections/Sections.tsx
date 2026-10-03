import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DownloadButton, LogoMark } from "../components/Chrome";
import { DOWNLOAD, ISSUES, SOURCE } from "../lib/links";
import { useHeadGaze, type GazeStatus } from "../lib/useHeadGaze";
import { Sky } from "./Hero";

const spring = { type: "spring", bounce: 0, duration: 0.8 } as const;

/** Content is visible by default; motion only refines its arrival. */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ ...spring, delay }}>
      {children}
    </motion.div>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="serif-em rounded-[0.35em] bg-[color:var(--color-blue-tint)] px-[0.18em] text-[color:var(--color-blue-deep)]">{children}</span>;
}

/* ------------------------------------------------------------------ */
/* How it helps                                                         */
/* ------------------------------------------------------------------ */

export function HowItHelps() {
  return (
    <section id="how" className="scroll-mt-14 pb-24 pt-10 md:pb-32 md:pt-16" aria-labelledby="how-title">
      <div className="wrap">
        <Reveal className="mb-10 md:mb-14">
          <h2 id="how-title" className="t-h2 max-w-[16ch]">How GazeHop helps at your desk</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <article className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#3A73F0_0%,#5D8FF5_55%,#86A9F7_100%)] p-8 text-white shadow-[0_24px_50px_-30px_rgba(30,70,200,.7)] md:p-10">
              <h3 className="t-h3 max-w-[18ch]">GazeHop <span className="serif-em rounded-[0.35em] bg-white/20 px-[0.18em]">sees</span> which screen you're looking at</h3>
              <p className="mt-3 max-w-[40ch] text-[17px] text-white/90">Your webcam reads head direction and eye position many times a second, with Apple's Vision framework, on your Mac.</p>
              <SeeArt />
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="card flex h-full flex-col overflow-hidden p-8 md:p-10">
              <h3 className="t-h3 max-w-[18ch]">Your keyboard <Mark>follows</Mark> in a quarter of a second</h3>
              <p className="mt-3 max-w-[40ch] text-[17px] text-[color:var(--color-ink-2)]">The last window you used on that screen comes forward with focus, and the pointer moves with it so scrolling works too.</p>
              <FollowArt />
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function useHop(period = 2000) {
  const reduce = useReducedMotion();
  const [side, setSide] = useState<0 | 1>(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setSide((s) => (s === 0 ? 1 : 0)), period);
    return () => clearInterval(id);
  }, [period, reduce]);
  return side;
}

function SeeArt() {
  const side = useHop(2200);
  return (
    <div className="mt-auto pt-10" aria-hidden="true">
      <div className="relative mx-auto grid max-w-[420px] grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className={`aspect-[16/10] rounded-[12px] border transition-[background-color,border-color,box-shadow] duration-500 ${side === i ? "border-white bg-white/30 shadow-[0_0_0_4px_rgba(255,255,255,.18)]" : "border-white/35 bg-white/10"}`}>
            <div className="h-[16%] rounded-t-[11px] bg-white/25" />
          </div>
        ))}
        {/* Track spans the grid so x: 50% is exactly one display over (transform only, no layout) */}
        <motion.span className="pointer-events-none absolute inset-x-0 top-[42%]"
          animate={{ x: side === 0 ? "0%" : "50%" }} transition={{ type: "spring", bounce: 0, duration: 0.5 }}>
          <span className="absolute left-[23%] size-3.5 rounded-full bg-white shadow-[0_0_0_6px_rgba(255,255,255,.25)]" />
        </motion.span>
      </div>
      <div className="mx-auto mt-5 flex w-fit items-center gap-2.5 rounded-full bg-black/25 px-4 py-2 text-[14px] font-medium backdrop-blur">
        <span className="size-2 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]" />
        Tracking one face · {side === 0 ? "Studio Display" : "Built-in Display"}
      </div>
    </div>
  );
}

function FollowArt() {
  const reduce = useReducedMotion();
  const full = "sounds good, sending it now";
  const [n, setN] = useState(reduce ? full.length : 0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduce) return;
    let id = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      id = window.setInterval(() => setN((v) => (v >= full.length ? (clearInterval(id), v) : v + 1)), 60);
    }, { threshold: 0.6 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); clearInterval(id); };
  }, [reduce]);
  return (
    <div ref={ref} className="mt-auto pt-10" aria-hidden="true">
      <div className="mx-auto max-w-[420px] overflow-hidden rounded-[16px] bg-white shadow-[0_0_0_.5px_rgba(0,0,0,.18),0_20px_40px_-18px_rgba(0,0,0,.3)]">
        <div className="flex items-center gap-1.5 border-b border-black/[.06] px-3.5 py-2.5">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} className="size-2.5 rounded-full" style={{ background: c }} />)}
          <span className="mx-auto pr-10 text-[12px] font-semibold text-black/70">Alex</span>
        </div>
        <div className="space-y-2 p-4">
          <p className="w-fit rounded-[16px] bg-[#E9E9EB] px-3.5 py-1.5 text-[15px]">is the build ready?</p>
          <div className="rounded-full border border-black/10 px-4 py-2 text-[15px]">{full.slice(0, n)}<span className="caret" /></div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Details: an uneven grid of the product's real controls                */
/* ------------------------------------------------------------------ */

export function Details() {
  return (
    <section className="pb-24 md:pb-32" aria-labelledby="details-title">
      <div className="wrap">
        <Reveal className="mb-10 md:mb-14">
          <h2 id="details-title" className="t-h2 max-w-[18ch]">Made for real desks, not demos</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          <Tile className="md:col-span-2" title="Two screens or six." body="Calibrate each display once. Unplug one and GazeHop ignores it until it's back. Turn off any screen you only watch, like a TV.">
            <ScreensArt />
          </Tile>
          <Tile title="Pause in a keystroke." body="Gaming on one screen, a video on the other? Pause from any app, resume the same way.">
            <div className="flex h-full items-center justify-center gap-3 py-6 text-[34px]"><span className="kbd">⌘</span><span className="kbd">F1</span></div>
          </Tile>
          <Tile title="One face, not the whole room." body="GazeHop locks onto you and ignores anyone walking past behind you.">
            <FaceArt />
          </Tile>
          <Tile className="md:col-span-2" title="Tune how it feels." body="These are the same controls as GazeHop's Settings. Try them: the preview follows your changes.">
            <SlidersArt />
          </Tile>
          <Tile className="md:col-span-3" title="Never mid-password, never mid-word." body="GazeHop won't move focus while a password field is active, and by default waits for a pause in your typing. It never takes focus from its own windows, either.">
            <SafetyArt />
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ title, body, children, className = "" }: { title: string; body: string; children: React.ReactNode; className?: string }) {
  return (
    <Reveal className={className}>
      <article className="card flex h-full flex-col overflow-hidden transition-transform duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5">
        <div className="flex-1 bg-[linear-gradient(180deg,#F7F8FB,#FFFFFF)] px-6 pt-6">{children}</div>
        <div className="p-6 pt-5">
          <h3 className="text-[19px] font-semibold tracking-[-0.02em]">{title}</h3>
          <p className="mt-1.5 text-[15px] leading-[1.47] text-[color:var(--color-ink-2)]">{body}</p>
        </div>
      </article>
    </Reveal>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange?: () => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange}
            className={`relative h-[24px] w-[40px] shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-[#34C759]" : "bg-black/15"}`}>
      <motion.span className="absolute left-[2px] top-[2px] size-[20px] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,.25)]"
                   animate={{ x: on ? 16 : 0 }} transition={{ type: "spring", bounce: 0.15, duration: 0.35 }} />
    </button>
  );
}

function ScreensArt() {
  const [on, setOn] = useState([true, true, false]);
  const names = ["Studio Display", "Built-in Display", "Living Room TV"];
  return (
    <div className="grid gap-5 pb-2 sm:grid-cols-[1.1fr_1fr]">
      <div className="flex items-end justify-center gap-2.5 pt-2" aria-hidden="true">
        {names.map((n, i) => (
          <div key={n} className="flex flex-col items-center">
            <div className={`rounded-[7px] border transition-colors duration-300 ${i === 2 ? "h-[62px] w-[100px]" : "h-[54px] w-[84px]"} ${on[i] ? "border-black/15 bg-[linear-gradient(160deg,#9DB8F7,#F4C9C9)]" : "border-dashed border-black/20 bg-black/[.03]"}`} />
            <div className="h-2.5 w-1 bg-black/15" /><div className="h-1 w-8 rounded bg-black/15" />
          </div>
        ))}
      </div>
      <ul className="divide-y divide-black/[.06] rounded-[14px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06)]">
        {names.map((n, i) => (
          <li key={n} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[14px]">
            {n}
            <Toggle label={`Switch focus to ${n}`} on={on[i]} onChange={() => setOn((s) => s.map((v, k) => (k === i ? !v : v)))} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaceArt() {
  return (
    <svg viewBox="0 0 200 120" className="mx-auto h-[150px] w-auto py-3" aria-hidden="true">
      <g fill="none" stroke="#C7C9D1" strokeWidth="2" strokeDasharray="4 5">
        <circle cx="38" cy="58" r="17" /><circle cx="166" cy="62" r="14" />
      </g>
      <rect x="66" y="16" width="68" height="84" rx="18" fill="none" stroke="#0071E3" strokeWidth="2.5" />
      <circle cx="100" cy="52" r="22" fill="#E8F1FD" stroke="#1D1D1F" strokeWidth="2" />
      <path d="M86 92c4-9 24-9 28 0" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" />
      <text x="100" y="116" textAnchor="middle" fontFamily="-apple-system, system-ui" fontSize="10" fontWeight="600" fill="#0071E3">Tracking you</text>
    </svg>
  );
}

function SlidersArt() {
  const reduce = useReducedMotion();
  const [look, setLook] = useState(250);
  const [strict, setStrict] = useState(20);
  const [smooth, setSmooth] = useState(55);
  const [phase, setPhase] = useState({ side: 0, start: performance.now() });
  const [now, setNow] = useState(performance.now());
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
  const dwell = Math.min(1, (reduce ? look : now - phase.start) / look);
  const focused = dwell >= 1 ? 1 - phase.side : phase.side;
  const gazeOn = 1 - phase.side;
  const rows = [
    { label: "Look time", value: look, set: setLook, min: 100, max: 1000, step: 50, fmt: `${look} ms` },
    { label: "Strictness", value: strict, set: setStrict, min: 5, max: 60, step: 5, fmt: `${strict}%` },
    { label: "Smoothing", value: smooth, set: setSmooth, min: 0, max: 90, step: 5, fmt: `${smooth}%` },
  ];
  return (
    <div className="grid gap-6 pb-4 sm:grid-cols-[1fr_1.2fr]">
      <div className="flex flex-col justify-center gap-2" aria-hidden="true">
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <div key={i} className={`relative aspect-[16/10] rounded-[9px] border transition-colors duration-200 ${focused === i ? "border-[color:var(--color-blue)] bg-[color:var(--color-blue-tint)]" : "border-black/10 bg-white"}`}>
              {gazeOn === i && dwell < 1 && (
                <div className="absolute inset-x-2.5 bottom-2 h-[3px] overflow-hidden rounded-full bg-black/10">
                  <div className="h-full origin-left rounded-full bg-[color:var(--color-blue)]" style={{ transform: `scaleX(${dwell})` }} />
                </div>
              )}
              {focused === i && <span className="absolute right-2 top-1.5 text-[10px] font-semibold text-[color:var(--color-blue)]">Focused</span>}
            </div>
          ))}
        </div>
        <p className="text-[13px] text-[color:var(--color-ink-3)]" aria-live="polite">
          Moves after {look} ms, {strict >= 35 ? "only on a clear look" : strict >= 15 ? "on a confident look" : "on any look"}, {smooth >= 60 ? "very steady" : smooth >= 30 ? "balanced" : "quick to react"}.
        </p>
      </div>
      <div className="space-y-4">
        {rows.map((r) => (
          <label key={r.label} className="block">
            <span className="mb-2 flex justify-between text-[14px]"><span>{r.label}</span><span className="tabular-nums text-[color:var(--color-ink-3)]">{r.fmt}</span></span>
            <input type="range" className="gh-range" min={r.min} max={r.max} step={r.step} value={r.value}
                   onChange={(e) => r.set(Number(e.target.value))}
                   style={{ "--p": `${((r.value - r.min) / (r.max - r.min)) * 100}%` } as React.CSSProperties} />
          </label>
        ))}
      </div>
    </div>
  );
}

function SafetyArt() {
  return (
    <div className="grid gap-4 pb-4 sm:grid-cols-2" aria-hidden="true">
      <div className="flex items-center gap-3 rounded-[14px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.06)]">
        <span className="grid size-9 place-items-center rounded-[10px] bg-[linear-gradient(#6E7BF7,#4F5BD5)] text-white">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-[color:var(--color-ink-3)]">Password</p>
          <p className="tracking-[0.2em]">••••••••<span className="caret" /></p>
        </div>
        <span className="rounded-full bg-black/[.05] px-2.5 py-1 text-[12px] font-medium text-[color:var(--color-ink-2)]">Focus held</span>
      </div>
      <div className="flex items-center gap-3 rounded-[14px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.06)]">
        <span className="grid size-9 place-items-center rounded-[10px] bg-[linear-gradient(#5AC8FA,#2D9CDB)] text-white">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" /></svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-[color:var(--color-ink-3)]">Typing</p>
          <p>Let's meet at three<span className="caret" /></p>
        </div>
        <span className="rounded-full bg-black/[.05] px-2.5 py-1 text-[12px] font-medium text-[color:var(--color-ink-2)]">Waits for a pause</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Privacy                                                              */
/* ------------------------------------------------------------------ */

export function Privacy() {
  const points: [string, string, React.ReactNode][] = [
    ["Processed on your Mac", "Each camera frame is read in memory to find head direction and eye position, then discarded. Nothing is recorded or saved.",
      <path key="a" d="M4 6h16v10H4zM9 20h6M12 16v4" />],
    ["No network code", "GazeHop contains no code that talks to the internet. No accounts, no analytics, no telemetry.",
      <g key="b"><circle cx="12" cy="12" r="8" /><path d="M5 5l14 14" /></g>],
    ["Open source", "Every line is on GitHub under the MIT license, so you can check all of this yourself.",
      <path key="c" d="M9 7l-5 5 5 5M15 7l5 5-5 5" />],
  ];
  return (
    <section id="privacy" className="scroll-mt-14 bg-white py-24 md:py-32" aria-labelledby="privacy-title">
      <div className="wrap">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <span className="mx-auto mb-7 grid size-[72px] place-items-center rounded-[22px] bg-[linear-gradient(160deg,#3A73F0,#2050C8)] text-white shadow-[0_14px_30px_-12px_rgba(30,70,200,.6)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></svg>
          </span>
          <h2 id="privacy-title" className="t-h2">Your camera feed never leaves your Mac.</h2>
          <p className="t-lead mx-auto mt-5 max-w-[48ch]">GazeHop only measures where you're looking. It doesn't identify you, and it doesn't keep or send anything.</p>
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-[980px] gap-10 md:grid-cols-3">
          {points.map(([t, d, icon], i) => (
            <Reveal key={t} delay={0.06 * i}>
              <svg viewBox="0 0 24 24" className="mb-4 size-7 text-[color:var(--color-blue)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
              <h3 className="text-[19px] font-semibold tracking-[-0.02em]">{t}</h3>
              <p className="mt-2 text-[15px] text-[color:var(--color-ink-2)]">{d}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <a className="btn btn-ghost" href={SOURCE}>Read the source code <span aria-hidden="true">›</span></a>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tech specs                                                           */
/* ------------------------------------------------------------------ */

export function Specs() {
  const rows: [string, React.ReactNode][] = [
    ["Look time", "250 ms by default, adjustable from 100 ms to 1 s"],
    ["Between switches", "0.6 s by default, so a glance back doesn't bounce focus"],
    ["Displays", "Two or more, any arrangement. Sidecar iPads count."],
    ["Faces tracked", "One at a time"],
    ["Network connections", "None"],
    ["Requirements", "macOS 14 or later, any built-in or external camera"],
    ["Permissions", "Camera, and Accessibility to bring windows forward"],
    ["Price and license", "Free, MIT license"],
  ];
  return (
    <section className="py-24 md:py-32" aria-labelledby="specs-title">
      <div className="wrap grid gap-10 md:grid-cols-[1fr_2fr]">
        <Reveal><h2 id="specs-title" className="t-h2">Tech specs</h2></Reveal>
        <Reveal delay={0.05}>
          <dl className="border-t border-[color:var(--color-line-2)]">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-[color:var(--color-line)] py-4 sm:grid-cols-[200px_1fr]">
                <dt className="font-semibold">{k}</dt>
                <dd className="text-[color:var(--color-ink-2)]">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Try it in the browser                                                */
/* ------------------------------------------------------------------ */

const STATUS: Record<GazeStatus, string> = {
  off: "Camera is off",
  loading: "Loading the face model (about 4 MB)",
  calibrating: "Look straight ahead for a moment",
  tracking: "Tracking. Turn your head toward a pane, then type",
  "no-face": "Can't see a face. Check your lighting and that you're in frame",
  denied: "Camera access is blocked. Allow it in your browser's site settings, then try again",
  error: "The demo couldn't start in this browser. Try a recent Safari, Chrome or Edge",
};

export function TryIt() {
  const [live, setLive] = useState(false);
  const gaze = useHeadGaze(live);
  const a = useRef<HTMLTextAreaElement>(null), b = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (live && gaze.status === "tracking") (gaze.side === "first" ? a : b).current?.focus({ preventScroll: true });
  }, [live, gaze.side, gaze.status]);
  const focused = live && gaze.status === "tracking" ? gaze.side : null;

  return (
    <section className="pb-24 md:pb-32" aria-label="Try it in your browser">
      <div className="wrap">
        <Reveal className="card p-7 text-center md:hidden">
          <h2 className="t-h3">Try the idea in your browser</h2>
          <p className="mx-auto mt-3 max-w-[34ch] text-[color:var(--color-ink-2)]">Open this page on your Mac to try it: turn your head toward a pane and the typing follows. It runs in the tab; your video never leaves the browser.</p>
        </Reveal>
        <Reveal className="card mx-auto hidden max-w-[1000px] p-10 md:block">
          <div className="mx-auto mb-8 max-w-[560px] text-center">
            <h2 id="try-title" className="t-h3 !text-[32px]">Try the idea in your browser</h2>
            <p className="mt-3 text-[color:var(--color-ink-2)]">Turn your head toward a pane and start typing. It runs in this tab; your video never leaves your browser.</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[a, b].map((r, i) => {
              const on = focused === (i === 0 ? "first" : "second");
              return (
                <div key={i} className={`overflow-hidden rounded-[16px] bg-white transition-shadow duration-300 ${on ? "shadow-[0_0_0_2px_var(--color-blue),0_12px_30px_-16px_rgba(0,113,227,.6)]" : "shadow-[0_0_0_1px_rgba(0,0,0,.1)]"}`}>
                  <div className="flex items-center gap-1.5 border-b border-black/[.06] px-3.5 py-2.5 text-[12px] font-semibold text-black/60">
                    {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} className="size-2.5 rounded-full" style={{ background: on ? c : "#D9D9DC" }} />)}
                    <span className="ml-2">{i === 0 ? "Left pane" : "Right pane"}</span>
                  </div>
                  <textarea ref={r} disabled={!live} aria-label={i === 0 ? "Left pane" : "Right pane"}
                            placeholder={live ? (i === 0 ? "Look this way and type" : "Now look here and keep typing") : "Turn on the camera to try it"}
                            className="h-36 w-full resize-none bg-transparent p-4 text-[16px] outline-none placeholder:text-black/30" />
                </div>
              );
            })}
          </div>
          <div className="mt-7 flex flex-col items-center gap-3">
            <p className="flex items-center gap-2 text-[15px] text-[color:var(--color-ink-2)]">
              <span className={`size-2 rounded-full ${gaze.status === "tracking" ? "bg-[color:var(--color-green)]" : "bg-black/20"}`} />
              {STATUS[live ? gaze.status : "off"]}
            </p>
            <button onClick={() => setLive((v) => !v)} className={`btn ${live ? "btn-quiet" : "btn-blue"}`}>
              {live ? "Turn camera off" : "Turn on camera"}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Install guide: System Settings, light                                */
/* ------------------------------------------------------------------ */

type Step = { title: string; badge: React.ReactNode; body: React.ReactNode; mock: React.ReactNode };

const Badge = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
  <span className="grid size-[26px] shrink-0 place-items-center rounded-[7px] text-white shadow-[inset_0_.5px_0_rgba(255,255,255,.4)]" style={{ background: bg }}>{children}</span>
);
const I = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" className="size-[15px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

const STEPS: Step[] = [
  { title: "Download", badge: <Badge bg="linear-gradient(#4FA0FF,#0A6CF0)"><I d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" /></Badge>,
    body: <>Download GazeHop from the latest GitHub release and double-click the zip to unzip it.</>, mock: <MockFile /> },
  { title: "Move to Applications", badge: <Badge bg="linear-gradient(#64B5FF,#2D7FF0)"><I d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></Badge>,
    body: <>Drag <b>GazeHop</b> into your <b>Applications</b> folder.</>, mock: <MockFile apps /> },
  { title: "Open it once", badge: <Badge bg="linear-gradient(#A0A0A6,#6E6E73)"><I d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></Badge>,
    body: <>macOS says it can't verify the developer, because GazeHop isn't notarized. Click <b>Done</b>. This is normal for independent apps.</>, mock: <MockDialog /> },
  { title: "Privacy & Security", badge: <Badge bg="linear-gradient(#5E8BFF,#2F5BE0)"><I d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /></Badge>,
    body: <>Open <b>System Settings › Privacy &amp; Security</b>, scroll down, and click <b>Open Anyway</b> next to GazeHop.</>, mock: <MockOpenAnyway /> },
  { title: "Camera & Accessibility", badge: <Badge bg="linear-gradient(#4CD964,#28A745)"><I d="M15 10l4.5-2.5v9L15 14M4 7h11v10H4z" /></Badge>,
    body: <>Allow <b>Camera</b> when asked, then turn on GazeHop in <b>Privacy &amp; Security › Accessibility</b>.</>, mock: <MockToggles /> },
  { title: "Calibrate", badge: <LogoMark className="size-[26px]" />,
    body: <>Follow the dot on each screen for a few seconds. When the eye appears in your menu bar, you're set.</>, mock: <MockCalibrate /> },
];

export function InstallGuide() {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const cmd = "xattr -dr com.apple.quarantine /Applications/GazeHop.app";
  const copy = async () => {
    try { await navigator.clipboard.writeText(cmd); } catch {
      const ta = document.createElement("textarea"); ta.value = cmd; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  return (
    <section id="install" className="scroll-mt-14 py-24 md:py-32" aria-labelledby="install-title">
      <div className="wrap">
        <Reveal className="mb-10 grid gap-5 md:mb-14 md:grid-cols-[1.1fr_1fr] md:items-end">
          <h2 id="install-title" className="t-h2 max-w-[16ch]">Installing an open‑source Mac app</h2>
          <p className="text-[17px] text-[color:var(--color-ink-2)]">
            Independent apps on GitHub often aren't notarized, since Apple's developer program costs $99 a year. macOS asks you to confirm
            them once. It takes a minute, and you can <a className="text-[color:var(--color-blue)] hover:underline" href={SOURCE}>read the source</a> first.
          </p>
        </Reveal>
        <Reveal>
          <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_.5px_rgba(0,0,0,.2),0_30px_70px_-30px_rgba(0,0,0,.35)]">
            <div className="flex items-center gap-2 border-b border-black/[.07] bg-[#F6F6F7] px-4 py-3">
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} className="size-3 rounded-full" style={{ background: c }} />)}
              <span className="mx-auto pr-14 text-[13px] font-semibold text-black/70">Install GazeHop</span>
            </div>
            <div className="grid md:grid-cols-[250px_1fr]">
              <ol className="border-b border-black/[.06] bg-[#F6F6F7]/70 p-2.5 md:border-b-0 md:border-r" role="tablist" aria-label="Install steps">
                {STEPS.map((s, k) => (
                  <li key={s.title}>
                    <button role="tab" aria-selected={i === k} onClick={() => setI(k)}
                            className={`relative flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-[7px] text-left text-[14px] ${i === k ? "text-white" : "text-[color:var(--color-ink)] hover:bg-black/[.04]"}`}>
                      {i === k && <motion.span layoutId="install-sel" className="absolute inset-0 rounded-[8px] bg-[color:var(--color-blue)]" transition={{ type: "spring", bounce: 0, duration: 0.35 }} />}
                      <span className="relative z-10 flex items-center gap-2.5">{s.badge}{s.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={i} role="tabpanel" className="grid gap-8 p-7 md:grid-cols-[1fr_1.1fr] md:p-10"
                            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ type: "spring", bounce: 0, duration: 0.35 }}>
                  <div>
                    <p className="text-[13px] font-medium text-[color:var(--color-ink-3)]">Step {i + 1} of {STEPS.length}</p>
                    <h3 className="t-h3 mt-1">{STEPS[i].title}</h3>
                    <p className="mt-3 text-[color:var(--color-ink-2)] [&_b]:font-semibold [&_b]:text-[color:var(--color-ink)]">{STEPS[i].body}</p>
                    <div className="mt-6 flex gap-2">
                      <button disabled={i === 0} onClick={() => setI(i - 1)} className="btn btn-quiet !py-2 !text-[14px] disabled:opacity-40">Back</button>
                      {i < STEPS.length - 1
                        ? <button onClick={() => setI(i + 1)} className="btn btn-blue !py-2 !text-[14px]">Next</button>
                        : <a href={DOWNLOAD} className="btn btn-blue !py-2 !text-[14px]">Download GazeHop</a>}
                    </div>
                  </div>
                  <div className="grid min-h-56 place-items-center rounded-[14px] bg-[color:var(--color-ground)] p-5">{STEPS[i].mock}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
        <Reveal className="mt-5">
          <div className="flex flex-col gap-3 rounded-[16px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.06)] md:flex-row md:items-center">
            <p className="text-[14px] text-[color:var(--color-ink-2)] md:w-60">Prefer Terminal? This does steps 3 and 4:</p>
            <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-[10px] bg-[#F5F5F7] px-3 py-2.5 font-[family-name:var(--font-mono)] text-[13px]">{cmd}</code>
            <button onClick={copy} className="btn btn-quiet !py-2 !text-[14px]" aria-live="polite">{copied ? "Copied" : "Copy"}</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MockFile({ apps = false }: { apps?: boolean }) {
  return (
    <div className="flex items-center gap-6 text-[12px] text-[color:var(--color-ink-2)]" aria-hidden="true">
      <div className="flex flex-col items-center gap-2"><LogoMark className="size-16" />GazeHop</div>
      {apps && <>
        <span className="text-xl text-black/30">→</span>
        <div className="flex flex-col items-center gap-2">
          <div className="grid size-16 place-items-center rounded-[14px] bg-[linear-gradient(#64B5FF,#2D7FF0)] text-white"><I d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></div>Applications
        </div>
      </>}
    </div>
  );
}

function MockDialog() {
  return (
    <div className="w-[250px] rounded-[14px] bg-white/95 p-5 text-center text-[13px] shadow-[0_0_0_.5px_rgba(0,0,0,.15),0_20px_40px_-15px_rgba(0,0,0,.35)]" aria-hidden="true">
      <LogoMark className="mx-auto mb-3 size-12" />
      <p className="font-semibold">"GazeHop" Not Opened</p>
      <p className="mt-1 text-[11px] text-[color:var(--color-ink-3)]">Apple could not verify "GazeHop" is free of malware.</p>
      <div className="mt-4 grid gap-1.5">
        <span className="rounded-[7px] bg-black/[.06] py-1.5">Move to Trash</span>
        <span className="rounded-[7px] bg-[color:var(--color-blue)] py-1.5 font-semibold text-white">Done</span>
      </div>
    </div>
  );
}

function MockOpenAnyway() {
  return (
    <div className="w-full max-w-[330px] space-y-2 text-[13px]" aria-hidden="true">
      <p className="text-[12px] text-[color:var(--color-ink-3)]">Privacy &amp; Security</p>
      <div className="rounded-[12px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.06)]">
        <p className="text-[color:var(--color-ink-2)]">"GazeHop" was blocked to protect your Mac.</p>
        <div className="mt-3 flex justify-end"><span className="rounded-[7px] bg-[color:var(--color-blue)] px-3 py-1.5 font-semibold text-white">Open Anyway</span></div>
      </div>
    </div>
  );
}

function MockToggles() {
  return (
    <div className="w-full max-w-[330px] divide-y divide-black/[.06] rounded-[12px] bg-white text-[13px] shadow-[0_0_0_1px_rgba(0,0,0,.06)]" aria-hidden="true">
      {[["Camera", "linear-gradient(#4CD964,#28A745)"], ["Accessibility", "linear-gradient(#5E8BFF,#2F5BE0)"]].map(([l, bg]) => (
        <div key={l} className="flex items-center gap-3 p-3">
          <span className="size-6 rounded-[6px]" style={{ background: bg }} />
          <span className="flex-1">{l} · GazeHop</span>
          <span className="relative h-[22px] w-[38px] rounded-full bg-[#34C759]"><span className="absolute right-[2px] top-[2px] size-[18px] rounded-full bg-white shadow" /></span>
        </div>
      ))}
    </div>
  );
}

function MockCalibrate() {
  return (
    <div className="grid w-full max-w-[330px] grid-cols-2 gap-3" aria-hidden="true">
      {[0, 1].map((s) => (
        <div key={s} className="relative aspect-[16/10] rounded-[10px] bg-[#1D1D1F]">
          {[[50, 50], [24, 30], [76, 30], [24, 72], [76, 72]].map(([x, y], k) => (
            <span key={k} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${s === 0 && k === 2 ? "size-3.5 bg-[#FFD60A] shadow-[0_0_0_5px_rgba(255,214,10,.25)]" : "size-1.5 bg-white/30"}`} style={{ left: `${x}%`, top: `${y}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */

const FAQ: [string, React.ReactNode][] = [
  ["Does GazeHop record or upload video?", "No. Each camera frame is read in memory to find your head direction and eye position, then discarded. The app contains no networking code."],
  ["Why isn't it notarized?", <>Notarization needs Apple's $99 a year developer program. GazeHop is free and open source, so for now you confirm it once in System Settings (see the <a className="text-[color:var(--color-blue)] hover:underline" href="#install">install guide</a>), or build it from source.</>],
  ["Which Macs does it work on?", "Any Mac on macOS 14 or later with a camera, built in or external, and two or more displays."],
  ["Why does it need Accessibility access?", "macOS only lets an app bring another app's window to the front with Accessibility permission. GazeHop uses it for exactly that, and never reads what you type."],
  ["Does it work with glasses?", "Usually. Strong reflections make eye tracking noisier, but head direction still works, and the two are combined."],
  ["How accurate is it?", "Best when your screens sit at clearly different angles from you. Recalibrate after moving your chair, camera or screens, and adjust look time and strictness in Settings if switching feels too eager or too slow."],
  ["What does it cost?", <>Nothing. It's MIT licensed. Found a bug? <a className="text-[color:var(--color-blue)] hover:underline" href={ISSUES}>Open an issue</a>.</>],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="scroll-mt-14 py-24 md:py-32" aria-labelledby="faq-title">
      <div className="wrap max-w-[860px]">
        <Reveal><h2 id="faq-title" className="t-h2 mb-10">Questions</h2></Reveal>
        <div className="border-t border-[color:var(--color-line-2)]">
          {FAQ.map(([q, a], k) => {
            const isOpen = open === k;
            return (
              <div key={q} className="border-b border-[color:var(--color-line)]">
                <h3>
                  <button className="flex w-full items-center justify-between gap-6 py-5 text-left text-[19px] font-semibold tracking-[-0.02em] transition-colors hover:text-[color:var(--color-blue)]"
                          aria-expanded={isOpen} aria-controls={`faq-${k}`} onClick={() => setOpen(isOpen ? null : k)}>
                    {q}
                    <motion.svg viewBox="0 0 24 24" className="size-5 shrink-0 text-[color:var(--color-ink-3)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", bounce: 0, duration: 0.35 }} aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </motion.svg>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`faq-${k}`} className="overflow-hidden"
                                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
                      <div className="max-w-[64ch] pb-6 text-[17px] text-[color:var(--color-ink-2)]">{a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Close                                                                */
/* ------------------------------------------------------------------ */

export function Close() {
  const reduce = useReducedMotion();
  const keys: [string, string, number][] = [["⌘", "left-[12%] top-[22%]", -12], ["F1", "right-[13%] top-[30%]", 10], ["⌥", "left-[20%] bottom-[16%]", 8]];
  return (
    <section className="relative overflow-hidden py-28 text-center md:py-40" aria-labelledby="close-title">
      <Sky />
      <div className="absolute inset-0 hidden md:block" aria-hidden="true">
        {keys.map(([k, pos, r], i) => (
          <motion.span key={k} className={`absolute grid size-[72px] place-items-center rounded-[18px] bg-white/55 text-[26px] font-medium text-[color:var(--color-ink-2)] shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_0_0_1px_rgba(255,255,255,.6),0_20px_40px_-18px_rgba(40,60,140,.45)] backdrop-blur-xl ${pos}`}
                       style={{ rotate: r }}
                       animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}>
            {k}
          </motion.span>
        ))}
      </div>
      <div className="wrap relative">
        <Reveal>
          <h2 id="close-title" className="t-hero mx-auto max-w-[17ch] text-balance !text-[clamp(40px,5vw,72px)]">Stop typing into the wrong window.</h2>
          <p className="t-lead mx-auto mt-5 max-w-[34ch]">Free for your Mac. About a minute to set up.</p>
          <div className="mt-9 flex justify-center"><DownloadButton /></div>
        </Reveal>
      </div>
    </section>
  );
}
