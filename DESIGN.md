---
name: Swivel
description: Look at a screen, and your keyboard follows. A light, native macOS landing for a free, source-available menu bar app.
colors:
  system-blue: "#0071E3"
  system-blue-hover: "#0077ED"
  blue-deep: "#0058B0"
  blue-tint: "#E8F1FD"
  page-grey: "#F5F5F7"
  card-white: "#FFFFFF"
  ink: "#1D1D1F"
  ink-secondary: "#515154"
  ink-tertiary: "#6E6E73"
  hairline: "rgba(0, 0, 0, 0.08)"
  hairline-strong: "rgba(0, 0, 0, 0.12)"
  status-green: "#28A745"
  switch-green: "#34C759"
  sky-deep: "#2350C0"
  sky-peach: "#F6E3DA"
  glass-dark: "rgba(28, 28, 30, 0.72)"
typography:
  display:
    fontFamily: "ui-serif, New York, EB Garamond, Georgia, serif"
    fontSize: "clamp(44px, 6.4vw, 92px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  display-close:
    fontFamily: "ui-serif, New York, EB Garamond, Georgia, serif"
    fontSize: "clamp(40px, 5vw, 72px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter Variable, system-ui, sans-serif"
    fontSize: "clamp(32px, 3.8vw, 56px)"
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: "-0.03em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter Variable, system-ui, sans-serif"
    fontSize: "clamp(22px, 1.6vw, 28px)"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-0.02em"
  title-small:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, system-ui, sans-serif"
    fontSize: "clamp(19px, 1.4vw, 23px)"
    fontWeight: 400
    lineHeight: 1.38
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "-0.022em"
  body-small:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.47
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  serif-accent:
    fontFamily: "ui-serif, New York, EB Garamond, Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.01em"
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "13px"
rounded:
  badge: "7px"
  control: "8px"
  panel: "14px"
  panel-lg: "16px"
  window: "18px"
  card: "28px"
  pill: "980px"
spacing:
  gutter-mobile: "22px"
  gutter: "40px"
  grid-gap: "20px"
  tile-pad: "24px"
  card-pad-mobile: "32px"
  card-pad: "40px"
  heading-gap-mobile: "40px"
  heading-gap: "56px"
  section-mobile: "96px"
  section: "128px"
  container: "1180px"
components:
  button-primary:
    backgroundColor: "{colors.system-blue}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.system-blue-hover}"
  button-on-sky:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-ghost:
    textColor: "{colors.system-blue}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-quiet:
    backgroundColor: "rgba(0, 0, 0, 0.05)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-quiet-hover:
    backgroundColor: "rgba(0, 0, 0, 0.08)"
  button-nav:
    backgroundColor: "{colors.system-blue}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  card:
    backgroundColor: "{colors.card-white}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  mark:
    backgroundColor: "{colors.blue-tint}"
    textColor: "{colors.blue-deep}"
    typography: "{typography.serif-accent}"
  nav:
    backgroundColor: "rgba(255, 255, 255, 0.72)"
    textColor: "{colors.ink-secondary}"
    height: "52px"
  hud:
    backgroundColor: "{colors.glass-dark}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.pill}"
  chip-status:
    backgroundColor: "rgba(0, 0, 0, 0.05)"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: Swivel

## Overview

**Creative North Star: "The Desk at Dawn"**

The page is a Mac on a quiet morning. It opens on a deep blue sky that warms to peach at the horizon and settles, with no seam, into Apple's page grey, and a two-display desktop rises out of it doing the product's job. Everything after the hero is light, calm and native: grey ground, white continuous-corner cards with hairline edges, SF Pro text, and one blue that only ever means "act here". The serif voice (New York, falling back to EB Garamond) is kept for the two lines that frame the page, the hero headline and the closing line, plus single italic words that carry the verb of a sentence.

Density is generous. Sections breathe on 96 to 128px of vertical space, headlines are short and balanced, and the interesting surfaces are working miniatures of the product's own UI (menu bar, HUD, Settings toggles and sliders, an Install window with a sidebar) rather than illustration or stock imagery. Depth comes from soft, low offset shadows under a 1px hairline, and from frosted glass where macOS itself would frost something.

The page refuses the dark developer-tool landing and the generic SaaS hero. It is honest by construction: nothing on it is a fabricated metric, quote or logo, and it says plainly that it is not affiliated with Apple.

**Key Characteristics:**
- Light macOS ground (page grey) with white 28px cards; one action blue.
- A dawn sky in the hero and the close, always fading into the ground colour.
- Serif only for the page's opening and closing lines and single emphasised words.
- Real product UI rebuilt in HTML/CSS as the imagery; no generated pictures.
- Springs with zero bounce; content visible by default, motion only refines arrival.

