// Copyright © 2026 Kabir Shah. All rights reserved. See LICENSE.

import Foundation

/// Nearest-centroid classifier over z-scored gaze features, trained by calibration.
/// Head features and eye features both vote; eye features get a little extra weight
/// because they move more than the head on small glances.
struct GazeModel: Codable {
    var centroids: [UInt32: [Double]]   // display ID -> mean feature vector
    var mean: [Double]
    var std: [Double]

    static let weights: [Double] = [1.0, 0.7, 1.0, 0.7, 1.4, 0.8, 0.5, 0.3]

    init?(samples: [UInt32: [[Double]]]) {
        let all = samples.values.flatMap { $0 }
        guard samples.count >= 2, samples.values.allSatisfy({ $0.count >= 5 }) else { return nil }
        let n = GazeTracker.featureCount
        let mean = (0..<n).map { i in all.map { $0[i] }.reduce(0, +) / Double(all.count) }
        self.mean = mean
        std = (0..<n).map { i in
            let m = mean[i]
            let v = all.map { ($0[i] - m) * ($0[i] - m) }.reduce(0, +) / Double(all.count)
            return max(sqrt(v), 1e-4)
        }
        var c: [UInt32: [Double]] = [:]
        for (id, rows) in samples {
            c[id] = (0..<n).map { i in rows.map { $0[i] }.reduce(0, +) / Double(rows.count) }
        }
        centroids = c
    }

    struct Prediction {
        let display: UInt32
        /// 0...1, how clearly the best screen beats the runner-up.
        let confidence: Double
    }

    /// Nearest screen among `among` (connected displays); calibrated-but-unplugged screens are ignored.
    func predict(_ x: [Double], among: Set<UInt32>) -> Prediction? {
        let ranked = centroids.filter { among.contains($0.key) }
            .map { (id, c) in (id, distance(x, c)) }.sorted { $0.1 < $1.1 }
        guard let best = ranked.first else { return nil }
        let second = ranked.count > 1 ? ranked[1].1 : best.1 * 2
        let confidence = second > 0 ? max(0, 1 - best.1 / second) : 0
        return Prediction(display: best.0, confidence: confidence)
    }

    private func distance(_ a: [Double], _ b: [Double]) -> Double {
        var d = 0.0
        for i in 0..<min(a.count, b.count) {
            let z = (a[i] - b[i]) / std[i]
            d += Self.weights[i] * z * z
        }
        return sqrt(d)
    }

    // MARK: persistence

    private static let key = "gazeModel"

    static func load() -> GazeModel? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(GazeModel.self, from: data)
    }

    func save() {
        if let data = try? JSONEncoder().encode(self) {
            UserDefaults.standard.set(data, forKey: Self.key)
        }
    }
}
