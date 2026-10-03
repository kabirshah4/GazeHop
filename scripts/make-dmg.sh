#!/bin/sh
# Builds Swivel.app and packages it as dist/Swivel.dmg: the one file people download.
# The disk image opens to Swivel.app next to an Applications shortcut, so installing is a drag.
# It is also copied into the website (site/public/download/Swivel.dmg), so the site's Download
# buttons fetch it directly; redeploy the site after running this.
set -e
cd "$(dirname "$0")/.."
./build.sh
STAGE=$(mktemp -d)
ditto build/Swivel.app "$STAGE/Swivel.app"
ln -s /Applications "$STAGE/Applications"
cp LICENSE "$STAGE/License.txt"
mkdir -p dist
rm -f dist/Swivel.dmg
hdiutil create -volname "Swivel" -srcfolder "$STAGE" -fs HFS+ -format UDZO -imagekey zlib-level=9 -ov dist/Swivel.dmg >/dev/null
rm -rf "$STAGE"
mkdir -p site/public/download
cp dist/Swivel.dmg site/public/download/Swivel.dmg
# Published checksum, so anyone can confirm their download wasn't altered: shasum -a 256 -c
(cd dist && shasum -a 256 Swivel.dmg) > site/public/download/Swivel.dmg.sha256
echo "Built dist/Swivel.dmg ($(du -h dist/Swivel.dmg | cut -f1)), version $(plutil -extract CFBundleShortVersionString raw Resources/Info.plist)"
