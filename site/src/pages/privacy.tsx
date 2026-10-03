import { renderDoc } from "../components/Doc";
import { ISSUES, SOURCE } from "../lib/links";

renderDoc("Privacy", "Privacy", "3 October 2026", <>
  <p>GazeHop is built so that there is very little to say here. It has no accounts, no servers, no analytics and no crash reporting, and the app contains no networking code.</p>

  <h2>The camera</h2>
  <ul>
    <li>GazeHop reads frames from your webcam to work out your head direction and where your eyes point.</li>
    <li>Each frame is analysed in memory on your Mac and then discarded. Frames are never saved, recorded or uploaded.</li>
    <li>macOS shows its camera indicator whenever GazeHop is using the camera. Pausing GazeHop (⌘F1 by default) turns the camera off.</li>
  </ul>

  <h2>What is stored on your Mac</h2>
  <ul>
    <li>Your settings and calibration, in GazeHop's preferences. Calibration is a few numbers per screen, never images.</li>
    <li>If you turn on detailed debug logging, <code>~/Library/Logs/GazeHop.log</code> can contain app names and window titles. It stays on your Mac, and you can delete it at any time.</li>
  </ul>

  <h2>Permissions</h2>
  <ul>
    <li><b>Camera</b>: to see which screen you're looking at.</li>
    <li><b>Accessibility</b>: to bring the window on that screen to the front and give it keyboard focus. GazeHop does not read what you type.</li>
  </ul>

  <h2>This website</h2>
  <p>This site sets no cookies and runs no analytics or trackers. Fonts, images and the face model for the camera demo are served from this site, not third parties. The camera demo on the home page runs entirely in your browser tab; your video is never sent anywhere, and the camera turns off when you leave or press "Turn camera off". The site is hosted on GitHub Pages, and GitHub may keep standard server logs as described in its own privacy statement.</p>

  <h2>Check it yourself</h2>
  <p>GazeHop is open source. You can <a href={SOURCE}>read the code</a> to confirm everything on this page. Questions? <a href={ISSUES}>Open an issue on GitHub</a>.</p>
</>);
