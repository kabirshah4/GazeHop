import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { Footer, Nav } from "./Chrome";
import { SmoothScroll } from "./SmoothScroll";

/** Shared layout for the plain text pages (privacy, terms). */
export function renderDoc(eyebrow: string, title: string, updated: string, body: React.ReactNode) {
  void eyebrow;
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <SmoothScroll />
      <Nav />
      <main className="wrap max-w-[760px] py-16 md:py-24">
        <h1 className="t-h2 mb-3">{title}</h1>
        <p className="mb-12 text-[14px] text-[color:var(--color-ink-3)]">Last updated {updated}</p>
        <div className="space-y-5 leading-relaxed text-[color:var(--color-ink-2)] [&_a]:text-[color:var(--color-blue)] [&_a:hover]:underline [&_b]:font-semibold [&_b]:text-[color:var(--color-ink)] [&_code]:rounded-md [&_code]:bg-black/[.05] [&_code]:px-1.5 [&_code]:font-[family-name:var(--font-mono)] [&_code]:text-[.9em] [&_h2]:mt-10 [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-[color:var(--color-ink)] [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
          {body}
        </div>
      </main>
      <Footer />
    </StrictMode>,
  );
}
