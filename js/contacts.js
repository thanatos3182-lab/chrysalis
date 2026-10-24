/* Support contacts: save people to call or text. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  var MSG = "Rough moment. Can you talk or stay on text for a bit?";

  function contacts() {
    RC.shell("Support contacts");
    RC.app.appendChild(el("p", { class: "muted", text: "People you can reach when things get hard. Numbers stay on this device." }));
    var list = RC.store.get("contacts", []);
    if (list.length) {
      var card = el("div", { class: "card" });
      list.forEach(function (c, i) {
        card.appendChild(el("div", { class: "contact" }, [
          el("div", {}, [el("div", { class: "who", text: c.name }), c.role ? el("div", { class: "role", text: c.role }) : null]),
          el("div", { class: "row", style: "margin:0" }, [
            el("a", { class: "btn", href: "tel:" + RC.cleanNumber(c.number), text: "Call" }),
            el("a", { class: "btn ghost", href: RC.smsHref(c.number, MSG), text: "Text" }),
            el("button", { class: "btn danger", text: "Remove", onclick: function () {
              if (!confirm("Remove " + c.name + "?")) return;
              var l = RC.store.get("contacts", []); l.splice(i, 1); RC.store.set("contacts", l); contacts();
            } })
          ])
        ]));
      });
      RC.app.appendChild(card);
    }
    var name = el("input", { type: "text", id: "cn", autocomplete: "off" });
    var num = el("input", { type: "tel", id: "cp", autocomplete: "off", inputmode: "tel" });
    var role = el("input", { type: "text", id: "cr", placeholder: "Friend, sponsor, counselor...", autocomplete: "off" });
    RC.app.appendChild(el("div", { class: "card" }, [
      el("h3", { text: "Add a contact", style: "margin-top:0" }),
      el("div", { class: "field" }, [el("label", { for: "cn", text: "Name" }), name]),
      el("div", { class: "field" }, [el("label", { for: "cp", text: "Phone number" }), num]),
      el("div", { class: "field" }, [el("label", { for: "cr", text: "Role (optional)" }), role]),
      el("button", { class: "btn", text: "Add contact", onclick: function () {
        var n = name.value.trim(), p = num.value.trim();
        if (!n || !RC.cleanNumber(p)) { RC.toast("Add a name and a phone number."); return; }
        var l = RC.store.get("contacts", []); l.push({ name: n, number: p, role: role.value.trim() });
        if (RC.store.set("contacts", l)) { RC.toast("Added."); contacts(); }
      } })
    ]));
    RC.app.appendChild(el("p", { class: "note", text: "No one to call? Call or text 988, or the SAMHSA helpline at 1-800-662-4357. Both are free and 24/7." }));
  }
  RC.screens["/contacts"] = contacts;
})();
