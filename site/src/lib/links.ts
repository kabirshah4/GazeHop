export const BASE = import.meta.env.BASE_URL; // "/"
export const REPO = "https://github.com/kabirshah4/GazeHop";
export const DOWNLOAD = `${REPO}/releases/latest`;
export const ISSUES = `${REPO}/issues`;
export const LICENSE = `${REPO}/blob/main/LICENSE`;
export const SOURCE = `${REPO}/tree/main/Sources/GazeHop`;

export const img = (name: string) => ({
  src: `${BASE}img/${name}-1600.webp`,
  srcSet: `${BASE}img/${name}-800.webp 800w, ${BASE}img/${name}-1600.webp 1600w`,
});
