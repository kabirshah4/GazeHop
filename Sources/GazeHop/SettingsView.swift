// Copyright © 2026 Kabir Shah. All rights reserved. See LICENSE.

import AppKit
import AVFoundation
import ServiceManagement
import SwiftUI

/// Hooks the settings UI needs from the running app.
struct SettingsActions {
    var calibrate: () -> Void
    var togglePause: () -> Void
    var forgetCalibration: () -> Void
}

// MARK: - Brand

/// GazeHop's dawn sky (the app icon and website), used for hero surfaces and screen wallpapers.
enum Dawn {
    static let deep = Color(red: 0.137, green: 0.314, blue: 0.753)   // #2350C0
    static let blue = Color(red: 0.227, green: 0.408, blue: 0.847)   // #3A68D8
    static let haze = Color(red: 0.557, green: 0.675, blue: 0.933)   // #8EACEE
    static let blush = Color(red: 0.914, green: 0.812, blue: 0.859)  // #E9CFDB
    static let peach = Color(red: 0.973, green: 0.863, blue: 0.796)  // #F8DCCB
    /// Status colours with enough contrast for small text: Apple's darker accessible
    /// variants in light mode, the bright system colours in dark mode.
    static let live = adaptive(light: NSColor(red: 0.141, green: 0.541, blue: 0.239, alpha: 1),   // #248A3D
                               dark: NSColor(red: 0.188, green: 0.820, blue: 0.345, alpha: 1))    // #30D158
    static let warn = adaptive(light: NSColor(red: 0.788, green: 0.204, blue: 0.0, alpha: 1),     // #C93400
                               dark: NSColor(red: 1.0, green: 0.624, blue: 0.039, alpha: 1))      // #FF9F0A

    private static func adaptive(light: NSColor, dark: NSColor) -> Color {
        Color(nsColor: NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? dark : light })
    }

    /// Hero card: deep blue where the text sits, warming toward the bottom-right corner.
    static var hero: some View {
        ZStack {
            LinearGradient(colors: [deep, blue], startPoint: .topLeading, endPoint: .bottomTrailing)
            RadialGradient(colors: [peach.opacity(0.5), .clear], center: UnitPoint(x: 0.7, y: 1.5), startRadius: 0, endRadius: 240)
        }
    }

    /// A tiny desktop: the same sky, as a screen wallpaper.
    static let wallpaper = LinearGradient(colors: [blue, haze, blush, peach], startPoint: .top, endPoint: .bottom)
}

// MARK: - Panes

enum Pane: String, CaseIterable, Identifiable {
    case general, tracking, screens, permissions, advanced, about
    var id: String { rawValue }

    var title: String {
        switch self {
        case .general: return "General"
        case .tracking: return "Tracking"
        case .screens: return "Screens"
        case .permissions: return "Permissions"
        case .advanced: return "Advanced"
        case .about: return "About"
        }
    }

    var blurb: String {
        switch self {
        case .general: return ""
        case .tracking: return "How quickly focus follows your glance, and how sure GazeHop needs to be."
        case .screens: return "Choose which screens GazeHop can switch to."
        case .permissions: return "What GazeHop needs from macOS, and what it never does."
        case .advanced: return "Diagnostics and calibration data."
        case .about: return ""
        }
    }

    var symbol: String {
        switch self {
        case .general: return "gearshape.fill"
        case .tracking: return "dot.viewfinder"
        case .screens: return "display.2"
        case .permissions: return "hand.raised.fill"
        case .advanced: return "wrench.and.screwdriver.fill"
        case .about: return "info"
        }
    }

    /// Badge colours, System Settings style
    var tint: [Color] {
        switch self {
        case .general: return [Color(white: 0.6), Color(white: 0.42)]
        case .tracking: return [Dawn.blue, Dawn.deep]
        case .screens: return [Color(red: 0.42, green: 0.45, blue: 0.95), Color(red: 0.27, green: 0.29, blue: 0.78)]
        case .permissions: return [Color(red: 0.25, green: 0.6, blue: 1.0), Color(red: 0.0, green: 0.44, blue: 0.89)]
        case .advanced: return [Color(white: 0.5), Color(white: 0.32)]
        case .about: return [Dawn.haze, Dawn.blue]
        }
    }
}

struct Badge: View {
    var symbol: String
    var tint: [Color]
    var size: CGFloat = 22
    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.27, style: .continuous)
            .fill(LinearGradient(colors: tint, startPoint: .top, endPoint: .bottom))
            .overlay(Image(systemName: symbol).font(.system(size: size * 0.5, weight: .semibold)).foregroundStyle(.white))
            .overlay(RoundedRectangle(cornerRadius: size * 0.27, style: .continuous).strokeBorder(.white.opacity(0.18), lineWidth: 0.5))
            .frame(width: size, height: size)
            .shadow(color: .black.opacity(0.18), radius: 0.6, y: 0.5)
            .accessibilityHidden(true)
    }
}

extension Badge {
    init(pane: Pane, size: CGFloat = 22) { self.init(symbol: pane.symbol, tint: pane.tint, size: size) }
}

