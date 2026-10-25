/* Daily check-in: mood, sleep, urge, one win. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var BLOCKS = "\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588";

  function spark(vals, lo, hi) {
    return vals.map(function (v) {
      if (v === null) return "\u00b7";
      var i = Math.round((v - lo) / (hi - lo) * 7);
      return BLOCKS.charAt(Math.max(0, Math.min(7, i)));
    }).join("");
  }
  function plain(vals) { return vals.map(function (v) { return v === null ? "none" : v; }).join(", "); }

  function checkin() {
    RC.shell("Daily check-in");
    RC.app.appendChild(el("p", { class: "muted", text: "30 seconds. You can update today's answers any time." }));
    var today = RC.dayKey(0), t = RC.checkins.all()[today];
    var mood = RC.slider("mood", "Mood today (1 rough, 5 great)", 1, 5, t ? t.mood : 3);
    var sleep = RC.slider("sleep", "Sleep last night (hours)", 0, 12, t ? Math.round(t.sleep) : 7);
    var urge = RC.slider("urge", "Strongest urge today (0 to 10)", 0, 10, t ? t.urge : 0);
    var win = el("textarea", { id: "win", placeholder: "e.g. went to a meeting, ate a real meal, made it through Friday" });
    win.value = t && t.win ? t.win : "";
    RC.app.appendChild(el("div", { class: "card" }, [
      mood.node, sleep.node, urge.node, RC.field("win", "One win today, big or small", win),
      el("button", { class: "btn block", text: "Save check-in", onclick: function () {
        var all = RC.checkins.all();
        all[today] = { mood: mood.get(), sleep: sleep.get(), urge: urge.get(), win: win.value.trim() };
        if (RC.store.set("checkins", all)) { RC.toast("Check-in saved."); checkin(); }
      } })
    ]));

    var rows = RC.checkins.since(13), by = {};
    rows.forEach(function (r) { by[r.day] = r; });
    var m = [], u = [], sum = 0, n = 0;
    for (var i = 13; i >= 0; i--) {
      var r = by[RC.dayKey(i)];
      if (!r) { m.push(null); u.push(null); continue; }
      m.push(r.mood); u.push(r.urge); sum += r.sleep; n++;
    }
    RC.app.appendChild(el("h2", { text: "Last 14 days" }));
    var txt = "Mood   " + spark(m, 1, 5) + "\nUrge   " + spark(u, 0, 10) + "\n(oldest to newest, dot = no check-in)";
    RC.app.appendChild(el("div", { class: "card" }, [
      el("div", { class: "mono", "aria-hidden": "true", text: txt }),
      RC.sr("Mood by day, oldest to newest: " + plain(m) + ". Urge by day: " + plain(u) + "."),
      el("p", { class: "muted", style: "margin:10px 0 0", text: "Check-ins: " + n + " of last 14 days" + (n ? "  |  Avg sleep: " + (sum / n).toFixed(1) + " hrs" : "") })
    ]));

    RC.app.appendChild(el("h2", { text: "Recent wins" }));
    var wins = RC.checkins.since(59).filter(function (r) { return r.win; }).reverse().slice(0, 5);
    var card = el("div", { class: "card" });
    if (!wins.length) card.appendChild(el("p", { class: "muted", style: "margin:0", text: "Your wins will show up here." }));
    wins.forEach(function (w) { card.appendChild(el("div", { class: "entry" }, [el("time", { text: RC.fmtDate(w.day) }), el("div", { class: "t", text: w.win })])); });
    RC.app.appendChild(card);
    RC.app.appendChild(el("p", { class: "note", text: "Browsers can't send daily reminders on iPhone. Add a repeating alarm on your phone's clock if you want one." }));
  }
  RC.screens["/checkin"] = checkin;
})();
