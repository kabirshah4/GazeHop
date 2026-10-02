import AppKit

/// GazeHop's menu bar glyph: an outlined eye with a solid pupil and highlight.
/// Paused adds a slash; needing attention adds a dot badge.
/// Drawn as a template image so macOS tints it for light/dark menu bars.
enum MenuBarIcon {
    enum State { case active, paused, attention }

    static func image(_ state: State) -> NSImage {
        let size = NSSize(width: 20, height: 16)
        let img = NSImage(size: size, flipped: false) { _ in
            let ctx = NSGraphicsContext.current!
            NSColor.black.set()

            // Almond outline with pointed corners.
            let eye = NSBezierPath()
            eye.move(to: NSPoint(x: 1.5, y: 8))
            eye.curve(to: NSPoint(x: 18.5, y: 8), controlPoint1: NSPoint(x: 5.5, y: 14.6), controlPoint2: NSPoint(x: 14.5, y: 14.6))
            eye.curve(to: NSPoint(x: 1.5, y: 8), controlPoint1: NSPoint(x: 14.5, y: 1.4), controlPoint2: NSPoint(x: 5.5, y: 1.4))
            eye.close()
            eye.lineWidth = 1.6
            eye.lineJoinStyle = .round
            eye.stroke()

            // Pupil with a highlight punched out of its upper right.
            NSBezierPath(ovalIn: NSRect(x: 6.6, y: 4.6, width: 6.8, height: 6.8)).fill()
            ctx.compositingOperation = .clear
            NSBezierPath(ovalIn: NSRect(x: 10.1, y: 8.1, width: 2, height: 2)).fill()
            ctx.compositingOperation = .sourceOver

            switch state {
            case .active:
                break
            case .paused:
                let from = NSPoint(x: 3, y: 15), to = NSPoint(x: 17, y: 1)
                ctx.compositingOperation = .clear
                let gap = NSBezierPath(); gap.move(to: from); gap.line(to: to)
                gap.lineWidth = 4.2; gap.lineCapStyle = .round; gap.stroke()
                ctx.compositingOperation = .sourceOver
                let slash = NSBezierPath(); slash.move(to: from); slash.line(to: to)
                slash.lineWidth = 1.6; slash.lineCapStyle = .round; slash.stroke()
            case .attention:
                ctx.compositingOperation = .clear
                NSBezierPath(ovalIn: NSRect(x: 13, y: -0.5, width: 8, height: 8)).fill()
                ctx.compositingOperation = .sourceOver
                NSBezierPath(ovalIn: NSRect(x: 14.5, y: 1, width: 5, height: 5)).fill()
            }
            return true
        }
        img.isTemplate = true
        img.accessibilityDescription = "GazeHop"
        return img
    }
}
