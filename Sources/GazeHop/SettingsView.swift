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

    var symbol: String {
        switch self {
        case .general: return "gearshape.fill"
        case .tracking: return "eye.fill"
        case .screens: return "display.2"
        case .permissions: return "lock.shield.fill"
        case .advanced: return "wrench.and.screwdriver.fill"
        case .about: return "info.circle.fill"
        }
    }

    /// Badge colours, System Settings style
    var tint: [Color] {
        switch self {
        case .general: return [Color(white: 0.62), Color(white: 0.45)]
        case .tracking: return [Color(red: 0.42, green: 0.55, blue: 0.75), Color(red: 0.25, green: 0.36, blue: 0.55)]
        case .screens: return [Color(red: 0.45, green: 0.47, blue: 0.85), Color(red: 0.29, green: 0.30, blue: 0.66)]
        case .permissions: return [Color(red: 0.35, green: 0.62, blue: 0.55), Color(red: 0.2, green: 0.45, blue: 0.4)]
        case .advanced: return [Color(white: 0.5), Color(white: 0.32)]
        case .about: return [Color(red: 0.4, green: 0.6, blue: 0.95), Color(red: 0.22, green: 0.42, blue: 0.82)]
        }
    }
}

struct Badge: View {
    let pane: Pane
    var size: CGFloat = 22
    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.26, style: .continuous)
            .fill(LinearGradient(colors: pane.tint, startPoint: .top, endPoint: .bottom))
            .overlay(Image(systemName: pane.symbol).font(.system(size: size * 0.52, weight: .semibold)).foregroundStyle(.white))
            .frame(width: size, height: size)
            .shadow(color: .black.opacity(0.15), radius: 0.5, y: 0.5)
    }
}

/// Opens System Settings › Displays (arrange screens, resolution, which display is main).
private func openDisplaysSettings() {
    NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.Displays-Settings.extension")!)
}

// MARK: - Root

struct SettingsView: View {
    // Only settings are observed here. Live tracking state is observed by the panes that show it,
    // so ~8 Hz gaze updates never redraw the sidebar (which made clicks on it get lost).
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
            Sidebar(pane: $pane)
        } detail: {
            Group {
                switch pane {
                case .general: GeneralPane(settings: settings, state: AppState.shared, actions: actions)
                case .tracking: TrackingPane(settings: settings, state: AppState.shared, actions: actions)
                case .screens: ScreensPane(settings: settings, state: AppState.shared, actions: actions)
                case .permissions: PermissionsPane()
                case .advanced: AdvancedPane(settings: settings, actions: actions)
                case .about: AboutPane()
                }
            }
            .navigationTitle(pane.title)
        }
        .frame(minWidth: 760, minHeight: 540)
    }
}

/// The sidebar depends only on the selected pane, so nothing else can make it redraw.
private struct Sidebar: View {
    @Binding var pane: Pane
    var body: some View {
        List(Pane.allCases, selection: $pane) { p in
            Label { Text(p.title) } icon: { Badge(pane: p) }
                .padding(.vertical, 2)
                .tag(p)
        }
        .navigationSplitViewColumnWidth(min: 190, ideal: 200, max: 230)
        .toolbar(removing: .sidebarToggle)
    }
}

// MARK: - General

private struct GeneralPane: View {
    @ObservedObject var settings: Settings
    @ObservedObject var state: AppState
    let actions: SettingsActions

