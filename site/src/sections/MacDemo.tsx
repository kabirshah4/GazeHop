import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/**
 * Hero illustration: a two-display Mac desktop where typing follows the user's gaze.
 * Pure function of a looping clock, so it is smooth, deterministic and cheap.
 * Two physical devices (Studio Display + MacBook) side by side at every width. Sizes use
 * container units (--u = 1% of the stage), so it scales like an image.
 */
const LOOP = 11500;
const NOTE_1 = "Ship GazeHop on Friday.";
const NOTE_2 = " Then tell the team.";
const REPLY = "sounds good, sending it now";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(seg(t, a, b) * s.length));

function useLoop(enabled: boolean) {
  const [t, setT] = useState(6200);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => { setT((now - start) % LOOP); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
  return t;
}

export function MacDemo() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  // Only tick while on screen: the loop re-renders every frame, so it stops when scrolled away
  // and replays the story from the top when you come back.
  const visible = useInView(ref, { margin: "100px" });
  const t = useLoop(!reduce && visible);

  // Gaze: 0 = left display, 1 = right display
  const gaze = ease(seg(t, 3200, 3450)) - ease(seg(t, 7800, 8050));
  const dwell = t < 7800 ? seg(t, 3450, 3700) * (t < 3700 ? 1 : 0) : seg(t, 8050, 8300) * (t < 8300 ? 1 : 0);
  const focus: "L" | "R" = t >= 3700 && t < 8300 ? "R" : "L";
  const looking = gaze > 0.5 ? "R" : "L";
  const p = ease(seg(t, 3720, 4150)) - ease(seg(t, 8320, 8750));

  const note = typed(NOTE_1, t, 500, 2900) + typed(NOTE_2, t, 8900, 10600);
  const sent = t >= 6900;
  const reply = sent ? "" : typed(REPLY, t, 4300, 6600);
  const fade = 1 - seg(t, 11000, 11500); // soft reset at the end of the loop

  return (
    <figure ref={ref} className="mx-auto w-full max-w-[1040px]" aria-label="Illustration: typing in Notes on the left display; the user looks at the right display, and after a quarter of a second the keyboard focus moves to Messages, where the typing continues.">
      <div className="mac-stage relative [container-type:inline-size]" style={{ opacity: fade < 1 ? 0.35 + fade * 0.65 : 1 }}>
        <div className="mac-frame relative pt-[calc(var(--hu)*4.5)]">
          {/* Soft halo so the desk glows out of the sky */}
          <div className="pointer-events-none absolute inset-x-[8%] bottom-[6%] top-[18%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,.75),rgba(255,255,255,0))] blur-[calc(var(--u)*3)]" aria-hidden="true" />

          <div className="relative flex items-center justify-center gap-[calc(var(--u)*3)]">
            {/* Studio Display */}
            <div className="flex w-[57%] flex-col items-center">
              <Bezel looking={looking === "L"} className="w-full rounded-[calc(var(--u)*1.3)] p-[calc(var(--u)*0.7)]">
                <Display side="L" focused={focus === "L"} app="Notes" aspect="aspect-[16/9]">
                  <Window title="Notes" focused={focus === "L"} className="left-[8%] top-[15%] w-[66%] h-[62%]">
                    <p className="text-[calc(var(--u)*1.15)] font-semibold text-[color:var(--color-ink-3)]">Friday</p>
                    <p className="mt-[calc(var(--u)*0.7)] text-[calc(var(--u)*1.6)] font-medium leading-snug tracking-[-0.02em]">
                      {note}{focus === "L" && <Caret />}
                    </p>
                  </Window>
                  {focus === "L" && <Pointer side="L" q={1 - p} />}
                </Display>
              </Bezel>
              <div className="h-[calc(var(--u)*5)] w-[14%] bg-[linear-gradient(90deg,#C9CBD0,#EEEFF2_45%,#B9BCC2)] [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" aria-hidden="true" />
              <div className="h-[calc(var(--u)*0.7)] w-[30%] rounded-[calc(var(--u)*0.4)] bg-[linear-gradient(#E4E5E8,#B9BCC2)] shadow-[0_calc(var(--u)*0.6)_calc(var(--u)*1.2)_rgba(20,30,60,.25)]" aria-hidden="true" />
            </div>

            {/* MacBook */}
            <div className="flex w-[39%] flex-col items-center">
              <Bezel looking={looking === "R"} className="w-full rounded-t-[calc(var(--u)*1.2)] rounded-b-[calc(var(--u)*0.3)] p-[calc(var(--u)*0.6)] pt-[calc(var(--u)*0.8)]">
                <span className="absolute left-1/2 top-0 h-[calc(var(--u)*0.55)] w-[14%] -translate-x-1/2 rounded-b-[calc(var(--u)*0.35)] bg-[#0b0b0c]" aria-hidden="true" />
                <Display side="R" focused={focus === "R"} app="Messages" aspect="aspect-[16/10]">
                  <Window title="Alex" focused={focus === "R"} className="left-[9%] top-[14%] w-[82%] h-[66%]">
                    <div className="flex h-full flex-col justify-end gap-[calc(var(--u)*0.5)]">
                      <Bubble>is the build ready?</Bubble>
                      {sent && <Bubble me>{REPLY}</Bubble>}
                      <div className="mt-[calc(var(--u)*0.2)] rounded-full border border-black/10 px-[calc(var(--u)*0.9)] py-[calc(var(--u)*0.5)] text-[calc(var(--u)*1.15)]">
                        {reply ? reply : <span className="text-black/30">{focus === "R" ? "" : "iMessage"}</span>}
                        {focus === "R" && <Caret />}
                      </div>
                    </div>
                  </Window>
                  {focus === "R" && <Pointer side="R" q={p} />}
                </Display>
              </Bezel>
              <div className="relative h-[calc(var(--u)*1.1)] w-[112%] rounded-b-[calc(var(--u)*1)] rounded-t-[calc(var(--u)*0.2)] bg-[linear-gradient(#E9EAED,#BFC2C8)] shadow-[0_calc(var(--u)*0.7)_calc(var(--u)*1.4)_rgba(20,30,60,.25)]" aria-hidden="true">
                <span className="absolute left-1/2 top-0 h-[40%] w-[16%] -translate-x-1/2 rounded-b-[calc(var(--u)*0.5)] bg-black/10" />
              </div>
            </div>
          </div>

          {/* GazeHop HUD */}
          <div className="glass-dark absolute left-[var(--hud-x)] top-0 z-20 flex -translate-x-1/2 items-center gap-[calc(var(--hu)*0.9)] rounded-full py-[calc(var(--hu)*0.7)] pl-[calc(var(--hu)*0.8)] pr-[calc(var(--hu)*1.4)] text-[calc(var(--hu)*1.15)] shadow-[0_12px_30px_-10px_rgba(0,0,0,.45)]">
            <HopGlyph />
            <span className="whitespace-nowrap font-medium tracking-[-0.01em]">
              Looking at <span className="text-white/65">{looking === "L" ? "Studio Display" : "Built-in Display"}</span>
            </span>
            <span className="h-[calc(var(--hu)*0.35)] w-[calc(var(--hu)*4)] overflow-hidden rounded-full bg-white/15" aria-hidden="true">
              <span className="block h-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${dwell})` }} />
            </span>
          </div>
        </div>
      </div>
      <figcaption className="mt-5 text-center text-[13px] text-[color:var(--color-ink-3)]">
        Illustration of GazeHop at work. It runs quietly in your menu bar; the HUD here just shows what it sees.
      </figcaption>
    </figure>
  );
}

