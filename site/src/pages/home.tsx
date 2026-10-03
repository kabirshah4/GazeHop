import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { Footer, Nav, StickyMobileCTA } from "../components/Chrome";
import { Hero } from "../sections/Hero";
import { Faq, Features, FinalCTA, HowItWorks, Privacy, Problem } from "../sections/Sections";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
    <Nav />
    <main id="main">
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Privacy />
      <Faq />
      <FinalCTA />
    </main>
    <Footer />
    <StickyMobileCTA />
  </StrictMode>,
);
