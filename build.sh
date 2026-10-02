#!/bin/sh
# Builds GazeHop.app in ./build
# Signs with "GazeHop Local Signing" if present (see scripts/make-signing-cert.sh) so macOS
# remembers Camera/Accessibility permissions across rebuilds; otherwise signs ad-hoc.
set -e
cd "$(dirname "$0")"
swift build -c release
APP=build/GazeHop.app
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp .build/release/GazeHop "$APP/Contents/MacOS/"
cp Resources/Info.plist "$APP/Contents/"
cp Resources/AppIcon.icns "$APP/Contents/Resources/"

IDENTITY="GazeHop Local Signing"
if security find-certificate -c "$IDENTITY" >/dev/null 2>&1; then
    codesign --force --sign "$IDENTITY" "$APP"
    echo "Built $APP (signed with \"$IDENTITY\")"
else
    codesign --force --sign - "$APP"
    echo "Built $APP (ad-hoc signed: macOS will ask for permissions again after each rebuild."
    echo "  Run scripts/make-signing-cert.sh once to fix that.)"
fi