function Bezel({ looking, className, children }: { looking: boolean; className: string; children: React.ReactNode }) {
  return (
    <div className={`relative bg-[#141416] transition-shadow duration-300 ${className} ${looking ? "shadow-[0_0_0_calc(var(--u)*0.3)_rgba(0,113,227,.55),0_24px_48px_-20px_rgba(20,30,60,.5)]" : "shadow-[0_0_0_1px_rgba(0,0,0,.4),0_24px_48px_-20px_rgba(20,30,60,.45)]"}`}>
      {children}
    </div>
  );
}

function Display({ side, focused, app, aspect, children }: { side: "L" | "R"; focused: boolean; app: string; aspect: string; children: React.ReactNode }) {
  return (
    <div className={`relative ${aspect} overflow-hidden rounded-[calc(var(--u)*0.5)]`}
         style={{ background: WALLPAPER, backgroundSize: "200% 100%", backgroundPosition: side === "L" ? "0% 50%" : "100% 50%" }}>
      {/* Menu bar */}
      <div className="glass-light absolute inset-x-0 top-0 z-10 flex h-[calc(var(--u)*1.8)] items-center gap-[calc(var(--u)*1.1)] px-[calc(var(--u)*1)] text-[calc(var(--u)*0.85)] font-medium !bg-white/55">
        <span className="font-semibold">{focused ? app : side === "L" ? "Notes" : "Messages"}</span>
        <span className="text-black/60">File</span><span className="text-black/60">Edit</span><span className="text-black/60">View</span>
        <span className="ml-auto flex items-center gap-[calc(var(--u)*0.9)]">
          <MenuHop />
          <span>Fri 9:41</span>
        </span>
      </div>
      {children}
      {/* Dock */}
      <div className="glass-light absolute bottom-[3%] left-1/2 z-10 flex -translate-x-1/2 gap-[calc(var(--u)*0.45)] rounded-[calc(var(--u)*0.9)] p-[calc(var(--u)*0.4)] !bg-white/45 shadow-[0_0_0_.5px_rgba(255,255,255,.6)]" aria-hidden="true">
        {DOCK.map((g, i) => <span key={i} className="size-[calc(var(--u)*1.7)] rounded-[calc(var(--u)*0.45)]" style={{ background: g }} />)}
      </div>
    </div>
  );
}

