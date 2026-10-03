export const BASE = import.meta.env.BASE_URL; // "/"
export const REPO = "https://github.com/kabirshah4/GazeHop";
// The app itself (a disk image), never the source zip. Each release must attach "GazeHop.dmg"
// (built by scripts/make-dmg.sh) so this always points at the newest version.
export const DOWNLOAD = `${REPO}/releases/latest/download/GazeHop.dmg`;
export const ISSUES = `${REPO}/issues`;
export const LICENSE = `${REPO}/blob/main/LICENSE`;
export const SOURCE = `${REPO}/tree/main/Sources/GazeHop`;

