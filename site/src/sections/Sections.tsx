import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BorderBeam } from "../components/magicui/border-beam";
import { NumberTicker } from "../components/magicui/number-ticker";
import { DownloadButton, GitHubButton, LogoMark } from "../components/Chrome";
import { eyeBus } from "../components/FlyingEye";
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
/* How it works: three full-height scenes the eye travels through      */
/* ------------------------------------------------------------------ */

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16" aria-labelledby="how-title">
      <div className="wrap relative z-10 pt-16 md:pt-24">
        <Reveal>
          <p className="eyebrow mb-4">How it works</p>
          <h2 id="how-title" className="t-h2 max-w-[18ch]">Set it up once. Then forget it's there.</h2>
        </Reveal>
      </div>

      <Scene n={1} title="Calibrate once." body="Follow a dot to a few spots on each screen. GazeHop learns where your head and eyes point for every display you have, in about ten seconds a screen.">
        <CalibrationArt />
      </Scene>

      <Scene n={2} flip title="Look at a screen." body="Your webcam reads head direction and pupil position many times a second with Apple's Vision framework. Hold your look for a quarter of a second and GazeHop decides.">
        <div className="relative">
          <div data-eye="hop" className="mx-auto mb-6 size-[clamp(110px,11vw,170px)]" aria-hidden="true" />
          <HopScreens />
        </div>
      </Scene>

      <Scene n={3} title="Keep typing." body="The last window you used on that screen comes forward with keyboard focus, and the pointer follows so scrolling works too. No click needed.">
        <TypingWindow />
      </Scene>
    </section>
  );
}

