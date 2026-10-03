#!/bin/sh
# Builds GazeHop.app and packages it as dist/GazeHop.dmg: the one file people download.
# The disk image opens to GazeHop.app next to an Applications shortcut, so installing is a drag.
# It is also copied into the website (site/public/download/GazeHop.dmg), so the site's Download
# buttons fetch it directly; redeploy the site after running this.
set -e
cd "$(dirname "$0")/.."
./build.sh
STAGE=$(mktemp -d)
ditto build/GazeHop.app "$STAGE/GazeHop.app"
ln -s /Applications "$STAGE/Applications"
cp LICENSE "$STAGE/License.txt"
mkdir -p dist
rm -f dist/GazeHop.dmg
hdiutil create -volname "GazeHop" -srcfolder "$STAGE" -fs HFS+ -format UDZO -imagekey zlib-level=9 -ov dist/GazeHop.dmg >/dev/null
rm -rf "$STAGE"
mkdir -p site/public/download
cp dist/GazeHop.dmg site/public/download/GazeHop.dmg
echo "Built dist/GazeHop.dmg ($(du -h dist/GazeHop.dmg | cut -f1)), version $(plutil -extract CFBundleShortVersionString raw Resources/Info.plist)"
