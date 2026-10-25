/* Local jobs: search links by ZIP plus an application tracker. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var q = encodeURIComponent;

  RC.screens["/jobs"] = function () {
    RC.shell("Local jobs");
    RC.app.appendChild(el("p", { class: "muted", text: "Enter your ZIP (or City, ST) once, then tap a site to see openings near you. Saved on this device only." }));
    var loc = RC.locationBox({ key: "jobwhat", fallback: "part time", label: "What kind of work?", placeholder: "part time, warehouse, cashier..." });
    RC.linkList("Search", [
      { label: "Indeed (newest first)", needsLocation: true, url: function () { return "https://www.indeed.com/jobs?q=" + q(loc.what()) + "&l=" + q(loc.zip()) + "&sort=date"; } },
      { label: "Google Jobs", needsLocation: true, url: function () { return "https://www.google.com/search?q=" + q(loc.what() + " jobs near " + loc.zip()) + "&ibp=htl;jobs"; } },
      { label: "LinkedIn (part-time)", needsLocation: true, url: function () { return "https://www.linkedin.com/jobs/search/?keywords=" + q(loc.what()) + "&location=" + q(loc.zip()) + "&f_JT=P"; } },
      { label: "Snagajob (hourly work)", url: "https://www.snagajob.com/" },
      { label: "CareerOneStop (free job help + local job centers)", url: "https://www.careeronestop.org/" }
    ], loc);
    RC.tracker({
      key: "jobapps", heading: "Applications", addTitle: "Add an application", titleField: "company", titleLabel: "company",
      statuses: ["Applied", "Interviewing", "Offer", "Not selected", "Withdrew"], doneStatuses: [2, 3, 4],
      fields: [
        { id: "company", label: "Company", placeholder: "FedEx" },
        { id: "role", label: "Role (optional)", placeholder: "Package handler" },
        { id: "notes", label: "Notes (optional)", multiline: true, placeholder: "Who you talked to, next steps" }
      ],
      subtitle: function (x) { return x.role || ""; }
    }, RC.screens["/jobs"]);
  };
})();
