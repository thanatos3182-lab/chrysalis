/* Learning engine: quizzes with mastery, practice scenarios, Today's practice, My progress.
   Content lives in data/learn.js (built from the Android app by tools/gen_learn.py).
   Everything is stored on this device only. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el, D = window.RC_DATA || { lessons: [], skills: [] };
  var L = window.RC_LEARN || {}, Q = L.quizzes || {}, SC = L.scenarios || [];
  var API = RC.learn = {};
  var CAP = 600; // keep the history lists from growing forever

  function enc(s) { return encodeURIComponent(s); }
  function dec(s) { try { return decodeURIComponent(s); } catch (e) { return null; } }
  function shuffle(a) {
    var b = a.slice(), i, j, t;
    for (i = b.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = b[i]; b[i] = b[j]; b[j] = t; }
    return b;
  }
  function titles(list) { return (list || []).map(function (x) { return x.title; }); }
  function byId(id) { for (var i = 0; i < SC.length; i++) if (SC[i].id === id) return SC[i]; return null; }
  function trim(list) { return list.length > CAP ? list.slice(list.length - CAP) : list; }

  // ---------- storage (three keys, all included in Backup and restore) ----------
  function progress() { return RC.store.get("learn.progress", {}); }
  function attempts() { return RC.store.get("learn.attempts", []); }
  function practiceLog() { return RC.store.get("learn.practice", []); }
  function lastPractice() { var m = {}; practiceLog().forEach(function (p) { m[p.id] = p.r; }); return m; }

  // Pass = 2 of 3 or better. First pass = learned. A pass on a different day after that = mastered.
  function record(topic, score, total) {
    var p = progress(), cur = p[topic] || { status: "new", best: 0, passes: 0, last: "" }, today = RC.todayISO();
    var a = attempts(); a.push({ t: topic, ts: Date.now(), s: score, n: total });
    RC.store.set("learn.attempts", trim(a));
    if (score * 3 >= total * 2) {
      cur.passes++;
      if (cur.status === "new") cur.status = "learned";
      else if (cur.status === "learned" && cur.last !== today) cur.status = "mastered";
      cur.last = today;
    }
    cur.best = Math.max(cur.best, score);
    p[topic] = cur; RC.store.set("learn.progress", p);
    return cur.status;
  }
  function logPractice(id, rating) {
    var l = practiceLog(); l.push({ id: id, ts: Date.now(), r: rating });
    RC.store.set("learn.practice", trim(l));
  }

  // ---------- lookups ----------
  API.hasQuiz = function (topic) { return !!(Q[topic] && Q[topic].length); };
  API.status = function (topic) { var p = progress()[topic]; return p ? p.status : "new"; };
  API.mark = function (topic) { var s = API.status(topic); return s === "mastered" ? "\u2713\u2713 " : s === "learned" ? "\u2713 " : ""; };
  API.statusWord = function (topic) { var s = API.status(topic); return s === "mastered" ? "mastered" : s === "learned" ? "learned" : ""; };
  API.summary = function (items) {
    var withQ = items.filter(function (it) { return API.hasQuiz(it.title); });
    if (!withQ.length) return "";
    var m = withQ.filter(function (it) { return API.status(it.title) === "mastered"; }).length;
    return m + " of " + withQ.length + " mastered";
  };

  function routeFor(topic) {
    var i, ls = D.lessons || [], ss = D.skills || [];
    for (i = 0; i < ls.length; i++) if (ls[i].title === topic) return "#/lesson/" + i;
    for (i = 0; i < ss.length; i++) if (ss[i].title === topic) return "#/skill/" + i;
    return null;
  }

  // Which scenarios a coping skill practices: a journal skill tag ("skill:xxx") or a lesson topic.
  var PRACTICE_FOR = {
    "Urge surfing": "skill:delay", "Play the tape forward": "skill:delay", "If-then plan": "skill:delay", "Delay and distract": "skill:delay",
    "Slow breathing": "skill:breathing", "5-4-3-2-1 grounding": "skill:grounding",
    "HALT check": "skill:movement", "Move your body": "skill:movement",
    "Handle a slip": "skill:called someone", "Reach out": "skill:called someone",
    "Name it to tame it": "Emotion Labeling", "Why cravings feel so strong": "Craving Neurobiology",
    "Reframe the thought": "Cognitive Reframing", "Spot the thinking traps": "Cognitive Reframing", "Decatastrophize": "Cognitive Reframing",
    "Muscle relaxation": "Body Awareness", "The ABC chain": "The Habit Loop",
    "Behavioral activation": "Dopamine and Reward", "Both sides: pros and cons": "Impulse Control"
  };
  function filterFor(title) { return titles(D.lessons).indexOf(title) >= 0 ? title : (PRACTICE_FOR[title] || null); }
  function scenariosFor(f) {
    if (!f) return SC.slice();
    if (f.indexOf("skill:") === 0) { var k = f.slice(6); return SC.filter(function (s) { return s.skills.indexOf(k) >= 0; }); }
    return SC.filter(function (s) { return s.topics.indexOf(f) >= 0; });
  }
  function filterLabel(f) { return f.indexOf("skill:") === 0 ? f.slice(6) : f; }
  function playHref(s, f) { return "#/practice/p/" + enc(s.id) + "/" + (f ? enc(f) : "-"); }
  function hubHref(f) { return f ? "#/practice/f/" + enc(f) : "#/practice"; }

  // Buttons shown at the bottom of a lesson or skill page.
  API.actions = function (parent, title) {
    var stack = el("div", { class: "stack", style: "margin-top:18px" }), n = 0, word = API.statusWord(title);
    if (API.hasQuiz(title)) {
      if (word) parent.appendChild(el("p", { class: "muted", style: "margin-top:18px", text: "Your progress here: " + word + "." }));
      stack.appendChild(el("a", { class: "btn block", href: "#/quiz/" + enc(title), text: "Test yourself (" + Q[title].length + " questions)" })); n++;
    }
    var f = filterFor(title);
    if (f && scenariosFor(f).length) {
      stack.appendChild(el("a", { class: "btn ghost block", href: hubHref(f), text: "Practice this (real-life scenarios)" })); n++;
    }
    if (n) parent.appendChild(stack);
  };

  function note() {
    return el("p", { class: "note", text: "This is education, not medical care. If you are in crisis, call or text 988 (US)." });
  }

  // ---------- quiz ----------
  function quiz(topic) {
    var qs = Q[topic], back = routeFor(topic) || "#/", idx = 0, score = 0;
    function show() {
      RC.shell(topic, back);
      if (idx >= qs.length) { done(); return; }
      var q = qs[idx], order = shuffle(q.o.map(function (_, i) { return i; })), btns = [], answered = false;
      RC.app.appendChild(el("p", { class: "step-count", text: "Question " + (idx + 1) + " of " + qs.length }));
      var qh = el("h2", { text: q.q, tabindex: "-1", id: "qq", style: "margin-top:4px" });
      RC.app.appendChild(qh);
      var stack = el("div", { class: "stack", role: "group", "aria-labelledby": "qq" });
      var after = el("div", { "aria-live": "polite" });
      order.forEach(function (orig) {
        var b = el("button", { type: "button", class: "row-link opt", text: q.o[orig], onclick: function () { choose(orig, b); } });
        btns.push({ b: b, orig: orig }); stack.appendChild(b);
      });
      RC.app.appendChild(stack); RC.app.appendChild(after);
      function choose(orig, chosen) {
        if (answered) return; answered = true;
        var right = orig === q.a; if (right) score++;
        btns.forEach(function (x) {
          x.b.disabled = true;
          if (x.orig === q.a) { x.b.classList.add("right"); x.b.textContent = "\u2713 " + x.b.textContent; }
        });
        if (!right) { chosen.classList.add("wrong"); chosen.textContent = "\u2717 " + chosen.textContent; }
        var fb = el("p", { class: "lines", style: "margin-top:16px", text: (right ? "Right. " : "Not quite. ") + q.w });
        after.appendChild(fb);
        var next = el("button", { class: "btn block", type: "button", text: idx + 1 < qs.length ? "Next question" : "See my result", onclick: function () { idx++; show(); } });
        after.appendChild(next); next.focus();
      }
      try { qh.focus({ preventScroll: true }); } catch (e) {}
    }
    function done() {
      var status = record(topic, score, qs.length), pass = score * 3 >= qs.length * 2, msg;
      if (!pass) msg = "Not there yet. Look back over the lesson and try again. Retrying is how it sticks, and nothing you've already earned is lost.";
      else if (status === "mastered") msg = "Mastered. You passed on two different days, so this one is locked in.";
      else msg = "Learned. Pass it again on a different day to master it.";
      RC.app.appendChild(el("div", { class: "big-num", text: score + " of " + qs.length, role: "status" }));
      RC.app.appendChild(el("p", { class: "step-text", text: msg }));
      RC.app.appendChild(el("div", { class: "stack" }, [
        el("button", { class: "btn block", type: "button", text: "Try again", onclick: function () { idx = 0; score = 0; show(); } }),
        el("a", { class: "btn ghost block", href: back, text: "Back to the lesson" })
      ]));
    }
    show();
  }

  // ---------- practice scenarios ----------
  function randomOther(list, not) {
    var l = list.filter(function (s) { return !not || s.id !== not.id; });
    if (!l.length) l = list;
    return l[Math.floor(Math.random() * l.length)];
  }

  function hub(f) {
    var list = scenariosFor(f);
    RC.shell(f ? "Practice: " + filterLabel(f) : "Practice", function () { if (f && history.length > 1) history.back(); else RC.go("#/"); });
    RC.app.appendChild(el("p", { class: "muted", text: "Real-life situations. Pick what you would actually do, then see how the science plays out." }));
    if (!list.length) { RC.app.appendChild(el("p", { text: "No scenarios loaded yet." })); return; }
    RC.app.appendChild(el("button", { class: "btn block", type: "button", text: "Surprise me", onclick: function () { RC.go(playHref(randomOther(list), f)); } }));
    var last = lastPractice(), stack = el("div", { class: "stack", style: "margin-top:12px" });
    list.forEach(function (s) {
      var r = last[s.id], mark = r === undefined ? "" : r === 2 ? "\u2713  " : r === 1 ? "~  " : "!  ";
      var lab = r === undefined ? s.title : s.title + (r === 2 ? ", strong choice last time" : r === 1 ? ", okay last time" : ", risky last time");
      stack.appendChild(el("a", { class: "row-link", href: playHref(s, f), text: mark + s.title, "aria-label": lab }));
    });
    RC.app.appendChild(stack);
    RC.app.appendChild(el("p", { class: "note", text: "\u2713 strong choice last time    ~ okay    ! risky" }));
  }

  function play(s, f) {
    RC.shell(s.title, hubHref(f));
    RC.app.appendChild(el("p", { class: "step-text", text: s.setup }));
    RC.app.appendChild(el("h2", { text: "What do you do?", style: "margin-top:4px" }));
    var order = shuffle([0, 1, 2]), btns = [], answered = false;
    var stack = el("div", { class: "stack" }), after = el("div", { "aria-live": "polite" });
    order.forEach(function (idx) {
      var b = el("button", { type: "button", class: "row-link opt", text: s.choices[idx], onclick: function () { choose(idx, b); } });
      btns.push({ b: b, idx: idx }); stack.appendChild(b);
    });
    RC.app.appendChild(stack); RC.app.appendChild(after);

    function choose(idx, chosen) {
      if (answered) return; answered = true;
      var rating = 2 - idx; logPractice(s.id, rating);
      btns.forEach(function (x) {
        x.b.disabled = true;
        if (x.idx === 0) { x.b.classList.add("right"); x.b.textContent = "\u2713 " + x.b.textContent; }
      });
      if (idx === 1) { chosen.classList.add("ok"); chosen.textContent = "~ " + chosen.textContent; }
      if (idx === 2) { chosen.classList.add("wrong"); chosen.textContent = "\u2717 " + chosen.textContent; }
      var head = rating === 2 ? "Strong choice. " : rating === 1 ? "Okay, but there's a stronger move. " : "Risky. ";
      var body = head + s.feedback[idx];
      if (idx !== 0) body += "\n\nThe strongest move: " + s.choices[0] + ".\n" + s.feedback[0];
      after.appendChild(el("p", { class: "lines", style: "margin-top:16px", text: body }));
      after.appendChild(el("p", { class: "muted", text: "Skills in play: " + s.skills.join(", ") }));
      var rel = (s.topics || []).filter(function (t) { return routeFor(t); });
      if (rel.length) {
        after.appendChild(el("h3", { text: "Related lessons" }));
        var rs = el("div", { class: "stack", style: "margin-top:8px" });
        rel.forEach(function (t) { rs.appendChild(el("a", { class: "row-link", href: routeFor(t), text: t })); });
        after.appendChild(rs);
      }
      var list = scenariosFor(f), row = el("div", { class: "stack", style: "margin-top:16px" });
      row.appendChild(el("button", { class: "btn block", type: "button", text: "Another scenario", onclick: function () {
        var o = randomOther(list, s); if (o.id === s.id) RC.go(hubHref(f)); else RC.go(playHref(o, f));
      } }));
      row.appendChild(el("a", { class: "btn ghost block", href: hubHref(f), text: "Back to the list" }));
      after.appendChild(row); after.appendChild(note());
    }
  }

  // ---------- Today's practice: pick what to do next from your own results ----------
  function pickToday() {
    var last = lastPractice(), prog = progress(), today = RC.todayISO(), sk = {}, weak = null, weakAvg = 99, cs = [];
    SC.forEach(function (s) {
      var r = last[s.id]; if (r === undefined) return;
      s.skills.forEach(function (k) { if (!sk[k]) sk[k] = [0, 0]; sk[k][0] += r; sk[k][1]++; });
    });
    Object.keys(sk).forEach(function (k) { var a = sk[k][0] / sk[k][1]; if (a < weakAvg) { weakAvg = a; weak = k; } });
    if (weakAvg >= 1.75) weak = null;
    SC.forEach(function (s) {
      var r = last[s.id], w, why;
      if (r === undefined) { w = 3; why = "A situation you haven't tried yet."; }
      else if (r === 0) { w = 5; why = "You picked the risky move last time. Try it again."; }
      else if (r === 1) { w = 3; why = "Last time was okay. Aim for the strongest move."; }
      else { w = 0.7; why = "A refresher on one you handled well."; }
      if (weak && s.skills.indexOf(weak) >= 0) { w += 2; why = "Builds a skill to strengthen: " + weak + "."; }
      cs.push({ kind: "scenario", key: s.id, label: s.title, w: w, why: why });
    });
    Object.keys(Q).forEach(function (t) {
      var p = prog[t], st = p ? p.status : "new";
      if (st === "new") cs.push({ kind: "quiz", key: t, label: t, w: 3.5, why: "Quiz time: " + t + " isn't passed yet." });
      else if (st === "learned") { if (!p || p.last !== today) cs.push({ kind: "quiz", key: t, label: t, w: 4.5, why: "Pass " + t + " again today to master it." }); }
      else cs.push({ kind: "quiz", key: t, label: t, w: 0.4, why: "Quick refresher on " + t + "." });
    });
    if (!cs.length) return null;
    var total = cs.reduce(function (s, c) { return s + c.w; }, 0), x = Math.random() * total, pick = cs[cs.length - 1], i;
    for (i = 0; i < cs.length; i++) { x -= cs[i].w; if (x <= 0) { pick = cs[i]; break; } }
    return pick;
  }

  function today() {
    RC.shell("Today's practice");
    var p = pickToday();
    if (!p) { RC.app.appendChild(el("p", { class: "muted", text: "Nothing to practice yet. The quiz and scenario content hasn't loaded." })); return; }
    RC.app.appendChild(el("p", { class: "muted", text: "Picked from your own results: things you haven't tried, risky choices to redo, and lessons waiting for a second pass." }));
    var href = p.kind === "quiz" ? "#/quiz/" + enc(p.key) : playHref(byId(p.key), null);
    RC.app.appendChild(el("div", { class: "card" }, [
      el("div", { class: "step-count", text: p.kind === "quiz" ? "Quiz" : "Scenario" }),
      el("h2", { text: p.label, style: "margin-top:0" }),
      el("p", { text: p.why }),
      el("a", { class: "btn block", href: href, text: "Start" }),
      el("button", { class: "btn ghost block", type: "button", style: "margin-top:10px", text: "Pick something else", onclick: today })
    ]));
    RC.app.appendChild(note());
  }

  // ---------- My progress ----------
  function sec(head, body) {
    RC.app.appendChild(el("h2", { text: head }));
    RC.app.appendChild(el("p", { class: "lines", text: body }));
  }
  function group(items) {
    var names = titles(items).filter(API.hasQuiz), m = [], l = [], n = [];
    names.forEach(function (t) { var s = API.status(t); (s === "mastered" ? m : s === "learned" ? l : n).push(t); });
    var out = m.length + " of " + names.length + " mastered";
    if (m.length) out += "\n\nMastered: " + m.join(", ");
    if (l.length) out += "\n\nLearned (pass again on another day to master): " + l.join(", ");
    if (n.length) out += "\n\nNot yet: " + n.join(", ");
    return out;
  }
  function progressScreen() {
    RC.shell("My progress");
    RC.app.appendChild(el("p", { class: "muted", text: "Everything here comes from what you've done in the app. It stays on this device." }));
    var cutoff = Date.now() - 7 * 86400000, days = {};
    attempts().forEach(function (a) { if (a.ts >= cutoff) days[RC.isoOf(new Date(a.ts))] = true; });
    practiceLog().forEach(function (p) { if (p.ts >= cutoff) days[RC.isoOf(new Date(p.ts))] = true; });
    var nd = Object.keys(days).length;
    sec("This week", nd ? "You did something here on " + nd + " of the last 7 days." : "Nothing yet this week. Today's practice takes about two minutes.");
    sec("Neuroscience class", group(D.lessons || []));
    sec("Coping skills", group(D.skills || []));

    var at = attempts(), passed = at.filter(function (a) { return a.s * 3 >= a.n * 2; }).length, wk = at.filter(function (a) { return a.ts >= cutoff; }).length;
    sec("Quizzes", at.length ? "Taken: " + at.length + "\nPassed (2 of 3 or better): " + passed + "\nLast 7 days: " + wk
      : "No quizzes taken yet. Open a lesson and tap Test yourself, or try Today's practice.");

    var last = lastPractice(), strong = 0, ok = 0, risky = 0, sk = {};
    SC.forEach(function (s) {
      var r = last[s.id]; if (r === undefined) return;
      if (r === 2) strong++; else if (r === 1) ok++; else risky++;
      s.skills.forEach(function (k) { if (!sk[k]) sk[k] = [0, 0]; sk[k][0] += r; sk[k][1]++; });
    });
    var tried = strong + ok + risky, pb = "Scenarios tried: " + tried + " of " + SC.length;
    if (tried) {
      pb += "\nLast time: " + strong + " strong, " + ok + " okay, " + risky + " risky\n\nBy skill (0 to 2, higher is better):";
      Object.keys(sk).sort().forEach(function (k) { pb += "\n" + k + ": " + (sk[k][0] / sk[k][1]).toFixed(1); });
    }
    sec("Practice", pb);

    var es = RC.journal.all(), tagged = es.filter(function (e) { return e.tags && e.tags.length; }).length;
    sec("Journal and check-ins", "Journal entries: " + es.length + " (" + tagged + " tagged)\nCheck-ins in the last 30 days: " + RC.checkins.since(29).length);
    RC.app.appendChild(el("div", { class: "stack", style: "margin-top:16px" }, [
      el("a", { class: "btn block", href: "#/today", text: "Today's practice" }),
      el("a", { class: "btn ghost block", href: "#/insights", text: "Pattern insights" })
    ]));
  }

  // ---------- routes ----------
  RC.screens["/practice"] = function () { hub(null); };
  RC.screens["/today"] = today;
  RC.screens["/progress"] = progressScreen;
  RC.dynamic = RC.dynamic || [];
  RC.dynamic.push(function (h) {
    var m, a, b, s;
    if ((m = h.match(/^\/quiz\/(.+)$/))) {
      a = dec(m[1]); if (!a || !API.hasQuiz(a)) return null;
      return function () { quiz(a); };
    }
    if ((m = h.match(/^\/practice\/f\/(.+)$/))) {
      a = dec(m[1]); if (!a) return null;
      return function () { hub(a); };
    }
    if ((m = h.match(/^\/practice\/p\/([^\/]+)\/(.+)$/))) {
      a = dec(m[1]); b = dec(m[2]); s = a && byId(a); if (!s) return null;
      return function () { play(s, b === "-" ? null : b); };
    }
    return null;
  });
})();
