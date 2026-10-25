/* Shared helpers for the Jobs and Housing screens: location box, search links, simple tracker. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;

  // Location (ZIP or City, ST) is shared by Jobs and Housing, saved on this device only.
  RC.place = {
    get: function () { return RC.store.get("zip", ""); },
    set: function (v) { RC.store.set("zip", v); },
    slug: function (z) { return z.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  };

  RC.locationBox = function (extra) {
    var zip = el("input", { type: "text", id: "zip", autocomplete: "off", placeholder: "ZIP code or City, ST", value: RC.place.get() });
    var kids = [el("label", { for: "zip", text: "Where are you looking?" }), zip];
    var what = null;
    if (extra) {
      what = el("input", { type: "text", id: "what", autocomplete: "off", placeholder: extra.placeholder, value: RC.store.get(extra.key, extra.fallback) });
      kids.push(el("label", { for: "what", text: extra.label, style: "margin-top:14px" }), what);
    }
    RC.app.appendChild(el("div", { class: "card" }, kids));
    return {
      zip: function () { return zip.value.trim(); },
      what: function () { return what ? (what.value.trim() || extra.fallback) : ""; },
      save: function () { RC.place.set(zip.value.trim()); if (what) RC.store.set(extra.key, what.value.trim() || extra.fallback); }
    };
  };

  // items: [{label, url: string | function, needsLocation}]
  RC.linkList = function (title, items, loc) {
    if (title) RC.app.appendChild(el("h2", { text: title }));
    var box = el("div", { class: "stack" });
    items.forEach(function (i) {
      box.appendChild(el("a", {
        class: "row-link", href: typeof i.url === "string" ? i.url : "#", target: "_blank", rel: "noopener noreferrer", text: i.label,
        onclick: function (e) {
          if (i.needsLocation && !loc.zip()) { e.preventDefault(); RC.toast("Enter your ZIP or city first."); return; }
          loc.save();
          if (typeof i.url === "function") { e.preventDefault(); window.open(i.url(), "_blank", "noopener"); }
        }
      }));
    });
    RC.app.appendChild(box);
  };

  // cfg: {key, kinds (optional), statuses, doneStatuses (indexes), fields:[{id,label,placeholder,type}], titleField, subtitle(item), noun}
  RC.tracker = function (cfg, redraw) {
    var list = RC.store.get(cfg.key, []);
    var today = RC.todayISO();
    var due = list.filter(function (x) { return x.follow && x.follow <= today && cfg.doneStatuses.indexOf(x.status) < 0; }).length;

    RC.app.appendChild(el("h2", { text: cfg.heading }));
    RC.app.appendChild(el("p", { class: "muted", text: list.length
      ? list.length + (due ? "  |  " + due + " follow-up" + (due === 1 ? "" : "s") + " due" : "")
      : "Nothing saved yet." }));

    list.forEach(function (x, idx) {
      var meta = cfg.subtitle(x);
      var followTxt = "";
      if (x.follow) followTxt = x.follow < today ? "Follow up: " + x.follow + " (overdue)" : x.follow === today ? "Follow up: today" : "Follow up: " + x.follow;
      var card = el("div", { class: "card" }, [
        el("div", { class: "who", style: "font-weight:700", text: x[cfg.titleField] }),
        el("div", { class: "role muted", text: cfg.statuses[x.status] + (meta ? "  |  " + meta : "") }),
        followTxt ? el("div", { class: "muted", style: "color:" + (x.follow <= today ? "#ffb347" : "var(--muted)"), text: followTxt }) : null,
        x.notes ? el("div", { class: "lines", style: "margin-top:6px", text: x.notes }) : null,
        el("div", { class: "row" }, [
          el("button", { class: "btn ghost", text: "Status", onclick: function () { pickStatus(x, idx); } }),
          el("button", { class: "btn ghost", text: "Follow-up", onclick: function () { pickDate(x, idx); } }),
          x.phone ? el("a", { class: "btn ghost", href: "tel:" + RC.cleanNumber(x.phone), text: "Call" }) : null,
          el("button", { class: "btn danger", text: "Delete", onclick: function () {
            if (!confirm("Delete \"" + x[cfg.titleField] + "\"?")) return;
            var l = RC.store.get(cfg.key, []); l.splice(idx, 1); RC.store.set(cfg.key, l); redraw();
          } })
        ])
      ]);
      RC.app.appendChild(card);
    });

    function save(l) { if (RC.store.set(cfg.key, l)) redraw(); }

    function pickStatus(x, idx) {
      var overlay = el("div", { class: "overlay" });
      var box = el("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": "Status" }, [el("h2", { text: "Status" })]);
      var stack = el("div", { class: "stack" });
      cfg.statuses.forEach(function (s, i) {
        stack.appendChild(el("button", { class: "btn block" + (i === x.status ? "" : " ghost"), text: s, onclick: function () {
          var l = RC.store.get(cfg.key, []); l[idx].status = i; overlay.remove(); save(l);
        } }));
      });
      stack.appendChild(el("button", { class: "btn block ghost", text: "Cancel", onclick: function () { overlay.remove(); } }));
      box.appendChild(stack); overlay.appendChild(box); document.body.appendChild(overlay);
    }

    function pickDate(x, idx) {
      var input = el("input", { type: "date", id: "fd", value: x.follow || "" });
      var overlay = el("div", { class: "overlay" });
      var box = el("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": "Follow-up date" }, [
        el("h2", { text: "Follow-up date" }), el("label", { for: "fd", text: "Date" }), input,
        el("div", { class: "row" }, [
          el("button", { class: "btn", text: "Save", onclick: function () {
            var l = RC.store.get(cfg.key, []); l[idx].follow = input.value || ""; overlay.remove(); save(l);
          } }),
          el("button", { class: "btn ghost", text: "Clear", onclick: function () {
            var l = RC.store.get(cfg.key, []); l[idx].follow = ""; overlay.remove(); save(l);
          } }),
          el("button", { class: "btn ghost", text: "Cancel", onclick: function () { overlay.remove(); } })
        ])
      ]);
      overlay.appendChild(box); document.body.appendChild(overlay);
    }

    // add form
    var inputs = {};
    var formKids = [el("h3", { text: cfg.addTitle, style: "margin-top:0" })];
    var kindSel = null;
    if (cfg.kinds) {
      kindSel = el("select", { id: "kind" }, cfg.kinds.map(function (k) { return el("option", { value: k, text: k }); }));
      formKids.push(el("div", { class: "field" }, [el("label", { for: "kind", text: "Kind of place" }), kindSel]));
    }
    cfg.fields.forEach(function (f) {
      var node = f.multiline
        ? el("textarea", { id: "f-" + f.id, placeholder: f.placeholder || "", style: "min-height:70px" })
        : el("input", { type: f.type || "text", id: "f-" + f.id, placeholder: f.placeholder || "", autocomplete: "off" });
      inputs[f.id] = node;
      formKids.push(el("div", { class: "field" }, [el("label", { for: "f-" + f.id, text: f.label }), node]));
    });
    formKids.push(el("button", { class: "btn", text: "Save", onclick: function () {
      var item = { status: 0, follow: "", added: Date.now() };
      cfg.fields.forEach(function (f) { item[f.id] = inputs[f.id].value.trim(); });
      if (kindSel) item.kind = kindSel.value;
      if (!item[cfg.titleField]) { RC.toast("Add a " + cfg.titleLabel + " first."); return; }
      var l = RC.store.get(cfg.key, []); l.unshift(item); save(l);
    } }));
    RC.app.appendChild(el("div", { class: "card" }, formKids));
  };
})();
