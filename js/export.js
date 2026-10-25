/* Counselor summary: choose sections, preview, share or copy. Journal and contacts are never included. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var OPTS = [["overview", "Overview (days, milestones)", true], ["plan", "My plan (reasons, go-to plan)", true], ["checkins", "Check-ins, last 30 days", true],
    ["appts", "Upcoming appointments", true], ["routine", "Daily structure", true], ["savings", "Savings (money info)", false]];

  function build(on) {
    var L = ["RECOVERY SUMMARY", "Prepared " + RC.fmtDate(RC.dayKey(0)), "Self-reported in Chrysalis."];
    var start = RC.store.get("sober", null), d = start ? RC.daysSince(start) : -1;
    if (on.overview) {
      L.push("", "OVERVIEW");
      if (d < 0) L.push("Start date not set.");
      else {
        L.push("Days in recovery: " + d, "Start date: " + RC.fmtDate(start));
        var last = 0, next = 0;
        RC.MILESTONES.forEach(function (ms) { if (d >= ms) last = ms; else if (!next) next = ms; });
        if (last) L.push("Last milestone reached: day " + last);
        if (next) L.push("Next milestone: day " + next + " (in " + (next - d) + " days)");
      }
    }
    if (on.plan) {
      L.push("", "MY PLAN");
      var p = RC.store.get("plan", {}), reasons = (p.reasons || "").trim(), go = (p.gotoPlan || "").trim();
      if (!reasons && !go) L.push("Nothing written yet.");
      else {
        if (reasons) L.push("Reasons I'm doing this:", reasons);
        if (go) L.push("", "When a craving hits:", go);
      }
    }
    if (on.checkins) {
      L.push("", "CHECK-INS (LAST 30 DAYS)");
      var rows = RC.checkins.since(29);
      if (!rows.length) L.push("No check-ins in this period.");
      else {
        var n = rows.length, sum = function (f) { return rows.reduce(function (s, r) { return s + r[f]; }, 0) / n; };
        L.push("Check-ins: " + n + " of 30 days", "Average mood: " + sum("mood").toFixed(1) + " of 5", "Average strongest urge: " + sum("urge").toFixed(1) + " of 10", "Average sleep: " + sum("sleep").toFixed(1) + " hrs");
        var hi = rows.filter(function (r) { return r.urge >= 7; }).reverse().slice(0, 5);
        if (hi.length) { L.push("Recent high-urge days (7+):"); hi.forEach(function (r) { L.push("  " + r.day + " (urge " + r.urge + ")"); }); }
        var wins = rows.filter(function (r) { return r.win; }).reverse().slice(0, 5);
        if (wins.length) { L.push("Recent wins:"); wins.forEach(function (r) { L.push("  " + r.day + ": " + r.win); }); }
      }
    }
    if (on.appts) {
      L.push("", "UPCOMING APPOINTMENTS");
      var up = RC.appts.upcoming();
      if (!up.length) L.push("None scheduled.");
      up.forEach(function (a) { L.push("  " + RC.appts.fmt(a.when) + " - " + a.title); });
    }
    if (on.routine) {
      L.push("", "DAILY STRUCTURE");
      var bl = RC.routine.blocks();
      if (!bl.length) L.push("Nothing planned yet.");
      bl.forEach(function (b) { L.push("  " + RC.fmtTime(b.start) + " to " + RC.fmtTime(b.end) + ": " + (b.kind === 1 ? "HIGH-RISK WINDOW" : b.title)); });
    }
    if (on.savings) {
      L.push("", "SAVINGS");
      var sv = RC.store.get("savings", {}), w = RC.num(sv.weekly), g = RC.num(sv.goalAmt);
      if (w <= 0 || d < 0) L.push("Not set up.");
      else {
        var saved = d * w / 7;
        L.push("Estimated weekly spending avoided: " + RC.money(w), "Estimated saved so far: " + RC.money(saved));
        if (g > 0) L.push("Goal" + (sv.goalName ? " (" + sv.goalName + ")" : "") + ": " + RC.money(saved) + " of " + RC.money(g));
      }
    }
    return L.join("\n");
  }

  RC.screens["/export"] = function () {
    RC.shell("Counselor summary");
    RC.app.appendChild(el("p", { class: "muted", text: "Pick what to include, check the preview, then share it however you like. Your journal and support contacts are never included." }));
    var on = {}, preview = el("textarea", { id: "pv", readonly: true, style: "min-height:260px;font-size:15px" });
    var card = el("fieldset", { class: "card checks" }, [el("legend", { text: "Include" })]);
    OPTS.forEach(function (o) {
      on[o[0]] = o[2];
      var cb = el("input", { type: "checkbox", id: "c-" + o[0] });
      cb.checked = o[2];
      cb.addEventListener("change", function () { on[o[0]] = cb.checked; draw(); });
      card.appendChild(el("label", { class: "cb", for: "c-" + o[0] }, [cb, document.createTextNode(" " + o[1])]));
    });
    RC.app.appendChild(card);
    function draw() { preview.value = build(on); }
    draw();
    RC.app.appendChild(el("h2", { text: "Preview" }));
    RC.app.appendChild(el("label", { for: "pv", class: "sr-only", text: "Summary preview" }));
    RC.app.appendChild(preview);
    RC.app.appendChild(el("div", { class: "row" }, [
      el("button", { class: "btn", text: "Share summary", onclick: function () {
        if (navigator.share) navigator.share({ title: "My recovery summary", text: preview.value }).catch(function () {});
        else RC.copy(preview.value);
      } }),
      el("button", { class: "btn ghost", text: "Copy to clipboard", onclick: function () { RC.copy(preview.value); } })
    ]));
  };
})();
