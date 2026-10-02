import AppKit

/// Walks through each screen: shows a "look here" target, waits for the eyes to settle,
/// then records gaze samples. Several points per screen so the model covers the whole display.
final class Calibration {
    private let tracker: GazeTracker
    private var screens: [NSScreen] = []
    private var samples: [UInt32: [[Double]]] = [:]
    private var window: NSWindow?
    private var collectingFor: UInt32?
    private let completion: (GazeModel?) -> Void

    private static let points: [CGPoint] = [.init(x: 0.5, y: 0.5), .init(x: 0.25, y: 0.3),
                                            .init(x: 0.75, y: 0.3), .init(x: 0.25, y: 0.7),
                                            .init(x: 0.75, y: 0.7)]
    private static let settle = 0.9, collect = 1.1

    init(tracker: GazeTracker, completion: @escaping (GazeModel?) -> Void) {
        self.tracker = tracker
        self.completion = completion
    }

    func run() {
        screens = NSScreen.screens
        guard screens.count >= 2 else {
            alert("GazeHop needs at least two screens.")
            completion(nil)
            return
        }
        step(screen: 0, point: 0)
    }

    /// Fed by the app delegate with every tracker sample.
    func add(_ features: [Double]) {
        guard let id = collectingFor else { return }
        samples[id, default: []].append(features)
    }

    private func step(screen si: Int, point pi: Int) {
        if si >= screens.count { finish(); return }
        if pi >= Self.points.count { step(screen: si + 1, point: 0); return }

        let screen = screens[si]
        show(on: screen, at: Self.points[pi], label: "\(screen.localizedName) (\(si + 1) of \(screens.count)): look at the dot")
        collectingFor = nil
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.settle) {
            self.collectingFor = screen.displayID
            DispatchQueue.main.asyncAfter(deadline: .now() + Self.collect) {
                self.collectingFor = nil
                self.step(screen: si, point: pi + 1)
            }
        }
    }

    private func show(on screen: NSScreen, at p: CGPoint, label: String) {
        if window?.screen != screen {
            window?.orderOut(nil)
            let w = NSWindow(contentRect: screen.frame, styleMask: .borderless, backing: .buffered, defer: false)
            w.level = .screenSaver
            w.backgroundColor = NSColor.black.withAlphaComponent(0.82)
            w.isOpaque = false
            w.setFrame(screen.frame, display: true)
            w.orderFrontRegardless()
            window = w
        }
        window?.contentView = TargetView(point: p, label: label)
    }

    private func finish() {
        window?.orderOut(nil)
        window = nil
        let model = GazeModel(samples: samples)
        if model == nil { alert("Calibration didn't see your face well enough. Check lighting and try again.") }
        completion(model)
    }

    private func alert(_ text: String) {
        let a = NSAlert()
        a.messageText = text
        NSApp.activate(ignoringOtherApps: true)
        a.runModal()
    }
}

private final class TargetView: NSView {
    let point: CGPoint, label: String
    init(point: CGPoint, label: String) {
        self.point = point; self.label = label
        super.init(frame: .zero)
    }
    required init?(coder: NSCoder) { fatalError() }

    override func draw(_ dirtyRect: NSRect) {
        let c = CGPoint(x: bounds.width * point.x, y: bounds.height * (1 - point.y))
        NSColor.systemYellow.setFill()
        NSBezierPath(ovalIn: NSRect(x: c.x - 18, y: c.y - 18, width: 36, height: 36)).fill()
        NSColor.black.setFill()
        NSBezierPath(ovalIn: NSRect(x: c.x - 5, y: c.y - 5, width: 10, height: 10)).fill()

        let attrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: 22, weight: .semibold),
            .foregroundColor: NSColor.white,
        ]
        let s = NSAttributedString(string: label, attributes: attrs)
        s.draw(at: CGPoint(x: (bounds.width - s.size().width) / 2, y: 60))
    }
}
