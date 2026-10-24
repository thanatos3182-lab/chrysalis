/* Router + service worker registration. */
(function () {
  "use strict";
  var RC = window.RC;
  function resolve(h) {
    if (RC.screens[h]) return RC.screens[h];
    for (var i = 0; i < (RC.dynamic || []).length; i++) { var r = RC.dynamic[i](h); if (r) return r; }
    return RC.screens["/"];
  }
  function route() {
    RC.runCleanups();
    var open = document.querySelector(".overlay"); if (open) open.remove();
    resolve(location.hash.replace(/^#/, ""))();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
