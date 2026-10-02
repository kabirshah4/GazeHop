import AppKit
import Carbon

final class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    private let tracker = GazeTracker()
    private let focus = FocusManager()
    private let laya = LayaFilter()
    private var model = GazeModel.load()
    private var calibration: Calibration?

    private var statusItem: NSStatusItem!
    private var statusLine = NSMenuItem(title: "Starting…", action: nil, keyEquivalent: "")
    private var pauseItem: NSMenuItem!
    private var layaItem: NSMenuItem!
    private var pointerItem: NSMenuItem!
    private let screensMenu = NSMenu()

    /// Screens GazeHop never switches to (e.g. a TV or a screen you only watch).
    private var excluded: Set<UInt32> {
        get { Set((UserDefaults.standard.array(forKey: "excludedDisplays") as? [Int] ?? []).map(UInt32.init)) }
        set { UserDefaults.standard.set(newValue.map(Int.init), forKey: "excludedDisplays") }
    }
    private var connected: Set<UInt32> { Set(NSScreen.screens.map(\.displayID)) }

    private var paused = UserDefaults.standard.bool(forKey: "paused")
    private var smoothed: [Double]?
    private var candidate: (display: UInt32, since: Date)?
    private var lastSwitch = Date.distantPast
    private var pendingLaya = false
    private var lastDiag = Date.distantPast
    private var pauseHotKey: HotKey?

    // Tuning
    private let dwell: TimeInterval = 0.25       // must look at a screen this long
    private let cooldown: TimeInterval = 0.6     // between switches
    private let minConfidence = 0.2
    private let alpha = 0.45                     // smoothing

    func applicationDidFinishLaunching(_ note: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        buildMenu()
        laya.enabled = UserDefaults.standard.bool(forKey: "layaFilter")
        focus.movePointer = UserDefaults.standard.object(forKey: "movePointer") as? Bool ?? true
        layaItem.state = laya.enabled ? .on : .off
        pointerItem.state = focus.movePointer ? .on : .off

        DebugLog.write("launch trusted=\(FocusManager.isTrusted) screens=\(NSScreen.screens.map(\.displayID)) model=\(model?.centroids.keys.sorted() ?? [])")
        if !FocusManager.isTrusted { FocusManager.promptForAccessibility() }
        focus.start()

        // ⌘F1 pauses/resumes from anywhere, e.g. mid-game.
        pauseHotKey = HotKey(keyCode: UInt32(kVK_F1), modifiers: UInt32(cmdKey)) { [weak self] in
            self?.togglePause()
        }
        if pauseHotKey == nil { DebugLog.write("could not register ⌘F1 (taken by another app?)") }

        NotificationCenter.default.addObserver(self, selector: #selector(screensChanged),
            name: NSApplication.didChangeScreenParametersNotification, object: nil)

        tracker.onSample = { [weak self] f in self?.handle(f) }
        tracker.onNoFace = { [weak self] in self?.candidate = nil }
        tracker.start { [weak self] error in
            guard let self else { return }
            if let error { self.setStatus(error.localizedDescription, icon: "eye.trianglebadge.exclamationmark"); return }
            if self.model == nil || !self.uncalibratedScreens.isEmpty {
                self.setStatus("Needs calibration", icon: "eye.trianglebadge.exclamationmark")
                self.calibrate()
            } else {
                self.refreshStatus()
            }
        }
    }

    // MARK: menu

    private func buildMenu() {
        let menu = NSMenu()
        statusLine.isEnabled = false
        menu.addItem(statusLine)
        menu.addItem(.separator())
        pauseItem = menu.addItem(withTitle: "Pause", action: #selector(togglePause), keyEquivalent: String(UnicodeScalar(NSF1FunctionKey)!))
        pauseItem.keyEquivalentModifierMask = [.command]
        menu.addItem(withTitle: "Calibrate…", action: #selector(calibrate), keyEquivalent: "c")
        let screensItem = menu.addItem(withTitle: "Screens", action: nil, keyEquivalent: "")
        screensMenu.delegate = self
        screensItem.submenu = screensMenu
        menu.addItem(.separator())
        pointerItem = menu.addItem(withTitle: "Move pointer with focus", action: #selector(togglePointer), keyEquivalent: "")
        layaItem = menu.addItem(withTitle: "Laya smart filter (needs ~/laya/serve.sh)", action: #selector(toggleLaya), keyEquivalent: "")
        menu.addItem(.separator())
        menu.addItem(withTitle: "Quit GazeHop", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        for item in menu.items where item.action != nil && item.action != #selector(NSApplication.terminate(_:)) {
            item.target = self
        }
        statusItem.menu = menu
    }

    private func setStatus(_ text: String, icon: String) {
        statusLine.title = text
        statusItem.button?.image = NSImage(systemSymbolName: icon, accessibilityDescription: "GazeHop")
    }

    private func refreshStatus() {
        pauseItem.title = paused ? "Resume" : "Pause"
        if paused { setStatus("Paused", icon: "eye.slash"); return }
        if !FocusManager.isTrusted { setStatus("Grant Accessibility access", icon: "eye.trianglebadge.exclamationmark"); return }
        let layaNote = laya.enabled ? " · Laya \(laya.lastStatus)" : ""
        if !uncalibratedScreens.isEmpty {
            setStatus("New screen connected: calibrate", icon: "eye.trianglebadge.exclamationmark"); return
        }
        let active = connected.subtracting(excluded).count
        setStatus("Watching \(active) of \(connected.count) screens\(layaNote)", icon: "eye")
    }

    @objc private func togglePause() {
        paused.toggle()
        UserDefaults.standard.set(paused, forKey: "paused")
        paused ? tracker.stop() : tracker.start { _ in }
        candidate = nil
        NSSound(named: paused ? "Pop" : "Tink")?.play()
        DebugLog.write(paused ? "paused" : "resumed")
        refreshStatus()
    }

    @objc private func togglePointer() {
        focus.movePointer.toggle()
        pointerItem.state = focus.movePointer ? .on : .off
        UserDefaults.standard.set(focus.movePointer, forKey: "movePointer")
    }

    @objc private func toggleLaya() {
        laya.enabled.toggle()
        layaItem.state = laya.enabled ? .on : .off
        UserDefaults.standard.set(laya.enabled, forKey: "layaFilter")
        refreshStatus()
    }

    @objc private func calibrate() {
        guard calibration == nil else { return }
        if !tracker.isRunning { tracker.start { _ in } }
        let c = Calibration(tracker: tracker) { [weak self] newModel in
            guard let self else { return }
            if let newModel { self.model = newModel; newModel.save() }
            self.calibration = nil
            if self.paused { self.tracker.stop() }
            self.refreshStatus()
        }
        calibration = c
        c.run()
    }

    /// Connected screens the model has never been calibrated on.
    private var uncalibratedScreens: Set<UInt32> {
        connected.subtracting(model?.centroids.keys ?? [:].keys)
    }

    @objc private func screensChanged() {
        DebugLog.write("screens changed: \(connected.sorted()) uncalibrated=\(uncalibratedScreens.sorted())")
        focus.forget(except: connected)
        candidate = nil
        refreshStatus()
    }

    // MARK: Screens submenu

    func menuNeedsUpdate(_ menu: NSMenu) {
        guard menu === screensMenu else { return }
        menu.removeAllItems()
        let calibrated = Set(model?.centroids.keys ?? [:].keys)
        for (i, screen) in NSScreen.screens.enumerated() {
            let id = screen.displayID
            var title = "\(i + 1). \(screen.localizedName)"
            if !calibrated.contains(id) { title += " (not calibrated)" }
            let item = menu.addItem(withTitle: title, action: #selector(toggleScreen(_:)), keyEquivalent: "")
            item.target = self
            item.tag = Int(id)
            item.state = excluded.contains(id) ? .off : .on
        }
        menu.addItem(.separator())
        let hint = menu.addItem(withTitle: "Unchecked screens are never switched to", action: nil, keyEquivalent: "")
        hint.isEnabled = false
    }

    @objc private func toggleScreen(_ item: NSMenuItem) {
        let id = UInt32(item.tag)
        if excluded.contains(id) { excluded.remove(id) } else { excluded.insert(id) }
        candidate = nil
        refreshStatus()
    }

    // MARK: gaze → focus

    private func handle(_ raw: [Double]) {
        if let calibration { calibration.add(raw); return }
        guard !paused, let model else { return }

        smoothed = smoothed.map { s in zip(s, raw).map { $0 * (1 - alpha) + $1 * alpha } } ?? raw
        let pred = model.predict(smoothed!, among: connected)
        if UserDefaults.standard.bool(forKey: "debug"), Date().timeIntervalSince(lastDiag) > 1 {
            lastDiag = Date()
            DebugLog.write("pred=\(pred.map { "\($0.display) conf=\(String(format: "%.2f", $0.confidence))" } ?? "nil") trusted=\(FocusManager.isTrusted) focused=\(focus.focusedDisplay.map(String.init) ?? "nil") front=\(NSWorkspace.shared.frontmostApplication?.localizedName ?? "?") known=\(focus.lastWindow.map { "\($0.key):\($0.value.appName)" })")
        }
        guard let p = pred, p.confidence >= minConfidence else { candidate = nil; return }

        if candidate?.display != p.display { candidate = (p.display, Date()); return }
        guard let c = candidate, Date().timeIntervalSince(c.since) >= dwell,
              Date().timeIntervalSince(lastSwitch) >= cooldown,
              !pendingLaya,
              CGEventSource.buttonState(.combinedSessionState, button: .left) == false,  // not mid-drag
              !excluded.contains(p.display),
              let current = focus.focusedDisplay, current != p.display,
              let target = focus.lastWindow[p.display] else { return }

        let from = focus.currentWindow()
        let ctx = LayaFilter.Context(
            fromApp: from?.appName ?? "unknown", fromTitle: from?.title ?? "",
            toApp: target.appName, toTitle: target.title,
            dwellMs: Int(Date().timeIntervalSince(c.since) * 1000),
            confidence: p.confidence,
            secondsSinceKey: CGEventSource.secondsSinceLastEventType(.combinedSessionState, eventType: .keyDown))
        pendingLaya = true
        laya.shouldSwitch(ctx) { [weak self] allow in
            guard let self else { return }
            self.pendingLaya = false
            self.lastSwitch = Date()   // also rate-limits re-asking Laya after a "no"
            if allow {
                let ok = self.focus.focus(display: p.display)
                DebugLog.write("SWITCH -> \(p.display) \(target.appName) ok=\(ok)")
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    DebugLog.write("after switch front=\(NSWorkspace.shared.frontmostApplication?.localizedName ?? "?") focused=\(self.focus.focusedDisplay.map(String.init) ?? "nil")")
                }
            } else { DebugLog.write("laya blocked switch") }
            if self.laya.enabled { self.refreshStatus() }
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
