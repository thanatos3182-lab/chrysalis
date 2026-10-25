/* Basics: step-by-step checklists for rebuilding life (ID first). Progress saved on this device only. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var KEY = "rc_basics_done";
  var q = encodeURIComponent;

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }

  var LISTS = [
    {
      id: "id",
      title: "Get your ID",
      intro: "Do these in order. Each one helps you get the next. Rules change by state, so always check the official page before you go.",
      steps: [
        {
          id: "birth",
          title: "1. Birth certificate",
          why: "Most other IDs start here.",
          bring: [
            "Your full name as it appears on the birth record",
            "Date and place of birth",
            "Parents' full names (including mother's maiden name)",
            "A photo ID if you have one (if not, ask what else they accept)",
            "Payment (ask if fees can be waived)",
            "A mailing address where you can get mail"
          ],
          tips: [
            "Order from the state you were BORN in, not where you live now.",
            "No address? A shelter, case manager, church, or trusted person may let you use theirs. Ask first.",
            "Start from your state's official page. Lookalike sites often charge extra."
          ],
          links: [
            { label: "Where to order a birth certificate (CDC, by state)", url: "https://www.cdc.gov/nchs/w2w/index.htm" },
            { label: "211: free help finding local services", url: "https://www.211.org/" }
          ]
        },
        {
          id: "ssn",
          title: "2. Social Security card",
          why: "Needed for jobs, benefits, and your state ID.",
          bring: [
            "Proof of identity (your birth certificate often works)",
            "The Social Security application form (the SSA site walks you through it)",
            "Ask SSA which documents they accept if you are missing some"
          ],
          tips: [
            "A replacement card is free. There are yearly and lifetime limits, so only request one when you need it.",
            "Many people can start online or by phone, then finish at an office."
          ],
          links: [
            { label: "Social Security card: how to apply or replace", url: "https://www.ssa.gov/ssnumber/" },
            { label: "Find your local Social Security office", url: "https://secure.ssa.gov/ICON/main.jsp" }
          ]
        },
        {
          id: "stateid",
          title: "3. State ID",
          why: "Your everyday photo ID for banks, jobs, housing, and more.",
          bring: [
            "Birth certificate",
            "Social Security card or proof of your number",
            "Proof of where you live (rules vary; many states accept a letter from a shelter or program, so ask)",
            "Payment (ask about fee waivers)"
          ],
          tips: [
            "Check your state DMV site first for the exact document list. It changes by state.",
            "Many states offer a free or reduced-cost ID for people in certain situations. Ask them."
          ],
          links: [
            { label: "DMV near me (uses your ZIP above)", needsLocation: true, url: function (zip) { return "https://www.google.com/search?q=" + q("DMV office near " + zip); } },
            { label: "State motor vehicle services (USA.gov)", url: "https://www.usa.gov/motor-vehicle-services" }
          ]
        }
      ]
    }
  ];

  function node(tag, text, style) {
    var n = document.createElement(tag);
    if (text) n.textContent = text;
    if (style) n.style.cssText = style;
    return n;
  }

  function bullets(title, items) {
    var box = document.createElement("div");
    box.appendChild(node("strong", title, "display:block;margin:10px 0 4px;"));
    var ul = node("ul", "", "margin:0;padding-left:20px;line-height:1.5;");
    items.forEach(function (t) { ul.appendChild(node("li", t)); });
    box.appendChild(ul);
    return box;
  }

  RC.screens["/basics"] = function () {
    RC.shell("Basics");
    RC.app.appendChild(el("p", { class: "muted", text: "Step-by-step checklists for getting back on your feet. Your progress is saved on this device only." }));
    var loc = RC.locationBox();
    var done = load();

    LISTS.forEach(function (list) {
      var progress = node("p", "", "margin:4px 0 12px;");
      function updateProgress() {
        var n = list.steps.filter(function (s) { return done[list.id + ":" + s.id]; }).length;
        progress.textContent = n + " of " + list.steps.length + " done";
      }

      RC.app.appendChild(node("h2", list.title));
      RC.app.appendChild(el("p", { class: "muted", text: list.intro }));
      RC.app.appendChild(progress);

      list.steps.forEach(function (s) {
        var key = list.id + ":" + s.id;
        var card = node("details", "", "margin:0 0 12px;padding:12px;border:1px solid currentColor;border-radius:10px;");
        var sum = node("summary", "", "cursor:pointer;min-height:44px;display:flex;align-items:center;gap:10px;");
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!done[key];
        cb.style.cssText = "width:24px;height:24px;flex:none;";
        cb.setAttribute("aria-label", "Mark done: " + s.title);
        cb.addEventListener("click", function (e) { e.stopPropagation(); });
        cb.addEventListener("change", function () {
          if (cb.checked) done[key] = true; else delete done[key];
          save(done);
          updateProgress();
        });
        sum.appendChild(cb);
        sum.appendChild(node("span", s.title, "font-weight:bold;"));
        card.appendChild(sum);

        card.appendChild(node("p", s.why, "margin:8px 0 0;"));
        card.appendChild(bullets("What to bring", s.bring));
        card.appendChild(bullets("Good to know", s.tips));

        var lk = node("div", "", "margin-top:12px;display:flex;flex-direction:column;gap:10px;");
        s.links.forEach(function (l) {
          var a = node("a", l.label, "display:block;padding:10px 0;");
          a.href = typeof l.url === "string" ? l.url : "#";
          a.target = "_blank";
          a.rel = "noopener";
          if (typeof l.url === "function") {
            a.addEventListener("click", function (e) {
              e.preventDefault();
              var zip = loc.zip();
              if (!zip) { alert("Enter your ZIP (or City, ST) at the top first."); return; }
              window.open(l.url(zip), "_blank", "noopener");
            });
          }
          lk.appendChild(a);
        });
        card.appendChild(lk);
        RC.app.appendChild(card);
      });
      updateProgress();
    });
  };
})();
