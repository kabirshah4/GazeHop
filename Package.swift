// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Swivel",
    platforms: [.macOS(.v14)],
    targets: [
        .executableTarget(name: "Swivel", path: "Sources/Swivel"),
        .testTarget(name: "SwivelTests", dependencies: ["Swivel"], path: "Tests/SwivelTests"),
    ]
)
