/**
 * The 15-second demo, as a pure function of time so it can be rendered frame by frame.
 * 1920x1080. Not shipped with the site; scripts/record-demo.mjs turns it into public/demo.mp4.
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(seg(t, a, b) * s.length));

const LEFT_1 = "Plan: ship GazeHop 0.2 on Friday.";
const LEFT_2 = " Then tell the team.";
const REPLY = "sounds good, sending it now";

// Screen rectangles (inner display area)
const L = { x: 80, y: 250, w: 860, h: 560 };
const R = { x: 980, y: 250, w: 860, h: 560 };

export function DemoScene({ t }: { t: number }) {
  // Gaze: -1 = left screen, +1 = right screen
  const toRight = ease(seg(t, 4000, 4160));
  const toLeft = ease(seg(t, 8800, 8960));
  const gaze = -1 + 2 * toRight - 2 * toLeft;
  const dwell = t < 8800 ? seg(t, 4160, 4410) * (t < 4410 ? 1 : 0) : seg(t, 8960, 9210) * (t < 9210 ? 1 : 0);
  const focus: "L" | "R" = t >= 4410 && t < 9210 ? "R" : "L";

  // Pointer follows focus
  const lc = { x: L.x + 420, y: L.y + 330 }, rc = { x: R.x + 430, y: R.y + 340 };
  const p1 = ease(seg(t, 4420, 4820)), p2 = ease(seg(t, 9220, 9620));
  const k = p1 - p2;
  const pointer = { x: lc.x + (rc.x - lc.x) * k, y: lc.y + (rc.y - lc.y) * k - Math.sin(k * Math.PI) * 60 };

  const left = typed(LEFT_1, t, 600, 3600) + typed(LEFT_2, t, 9700, 11300);
  const sent = t >= 7900;
  const reply = sent ? "" : typed(REPLY, t, 4900, 7500);

  const caption =
    t < 3950 ? "You're typing on the left screen." :
    t < 4410 ? "Look at the right screen." :
    t < 8700 ? "After 250 ms, focus moves there. Keep typing." :
    t < 12000 ? "Look back. No click needed." : "";
  const end = ease(seg(t, 12200, 12900));

  return (
    <div className="relative h-[1080px] w-[1920px] overflow-hidden" style={{ background: "radial-gradient(90% 70% at 50% 0%, #142033 0%, #0B0F19 60%)", fontFamily: "var(--font-sans)" }}>
      {/* Webcam with tracking light */}
      <div className="absolute left-1/2 top-[176px] flex -translate-x-1/2 items-center gap-3 rounded-[14px] bg-[#05070c] px-5 py-2.5 shadow-xl ring-1 ring-white/10">
        <span className="size-5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#3b4a7a,#05070c_60%)] ring-1 ring-white/15" />
        <span className="size-2.5 rounded-full bg-[#8FA8C8] shadow-[0_0_12px_#8FA8C8]" />
      </div>

      <Screen r={L} focused={focus === "L"} menuBar>
        <Window title="Notes" focused={focus === "L"}>
          <p className="text-[40px] font-semibold tracking-tight text-white/90">Friday</p>
          <p className="mt-5 text-[36px] leading-snug text-white/85">{left}{focus === "L" && <Caret t={t} />}</p>
        </Window>
      </Screen>

      <Screen r={R} focused={focus === "R"}>
        <Window title="Messages" focused={focus === "R"}>
          <div className="flex h-full flex-col justify-end gap-3">
            <Bubble>is the build ready?</Bubble>
            {sent && <Bubble me>{REPLY}</Bubble>}
            <div className="mt-2 rounded-full border border-white/15 px-6 py-4 text-[32px] text-white/85">
              {reply || <span className="text-white/30">{focus === "R" ? "" : "Message"}</span>}{focus === "R" && <Caret t={t} />}
            </div>
          </div>
        </Window>
      </Screen>

      {/* Gaze indicator */}
      <div className="absolute left-1/2 top-[22px] flex -translate-x-1/2 flex-col items-center gap-2">
        <svg viewBox="0 0 200 110" width="150" height="82">
          <path d="M10 55 C 55 -5, 145 -5, 190 55 C 145 115, 55 115, 10 55 Z" fill="#0B0F19" stroke="#F5F7FA" strokeWidth="9" strokeLinejoin="round" />
          <g transform={`translate(${gaze * 34} 0)`}>
            <circle cx="100" cy="55" r="30" fill="#8FA8C8" />
            <circle cx="100" cy="55" r="13" fill="#0B0F19" />
            <circle cx="93" cy="47" r="4.5" fill="#FFFFFF" opacity=".85" />
          </g>
        </svg>
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
          <div className="h-full origin-left rounded-full bg-[#8FA8C8]" style={{ transform: `scaleX(${dwell})` }} />
        </div>
      </div>

      {/* Pointer */}
      <svg className="absolute" style={{ left: pointer.x, top: pointer.y }} width="34" height="48" viewBox="0 0 17 24" aria-hidden="true">
        <path d="M1 1v19l5-5 3.5 8 3-1.3-3.5-7.7H16z" fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>

      {/* Caption */}
      <div className="absolute bottom-[34px] left-1/2 -translate-x-1/2 transition-none">
        {caption && (
          <p className="rounded-[18px] border border-white/10 bg-black/55 px-8 py-4 text-[32px] font-semibold tracking-tight text-white backdrop-blur">
            {caption}
          </p>
        )}
      </div>

      {/* End card */}
      {end > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F19]" style={{ opacity: end }}>
          <img src="/logo-mark.svg" width={200} height={200} alt="" />
          <p className="mt-6 text-[84px] font-bold tracking-[-0.045em] text-white">Look at a screen,</p>
          <p className="-mt-3 text-[84px] font-bold tracking-[-0.045em] text-white">and your keyboard follows.</p>
          <p className="mt-8 flex items-center gap-3 text-[30px] text-[#A3ACBD]"><span className="size-3 rounded-full bg-[#8FA8C8]" /> GazeHop · free and open source for macOS</p>
        </div>
      )}
    </div>
  );
}

