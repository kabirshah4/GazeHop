// The site used to live at gazehop.gazehop-site.workers.dev (the app was called GazeHop).
// This tiny worker keeps every old link working: it permanently redirects to the same path on
// the new address, and maps the old download file names to the new ones.
const NEW_ORIGIN = "https://swivel.gazehop-site.workers.dev";

export default {
  fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/download\/GazeHop\.dmg/, "/download/Swivel.dmg");
    return Response.redirect(NEW_ORIGIN + path + url.search, 301);
  },
};
