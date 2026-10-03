// Adapted from React Bits ScrollReveal (https://reactbits.dev), MIT + Commons Clause, (c) David Haz.
// Changes: only kills its own ScrollTriggers (the original killed every trigger on the page),
// renders a single element of your choice instead of <h2><p>, and respects reduced motion.
import { useEffect, useMemo, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

export default function ScrollReveal({
  children, as: Tag = "p", className = "",
  enableBlur = true, baseOpacity = 0.12, baseRotation = 0, blurStrength = 4,
  rotationEnd = "bottom bottom", wordAnimationEnd = "bottom bottom",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  const words = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, i) =>
      /^\s+$/.test(word) ? word : <span className="word inline-block" key={i}>{word}</span>,
    );
  }, [children]);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const wordEls = el.querySelectorAll<HTMLElement>(".word");
      if (baseRotation) {
        gsap.fromTo(el, { transformOrigin: "0% 50%", rotate: baseRotation }, {
          ease: "none", rotate: 0, scrollTrigger: { trigger: el, start: "top bottom", end: rotationEnd, scrub: true },
        });
      }
      gsap.fromTo(wordEls, { opacity: baseOpacity, willChange: "opacity" }, {
        ease: "none", opacity: 1, stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top bottom-=12%", end: wordAnimationEnd, scrub: true },
      });
      if (enableBlur) {
        gsap.fromTo(wordEls, { filter: `blur(${blurStrength}px)` }, {
          ease: "none", filter: "blur(0px)", stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top bottom-=12%", end: wordAnimationEnd, scrub: true },
        });
      }
    }, el);
    return () => ctx.revert();
  }, [enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return <Tag ref={ref} className={className}>{words}</Tag>;
}
