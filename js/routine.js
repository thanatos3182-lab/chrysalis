/* Daily structure: activities, check them off, and mark high-risk windows. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;

  function load() { var r = RC.store.get("routine", null) || {}; return { blocks: r.blocks || [], done: r.done || {} }; }
  function save(r) { return RC.store.set("routine", r); }

  RC.routine = {
    blocks: function () { return load().blocks.slice().sort(function (a, b) { return a.start - b.start; }); },
    gaps: function (all) {
      var out = [];
      all.forEach(function (r) {
        if (r.kind !== 1) return;
        var cov = [];
        all.forEach(function (a) {
          if (a.kind !== 0) return;
          var s = Math.max(a.start, r.start), e = Math.min(a.end, r.end);
          if (s < e) cov.push([s, e]);
        });
        cov.sort(function (x, y) { return x[0] - y[0]; });
        var cur = r.start;
        cov.forEach(function (c) { if (c[0] - cur >= 30) out.push("Nothing planned " + RC.fmtTime(cur) + " to " + RC.fmtTime(c[0])); cur = Math.max(cur, c[1]); });
        if (r.end - cur >= 30) out.push("Nothing planned " + RC.fmtTime(cur) + " to " + RC.fmtTime(r.end));
      });
      return out;
    }
  };

  function routine() {
    RC.shell("Daily structure");
    RC.app.appendChild(el("p", { class: "muted", text: "Plan your day, mark the hours that are hardest, and fill them before they arrive. Tap an activity to check it off today." }));
    var r = load(), today = RC.dayKey(0), doneToday = r.done[today] || [], all = RC.routine.blocks();
    var acts = all.filter(function (b) { return b.kind === 0; }), risks = all.filter(function (b) { return b.kind === 1; });
    var doneN = acts.filter(function (b) { return doneToday.indexOf(b.id) >= 0; }).length;

    var sum = el("div", { class: "card", "aria-live": "polite" });
    if (!all.length) {
      sum.appendChild(el("p", { style: "margin:0", text: "Nothing planned yet. Start with your hardest hours: add a high-risk window below, then fill it with activities." }));
    } else {
      sum.appendChild(el("div", { style: "font-weight:700;color:var(--green)", text: acts.length ? "Done today: " + doneN + " of " + acts.length : "No activities yet" }));
      if (!risks.length) sum.appendChild(el("p", { class: "muted", style: "margin:8px 0 0", text: "Tip: add a high-risk window for the hours that are hardest, and empty stretches inside it will be flagged." }));
      else {
        var g = RC.routine.gaps(all);
        if (!g.length) sum.appendChild(el("p", { style: "margin:8px 0 0", text: "Your high-risk windows are covered." }));
        else {
          g.forEach(function (t) { sum.appendChild(el("p", { style: "margin:8px 0 0;color:#ffb347", text: "\u26A0 " + t })); });
          sum.appendChild(el("p", { class: "muted", style: "margin:8px 0 0", text: "Ideas: a meeting, a call, a walk, a shower and an early bed, or something absorbing like cooking or a puzzle." }));
        }
      }
    }
    RC.app.appendChild(sum);

    all.forEach(function (b) {
      var del = el("button", { class: "btn danger", text: "Delete", "aria-label": "Delete " + b.title, onclick: function () {
        if (!confirm("Delete \"" + b.title + "\"?")) return;
        var x = load(); x.blocks = x.blocks.filter(function (k) { return k.id !== b.id; }); if (save(x)) routine();
      } });
      var span = RC.fmtTime(b.start) + " to " + RC.fmtTime(b.end);
      if (b.kind === 1) {
        RC.app.appendChild(el("div", { class: "card", style: "border-color:#ffb347" }, [
          el("div", { style: "color:#ffb347;font-weight:700", text: "\u26A0 " + span }), el("div", { text: "High-risk window" }), el("div", { class: "row" }, [del])
        ]));
      } else {
        var on = doneToday.indexOf(b.id) >= 0;
        RC.app.appendChild(el("div", { class: "card" }, [
          el("button", { class: "check" + (on ? " on" : ""), role: "checkbox", "aria-checked": on ? "true" : "false", onclick: function () {
            var x = load(), d = x.done[today] || [], i = d.indexOf(b.id);
            if (i >= 0) d.splice(i, 1); else d.push(b.id);
            x.done[today] = d; if (save(x)) routine();
          } }, [document.createTextNode((on ? "\u2611  " : "\u2610  ") + span), el("span", { class: "sub", text: b.title })]),
          el("div", { class: "row" }, [del])
        ]));
      }
    });

    var name = el("input", { type: "text", id: "an", placeholder: "e.g. Meeting, work, walk, call sponsor", autocomplete: "off" });
    var s1 = el("input", { type: "time", id: "as", value: "09:00" }), e1 = el("input", { type: "time", id: "ae", value: "10:00" });
    function add(kind, title, s, e) {
      var a = RC.timeToMin(s), b = RC.timeToMin(e);
      if (b <= a) { RC.toast("End must be after start. For past midnight, add two entries."); return; }
      var x = load(); x.blocks.push({ id: RC.uid(), kind: kind, title: title, start: a, end: b }); if (save(x)) routine();
    }
    RC.app.appendChild(el("div", { class: "card" }, [
      el("h3", { text: "Add an activity", style: "margin-top:0" }),
      RC.field("an", "Activity", name), RC.field("as", "Start time", s1), RC.field("ae", "End time", e1),
      el("button", { class: "btn", text: "Add activity", onclick: function () { add(0, name.value.trim() || "Activity", s1.value, e1.value); } })
    ]));
    var s2 = el("input", { type: "time", id: "rs", value: "21:00" }), e2 = el("input", { type: "time", id: "re", value: "23:00" });
    RC.app.appendChild(el("div", { class: "card" }, [
      el("h3", { text: "Add a high-risk window", style: "margin-top:0" }),
      RC.field("rs", "Starts", s2), RC.field("re", "Ends", e2),
      el("button", { class: "btn ghost", text: "Add high-risk window", onclick: function () { add(1, "High-risk window", s2.value, e2.value); } })
    ]));
  }
  RC.screens["/routine"] = routine;
})();
