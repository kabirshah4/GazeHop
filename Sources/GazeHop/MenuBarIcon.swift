import AppKit

/// GazeHop's menu bar glyph: the logo's monitor with the text caret cut out (the hop arc from the
/// app icon is left off; it turns into a hook at 16pt). Paused adds a slash; needing attention adds a
/// dot badge. Drawn as a template image so macOS tints it for light/dark menu bars.
enum MenuBarIcon {
    enum State { case active, paused, attention }

    static func image(_ state: State) -> NSImage {
        let size = NSSize(width: 18, height: 16)
        let img = NSImage(size: size, flipped: false) { _ in
            let ctx = NSGraphicsContext.current!
            NSColor.black.set()

            // Monitor on its stand, with the caret punched out of the screen.
            NSBezierPath(roundedRect: NSRect(x: 1.5, y: 4.2, width: 15, height: 9.4), xRadius: 1.9, yRadius: 1.9).fill()
            NSBezierPath(rect: NSRect(x: 8.1, y: 2.4, width: 1.8, height: 2)).fill()
            NSBezierPath(roundedRect: NSRect(x: 5.8, y: 1.2, width: 6.4, height: 1.2), xRadius: 0.6, yRadius: 0.6).fill()
            ctx.compositingOperation = .clear
            NSBezierPath(roundedRect: NSRect(x: 8.25, y: 6.3, width: 1.5, height: 5.2), xRadius: 0.75, yRadius: 0.75).fill()
            ctx.compositingOperation = .sourceOver

            switch state {
            case .active:
                break
            case .paused:
                let start = NSPoint(x: 2, y: 15.5), end = NSPoint(x: 16, y: 0.5)
                ctx.compositingOperation = .clear
                let gap = NSBezierPath(); gap.move(to: start); gap.line(to: end)
                gap.lineWidth = 4.2; gap.lineCapStyle = .round; gap.stroke()
                ctx.compositingOperation = .sourceOver
                let slash = NSBezierPath(); slash.move(to: start); slash.line(to: end)
                slash.lineWidth = 1.6; slash.lineCapStyle = .round; slash.stroke()
            case .attention:
                ctx.compositingOperation = .clear
                NSBezierPath(ovalIn: NSRect(x: 11, y: 9, width: 7.5, height: 7.5)).fill()
                ctx.compositingOperation = .sourceOver
                NSBezierPath(ovalIn: NSRect(x: 12.4, y: 10.4, width: 4.8, height: 4.8)).fill()
            }
            return true
        }
        img.isTemplate = true
        img.accessibilityDescription = "GazeHop"
        return img
    }
}
