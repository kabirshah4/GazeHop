import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { Footer, Nav } from "./Chrome";

/** Shared layout for the plain text pages (privacy, terms). */
export function renderDoc(eyebrow: string, title: string, updated: string, body: React.ReactNode) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Nav />
      <main className="wrap max-w-[760px] py-16 md:py-24">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="display mb-3 text-[clamp(30px,4.5vw,48px)] font-semibold">{title}</h1>
        <p className="mb-12 text-[14px] text-[color:var(--color-muted)]">Last updated {updated}</p>
        <div className="doc space-y-5 text-[17px] leading-relaxed [&_a]:text-[color:var(--color-cobalt)] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:text-[22px] [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
          {body}
        </div>
      </main>
      <Footer />
    </StrictMode>,
  );
}
