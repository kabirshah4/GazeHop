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
    var movePointer = true

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

    private func recordCurrent() {
        guard let w = currentWindow(), let id = Self.display(containing: w.frame) else { return }
        lastWindow[id] = w
    }

    /// Focus the last window used on `display`. Returns false if nothing is known there.
    @discardableResult
    func focus(display: UInt32) -> Bool {
        guard let w = lastWindow[display],
              let app = NSRunningApplication(processIdentifier: w.pid), !app.isTerminated,
              let frame = Self.frame(of: w.element) else {   // window closed?
            lastWindow[display] = nil
            return false
        }
        app.activate()
        AXUIElementSetAttributeValue(w.element, kAXMainAttribute as CFString, kCFBooleanTrue)
        AXUIElementPerformAction(w.element, kAXRaiseAction as CFString)

        // Scrolling goes wherever the pointer is, so bring it along.
        if movePointer, Self.display(containing: CGRect(origin: NSEvent.globalPointerTopLeft, size: .zero)) != display {
            CGWarpMouseCursorPosition(CGPoint(x: frame.midX, y: frame.midY))
            CGAssociateMouseAndMouseCursorPosition(1)
        }
        return true
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
