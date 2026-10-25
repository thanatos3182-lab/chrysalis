/* Housing: sober living and apartment search links plus a saved-places tracker. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var q = encodeURIComponent;

  RC.screens["/housing"] = function () {
    RC.shell("Housing");
    RC.app.appendChild(el("p", { class: "muted", text: "Enter your ZIP (or City, ST) once, then tap a site. Saved on this device only." }));
    var loc = RC.locationBox();
    RC.linkList("Sober living / recovery housing", [
      { label: "Sober living near me (Google)", needsLocation: true, url: function () { return "https://www.google.com/search?q=" + q("sober living homes near " + loc.zip()); } },
      { label: "Oxford House (affordable, peer-run)", url: "https://www.oxfordhouse.org/" },
      { label: "NARR (certified recovery residences)", url: "https://narronline.org/" },
      { label: "SAMHSA treatment and housing finder", url: "https://findtreatment.gov/" }
    ], loc);
    RC.linkList("Apartments and rooms", [
      { label: "Zillow rentals", needsLocation: true, url: function () { return "https://www.zillow.com/homes/for_rent/" + RC.place.slug(loc.zip()) + "_rb/"; } },
      { label: "Apartments.com", needsLocation: true, url: function () { return "https://www.apartments.com/" + RC.place.slug(loc.zip()) + "/"; } },
      { label: "Rooms for rent (Google)", needsLocation: true, url: function () { return "https://www.google.com/search?q=" + q("rooms for rent near " + loc.zip()); } }
    ], loc);
    RC.linkList("Help paying / finding a place", [
      { label: "211 (local housing help)", url: "https://www.211.org/" },
      { label: "HUD (find housing assistance)", url: "https://www.hud.gov/findshelter" }
    ], loc);
    RC.tracker({
      key: "places", heading: "Saved places", addTitle: "Add a place", titleField: "name", titleLabel: "name",
      kinds: ["Sober living", "Apartment", "Room for rent", "Other"],
      statuses: ["To contact", "Contacted", "Toured", "Applied", "Approved", "Not a fit"], doneStatuses: [4, 5],
      fields: [
        { id: "name", label: "Name", placeholder: "Oxford House, Main St" },
        { id: "phone", label: "Phone (optional)", type: "tel" },
        { id: "cost", label: "Cost (optional)", placeholder: "$150/week" },
        { id: "notes", label: "Notes (optional)", multiline: true, placeholder: "Requirements, waitlist, who you talked to" }
      ],
      subtitle: function (x) { return [x.kind, x.cost, x.phone].filter(Boolean).join(" | "); }
    }, RC.screens["/housing"]);
  };
})();
