/* Pattern Connections: simple counting over your journal tags, check-ins, and practice results.
   No AI and nothing leaves this device. Patterns are not proof of cause. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function inc(m, k) { m[k] = (m[k] || 0) + 1; }
  function sortedKeys(m) { return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }); }
  function avg(l) { return l.length ? l.reduce(function (s, x) { return s + x; }, 0) / l.length : 0; }
  function has(arr, x) { return arr.indexOf(x) >= 0; }
  function f1(n) { return n.toFixed(1); }

  // returns {count, sections:[[head, body], ...]}
  function build() {
    var T = RC.TAGS, out = [], cutoff = Date.now() - 90 * 86400000;
    var es = RC.journal.all().filter(function (e) { return e.ts >= cutoff && e.tags && e.tags.length; });
    var trig = {}, pairs = {}, skillByTrig = {}, trigDow = {}, trigDays = {}, skillDays = {};

    es.forEach(function (e) {
      var ms = [], ts = [], ss = [], day = RC.isoOf(new Date(e.ts)), dow = new Date(e.ts).getDay();
      e.tags.forEach(function (t) {
        if (has(T.moods, t)) ms.push(t);
        else if (has(T.triggers, t) && t !== "no trigger") ts.push(t);
        else if (has(T.skills, t) && t !== "no skill") ss.push(t);
      });
      if (ss.length) skillDays[day] = true;
      ts.forEach(function (t) {
        inc(trig, t);
        if (!trigDow[t]) trigDow[t] = [0, 0, 0, 0, 0, 0, 0];
        trigDow[t][dow]++;
        if (!trigDays[t]) trigDays[t] = {};
        trigDays[t][day] = true;
        if (!skillByTrig[t]) skillByTrig[t] = {};
        ss.forEach(function (s) { inc(skillByTrig[t], s); });
        ms.forEach(function (m) { inc(pairs, m + " + " + t); });
      });
    });

    // 1. recurring triggers and what you reach for
    var tl = sortedKeys(trig), trigTotal = tl.reduce(function (s, k) { return s + trig[k]; }, 0);
    if (trigTotal >= 3) {
      var n = Math.min(3, tl.length), lines = [];
      tl.slice(0, n).forEach(function (t) {
        var line = t + ": " + trig[t] + " entries", sm = skillByTrig[t], sk = sm ? sortedKeys(sm) : [];
        line += sk.length ? "\n   you most often used: " + sk[0] + " (" + sm[sk[0]] + "x)" : "\n   no skill logged with it yet";
        lines.push(line);
      });
      out.push(["Your recurring triggers", lines.join("\n")]);

      // 2. weekday clusters
      var wk = [];
      tl.slice(0, n).forEach(function (t) {
        var total = trig[t]; if (total < 4) return;
        var d = trigDow[t], best = 0, j;
        for (j = 1; j < 7; j++) if (d[j] > d[best]) best = j;
        if (d[best] * 2 >= total) wk.push(t + " entries cluster on " + DAYS[best] + "s (" + d[best] + " of " + total + ").");
      });
      if (wk.length) out.push(["When triggers land", wk.join("\n") + "\nWorth a plan for those days."]);
    }

    // 3. mood + trigger pairs
    var pl = sortedKeys(pairs);
    if (pl.length && pairs[pl[0]] >= 3) {
      var p = pl[0].split(" + ");
      out.push(["Feelings that travel together", "'" + p[0] + "' goes with '" + p[1] + "' most often (" + pairs[pl[0]] + " entries)."]);
    }

    // check-in urge by day
    var urge = {};
    RC.checkins.since(89).forEach(function (r) { urge[r.day] = r.urge; });
    var urgeDays = Object.keys(urge);

    // 4. triggers vs urge level
    var rows = [];
    Object.keys(trigDays).forEach(function (t) {
      var w = [], o = [];
      urgeDays.forEach(function (d) { (trigDays[t][d] ? w : o).push(urge[d]); });
      if (w.length >= 3 && o.length >= 3) {
        var a = avg(w), b = avg(o);
        if (a - b >= 1.0) rows.push({ t: t, d: a - b, a: a, b: b });
      }
    });
    rows.sort(function (x, y) { return y.d - x.d; });
    if (rows.length) {
      out.push(["Triggers and your urges", rows.slice(0, 2).map(function (r) {
        return r.t + " days: urge " + f1(r.a) + " vs " + f1(r.b) + " on other days";
      }).join("\n")]);
    }

    // 5. skill days vs urge level
    var sw = [], so = [];
    urgeDays.forEach(function (d) { (skillDays[d] ? sw : so).push(urge[d]); });
    if (sw.length >= 3 && so.length >= 3) {
      var a1 = avg(sw), b1 = avg(so);
      var msg = "Days you logged a skill (" + sw.length + "): urge " + f1(a1) + "\nDays you didn't (" + so.length + "): urge " + f1(b1) + "\n\n";
      if (a1 <= b1 - 0.7) msg += "Urges ran lower on days you used a skill. Worth keeping up.";
      else if (a1 >= b1 + 0.7) msg += "Urges ran higher on days you used a skill. That can just mean you reach for skills on the hard days.";
      else msg += "No clear difference yet.";
      out.push(["Do your skills show up in your numbers?", msg]);
    }

    // 6. practice strengths
    var sc = (window.RC_LEARN && window.RC_LEARN.scenarios) || [], last = {}, sk2 = {}, tried = 0;
    RC.store.get("learn.practice", []).forEach(function (x) { last[x.id] = x.r; });
    sc.forEach(function (s) {
      var r = last[s.id]; if (r === undefined) return;
      tried++;
      s.skills.forEach(function (k) { if (!sk2[k]) sk2[k] = [0, 0]; sk2[k][0] += r; sk2[k][1]++; });
    });
    var keys = Object.keys(sk2);
    if (tried >= 3 && keys.length >= 2) {
      var wkS = null, stS = null, wa = 99, sa = -1;
      keys.forEach(function (k) {
        var a = sk2[k][0] / sk2[k][1];
        if (a < wa) { wa = a; wkS = k; }
        if (a > sa) { sa = a; stS = k; }
      });
      if (sa - wa >= 0.5) {
        out.push(["Your practice picture", "Strongest in practice: " + stS + " (" + f1(sa) + " of 2)\nMost room to grow: " + wkS + " (" + f1(wa) + " of 2)\n\nToday's practice leans toward the skill with room to grow."]);
      }
    }
    return { count: es.length, sections: out };
  }

  RC.connections = {
    render: function (parent) {
      var r;
      try { r = build(); } catch (e) { r = { count: 0, sections: [] }; }
      parent.appendChild(el("h2", { text: "Connections" }));
      if (!r.sections.length) {
        parent.appendChild(el("p", { text: "Not enough yet. You have " + r.count + " tagged journal entr" + (r.count === 1 ? "y" : "ies") +
          ". Tag entries with a mood, trigger, and skill, and check in most days. Connections start showing around 3 tagged entries and get sharper past 10." }));
        return;
      }
      r.sections.forEach(function (s) {
        parent.appendChild(el("h3", { text: s[0] }));
        parent.appendChild(el("p", { class: "lines", text: s[1] }));
      });
      parent.appendChild(el("p", { class: "note", text: "Patterns aren't proof of cause. Other things can move both at once." }));
    }
  };
})();
