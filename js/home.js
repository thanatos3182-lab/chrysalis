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

  function home() {
    RC.clear();
    var head = el("div", { class: "head" });
    head.appendChild(RC.logo());
    head.appendChild(el("h1", { text: "Chrysalis" }));
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
    section("Next steps", [
      { label: "Local jobs", href: "#/jobs", sub: "Search + track applications" },
      { label: "Housing", href: "#/housing", sub: "Sober living + apartments" }
    ]);
    section("Learn", [
      { label: "Coping skills", href: "#/skills" },
      { label: "Neuroscience class", href: "#/brain" }
    ]);

    RC.app.appendChild(el("h2", { text: "Journal" }));
    var ta = el("textarea", { id: "t", placeholder: "How are you doing today?", "aria-label": "New journal entry" });
    RC.app.appendChild(el("div", { class: "card", style: "margin-top:0" }, [
      ta,
      el("div", { class: "row" }, [
        el("button", { class: "btn", text: "Save entry", onclick: function () {
          var text = ta.value.trim();
          if (!text) { RC.toast("Write something first."); return; }
          if (RC.journal.add(text)) { RC.toast("Saved."); home(); }
        } }),
        el("button", { class: "btn ghost", text: start ? "Change start date" : "Set start date", onclick: setDate })
      ])
    ]));

    var list = RC.journal.all();
    if (list.length) {
      var card = el("div", { class: "card" });
      list.forEach(function (e) {
        card.appendChild(el("div", { class: "entry" }, [
          el("time", { text: RC.fmtDateTime(e.ts) }),
          el("div", { class: "t", text: e.text }),
          el("button", { class: "link", text: "Delete", onclick: function () {
            if (!confirm("Delete this entry? This can't be undone.")) return;
            RC.journal.remove(e.id); home();
          } })
        ]));
      });
      RC.app.appendChild(card);
    }

    section("Your data", [{ label: "Backup and restore", href: "#/backup", sub: "Keep a copy of your entries" }]);
    RC.app.appendChild(el("p", { class: "note", text: "Everything you write stays on this device. Nothing is sent anywhere." }));
  }

  RC.screens[""] = RC.screens["/"] = home;
})();
