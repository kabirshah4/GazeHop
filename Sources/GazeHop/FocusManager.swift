import AppKit
import ApplicationServices

/// Remembers the last focused window on each display and can bring it back.
final class FocusManager {
    struct WindowRef {
        let pid: pid_t
        let element: AXUIElement
        let frame: CGRect   // global, top-left origin (AX / CG coordinates)
        let appName: String
        let title: String
    }

    private(set) var lastWindow: [UInt32: WindowRef] = [:]
    private var timer: Timer?
    var movePointer: Bool { Settings.shared.movePointer }

    static var isTrusted: Bool { AXIsProcessTrusted() }

    static func promptForAccessibility() {
        let opts = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(opts)
    }

    func start() {
        timer = Timer.scheduledTimer(withTimeInterval: 0.3, repeats: true) { [weak self] _ in
            self?.recordCurrent()
        }
    }

    /// Drop remembered windows on displays that are no longer connected.
    func forget(except displays: Set<UInt32>) {
        lastWindow = lastWindow.filter { displays.contains($0.key) }
    }

    /// Display that currently has keyboard focus.
    var focusedDisplay: UInt32? {
        guard let w = currentWindow() else { return nil }
        return Self.display(containing: w.frame)
    }

    func currentWindow() -> WindowRef? {
        guard let app = NSWorkspace.shared.frontmostApplication,
              app.processIdentifier != ProcessInfo.processInfo.processIdentifier else { return nil }
        let axApp = AXUIElementCreateApplication(app.processIdentifier)
        var value: CFTypeRef?
        guard AXUIElementCopyAttributeValue(axApp, kAXFocusedWindowAttribute as CFString, &value) == .success,
              let value, CFGetTypeID(value) == AXUIElementGetTypeID() else { return nil }
        let win = value as! AXUIElement
        guard let frame = Self.frame(of: win) else { return nil }
        return WindowRef(pid: app.processIdentifier, element: win, frame: frame,
                         appName: app.localizedName ?? "app", title: Self.title(of: win))
    }

    /// Display with keyboard focus, refreshed every 0.3 s. Asking another app for its focused window
    /// is a slow cross-process call, so per-frame code reads this instead of `focusedDisplay`.
    private(set) var cachedFocusedDisplay: UInt32?

    private func recordCurrent() {
        guard let w = currentWindow(), let id = Self.display(containing: w.frame) else { cachedFocusedDisplay = nil; return }
        lastWindow[id] = w
        cachedFocusedDisplay = id
    }

    /// Window to focus on `display`: the last one you used there if it's still open and on that
    /// screen, otherwise the frontmost normal window on that screen. No setup clicks needed.
    func target(for display: UInt32) -> WindowRef? {
        if let w = lastWindow[display],
           let app = NSRunningApplication(processIdentifier: w.pid), !app.isTerminated,
           let frame = Self.frame(of: w.element), Self.display(containing: frame) == display {
            return w
        }
        lastWindow[display] = nil
        return frontmostWindow(on: display)
    }

