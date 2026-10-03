# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Mac power users with two or more displays: developers, designers, traders, streamers and anyone who
types a lot across screens. Their job: keep working without clicking a window first every time they
look at another screen.

## Product Purpose
GazeHop is a free, open-source macOS menu bar app. The webcam estimates which screen you're looking at
(head direction plus eye position, Apple's Vision framework, on-device) and moves keyboard focus to the
last window you used on that screen. Success: you stop typing into the window you just left.

## Positioning
Focus follows your eyes, entirely on your Mac: no network code, no accounts, open source so the privacy
claim is verifiable. Free and MIT licensed.

## Operating Context
Multi-monitor desks (2 to 6+ displays, Sidecar counts). Calibrate once per setup, then it runs in the
menu bar. Pause anytime with a shortcut (⌘F1 by default), e.g. while gaming. Distributed via GitHub
Releases; not notarized, so first launch needs System Settings › Privacy & Security › Open Anyway
(or `xattr -dr com.apple.quarantine /Applications/GazeHop.app`).

## Capabilities and Constraints
- 250 ms default look time, 0.6 s cooldown, adjustable strictness and smoothing.
- Locks onto one face; ignores others. Never switches while a password field is active; waits for a
  pause in typing by default. Never steals focus from its own windows.
- Per-screen on/off, hot-plug aware, settings window with live tracking readout.
- Needs Camera and Accessibility permission. macOS 14 or later.
- Website: React + Vite on Cloudflare Workers static assets; strict CSP; no cookies or analytics.

## Brand Commitments
Name: GazeHop. Logo: glossy eyeball app icon with a steel-blue iris (site/brand/logo-mark.svg) and a
one-ink mark (site/brand/logo-mono.svg). Headline: "Look at a screen, and your keyboard follows."
Must not use Apple's logo or imply Apple affiliation.

## Evidence on Hand
- Public source code (github.com/kabirshah4/GazeHop), MIT license.
- 15 s rendered demo video (site/public/demo.mp4) and the in-browser camera demo.
- Privacy facts: no network code, frames discarded, calibration stored locally and deletable.
- None yet: testimonials, ratings, press, user counts. Do not fabricate any.

## Product Principles
1. Privacy is verifiable, not promised: point to the source.
2. Never surprise the user: safety guards before speed.
3. Calm, native, invisible: it should feel like part of macOS.
4. Honest claims only.

## Accessibility & Inclusion
Respect reduced motion and transparency preferences; keyboard-accessible controls; WCAG AA contrast.