## Colors

A neutral Apple palette with a single action accent and an atmospheric sky that never competes with it.

### Primary
- **System Blue** (`system-blue`): the only action colour. Primary pill buttons, the nav Download, inline links, the selected sidebar row in the Install window, slider fill, focus rings, the active pane ring in the browser demo, and line icons in Privacy. Hover lifts to **System Blue Hover**.
- **Blue Deep** and **Blue Tint**: a pair used together only for the **Mark** (an emphasised serif word on a pale blue lozenge) and for the "focused" state of miniature displays in the Settings preview.

### Tertiary (atmosphere, not action)
- **Sky Deep** (`sky-deep`) through **Sky Peach** (`sky-peach`): the dawn gradient behind the hero (deep morning blue at the top where white text sits, through periwinkle and rose, to peach, to page grey). The close reverses it: page grey, pale blue, rose, page grey. The same sky family tints the one blue "sees" card and the Privacy app-icon tile; these are surfaces, never buttons or links.

### Neutral
- **Page Grey** (`page-grey`): the page ground, footer, Install mock wells, and the colour every sky settles into.
- **Card White** (`card-white`): cards, the Privacy band, window bodies, the on-sky hero button.
- **Ink** (`ink`): primary text and headings.
- **Ink Secondary** (`ink-secondary`): body copy under headings, nav links, spec values (about 7:1 on the ground).
- **Ink Tertiary** (`ink-tertiary`): captions, footer, "Step n of 6", slider readouts (about 4.6:1; minimum use 13px).
- **Hairline** and **Hairline Strong**: card edges, row dividers, the top rule of spec and FAQ lists (strong) and the rules between rows (regular).
- **Glass Dark** (`glass-dark`): the HUD only.

### Status
- **Status Green** (`status-green`): the "tracking" dot in the browser demo and the Camera badge. Status, never decoration.
- **Switch Green** (`switch-green`): the "on" track of macOS-style switches.

### Named Rules
**The One Blue Rule.** System blue means "you can act here". If it is not a button, link, selection, focus ring or live control state, it is not system blue.

**The Sky Is Weather Rule.** Sky blues and peaches are atmosphere. They fill backgrounds and the occasional hero-material card, and every sky gradient ends in page grey so a section never has a hard seam.

**The Native Colours Rule.** Colours borrowed from macOS itself (window traffic lights `#FF5F57 / #FEBC2E / #28C840`, iMessage blue `#0A84FF` and grey `#E9E9EB`, Dock and Settings badge gradients) appear only inside the miniatures that reproduce that piece of macOS. They are quotations, not palette.

## Typography

**Display Font:** New York via `ui-serif` (with EB Garamond, then Georgia)
**Body Font:** SF Pro via `-apple-system` (with Inter Variable, then system-ui)
**Label/Mono Font:** SF Mono via `ui-monospace` (with Menlo), only for the Terminal command

**Character:** A book serif for the two lines that bookend the page, over the system sans that macOS uses for everything else. The pairing reads as Apple's own product pages: editorial at the edges, native in the body.

### Hierarchy
- **Display** (400, `clamp(44px, 6.4vw, 92px)`, 1.02): the hero headline only, white on the sky, max 18ch, balanced, with a faint navy text shadow.
- **Display Close** (400, `clamp(40px, 5vw, 72px)`, 1.02): the closing line only, ink on the pale close sky, max 17ch.
- **Headline** (600, `clamp(32px, 3.8vw, 56px)`, 1.07, -0.03em): section titles, balanced, usually capped at 16 to 18ch.
- **Title** (600, `clamp(22px, 1.6vw, 28px)`, 1.14): headings inside the large cards and the Install step panel.
- **Title Small** (600, 19px, -0.02em): tile titles, Privacy points, FAQ questions.
- **Lead** (400, `clamp(19px, 1.4vw, 23px)`, 1.38, ink secondary): the one sentence under a centred headline.
- **Body** (400, 17px, 1.47, -0.022em): default text; card copy capped near 40ch, FAQ answers at 64ch.
- **Body Small** (400, 15px, 1.47): tile and Privacy descriptions.
- **Label** (400 to 500, 13px; 12 to 14px in chips and nav): captions, footer, nav links (14px), status chips (12px, 500).

Tracking tightens as size grows (from -0.02em on body up to -0.03em on headlines), as Apple does.

### Named Rules
**The Two Serif Lines Rule.** The full serif display appears exactly twice: the hero headline and the closing line. Elsewhere serif is limited to a single italic word inside a sans heading (the **Mark** or its white-on-blue twin).

