import XCTest
@testable import GazeHop

final class GazeModelTests: XCTestCase {
    /// Fake calibration samples: screens laid out left→right by head yaw / eye x.
    private func samples(yaws: [UInt32: Double]) -> [UInt32: [[Double]]] {
        var out: [UInt32: [[Double]]] = [:]
        for (id, yaw) in yaws {
            out[id] = (0..<20).map { i in
                let jitter = Double(i % 5 - 2) * 0.01
                return [yaw + jitter, 0, 0.5 + yaw / 4, 0.5, 0.5 + yaw / 3 + jitter, 0.5, 0.5, 0.5]
            }
        }
        return out
    }

    private func gaze(yaw: Double) -> [Double] {
        [yaw, 0, 0.5 + yaw / 4, 0.5, 0.5 + yaw / 3, 0.5, 0.5, 0.5]
    }

    func testPicksCorrectScreenAmongThree() throws {
        let model = try XCTUnwrap(GazeModel(samples: samples(yaws: [1: -0.5, 2: 0, 3: 0.5])))
        let all: Set<UInt32> = [1, 2, 3]
        XCTAssertEqual(model.predict(gaze(yaw: -0.48), among: all)?.display, 1)
        XCTAssertEqual(model.predict(gaze(yaw: 0.02), among: all)?.display, 2)
        XCTAssertEqual(model.predict(gaze(yaw: 0.51), among: all)?.display, 3)
    }

    func testFourScreens() throws {
        let model = try XCTUnwrap(GazeModel(samples: samples(yaws: [10: -0.6, 11: -0.2, 12: 0.2, 13: 0.6])))
        let all: Set<UInt32> = [10, 11, 12, 13]
        for (yaw, expected) in [(-0.6, 10), (-0.2, 11), (0.2, 12), (0.6, 13)] as [(Double, UInt32)] {
            XCTAssertEqual(model.predict(gaze(yaw: yaw), among: all)?.display, expected)
        }
    }

    func testIgnoresUnpluggedScreen() throws {
        let model = try XCTUnwrap(GazeModel(samples: samples(yaws: [1: -0.5, 2: 0, 3: 0.5])))
        // Screen 3 unplugged: looking where it was must not predict it.
        let p = model.predict(gaze(yaw: 0.5), among: [1, 2])
        XCTAssertEqual(p?.display, 2)
        XCTAssertNil(model.predict(gaze(yaw: 0), among: []))
    }

    func testConfidenceHigherWhenClear() throws {
        let model = try XCTUnwrap(GazeModel(samples: samples(yaws: [1: -0.5, 2: 0, 3: 0.5])))
        let all: Set<UInt32> = [1, 2, 3]
        let clear = try XCTUnwrap(model.predict(gaze(yaw: 0.5), among: all))
        let between = try XCTUnwrap(model.predict(gaze(yaw: 0.25), among: all))
        XCTAssertGreaterThan(clear.confidence, between.confidence)
    }

    func testNeedsTwoScreens() {
        XCTAssertNil(GazeModel(samples: samples(yaws: [1: 0])))
    }
}
