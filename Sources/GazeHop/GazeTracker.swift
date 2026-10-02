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

    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer,
                       from connection: AVCaptureConnection) {
        guard let pixels = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        let request = VNDetectFaceLandmarksRequest()
        let handler = VNImageRequestHandler(cvPixelBuffer: pixels, orientation: .up)
        try? handler.perform([request])

        // Use the largest face (the person at the desk).
        guard let face = request.results?.max(by: { area($0) < area($1) }),
              let features = Self.features(for: face) else {
            DispatchQueue.main.async { self.onNoFace?() }
            return
        }
        DispatchQueue.main.async { self.onSample?(features) }
    }

    private func area(_ f: VNFaceObservation) -> CGFloat {
        f.boundingBox.width * f.boundingBox.height
    }

    private static func features(for face: VNFaceObservation) -> [Double]? {
        guard let lm = face.landmarks else { return nil }
        let yaw = face.yaw?.doubleValue ?? 0
        let pitch = face.pitch?.doubleValue ?? 0

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
