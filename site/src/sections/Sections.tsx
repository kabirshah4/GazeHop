import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DownloadButton } from "../components/Chrome";
import { Eye } from "../components/Eye";
import { REPO, SOURCE, img } from "../lib/links";

/** One quiet entrance per block; nothing re-animates on the way back up. */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The problem                                                          */
/* ------------------------------------------------------------------ */

export function Problem() {
  const k = img("keyboard");
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--color-ink)] text-white" aria-labelledby="problem-title">
      <img {...k} sizes="100vw" alt="A keyboard on an oak desk, lit white from one side and blue from the other by two monitors"
           loading="lazy" decoding="async" className="absolute inset-0 -z-10 size-full object-cover opacity-45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[color:var(--color-ink)] via-[color:var(--color-ink)]/85 to-[color:var(--color-ink)]/30" />
      <div className="wrap grid gap-10 py-24 md:grid-cols-[1.2fr_1fr] md:py-32">
        <Reveal>
          <p className="eyebrow mb-5 !text-white/60">The wrong-window problem</p>
          <h2 id="problem-title" className="display text-[clamp(30px,4.4vw,54px)] font-semibold">
            You look at one screen. Your typing lands on the other.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="self-end space-y-4 text-[18px] leading-relaxed text-white/75">
          <p>
            macOS sends keystrokes to the window you clicked last, not the one you're looking at.
            With two or more screens, that gap is where replies go to the wrong chat and shortcuts
            hit the wrong app.
          </p>
          <p>GazeHop closes the gap. Look at a screen for a quarter of a second and its window is ready for your keyboard.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works: a real sequence, so it's numbered                      */
/* ------------------------------------------------------------------ */

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-24 md:py-32" aria-labelledby="how-title">
      <div className="wrap">
        <Reveal className="mb-14 max-w-2xl">
          <p className="eyebrow mb-4">How it works</p>
          <h2 id="how-title" className="display text-[clamp(28px,3.8vw,46px)] font-semibold">Calibrate once. Then just look.</h2>
        </Reveal>
        <ol className="grid gap-5 md:grid-cols-3">
          <Step n={1} title="Calibrate" delay={0}
                body="Follow a dot to a few spots on each screen. GazeHop learns where your head and eyes point for every display you have.">
            <CalibrationArt />
          </Step>
          <Step n={2} title="Look" delay={0.08}
                body="Your webcam reads head direction and eye position many times a second with Apple's Vision framework, right on your Mac.">
            <div className="flex h-full items-center justify-center"><Eye look={1} dwell={0.7} /></div>
          </Step>
          <Step n={3} title="Type" delay={0.16}
                body="After a quarter of a second on a screen, GazeHop brings back the last window you used there and moves the pointer with it.">
            <TypeArt />
          </Step>
        </ol>
      </div>
    </section>
  );
}

function Step({ n, title, body, children, delay }: { n: number; title: string; body: string; children: React.ReactNode; delay: number }) {
  return (
    <Reveal delay={delay} className="contents">
      <li className="flex flex-col overflow-hidden rounded-[18px] border border-[color:var(--color-hairline)] bg-[color:var(--color-card)]">
        <div className="h-44 border-b border-[color:var(--color-hairline)] bg-[color:var(--color-paper)]/60 p-5">{children}</div>
        <div className="p-6">
          <p className="mb-2 flex items-baseline gap-3">
            <span className="font-[family-name:var(--font-display)] text-[13px] text-[color:var(--color-cobalt)]">Step {n}</span>
          </p>
          <h3 className="mb-2 text-[22px] font-semibold tracking-[-0.01em]">{title}</h3>
          <p className="text-[16px] text-[color:var(--color-muted)]">{body}</p>
        </div>
      </li>
    </Reveal>
  );
}

