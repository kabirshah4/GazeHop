import AppKit

/// GazeHop's menu bar glyph, the app's logo in one ink: a dim screen (outline), a lit screen
/// (solid) and the hop arcing between them, arrowhead on the lit one. Paused adds a slash; needing attention adds a dot badge.
/// Drawn as a template image so macOS tints it for light/dark menu bars.
enum MenuBarIcon {
    enum State { case active, paused, attention }

    static func image(_ state: State) -> NSImage {
        let size = NSSize(width: 22, height: 16)
        let img = NSImage(size: size, flipped: false) { _ in
            let ctx = NSGraphicsContext.current!
            NSColor.black.set()

            // Screen you came from: outline. Screen focus lands on: solid. Both on stands, so the
            // pair reads as monitors.
            let from = NSBezierPath(roundedRect: NSRect(x: 1.2, y: 3.2, width: 7.6, height: 5.2), xRadius: 1.2, yRadius: 1.2)
            from.lineWidth = 1.4
            from.stroke()
            let to = NSBezierPath(roundedRect: NSRect(x: 13.2, y: 3.2, width: 7.6, height: 5.2), xRadius: 1.2, yRadius: 1.2)
            to.lineWidth = 1.4
            to.fill()
            to.stroke()
            for x: CGFloat in [3.4, 15.4] {
                NSBezierPath(rect: NSRect(x: x + 1.05, y: 1.2, width: 1.1, height: 1.6)).fill()
                NSBezierPath(roundedRect: NSRect(x: x, y: 0.3, width: 3.2, height: 1.1), xRadius: 0.5, yRadius: 0.5).fill()
            }

            // The hop, arriving with an arrowhead on the lit screen.
            let hop = NSBezierPath()
            hop.move(to: NSPoint(x: 5, y: 10.2))
            hop.curve(to: NSPoint(x: 17, y: 9.6), controlPoint1: NSPoint(x: 8.5, y: 15.6), controlPoint2: NSPoint(x: 14, y: 15.4))
            hop.move(to: NSPoint(x: 14.7, y: 10.8))
            hop.line(to: NSPoint(x: 17, y: 9.6))
            hop.line(to: NSPoint(x: 17.35, y: 12.2))
            hop.lineWidth = 1.6
            hop.lineCapStyle = .round
            hop.lineJoinStyle = .round
            hop.stroke()

            switch state {
            case .active:
                break
            case .paused:
                let start = NSPoint(x: 3, y: 15), end = NSPoint(x: 19, y: 0.5)
                ctx.compositingOperation = .clear
                let gap = NSBezierPath(); gap.move(to: start); gap.line(to: end)
                gap.lineWidth = 4.2; gap.lineCapStyle = .round; gap.stroke()
                ctx.compositingOperation = .sourceOver
                let slash = NSBezierPath(); slash.move(to: start); slash.line(to: end)
                slash.lineWidth = 1.6; slash.lineCapStyle = .round; slash.stroke()
            case .attention:
                ctx.compositingOperation = .clear
                NSBezierPath(ovalIn: NSRect(x: 15, y: 9, width: 7.5, height: 7.5)).fill()
                ctx.compositingOperation = .sourceOver
                NSBezierPath(ovalIn: NSRect(x: 16.4, y: 10.4, width: 4.8, height: 4.8)).fill()
            }
            return true
        }
        img.isTemplate = true
        img.accessibilityDescription = "GazeHop"
        return img
    }
}
