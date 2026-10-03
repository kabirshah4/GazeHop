// Copyright © 2026 Kabir Shah. All rights reserved. See LICENSE.

import AVFoundation
import Vision

/// Reads the front camera and emits a feature vector per frame:
/// [headYaw, headPitch, noseX, noseY, eyeX, eyeY, faceX, faceY]
/// Head direction comes from Vision's yaw/pitch plus nose position inside the face box;
/// eye gaze comes from pupil position inside each eye's outline.
final class GazeTracker: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate {
    static let featureCount = 8

    /// Called on the main queue.
    var onSample: (([Double]) -> Void)?
    var onNoFace: (() -> Void)?

    private let session = AVCaptureSession()
    private let queue = DispatchQueue(label: "gazehop.gaze")
    private var configured = false

    var isRunning: Bool { session.isRunning }

    func start(completion: @escaping (Error?) -> Void) {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            guard granted else {
                DispatchQueue.main.async { completion(TrackerError.cameraDenied) }
                return
            }
            self.queue.async {
                do {
                    try self.configureIfNeeded()
                    self.session.startRunning()
                    DispatchQueue.main.async { completion(nil) }
                } catch {
                    DispatchQueue.main.async { completion(error) }
                }
            }
        }
    }

    func stop() {
        queue.async { self.session.stopRunning() }
    }

    private func configureIfNeeded() throws {
        if configured { return }
        let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front)
            ?? AVCaptureDevice.default(for: .video)
        guard let device else { throw TrackerError.noCamera }
        let input = try AVCaptureDeviceInput(device: device)

        session.beginConfiguration()
        session.sessionPreset = session.canSetSessionPreset(.vga640x480) ? .vga640x480 : .medium
        guard session.canAddInput(input) else { throw TrackerError.noCamera }
        session.addInput(input)

        let output = AVCaptureVideoDataOutput()
        output.alwaysDiscardsLateVideoFrames = true
        output.setSampleBufferDelegate(self, queue: queue)
        guard session.canAddOutput(output) else { throw TrackerError.noCamera }
        session.addOutput(output)
        session.commitConfiguration()
        configured = true
    }

    // The one person GazeHop follows; everyone else in frame is ignored.
    private var trackedCenter: CGPoint?
    private var trackedSeen = Date.distantPast
    private static let reacquireAfter: TimeInterval = 2.0   // lost this long → pick a new person
    private static let maxJump: CGFloat = 0.2               // per-frame movement, in frame widths
    private static let minFaceWidth: CGFloat = 0.08         // ignore small faces far in the background

    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer,
                       from connection: AVCaptureConnection) {
        guard let pixels = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        let handler = VNImageRequestHandler(cvPixelBuffer: pixels, orientation: .up)

        // 1. Find faces, then choose exactly one.
        let rects = VNDetectFaceRectanglesRequest()
        try? handler.perform([rects])
        guard let face = pickFace(rects.results ?? []) else {
            DispatchQueue.main.async { self.onNoFace?() }
            return
        }

        // 2. Landmarks for that face only.
        let landmarks = VNDetectFaceLandmarksRequest()
        landmarks.inputFaceObservations = [face]
        try? handler.perform([landmarks])
        guard let detailed = landmarks.results?.first,
              let features = Self.features(for: detailed, pose: face) else {
            DispatchQueue.main.async { self.onNoFace?() }
            return
        }
        DispatchQueue.main.async { self.onSample?(features) }
    }

    /// Keeps following the same person: the face nearest to where they were last seen.
    /// Only after they've been gone for a while does it pick the largest face again.
    private func pickFace(_ faces: [VNFaceObservation]) -> VNFaceObservation? {
        let candidates = faces.filter { $0.boundingBox.width >= Self.minFaceWidth }
        let now = Date()
        let chosen: VNFaceObservation?
        if let last = trackedCenter, now.timeIntervalSince(trackedSeen) < Self.reacquireAfter {
            chosen = candidates
                .map { ($0, hypot($0.boundingBox.midX - last.x, $0.boundingBox.midY - last.y)) }
                .filter { $0.1 <= Self.maxJump }
                .min { $0.1 < $1.1 }?.0
        } else {
            chosen = candidates.max { area($0) < area($1) }
        }
        if let chosen {
            if trackedCenter == nil || now.timeIntervalSince(trackedSeen) >= Self.reacquireAfter {
                DebugLog.write("tracking face (\(candidates.count) in view)")
            }
            trackedCenter = CGPoint(x: chosen.boundingBox.midX, y: chosen.boundingBox.midY)
            trackedSeen = now
        }
        return chosen
    }

    private func area(_ f: VNFaceObservation) -> CGFloat {
        f.boundingBox.width * f.boundingBox.height
    }

    private static func features(for face: VNFaceObservation, pose: VNFaceObservation) -> [Double]? {
        guard let lm = face.landmarks else { return nil }
        let yaw = (face.yaw ?? pose.yaw)?.doubleValue ?? 0
        let pitch = (face.pitch ?? pose.pitch)?.doubleValue ?? 0

        // Landmark points are normalized to the face bounding box.
        let nose = mean(lm.nose?.normalizedPoints ?? lm.noseCrest?.normalizedPoints ?? [])
        guard let nose else { return nil }

        var eyeX: [Double] = [], eyeY: [Double] = []
        for (eye, pupil) in [(lm.leftEye, lm.leftPupil), (lm.rightEye, lm.rightPupil)] {
            guard let eye, let pupil, let p = mean(pupil.normalizedPoints) else { continue }
            let pts = eye.normalizedPoints
            guard let minX = pts.map(\.x).min(), let maxX = pts.map(\.x).max(),
                  let minY = pts.map(\.y).min(), let maxY = pts.map(\.y).max(),
                  maxX - minX > 0.001, maxY - minY > 0.001 else { continue }
            eyeX.append(Double((p.x - minX) / (maxX - minX)))
            eyeY.append(Double((p.y - minY) / (maxY - minY)))
        }
        guard !eyeX.isEmpty else { return nil }

        let box = face.boundingBox
        return [
            yaw, pitch,
            Double(nose.x), Double(nose.y),
            eyeX.reduce(0, +) / Double(eyeX.count),
            eyeY.reduce(0, +) / Double(eyeY.count),
            Double(box.midX), Double(box.midY),
        ]
    }

    private static func mean(_ pts: [CGPoint]) -> CGPoint? {
        guard !pts.isEmpty else { return nil }
        let n = CGFloat(pts.count)
        return CGPoint(x: pts.map(\.x).reduce(0, +) / n, y: pts.map(\.y).reduce(0, +) / n)
    }

    enum TrackerError: LocalizedError {
        case cameraDenied, noCamera
        var errorDescription: String? {
            switch self {
            case .cameraDenied: return "Camera access was denied. Enable it in System Settings › Privacy & Security › Camera."
            case .noCamera: return "No usable camera found."
            }
        }
    }
}
