import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { Footer, Nav, StickyMobileCTA } from "../components/Chrome";
import { SmoothScroll } from "../components/SmoothScroll";
import { Hero } from "../sections/Hero";
import { Close, Details, Faq, HowItHelps, InstallGuide, Privacy, Specs, TryIt } from "../sections/Sections";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow">Skip to content</a>
    <SmoothScroll />
    <Nav />
    <main id="main">
      <Hero />
      <HowItHelps />
      <Details />
      <Privacy />
      <Specs />
      <TryIt />
      <InstallGuide />
      <Faq />
      <Close />
    </main>
    <Footer />
    <StickyMobileCTA />
  </StrictMode>,
);
