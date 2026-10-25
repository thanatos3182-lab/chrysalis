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
    // Screen readers: announce the new screen by moving focus to its heading and updating the tab title.
    var h = RC.app.querySelector("h1");
    document.title = (h && h.textContent && h.textContent !== "Chrysalis" ? h.textContent + " - " : "") + "Chrysalis";
    if (h && !first) { try { h.focus({ preventScroll: true }); } catch (e) {} }
    first = false;
  }
  var first = true;

  // Dialogs: Escape closes, Tab stays inside, focus goes in on open and back out on close.
  var FOCUSABLE = "a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex='-1'])";
  var lastFocus = null;
  document.addEventListener("keydown", function (e) {
    var o = document.querySelector(".overlay"); if (!o) return;
    if (e.key === "Escape") { o.remove(); return; }
    if (e.key !== "Tab") return;
    var f = o.querySelectorAll(FOCUSABLE); if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.classList && n.classList.contains("overlay")) {
          if (!lastFocus) lastFocus = m.target === document.body ? document.activeElement : null;
          var f = n.querySelector(FOCUSABLE); if (f && !n.contains(document.activeElement)) f.focus();
        }
      });
      m.removedNodes.forEach(function (n) {
        if (n.classList && n.classList.contains("overlay") && !document.querySelector(".overlay")) {
          if (lastFocus && document.contains(lastFocus)) { try { lastFocus.focus(); } catch (e) {} }
          lastFocus = null;
        }
      });
    });
  }).observe(document.body, { childList: true });
  window.addEventListener("hashchange", route);
  route();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
