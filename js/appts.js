/* Appointments. Browsers can't schedule alerts, so "Add to calendar" brings a reminder with it. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  function fmt(when) { return new Date(when).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); }
  RC.appts = {
    all: function () { return RC.store.get("appts", []).sort(function (a, b) { return a.when < b.when ? -1 : 1; }); },
    upcoming: function () { var now = RC.isoOf(new Date()) + "T00:00"; return RC.appts.all().filter(function (a) { return a.when >= now; }); },
    fmt: fmt
  };

  function appts() {
    RC.shell("Appointments");
    RC.app.appendChild(el("p", { class: "muted", text: "Keep track of counselor, doctor, and court dates. Tap Add to calendar to get a reminder from your phone's calendar." }));
    var now = RC.isoOf(new Date()) + "T00:00", all = RC.appts.all();
    var up = all.filter(function (a) { return a.when >= now; }), past = all.filter(function (a) { return a.when < now; }).reverse().slice(0, 5);

    function row(a) {
      return el("div", { class: "card" }, [
        el("div", { style: "font-weight:700", text: a.title }), el("div", { class: "muted", text: fmt(a.when) }),
        a.place ? el("div", { class: "muted", text: a.place }) : null,
        el("div", { class: "row" }, [
          el("button", { class: "btn ghost", text: "Add to calendar", onclick: function () {
            RC.icsFile({ title: a.title, place: a.place, start: new Date(a.when), minutes: 60, alarmMinutes: 60 });
          } }),
          el("button", { class: "btn danger", text: "Delete", onclick: function () {
            if (!confirm("Delete \"" + a.title + "\"?")) return;
            RC.store.set("appts", RC.store.get("appts", []).filter(function (x) { return x.id !== a.id; })); appts();
          } })
        ])
      ]);
    }
    RC.app.appendChild(el("h2", { text: "Upcoming" }));
    if (!up.length) RC.app.appendChild(el("p", { class: "muted", text: "Nothing scheduled." }));
    up.forEach(function (a) { RC.app.appendChild(row(a)); });

    var title = el("input", { type: "text", id: "at", placeholder: "e.g. Counselor", autocomplete: "off" });
    var when = el("input", { type: "datetime-local", id: "aw" });
    var place = el("input", { type: "text", id: "ap", placeholder: "Address or phone (optional)", autocomplete: "off" });
    RC.app.appendChild(el("div", { class: "card" }, [
      el("h3", { text: "Add an appointment", style: "margin-top:0" }),
      RC.field("at", "What is it?", title), RC.field("aw", "Date and time", when), RC.field("ap", "Where (optional)", place),
      el("button", { class: "btn", text: "Save", onclick: function () {
        if (!title.value.trim() || !when.value) { RC.toast("Add a name, date, and time."); return; }
        var l = RC.store.get("appts", []); l.push({ id: RC.uid(), title: title.value.trim(), when: when.value, place: place.value.trim() });
        if (RC.store.set("appts", l)) { RC.toast("Saved."); appts(); }
      } })
    ]));
    if (past.length) {
      RC.app.appendChild(el("h2", { text: "Recent past" }));
      past.forEach(function (a) { RC.app.appendChild(row(a)); });
    }
  }
  RC.screens["/appts"] = appts;
})();