/// Opens System Settings › Displays (arrange screens, resolution, which display is main).
private func openDisplaysSettings() {
    NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.Displays-Settings.extension")!)
}

/// One spring for everything that moves: critically damped, interruptible, and a plain
/// cross-fade when Reduce Motion is on.
private func motion(_ reduce: Bool) -> Animation {
    reduce ? .easeInOut(duration: 0.15) : .spring(response: 0.35, dampingFraction: 1)
}

// MARK: - Root

struct SettingsView: View {
    // Only settings are observed here. Live tracking state is observed by the views that show it,
    // so ~8 Hz gaze updates never redraw the sidebar list (which made clicks on it get lost).
    @ObservedObject var settings = Settings.shared
    let actions: SettingsActions
    // `--settings tracking` (etc.) opens a specific pane; handy for screenshots and docs
    @State private var pane: Pane = {
        let args = CommandLine.arguments
        if let i = args.firstIndex(of: "--settings"), i + 1 < args.count, let p = Pane(rawValue: args[i + 1]) { return p }
        return .general
    }()

    var body: some View {
        NavigationSplitView {
            Sidebar(pane: $pane, actions: actions)
        } detail: {
            Group {
                switch pane {
                case .general: GeneralPane(settings: settings, actions: actions)
                case .tracking: TrackingPane(settings: settings, actions: actions)
                case .screens: ScreensPane(settings: settings, actions: actions)
                case .permissions: PermissionsPane()
                case .advanced: AdvancedPane(settings: settings, actions: actions)
                case .about: AboutPane()
                }
            }
            .navigationTitle(pane.title)
        }
        .frame(minWidth: 840, minHeight: 580)
    }
}

/// The list depends only on the selected pane, so nothing else can make it redraw.
/// Live status sits below it in its own view.
private struct Sidebar: View {
    @Binding var pane: Pane
    let actions: SettingsActions
    var body: some View {
        List(Pane.allCases, selection: $pane) { p in
            Label { Text(p.title) } icon: { Badge(pane: p) }
                .padding(.vertical, 3)
                .tag(p)
        }
        // Clear the window buttons: without a toolbar the list would start right under them.
        .safeAreaInset(edge: .top, spacing: 0) { Color.clear.frame(height: 10) }
        .safeAreaInset(edge: .bottom, spacing: 0) { SidebarStatus(state: AppState.shared, actions: actions) }
        .frame(minWidth: 215)
        .navigationSplitViewColumnWidth(min: 215, ideal: 215, max: 260)
        .toolbar(removing: .sidebarToggle)
    }
}

private struct SidebarStatus: View {
    @ObservedObject var state: AppState
    let actions: SettingsActions
    var body: some View {
        HStack(spacing: 10) {
            LiveDot(icon: state.icon)
            Text(state.paused ? "Paused" : state.statusText).font(.callout.weight(.medium)).lineLimit(1)
                .truncationMode(.tail)
            Spacer(minLength: 4)
            Button(action: actions.togglePause) {
                Image(systemName: state.paused ? "play.fill" : "pause.fill").font(.system(size: 11, weight: .bold))
                    .frame(width: 26, height: 26)
                    .contentShape(Circle())
            }
            .buttonStyle(.plain)
            .background(.quaternary, in: Circle())
            .help(state.paused ? "Resume GazeHop" : "Pause GazeHop")
            .accessibilityLabel(state.paused ? "Resume" : "Pause")
        }
        .padding(.leading, 12).padding(.trailing, 6).padding(.vertical, 6)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .padding(10)
    }
}

/// Green and softly pulsing while watching, grey when paused, orange when something needs attention.
private struct LiveDot: View {
    let icon: MenuBarIcon.State
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pulse = false

    private var color: Color { icon == .active ? Dawn.live : icon == .paused ? .secondary : Dawn.warn }

    var body: some View {
        Circle().fill(color).frame(width: 8, height: 8)
            .background(Circle().fill(color.opacity(0.35)).scaleEffect(pulse && icon == .active && !reduce ? 2.2 : 1).opacity(pulse ? 0 : 1))
            .onAppear { withAnimation(.easeOut(duration: 1.6).repeatForever(autoreverses: false)) { pulse = true } }
            .accessibilityHidden(true)
    }
}

/// System Settings-style header at the top of a pane: big badge, title, one line of context.
private struct PaneHeader: View {
    let pane: Pane
    var body: some View {
        HStack(spacing: 14) {
            Badge(pane: pane, size: 44)
            VStack(alignment: .leading, spacing: 3) {
                Text(pane.title).font(.title2.weight(.semibold))
                Text(pane.blurb).font(.callout).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.vertical, 6)
    }
}

// MARK: - General

private struct GeneralPane: View {
    @ObservedObject var settings: Settings
    let actions: SettingsActions

