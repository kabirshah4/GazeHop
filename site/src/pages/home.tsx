import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { Footer, Nav, StickyMobileCTA } from "../components/Chrome";
import { FlyingEye } from "../components/FlyingEye";
import { SmoothScroll } from "../components/SmoothScroll";
import { IntroOverlay } from "../components/IntroOverlay";
import { Hero, PrivacyCertificate } from "../sections/Hero";
import { Faq, Features, FinalCTA, GatekeeperGuide, HowItWorks, Quarter, TryIt } from "../sections/Sections";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-black">Skip to content</a>
    <IntroOverlay />
    <SmoothScroll />
    <FlyingEye />
    <Nav />
    <main id="main">
      <Hero />
      <PrivacyCertificate />
      <HowItWorks />
      <Quarter />
      <Features />
      <TryIt />
      <GatekeeperGuide />
      <Faq />
      <FinalCTA />
    </main>
    <Footer />
    <StickyMobileCTA />
  </StrictMode>,
);
