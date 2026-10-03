export const BASE = import.meta.env.BASE_URL; // "/"
export const REPO = "https://github.com/kabirshah4/GazeHop";
// The app itself (a disk image), served from this site so Download starts the file right away,
// never GitHub's source zip. scripts/make-dmg.sh puts the newest build in public/download/.
export const DOWNLOAD = `${BASE}download/Swivel.dmg`;
export const ISSUES = `${REPO}/issues`;
export const LICENSE = `${REPO}/blob/main/LICENSE`;
export const SOURCE = `${REPO}/tree/main/Sources/Swivel`;