    var body: some View {
        Form {
            // The hero lives in a normal section so it lines up with every section below; its sky
            // reaches past the row's 10 pt inset to fill the section box edge to edge.
            Section {
                StatusHero(state: AppState.shared, settings: settings, actions: actions)
            }

            Section {
                Toggle(isOn: $settings.waitForTypingPause) {
                    Text("Wait until I stop typing")
                    Text("Focus never moves mid-word. GazeHop also never switches while a password field is active.")
                }
                Toggle(isOn: $settings.movePointer) {
                    Text("Bring the pointer along")
                    Text("Moves the pointer to the window you look at, so scrolling works right away.")
                }
                Toggle("Play a sound when pausing and resuming", isOn: $settings.playSounds)
            } header: { Text("When focus moves") }

            Section {
                LabeledContent {
                    Picker("Shortcut", selection: $settings.hotKey) {
                        ForEach(HotKeyPreset.allCases) { Text($0.label).tag($0) }
                    }
                    .labelsHidden()
                    .fixedSize()
                } label: {
                    Text("Pause and resume")
                    Text("Works from any app. On Mac laptop keyboards, hold Fn for F1.")
                }
            } header: { Text("Keyboard shortcut") }

            Section {
                LaunchAtLoginRow(settings: settings)
                Toggle("Show “GazeHop” next to the menu bar icon", isOn: $settings.showNameInMenuBar)
            } header: { Text("Startup and menu bar") }
        }
        .formStyle(.grouped)
    }
}

/// The first thing you see: is it working, where are you looking, and one button to pause.
private struct StatusHero: View {
    @ObservedObject var state: AppState
    @ObservedObject var settings: Settings
    let actions: SettingsActions
    @Environment(\.accessibilityReduceMotion) private var reduce

    private var title: String {
        if state.paused { return "Paused" }
        if state.icon == .attention { return state.statusText }
        return "Watching"
    }

    private var detail: String {
        if state.paused { return "Focus stays where you put it until you resume." }
        if state.icon == .attention { return "Open GazeHop's menu to fix this." }
        if !state.faceVisible { return "Waiting to see your face." }
        if let id = state.looking, let s = NSScreen.screens.first(where: { $0.displayID == id }) { return "Looking at \(s.localizedName)" }
        return "Focus follows your glance."
    }

    var body: some View {
        HStack(spacing: 16) {
            Image(nsImage: NSApp.applicationIconImage).resizable().frame(width: 64, height: 64)
                .shadow(color: .black.opacity(0.25), radius: 8, y: 4)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 7) {
                    LiveDot(icon: state.icon)
                    Text(title).font(.title2.weight(.semibold)).contentTransition(.opacity)
                }
                Text(detail).font(.callout).foregroundStyle(.white.opacity(0.85)).lineLimit(2)
                    .contentTransition(.opacity)
            }
            .animation(motion(reduce), value: title)
            .animation(motion(reduce), value: detail)
            Spacer(minLength: 12)
            VStack(alignment: .trailing, spacing: 6) {
                Button(action: actions.togglePause) {
                    Label(state.paused ? "Resume" : "Pause", systemImage: state.paused ? "play.fill" : "pause.fill")
                        .font(.body.weight(.semibold))
                        .padding(.horizontal, 6)
                }
                .buttonStyle(HeroButtonStyle())
                if settings.hotKey != .none {
                    KeyCaps(label: settings.hotKey.label).opacity(0.9)
                }
            }
        }
        .foregroundStyle(.white)
        .padding(.vertical, 12)
        .padding(.horizontal, 6)
        .background {
            Dawn.hero
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .padding(-10)
        }
        .accessibilityElement(children: .combine)
    }
}

/// White pill on the dawn card; presses down instantly.
private struct HeroButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(Dawn.deep)
            .padding(.vertical, 7).padding(.horizontal, 12)
            .background(.white, in: Capsule())
            .shadow(color: .black.opacity(0.18), radius: 6, y: 3)
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.spring(response: 0.2, dampingFraction: 1), value: configuration.isPressed)
    }
}

/// "⌘F1" drawn as keycaps.
private struct KeyCaps: View {
    let label: String
    private var keys: [String] {
        var out: [String] = []
        var rest = Substring(label)
        for mod in ["⌃", "⌥", "⇧", "⌘"] where rest.hasPrefix(mod) || rest.contains(mod) {
            if let r = rest.range(of: mod) { out.append(mod); rest.removeSubrange(r) }
        }
        if !rest.isEmpty { out.append(String(rest)) }
        return out
    }
    var body: some View {
        HStack(spacing: 3) {
            ForEach(keys, id: \.self) { k in
                Text(k).font(.system(size: 11, weight: .semibold, design: .rounded))
                    .frame(minWidth: 18).padding(.horizontal, 4).padding(.vertical, 2)
                    .background(.white.opacity(0.2), in: RoundedRectangle(cornerRadius: 4, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 4, style: .continuous).strokeBorder(.white.opacity(0.35), lineWidth: 0.5))
            }
        }
        .accessibilityLabel("Shortcut \(label)")
    }
}

