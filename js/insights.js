/* Pattern insights from your own check-ins. Not diagnoses. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], ORDER = [1, 2, 3, 4, 5, 6, 0];

  function avg(l, f) { return l.length ? l.reduce(function (s, r) { return s + r[f]; }, 0) / l.length : 0; }
  function range(all, from, to) { return all.filter(function (r) { return r.day >= from && r.day <= to; }); }
  function trend(d, eps) { return d > eps ? "higher" : d < -eps ? "lower" : "about the same"; }
  function sec(head, body, mono) {
    RC.app.appendChild(el("h2", { text: head }));
    RC.app.appendChild(el("p", { class: mono ? "mono" : "lines", text: body }));
  }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  RC.screens["/insights"] = function () {
    RC.shell("Pattern insights");
    RC.app.appendChild(el("p", { class: "muted", text: "Built from your daily check-ins. These are patterns in your own data, not diagnoses." }));
    var all = RC.checkins.since(89), today = RC.dayKey(0);
    if (all.length < 7) {
      sec("Not enough data yet", "You have " + plural(all.length, "check-in") + " so far. Insights start showing at 7 and get more useful past 14. Check in most days and come back.");
      return;
    }
    var set = {}; all.forEach(function (r) { set[r.day] = true; });
    var k = set[today] ? 0 : 1, current = 0;
    while (k < 90 && set[RC.dayKey(k)]) { current++; k++; }
    var longest = 0, run = 0;
    for (var i = 89; i >= 0; i--) { if (set[RC.dayKey(i)]) { run++; longest = Math.max(longest, run); } else run = 0; }
    sec("Streaks", "Current streak: " + plural(current, "day") + "\nLongest (last 90 days): " + plural(longest, "day"));

    var m30 = range(all, RC.dayKey(29), today);
    if (m30.length) {
      var wins = m30.filter(function (r) { return r.win; }).length;
      sec("Last 30 days", "Check-ins: " + m30.length + " of 30 days\nAvg mood: " + avg(m30, "mood").toFixed(1) + " of 5\nAvg urge: " + avg(m30, "urge").toFixed(1) + " of 10\nAvg sleep: " + avg(m30, "sleep").toFixed(1) + " hrs\nWins logged: " + wins);
    }
    var tw = range(all, RC.dayKey(6), today), lw = range(all, RC.dayKey(13), RC.dayKey(7));
    if (tw.length >= 3 && lw.length >= 3) {
      var mt = avg(tw, "mood"), ml = avg(lw, "mood"), ut = avg(tw, "urge"), ul = avg(lw, "urge");
      sec("This week vs last week", "Mood: " + mt.toFixed(1) + " vs " + ml.toFixed(1) + " (" + trend(mt - ml, 0.3) + ")\nUrge: " + ut.toFixed(1) + " vs " + ul.toFixed(1) + " (" + trend(ut - ul, 0.5) + ")");
    }
    if (all.length < 14) { sec("More patterns coming", "Weekday and sleep patterns unlock at 14 check-ins. You're at " + all.length + "."); return; }

    var cnt = [0, 0, 0, 0, 0, 0, 0], um = [0, 0, 0, 0, 0, 0, 0], mm = [0, 0, 0, 0, 0, 0, 0];
    all.forEach(function (r) { var d = RC.parseISO(r.day).getDay(); cnt[d]++; um[d] += r.urge; mm[d] += r.mood; });
    var lines = [], hard = -1, easy = -1, hardU = -1, easyU = 99;
    ORDER.forEach(function (d) {
      if (!cnt[d]) { lines.push(NAMES[d] + "  no data"); return; }
      var u = um[d] / cnt[d], mo = mm[d] / cnt[d];
      lines.push(NAMES[d] + "  mood " + mo.toFixed(1) + "  urge " + u.toFixed(1) + "  (" + cnt[d] + ")");
      if (cnt[d] >= 2) { if (u > hardU) { hardU = u; hard = d; } if (u < easyU) { easyU = u; easy = d; } }
    });
    var sum = (hard >= 0 && easy >= 0 && hard !== easy && hardU - easyU >= 1)
      ? "Your strongest urges tend to land on " + NAMES[hard] + "s (avg " + hardU.toFixed(1) + "). Easiest: " + NAMES[easy] + "s (avg " + easyU.toFixed(1) + "). Worth planning something solid for " + NAMES[hard] + "s: a meeting, a call, a set routine."
      : "No big difference between days yet.";
    sec("By day of the week", lines.join("\n"), true);
    RC.app.appendChild(el("p", { text: sum }));

    var shortS = all.filter(function (r) { return r.sleep < 6; }), goodS = all.filter(function (r) { return r.sleep >= 7; }), sl;
    if (shortS.length >= 3 && goodS.length >= 3) {
      var us = avg(shortS, "urge"), ug = avg(goodS, "urge"), ms = avg(shortS, "mood"), mg = avg(goodS, "mood");
      sl = "Under 6 hrs (" + shortS.length + " days): urge " + us.toFixed(1) + ", mood " + ms.toFixed(1) + "\n7+ hrs (" + goodS.length + " days): urge " + ug.toFixed(1) + ", mood " + mg.toFixed(1) + "\n\n" +
        ((us - ug >= 0.7 || mg - ms >= 0.4) ? "On short-sleep days your urges or mood ran worse. Sleep may be worth protecting." : "No clear link between sleep and urges or mood in your data yet.") +
        "\nPatterns aren't proof of cause. Other things can move both at once.";
    } else {
      sl = "Needs at least 3 short-sleep days (under 6 hrs) and 3 good-sleep days (7+ hrs) to compare. You have " + shortS.length + " and " + goodS.length + ".";
    }
    sec("Sleep link", sl);
    sec("Reminder", "These numbers come only from what you log. If something here worries you, bring it to your counselor or care team. In crisis, call or text 988.");
  };
})();
