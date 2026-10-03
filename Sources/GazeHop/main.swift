import AppKit
import Carbon
import Combine

final class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    private let settings = Settings.shared
    private let tracker = GazeTracker()
    private let focus = FocusManager()
    private var model = GazeModel.load()
    private var calibration: Calibration?
    private lazy var settingsWindow = SettingsWindowController(actions: SettingsActions(
        calibrate: { [weak self] in self?.calibrate() },
        togglePause: { [weak self] in self?.togglePause() },
        forgetCalibration: { [weak self] in self?.forgetCalibration() }))
    private let state = AppState.shared

    private var statusItem: NSStatusItem!
    private var statusLine = NSMenuItem(title: "Starting…", action: nil, keyEquivalent: "")
    private var pauseItem: NSMenuItem!
    private let screensMenu = NSMenu()
    private var cancellables = Set<AnyCancellable>()

    private var paused = UserDefaults.standard.bool(forKey: "paused")
    private var smoothed: [Double]?
    /// Screen you seem to be looking at: when that started, and the last confident frame for it.
    private var candidate: (display: UInt32, since: Date, lastHit: Date)?
    private var lastSwitch = Date.distantPast
    private var lastNoWindowLog: UInt32?
    private var lastDiag = Date.distantPast
    private var pauseHotKey: HotKey?

    private var connected: Set<UInt32> { Set(NSScreen.screens.map(\.displayID)) }

    func applicationDidFinishLaunching(_ note: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.autosaveName = "GazeHop"
        statusItem.button?.imagePosition = .imageLeft
        buildMenu()

        DebugLog.write("launch trusted=\(FocusManager.isTrusted) screens=\(connected.sorted()) model=\(model?.centroids.keys.sorted() ?? [])")
        if !FocusManager.isTrusted { FocusManager.promptForAccessibility() }
        focus.start()

        // Re-apply anything that depends on settings whenever they change.
        // objectWillChange fires before the new value lands, so hop to the next runloop turn.
        settings.objectWillChange
            .sink { [weak self] _ in DispatchQueue.main.async { self?.applySettings() } }
            .store(in: &cancellables)
        applySettings()

        NotificationCenter.default.addObserver(self, selector: #selector(screensChanged),
            name: NSApplication.didChangeScreenParametersNotification, object: nil)

        if CommandLine.arguments.contains("--settings") { openSettings() }  // open Settings on launch

        tracker.onSample = { [weak self] f in self?.handle(f) }
        tracker.onNoFace = { [weak self] in self?.candidate = nil; self?.state.publishNoFace() }
        state.paused = paused
        state.calibrated = Set(model?.centroids.keys ?? [:].keys)
        guard !paused else { refreshStatus(); return }
        tracker.start { [weak self] error in
            guard let self else { return }
            if let error { self.setStatus(error.localizedDescription, icon: .attention); return }
            if self.model == nil || !self.uncalibratedScreens.isEmpty {
                self.setStatus("Needs calibration", icon: .attention)
                self.calibrate()
            } else {
                self.refreshStatus()
            }
        }
    }

    private var registeredHotKey: HotKeyPreset?

    private func applySettings() {
        let preset = settings.hotKey
        if preset != registeredHotKey {
            pauseHotKey = nil
            if let combo = preset.carbon {
                pauseHotKey = HotKey(keyCode: combo.keyCode, modifiers: combo.modifiers) { [weak self] in
                    self?.togglePause()
                }
                if pauseHotKey == nil { DebugLog.write("could not register \(preset.label) (taken by another app?)") }
            }
            let eq = preset.menuEquivalent
            pauseItem.keyEquivalent = eq.key
            pauseItem.keyEquivalentModifierMask = eq.mask
            registeredHotKey = preset
        }
        candidate = nil
        refreshStatus()
    }

    // MARK: menu

    private func buildMenu() {
        let menu = NSMenu()
        statusLine.isEnabled = false
        menu.addItem(statusLine)
        menu.addItem(.separator())
        pauseItem = menu.addItem(withTitle: "Pause", action: #selector(togglePause), keyEquivalent: "")
        menu.addItem(withTitle: "Calibrate…", action: #selector(calibrate), keyEquivalent: "")
        let screensItem = menu.addItem(withTitle: "Screens", action: nil, keyEquivalent: "")
        screensMenu.delegate = self
        screensItem.submenu = screensMenu
        menu.addItem(.separator())
        menu.addItem(withTitle: "Settings…", action: #selector(openSettings), keyEquivalent: ",")
        menu.addItem(.separator())
        menu.addItem(withTitle: "Quit GazeHop", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        for item in menu.items where item.action != nil && item.action != #selector(NSApplication.terminate(_:)) {
            item.target = self
        }
        statusItem.menu = menu
    }

    private func setStatus(_ text: String, icon: MenuBarIcon.State) {
        statusLine.title = text
        guard let button = statusItem.button else { return }
        button.image = MenuBarIcon.image(icon)
        button.title = settings.showNameInMenuBar ? " GazeHop" : ""
        button.toolTip = "GazeHop: \(text)"
        state.statusText = text
        state.icon = icon
    }

    private func refreshStatus() {
        pauseItem.title = paused ? "Resume" : "Pause"
        if paused { setStatus("Paused", icon: .paused); return }
        if !FocusManager.isTrusted { setStatus("Grant Accessibility access", icon: .attention); return }
        if model == nil { setStatus("Needs calibration", icon: .attention); return }
        if !uncalibratedScreens.isEmpty { setStatus("New screen connected: calibrate", icon: .attention); return }
        let active = connected.subtracting(settings.excludedDisplays).count
        setStatus("Watching \(active) of \(connected.count) screens", icon: .active)
    }

    @objc private func openSettings() { settingsWindow.show() }

    @objc private func togglePause() {
        paused.toggle()
        UserDefaults.standard.set(paused, forKey: "paused")
        state.paused = paused
        if paused { state.publishNoFace() }
        paused ? tracker.stop() : tracker.start { _ in }
        candidate = nil
        if settings.playSounds { NSSound(named: paused ? "Pop" : "Tink")?.play() }
        DebugLog.write(paused ? "paused" : "resumed")
        refreshStatus()
    }

    @objc private func calibrate() {
        guard calibration == nil else { return }
        if !tracker.isRunning { tracker.start { _ in } }
        let c = Calibration(tracker: tracker) { [weak self] newModel in
            guard let self else { return }
            if let newModel { self.model = newModel; newModel.save(); self.state.calibrated = Set(newModel.centroids.keys) }
            self.calibration = nil
            if self.paused { self.tracker.stop() }
            self.refreshStatus()
        }
        calibration = c
        c.run()
    }

    /// Erase stored calibration (per-screen averages of head and eye angles) and ask for a new one.
    private func forgetCalibration() {
        UserDefaults.standard.removeObject(forKey: "gazeModel")
        model = nil
        smoothed = nil
        candidate = nil
        state.calibrated = []
        DebugLog.write("calibration deleted")
        refreshStatus()
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
            item.state = settings.excludedDisplays.contains(id) ? .off : .on
        }
        menu.addItem(.separator())
        let hint = menu.addItem(withTitle: "Unchecked screens are never switched to", action: nil, keyEquivalent: "")
        hint.isEnabled = false
    }

    @objc private func toggleScreen(_ item: NSMenuItem) {
        let id = UInt32(item.tag)
        if settings.excludedDisplays.contains(id) { settings.excludedDisplays.remove(id) }
        else { settings.excludedDisplays.insert(id) }
    }

    // MARK: gaze → focus

    private func handle(_ raw: [Double]) {
        if let calibration { calibration.add(raw); return }
        guard !paused, let model else { return }

        let alpha = 1 - settings.smoothing
        smoothed = smoothed.map { s in zip(s, raw).map { $0 * (1 - alpha) + $1 * alpha } } ?? raw
        let pred = model.predict(smoothed!, among: connected)
        if settings.debugLogging, Date().timeIntervalSince(lastDiag) > 1 {
            lastDiag = Date()
            DebugLog.write("pred=\(pred.map { "\($0.display) conf=\(String(format: "%.2f", $0.confidence))" } ?? "nil") trusted=\(FocusManager.isTrusted) focused=\(focus.focusedDisplay.map(String.init) ?? "nil") front=\(NSWorkspace.shared.frontmostApplication?.localizedName ?? "?") known=\(focus.lastWindow.map { "\($0.key):\($0.value.appName)" })")
        }
        state.publishGaze(display: pred?.display, confidence: pred?.confidence ?? 0)
        guard let p = pred else { return }
        let now = Date()

        // Confident frames start or extend a look at a screen. Unsure frames are ignored rather
        // than restarting the timer (confidence flickers around the threshold), but a look that
        // hasn't been confirmed recently expires.
        if p.confidence >= settings.strictness {
            if candidate?.display == p.display { candidate?.lastHit = now }
            else { candidate = (p.display, now, now) }
        }
        guard let c = candidate else { return }
        if now.timeIntervalSince(c.lastHit) > 0.35 { candidate = nil; return }

        guard now.timeIntervalSince(c.since) * 1000 >= settings.dwellMs,
              now.timeIntervalSince(lastSwitch) * 1000 >= settings.cooldownMs,
              CGEventSource.buttonState(.combinedSessionState, button: .left) == false,  // not mid-drag
              !settings.excludedDisplays.contains(c.display),
              // Never move focus while a password field (secure input) is active.
              !IsSecureEventInputEnabled(),
              // Don't split a word across windows: wait for a short pause in typing.
              !settings.waitForTypingPause || CGEventSource.secondsSinceLastEventType(.combinedSessionState, eventType: .keyDown) > 0.35,
              focus.focusedDisplay != c.display else { return }

        lastSwitch = now
        if let w = focus.focus(display: c.display) {
            // Window titles can be private (document names, email subjects): only log them in debug mode.
            DebugLog.write("SWITCH -> \(c.display) \(w.appName)" + (settings.debugLogging ? " \"\(w.title)\" conf=\(String(format: "%.2f", p.confidence))" : ""))
            let screenName = NSScreen.screens.first { $0.displayID == c.display }?.localizedName ?? "screen"
            state.lastSwitch = "\(w.appName) on \(screenName)"
            lastNoWindowLog = nil
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
                guard let self else { return }
                let landed = self.focus.focusedDisplay
                if landed != c.display {
                    DebugLog.write("  focus did not land: now on \(landed.map(String.init) ?? "nil") front=\(NSWorkspace.shared.frontmostApplication?.localizedName ?? "?")")
                }
            }
        } else if lastNoWindowLog != c.display {
            DebugLog.write("no window to focus on screen \(c.display)")
            lastNoWindowLog = c.display
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