private struct LaunchAtLoginRow: View {
    @ObservedObject var settings: Settings
    var body: some View {
        let status = settings.launchAtLoginStatus
        Toggle(isOn: Binding(get: { status == .enabled || status == .requiresApproval },
                             set: { settings.setLaunchAtLogin($0) })) {
            Text("Open GazeHop when you log in")
            if status == .requiresApproval {
                Text("macOS needs your OK: allow GazeHop in Login Items.")
            }
        }
        if status == .requiresApproval {
            Button("Open Login Items Settings…") { SMAppService.openSystemSettingsLoginItems() }
        }
    }
}

// MARK: - Tracking

/// Ready-made combinations of the four tracking values. Anything else is "Custom".
private enum Feel: String, CaseIterable, Identifiable {
    case snappy, balanced, relaxed, custom
    var id: String { rawValue }
    var title: String { rawValue.capitalized }

    var values: (dwell: Double, cooldown: Double, strictness: Double, smoothing: Double)? {
        switch self {
        case .snappy: return (150, 400, 0.15, 0.4)
        case .balanced: return (250, 600, 0.2, 0.55)
        case .relaxed: return (450, 1000, 0.3, 0.7)
        case .custom: return nil
        }
    }

    var summary: String {
        switch self {
        case .snappy: return "Switches after a quick glance. Best if you hop between screens constantly."
        case .balanced: return "A quarter-second look moves focus. The default, and right for most desks."
        case .relaxed: return "Waits for a deliberate look. Best if you glance around a lot while typing."
        case .custom: return "Your own mix. Adjust each value below."
        }
    }

    static func matching(_ s: Settings) -> Feel {
        allCases.first { f in
            guard let v = f.values else { return false }
            return abs(v.dwell - s.dwellMs) < 1 && abs(v.cooldown - s.cooldownMs) < 1
                && abs(v.strictness - s.strictness) < 0.001 && abs(v.smoothing - s.smoothing) < 0.001
        } ?? .custom
    }
}

private struct TrackingPane: View {
    @ObservedObject var settings: Settings
    let actions: SettingsActions
    @State private var fineTune = false
    @Environment(\.accessibilityReduceMotion) private var reduce

    private var feel: Binding<Feel> {
        Binding(get: { Feel.matching(settings) }, set: { f in
            guard let v = f.values else { fineTune = true; return }
            withAnimation(motion(reduce)) {
                settings.dwellMs = v.dwell; settings.cooldownMs = v.cooldown
                settings.strictness = v.strictness; settings.smoothing = v.smoothing
            }
        })
    }

    var body: some View {
        Form {
            Section { PaneHeader(pane: .tracking) }

            Section {
                LiveGazeView(state: AppState.shared, excluded: settings.excludedDisplays)
            } header: { Text("Right now") }

            Section {
                Picker("Feel", selection: feel) {
                    ForEach(Feel.allCases) { Text($0.title).tag($0) }
                }
                .pickerStyle(.segmented)
                .labelsHidden()
                Text(Feel.matching(settings).summary).font(.callout).foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                DisclosureGroup("Fine-tune", isExpanded: Binding(get: { fineTune || Feel.matching(settings) == .custom }, set: { fineTune = $0 })) {
                    VStack(spacing: 14) {
                        SliderRow(title: "Look time", detail: "How long you look at a screen before focus moves there.",
                                  value: $settings.dwellMs, range: 100...1000, step: 50, low: "Quicker", high: "Longer") { "\(Int($0)) ms" }
                        SliderRow(title: "Time between switches", detail: "Stops a quick glance back from bouncing focus.",
                                  value: $settings.cooldownMs, range: 200...2000, step: 100, low: "Shorter", high: "Longer") { String(format: "%.1f s", $0 / 1000) }
                        SliderRow(title: "Strictness", detail: "Raise it if GazeHop switches when you don't mean to.",
                                  value: $settings.strictness, range: 0.05...0.6, step: 0.05, low: "Looser", high: "Stricter") { "\(Int(($0 * 100).rounded()))%" }
                        SliderRow(title: "Smoothing", detail: "Higher is steadier, lower reacts faster.",
                                  value: $settings.smoothing, range: 0...0.9, step: 0.05, low: "Faster", high: "Steadier") { "\(Int(($0 * 100).rounded()))%" }
                        HStack {
                            Spacer()
                            Button("Restore Defaults") { withAnimation(motion(reduce)) { settings.resetTracking() } }
                                .disabled(Feel.matching(settings) == .balanced)
                        }
                    }
                    .padding(.top, 10)
                }
            } header: { Text("How it feels") }

            Section {
                CalibrationRow(state: AppState.shared, actions: actions)
            } header: { Text("Calibration") }
        }
        .formStyle(.grouped)
    }
}

