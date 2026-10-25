/* Find a sponsor: how it works and where to meet people. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var LINKS = [
    ["AA online meetings (Online Intergroup)", "https://aa-intergroup.org/"],
    ["NA meeting search", "https://www.na.org/meetingsearch/"],
    ["SMART Recovery community", "https://www.smartrecovery.org/community/"],
    ["In The Rooms (free online recovery community)", "https://www.intherooms.com/"],
    ["Sober Grid (peer support app)", "https://www.sobergrid.com/"],
    ["Celebrate Recovery (faith-based)", "https://www.celebraterecovery.com/"]
  ];
  RC.screens["/sponsor"] = function () {
    RC.shell("Find a sponsor");
    RC.app.appendChild(el("h2", { text: "How it works" }));
    RC.app.appendChild(el("p", { text: "A sponsor is someone further along in recovery who walks you through it. You don't have to find the perfect one. Most people start with a temporary sponsor and switch if it isn't a fit." }));
    RC.app.appendChild(el("ol", { class: "plain" }, [
      "Go to several different meetings. Online ones count.",
      "Notice who you relate to when they share.",
      "Ask them after the meeting, or ask the group for a temporary sponsor.",
      "Swap numbers and try a few calls before deciding."
    ].map(function (t) { return el("li", { text: t }); })));
    RC.app.appendChild(el("h2", { text: "Good things to ask" }));
    RC.app.appendChild(el("ul", { class: "plain" }, [
      "How long have you been in recovery?",
      "Have you worked the steps (or your program's approach)?",
      "How often are you open to talking?",
      "What do you expect from the people you sponsor?"
    ].map(function (t) { return el("li", { text: t }); })));
    RC.app.appendChild(el("h2", { text: "Find people" }));
    RC.app.appendChild(el("div", { class: "stack" }, LINKS.map(function (l) {
      return el("a", { class: "row-link", href: l[1], target: "_blank", rel: "noopener noreferrer", text: l[0] });
    })));
    RC.app.appendChild(el("a", { class: "btn block", href: "#/contacts", text: "Save their number in Support contacts", style: "margin-top:16px" }));
  };
})();
