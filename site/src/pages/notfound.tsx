import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { DownloadButton, Footer, Nav } from "../components/Chrome";
import { Eye } from "../components/Eye";
import { BASE } from "../lib/links";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Nav />
    <main className="wrap flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <Eye look={0} className="mb-8" />
      <p className="eyebrow mb-4">404</p>
      <h1 className="display mb-4 text-[clamp(30px,4.5vw,48px)] font-semibold">Nothing to look at here<span className="caret" /></h1>
      <p className="mb-8 max-w-md text-[18px] text-[color:var(--color-muted)]">This page doesn't exist. It may have moved, or the link has a typo.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={BASE} className="inline-flex items-center justify-center rounded-[10px] border border-[color:var(--color-hairline)] bg-white px-5 py-3 font-semibold">Go to the home page</a>
        <DownloadButton />
      </div>
    </main>
    <Footer />
  </StrictMode>,
);