private struct CalibrationRow: View {
    @ObservedObject var state: AppState
    let actions: SettingsActions
    var body: some View {
        let total = NSScreen.screens.count
        let done = NSScreen.screens.filter { state.calibrated.contains($0.displayID) }.count
        LabeledContent {
            Button(done < total ? "Calibrate…" : "Recalibrate…", action: actions.calibrate)
                .buttonStyle(.borderedProminent)
        } label: {
            Label {
                Text(done == total ? "All \(total) screens calibrated" : "\(done) of \(total) screens calibrated")
                Text("Recalibrate after moving your chair, camera or screens.")
            } icon: {
                Image(systemName: done == total ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                    .foregroundStyle(done == total ? Dawn.live : Dawn.warn)
            }
        }
    }
}

/// A slider without tick marks (values still snap to `step`), with plain-language ends.
private struct SliderRow: View {
    let title: String
    let detail: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let step: Double
    let low: String
    let high: String
    let format: (Double) -> String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline) {
                Text(title)
                Spacer()
                Text(format(value)).monospacedDigit().foregroundStyle(.secondary)
                    .contentTransition(.numericText())
                    .padding(.horizontal, 7).padding(.vertical, 2)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 5, style: .continuous))
            }
            Slider(value: Binding(get: { value }, set: { value = (($0 / step).rounded() * step).clamped(to: range) }), in: range) {
                Text(title)
            } minimumValueLabel: {
                Text(low).font(.caption).foregroundStyle(.secondary)
            } maximumValueLabel: {
                Text(high).font(.caption).foregroundStyle(.secondary)
            }
            .labelsHidden()
            .accessibilityValue(format(value))
            Text(detail).font(.caption).foregroundStyle(.secondary)
        }
    }
}

private extension Comparable {
    func clamped(to r: ClosedRange<Self>) -> Self { min(max(self, r.lowerBound), r.upperBound) }
}

/// What GazeHop sees right now: which screen you're looking at, and how sure it is.
private struct LiveGazeView: View {
    @ObservedObject var state: AppState
    let excluded: Set<UInt32>

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ScreenMap(highlight: state.paused ? nil : state.looking, excluded: excluded, calibrated: state.calibrated, height: 130)
            HStack(spacing: 10) {
                Image(systemName: symbol)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(state.faceVisible && !state.paused ? Dawn.blue : .secondary)
                    .frame(width: 20)
                VStack(alignment: .leading, spacing: 1) {
                    Text(headline).font(.callout.weight(.medium))
                    if let last = state.lastSwitch {
                        Text("Last switch: \(last)").font(.caption).foregroundStyle(.secondary)
                    }
                }
                Spacer()
                if state.faceVisible && !state.paused {
                    ConfidenceMeter(value: min(1, state.confidence / 0.6))
                }
            }
        }
        .padding(.vertical, 4)
    }

    private var symbol: String {
        if state.paused { return "pause.circle.fill" }
        return state.faceVisible ? "dot.viewfinder" : "person.crop.circle.badge.questionmark"
    }

    private var headline: String {
        if state.paused { return "Paused" }
        if !state.faceVisible { return "No face in view" }
        if let id = state.looking, let s = NSScreen.screens.first(where: { $0.displayID == id }) {
            return "Looking at \(s.localizedName)"
        }
        return "Watching"
    }
}

/// Five bars, like signal strength: how clearly GazeHop can tell which screen you're on.
private struct ConfidenceMeter: View {
    let value: Double
    @Environment(\.accessibilityReduceMotion) private var reduce
    var body: some View {
        HStack(spacing: 8) {
            Text("Confidence").font(.caption).foregroundStyle(.secondary)
            HStack(alignment: .bottom, spacing: 2.5) {
                ForEach(0..<5) { i in
                    Capsule()
                        .fill(Double(i) < (value * 5).rounded() ? AnyShapeStyle(Dawn.blue) : AnyShapeStyle(.quaternary))
                        .frame(width: 4, height: 6 + CGFloat(i) * 2.5)
                }
            }
            .animation(motion(reduce), value: (value * 5).rounded())
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Confidence \(Int(value * 100)) percent")
    }
}

// MARK: - Screens

private struct ScreensPane: View {
    @ObservedObject var settings: Settings
    let actions: SettingsActions
    @State private var screens = NSScreen.screens

    var body: some View {
        Form {
            Section { PaneHeader(pane: .screens) }

            Section {
                ScreenMapLive(settings: settings, height: 170) { toggle($0) }
                HStack(alignment: .firstTextBaseline) {
                    Text("Click a screen to turn switching to it on or off. The ring shows where you're looking.")
                        .font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Button("Arrange Displays…", action: openDisplaysSettings)
                }
            }

            Section {
                ForEach(screens, id: \.displayID) { screen in
                    ScreenRow(screen: screen, isMain: screen == NSScreen.screens.first, state: AppState.shared,
                              on: Binding(get: { !settings.excludedDisplays.contains(screen.displayID) }, set: { _ in toggle(screen.displayID) }))
                }
            } header: { Text("Switch focus to") } footer: {
                if settings.excludedDisplays.count == screens.count - 1, screens.count > 1 {
                    Text("Only one screen is on, so GazeHop has nowhere to switch to.").font(.caption).foregroundStyle(Dawn.warn)
                }
            }

            UncalibratedNotice(state: AppState.shared, screens: screens, actions: actions)
        }
        .formStyle(.grouped)
        .onReceive(NotificationCenter.default.publisher(for: NSApplication.didChangeScreenParametersNotification)) { _ in
            screens = NSScreen.screens
        }
    }

