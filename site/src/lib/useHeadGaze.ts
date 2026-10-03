import { useEffect, useRef, useState } from "react";
import { BASE } from "./links";

export type GazeStatus = "off" | "loading" | "calibrating" | "tracking" | "no-face" | "denied" | "error";
export type Side = "first" | "second";

/**
 * In-browser version of GazeHop's idea: estimate head turn from the webcam and report which
 * half of the stage you're looking at. Runs MediaPipe's face landmarker locally (runtime and
 * model are served from this site); video frames never leave the tab.
 */
export function useHeadGaze(enabled: boolean, dwellMs = 250) {
  const [status, setStatus] = useState<GazeStatus>("off");
  const [side, setSide] = useState<Side>("first");
  const [lean, setLean] = useState(0); // -1..1 for the live indicator
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!enabled) { setStatus("off"); return; }
    let stopped = false;
    let stream: MediaStream | null = null;
    let raf = 0;
    let landmarker: { detectForVideo: Function; close: () => void } | null = null;

    (async () => {
      setStatus("loading");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
      } catch {
        if (!stopped) setStatus("denied");
        return;
      }
      try {
        const vision = await import("@mediapipe/tasks-vision");
        const files = await vision.FilesetResolver.forVisionTasks(`${BASE}vendor/mediapipe`);
        landmarker = await vision.FaceLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: `${BASE}vendor/mediapipe/face_landmarker.task`, delegate: "GPU" },
          runningMode: "VIDEO",
          numFaces: 1, // one person at a time, like the app
        });
      } catch {
        if (!stopped) setStatus("error");
        return;
      }
      if (stopped) return;

      const video = document.createElement("video");
      video.playsInline = true;
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      videoRef.current = video;

      // Baseline: where "straight ahead" is for this person and camera.
      const baseline: number[] = [];
      let base = 0.5;
      let candidate: Side | null = null;
      let since = 0;
      let current: Side = "first";
      let smoothed = 0.5;
      let lastFace = performance.now();
      setStatus("calibrating");

      const tick = () => {
        if (stopped) return;
        const now = performance.now();
        const res = landmarker!.detectForVideo(video, now);
        const pts = res?.faceLandmarks?.[0];
        if (!pts) {
          // Give people a moment to get in frame before saying we can't see them.
          if (now - lastFace > 3000) setStatus("no-face");
        } else {
          lastFace = now;
          // Nose tip relative to the cheeks: ~0.5 facing the camera, grows as you turn left.
          const nose = pts[1], left = pts[234], right = pts[454];
          const ratio = (nose.x - left.x) / Math.max(1e-3, right.x - left.x);
          smoothed = smoothed * 0.6 + ratio * 0.4;
          if (baseline.length < 25) {
            baseline.push(ratio);
            setStatus("calibrating");
            if (baseline.length === 25) {
              base = baseline.reduce((a, b) => a + b, 0) / baseline.length;
              setStatus("tracking");
            }
          } else {
            const d = smoothed - base;
            setLean(Math.max(-1, Math.min(1, d / 0.12)));
            setStatus("tracking");
            // Turning toward your left means the first (left) screen. Small turns are ignored.
            const looking: Side | null = d > 0.05 ? "first" : d < -0.05 ? "second" : null;
            if (looking && looking !== current) {
              if (candidate !== looking) { candidate = looking; since = now; }
              else if (now - since >= dwellMs) { current = looking; setSide(looking); candidate = null; }
            } else if (!looking || looking === current) {
              candidate = null;
            }
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
      videoRef.current = null;
    };
  }, [enabled, dwellMs]);

  return { status, side, lean };
}
