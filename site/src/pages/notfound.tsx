import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { DownloadButton, Footer, LogoMark, Nav } from "../components/Chrome";
import { BASE } from "../lib/links";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Nav />
    <main className="wrap flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <LogoMark className="mb-8 size-24" />
      <h1 className="t-h2 mb-4">Nothing to look at here.</h1>
      <p className="mb-9 max-w-md text-[17px] text-[color:var(--color-ink-2)]">This page doesn't exist. It may have moved, or the link has a typo.</p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <DownloadButton />
        <a href={BASE} className="btn btn-ghost">Go to the home page <span aria-hidden="true">›</span></a>
      </div>
    </main>
    <Footer />
  </StrictMode>,
);
