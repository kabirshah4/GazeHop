import { renderDoc } from "../components/Doc";
import { BASE, ISSUES, LICENSE } from "../lib/links";

renderDoc("Legal", "Terms and license", "3 October 2026", <>
  <p>Swivel is free to use. Its source code is published so you can see how it works, but it is not open source: Swivel is copyright © 2026 Kabir Shah, and all rights are reserved. The full terms are in the <a href={LICENSE}>Swivel license</a>. This page summarises them.</p>

  <h2>What you can do</h2>
  <ul>
    <li>Download the official app from this site or the GitHub Releases page, and use it on any number of your Macs, for any purpose, including at work. It costs nothing.</li>
    <li>Read the source code, and build an unmodified copy on your own Mac to check how it works or that it matches the official app.</li>
    <li>Report problems, suggest changes, and quote short pieces of the code when you do.</li>
  </ul>

  <h2>What you can't do without permission</h2>
  <ul>
    <li>Copy, publish, redistribute, sell or share the code or the app, in whole or in part. Link people to this site instead.</li>
    <li>Modify the code, or use any of its code, design or assets in another app, product, service or website.</li>
    <li>Use the code or assets to train machine learning models.</li>
    <li>Use the Swivel name or logo for your own products, or suggest you are Swivel or endorsed by it.</li>
  </ul>
  <p>To ask for permission, <a href={ISSUES}>open an issue on GitHub</a>.</p>

  <h2>Earlier versions</h2>
  <p>Versions published before 3 October 2026, when the app was called GazeHop, were released under the MIT License. If you received one of those, you keep the rights the MIT License gave you for that version. Everything published since then is covered by the Swivel license.</p>

  <h2>No warranty</h2>
  <p>Swivel is provided "as is", without warranty of any kind. It moves keyboard focus between windows based on an estimate of where you're looking, and that estimate can be wrong. Pause it (⌘F1 by default) whenever a focus change could cause a problem, for example while typing passwords or sending important messages.</p>

  <h2>Limitation of liability</h2>
  <p>To the fullest extent the law allows, Kabir Shah is not liable for any claim, damages or other liability arising from Swivel or your use of it, including text typed into the wrong window, lost data or lost work.</p>

  <h2>Trademarks</h2>
  <p>The Swivel name, as used for this app, and the Swivel logo belong to Kabir Shah. Swivel was previously called GazeHop. It is an independent project and is not affiliated with or endorsed by Apple. Apple, Mac and macOS are trademarks of Apple Inc.</p>

  <h2>Third-party components</h2>
  <p>This website uses some third-party software and fonts, each under its own license. See the <a href={`${BASE}third-party-notices.txt`}>third-party notices</a>.</p>

  <h2>Contact</h2>
  <p>Report problems or ask questions by <a href={ISSUES}>opening an issue on GitHub</a>.</p>
</>);