function Scene({ n, title, body, flip = false, children }: { n: number; title: string; body: string; flip?: boolean; children: React.ReactNode }) {
  return (
    <div className="wrap relative z-10 grid min-h-[60vh] items-center gap-10 py-12 md:grid-cols-2 md:gap-20">
      <Reveal className={flip ? "md:order-2" : ""}>
        <p className="mb-5 font-mono text-[13px] text-[color:var(--color-cyan)]">Step {n} of 3</p>
        <h3 className="t-h2">{title}</h3>
        <p className="mt-5 max-w-[46ch] text-[clamp(17px,0.5vw+14px,20px)] text-[color:var(--color-fg-2)]">{body}</p>
      </Reveal>
      <Reveal delay={0.1} className={flip ? "md:order-1" : ""}>{children}</Reveal>
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
                <span key={k} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${active ? "size-4 bg-[color:var(--color-cyan)] shadow-[0_0_0_6px_rgba(6,182,212,.18),0_0_24px_rgba(6,182,212,.6)]" : "size-2 bg-white/20"}`}
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
          <div key={s} className={`relative aspect-[16/10] rounded-[14px] border bg-[color:var(--color-panel)] p-4 transition-all duration-300 ${on ? "border-[color:var(--color-track)] shadow-[0_0_0_3px_rgba(16,185,129,.18),0_20px_60px_-20px_rgba(16,185,129,.45)]" : "border-[color:var(--color-line-2)] opacity-60"}`}>
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
    <div ref={ref} className="relative rounded-[16px] border border-[color:var(--color-track)] bg-[color:var(--color-panel)] shadow-[0_0_0_3px_rgba(16,185,129,.15),0_30px_80px_-30px_rgba(16,185,129,.5)]">
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_100%,rgba(6,182,212,.12),transparent)]" aria-hidden="true" />
      <div className="wrap relative z-10 text-center">
        <p className="eyebrow mb-6">The only number you need</p>
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
          <p className="eyebrow mb-4">Built for real desks</p>
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
          <Card className="md:col-span-3" title="Tune how it feels" body="Look time, strictness, smoothing and the pause shortcut live in Settings, and apply the moment you change them.">
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
    <Reveal className={className}>
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
    <div className="flex h-full items-end justify-center gap-3 pt-2" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center" style={{ transform: `perspective(600px) rotateY(${(1 - i) * 18}deg)` }}>
          <div className={`h-20 w-32 rounded-[8px] border transition-all duration-300 md:h-24 md:w-40 ${on === i ? "border-[color:var(--color-track)] bg-[color:var(--color-track)]/10 shadow-[0_0_30px_rgba(16,185,129,.35)]" : "border-white/15 bg-white/[.03]"}`} />
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
      <rect x="68" y="12" width="64" height="78" rx="14" fill="none" stroke="#10B981" strokeWidth="2.5" />
      <circle cx="100" cy="48" r="21" fill="rgba(16,185,129,.12)" stroke="#F5F7FA" strokeWidth="2" />
      <text x="100" y="104" textAnchor="middle" fontFamily="SF Mono, ui-monospace, monospace" fontSize="9" fill="#10B981" letterSpacing="1">TRACKING</text>
    </svg>
  );
}

function SlidersArt() {
  const rows: [string, string, number][] = [["Look time", "250 ms", 0.17], ["Strictness", "20%", 0.27], ["Smoothing", "55%", 0.61]];
  return (
    <div className="flex h-full flex-col justify-center gap-4" aria-hidden="true">
      {rows.map(([l, v, p]) => (
        <div key={l}>
          <div className="mb-1.5 flex justify-between text-[13px]"><span>{l}</span><span className="font-mono text-[12px] text-[color:var(--color-fg-3)]">{v}</span></div>
          <div className="relative h-1 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[color:var(--color-cyan)]" style={{ width: `${p * 100}%` }} />
            <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${p * 100}%` }} />
          </div>
        </div>
      ))}
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
          <p className="eyebrow mb-4">Try it without installing</p>
          <h2 id="try-title" className="t-h2">Turn your head. Watch the cursor move.</h2>
          <p className="mt-5 text-[color:var(--color-fg-2)]">A browser version of the same idea. It runs in this tab, and your video never leaves your browser.</p>
        </Reveal>
        <div className="mx-auto grid max-w-[1100px] grid-cols-[1fr_auto_1fr] items-center gap-6">
          {[a, b].map((r, i) => {
            const on = focused === (i === 0 ? "first" : "second");
            return (
              <div key={i} className={`overflow-hidden rounded-[16px] border bg-[color:var(--color-panel)] transition-all duration-300 ${i === 1 ? "order-3" : ""} ${on ? "border-[color:var(--color-track)] shadow-[0_0_0_3px_rgba(16,185,129,.18)]" : "border-[color:var(--color-line-2)]"}`}>
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
          <div data-eye={live ? "camera" : "hop"} className="order-2 size-28" aria-hidden="true" />
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
  { title: "Download", badge: <Badge bg="linear-gradient(#3b82f6,#1d4ed8)"><I d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" /></Badge>,
    body: <>Download <b>GazeHop-x.y.zip</b> from the latest GitHub release and double-click it to unzip.</>,
    mock: <MockFile /> },
  { title: "Move to Applications", badge: <Badge bg="linear-gradient(#60a5fa,#2563eb)"><I d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></Badge>,
    body: <>Drag <b>GazeHop.app</b> into your <b>Applications</b> folder.</>,
    mock: <MockFile apps /> },
  { title: "Open it once", badge: <Badge bg="linear-gradient(#9ca3af,#4b5563)"><I d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></Badge>,
    body: <>macOS says it can't verify the developer, because GazeHop isn't notarized. Click <b>Done</b>. This is expected for independent apps.</>,
    mock: <MockDialog /> },
  { title: "Privacy & Security", badge: <Badge bg="linear-gradient(#3b82f6,#1e40af)"><I d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /></Badge>,
    body: <>Open <b>System Settings › Privacy &amp; Security</b>, scroll down, and click <b>Open Anyway</b> next to GazeHop. Confirm with your password.</>,
    mock: <MockOpenAnyway /> },
  { title: "Camera & Accessibility", badge: <Badge bg="linear-gradient(#34d399,#059669)"><I d="M15 10l4.5-2.5v9L15 14M4 7h11v10H4z" /></Badge>,
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
            <p className="eyebrow mb-4">Install guide</p>
            <h2 id="install-title" className="t-h2">Installing free and open-source software on macOS</h2>
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
            <div className="grid md:grid-cols-[280px_1fr]">
              <ol className="border-b border-[color:var(--color-line)] p-3 md:border-b-0 md:border-r" role="tablist" aria-label="Install steps">
                {STEPS.map((s, k) => (
                  <li key={s.title}>
                    <button role="tab" aria-selected={i === k} onClick={() => setI(k)}
                            className={`flex w-full items-center gap-3 rounded-[9px] px-2.5 py-2 text-left text-[14.5px] transition ${i === k ? "bg-[color:var(--color-cyan)]/15 text-white" : "text-[color:var(--color-fg-2)] hover:bg-white/[.04]"}`}>
                      {s.badge}
                      <span className="flex-1">{s.title}</span>
                      <span className="font-mono text-[11px] text-[color:var(--color-fg-3)]">{k + 1}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="grid gap-8 p-6 md:grid-cols-[1fr_1.1fr] md:p-10" role="tabpanel">
                <div>
                  <p className="font-mono text-[13px] text-[color:var(--color-cyan)]">Step {i + 1} of {STEPS.length}</p>
                  <h3 className="t-h3 mt-2 !text-[26px]">{STEPS[i].title}</h3>
                  <p className="mt-3 text-[color:var(--color-fg-2)] [&_b]:text-white">{STEPS[i].body}</p>
                  <div className="mt-6 flex gap-2">
                    <button disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-[10px] border border-[color:var(--color-line-2)] px-4 py-2 text-[14px] font-semibold disabled:opacity-30">Back</button>
                    {i < STEPS.length - 1
                      ? <button onClick={() => setI(i + 1)} className="rounded-[10px] bg-white px-4 py-2 text-[14px] font-semibold text-[color:var(--color-bg)]">Next step</button>
                      : <a href={DOWNLOAD} className="rounded-[10px] bg-[color:var(--color-track)] px-4 py-2 text-[14px] font-semibold text-white">Download GazeHop</a>}
                  </div>
                </div>
                <div className="min-h-56 rounded-[14px] border border-[color:var(--color-line)] bg-black/30 p-5">{STEPS[i].mock}</div>
              </div>
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
          <div className="grid size-16 place-items-center rounded-[14px] bg-gradient-to-b from-sky-400 to-blue-600"><I d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></div>Applications
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
      {[["Camera", "linear-gradient(#34d399,#059669)"], ["Accessibility", "linear-gradient(#3b82f6,#1d4ed8)"]].map(([l, bg]) => (
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
  return (
    <section id="faq" className="scroll-mt-16 py-24 md:py-32" aria-labelledby="faq-title">
      <div className="wrap relative z-10 grid gap-12 md:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <p className="eyebrow mb-4">Questions</p>
          <h2 id="faq-title" className="t-h2">Before you install.</h2>
        </Reveal>
        <div className="divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
          {FAQ.map(([q, a], k) => {
            const isOpen = open === k;
            return (
              <div key={q}>
                <h3>
                  <button className="flex w-full items-center justify-between gap-6 py-5 text-left text-[18px] font-semibold" aria-expanded={isOpen} aria-controls={`faq-${k}`} onClick={() => setOpen(isOpen ? null : k)}>
                    {q}
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[color:var(--color-line-2)] text-[color:var(--color-fg-2)]" aria-hidden="true">
                      <span className={`block transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>+</span>
                    </span>
                  </button>
                </h3>
                <div id={`faq-${k}`} hidden={!isOpen} className="pb-6 pr-12 text-[color:var(--color-fg-2)]">{a}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="pb-24 md:pb-32">
      <div className="wrap relative z-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[26px] border border-[color:var(--color-line-2)] bg-[radial-gradient(80%_100%_at_50%_0%,rgba(16,185,129,.18),transparent_70%),var(--color-bg-2)] px-6 py-16 text-center md:py-24">
            <div data-eye="pointer" className="mx-auto mb-8 size-24 md:size-28" aria-hidden="true" />
            <h2 className="t-h2 mx-auto max-w-[18ch]">Stop typing into the wrong window<span className="caret" aria-hidden="true" /></h2>
            <p className="mx-auto mt-5 max-w-xl text-[color:var(--color-fg-2)]">Free for macOS. About a minute to set up.</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <DownloadButton />
              <GitHubButton label="Star on GitHub" />
            </div>
            <BorderBeam size={180} duration={10} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={1.5} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

