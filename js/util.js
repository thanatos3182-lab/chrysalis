/* Shared helpers for the daily-use screens: dates, files, calendar export, sliders, check-in data. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;

  RC.pad = function (n) { return String(n).padStart(2, "0"); };
  RC.isoOf = function (d) { return d.getFullYear() + "-" + RC.pad(d.getMonth() + 1) + "-" + RC.pad(d.getDate()); };
  RC.dayKey = function (ago) { var d = new Date(); d.setDate(d.getDate() - ago); return RC.isoOf(d); };
  RC.parseISO = function (s) { var a = s.split("-").map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  RC.fmtDate = function (iso) { return RC.parseISO(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); };
  RC.fmtTime = function (min) { var h = Math.floor(min / 60); return (h % 12 === 0 ? 12 : h % 12) + ":" + RC.pad(min % 60) + " " + (h < 12 ? "AM" : "PM"); };
  RC.timeToMin = function (hhmm) { var p = String(hhmm || "").split(":"); return (+p[0]) * 60 + (+p[1] || 0); };
  RC.money = function (v) { return v.toLocaleString(undefined, { style: "currency", currency: "USD" }); };
  RC.num = function (s) { var n = parseFloat(String(s || "").replace(/[^0-9.\-]/g, "")); return isNaN(n) ? 0 : n; };
  RC.uid = function () { return Date.now() + Math.floor(Math.random() * 1000); };
  RC.sr = function (text) { return el("span", { class: "sr-only", text: text }); };

  RC.field = function (id, label, node) { return el("div", { class: "field" }, [el("label", { for: id, text: label }), node]); };

  // Save a text file (or share it on phones that support sharing files).
  RC.download = function (name, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain" });
    var file; try { file = new File([blob], name, { type: mime || "text/plain" }); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).catch(function () {});
      return;
    }
    var a = el("a", { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click(); a.remove();
  };

  RC.copy = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { RC.toast("Copied."); }, function () { RC.toast("Couldn't copy. Select the text and copy it by hand."); });
    } else { RC.toast("Couldn't copy. Select the text and copy it by hand."); }
  };

  // Calendar file (.ics). ev: {title, place, start: Date, minutes, weeklyDay (0-6), alarmMinutes}
  RC.icsFile = function (ev) {
    function esc(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
    function stamp(d) { return d.getFullYear() + RC.pad(d.getMonth() + 1) + RC.pad(d.getDate()) + "T" + RC.pad(d.getHours()) + RC.pad(d.getMinutes()) + "00"; }
    var end = new Date(ev.start.getTime() + (ev.minutes || 60) * 60000);
    var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Chrysalis//EN", "BEGIN:VEVENT",
      "UID:" + RC.uid() + "@chrysalis", "DTSTAMP:" + stamp(new Date()) , "DTSTART:" + stamp(ev.start), "DTEND:" + stamp(end),
      "SUMMARY:" + esc(ev.title)];
    if (ev.place) L.push("LOCATION:" + esc(ev.place));
    if (ev.weeklyDay !== undefined) L.push("RRULE:FREQ=WEEKLY;BYDAY=" + ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][ev.weeklyDay]);
    if (ev.alarmMinutes) L.push("BEGIN:VALARM", "TRIGGER:-PT" + ev.alarmMinutes + "M", "ACTION:DISPLAY", "DESCRIPTION:" + esc(ev.title), "END:VALARM");
    L.push("END:VEVENT", "END:VCALENDAR");
    RC.download("chrysalis-event.ics", L.join("\r\n"), "text/calendar");
  };

  // Slider with a live, readable value. Returns {node, get}.
  RC.slider = function (id, label, min, max, value) {
    var out = el("output", { for: id, class: "val", text: String(value) });
    var input = el("input", { type: "range", id: id, min: String(min), max: String(max), step: "1", value: String(value) });
    function upd() { out.textContent = input.value; input.setAttribute("aria-valuetext", input.value + " of " + max); }
    input.addEventListener("input", upd); upd();
    return { node: el("div", { class: "field" }, [el("label", { for: id }, [document.createTextNode(label + ": "), out]), input]), get: function () { return +input.value; } };
  };

  // ---------- check-in data ----------
  RC.checkins = {
    all: function () { return RC.store.get("checkins", {}); },
    since: function (daysAgo) {
      var from = RC.dayKey(daysAgo), a = RC.checkins.all();
      return Object.keys(a).filter(function (d) { return d >= from; }).sort().map(function (d) {
        var r = a[d]; return { day: d, mood: r.mood, sleep: r.sleep, urge: r.urge, win: r.win || "" };
      });
    }
  };
})();
