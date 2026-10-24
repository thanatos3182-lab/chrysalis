/* Coping skills and the neuroscience class. Content lives in data/content.js. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el, D = window.RC_DATA;

  // Turn plain lesson text into headings + paragraphs.
  function renderBody(text) {
    var box = el("div", { class: "lesson" });
    text.split("\n\n").forEach(function (block) {
      var lines = block.split("\n");
      var first = lines[0];
      if (first === first.toUpperCase() && /[A-Z]/.test(first) && first.length < 50 && !/^\d/.test(first)) {
        var h = first.charAt(0) + first.slice(1).toLowerCase();
        box.appendChild(el("h3", { text: h }));
        if (lines.length > 1) box.appendChild(el("p", { class: "lines", text: lines.slice(1).join("\n") }));
      } else {
        box.appendChild(el("p", { class: "lines", text: block }));
      }
    });
    return box;
  }

  function list(title, intro, items, prefix, back, extra) {
    RC.shell(title, back);
    RC.app.appendChild(el("p", { class: "muted", text: intro }));
    var stack = el("div", { class: "stack" });
    items.forEach(function (it, i) {
      stack.appendChild(el("a", { class: "row-link", href: "#/" + prefix + "/" + i, text: it.title }));
    });
    RC.app.appendChild(stack);
    if (extra) extra();
  }

  function detail(item, back, searchable) {
    RC.shell(item.title, back);
    RC.app.appendChild(renderBody(item.body));
    if (searchable) {
      var q = encodeURIComponent(item.title + " addiction");
      RC.app.appendChild(el("h3", { text: "Read the research" }));
      RC.app.appendChild(el("div", { class: "stack", style: "margin-top:10px" }, [
        el("a", { class: "row-link", target: "_blank", rel: "noopener", href: "https://pubmed.ncbi.nlm.nih.gov/?term=" + q + "&filter=simsearch2.ffrft", text: "Search PubMed (free full text)" }),
        el("a", { class: "row-link", target: "_blank", rel: "noopener", href: "https://scholar.google.com/scholar?q=" + q, text: "Search Google Scholar" })
      ]));
    }
    RC.app.appendChild(el("p", { class: "note", text: "This is education, not medical care. If you are in crisis, call or text 988 (US)." }));
  }

  var LINKS = [
    ["NIDA: The Science of Addiction", "https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction"],
    ["NIAAA: alcohol and the brain", "https://www.niaaa.nih.gov/"],
    ["NIMH: mental health science", "https://www.nimh.nih.gov/health"],
    ["BrainFacts.org (Society for Neuroscience)", "https://www.brainfacts.org/"],
    ["PubMed: search all research", "https://pubmed.ncbi.nlm.nih.gov/"]
  ];

  RC.screens["/skills"] = function () {
    list("Coping skills", "Tap a skill to read how to do it, why it works, and what it does in the brain. These tools support recovery but don't replace professional care.", D.skills, "skill", "#/", function () {
      RC.app.appendChild(el("a", { class: "btn block danger", href: "tel:988", text: "In crisis? Call or text 988", style: "margin-top:16px" }));
    });
  };
  RC.screens["/brain"] = function () {
    list("Brain & Recovery", "Tap a topic to learn how your brain changes during recovery.", D.lessons, "lesson", "#/", function () {
      RC.app.appendChild(el("h2", { text: "Go deeper" }));
      var stack = el("div", { class: "stack" });
      LINKS.forEach(function (l) { stack.appendChild(el("a", { class: "row-link", target: "_blank", rel: "noopener", href: l[1], text: l[0] })); });
      RC.app.appendChild(stack);
    });
  };
  RC.dynamic = RC.dynamic || [];
  RC.dynamic.push(function (h) {
    var m = h.match(/^\/(skill|lesson)\/(\d+)$/);
    if (!m) return null;
    var isSkill = m[1] === "skill", item = (isSkill ? D.skills : D.lessons)[+m[2]];
    if (!item) return null;
    return function () { detail(item, isSkill ? "#/skills" : "#/brain", !isSkill); };
  });
})();
