import { BASE, DOWNLOAD, ISSUES, LICENSE, REPO } from "../lib/links";
import { ShimmerLink } from "./magicui/shimmer-link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return <img src={`${BASE}logo-mark.svg`} alt="" width={32} height={32} className={className} />;
}

export function Logo() {
  return (
    <a href={BASE} className="flex items-center gap-2.5" aria-label="GazeHop home">
      <LogoMark className="size-8 -m-0.5" />
      <span className="text-[17px] font-semibold tracking-[-0.02em]">GazeHop</span>
    </a>
  );
}

export function AppleGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 17 20" className={className} aria-hidden="true" fill="currentColor">
      <path d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9C3.6 4.8 1.9 5.8 1 7.4c-1.9 3.3-.5 8.1 1.3 10.8.9 1.3 1.9 2.7 3.3 2.7 1.3-.1 1.8-.9 3.4-.9 1.6 0 2 .9 3.4.8 1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1 0-2.9-1.1-2.9-4.6zM11.5 2.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.5-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.4z" />
    </svg>
  );
}

export function GitHubGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function DownloadButton({ label = "Download for macOS", className = "" }: { label?: string; className?: string }) {
  return (
    <ShimmerLink href={DOWNLOAD} className={className}>
      <AppleGlyph className="-mt-0.5 h-[18px] w-auto" />
      {label}
    </ShimmerLink>
  );
}

export function GitHubButton({ label = "View source on GitHub" }: { label?: string }) {
  return (
    <a href={REPO} className="inline-flex items-center justify-center gap-2.5 rounded-[12px] border border-[color:var(--color-line-2)] bg-white/[.03] px-6 py-3.5 font-semibold text-[color:var(--color-fg)] transition hover:border-white/30 hover:bg-white/[.06]">
      <GitHubGlyph className="size-[18px]" />
      {label}
    </a>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]/70 backdrop-blur-xl">
      <nav className="wrap flex h-16 items-center justify-between" aria-label="Main">
        <Logo />
        <div className="flex items-center gap-1 text-[15px]">
          {[["How it works", "#how"], ["Privacy", "#privacy"], ["Install", "#install"], ["FAQ", "#faq"]].map(([l, h]) => (
            <a key={h} href={`${BASE}${h}`} className="hidden rounded-lg px-3 py-2 text-[color:var(--color-fg-2)] hover:text-white md:block">{l}</a>
          ))}
          <a href={REPO} className="rounded-lg px-3 py-2 text-[color:var(--color-fg-2)] hover:text-white" aria-label="GitHub"><GitHubGlyph className="size-5" /></a>
          <a href={DOWNLOAD} className="ml-1 hidden rounded-[10px] bg-white px-3.5 py-2 font-semibold text-[color:var(--color-bg)] hover:bg-white/90 sm:block">Download</a>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[color:var(--color-line)] pb-28 pt-14 md:pb-14">
      <div className="wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-[15px] text-[color:var(--color-fg-2)]">A free, open-source macOS menu bar app. Look at a screen, and your keyboard follows.</p>
        </div>
        <Col title="Product" links={[["Download", DOWNLOAD], ["How it works", `${BASE}#how`], ["Install guide", `${BASE}#install`], ["FAQ", `${BASE}#faq`]]} />
        <Col title="Open source" links={[["Source code", REPO], ["Report a problem", ISSUES], ["MIT license", LICENSE]]} />
        <Col title="Legal" links={[["Privacy", `${BASE}privacy`], ["Terms", `${BASE}terms`]]} />
      </div>
      <div className="wrap mt-12 flex flex-col gap-2 text-[13px] text-[color:var(--color-fg-3)] md:flex-row md:justify-between">
        <p>Built by <a className="underline decoration-white/20 underline-offset-4 hover:text-white" href="https://github.com/kabirshah4">@kabirshah4</a>. Contact: <a className="underline decoration-white/20 underline-offset-4 hover:text-white" href={ISSUES}>GitHub issues</a>.</p>
        <p>Not affiliated with Apple. macOS is a trademark of Apple Inc.</p>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      <ul className="space-y-2 text-[15px]">
        {links.map(([l, h]) => <li key={l}><a href={h} className="text-[color:var(--color-fg-2)] hover:text-white">{l}</a></li>)}
      </ul>
    </div>
  );
}

export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-line)] bg-[color:var(--color-bg)]/85 p-3 backdrop-blur-xl md:hidden">
      <DownloadButton label="Get GazeHop for your Mac" className="w-full" />
    </div>
  );
}
