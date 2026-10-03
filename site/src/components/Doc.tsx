import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { Footer, Nav } from "./Chrome";

/** Shared layout for the plain text pages (privacy, terms). */
export function renderDoc(eyebrow: string, title: string, updated: string, body: React.ReactNode) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Nav />
      <main className="wrap max-w-[780px] py-16 md:py-24">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="t-h2 mb-3">{title}</h1>
        <p className="mb-12 text-[14px] text-[color:var(--color-fg-3)]">Last updated {updated}</p>
        <div className="space-y-5 leading-relaxed text-[color:var(--color-fg-2)] [&_a]:text-[color:var(--color-cyan)] [&_a]:underline [&_a]:underline-offset-4 [&_b]:text-white [&_code]:rounded [&_code]:bg-white/[.06] [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-[.9em] [&_h2]:mt-10 [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
          {body}
        </div>
      </main>
      <Footer />
    </StrictMode>,
  );
}