function Screen({ r, focused, menuBar = false, children }: { r: { x: number; y: number; w: number; h: number }; focused: boolean; menuBar?: boolean; children: React.ReactNode }) {
  return (
    <>
      <div className="absolute rounded-[22px] bg-[#05070c] p-[14px] shadow-2xl ring-1 ring-white/10" style={{ left: r.x - 14, top: r.y - 14, width: r.w + 28, height: r.h + 28 }}>
        <div className="relative h-full w-full overflow-hidden rounded-[10px]" style={{ background: "linear-gradient(160deg,#1b2540,#0f1626 70%)" }}>
          {menuBar && (
            <div className="flex h-9 items-center gap-6 bg-black/35 px-4 text-[17px] text-white/85 backdrop-blur">
              <span className="font-semibold">Notes</span><span className="text-white/60">File</span><span className="text-white/60">Edit</span>
              <span className="ml-auto flex items-center gap-5">
                <svg viewBox="0 0 20 16" width="24" height="19"><path d="M1.5 8 C5.5 14.6 14.5 14.6 18.5 8 C14.5 1.4 5.5 1.4 1.5 8 Z" fill="none" stroke="#fff" strokeWidth="1.6" /><circle cx="10" cy="8" r="3.4" fill="#fff" /></svg>
                <span>Fri 9:41</span>
              </span>
            </div>
          )}
          <div className={`absolute inset-x-10 bottom-10 ${menuBar ? "top-20" : "top-12"}`}>{children}</div>
        </div>
      </div>
      <div className="absolute h-[70px] w-[90px] bg-gradient-to-b from-[#1a1f2b] to-[#0d1018]" style={{ left: r.x + r.w / 2 - 45, top: r.y + r.h + 14 }} />
      <div className="absolute h-[14px] w-[260px] rounded-[7px] bg-[#1a1f2b]" style={{ left: r.x + r.w / 2 - 130, top: r.y + r.h + 82 }} />
      {focused && <div className="pointer-events-none absolute rounded-[24px] ring-4 ring-[#8FA8C8]/70 shadow-[0_0_80px_rgba(143,168,200,.35)]" style={{ left: r.x - 16, top: r.y - 16, width: r.w + 32, height: r.h + 32 }} />}
    </>
  );
}

function Window({ title, focused, children }: { title: string; focused: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex h-full flex-col overflow-hidden rounded-[16px] border bg-[#141a29]/95 shadow-2xl ${focused ? "border-white/20" : "border-white/8 opacity-70"}`}>
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-3.5">
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} className="size-3.5 rounded-full" style={{ background: focused ? c : "rgba(255,255,255,.18)" }} />)}
        <span className="ml-3 text-[22px] font-medium text-white/75">{title}</span>
        {focused && <span className="ml-auto rounded-md bg-[#8FA8C8]/15 px-3 py-1 font-mono text-[16px] uppercase tracking-wider text-[#8FA8C8]">Focused</span>}
      </div>
      <div className="flex-1 p-7">{children}</div>
    </div>
  );
}

function Bubble({ children, me = false }: { children: React.ReactNode; me?: boolean }) {
  return (
    <p className={`w-fit max-w-[80%] rounded-[22px] px-6 py-3.5 text-[32px] ${me ? "ml-auto rounded-br-md bg-[#8FA8C8] text-white" : "rounded-bl-md bg-white/10 text-white/90"}`}>{children}</p>
  );
}

function Caret({ t }: { t: number }) {
  return <span className="ml-0.5 inline-block h-[1em] w-[3px] translate-y-[3px] rounded bg-[#8FA8C8]" style={{ opacity: Math.floor(t / 530) % 2 ? 0 : 1 }} />;
}
