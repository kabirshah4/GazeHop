import Foundation

/// Live app state for the Settings window (status, gaze readout). Updated on the main thread.
final class AppState: ObservableObject {
    static let shared = AppState()

    @Published var statusText = "Starting…"
    @Published var icon: MenuBarIcon.State = .attention
    @Published var paused = false
    @Published var calibrated: Set<UInt32> = []
    @Published var faceVisible = false
    @Published var looking: UInt32?
    @Published var confidence: Double = 0
    @Published var lastSwitch: String?

    private var lastGazePublish = Date.distantPast

    /// Gaze readings arrive ~30x a second; publish at most ~8x a second.
    func publishGaze(display: UInt32?, confidence: Double) {
        let now = Date()
        guard now.timeIntervalSince(lastGazePublish) > 0.12 else { return }
        lastGazePublish = now
        if !faceVisible { faceVisible = true }
        looking = display
        self.confidence = confidence
    }

    func publishNoFace() {
        guard faceVisible else { return }
        faceVisible = false
        looking = nil
        confidence = 0
    }
}