    private func toggle(_ id: UInt32) {
        if settings.excludedDisplays.contains(id) { settings.excludedDisplays.remove(id) }
        else { settings.excludedDisplays.insert(id) }
    }
}

/// The map observes live state on its own, so the rest of the pane doesn't redraw with gaze.
private struct ScreenMapLive: View {
    @ObservedObject var settings: Settings
    let height: CGFloat
    let onTap: (UInt32) -> Void
    var body: some View { Inner(state: AppState.shared, excluded: settings.excludedDisplays, height: height, onTap: onTap) }

    private struct Inner: View {
        @ObservedObject var state: AppState
        let excluded: Set<UInt32>
        let height: CGFloat
        let onTap: (UInt32) -> Void
        var body: some View {
            ScreenMap(highlight: state.paused ? nil : state.looking, excluded: excluded, calibrated: state.calibrated, height: height, onTap: onTap)
        }
    }
}

private struct ScreenRow: View {
    let screen: NSScreen
    let isMain: Bool
    @ObservedObject var state: AppState
    @Binding var on: Bool

    private var isBuiltIn: Bool { CGDisplayIsBuiltin(screen.displayID) != 0 }

    var body: some View {
        let calibrated = state.calibrated.contains(screen.displayID)
        Toggle(isOn: $on) {
            HStack(spacing: 12) {
                Image(systemName: isBuiltIn ? "laptopcomputer" : "display")
                    .font(.system(size: 20, weight: .regular))
                    .foregroundStyle(on ? Dawn.blue : .secondary)
                    .frame(width: 30)
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Text(screen.localizedName)
                        if isMain { Chip(text: "Main", color: .secondary) }
                    }
                    HStack(spacing: 8) {
                        Text("\(Int(screen.frame.width)) × \(Int(screen.frame.height))").monospacedDigit()
                        Chip(text: calibrated ? "Calibrated" : "Not calibrated", color: calibrated ? Dawn.live : Dawn.warn,
                             symbol: calibrated ? "checkmark" : "exclamationmark")
                    }
                    .font(.caption).foregroundStyle(.secondary)
                }
            }
        }
    }
}

private struct Chip: View {
    let text: String
    let color: Color
    var symbol: String? = nil
    var body: some View {
        HStack(spacing: 3) {
            if let symbol { Image(systemName: symbol).font(.system(size: 8, weight: .heavy)) }
            Text(text).font(.caption2.weight(.semibold))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 6).padding(.vertical, 1.5)
        .background(color.opacity(0.14), in: Capsule())
    }
}

private struct UncalibratedNotice: View {
    @ObservedObject var state: AppState
    let screens: [NSScreen]
    let actions: SettingsActions
    var body: some View {
        let missing = screens.filter { !state.calibrated.contains($0.displayID) }.count
        if missing > 0 {
            Section {
                LabeledContent {
                    Button("Calibrate…", action: actions.calibrate).buttonStyle(.borderedProminent)
                } label: {
                    Label {
                        Text(missing == 1 ? "1 screen isn't calibrated yet" : "\(missing) screens aren't calibrated yet")
                        Text("GazeHop can't switch to a screen until it knows what looking at it looks like.")
                    } icon: { Image(systemName: "exclamationmark.circle.fill").foregroundStyle(Dawn.warn) }
                }
            }
        }
    }
}

/// Displays drawn in their real arrangement, each with GazeHop's dawn wallpaper.
private struct ScreenMap: View {
    let highlight: UInt32?
    let excluded: Set<UInt32>
    let calibrated: Set<UInt32>
    var height: CGFloat
    var onTap: ((UInt32) -> Void)? = nil
    @Environment(\.accessibilityReduceMotion) private var reduce

    var body: some View {
        GeometryReader { geo in
            let screens = NSScreen.screens
            let union = screens.reduce(CGRect.null) { $0.union($1.frame) }
            let scale = min((geo.size.width - 40) / max(union.width, 1), (geo.size.height - 24) / max(union.height, 1))
            let ox = (geo.size.width - union.width * scale) / 2, oy = (geo.size.height - union.height * scale) / 2
            ZStack(alignment: .topLeading) {
                ForEach(screens, id: \.displayID) { s in
                    let r = s.frame
                    ScreenTile(name: s.localizedName,
                               on: !excluded.contains(s.displayID),
                               looking: highlight == s.displayID,
                               calibrated: calibrated.contains(s.displayID),
                               interactive: onTap != nil,
                               reduce: reduce) { onTap?(s.displayID) }
                        .frame(width: max(r.width * scale - 8, 12), height: max(r.height * scale - 8, 12))
                        .offset(x: ox + (r.minX - union.minX) * scale + 4,
                                y: oy + (union.maxY - r.maxY) * scale + 4)   // AppKit's origin is bottom-left
                }
            }
        }
        .frame(height: height)
    }
}

