import AppKit
import Carbon
import Combine
import ServiceManagement

/// All user-tunable settings, persisted in UserDefaults and applied live.
final class Settings: ObservableObject {
    static let shared = Settings()
    private let d = UserDefaults.standard

    // General
    @Published var showNameInMenuBar: Bool { didSet { d.set(showNameInMenuBar, forKey: "showNameInMenuBar") } }
    @Published var movePointer: Bool { didSet { d.set(movePointer, forKey: "movePointer") } }
    @Published var playSounds: Bool { didSet { d.set(playSounds, forKey: "playSounds") } }
    @Published var hotKey: HotKeyPreset { didSet { d.set(hotKey.rawValue, forKey: "hotKey") } }

    // Tracking
    @Published var dwellMs: Double { didSet { d.set(dwellMs, forKey: "dwellMs") } }
    @Published var cooldownMs: Double { didSet { d.set(cooldownMs, forKey: "cooldownMs") } }
    /// 0...1; higher = needs a clearer look before switching.
    @Published var strictness: Double { didSet { d.set(strictness, forKey: "strictness") } }
    /// 0...1; higher = steadier but slower to react.
    @Published var smoothing: Double { didSet { d.set(smoothing, forKey: "smoothing") } }

    // Screens
    @Published var excludedDisplays: Set<UInt32> {
        didSet { d.set(excludedDisplays.map(Int.init), forKey: "excludedDisplays") }
    }

    // Laya
    @Published var layaEnabled: Bool { didSet { d.set(layaEnabled, forKey: "layaFilter") } }
    @Published var layaURL: String { didSet { d.set(layaURL, forKey: "layaURL") } }
    @Published var layaThreshold: Double { didSet { d.set(layaThreshold, forKey: "layaThreshold") } }

    // Advanced
    @Published var debugLogging: Bool { didSet { d.set(debugLogging, forKey: "debug") } }

    private init() {
        d.register(defaults: [
            "showNameInMenuBar": true, "movePointer": true, "playSounds": true,
            "hotKey": HotKeyPreset.cmdF1.rawValue,
            "dwellMs": 250.0, "cooldownMs": 600.0, "strictness": 0.2, "smoothing": 0.55,
            "layaURL": "http://127.0.0.1:8077/decide", "layaThreshold": 0.5,
        ])
        showNameInMenuBar = d.bool(forKey: "showNameInMenuBar")
        movePointer = d.bool(forKey: "movePointer")
        playSounds = d.bool(forKey: "playSounds")
        hotKey = HotKeyPreset(rawValue: d.string(forKey: "hotKey") ?? "") ?? .cmdF1
        dwellMs = d.double(forKey: "dwellMs")
        cooldownMs = d.double(forKey: "cooldownMs")
        strictness = d.double(forKey: "strictness")
        smoothing = d.double(forKey: "smoothing")
        excludedDisplays = Set((d.array(forKey: "excludedDisplays") as? [Int] ?? []).map(UInt32.init))
        layaEnabled = d.bool(forKey: "layaFilter")
        layaURL = d.string(forKey: "layaURL") ?? ""
        layaThreshold = d.double(forKey: "layaThreshold")
        debugLogging = d.bool(forKey: "debug")
    }

    func resetTracking() {
        dwellMs = 250; cooldownMs = 600; strictness = 0.2; smoothing = 0.55
    }

    // Launch at login lives in the system, not UserDefaults.
    var launchAtLogin: Bool {
        get { SMAppService.mainApp.status == .enabled }
        set {
            objectWillChange.send()
            do {
                if newValue { try SMAppService.mainApp.register() } else { try SMAppService.mainApp.unregister() }
            } catch {
                DebugLog.write("launch at login: \(error.localizedDescription)")
            }
        }
    }
}

enum HotKeyPreset: String, CaseIterable, Identifiable {
    case cmdF1, optF1, ctrlOptG, ctrlOptCmdG, none
    var id: String { rawValue }

    var label: String {
        switch self {
        case .cmdF1: return "⌘F1"
        case .optF1: return "⌥F1"
        case .ctrlOptG: return "⌃⌥G"
        case .ctrlOptCmdG: return "⌃⌥⌘G"
        case .none: return "None"
        }
    }

    var carbon: (keyCode: UInt32, modifiers: UInt32)? {
        switch self {
        case .cmdF1: return (UInt32(kVK_F1), UInt32(cmdKey))
        case .optF1: return (UInt32(kVK_F1), UInt32(optionKey))
        case .ctrlOptG: return (UInt32(kVK_ANSI_G), UInt32(controlKey | optionKey))
        case .ctrlOptCmdG: return (UInt32(kVK_ANSI_G), UInt32(controlKey | optionKey | cmdKey))
        case .none: return nil
        }
    }

    /// For showing the shortcut next to the Pause menu item.
    var menuEquivalent: (key: String, mask: NSEvent.ModifierFlags) {
        switch self {
        case .cmdF1: return (String(UnicodeScalar(NSF1FunctionKey)!), [.command])
        case .optF1: return (String(UnicodeScalar(NSF1FunctionKey)!), [.option])
        case .ctrlOptG: return ("g", [.control, .option])
        case .ctrlOptCmdG: return ("g", [.control, .option, .command])
        case .none: return ("", [])
        }
    }
}
