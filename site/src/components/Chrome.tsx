import { BASE, DOWNLOAD, ISSUES, LICENSE, REPO } from "../lib/links";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return <img src={`${BASE}logo-tight.svg`} alt="" width={26} height={26} className={className} />;
}

export function Logo() {
  return (
    <a href={BASE} className="flex items-center gap-2" aria-label="GazeHop home">
      <LogoMark className="size-[26px] rounded-[6px]" />
      <span className="font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-[-0.02em]">GazeHop</span>
    </a>
  );
}

export function DownloadGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />
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

export function DownloadButton({ label = "Download for Mac", className = "" }: { label?: string; className?: string }) {
  return (
    <a href={DOWNLOAD} className={`btn btn-blue ${className}`}>
      <DownloadGlyph className="size-[17px]" />
      {label}
    </a>
  );
}

export function SourceLink({ label = "View the source" }: { label?: string }) {
  return (
    <a href={REPO} className="btn btn-ghost">
      {label} <span aria-hidden="true">›</span>
    </a>
  );
}

export function Nav() {
  return (
    <header className="glass-light sticky top-0 z-40 shadow-[0_1px_0_rgba(0,0,0,.06)]">
      <nav className="wrap flex h-[52px] items-center justify-between" aria-label="Main">
        <Logo />
        <div className="flex items-center gap-1 text-[14px] text-[color:var(--color-ink-2)]">
          {[["How it works", "#how"], ["Privacy", "#privacy"], ["Install", "#install"], ["FAQ", "#faq"]].map(([l, h]) => (
            <a key={h} href={`${BASE}${h}`} className="hidden rounded-full px-3 py-1.5 transition-colors hover:text-[color:var(--color-ink)] md:block">{l}</a>
          ))}
          <a href={REPO} className="rounded-full p-2 transition-colors hover:text-[color:var(--color-ink)]" aria-label="GazeHop on GitHub"><GitHubGlyph className="size-[18px]" /></a>
          <a href={DOWNLOAD} className="btn btn-blue ml-1 !px-4 !py-[6px] !text-[14px]">Download</a>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-line)] bg-[color:var(--color-ground)] pb-28 pt-12 text-[13px] text-[color:var(--color-ink-3)] md:pb-12">
      <div className="wrap grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs">A free, open-source menu bar app for Macs with more than one screen.</p>
        </div>
        <Col title="Product" links={[["Download", DOWNLOAD], ["How it works", `${BASE}#how`], ["Install guide", `${BASE}#install`], ["FAQ", `${BASE}#faq`]]} />
        <Col title="Open source" links={[["Source code", REPO], ["Report a problem", ISSUES], ["MIT license", LICENSE]]} />
        <Col title="Legal" links={[["Privacy", `${BASE}privacy`], ["Terms", `${BASE}terms`]]} />
      </div>
      <div className="wrap mt-10 flex flex-col gap-2 border-t border-[color:var(--color-line)] pt-5 md:flex-row md:justify-between">
        <p>Built by <a className="text-[color:var(--color-ink-2)] hover:underline" href="https://github.com/kabirshah4">@kabirshah4</a>. Questions? <a className="text-[color:var(--color-ink-2)] hover:underline" href={ISSUES}>Open an issue</a>.</p>
        <p>Not affiliated with Apple. Mac and macOS are trademarks of Apple Inc.</p>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-3 font-semibold text-[color:var(--color-ink)]">{title}</p>
      <ul className="space-y-2">
        {links.map(([l, h]) => <li key={l}><a href={h} className="hover:text-[color:var(--color-ink)] hover:underline">{l}</a></li>)}
      </ul>
    </div>
  );
}

export function StickyMobileCTA() {
  return (
    <div className="glass-light fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-line)] p-3 md:hidden">
      <DownloadButton label="Get GazeHop for your Mac" className="w-full" />
    </div>
  );
}