private struct ScreenTile: View {
    let name: String
    let on: Bool
    let looking: Bool
    let calibrated: Bool
    let interactive: Bool
    let reduce: Bool
    let tap: () -> Void

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: 7, style: .continuous)
        ZStack(alignment: .top) {
            shape.fill(Dawn.wallpaper).saturation(on ? 1 : 0).opacity(on ? 1 : 0.45)
            // menu bar
            Rectangle().fill(.white.opacity(0.45)).frame(height: 5)
            VStack(spacing: 3) {
                Spacer()
                Text(name).font(.caption.weight(.semibold)).lineLimit(1).minimumScaleFactor(0.7)
                    .padding(.horizontal, 7).padding(.vertical, 2.5)
                    .background(.ultraThinMaterial, in: Capsule())
                if !on { Text("Off").font(.caption2.weight(.semibold)).foregroundStyle(.secondary) }
                else if !calibrated { Text("Not calibrated").font(.caption2.weight(.semibold)).foregroundStyle(Dawn.warn) }
                Spacer()
            }
            .padding(4)
        }
        .clipShape(shape)
        .overlay(shape.strokeBorder(Color.primary.opacity(on ? 0.15 : 0.25), style: StrokeStyle(lineWidth: 1, dash: on ? [] : [4, 3])))
        .overlay(shape.inset(by: -3).stroke(Color.accentColor, lineWidth: 2.5).opacity(looking ? 1 : 0))
        .shadow(color: looking ? Color.accentColor.opacity(0.45) : .black.opacity(0.12), radius: looking ? 10 : 3, y: looking ? 0 : 1)
        .overlay(alignment: .topTrailing) {
            if interactive {
                Image(systemName: on ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 15, weight: .semibold))
                    .symbolRenderingMode(.palette)
                    .foregroundStyle(on ? Color.white : Color.secondary, on ? Color.accentColor : Color.clear)
                    .background(Circle().fill(.background).padding(1))
                    .offset(x: 5, y: -5)
            }
        }
        .scaleEffect(looking && !reduce ? 1.02 : 1)
        .animation(motion(reduce), value: looking)
        .animation(motion(reduce), value: on)
        .contentShape(Rectangle())
        .onTapGesture { if interactive { tap() } }
        .help(interactive ? "Click to turn switching to \(name) \(on ? "off" : "on")" : name)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(name), \(on ? "on" : "off")\(looking ? ", looking here" : "")")
        .accessibilityAddTraits(interactive ? .isButton : [])
    }
}

// MARK: - Permissions

private struct PermissionsPane: View {
    @State private var camera = AVCaptureDevice.authorizationStatus(for: .video)
    @State private var accessibility = FocusManager.isTrusted
    private let tick = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    private var missing: Int { (camera == .authorized ? 0 : 1) + (accessibility ? 0 : 1) }

