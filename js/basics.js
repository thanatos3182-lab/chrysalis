/* Basics: step-by-step checklists for rebuilding life (ID first). Progress saved on this device only. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var KEY = "rc_basics_done";
  var q = encodeURIComponent;

  function load() {
    var d = RC.store.get("basics", null);
    if (d) return d;
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(d) { RC.store.set("basics", d); }

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
    },
    {
      id: "benefits",
      title: "Benefits",
      intro: "Food, health coverage, and phone help. Rules and income limits differ by state and change over time, so check your state's official page for the latest.",
      steps: [
        {
          id: "snap",
          title: "1. Food help (SNAP)",
          why: "Monthly money for groceries on a card.",
          bring: [
            "Photo ID if you have one",
            "Social Security numbers for people in your household (or proof you applied)",
            "Proof of income, or a note that you have none",
            "Where you live, and a mailing address",
            "Rent and utility costs if you have them"
          ],
          tips: [
            "Ask about expedited SNAP. If you have very little money, you may get help within about a week.",
            "Rules about past convictions differ by state. Apply anyway and ask.",
            "Apply through your state's official site or office. It is free."
          ],
          links: [
            { label: "Find your state's SNAP office (USDA)", url: "https://www.fns.usda.gov/snap/state-directory" },
            { label: "Benefits.gov benefit finder", url: "https://www.benefits.gov/benefit-finder" },
            { label: "Food banks and pantries near me", needsLocation: true, url: function (zip) { return "https://www.google.com/search?q=" + q("food pantry near " + zip); } }
          ]
        },
        {
          id: "medicaid",
          title: "2. Health coverage (Medicaid)",
          why: "Low-cost or free coverage that, in most states, includes addiction treatment and mental health care.",
          bring: [
            "Photo ID if you have one",
            "Social Security number",
            "Income information (or that you have none)",
            "A mailing address"
          ],
          tips: [
            "You can usually apply any time of year. There is no open enrollment window for Medicaid.",
            "Requirements are changing in some states. Check your state's page and ask what applies to you.",
            "If you are in treatment, tell the program. They often help with applications."
          ],
          links: [
            { label: "How to apply for Medicaid (HealthCare.gov)", url: "https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/" },
            { label: "SAMHSA treatment finder", url: "https://findtreatment.gov/" },
            { label: "211: help applying", url: "https://www.211.org/" }
          ]
        },
        {
          id: "phoneaid",
          title: "3. Phone and internet discount (Lifeline)",
          why: "A federal discount on phone or internet service.",
          bring: [
            "Proof you qualify: you may qualify through SNAP, Medicaid, SSI, or federal housing help, or by income",
            "Photo ID if you have one"
          ],
          tips: [
            "Only apply through the official Lifeline site or a provider it lists.",
            "The Affordable Connectivity Program ended in 2024. Ignore ads that still offer it."
          ],
          links: [
            { label: "Apply for Lifeline (official)", url: "https://www.lifelinesupport.org/" },
            { label: "FCC Lifeline info", url: "https://www.fcc.gov/lifeline-consumers" }
          ]
        }
      ]
    },
    {
      id: "bank",
      title: "Bank account",
      intro: "A bank or credit union account makes pay, bills, and getting housing easier.",
      steps: [
        {
          id: "gather",
          title: "1. Get your documents ready",
          why: "Most banks ask for the same few things.",
          bring: [
            "Government photo ID (your state ID from the ID list)",
            "Social Security number",
            "Proof of address (a letter from a shelter, program, or lease often works; ask the bank)",
            "A small opening deposit if the account needs one"
          ],
          tips: [
            "No address yet? Ask the bank what they accept. Some take a shelter or program letter."
          ],
          links: [
            { label: "Credit unions (find one)", url: "https://www.mycreditunion.gov/" }
          ]
        },
        {
          id: "pick",
          title: "2. Pick an account that won't trap you",
          why: "The right account avoids fees that eat your money.",
          bring: [
            "Ask for a checking account with no overdraft fees and no minimum balance",
            "Ask if they offer a Bank On certified account"
          ],
          tips: [
            "Credit unions are often more flexible and cheaper than big banks.",
            "Skip check-cashing stores and prepaid card fees if you can. They add up fast.",
            "If a bank turned you down, ask whether they offer a second-chance account."
          ],
          links: [
            { label: "Bank On certified accounts", url: "https://joinbankon.org/" },
            { label: "Banks and credit unions near me", needsLocation: true, url: function (zip) { return "https://www.google.com/search?q=" + q("credit union near " + zip); } }
          ]
        },
        {
          id: "chex",
          title: "3. If you were turned down: check your report",
          why: "Past account problems can show up on a banking report and block new accounts.",
          bring: [
            "Your full name, address, date of birth, and Social Security number to request it"
          ],
          tips: [
            "You can get your ChexSystems report free once every 12 months.",
            "If something is wrong, you can dispute it in writing."
          ],
          links: [
            { label: "ChexSystems: request your free report", url: "https://www.chexsystems.com/" },
            { label: "CFPB: help with banking problems", url: "https://www.consumerfinance.gov/" }
          ]
        }
      ]
    },
    {
      id: "phone",
      title: "Phone and internet",
      intro: "Staying reachable matters for jobs, appointments, and benefits.",
      steps: [
        {
          id: "phoneplan",
          title: "1. Get a phone plan",
          why: "Employers, offices, and programs need a number to reach you.",
          bring: [
            "Photo ID if you have one",
            "A way to pay, or proof for a discount (see Lifeline in Benefits)"
          ],
          tips: [
            "Prepaid plans usually need no credit check and no contract.",
            "Ask about Lifeline before you pay full price."
          ],
          links: [
            { label: "Apply for Lifeline (official)", url: "https://www.lifelinesupport.org/" },
            { label: "Phone stores near me", needsLocation: true, url: function (zip) { return "https://www.google.com/search?q=" + q("prepaid phone store near " + zip); } }
          ]
        },
        {
          id: "internet",
          title: "2. Find internet access",
          why: "Applications, email, and telehealth all need it.",
          bring: [
            "Nothing needed for free options"
          ],
          tips: [
            "Public libraries offer free Wi-Fi and computers, often with printing.",
            "Ask internet providers about low-income plans. Many have one."
          ],
          links: [
            { label: "Public libraries near me", needsLocation: true, url: function (zip) { return "https://www.google.com/search?q=" + q("public library near " + zip); } },
            { label: "211: low-cost internet help", url: "https://www.211.org/" }
          ]
        },
        {
          id: "email",
          title: "3. Set up a safe email",
          why: "You will need one for almost every application.",
          bring: [
            "A new email address with a simple, professional name",
            "A password you can remember, written down somewhere safe"
          ],
          tips: [
            "Turn on two-step verification if you can.",
            "Never share passwords or codes sent to your phone, even if someone says they are from a bank or agency.",
            "Proton Mail is a privacy-focused option with a free plan. Gmail also works. Either is fine."
          ],
          links: [
            { label: "Proton Mail (private, free plan)", url: "https://proton.me/mail" },
            { label: "Gmail (also free)", url: "https://accounts.google.com/signup" }
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
      var progress = node("span", "", "font-weight:normal;font-size:0.85em;");
      function updateProgress() {
        var n = list.steps.filter(function (s) { return done[list.id + ":" + s.id]; }).length;
        progress.textContent = n + " of " + list.steps.length + " done";
      }

      var group = node("details", "", "margin:0 0 16px;");
      var gs = node("summary", "", "cursor:pointer;min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:1.15em;font-weight:bold;");
      gs.appendChild(node("span", list.title));
      gs.appendChild(progress);
      group.appendChild(gs);
      group.appendChild(el("p", { class: "muted", text: list.intro }));
      // progress now shows in the heading

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
        group.appendChild(card);
      });
      updateProgress();
      RC.app.appendChild(group);
    });
  };
})();
