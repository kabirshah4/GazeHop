# Third-party notices

GazeHop's own code is MIT licensed (see `LICENSE`). The macOS app uses only Apple frameworks.
The website in `site/` includes or builds on the following third-party work, each under its
own license:

| Component | Where | License |
|---|---|---|
| [Magic UI](https://magicui.design) (border beam, animated grid, number ticker, shimmer button) | `site/src/components/magicui/` | MIT |
| [React Bits](https://reactbits.dev) (LightRays, ShinyText, DecryptedText, SpotlightCard, ScrollReveal) | `site/src/components/reactbits/` | MIT + Commons Clause: may be used in apps and websites, but the components may not be sold on their own |
| [ThreeUI](https://threeui.com) TextAnimationCollection, "threeui-intro" | `site/src/shaders/neuform-isolated/` | ThreeUI license (not MIT). Used under ThreeUI's terms; not covered by this repository's MIT license |
| [MediaPipe Tasks Vision](https://github.com/google-ai-edge/mediapipe) runtime and face landmarker model | downloaded into `site/public/vendor/` at build time | Apache 2.0 |
| [three.js](https://threejs.org), [motion](https://motion.dev), [Lenis](https://lenis.darkroom.engineering), [OGL](https://github.com/oframe/ogl) | npm dependencies | MIT |
| [GSAP](https://gsap.com) | npm dependency | GSAP Standard License (free) |
| [Inter](https://rsms.me/inter/) via Fontsource | npm dependency | SIL Open Font License 1.1 |

Apple, Mac and macOS are trademarks of Apple Inc. GazeHop is not affiliated with Apple.