    var body: some View {
        Form {
            Section { PaneHeader(pane: .permissions) }

            Section {
                HStack(spacing: 12) {
                    Image(systemName: missing == 0 ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                        .font(.system(size: 22)).foregroundStyle(missing == 0 ? Dawn.live : Dawn.warn)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(missing == 0 ? "All set" : missing == 1 ? "1 permission needed" : "2 permissions needed")
                            .font(.headline)
                        Text(missing == 0 ? "GazeHop has everything it needs." : "GazeHop can't switch focus until you allow it below.")
                            .font(.callout).foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }

            Section {
                PermissionRow(title: "Camera", symbol: "camera.fill", tint: [Color(red: 0.3, green: 0.8, blue: 0.45), Color(red: 0.16, green: 0.62, blue: 0.3)],
                              detail: "Sees which screen you're looking at. Frames are analysed on this Mac and discarded.",
                              granted: camera == .authorized,
                              state: camera == .notDetermined ? "Not asked yet" : "Not allowed",
                              url: "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera")
                PermissionRow(title: "Accessibility", symbol: "accessibility", tint: [Color(red: 0.25, green: 0.6, blue: 1.0), Color(red: 0.0, green: 0.44, blue: 0.89)],
                              detail: "Brings the window on the screen you look at to the front. GazeHop never reads what you type.",
                              granted: accessibility,
                              state: "Not allowed",
                              url: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
            } header: { Text("GazeHop needs") }

            Section {
                PrivacyRow(symbol: "network.slash", tint: [Color(red: 0.42, green: 0.45, blue: 0.95), Color(red: 0.27, green: 0.29, blue: 0.78)],
                           title: "Nothing leaves this Mac", detail: "GazeHop has no network code, accounts or analytics.")
                PrivacyRow(symbol: "camera.metering.none", tint: [Color(white: 0.6), Color(white: 0.42)],
                           title: "No images are kept", detail: "Calibration is a few numbers per screen, not pictures.")
                PrivacyRow(symbol: "chevron.left.forwardslash.chevron.right", tint: [Dawn.blue, Dawn.deep],
                           title: "Check it yourself", detail: "GazeHop's source code is published on GitHub.")
            } header: { Text("Privacy") }
        }
        .formStyle(.grouped)
        .onReceive(tick) { _ in
            camera = AVCaptureDevice.authorizationStatus(for: .video)
            accessibility = FocusManager.isTrusted
        }
    }
}

private struct PermissionRow: View {
    let title: String, symbol: String, tint: [Color], detail: String
    let granted: Bool, state: String, url: String

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            Badge(symbol: symbol, tint: tint, size: 30)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.body.weight(.medium))
                Text(detail).font(.caption).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 12)
            if granted {
                Chip(text: "Allowed", color: Dawn.live, symbol: "checkmark")
            } else {
                VStack(alignment: .trailing, spacing: 4) {
                    Button("Allow…") { NSWorkspace.shared.open(URL(string: url)!) }.buttonStyle(.borderedProminent)
                    Text(state).font(.caption).foregroundStyle(Dawn.warn)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

private struct PrivacyRow: View {
    let symbol: String, tint: [Color], title: String, detail: String
    var body: some View {
        HStack(spacing: 12) {
            Badge(symbol: symbol, tint: tint, size: 26)
            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                Text(detail).font(.caption).foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 2)
    }
}

// MARK: - Advanced

private struct AdvancedPane: View {
    @ObservedObject var settings: Settings
    let actions: SettingsActions
    @State private var confirmDelete = false

    var body: some View {
        Form {
            Section { PaneHeader(pane: .advanced) }

            Section {
                Toggle(isOn: $settings.debugLogging) {
                    Text("Detailed debug logging")
                    Text("Writes predictions once a second to the log. Useful when reporting a problem.")
                }
                LabeledContent {
                    Button("Show in Finder") { NSWorkspace.shared.activateFileViewerSelecting([DebugLog.url]) }
                } label: {
                    Text("Log file")
                    Text(DebugLog.url.path.replacingOccurrences(of: NSHomeDirectory(), with: "~")).monospaced()
                }
            } header: { Text("Diagnostics") }

            Section {
                LabeledContent {
                    Button("Recalibrate…", action: actions.calibrate)
                } label: {
                    Text("Calibrate again")
                    Text("After moving your chair, camera or screens.")
                }
                LabeledContent {
                    Button("Delete…", role: .destructive) { confirmDelete = true }
                } label: {
                    Text("Delete calibration data")
                    Text("A few averaged head and eye angles per screen, stored only on this Mac.")
                }
            } header: { Text("Calibration data") }
            .confirmationDialog("Delete calibration data?", isPresented: $confirmDelete) {
                Button("Delete", role: .destructive, action: actions.forgetCalibration)
            } message: {
                Text("GazeHop stops switching until you calibrate again.")
            }
        }
        .formStyle(.grouped)
    }
}

// MARK: - About

private struct AboutPane: View {
    private var version: String { Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "dev" }

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
            Image(nsImage: NSApp.applicationIconImage).resizable().frame(width: 128, height: 128)
                .shadow(color: Dawn.deep.opacity(0.35), radius: 18, y: 10)
                .accessibilityHidden(true)
            Text("GazeHop").font(.largeTitle.weight(.semibold)).padding(.top, 14)
            Text("Version \(version)").font(.callout).foregroundStyle(.secondary).padding(.top, 2)
            Text("Look at a screen, and your keyboard follows.")
                .font(.system(.title3, design: .serif)).foregroundStyle(.secondary).padding(.top, 14)
            HStack(spacing: 10) {
                Link(destination: URL(string: "https://gazehop.gazehop-site.workers.dev")!) { Label("Website", systemImage: "safari") }
                Link(destination: URL(string: "https://github.com/kabirshah4/GazeHop")!) { Label("Source Code", systemImage: "chevron.left.forwardslash.chevron.right") }
                Link(destination: URL(string: "https://github.com/kabirshah4/GazeHop/issues")!) { Label("Report a Problem", systemImage: "exclamationmark.bubble") }
            }
            .buttonStyle(.bordered)
            .controlSize(.large)
            .padding(.top, 24)
            Spacer()
            VStack(spacing: 3) {
                Text("Free to use. © 2026 Kabir Shah. All rights reserved.")
                Link("License and third-party notices", destination: URL(string: "https://gazehop.gazehop-site.workers.dev/terms")!)
            }
            .font(.caption).foregroundStyle(.tertiary)
            .padding(.bottom, 18)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Window

/// Hosts SettingsView in a normal window (GazeHop has no Dock icon, so we manage it ourselves).
final class SettingsWindowController {
    private var window: NSWindow?
    private let actions: SettingsActions

    init(actions: SettingsActions) { self.actions = actions }

    func show() {
        if window == nil {
            let host = NSHostingController(rootView: SettingsView(actions: actions))
            let w = NSWindow(contentViewController: host)
            w.title = "GazeHop Settings"
            w.styleMask = [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView]
            w.toolbarStyle = .unified
            w.isReleasedWhenClosed = false
            w.setContentSize(NSSize(width: 860, height: 640))
            w.contentMinSize = NSSize(width: 840, height: 580)
            w.center()
            w.setFrameAutosaveName("GazeHopSettings")
            window = w
        }
        NSApp.activate(ignoringOtherApps: true)
        window?.makeKeyAndOrderFront(nil)
    }
}
