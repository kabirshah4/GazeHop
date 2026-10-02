// Renders GazeHop's app icon. Run: swift scripts/make-icon.swift
// Writes Resources/AppIcon.icns and docs/icon.png.
import AppKit

func rgb(_ hex: UInt32, _ a: CGFloat = 1) -> NSColor {
    NSColor(srgbRed: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255, alpha: a)
}

func drawIcon(in ctx: CGContext, size s: CGFloat) {
    let k = s / 1024
    ctx.scaleBy(x: k, y: k)

    // Squircle-ish tile on the macOS icon grid (824pt inside 1024), with a soft shadow.
    let tile = NSBezierPath(roundedRect: NSRect(x: 100, y: 100, width: 824, height: 824), xRadius: 185, yRadius: 185)
    NSGraphicsContext.saveGraphicsState()
    let shadow = NSShadow()
    shadow.shadowColor = rgb(0x000000, 0.35); shadow.shadowBlurRadius = 28; shadow.shadowOffset = NSSize(width: 0, height: -12)
    shadow.set()
    rgb(0x3343E8).setFill(); tile.fill()
    NSGraphicsContext.restoreGraphicsState()

    NSGraphicsContext.saveGraphicsState()
    tile.addClip()
    NSGradient(colors: [rgb(0x6A7BFF), rgb(0x3343E8), rgb(0x2420B8)])!.draw(in: tile, angle: -90)
    NSGraphicsContext.restoreGraphicsState()

    // Two monitors.
    func monitor(x: CGFloat, focused: Bool) {
        let body = NSBezierPath(roundedRect: NSRect(x: x, y: 255, width: 290, height: 190), xRadius: 26, yRadius: 26)
        (focused ? rgb(0xFFD43B) : rgb(0xFFFFFF, 0.92)).setFill(); body.fill()
        let screen = NSBezierPath(roundedRect: NSRect(x: x + 18, y: 273, width: 254, height: 154), xRadius: 12, yRadius: 12)
        rgb(0x1B1A6E).setFill(); screen.fill()
        // a few "lines of text" on each screen
        rgb(0xFFFFFF, focused ? 0.85 : 0.35).setFill()
        for (i, w) in [150, 110, 180].enumerated() {
            NSBezierPath(roundedRect: NSRect(x: x + 40, y: 390 - CGFloat(i) * 34, width: CGFloat(w), height: 14), xRadius: 7, yRadius: 7).fill()
        }
        let stand = NSBezierPath(roundedRect: NSRect(x: x + 120, y: 205, width: 50, height: 52), xRadius: 6, yRadius: 6)
        (focused ? rgb(0xFFD43B) : rgb(0xFFFFFF, 0.92)).setFill(); stand.fill()
        NSBezierPath(roundedRect: NSRect(x: x + 80, y: 190, width: 130, height: 22), xRadius: 11, yRadius: 11).fill()
    }
    monitor(x: 180, focused: false)
    monitor(x: 554, focused: true)

    // Eye.
    let cx: CGFloat = 512, cy: CGFloat = 690
    let eye = NSBezierPath()
    eye.move(to: NSPoint(x: cx - 250, y: cy))
    eye.curve(to: NSPoint(x: cx + 250, y: cy), controlPoint1: NSPoint(x: cx - 120, y: cy + 175), controlPoint2: NSPoint(x: cx + 120, y: cy + 175))
    eye.curve(to: NSPoint(x: cx - 250, y: cy), controlPoint1: NSPoint(x: cx + 120, y: cy - 175), controlPoint2: NSPoint(x: cx - 120, y: cy - 175))
    rgb(0xFFFFFF).setFill(); eye.fill()
    NSGraphicsContext.saveGraphicsState()
    eye.addClip()
    let ix = cx + 62
    NSGradient(colors: [rgb(0x5B8CFF), rgb(0x2E4BD8)])!.draw(in: NSBezierPath(ovalIn: NSRect(x: ix - 92, y: cy - 92, width: 184, height: 184)), angle: -90)
    rgb(0x0E0D3A).setFill()
    NSBezierPath(ovalIn: NSRect(x: ix - 44, y: cy - 44, width: 88, height: 88)).fill()
    rgb(0xFFFFFF).setFill()
    NSBezierPath(ovalIn: NSRect(x: ix - 4, y: cy + 14, width: 30, height: 30)).fill()
    NSGraphicsContext.restoreGraphicsState()

    // Hop arrow from the left monitor to the focused right one.
    let arc = NSBezierPath()
    arc.move(to: NSPoint(x: 340, y: 470))
    arc.curve(to: NSPoint(x: 668, y: 478), controlPoint1: NSPoint(x: 400, y: 560), controlPoint2: NSPoint(x: 600, y: 565))
    arc.lineWidth = 30; arc.lineCapStyle = .round
    rgb(0xFFD43B).setStroke(); arc.stroke()
    let head = NSBezierPath()
    head.move(to: NSPoint(x: 700, y: 452))
    head.line(to: NSPoint(x: 618, y: 486))
    head.line(to: NSPoint(x: 690, y: 548))
    head.close()
    head.lineJoinStyle = .round; head.lineWidth = 10
    rgb(0xFFD43B).setFill(); head.fill(); head.stroke()
}

func png(size: Int) -> Data {
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
                               samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
                               bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    let g = NSGraphicsContext(bitmapImageRep: rep)!
    NSGraphicsContext.current = g
    drawIcon(in: g.cgContext, size: CGFloat(size))
    NSGraphicsContext.restoreGraphicsState()
    return rep.representation(using: .png, properties: [:])!
}

let fm = FileManager.default
let iconset = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("AppIcon.iconset")
try? fm.removeItem(at: iconset)
try fm.createDirectory(at: iconset, withIntermediateDirectories: true)
for base in [16, 32, 128, 256, 512] {
    try png(size: base).write(to: iconset.appendingPathComponent("icon_\(base)x\(base).png"))
    try png(size: base * 2).write(to: iconset.appendingPathComponent("icon_\(base)x\(base)@2x.png"))
}
try png(size: 512).write(to: URL(fileURLWithPath: "docs/icon.png"))

let p = Process()
p.executableURL = URL(fileURLWithPath: "/usr/bin/iconutil")
p.arguments = ["-c", "icns", iconset.path, "-o", "Resources/AppIcon.icns"]
try p.run(); p.waitUntilExit()
print(p.terminationStatus == 0 ? "Wrote Resources/AppIcon.icns and docs/icon.png" : "iconutil failed")
