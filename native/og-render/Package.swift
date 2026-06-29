// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "og-render",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(name: "og-render"),
    ]
)