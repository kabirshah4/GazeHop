import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { DownloadButton, Footer, Nav } from "../components/Chrome";
import { FlyingEye } from "../components/FlyingEye";
import { BASE } from "../lib/links";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FlyingEye />
    <Nav />
    <main className="wrap relative z-10 flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <div data-eye="pointer" className="mb-8 size-32" aria-hidden="true" />
      <p className="eyebrow mb-4">404</p>
      <h1 className="t-h2 mb-4">Nothing to look at here<span className="caret" aria-hidden="true" /></h1>
      <p className="mb-9 max-w-md text-[color:var(--color-fg-2)]">This page doesn't exist. It may have moved, or the link has a typo.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={BASE} className="inline-flex items-center justify-center rounded-[12px] border border-[color:var(--color-line-2)] px-6 py-3.5 font-semibold hover:border-white/30">Go to the home page</a>
        <DownloadButton />
      </div>
    </main>
    <Footer />
  </StrictMode>,
);
