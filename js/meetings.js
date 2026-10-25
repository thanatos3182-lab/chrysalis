/* Meetings: finder links plus your saved weekly meetings. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var LINKS = [
    ["Find an AA meeting", "https://www.aa.org/find-aa"],
    ["Online AA meetings", "https://aa-intergroup.org/meetings"],
    ["Find an NA meeting", "https://www.na.org/meetingsearch/"],
    ["SMART Recovery", "https://www.smartrecovery.org/"],
    ["SAMHSA treatment locator", "https://findtreatment.gov/"]
  ];
  function ext(label, href) { return el("a", { class: "row-link", href: href, target: "_blank", rel: "noopener noreferrer", text: label }); }

  function nextOccurrence(day, hhmm) {
    var min = RC.timeToMin(hhmm), d = new Date();
    d.setHours(Math.floor(min / 60), min % 60, 0, 0);
    d.setDate(d.getDate() + ((day - d.getDay() + 7) % 7));
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 7);
    return d;
  }

  function meetings() {
    RC.shell("Meetings");
    RC.app.appendChild(el("p", { class: "muted", text: "Meetings help most when they become a routine. Find one, then save it here so it's one tap from your calendar." }));
    RC.app.appendChild(el("h2", { text: "Find a meeting" }));
    RC.app.appendChild(el("div", { class: "stack" }, LINKS.map(function (l) { return ext(l[0], l[1]); })));

    RC.app.appendChild(el("h2", { text: "My meetings" }));
    var list = RC.store.get("meetings", []);
    if (!list.length) RC.app.appendChild(el("p", { class: "muted", text: "No saved meetings yet." }));
    list.sort(function (a, b) { return a.day - b.day || RC.timeToMin(a.time) - RC.timeToMin(b.time); });
    list.forEach(function (m) {
      var isLink = /^https?:\/\//i.test(m.place || "");
      RC.app.appendChild(el("div", { class: "card" }, [
        el("div", { style: "font-weight:700", text: DAYS[m.day] + " " + RC.fmtTime(RC.timeToMin(m.time)) }),
        el("div", { text: m.name }),
        m.place ? el("div", { class: "muted", text: m.place }) : null,
        el("div", { class: "row" }, [
          el("button", { class: "btn ghost", text: "Add to calendar", onclick: function () {
            RC.icsFile({ title: m.name, place: m.place, start: nextOccurrence(m.day, m.time), minutes: 60, weeklyDay: m.day, alarmMinutes: 30 });
          } }),
          isLink ? el("a", { class: "btn ghost", href: m.place, target: "_blank", rel: "noopener noreferrer", text: "Open link" }) : null,
          el("button", { class: "btn danger", text: "Delete", onclick: function () {
            if (!confirm("Delete " + m.name + "?")) return;
            var l = RC.store.get("meetings", []).filter(function (x) { return x.id !== m.id; });
            RC.store.set("meetings", l); meetings();
          } })
        ])
      ]));
    });

    var name = el("input", { type: "text", id: "mn", placeholder: "e.g. Tuesday night group", autocomplete: "off" });
    var place = el("input", { type: "text", id: "mp", placeholder: "Address or link", autocomplete: "off" });
    var day = el("select", { id: "md" }, DAYS.map(function (d, i) { return el("option", { value: String(i), text: d }); }));
    var time = el("input", { type: "time", id: "mt", value: "19:00" });
    RC.app.appendChild(el("div", { class: "card" }, [
      el("h3", { text: "Add a regular meeting", style: "margin-top:0" }),
      RC.field("mn", "Meeting name", name), RC.field("mp", "Address or link (optional)", place),
      RC.field("md", "Day", day), RC.field("mt", "Time", time),
      el("button", { class: "btn", text: "Save meeting", onclick: function () {
        var l = RC.store.get("meetings", []);
        l.push({ id: RC.uid(), name: name.value.trim() || "Meeting", place: place.value.trim(), day: +day.value, time: time.value || "19:00" });
        if (RC.store.set("meetings", l)) { RC.toast("Saved."); meetings(); }
      } })
    ]));
  }
  RC.screens["/meetings"] = meetings;
})();
