/* My Plan: four free-text fields, saved on the device. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var FIELDS = [
    ["reasons", "My reasons for recovery", "Why I'm doing this: the people, goals, and life I want..."],
    ["triggers", "My triggers", "People, places, feelings, and times of day that set off cravings..."],
    ["warnings", "My early warning signs", "What I notice in my thoughts, mood, or behavior before a craving or slip..."],
    ["gotoPlan", "When it hits, I will...", "My first 3 moves, and who I'll call..."]
  ];
  function plan() {
    RC.shell("My Plan");
    RC.app.appendChild(el("p", { class: "muted", text: "Write this when you're calm. It shows up in Craving SOS when an urge is strong." }));
    var saved = RC.store.get("plan", {});
    var boxes = {};
    FIELDS.forEach(function (f) {
      var id = "f-" + f[0];
      var ta = el("textarea", { id: id, placeholder: f[2] });
      ta.value = saved[f[0]] || "";
      boxes[f[0]] = ta;
      RC.app.appendChild(el("div", { class: "field" }, [el("label", { for: id, text: f[1] }), ta]));
    });
    function save(quiet) {
      var out = {};
      FIELDS.forEach(function (f) { out[f[0]] = boxes[f[0]].value.trim(); });
      if (RC.store.set("plan", out) && !quiet) RC.toast("Saved.");
    }
    RC.onLeave(function () { save(true); });
    RC.app.appendChild(el("button", { class: "btn block", text: "Save", onclick: function () { save(false); } }));
  }
  RC.screens["/plan"] = plan;
})();