    /// Frontmost regular window on a display, from the window server's front-to-back list.
    private func frontmostWindow(on display: UInt32) -> WindowRef? {
        let me = ProcessInfo.processInfo.processIdentifier
        guard let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements],
                                                    kCGNullWindowID) as? [[String: Any]] else { return nil }
        for info in list {
            guard (info[kCGWindowLayer as String] as? Int) == 0,
                  let pid = info[kCGWindowOwnerPID as String] as? pid_t, pid != me,
                  let b = info[kCGWindowBounds as String] as? NSDictionary,
                  let bounds = CGRect(dictionaryRepresentation: b),
                  bounds.width >= 120, bounds.height >= 80,
                  Self.display(containing: bounds) == display,
                  let app = NSRunningApplication(processIdentifier: pid), app.activationPolicy == .regular,
                  let element = Self.axWindow(pid: pid, matching: bounds) else { continue }
            return WindowRef(pid: pid, element: element, frame: bounds,
                             appName: app.localizedName ?? "app", title: Self.title(of: element))
        }
        return nil
    }

    /// The app's Accessibility window whose frame matches a window-server rect.
    private static func axWindow(pid: pid_t, matching rect: CGRect) -> AXUIElement? {
        var value: CFTypeRef?
        guard AXUIElementCopyAttributeValue(AXUIElementCreateApplication(pid), kAXWindowsAttribute as CFString, &value) == .success,
              let windows = value as? [AXUIElement] else { return nil }
        return windows.first { w in
            guard let f = frame(of: w) else { return false }
            return abs(f.minX - rect.minX) < 3 && abs(f.minY - rect.minY) < 3
                && abs(f.width - rect.width) < 3 && abs(f.height - rect.height) < 3
        }
    }

    /// Focus the right window on `display`. Returns the window, or nil if that screen has none.
    @discardableResult
    func focus(display: UInt32) -> WindowRef? {
        guard let w = target(for: display),
              let app = NSRunningApplication(processIdentifier: w.pid) else { return nil }
        let axApp = AXUIElementCreateApplication(w.pid)
        app.activate()
        AXUIElementSetAttributeValue(axApp, kAXFrontmostAttribute as CFString, kCFBooleanTrue)
        AXUIElementSetAttributeValue(w.element, kAXMainAttribute as CFString, kCFBooleanTrue)
        AXUIElementSetAttributeValue(w.element, kAXFocusedAttribute as CFString, kCFBooleanTrue)
        AXUIElementPerformAction(w.element, kAXRaiseAction as CFString)
        lastWindow[display] = w
        cachedFocusedDisplay = display

        // Scrolling goes wherever the pointer is, so bring it along.
        if movePointer, Self.display(containing: CGRect(origin: NSEvent.globalPointerTopLeft, size: .zero)) != display {
            CGWarpMouseCursorPosition(CGPoint(x: w.frame.midX, y: w.frame.midY))
            CGAssociateMouseAndMouseCursorPosition(1)
        }
        return w
    }

    // MARK: geometry helpers

    static func frame(of win: AXUIElement) -> CGRect? {
        var posRef: CFTypeRef?, sizeRef: CFTypeRef?
        guard AXUIElementCopyAttributeValue(win, kAXPositionAttribute as CFString, &posRef) == .success,
              AXUIElementCopyAttributeValue(win, kAXSizeAttribute as CFString, &sizeRef) == .success
        else { return nil }
        var pos = CGPoint.zero, size = CGSize.zero
        AXValueGetValue(posRef as! AXValue, .cgPoint, &pos)
        AXValueGetValue(sizeRef as! AXValue, .cgSize, &size)
        return CGRect(origin: pos, size: size)
    }

    static func title(of win: AXUIElement) -> String {
        var t: CFTypeRef?
        AXUIElementCopyAttributeValue(win, kAXTitleAttribute as CFString, &t)
        return (t as? String) ?? ""
    }

    /// Display with the largest overlap with a top-left-origin rect.
    static func display(containing rect: CGRect) -> UInt32? {
        var best: (UInt32, CGFloat)?
        for screen in NSScreen.screens {
            let r = screen.topLeftFrame
            let overlap = rect.width == 0 ? (r.contains(rect.origin) ? 1 : 0) : r.intersection(rect).area
            if overlap > 0, overlap > (best?.1 ?? 0) { best = (screen.displayID, overlap) }
        }
        return best?.0
    }
}

extension NSScreen {
    var displayID: UInt32 {
        (deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber)?.uint32Value ?? 0
    }

    /// Frame in global top-left coordinates (what AX and CGWarp use).
    var topLeftFrame: CGRect {
        let primaryHeight = NSScreen.screens.first?.frame.height ?? frame.height
        return CGRect(x: frame.minX, y: primaryHeight - frame.maxY, width: frame.width, height: frame.height)
    }
}

extension NSEvent {
    static var globalPointerTopLeft: CGPoint {
        let p = mouseLocation
        let primaryHeight = NSScreen.screens.first?.frame.height ?? 0
        return CGPoint(x: p.x, y: primaryHeight - p.y)
    }
}

private extension CGRect {
    var area: CGFloat { isNull ? 0 : width * height }
}