const DOCK = [
  "linear-gradient(#5AC8FA,#0A84FF)", "linear-gradient(#FFD60A,#FF9F0A)", "linear-gradient(#64D2FF,#30B0C7)",
  "linear-gradient(#34C759,#248A3D)", "linear-gradient(#BF5AF2,#8944AB)", "linear-gradient(#F2F2F7,#C7C7CC)",
];

function Window({ title, focused, className, children }: { title: string; focused: boolean; className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute flex flex-col overflow-hidden rounded-[calc(var(--u)*0.9)] bg-white/95 transition-[box-shadow,opacity] duration-300 ${className} ${focused ? "opacity-100 shadow-[0_0_0_.5px_rgba(0,0,0,.18),0_22px_48px_-14px_rgba(0,0,0,.4)]" : "opacity-90 shadow-[0_0_0_.5px_rgba(0,0,0,.12),0_10px_22px_-12px_rgba(0,0,0,.25)]"}`}>
      <div className="flex items-center gap-[calc(var(--u)*0.5)] border-b border-black/[.06] px-[calc(var(--u)*0.9)] py-[calc(var(--u)*0.65)]">
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span key={c} className="size-[calc(var(--u)*0.85)] rounded-full transition-colors duration-300" style={{ background: focused ? c : "#D9D9DC" }} />
        ))}
        <span className="mx-auto pr-[calc(var(--u)*3)] text-[calc(var(--u)*1)] font-semibold text-black/70">{title}</span>
      </div>
      <div className="flex-1 p-[calc(var(--u)*1.4)]">{children}</div>
    </div>
  );
}

function Bubble({ children, me = false }: { children: React.ReactNode; me?: boolean }) {
  return (
    <p className={`w-fit max-w-[85%] rounded-[calc(var(--u)*1.2)] px-[calc(var(--u)*1)] py-[calc(var(--u)*0.55)] text-[calc(var(--u)*1.25)] leading-snug ${me ? "ml-auto bg-[#0A84FF] text-white" : "bg-[#E9E9EB] text-[color:var(--color-ink)]"}`}>
      {children}
    </p>
  );
}

function Caret() {
  return <span className="caret" style={{ height: "1em" }} />;
}

function Pointer({ side, q }: { side: "L" | "R"; q: number }) {
  // GazeHop brings the pointer along: it enters from the edge facing the other display
  // and glides to the newly focused window (q: 0 = just arrived, 1 = settled).
  const left = side === "R" ? 4 + q * 42 : 94 - q * 48;
  return (
    <svg className="absolute z-10 h-[calc(var(--u)*2.2)] w-auto drop-shadow" style={{ left: `${left}%`, top: `${60 - Math.sin(q * Math.PI) * 5}%` }} viewBox="0 0 17 24" aria-hidden="true">
      <path d="M1 1v19l5-5 3.5 8 3-1.3-3.5-7.7H16z" fill="#fff" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/** GazeHop's small mark: the logo's monitor with the caret (the hop arc is left off at this size). */
function HopGlyph() {
  return (
    <svg viewBox="0 0 28 18" className="h-[calc(var(--hu)*1.5)] w-auto" aria-hidden="true">
      <HopPaths ink="#fff" />
    </svg>
  );
}

function MenuHop() {
  return (
    <svg viewBox="0 0 28 18" className="h-[calc(var(--u)*1)] w-auto" aria-hidden="true">
      <HopPaths ink="#1d1d1f" />
    </svg>
  );
}

function HopPaths({ ink }: { ink: string }) {
  return (
    <>
      <rect x="5.2" y="1.6" width="17.6" height="11.2" rx="2.2" fill="none" stroke={ink} strokeWidth="1.6" />
      <rect x="13.2" y="4.2" width="1.6" height="6" rx=".8" fill={ink} />
      <path d="M13 12.8h2l.6 2.2h-3.2z" fill={ink} /><rect x="10.2" y="14.9" width="7.6" height="1.5" rx=".75" fill={ink} />
    </>
  );
}

/* Our own wallpaper: soft dawn bands, spanning both displays (each shows one half). */
const WALLPAPER = [
  "radial-gradient(60% 80% at 22% 110%, rgba(255,186,150,.95), transparent 60%)",
  "radial-gradient(55% 70% at 78% 105%, rgba(255,160,200,.75), transparent 60%)",
  "radial-gradient(70% 60% at 50% 0%, rgba(120,160,255,.9), transparent 70%)",
  "linear-gradient(180deg, #8FB0FF 0%, #B8B5F5 45%, #F4C3C9 80%, #FFD9C2 100%)",
].join(",");
