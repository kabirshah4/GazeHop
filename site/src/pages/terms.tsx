import { renderDoc } from "../components/Doc";
import { ISSUES, LICENSE } from "../lib/links";

renderDoc("Legal", "Terms and license", "3 October 2026", <>
  <p>GazeHop is free, open-source software released under the <a href={LICENSE}>MIT license</a>. You can use, copy, modify and share it, including commercially, as long as the license notice stays with it.</p>

  <h2>No warranty</h2>
  <p>As the license says, GazeHop is provided "as is", without warranty of any kind. It moves keyboard focus between windows based on an estimate of where you're looking, and that estimate can be wrong. Pause it (⌘F1 by default) whenever a focus change could cause a problem, for example while typing passwords or sending important messages.</p>

  <h2>Not affiliated with Apple</h2>
  <p>GazeHop is an independent project. Apple, Mac and macOS are trademarks of Apple Inc.</p>

  <h2>Contact</h2>
  <p>Report problems or ask questions by <a href={ISSUES}>opening an issue on GitHub</a>.</p>
</>);
