import AppKit
import SwiftUI

/// Hooks the settings UI needs from the running app.
struct SettingsActions {
    var calibrate: () -> Void
    var calibratedDisplays: () -> Set<UInt32>
}

struct SettingsView: View {
    @ObservedObject var settings = Settings.shared
    let actions: SettingsActions

    var body: some View {
        TabView {
            GeneralTab(settings: settings)
                .tabItem { Label("General", systemImage: "gearshape") }
            TrackingTab(settings: settings, actions: actions)
                .tabItem { Label("Tracking", systemImage: "eye") }
            ScreensTab(settings: settings, actions: actions)
                .tabItem { Label("Screens", systemImage: "display.2") }
            AdvancedTab(settings: settings)
                .tabItem { Label("Advanced", systemImage: "wrench.and.screwdriver") }
        }
        .frame(width: 520, height: 380)
    }
}

private struct GeneralTab: View {
    @ObservedObject var settings: Settings
    var body: some View {
        Form {
            Toggle("Launch GazeHop at login", isOn: Binding(
                get: { settings.launchAtLogin }, set: { settings.launchAtLogin = $0 }))
            Toggle("Show “GazeHop” next to the menu bar icon", isOn: $settings.showNameInMenuBar)
            Toggle("Move the pointer to the focused window", isOn: $settings.movePointer)
            Text("Lets scrolling work right away on the screen you look at.")
                .font(.caption).foregroundStyle(.secondary)
            Toggle("Play a sound when pausing / resuming", isOn: $settings.playSounds)
            Picker("Pause / resume shortcut", selection: $settings.hotKey) {
                ForEach(HotKeyPreset.allCases) { Text($0.label).tag($0) }
            }
            Text("On Mac keyboards F-keys may need Fn held, e.g. Fn⌘F1.")
                .font(.caption).foregroundStyle(.secondary)
        }
        .formStyle(.grouped)
    }
}

private struct TrackingTab: View {
    @ObservedObject var settings: Settings
    let actions: SettingsActions
    var body: some View {
        Form {
            Section {
                LabeledSlider(title: "Look time before switching", value: $settings.dwellMs,
                              range: 100...1000, step: 50, format: { "\(Int($0)) ms" })
                LabeledSlider(title: "Minimum time between switches", value: $settings.cooldownMs,
                              range: 200...2000, step: 100, format: { String(format: "%.1f s", $0 / 1000) })
                LabeledSlider(title: "Strictness", value: $settings.strictness,
                              range: 0.05...0.6, step: 0.05, format: { "\(Int($0 * 100))%" })
                LabeledSlider(title: "Smoothing", value: $settings.smoothing,
                              range: 0...0.9, step: 0.05, format: { "\(Int($0 * 100))%" })
            } footer: {
                Text("Switching too eagerly? Raise look time or strictness. Too sluggish? Lower them.")
                    .font(.caption).foregroundStyle(.secondary)
            }
            HStack {
                Button("Recalibrate…", action: actions.calibrate)
                Spacer()
                Button("Reset to defaults") { settings.resetTracking() }
            }
        }
        .formStyle(.grouped)
    }
}

private struct ScreensTab: View {
    @ObservedObject var settings: Settings
    let actions: SettingsActions
    @State private var screens: [NSScreen] = NSScreen.screens

    var body: some View {
        let calibrated = actions.calibratedDisplays()
        Form {
            Section {
                ForEach(Array(screens.enumerated()), id: \.offset) { i, screen in
                    let id = screen.displayID
                    Toggle(isOn: Binding(
                        get: { !settings.excludedDisplays.contains(id) },
                        set: { on in
                            if on { settings.excludedDisplays.remove(id) } else { settings.excludedDisplays.insert(id) }
                        })) {
                        HStack {
                            Image(systemName: "display")
                            VStack(alignment: .leading) {
                                Text("\(i + 1). \(screen.localizedName)")
                                Text("\(Int(screen.frame.width))×\(Int(screen.frame.height))"
                                     + (calibrated.contains(id) ? "" : " · not calibrated"))
                                    .font(.caption)
                                    .foregroundStyle(calibrated.contains(id) ? Color.secondary : Color.orange)
                            }
                        }
                    }
                }
            } header: {
                Text("Switch focus to these screens")
            } footer: {
                Text("Turn off screens you only watch (a TV, a video on a side monitor). GazeHop never moves focus to them.")
                    .font(.caption).foregroundStyle(.secondary)
            }
            if screens.contains(where: { !calibrated.contains($0.displayID) }) {
                Button("Calibrate new screens…", action: actions.calibrate)
            }
        }
        .formStyle(.grouped)
        .onReceive(NotificationCenter.default.publisher(for: NSApplication.didChangeScreenParametersNotification)) { _ in
            screens = NSScreen.screens
        }
    }
}

private struct AdvancedTab: View {
    @ObservedObject var settings: Settings
    var body: some View {
        Form {
            Toggle("Detailed debug logging", isOn: $settings.debugLogging)
            HStack {
                Button("Open log") { NSWorkspace.shared.open(DebugLog.url) }
                Button("Accessibility settings") {
                    NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")!)
                }
                Button("Camera settings") {
                    NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera")!)
                }
            }
            LabeledContent("Accessibility", value: FocusManager.isTrusted ? "Allowed" : "Not allowed")
            LabeledContent("Version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "dev")
        }
        .formStyle(.grouped)
    }
}

private struct LabeledSlider: View {
    let title: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let step: Double
    let format: (Double) -> String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(title)
                Spacer()
                Text(format(value)).monospacedDigit().foregroundStyle(.secondary)
            }
            Slider(value: $value, in: range, step: step)
        }
    }
}

/// Hosts SettingsView in a normal window (GazeHop has no Dock icon, so we manage it ourselves).
final class SettingsWindowController {
    private var window: NSWindow?
    private let actions: SettingsActions

    init(actions: SettingsActions) { self.actions = actions }

    func show() {
        if window == nil {
            let w = NSWindow(contentRect: .zero, styleMask: [.titled, .closable], backing: .buffered, defer: false)
            w.title = "GazeHop Settings"
            w.contentView = NSHostingView(rootView: SettingsView(actions: actions))
            w.isReleasedWhenClosed = false
            w.center()
            window = w
        }
        NSApp.activate(ignoringOtherApps: true)
        window?.makeKeyAndOrderFront(nil)
    }
}
