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
./build.sh
open build/GazeHop.app
```

On first launch:

1. Allow **Camera** access.
2. Enable GazeHop in **System Settings › Privacy & Security › Accessibility**.
3. Follow the calibration dots on each screen.

> The build is ad-hoc signed, so macOS treats every rebuild as a new app and the
> Accessibility toggle stops working. After rebuilding, clear the stale entry and re-enable it:
> `tccutil reset Accessibility io.github.gazehop`

## Using it

| | |
|---|---|
| **⌘F1** | Pause / resume from anywhere (e.g. while gaming). On Mac keyboards you may need **Fn⌘F1**. |
| **Calibrate…** | Re-run calibration (needed if you move your screens or camera, or add a new screen) |
| **Screens** | Check/uncheck each connected display. Unchecked screens (a TV, a screen you only watch) are never switched to |
| **Move pointer with focus** | Bring the pointer along so scrolling hits the right window |
| **Laya smart filter** | Experimental, see below |

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

## Debugging

```sh
defaults write io.github.gazehop debug -bool true   # log predictions once per second
tail -f ~/Library/Logs/GazeHop.log
```

Switch attempts are always logged.

## License

MIT