**The Sentence Case Rule.** Headings, buttons and labels are sentence case. There are no uppercase eyebrow labels above headings.

## Layout

A single centred column: `container` max width with 22px gutters on phones and 40px from 768px. Sections stack vertically with 96px of padding on phones and 128px from 768px (the close uses 112px / 160px). A headline sits 40px (56px desktop) above its content.

Grids use a 20px gap. The feature grid is deliberately uneven: three columns where tiles span two, one, one, two, and then all three, so no row repeats the row above. The two "how it helps" cards share a row but differ in material (one sky-blue, one white). Two-column text layouts split asymmetrically (`1fr 2fr` for specs, `1.1fr 1fr` for the Install intro). The FAQ narrows to 860px; centred Privacy copy to 760px.

The hero illustration scales like an image: a container-query unit (`--u`, 1% of the stage width) sizes every bezel, window, font and gap inside it. Below 640px the stage bleeds to 150vw so the focused MacBook stays legible, and the HUD gets its own larger unit (`--hu`, 1.9x) and re-centres at 68%. Below 768px the browser camera demo is replaced by a short card, and a frosted sticky Download bar appears at the bottom.

## Elevation & Depth

Hybrid: surfaces are defined by a 1px hairline ring plus a soft, low, negatively spread offset shadow that reads as light from above rather than a floating drop. Glass adds a second kind of depth for chrome that floats over content. The sky provides the page's only large-scale depth.

### Shadow Vocabulary
- **Card** (`0 0 0 1px rgba(0,0,0,.08), 0 18px 40px -26px rgba(0,0,0,.22)`): every white card.
- **Inset panel** (`0 0 0 1px rgba(0,0,0,.06)`): flat white panels inside cards (switch lists, safety rows, Terminal row). No offset.
- **Window** (`0 0 0 .5px rgba(0,0,0,.18), 0 20px 40px -18px rgba(0,0,0,.3)`): miniature macOS windows; the Install window goes larger (`0 30px 70px -30px`).
- **Blue lift** (`0 1px 1px rgba(0,0,0,.08), 0 6px 18px -8px rgba(0,113,227,.7)`): primary blue buttons only.
- **Sky surface** (`0 24px 50px -30px rgba(30,70,200,.7)`): the blue card and blue icon tile; shadow tinted to the sky.
- **HUD** (`0 12px 30px -10px rgba(0,0,0,.45)`): the dark glass HUD.
- **Focus ring** (`0 0 0 2px #0071E3` or an outline of 2px at 3px offset): focus and the active demo pane.

### Named Rules
**The Hairline First Rule.** Every raised white surface carries a 1px (or 0.5px for windows) hairline ring; the offset shadow is negative-spread and soft so the edge, not the shadow, defines the shape.

**The Frost Floats Rule.** Frosted glass (white 72% or dark 72%, saturate 180% and 20 to 24px blur) is for things that float over other content: the nav, the sticky mobile bar, the menu bars and Dock inside the miniatures, the HUD and its in-card status pill, and the close's floating keycaps. Cards and content panels are never glass. With reduced transparency, glass becomes 97% opaque.

## Shapes

Continuous-feeling rounded rectangles at every scale, nested from large to small: 28px cards, 18px windows, 14 to 16px panels, 8px rows and focus rings, 7px Settings badges, and full pills for every button, chip, input field and HUD. Inside the scaled illustration the same ladder is expressed in `--u` units. Corners never go square, and nested radii shrink as they go inward. Keyboard keys are their own shape: rounded keycaps with a light top-to-bottom gradient and a 1.5px base shadow.

## Components

### Buttons
Pills with press feedback; quiet and confident.
- **Shape:** full pill (`pill`), 12px by 22px, 17px weight 500 with -0.02em tracking, 8px gap to a leading glyph.
- **Primary:** system blue, white text, blue lift shadow; hover brightens; press scales to 0.97 with the ease-out curve.
- **On sky:** in the hero, the primary becomes a white pill with ink text and a navy-tinted shadow; its partner "View the source ›" is white text with an underline on hover.
- **Ghost:** blue text with a trailing "›", underline (4px offset) on hover. Always the secondary of a pair or a standalone "read the source".
- **Quiet:** 5% black fill, ink text, 8% on hover. Back, Copy, camera off.
- **Compact:** nav and in-panel buttons drop to 14px text with 6 to 8px vertical padding.

### Chips
- **Status chip:** 5% black pill, 12px 500 ink secondary ("Focus held", "Waits for a pause").
- **Status dot:** 8px circle in status green when live, 20% black when idle.

