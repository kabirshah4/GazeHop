<p align="center"><img src="docs/icon.png" width="160" alt="GazeHop icon"></p>

# GazeHop

Look at a screen, and your keyboard follows.

GazeHop is a tiny macOS menu-bar app for multi-monitor setups: 2, 3, 4 or more screens. It uses your webcam to see
which screen you're looking at and moves keyboard focus to the last window you used on that
screen — so you stop typing into the window you just left.

Everything runs on your Mac. No video is recorded, stored, or sent anywhere.

## How it works

- **Tracking:** Apple's Vision framework reads head direction (yaw, nose position) and eye
  gaze (pupil position within each eye) from the front camera.
- **Deciding:** a quick calibration (look at a dot on each screen) trains a nearest-centroid
  model. GazeHop switches only after you've looked at a screen for 250 ms, with a 0.6 s
  cooldown, and never while you're dragging.
- **Switching:** the Accessibility API remembers the last focused window on each display,
  raises it, and (optionally) moves the pointer there so scrolling works too.

## Requirements

- macOS 14 or later, two or more displays (any number; Sidecar iPads count too), a webcam
- Xcode command-line tools (Swift 5.9+) to build

## Build and run

```sh
./scripts/make-signing-cert.sh   # once: lets macOS remember permissions across rebuilds
./build.sh
open build/GazeHop.app
```

On first launch:

1. Allow **Camera** access.
2. Enable GazeHop in **System Settings › Privacy & Security › Accessibility**.
3. Follow the calibration dots on each screen.

GazeHop shows up in the menu bar (next to the battery and clock) as an eye icon. You can add
the name next to it in **Settings › General**.

> **Why the signing script?** macOS ties Camera and Accessibility permission to an app's code
> signature. Without a certificate, each build is signed ad-hoc and looks like a brand-new app,
> so you'd have to allow everything again after every rebuild. `make-signing-cert.sh` creates a
> self-signed certificate ("GazeHop Local Signing") in your login keychain; `build.sh` uses it
> automatically. It never leaves your Mac.

## Using it

| Menu | |
|---|---|
| **Pause / Resume (⌘F1)** | Pause from anywhere, e.g. while gaming. On Mac keyboards you may need **Fn⌘F1**. |
| **Calibrate…** | Re-run calibration (needed if you move your screens or camera, or add a new screen) |
| **Screens** | Check/uncheck each connected display. Unchecked screens are never switched to |
| **Settings… (⌘,)** | Everything below |

The menu bar icon shows the state: plain eye = watching, slashed = paused, dot = needs attention
(calibration or permission).

### Settings

| Tab | Options |
|---|---|
| **General** | Launch at login · show the name in the menu bar · move pointer with focus · sounds · pause shortcut (⌘F1, ⌥F1, ⌃⌥G, ⌃⌥⌘G or none) |
| **Tracking** | Look time before switching · minimum time between switches · strictness · smoothing · recalibrate |
| **Screens** | Per-display on/off, calibration status |
| **Laya** | Enable, server URL, confidence threshold, test connection |
| **Advanced** | Debug logging, open log, shortcuts to Camera/Accessibility settings |

All settings apply immediately.

## Multiple screens

GazeHop calibrates every connected display and picks whichever one you're looking at.

- **Unplugging a screen** doesn't need recalibration; GazeHop just ignores it until it's back.
- **Plugging in a new screen** shows *New screen connected: calibrate* in the menu; run
  **Calibrate…** to include it.
- Accuracy depends on how far apart the screens are from your point of view: side-by-side
  and stacked layouts work best; two screens at almost the same angle are hard to tell apart.

## Optional: Laya smart filter

GazeHop can ask a local [Laya](https://huggingface.co/convaiinnovations/laya) server
(`http://127.0.0.1:8077/decide`) whether a glance is a deliberate switch. Laya is a text
decision model, so it receives a short description of the situation (app names, window
titles, dwell time), never camera frames. If the server is unreachable, switches go ahead.

It's off by default: in early testing Laya didn't reliably tell glances from real switches.

## Tests

```sh
swift test
```

## Icons

The app icon and menu bar icon are drawn in code. To regenerate the app icon after editing
`scripts/make-icon.swift`:

```sh
swift scripts/make-icon.swift   # writes Resources/AppIcon.icns and docs/icon.png
```

## Debugging

Turn on **Settings › Advanced › Detailed debug logging**, then:

```sh
tail -f ~/Library/Logs/GazeHop.log
```

Switch attempts are always logged.

## License

MIT
