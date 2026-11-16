/* Home: day count, grouped menu, journal. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;

  function section(title, items) {
    RC.app.appendChild(el("h2", { text: title }));
    var grid = el("div", { class: "grid" });
    items.forEach(function (i) {
      var kids = [document.createTextNode(i.label)];
      if (i.sub) kids.push(el("small", { text: i.sub }));
      grid.appendChild(el("a", { class: "tile" + (i.cls ? " " + i.cls : ""), href: i.href }, kids));
    });
    RC.app.appendChild(grid);
  }

  function setDate() {
    var start = RC.store.get("sober", null);
    var input = el("input", { type: "date", id: "d", max: RC.todayISO(), value: start || "" });
    var overlay = el("div", { class: "overlay" });
    var box = el("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": "Set start date" }, [
      el("h2", { text: "Set start date" }),
      el("label", { for: "d", text: "Day your count begins" }), input,
      el("div", { class: "row" }, [
        el("button", { class: "btn", text: "Save date", onclick: function () {
          if (!input.value) { RC.toast("Choose a date first."); return; }
          if (input.value > RC.todayISO()) { RC.toast("That date is in the future."); return; }
          if (RC.store.set("sober", input.value)) { overlay.remove(); home(); }
        } }),
        el("button", { class: "btn ghost", text: "Cancel", onclick: function () { overlay.remove(); } })
      ])
    ]);
    overlay.appendChild(box); document.body.appendChild(overlay); input.focus();
  }

  var filterTag = "";   // journal filter, kept while the app is open

  // A group of toggle buttons. `picked` is the shared list of chosen tags.
  function chipGroup(label, opts, picked) {
    var set = el("fieldset", { class: "tagset" }, [el("legend", { text: label })]);
    opts.forEach(function (o) {
      var b = el("button", { type: "button", class: "chip", "aria-pressed": "false", text: o, onclick: function () {
        var i = picked.indexOf(o);
        if (i >= 0) { picked.splice(i, 1); b.setAttribute("aria-pressed", "false"); }
        else { picked.push(o); b.setAttribute("aria-pressed", "true"); }
      } });
      set.appendChild(b);
    });
    return set;
  }

  function home() {
    RC.clear();
    var head = el("div", { class: "head" });
    head.appendChild(RC.logo());
    head.appendChild(el("h1", { text: "Chrysalis", tabindex: "-1" }));
    head.appendChild(el("p", { class: "tag", text: "One day at a time." }));
    RC.app.appendChild(head);

    var start = RC.store.get("sober", null);
    var days = el("div", { class: "days" });
    if (start) {
      var n = RC.daysSince(start);
      days.appendChild(el("div", { class: "n", text: String(n) }));
      days.appendChild(el("div", { class: "l", text: n === 1 ? "day" : "days" }));
    } else {
      days.appendChild(el("p", { class: "muted", text: "Set your start date to begin counting." }));
    }
    RC.app.appendChild(days);

    section("Right now", [
      { label: "Craving SOS", href: "#/sos", cls: "sos", sub: "Ride it out together" },
      { label: "My Plan", href: "#/plan" },
      { label: "Support contacts", href: "#/contacts" },
      { label: "Crisis: 988", href: "tel:988", sub: "Call or text, 24/7" }
    ]);
    section("Daily", [
      { label: "Daily check-in", href: "#/checkin", sub: "Mood, sleep, urge" },
      { label: "Pattern insights", href: "#/insights" },
      { label: "Daily structure", href: "#/routine", sub: "Plan your day" },
      { label: "Appointments", href: "#/appts" },
      { label: "Milestones and savings", href: "#/milestones" }
    ]);
    section("Next steps", [
      { label: "Basics", href: "#/basics", sub: "ID, benefits, bank: step by step" },
      { label: "Meetings", href: "#/meetings" },
      { label: "Find a sponsor", href: "#/sponsor" },
      { label: "Local jobs", href: "#/jobs", sub: "Search + track applications" },
      { label: "Housing", href: "#/housing", sub: "Sober living + apartments" }
    ]);
    section("Learn", [
      { label: "Today's practice", href: "#/today", sub: "Picked from your results" },
      { label: "My progress", href: "#/progress" },
      { label: "Coping skills", href: "#/skills" },
      { label: "Neuroscience class", href: "#/brain" },
      { label: "Practice scenarios", href: "#/practice" }
    ]);

    RC.app.appendChild(el("h2", { text: "Journal" }));
    var ta = el("textarea", { id: "t", placeholder: "How are you doing today?", "aria-label": "New journal entry" });
    var picked = [];
    RC.app.appendChild(el("div", { class: "card", style: "margin-top:0" }, [
      ta,
      chipGroup("Mood (optional)", RC.TAGS.moods, picked),
      chipGroup("Trigger (optional)", RC.TAGS.triggers, picked),
      chipGroup("Skill I used (optional)", RC.TAGS.skills, picked),
      el("div", { class: "row" }, [
        el("button", { class: "btn", text: "Save entry", onclick: function () {
          var text = ta.value.trim();
          if (!text) { RC.toast("Write something first."); return; }
          if (RC.journal.add(text, picked.slice())) { RC.toast("Saved."); home(); }
        } }),
        el("button", { class: "btn ghost", text: start ? "Change start date" : "Set start date", onclick: setDate })
      ])
    ]));

    var list = RC.journal.all();
    if (list.length) {
      var sel = el("select", { id: "ftag", onchange: function () { filterTag = sel.value; home(); } });
      sel.appendChild(el("option", { value: "", text: "All entries" }));
      RC.TAGS.moods.concat(RC.TAGS.triggers, RC.TAGS.skills).forEach(function (t) {
        sel.appendChild(el("option", { value: t, text: t, selected: t === filterTag }));
      });
      RC.app.appendChild(el("div", { class: "field", style: "margin-top:14px" }, [el("label", { for: "ftag", text: "Show entries tagged" }), sel]));
      var shown = filterTag ? list.filter(function (e) { return (e.tags || []).indexOf(filterTag) >= 0; }) : list;
      if (!shown.length) RC.app.appendChild(el("p", { class: "muted", text: "No entries with that tag yet." }));
      list = shown;
    }
    if (list.length) {
      var card = el("div", { class: "card" });
      list.forEach(function (e) {
        card.appendChild(el("div", { class: "entry" }, [
          el("time", { text: RC.fmtDateTime(e.ts) }),
          (e.tags && e.tags.length) ? el("div", { class: "tags", text: e.tags.join(", ") }) : null,
          el("div", { class: "t", text: e.text }),
          el("button", { class: "link", text: "Delete", onclick: function () {
            if (!confirm("Delete this entry? This can't be undone.")) return;
            RC.journal.remove(e.id); home();
          } })
        ]));
      });
      RC.app.appendChild(card);
    }

    RC.app.appendChild(RC.dailyLetter());
    section("Your data", [
      { label: "Backup and restore", href: "#/backup", sub: "Keep a copy of your entries" },
      { label: "Counselor summary", href: "#/export", sub: "Share what you choose" }
    ]);
    RC.app.appendChild(el("p", { class: "note", text: "Everything you write stays on this device. Nothing is sent anywhere." }));
  }

  RC.screens[""] = RC.screens["/"] = home;
})();
