#!/bin/sh
# Builds Swivel.app in ./build (universal: Apple silicon + Intel)
# Signs with "GazeHop Local Signing" if present (see scripts/make-signing-cert.sh) so macOS
# remembers Camera/Accessibility permissions across rebuilds; otherwise signs ad-hoc.
set -e
cd "$(dirname "$0")"
# Universal binary: runs natively on Apple silicon and Intel Macs
ARCHS="--arch arm64 --arch x86_64"
swift build -c release $ARCHS
BIN="$(swift build -c release $ARCHS --show-bin-path)/Swivel"
APP=build/Swivel.app
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$BIN" "$APP/Contents/MacOS/"
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
