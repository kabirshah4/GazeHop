import { renderDoc } from "../components/Doc";
import { ISSUES, SOURCE } from "../lib/links";

renderDoc("Privacy", "Privacy", "4 October 2026", <>
  <p>GazeHop is built so that there is very little to say here. It has no accounts, no servers, no analytics and no crash reporting, and the app contains no networking code.</p>

  <h2>The camera and your face</h2>
  <ul>
    <li>GazeHop reads frames from your webcam to estimate where your head points and where your pupils are.</li>
    <li>Each frame is analysed in memory on your Mac and then discarded. Frames are never saved, recorded or uploaded.</li>
    <li>GazeHop does not identify you, recognise faces or build a face template. It only measures angles and positions to decide which screen you're looking at, and follows one face at a time.</li>
    <li>macOS shows its camera indicator whenever GazeHop is using the camera. Pausing GazeHop (⌘F1 by default) turns the camera off.</li>
  </ul>

  <h2>What is stored on your Mac</h2>
  <ul>
    <li>Your settings, and your calibration: a few averaged head and eye angles per screen. No images. You can delete calibration at any time in <b>Settings › Advanced › Delete Calibration Data</b>.</li>
    <li>A small log file at <code>~/Library/Logs/GazeHop.log</code> (capped at about 1 MB) with switch events and app names. Window titles are only written if you turn on detailed debug logging. The log never leaves your Mac, and you can delete it at any time.</li>
  </ul>

  <h2>Permissions</h2>
  <ul>
    <li><b>Camera</b>: to see which screen you're looking at.</li>
    <li><b>Accessibility</b>: to bring the window on that screen to the front and give it keyboard focus. GazeHop does not read or record what you type. It only checks how long ago a key was pressed, so it can wait until you pause, and whether a password field is active, so it never switches during one.</li>
  </ul>

  <h2>This website</h2>
  <p>This site sets no cookies and runs no analytics or trackers. Fonts, images, video and the face model for the camera demo are served from this site, not from third parties. The camera demo on the home page runs entirely in your browser tab: your video is never sent anywhere, and the camera turns off when you leave the page or press "Turn camera off". The site is hosted on Cloudflare, which processes standard request data (such as IP addresses) to deliver and protect the site, as described in Cloudflare's privacy policy.</p>

  <h2>Check it yourself</h2>
  <p>GazeHop is open source. You can <a href={SOURCE}>read the code</a> to confirm everything on this page. Questions? <a href={ISSUES}>Open an issue on GitHub</a>.</p>
</>);
