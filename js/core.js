/* Core helpers: storage, DOM builder, modal, toast, dates, router registry. */
(function () {
  "use strict";
  var RC = window.RC = { screens: {}, cleanups: [] };

  // ---------- storage: everything stays on this device ----------
  var P = "rc:";
  RC.store = {
    get: function (key, fallback) {
      try { var v = localStorage.getItem(P + key); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (key, val) {
      try { localStorage.setItem(P + key, JSON.stringify(val)); return true; }
      catch (e) { RC.toast("Couldn't save. Storage may be full or blocked."); return false; }
    },
    snapshot: function () {
      var out = {};
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k.indexOf(P) === 0) out[k.slice(P.length)] = JSON.parse(localStorage.getItem(k));
        }
      } catch (e) {}
      return out;
    }
  };

  // ---------- DOM ----------
  RC.app = document.getElementById("app");
  RC.el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  };
  RC.clear = function (node) { node = node || RC.app; while (node.firstChild) node.removeChild(node.firstChild); };
  RC.onLeave = function (fn) { RC.cleanups.push(fn); };
  RC.runCleanups = function () { var c = RC.cleanups; RC.cleanups = []; c.forEach(function (f) { try { f(); } catch (e) {} }); };
  RC.go = function (hash) { location.hash = hash; };

  RC.shell = function (title, back) {
    RC.clear();
    RC.app.appendChild(RC.el("div", { class: "top" }, [
      RC.el("button", { class: "back", text: "\u2039 Back", "aria-label": "Back", onclick: function () { RC.go(back || "#/"); } })
    ]));
    if (title) RC.app.appendChild(RC.el("h1", { text: title, tabindex: "-1" }));
  };

  var toastTimer;
  RC.toast = function (msg) {
    var old = document.querySelector(".toast"); if (old) old.remove();
    var t = RC.el("div", { class: "toast", role: "status", text: msg });
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 2600);
  };

  // buttons: [{label, kind: "", "ghost", onClick}]
  RC.modal = function (title, body, buttons) {
    var prev = document.activeElement;
    var overlay = RC.el("div", { class: "overlay" });
    var box = RC.el("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": title });
    box.appendChild(RC.el("h2", { text: title }));
    box.appendChild(RC.el("div", { class: "body", text: body }));
    var row = RC.el("div", { class: "stack" });
    function close() { overlay.remove(); if (prev && prev.focus) try { prev.focus(); } catch (e) {} }
    var first;
    buttons.forEach(function (b) {
      var node = RC.el(b.href ? "a" : "button", {
        class: "btn block" + (b.kind ? " " + b.kind : ""), text: b.label, href: b.href || null,
        onclick: function () { close(); if (b.onClick) b.onClick(); }
      });
      if (!first) first = node;
      row.appendChild(node);
    });
    box.appendChild(row); overlay.appendChild(box); document.body.appendChild(overlay);
    if (first) first.focus();
    return close;
  };

  // ---------- dates ----------
  RC.todayISO = function () {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  RC.daysSince = function (iso) {
    var a = iso.split("-").map(Number), b = RC.todayISO().split("-").map(Number);
    return Math.max(0, Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 86400000));
  };
  RC.fmtDateTime = function (ts) {
    return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  };

  // ---------- phone links ----------
  RC.cleanNumber = function (n) { return String(n || "").replace(/[^0-9+]/g, ""); };
  RC.isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  RC.smsHref = function (number, body) {
    return "sms:" + RC.cleanNumber(number) + (RC.isIOS ? "&" : "?") + "body=" + encodeURIComponent(body);
  };

  // ---------- journal (shared by home and Craving SOS) ----------
  RC.journal = {
    all: function () { return RC.store.get("journal", []); },
    add: function (text) {
      var list = RC.journal.all(); var ts = Date.now();
      list.unshift({ id: ts, ts: ts, text: text });
      return RC.store.set("journal", list);
    },
    remove: function (id) {
      return RC.store.set("journal", RC.journal.all().filter(function (e) { return e.id !== id; }));
    }
  };

  RC.logo = function () {
    var wrap = document.createElement("div");
    wrap.innerHTML = '<svg class="logo" viewBox="0 0 100 100" aria-hidden="true"><g fill="#3ddc84">' +
      '<path d="M48 46C38 22 16 14 9 24c-6 10 4 26 21 28 8 1 14-1 18-6z"/>' +
      '<path d="M52 46C62 22 84 14 91 24c6 10-4 26-21 28-8 1-14-1-18-6z"/>' +
      '<path d="M47 54C36 56 22 66 24 78c2 9 16 9 24-4 3-5 3-12 0-20z"/>' +
      '<path d="M53 54C64 56 78 66 76 78c-2 9-16 9-24-4-3-5-3-12 0-20z"/>' +
      '<rect x="48.2" y="34" width="3.6" height="46" rx="1.8"/></g>' +
      '<path d="M49 34C45 24 41 20 37 18M51 34C55 24 59 20 63 18" stroke="#3ddc84" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
    return wrap.firstChild;
  };
})();
