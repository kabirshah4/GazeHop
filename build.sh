#!/bin/sh
# Builds GazeHop.app (ad-hoc signed) in ./build
set -e
cd "$(dirname "$0")"
swift build -c release
APP=build/GazeHop.app
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS"
cp .build/release/GazeHop "$APP/Contents/MacOS/"
cp Resources/Info.plist "$APP/Contents/"
codesign --force --sign - "$APP"
echo "Built $APP"
