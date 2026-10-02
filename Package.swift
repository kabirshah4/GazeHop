// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "GazeHop",
    platforms: [.macOS(.v14)],
    targets: [
        .executableTarget(name: "GazeHop", path: "Sources/GazeHop"),
        .testTarget(name: "GazeHopTests", dependencies: ["GazeHop"], path: "Tests/GazeHopTests"),
    ]
)