### Cards / Containers
- **Corner Style:** 28px.
- **Background:** card white; one sky-blue gradient card (`#3A73F0` to `#86A9F7`) carries white text as the hero-material counterpart.
- **Shadow Strategy:** Card shadow (see Elevation).
- **Border:** hairline ring, no stroke border.
- **Internal Padding:** 32px, 40px from 768px. Feature tiles split into an art well (soft `#F7F8FB` to white wash, 24px padding) above a 24px text block, and lift 2px on hover.

### Inputs / Fields
- **Range slider:** 4px pill track filled in system blue to the value; 22px white thumb with a soft shadow that scales to 1.08 while dragged; label left, tabular value right in ink tertiary.
- **Switch:** 40 by 24px pill, switch green on, 15% black off, 20px white thumb on a spring.
- **Text panes:** borderless textareas inside window miniatures; the focused pane gets a 2px blue ring.
- **Focus:** 2px system blue outline at 3px offset with 8px radius on every focusable element.

### Navigation
Sticky 52px frosted white bar with a 1px bottom rule. Logo mark plus "Swivel" in 17px semibold display sans on the left; 14px ink-secondary links (hover to ink, rounded hit area), a GitHub glyph, and a compact blue Download pill on the right. Text links hide below 768px; the frosted sticky Download bar at the bottom of the viewport takes over on phones. The hero slides under the nav so the sky shows through the glass.

### Mark
The emphasised word: serif italic on a blue-tint lozenge (0.35em radius, 0.18em side padding) in blue deep. On the blue card the same device is white text on a 20% white lozenge. One per heading, on the verb.

### macOS Miniatures (signature)
The page's imagery is its product UI rebuilt in code: windows with traffic lights and a centred 12 to 13px semibold title over a 6% hairline; a Settings-style sidebar whose selected row is a blue 8px pill that slides between steps; menu bars and a Dock in light glass; the dark-glass HUD with an eye glyph, display name and a white dwell bar; a blinking blue caret. Unfocused windows grey their traffic lights to `#D9D9DC` and drop opacity, which is how focus is shown. Wallpapers and screens use the dawn palette, never photographs.

### Dawn Sky (signature)
A full-bleed, non-interactive background made of a vertical gradient plus faint radial clouds and a radial sunrise. Hero: deep blue at the top where white text sits, to peach behind the desk, to page grey. Close: page grey to pale blue to rose to page grey, behind ink text. Phones use later colour stops so the text stays on the deep band.

### Motion
Springs with zero bounce throughout: 0.35s for UI state (sidebar selection, panel swap, FAQ chevron and height), 0.8s for scroll reveals (fade plus 18px rise, once), 0.9s for the hero lines (staggered 0, 0.08, 0.16, 0.22s) and 1.2s for the desk. CSS transitions use `cubic-bezier(0.16, 1, 0.3, 1)`. The switch thumb is the single exception at 0.15 bounce, because a macOS switch settles that way. Loops (hero demo, typing, keycap float) pause off-screen, and everything collapses to its final state under reduced motion.

## Do's and Don'ts

### Do:
- **Do** keep the ground page grey and put content on white 28px cards with the hairline-plus-soft-shadow edge.
- **Do** reserve system blue for actions, links, selection, focus and live control state.
- **Do** end every sky gradient in page grey, and keep white text only on the deep blue band of the hero sky.
- **Do** set the hero and closing lines in the serif, and limit serif elsewhere to one italic word in a Mark.
- **Do** build imagery from the product's real UI (windows, menu bar, HUD, Settings controls) in HTML and CSS.
- **Do** use zero-bounce springs, and render content visible by default so motion only refines arrival.
- **Do** keep the footer line "Not affiliated with Apple. Mac and macOS are trademarks of Apple Inc."
- **Do** vary grids: uneven spans, or equal widths only when the cards differ in material.

### Don't:
- **Don't** use AI-generated imagery or photographs; every visual is drawn in code or is the product's own logo mark.
- **Don't** use emerald or teal greens; green appears only as status green and switch green, for status.
- **Don't** show fabricated testimonials, ratings, user counts, press logos or metrics.
- **Don't** use the Apple logo or imply Apple affiliation.
- **Don't** draw an eye anywhere (logo, menu bar, HUD, illustrations): it reads as being watched. The mark is one monitor with a caret, and the hop arriving on it.
- **Don't** put uppercase eyebrow labels above headings.
- **Don't** use gradient text; gradients belong to backgrounds, cards, badges and wallpapers.
- **Don't** use the hero-metric template (big number, small label, repeated).
- **Don't** build grids of identical same-size cards.
- **Don't** frost cards or content panels; glass is for chrome that floats.
- **Don't** introduce a second accent hue for actions.
