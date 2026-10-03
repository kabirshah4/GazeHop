import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Eye } from "../components/Eye";
import { DownloadButton } from "../components/Chrome";
import { REPO } from "../lib/links";
import { useHeadGaze, type GazeStatus, type Side } from "../lib/useHeadGaze";

const LINE_1 = "Look at a screen.";
const LINE_2 = "Your keyboard follows.";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Hero() {
  const reduce = useReducedMotion();
  const [live, setLive] = useState(false);

  // Scripted demo state
  const [typed1, setTyped1] = useState(reduce ? LINE_1 : "");
  const [typed2, setTyped2] = useState(reduce ? LINE_2 : "");
  const [focus, setFocus] = useState<Side>(reduce ? "second" : "first");
  const [look, setLook] = useState<Side>(reduce ? "second" : "first");
  const [dwell, setDwell] = useState(0);

  useEffect(() => {
    if (reduce || live) return;
    let cancelled = false;
    const run = async () => {
      const type = async (line: string, set: (s: string) => void) => {
        for (let i = 1; i <= line.length && !cancelled; i++) { set(line.slice(0, i)); await sleep(48 + Math.random() * 40); }
      };
      const hop = async (to: Side) => {
        setLook(to);
        for (let t = 0; t <= 10 && !cancelled; t++) { setDwell(t / 10); await sleep(40); }
        if (cancelled) return;
        setFocus(to);
        setDwell(0);
      };
      await sleep(500);
      if (typed1 !== LINE_1) await type(LINE_1, setTyped1);
      await sleep(650);
      await hop("second");
      await sleep(250);
      if (typed2 !== LINE_2) await type(LINE_2, setTyped2);
      // Idle: keep glancing back and forth so the hop stays visible.
      while (!cancelled) {
        await sleep(2600);
        if (cancelled) break;
        await hop("first");
        await sleep(2600);
        if (cancelled) break;
        await hop("second");
      }
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, live]);

  // Live camera mode
  const gaze = useHeadGaze(live);
  const area1 = useRef<HTMLTextAreaElement>(null);
  const area2 = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!live || gaze.status !== "tracking") return;
    (gaze.side === "first" ? area1 : area2).current?.focus({ preventScroll: true });
  }, [live, gaze.side, gaze.status]);

  const activeFocus: Side = live ? gaze.side : focus;
  const activeLook = live ? (gaze.lean > 0.4 ? -1 : gaze.lean < -0.4 ? 1 : 0) : look === "first" ? -1 : 1;

  return (
    <section className="relative overflow-hidden pb-20 pt-10 md:pb-28 md:pt-14" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">GazeHop: look at a screen, and your keyboard follows. A free macOS menu bar app.</h1>

      <div className="wrap">
        <p className="eyebrow mb-8 flex items-center justify-center gap-2 md:mb-10">
          <span>Free for macOS</span><span aria-hidden="true">/</span><span>Open source</span>
        </p>

        {/* The stage: two screens with the camera and eye between them */}
        <div className="relative mx-auto max-w-[1080px]">
          <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[62%] max-md:hidden">
            <Webcam on={live && gaze.status !== "off"} />
          </div>

          <div className="grid items-stretch gap-5 md:grid-cols-[1fr_auto_1fr] md:gap-4">
            <Screen title="Notes" focused={activeFocus === "first"}>
              {live ? (
                <textarea ref={area1} aria-label="First screen" placeholder="Look here and type." className="h-full min-h-[7.5rem] w-full resize-none bg-transparent outline-none placeholder:text-[color:var(--color-muted)]/60" />
              ) : (
                <Line text={typed1} showCaret={activeFocus === "first"} />
              )}
            </Screen>

            <div className="flex items-center justify-center md:w-24">
              <Eye look={activeLook as -1 | 0 | 1} dwell={live ? 0 : dwell} />
            </div>

            <Screen title="Messages" focused={activeFocus === "second"}>
              {live ? (
                <textarea ref={area2} aria-label="Second screen" placeholder="Now look here and keep typing." className="h-full min-h-[7.5rem] w-full resize-none bg-transparent outline-none placeholder:text-[color:var(--color-muted)]/60" />
              ) : (
                <Line text={typed2} showCaret={activeFocus === "second"} accent />
              )}
            </Screen>
          </div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-12 max-w-[640px] text-center md:mt-14"
        >
          <p className="text-[19px] leading-relaxed text-[color:var(--color-ink)]/80 md:text-[21px]">
            GazeHop is a menu bar app for Macs with more than one screen. Your webcam sees which screen
            you're looking at, and keyboard focus moves there. No clicking first, nothing sent anywhere.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DownloadButton />
            <a href={REPO} className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[color:var(--color-hairline)] bg-[color:var(--color-card)] px-5 py-3 font-semibold hover:border-[color:var(--color-ink)]/30">
              View source on GitHub
            </a>
          </div>
          <p className="mt-4 text-[14px] text-[color:var(--color-muted)]">Free, MIT license. macOS 14 or later, any Mac with a camera.</p>

          <div className="mt-8 hidden md:block">
            {!live ? (
              <button onClick={() => setLive(true)} className="group inline-flex items-center gap-2 text-[15px] font-semibold text-[color:var(--color-cobalt)]">
                <span className="size-2 rounded-full bg-[color:var(--color-led)] shadow-[0_0_0_3px_rgba(43,212,106,.2)]" />
                Try it here with your camera
                <span className="transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </button>
            ) : (
              <LiveStatus status={gaze.status} lean={gaze.lean} onStop={() => setLive(false)} />
            )}
            {!live && <p className="mt-1.5 text-[13px] text-[color:var(--color-muted)]">Runs in this tab. Your video never leaves your browser.</p>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Screen({ title, focused, children }: { title: string; focused: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        className={`relative flex aspect-[16/10] flex-col overflow-hidden rounded-[14px] border bg-[color:var(--color-card)] transition-[box-shadow,border-color] duration-300 ease-[var(--ease-hop)] ${
          focused
            ? "border-[color:var(--color-cobalt)] shadow-[0_0_0_3px_rgba(51,67,232,.18),0_24px_60px_-28px_rgba(36,32,184,.55)]"
            : "border-[color:var(--color-hairline)] shadow-[0_18px_40px_-30px_rgba(18,20,43,.35)]"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-[color:var(--color-hairline)] px-3.5 py-2.5">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} className="size-2.5 rounded-full transition-colors" style={{ background: focused ? c : "var(--color-hairline)" }} />
          ))}
          <span className={`ml-2 text-[12px] font-medium transition-colors ${focused ? "text-[color:var(--color-ink)]" : "text-[color:var(--color-muted)]/70"}`}>{title}</span>
          <span className={`ml-auto font-[family-name:var(--font-display)] text-[10px] uppercase tracking-wide transition-opacity ${focused ? "text-[color:var(--color-cobalt)] opacity-100" : "opacity-0"}`}>
            Focused
          </span>
        </div>
        <div className="flex flex-1 items-center px-5 py-4 md:px-7">{children}</div>
      </div>
      {/* Monitor stand */}
      <div className="mx-auto h-4 w-16 bg-gradient-to-b from-[color:var(--color-hairline)] to-transparent max-md:hidden" aria-hidden="true" />
    </div>
  );
}

function Line({ text, showCaret, accent = false }: { text: string; showCaret: boolean; accent?: boolean }) {
  return (
    <p className="display text-[clamp(26px,3.4vw,46px)] font-semibold text-[color:var(--color-ink)]" aria-hidden="true">
      {accent && text.includes("follows") ? (
        <>
          {text.replace("follows.", "")}
          <span className="text-[color:var(--color-cobalt)]">{text.slice(text.indexOf("follows"))}</span>
        </>
      ) : (
        text
      )}
      {showCaret && <span className="caret" />}
    </p>
  );
}

function Webcam({ on }: { on: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] bg-[color:var(--color-ink)] px-3 py-1.5 shadow-lg">
      <span className="size-3 rounded-full bg-[radial-gradient(circle_at_35%_35%,#4b55a8,#0b0c1d_60%)] ring-1 ring-white/15" />
      <span className={`size-1.5 rounded-full transition-colors ${on ? "bg-[color:var(--color-led)] shadow-[0_0_8px_var(--color-led)]" : "bg-white/20"}`} />
    </div>
  );
}

const STATUS_TEXT: Record<GazeStatus, string> = {
  off: "",
  loading: "Loading the face model (about 4 MB)",
  calibrating: "Look straight ahead for a moment",
  tracking: "Turn your head toward a screen, then type",
  "no-face": "Can't see a face. Check your lighting and that you're in frame.",
  denied: "Camera access is blocked. Allow it in your browser's site settings, then try again.",
  error: "The demo couldn't start in this browser. Try a recent Chrome, Edge or Safari.",
};

function LiveStatus({ status, lean, onStop }: { status: GazeStatus; lean: number; onStop: () => void }) {
  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div className="flex items-center gap-3 text-[15px]">
        <span className={`size-2 rounded-full ${status === "tracking" ? "bg-[color:var(--color-led)] shadow-[0_0_8px_var(--color-led)]" : "bg-[color:var(--color-caret)]"}`} />
        <span>{STATUS_TEXT[status]}</span>
        <button onClick={onStop} className="rounded-md border border-[color:var(--color-hairline)] px-2.5 py-1 text-[13px] font-semibold hover:border-[color:var(--color-ink)]/30">
          Turn camera off
        </button>
      </div>
      {status === "tracking" && (
        <div className="relative h-1.5 w-48 rounded-full bg-[color:var(--color-hairline)]" aria-hidden="true">
          <div className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--color-cobalt)] transition-[left] duration-100"
               style={{ left: `${50 - lean * 45}%` }} />
        </div>
      )}
    </div>
  );
}
