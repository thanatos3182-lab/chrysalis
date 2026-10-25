/* Milestones and money saved. Uses the start date from the home screen. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var MS = [1, 3, 7, 14, 30, 60, 90, 120, 180, 270, 365, 500, 730, 1000, 1095];
  RC.MILESTONES = MS;

  function milestones() {
    RC.shell("Milestones and savings");
    var start = RC.store.get("sober", null);
    if (!start) {
      RC.app.appendChild(el("p", { class: "muted", text: "Set your start date on the main screen to see your milestones." }));
      RC.app.appendChild(el("a", { class: "btn", href: "#/", text: "Go to main screen" }));
      return;
    }
    var sv = RC.store.get("savings", {});
    var weekly = el("input", { type: "text", id: "wk", inputmode: "decimal", placeholder: "Weekly amount, e.g. 60", value: sv.weekly || "", autocomplete: "off" });
    var gname = el("input", { type: "text", id: "gn", placeholder: "Goal, e.g. new tires", value: sv.goalName || "", autocomplete: "off" });
    var gamt = el("input", { type: "text", id: "ga", inputmode: "decimal", placeholder: "Goal amount, e.g. 400", value: sv.goalAmt || "", autocomplete: "off" });
    var summary = el("div", { class: "card", "aria-live": "polite" });
    RC.app.appendChild(summary);

    function draw() {
      RC.clear(summary);
      var d = RC.daysSince(start), w = RC.num(weekly.value), saved = d * w / 7, g = RC.num(gamt.value);
      summary.appendChild(el("div", { class: "big-num", style: "font-size:44px", text: d + (d === 1 ? " day" : " days") }));
      if (w > 0) summary.appendChild(el("p", { style: "text-align:center;margin:0", text: RC.money(saved) + " saved so far" }));
      if (g > 0) {
        var pct = Math.min(100, Math.round(saved / g * 100)), gn = gname.value.trim();
        summary.appendChild(el("p", { style: "text-align:center;margin:8px 0 0", text: "Goal" + (gn ? " (" + gn + ")" : "") + ": " + RC.money(saved) + " of " + RC.money(g) + " (" + pct + "%)" }));
        summary.appendChild(el("div", { class: "bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": "Goal progress" }, [el("div", { style: "width:" + pct + "%" })]));
      }
    }
    [weekly, gname, gamt].forEach(function (n) { n.addEventListener("input", draw); });
    draw();

    RC.app.appendChild(el("h2", { text: "Money saved (optional)" }));
    RC.app.appendChild(el("div", { class: "card", style: "margin-top:0" }, [
      RC.field("wk", "About how much did you spend per week on what you're leaving behind?", weekly),
      RC.field("gn", "Saving toward something? (optional)", gname),
      RC.field("ga", "Goal amount (optional)", gamt),
      el("button", { class: "btn", text: "Save", onclick: function () {
        if (RC.store.set("savings", { weekly: weekly.value.trim(), goalName: gname.value.trim(), goalAmt: gamt.value.trim() })) RC.toast("Saved.");
      } })
    ]));

    RC.app.appendChild(el("h2", { text: "Milestones" }));
    var d = RC.daysSince(start), card = el("div", { class: "card" }), nextMarked = false, base = RC.parseISO(start);
    MS.forEach(function (ms) {
      var row;
      if (d >= ms) row = "\u2713  Day " + ms + " (reached)";
      else {
        var when = new Date(base); when.setDate(when.getDate() + ms);
        var left = ms - d;
        row = (nextMarked ? "\u25CB  " : "\u2192  ") + "Day " + ms + " - " + when.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) + " (in " + left + (left === 1 ? " day)" : " days)") + (nextMarked ? "" : " (next)");
        nextMarked = true;
      }
      card.appendChild(el("div", { class: "ms", style: d >= ms ? "color:var(--green)" : "", text: row }));
    });
    RC.app.appendChild(card);
  }
  RC.screens["/milestones"] = milestones;
})();
