import { BASE, DOWNLOAD, ISSUES, LICENSE, REPO } from "../lib/links";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href={BASE} className={`flex items-center gap-2.5 ${className}`} aria-label="GazeHop home">
      <img src={`${BASE}icon.png`} alt="" width={32} height={32} className="size-8" />
      <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.03em]">GazeHop</span>
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

export function DownloadButton({ className = "", label = "Download for macOS" }: { className?: string; label?: string }) {
  return (
    <a
      href={DOWNLOAD}
      className={`inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[color:var(--color-cobalt)] px-5 py-3 font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,.25)_inset,0_8px_24px_-8px_rgba(51,67,232,.7)] transition hover:bg-[color:var(--color-cobalt-deep)] active:translate-y-px ${className}`}
    >
      <AppleGlyph className="h-[18px] w-auto -mt-0.5" />
      {label}
    </a>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-[color:var(--color-paper)]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[color:var(--color-paper)]/70">
      <nav className="wrap flex h-16 items-center justify-between" aria-label="Main">
        <Logo />
        <div className="flex items-center gap-1 text-[15px] md:gap-2">
          <a href={`${BASE}#how`} className="hidden rounded-md px-3 py-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] md:block">How it works</a>
          <a href={`${BASE}#privacy`} className="hidden rounded-md px-3 py-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] md:block">Privacy</a>
          <a href={`${BASE}#faq`} className="hidden rounded-md px-3 py-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] md:block">FAQ</a>
          <a href={REPO} className="rounded-md px-3 py-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]">GitHub</a>
          <a href={DOWNLOAD} className="hidden rounded-[9px] bg-[color:var(--color-ink)] px-3.5 py-2 font-semibold text-white hover:bg-[color:var(--color-ink-2)] sm:block">Download</a>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-hairline)] pb-28 pt-12 md:pb-12">
      <div className="wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-[15px] text-[color:var(--color-muted)]">
            A free, open-source macOS menu bar app. Look at a screen, and your keyboard follows.
          </p>
        </div>
        <FooterCol title="Product" links={[["Download", DOWNLOAD], ["How it works", `${BASE}#how`], ["FAQ", `${BASE}#faq`]]} />
        <FooterCol title="Open source" links={[["Source code", REPO], ["Report a problem", ISSUES], ["MIT license", LICENSE]]} />
        <FooterCol title="Legal" links={[["Privacy", `${BASE}privacy`], ["Terms", `${BASE}terms`]]} />
      </div>
      <div className="wrap mt-12 flex flex-col gap-2 text-[13px] text-[color:var(--color-muted)] md:flex-row md:justify-between">
        <p>Built by <a className="underline decoration-[color:var(--color-hairline)] underline-offset-4 hover:text-[color:var(--color-ink)]" href="https://github.com/kabirshah4">@kabirshah4</a>. Contact: <a className="underline decoration-[color:var(--color-hairline)] underline-offset-4 hover:text-[color:var(--color-ink)]" href={ISSUES}>GitHub issues</a>.</p>
        <p>Not affiliated with Apple. macOS is a trademark of Apple Inc.</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      <ul className="space-y-2 text-[15px]">
        {links.map(([label, href]) => (
          <li key={label}><a href={href} className="text-[color:var(--color-ink)]/80 hover:text-[color:var(--color-cobalt)]">{label}</a></li>
        ))}
      </ul>
    </div>
  );
}

/** Phones can't run GazeHop, so the sticky bar points people to the download for their Mac. */
export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-hairline)] bg-[color:var(--color-paper)]/90 p-3 backdrop-blur-md md:hidden">
      <DownloadButton className="w-full" label="Get GazeHop for your Mac" />
    </div>
  );
}