    var body: some View {
        Form {
            Section {
                HStack(spacing: 14) {
                    Image(nsImage: NSApp.applicationIconImage).resizable().frame(width: 56, height: 56)
                    VStack(alignment: .leading, spacing: 4) {
                        Text("GazeHop").font(.title2.weight(.semibold))
                        HStack(spacing: 6) {
                            StatusDot(icon: state.icon)
                            Text(state.statusText).foregroundStyle(.secondary)
                        }
                        .font(.callout)
                    }
                    Spacer()
                    Button(state.paused ? "Resume" : "Pause", action: actions.togglePause)
                        .controlSize(.large)
                        .buttonStyle(.borderedProminent)
                        .help("Shortcut: \(settings.hotKey.label)")
                }
                .padding(.vertical, 6)
            }

            Section("Startup") {
                LaunchAtLoginRow(settings: settings)
            }

            Section("Menu bar") {
                Toggle("Show “GazeHop” next to the menu bar icon", isOn: $settings.showNameInMenuBar)
            }

            Section {
                Toggle(isOn: $settings.movePointer) {
                    Text("Move the pointer to the focused window")
                    Text("So scrolling works right away on the screen you look at.")
                }
                Toggle(isOn: $settings.waitForTypingPause) {
                    Text("Wait until I stop typing")
                    Text("Focus never moves mid-word. GazeHop also never switches while a password field is active.")
                }
                Toggle("Play a sound when pausing and resuming", isOn: $settings.playSounds)
            } header: { Text("When switching") }

            Section {
                Picker(selection: $settings.hotKey) {
                    ForEach(HotKeyPreset.allCases) { Text($0.label).tag($0) }
                } label: {
                    Text("Pause and resume")
                    Text("Works from any app. On Mac keyboards, F-keys may need Fn held (Fn⌘F1).")
                }
            } header: { Text("Keyboard shortcut") }
        }
        .formStyle(.grouped)
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

private struct StatusDot: View {
    let icon: MenuBarIcon.State
    var body: some View {
        Circle()
            .fill(icon == .active ? Color(red: 0.56, green: 0.66, blue: 0.78) : icon == .paused ? Color.secondary : Color.orange)
            .frame(width: 8, height: 8)
            .shadow(color: icon == .active ? Color(red: 0.56, green: 0.66, blue: 0.78).opacity(0.8) : .clear, radius: 3)
    }
}

// MARK: - Tracking

private struct TrackingPane: View {
    @ObservedObject var settings: Settings
    @ObservedObject var state: AppState
    let actions: SettingsActions

    var body: some View {
        Form {
            Section {
                LiveGazeView(state: state, excluded: settings.excludedDisplays)
            } header: {
                HStack {
                    Text("Live")
                    Spacer()
                    Button("Open Displays Settings…", action: openDisplaysSettings).font(.callout)
                }
            }

            Section {
                SliderRow(title: "Look time before switching",
                          detail: "How long you look at a screen before focus moves there.",
                          value: $settings.dwellMs, range: 100...1000, step: 50) { "\(Int($0)) ms" }
                SliderRow(title: "Time between switches",
                          detail: "Stops a quick glance back from bouncing focus.",
                          value: $settings.cooldownMs, range: 200...2000, step: 100) { String(format: "%.1f s", $0 / 1000) }
                SliderRow(title: "Strictness",
                          detail: "Higher needs a clearer look. Raise it if GazeHop switches when you don't mean to.",
                          value: $settings.strictness, range: 0.05...0.6, step: 0.05) { "\(Int($0 * 100))%" }
                SliderRow(title: "Smoothing",
                          detail: "Higher is steadier, lower reacts faster.",
                          value: $settings.smoothing, range: 0...0.9, step: 0.05) { "\(Int($0 * 100))%" }
            } header: { Text("Switching") }

            Section {
                HStack {
                    Button("Recalibrate…", action: actions.calibrate).buttonStyle(.borderedProminent)
                    Spacer()
                    Button("Reset to Defaults") { settings.resetTracking() }
                }
            } footer: {
                Text("Recalibrate after moving your chair, camera or screens.").font(.caption).foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
    }
}

private struct SliderRow: View {
    let title: String
    let detail: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let step: Double
    let format: (Double) -> String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline) {
                Text(title)
                Spacer()
                Text(format(value)).monospacedDigit().foregroundStyle(.secondary)
                    .padding(.horizontal, 7).padding(.vertical, 2)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 5, style: .continuous))
            }
            Slider(value: $value, in: range, step: step)
            Text(detail).font(.caption).foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}

/// What GazeHop sees right now: which screen you're looking at, and how sure it is.
private struct LiveGazeView: View {
    @ObservedObject var state: AppState
    let excluded: Set<UInt32>

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ScreenMap(highlight: state.looking, excluded: excluded, calibrated: state.calibrated, height: 110)
            HStack(spacing: 10) {
                Image(systemName: state.paused ? "pause.circle.fill" : state.faceVisible ? "eye.fill" : "eye.slash")
                    .foregroundStyle(state.faceVisible && !state.paused ? Color(red: 0.56, green: 0.66, blue: 0.78) : .secondary)
                Text(headline).font(.callout.weight(.medium))
                Spacer()
                if state.faceVisible && !state.paused {
                    Text("Confidence").font(.caption).foregroundStyle(.secondary)
                    ProgressView(value: min(1, state.confidence / 0.6)).frame(width: 110)
                }
            }
            if let last = state.lastSwitch {
                Text("Last switch: \(last)").font(.caption).foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
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

// MARK: - Screens

private struct ScreensPane: View {
    @ObservedObject var settings: Settings
    @ObservedObject var state: AppState
    let actions: SettingsActions
    @State private var screens = NSScreen.screens

    var body: some View {
        Form {
            Section {
                ScreenMap(highlight: state.looking, excluded: settings.excludedDisplays, calibrated: state.calibrated, height: 160) { id in
                    toggle(id)
                }
                HStack(alignment: .firstTextBaseline) {
                    Text("Click a screen to turn switching to it on or off. The highlight shows where you're looking.")
                        .font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Button("Open Displays Settings…", action: openDisplaysSettings)
                }
            }

            Section("Switch focus to") {
                ForEach(screens, id: \.displayID) { screen in
                    let id = screen.displayID
                    Toggle(isOn: Binding(get: { !settings.excludedDisplays.contains(id) }, set: { _ in toggle(id) })) {
                        HStack(spacing: 10) {
                            Image(systemName: screen == NSScreen.main ? "display" : "display")
                                .font(.title3).foregroundStyle(.secondary).frame(width: 26)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(screen.localizedName)
                                HStack(spacing: 6) {
                                    Text("\(Int(screen.frame.width)) × \(Int(screen.frame.height))")
                                    if state.calibrated.contains(id) {
                                        Label("Calibrated", systemImage: "checkmark.circle.fill").labelStyle(.titleAndIcon)
                                    } else {
                                        Label("Not calibrated", systemImage: "exclamationmark.circle.fill").foregroundStyle(.orange)
                                    }
                                }
                                .font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }

            if screens.contains(where: { !state.calibrated.contains($0.displayID) }) {
                Section {
                    Button("Calibrate New Screens…", action: actions.calibrate).buttonStyle(.borderedProminent)
                }
            }
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

/// Displays drawn in their real arrangement (System Settings › Displays style).
private struct ScreenMap: View {
    let highlight: UInt32?
    let excluded: Set<UInt32>
    let calibrated: Set<UInt32>
    var height: CGFloat
    var onTap: ((UInt32) -> Void)? = nil

    var body: some View {
        GeometryReader { geo in
            let screens = NSScreen.screens
            let union = screens.reduce(CGRect.null) { $0.union($1.frame) }
            let scale = min((geo.size.width - 24) / max(union.width, 1), (geo.size.height - 16) / max(union.height, 1))
            let ox = (geo.size.width - union.width * scale) / 2, oy = (geo.size.height - union.height * scale) / 2
            ZStack(alignment: .topLeading) {
                ForEach(screens, id: \.displayID) { s in
                    let id = s.displayID
                    let r = s.frame
                    let x = ox + (r.minX - union.minX) * scale
                    let y = oy + (union.maxY - r.maxY) * scale   // AppKit's origin is bottom-left
                    let on = !excluded.contains(id)
                    let looking = highlight == id
                    RoundedRectangle(cornerRadius: 6, style: .continuous)
                        .fill(looking ? Color(red: 0.56, green: 0.66, blue: 0.78).opacity(0.28) : Color.primary.opacity(on ? 0.07 : 0.025))
                        .overlay(
                            RoundedRectangle(cornerRadius: 6, style: .continuous)
                                .strokeBorder(looking ? Color(red: 0.62, green: 0.72, blue: 0.85) : Color.primary.opacity(on ? 0.25 : 0.12),
                                              style: StrokeStyle(lineWidth: looking ? 2 : 1, dash: on ? [] : [4, 3]))
                        )
                        .overlay(
                            VStack(spacing: 2) {
                                Text(s.localizedName).font(.caption.weight(.medium)).lineLimit(1)
                                if !on { Text("Off").font(.caption2).foregroundStyle(.secondary) }
                                else if !calibrated.contains(id) { Text("Not calibrated").font(.caption2).foregroundStyle(.orange) }
                            }
                            .padding(4)
                        )
                        .frame(width: max(r.width * scale - 4, 10), height: max(r.height * scale - 4, 10))
                        .offset(x: x + 2, y: y + 2)
                        .animation(.easeOut(duration: 0.2), value: looking)
                        .onTapGesture { onTap?(id) }
                        .help(onTap == nil ? s.localizedName : "Click to turn switching to \(s.localizedName) \(on ? "off" : "on")")
                }
            }
        }
        .frame(height: height)
    }
}

// MARK: - Permissions

private struct PermissionsPane: View {
    @State private var camera = AVCaptureDevice.authorizationStatus(for: .video)
    @State private var accessibility = FocusManager.isTrusted
    private let tick = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        Form {
            Section {
                PermissionRow(title: "Camera", symbol: "camera.fill", tint: [Color(red: 0.35, green: 0.62, blue: 0.55), Color(red: 0.2, green: 0.45, blue: 0.4)],
                              detail: "Sees which screen you're looking at. Frames are analysed on this Mac and discarded.",
                              granted: camera == .authorized,
                              state: camera == .authorized ? "Allowed" : camera == .notDetermined ? "Not asked yet" : "Not allowed",
                              url: "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera")
                PermissionRow(title: "Accessibility", symbol: "accessibility", tint: [Color(red: 0.4, green: 0.6, blue: 0.95), Color(red: 0.22, green: 0.42, blue: 0.82)],
                              detail: "Brings the window on the screen you look at to the front. GazeHop never reads what you type.",
                              granted: accessibility,
                              state: accessibility ? "Allowed" : "Not allowed",
                              url: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
            } header: { Text("GazeHop needs") }

            Section {
                Label("No network code. Nothing leaves this Mac.", systemImage: "network.slash")
                Label("No camera images are saved. Calibration is a few numbers per screen.", systemImage: "camera.metering.unknown")
                Label("Open source, so you can check all of this.", systemImage: "chevron.left.forwardslash.chevron.right")
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
            RoundedRectangle(cornerRadius: 7, style: .continuous)
                .fill(LinearGradient(colors: tint, startPoint: .top, endPoint: .bottom))
                .overlay(Image(systemName: symbol).font(.system(size: 14, weight: .semibold)).foregroundStyle(.white))
                .frame(width: 30, height: 30)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.body.weight(.medium))
                Text(detail).font(.caption).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 12)
            Label(state, systemImage: granted ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                .font(.callout)
                .foregroundStyle(granted ? Color.secondary : Color.orange)
                .labelStyle(.titleAndIcon)
            if !granted {
                Button("Open Settings…") { NSWorkspace.shared.open(URL(string: url)!) }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Advanced

private struct AdvancedPane: View {
    @ObservedObject var settings: Settings
    let actions: SettingsActions
    @State private var confirmDelete = false

    var body: some View {
        Form {
            Section {
                Toggle(isOn: $settings.debugLogging) {
                    Text("Detailed debug logging")
                    Text("Writes predictions once a second to the log. Useful when reporting a problem.")
                }
                LabeledContent("Log file") {
                    Button("Show in Finder") { NSWorkspace.shared.activateFileViewerSelecting([DebugLog.url]) }
                }
            } header: { Text("Diagnostics") }

            Section {
                LabeledContent("Calibration") {
                    HStack {
                        Button("Recalibrate…", action: actions.calibrate)
                        Button("Delete Calibration Data", role: .destructive) { confirmDelete = true }
                    }
                }
            } footer: {
                Text("Calibration is a few averaged head and eye angles per screen, stored only on this Mac. No images.")
                    .font(.caption).foregroundStyle(.secondary)
            }
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
        VStack(spacing: 14) {
            Spacer()
            Image(nsImage: NSApp.applicationIconImage).resizable().frame(width: 112, height: 112)
                .shadow(color: .black.opacity(0.35), radius: 14, y: 8)
            Text("GazeHop").font(.largeTitle.weight(.semibold))
            Text("Version \(version)").foregroundStyle(.secondary)
            Text("Look at a screen, and your keyboard follows.").font(.title3).foregroundStyle(.secondary).padding(.top, 2)
            HStack(spacing: 10) {
                Link(destination: URL(string: "https://gazehop.gazehop-site.workers.dev")!) { Label("Website", systemImage: "safari") }
                Link(destination: URL(string: "https://github.com/kabirshah4/GazeHop")!) { Label("Source Code", systemImage: "chevron.left.forwardslash.chevron.right") }
                Link(destination: URL(string: "https://github.com/kabirshah4/GazeHop/issues")!) { Label("Report a Problem", systemImage: "exclamationmark.bubble") }
            }
            .buttonStyle(.bordered)
            .padding(.top, 8)
            Spacer()
            Text("Free and open source under the MIT license.").font(.caption).foregroundStyle(.tertiary).padding(.bottom, 18)
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
            w.setContentSize(NSSize(width: 780, height: 560))
            w.contentMinSize = NSSize(width: 760, height: 540)
            w.center()
            w.setFrameAutosaveName("GazeHopSettings")
            window = w
        }
        NSApp.activate(ignoringOtherApps: true)
        window?.makeKeyAndOrderFront(nil)
    }
}
