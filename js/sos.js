/* Craving SOS: rate, name the feeling, pick a skill, walk steps, 10-minute wait, re-rate. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el, C = window.RC_DATA.coach;

  var CRISIS = ["kill myself", "suicid", "end my life", "want to die", "wanna die", "don't want to be here", "hurt myself", "self harm", "self-harm", "overdose", "took too much", "better off dead"];
  var SLIP = ["relapse", "slipped", "used again", "already used", "already drank", "drank again", "gave in", "i caved"];
  var FEEL = [
    ["Stressed", ["stress", "overwhelm", "pressure"]],
    ["Anxious", ["anxi", "nervous", "panic", "worried", "worry", "scared"]],
    ["Angry", ["angry", "anger", "mad ", "furious", "pissed", "rage", "frustrat"]],
    ["Lonely", ["lonely", "alone", "isolat"]],
    ["Bored", ["bored", "boring", "nothing to do"]],
    ["Ashamed", ["asham", "guilt", "shame", "failure", "embarrass"]],
    ["Sad", ["sad", "depress", "empty", "hopeless", "feel down", "feeling down", "cry"]],
    ["Tired", ["tired", "exhaust", "sleep", "drained"]],
    ["Triggered", ["trigger", "party", "old friends", "smell", "drove past", "walked past"]]
  ];
  function norm(s) { return s.toLowerCase().replace(/\u2019/g, "'"); }
  function hasAny(t, words) { return words.some(function (w) { return t.indexOf(w) !== -1; }); }
  function matchFeeling(text) {
    var t = norm(text);
    for (var i = 0; i < FEEL.length; i++) if (hasAny(t, FEEL[i][1])) return FEEL[i][0];
    return null;
  }

  function sos() {
    var s = { urgeStart: 0, urgeEnd: 0, feeling: "Other", skill: "", note: "", slip: false };
    var content;
    var timer = null;

    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    RC.onLeave(stopTimer);

    RC.shell("Craving SOS");
    content = el("div");
    RC.app.appendChild(content);

    function reset() { stopTimer(); RC.clear(content); }
    function say(text, cls) { content.appendChild(el("p", { class: cls || "", text: text })); }
    function btn(label, fn, kind) { var b = el("button", { class: "btn block " + (kind || "ghost"), text: label, onclick: fn }); b.style.marginBottom = "8px"; content.appendChild(b); return b; }
    function link(label, href) { var a = el("a", { class: "btn block ghost", href: href, text: label }); a.style.marginBottom = "8px"; content.appendChild(a); }

    function rate(prompt, done) {
      reset();
      say(prompt, "lines");
      var val = el("div", { class: "big-num", text: "5", "aria-live": "polite" });
      var bar = el("input", { type: "range", min: "0", max: "10", value: "5", "aria-label": "Urge strength from 0 to 10" });
      bar.addEventListener("input", function () { val.textContent = bar.value; });
      content.appendChild(val); content.appendChild(bar);
      content.appendChild(el("p", { class: "muted", text: "0 is none. 10 is the strongest you've felt." }));
      btn("Continue", function () { done(parseInt(bar.value, 10)); }, "");
    }

    function peekPlan(urge, next) {
      var plan = RC.store.get("plan", {});
      var reasons = (plan.reasons || "").trim(), go = (plan.gotoPlan || "").trim();
      if (urge < 7 || (!reasons && !go)) { next(); return; }
      var parts = [];
      if (reasons) parts.push("MY REASONS\n" + reasons);
      if (go) parts.push("MY PLAN WHEN IT HITS\n" + go);
      RC.modal("Remember why you're doing this", parts.join("\n\n"), [{ label: "Continue", onClick: next }]);
    }

    function crisisModal() {
      RC.modal("Please talk to a person now",
        "It sounds like you may be in serious distress. You matter, and help is free and available right now.\n\n" +
        "Call or text 988 (Suicide & Crisis Lifeline, 24/7).\n\n" +
        "If you may have taken too much of something, call 911 or Poison Control at 1-800-222-1222 right away.\n\n" +
        "If you are in immediate danger, call 911.",
        [{ label: "Call 988", href: "tel:988" }, { label: "Close", kind: "ghost" }]);
    }

    function feelingStep() {
      reset();
      say("What's going on right now?", "step-text");
      var grid = el("div", { class: "grid" });
      C.feelings.forEach(function (f) {
        grid.appendChild(el("button", { class: "tile", text: f, onclick: function () { s.feeling = f; replyStep(); } }));
      });
      content.appendChild(grid);
      var ta = el("textarea", { id: "n", placeholder: "Type here (stays on your device)", "aria-label": "Describe what's going on" });
      content.appendChild(el("div", { class: "card" }, [
        el("label", { for: "n", text: "Or say it in your own words" }), ta,
        el("div", { class: "row" }, [el("button", { class: "btn", text: "Continue", onclick: function () {
          var t = ta.value.trim(); if (!t) return;
          if (hasAny(norm(t), CRISIS)) { crisisModal(); return; }
          s.note = t;
          var m = matchFeeling(t); if (m) s.feeling = m;
          s.slip = hasAny(norm(t), SLIP);
          replyStep();
        } })])
      ]));
    }

    function replyStep() {
      reset();
      say(C.reply[s.feeling] || C.reply.Other, "step-text");
      if (s.slip) {
        say(C.slip);
        link("Call SAMHSA helpline (free, 24/7)", "tel:18006624357");
      }
      say("Pick one to try right now:", "step-text");
      (C.skillsFor[s.feeling] || C.skillsFor.Other).forEach(function (k) { btn(k, function () { startSkill(k); }); });
      btn("Show all skills", allSkills);
    }

    function allSkills() {
      reset(); say("Pick a skill", "step-text");
      C.allSkills.forEach(function (k) { btn(k, function () { startSkill(k); }); });
    }

    function startSkill(k) { s.skill = k; walk(0); }

    function contactButtons() {
      var list = RC.store.get("contacts", []);
      if (!list.length) { say("No contacts saved yet. Add some under Support contacts.", "muted"); return; }
      list.forEach(function (c) {
        var row = el("div", { class: "row", style: "margin:0 0 8px" }, [
          el("a", { class: "btn ghost", href: "tel:" + RC.cleanNumber(c.number), text: "Call " + c.name }),
          el("a", { class: "btn ghost", href: RC.smsHref(c.number, "Rough moment. Can you talk or stay on text for a bit?"), text: "Text " + c.name })
        ]);
        content.appendChild(row);
      });
    }

    function walk(i) {
      var steps = C.steps[s.skill] || ["Take one slow breath. You're doing something good for yourself."];
      reset();
      content.appendChild(el("h2", { text: s.skill, style: "margin-top:8px" }));
      say("Step " + (i + 1) + " of " + steps.length, "step-count");
      say(steps[i], "step-text");
      if (s.skill === "Reach out" && i === 1) contactButtons();
      var last = i === steps.length - 1;
      btn(last ? "Done. Start the 10-minute wait" : "Next", function () { if (last) timerStep(); else walk(i + 1); }, "");
      if (i > 0) btn("Back", function () { walk(i - 1); });
    }

    function timerStep() {
      reset();
      content.appendChild(el("h2", { text: "Ride the wave", style: "margin-top:8px" }));
      say("Give it 10 minutes. Urges usually rise, peak, and fade on their own. You don't have to do anything but wait. Put the phone down if you can, or keep breathing slowly.");
      var clock = el("div", { class: "clock", role: "timer", text: "10:00" });
      content.appendChild(clock);
      btn("Try another skill", allSkills);
      btn("I'm ready to check in", reRate, "");
      var end = Date.now() + 10 * 60 * 1000;
      timer = setInterval(function () {
        var left = Math.max(0, Math.round((end - Date.now()) / 1000));
        clock.textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
        if (left <= 0) { stopTimer(); reRate(); }
      }, 500);
    }

    function reRate() { rate("Check in. How strong is the urge now?", function (v) { s.urgeEnd = v; result(); }); }

    function result() {
      reset();
      var entry = "Craving SOS: urge " + s.urgeStart + " to " + s.urgeEnd + " (" + s.feeling + "), skill: " + s.skill;
      if (s.note) entry += ". Note: " + s.note;
      RC.journal.add(entry);
      content.appendChild(el("div", { class: "big-num", text: s.urgeStart + " \u2192 " + s.urgeEnd, style: "font-size:48px" }));
      if (s.urgeEnd < s.urgeStart || s.urgeEnd <= 2) {
        say("It dropped. You just showed yourself that cravings pass, and every time you ride one out, the pattern gets weaker. That counts.", "step-text");
      } else {
        say("It's still strong, and that's okay. That doesn't mean you failed or that the skill didn't work. Some waves take longer. You have options:", "step-text");
        btn("Try another skill", function () { s.urgeStart = s.urgeEnd; allSkills(); });
        btn("Reach out to someone", function () { s.urgeStart = s.urgeEnd; startSkill("Reach out"); });
        link("Call or text 988", "tel:988");
        link("SAMHSA helpline (free, 24/7)", "tel:18006624357");
      }
      btn("Done", function () { RC.go("#/"); }, "");
    }

    rate("You reached out, and that's already a win. Let's ride this out together.\n\nHow strong is the urge right now?",
      function (v) { s.urgeStart = v; peekPlan(v, feelingStep); });
  }

  RC.screens["/sos"] = sos;
})();
