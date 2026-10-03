import { BASE } from "./links";

/**
 * The site enforces Trusted Types (see public/_headers), so the browser refuses any script URL
 * that hasn't passed through a policy. MediaPipe loads its WebAssembly runtime by setting a
 * <script> src, so this default policy lets exactly that through: same-origin files under
 * /vendor/mediapipe/. Anything else, including any injected script URL, throws.
 */
export function allowMediaPipeScripts() {
  const tt = (window as unknown as { trustedTypes?: { defaultPolicy: unknown; createPolicy: (n: string, r: object) => unknown } }).trustedTypes;
  if (!tt || tt.defaultPolicy) return;
  tt.createPolicy("default", {
    createScriptURL: (input: string) => {
      const url = new URL(input, location.href);
      if (url.origin === location.origin && url.pathname.startsWith(`${BASE}vendor/mediapipe/`)) return url.href;
      throw new TypeError(`Blocked script URL: ${input}`);
    },
  });
}