function CalibrationArt() {
  return (
    <div className="grid h-full grid-cols-2 gap-3" aria-hidden="true">
      {[0, 1].map((s) => (
        <div key={s} className="relative rounded-[10px] bg-[color:var(--color-ink)]">
          {[[50, 50], [25, 30], [75, 30], [25, 72], [75, 72]].map(([x, y], i) => (
            <span key={i} className={`absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${s === 0 && i === 2 ? "size-4 bg-[color:var(--color-caret)] ring-4 ring-[color:var(--color-caret)]/25" : "bg-white/20"}`}
                  style={{ left: `${x}%`, top: `${y}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TypeArt() {
  return (
    <div className="grid h-full grid-cols-2 gap-3" aria-hidden="true">
      <div className="rounded-[10px] border border-[color:var(--color-hairline)] bg-[color:var(--color-card)] p-3 opacity-60">
        <div className="h-1.5 w-16 rounded-full bg-[color:var(--color-hairline)]" />
      </div>
      <div className="rounded-[10px] border-2 border-[color:var(--color-cobalt)] bg-[color:var(--color-card)] p-3">
        <p className="font-[family-name:var(--font-display)] text-[12px] leading-snug">sounds good,<br />sending now<span className="caret" /></p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                             */
/* ------------------------------------------------------------------ */

export function Features() {
  const three = img("three-screens");
  const pad = img("controller");
  return (
    <section className="pb-24 md:pb-32" aria-labelledby="features-title">
      <div className="wrap">
        <Reveal className="mb-14 max-w-2xl">
          <p className="eyebrow mb-4">Details that matter</p>
          <h2 id="features-title" className="display text-[clamp(28px,3.8vw,46px)] font-semibold">Built for real desks, not demos.</h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-6">
          <Card className="md:col-span-4" image={<img {...three} sizes="(min-width: 768px) 60vw, 100vw" loading="lazy" decoding="async" alt="Three monitors arranged in an arc on a white desk with a webcam on the middle one" className="aspect-[16/9] w-full object-cover" />}
                title="Two screens or six"
                body="GazeHop calibrates every display you connect. Unplug one and it's simply ignored until it comes back. Plug in a new one and it asks to calibrate." />
          <Card className="md:col-span-2" title="One person, not the whole room"
                body="It locks onto your face and ignores anyone walking past behind you. Step away, and it waits for you instead of following someone else.">
            <FaceArt />
          </Card>
          <Card className="md:col-span-2" title="Pause from anywhere"
                body="Gaming on one screen with a video on the other? Press the shortcut and glances stop moving focus. Press it again to resume.">
            <div className="flex h-full items-center justify-center gap-2 text-[22px]"><span className="keycap">⌘</span><span className="keycap">F1</span></div>
          </Card>
          <Card className="md:col-span-4" image={<img {...pad} sizes="(min-width: 768px) 60vw, 100vw" loading="lazy" decoding="async" alt="A game controller on a dark desk lit orange and teal by two monitors" className="aspect-[16/9] w-full object-cover" />}
                title="Leave some screens out"
                body="Turn off any display you only watch, like a TV or a second monitor with a stream on it. GazeHop never moves your keyboard there." />
          <Card className="md:col-span-3" title="Tune how it feels"
                body="Look time, strictness, smoothing and the pause shortcut are all in Settings, and every change applies the moment you make it.">
            <SlidersArt />
          </Card>
          <Card className="md:col-span-3" title="Quiet in the menu bar"
                body="One small eye next to your clock. It shows a slash when paused and a dot when it needs you, like a new screen to calibrate.">
            <MenuBarArt />
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ title, body, image, children, className = "" }: { title: string; body: string; image?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <Reveal className={className}>
      <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[color:var(--color-hairline)] bg-[color:var(--color-card)]">
        {image}
        {children && <div className="min-h-40 flex-1 border-b border-[color:var(--color-hairline)] bg-[color:var(--color-paper)]/60 p-5">{children}</div>}
        <div className="p-6">
          <h3 className="mb-2 text-[21px] font-semibold tracking-[-0.01em]">{title}</h3>
          <p className="text-[16px] text-[color:var(--color-muted)]">{body}</p>
        </div>
      </article>
    </Reveal>
  );
}

function FaceArt() {
  return (
    <div className="relative flex h-full items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 200 110" className="h-full">
        <g opacity="0.35">
          <circle cx="40" cy="44" r="16" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="164" cy="50" r="13" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeDasharray="4 4" />
        </g>
        <rect x="70" y="14" width="60" height="74" rx="14" fill="none" stroke="var(--color-cobalt)" strokeWidth="3" />
        <circle cx="100" cy="46" r="20" fill="var(--color-cobalt)" opacity="0.12" />
        <circle cx="100" cy="46" r="20" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" />
        <text x="100" y="104" textAnchor="middle" fontFamily="Martian Mono, monospace" fontSize="9" fill="var(--color-cobalt)">TRACKING</text>
      </svg>
    </div>
  );
}

function SlidersArt() {
  const rows: [string, string, number][] = [["Look time", "250 ms", 0.17], ["Strictness", "20%", 0.27], ["Smoothing", "55%", 0.61]];
  return (
    <div className="flex h-full flex-col justify-center gap-3.5" aria-hidden="true">
      {rows.map(([label, value, v]) => (
        <div key={label}>
          <div className="mb-1.5 flex justify-between text-[13px]"><span>{label}</span><span className="font-[family-name:var(--font-display)] text-[12px] text-[color:var(--color-muted)]">{value}</span></div>
          <div className="relative h-1 rounded-full bg-[color:var(--color-hairline)]">
            <div className="h-full rounded-full bg-[color:var(--color-cobalt)]" style={{ width: `${v * 100}%` }} />
            <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--color-hairline)] bg-white shadow" style={{ left: `${v * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuBarArt() {
  const states: [string, React.ReactNode][] = [
    ["Watching", <EyeGlyph key="w" />],
    ["Paused", <EyeGlyph key="p" slash />],
    ["Needs you", <EyeGlyph key="n" dot />],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-4" aria-hidden="true">
      <div className="flex items-center justify-end gap-4 rounded-[10px] bg-[color:var(--color-ink)] px-4 py-2 text-[12px] text-white/80">
        <span>Wi-Fi</span><EyeGlyph light /><span>Fri 9:41</span>
      </div>
      <div className="flex justify-around">
        {states.map(([l, g]) => (
          <div key={l} className="flex flex-col items-center gap-1.5 text-[12px] text-[color:var(--color-muted)]">{g}{l}</div>
        ))}
      </div>
    </div>
  );
}

function EyeGlyph({ slash = false, dot = false, light = false }: { slash?: boolean; dot?: boolean; light?: boolean }) {
  const c = light ? "#fff" : "var(--color-ink)";
  return (
    <svg viewBox="0 0 20 16" className="h-4 w-5">
      <path d="M1.5 8 C5.5 14.6 14.5 14.6 18.5 8 C14.5 1.4 5.5 1.4 1.5 8 Z" fill="none" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="10" cy="8" r="3.4" fill={c} />
      {slash && <line x1="3" y1="1" x2="17" y2="15" stroke={c} strokeWidth="1.6" strokeLinecap="round" />}
      {dot && <circle cx="17" cy="13" r="2.5" fill={c} />}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Privacy                                                              */
/* ------------------------------------------------------------------ */

export function Privacy() {
  const cam = img("webcam");
  const points: [string, string][] = [
    ["Frames are analysed in memory, then discarded.", "Nothing is saved, recorded or uploaded. Calibration is stored as a few numbers per screen, never as images."],
    ["GazeHop has no network code at all.", "It can't send anything anywhere. The source is public, so you can check that yourself."],
    ["No accounts, no analytics.", "Not in the app, and not on this website either. No cookies, no trackers."],
  ];
  return (
    <section id="privacy" className="scroll-mt-16 bg-[color:var(--color-ink)] text-white" aria-labelledby="privacy-title">
      <div className="wrap grid items-center gap-12 py-24 md:grid-cols-2 md:gap-16 md:py-32">
        <Reveal className="overflow-hidden rounded-[18px]">
          <img {...cam} sizes="(min-width: 768px) 45vw, 100vw" loading="lazy" decoding="async"
               alt="Close-up of a webcam on a monitor with its green indicator light on" className="aspect-[4/3] w-full object-cover" />
        </Reveal>
        <div>
          <Reveal>
            <p className="eyebrow mb-5 flex items-center gap-2 !text-white/60">
              <span className="size-2 rounded-full bg-[color:var(--color-led)] shadow-[0_0_10px_var(--color-led)]" /> Camera on, data stays home
            </p>
            <h2 id="privacy-title" className="display mb-10 text-[clamp(28px,3.8vw,46px)] font-semibold">Your camera feed never leaves your Mac.</h2>
          </Reveal>
          <ul className="space-y-6">
            {points.map(([t, d], i) => (
              <Reveal key={t} delay={0.06 * i}>
                <li className="border-t border-white/12 pt-5">
                  <p className="mb-1 text-[18px] font-semibold">{t}</p>
                  <p className="text-[16px] text-white/65">{d}</p>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.2}>
            <a href={SOURCE} className="mt-8 inline-flex items-center gap-2 font-semibold text-[color:var(--color-caret)] hover:underline">
              Read the source code <span aria-hidden="true">→</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */

const FAQ: [string, React.ReactNode][] = [
  ["Does GazeHop record or upload video?",
    "No. Each camera frame is read in memory to find your head direction and eye position, then thrown away. The app contains no networking code."],
  ["Which Macs does it work on?",
    "Any Mac running macOS 14 or later with a camera, built in or external, and two or more displays. It has been tested most on Apple silicon."],
  ["Why does macOS say it can't verify the app?",
    <>GazeHop isn't notarized by Apple yet, which needs a paid developer account. The first time you open it, click <b>Done</b>, then go to <b>System Settings › Privacy &amp; Security</b> and click <b>Open Anyway</b>.</>],
  ["Why does it need Accessibility access?",
    "macOS only lets apps bring another app's window to the front with Accessibility permission. GazeHop uses it to raise the window you look at, and for nothing else."],
  ["Does it work if I wear glasses?",
    "Usually. Strong reflections on lenses make eye tracking noisier, but head direction still works, and the two are combined."],
  ["How accurate is it?",
    "It works best when your screens sit at clearly different angles from where you sit. If you move your chair, camera or screens, run Calibrate again. If switching feels too eager or too slow, adjust look time and strictness in Settings."],
  ["What does it cost?",
    <>Nothing. GazeHop is free and open source under the MIT license. Found a bug? <a className="text-[color:var(--color-cobalt)] underline underline-offset-4" href={`${REPO}/issues`}>Open an issue on GitHub</a>.</>],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20 py-24 md:py-32" aria-labelledby="faq-title">
      <div className="wrap grid gap-12 md:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <p className="eyebrow mb-4">Questions</p>
          <h2 id="faq-title" className="display text-[clamp(28px,3.8vw,46px)] font-semibold">Before you install.</h2>
        </Reveal>
        <div className="divide-y divide-[color:var(--color-hairline)] border-y border-[color:var(--color-hairline)]">
          {FAQ.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q}>
                <h3>
                  <button className="flex w-full items-center justify-between gap-6 py-5 text-left text-[18px] font-semibold"
                          aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                    {q}
                    <span className="grid size-7 shrink-0 place-items-center rounded-md border border-[color:var(--color-hairline)] text-[color:var(--color-muted)]" aria-hidden="true">
                      <span className={`block transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>+</span>
                    </span>
                  </button>
                </h3>
                <div id={`faq-${i}`} hidden={!isOpen} className="pb-6 pr-12 text-[16px] text-[color:var(--color-muted)]">{a}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing call to action                                               */
/* ------------------------------------------------------------------ */

export function FinalCTA() {
  return (
    <section className="pb-24 md:pb-32">
      <div className="wrap">
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] bg-[color:var(--color-cobalt)] px-6 py-16 text-center text-white md:py-24">
            <div className="pointer-events-none absolute inset-0 opacity-25 [background:radial-gradient(60%_80%_at_50%_0%,#7f8bff,transparent)]" aria-hidden="true" />
            <h2 className="display relative mx-auto max-w-3xl text-[clamp(28px,4.2vw,52px)] font-semibold">
              Stop typing into the wrong window<span className="caret" />
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-[18px] text-white/80">Free for macOS. Takes about a minute to set up.</p>
            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={`${REPO}/releases/latest`} className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-3 font-semibold text-[color:var(--color-ink)] hover:bg-white/90">
                Download GazeHop
              </a>
              <a href={REPO} className="inline-flex items-center justify-center rounded-[10px] border border-white/35 px-5 py-3 font-semibold text-white hover:bg-white/10">
                Star on GitHub
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { DownloadButton };
