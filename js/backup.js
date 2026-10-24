/* Backup and restore: export/import everything stored on this device. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el;
  RC.screens["/backup"] = function () {
    RC.shell("Backup and restore");
    RC.app.appendChild(el("p", { class: "muted", text: "Your data lives only on this device. Save a backup file so you can restore it if your browser clears site data or you switch phones." }));
    var fileIn = el("input", { type: "file", accept: "application/json,.json", hidden: true });
    fileIn.addEventListener("change", function () {
      var f = fileIn.files && fileIn.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var obj = JSON.parse(r.result);
          if (obj.app !== "chrysalis" || typeof obj.data !== "object") throw new Error("bad");
          if (!confirm("Restore this backup? It replaces what's on this device now.")) return;
          Object.keys(obj.data).forEach(function (k) { RC.store.set(k, obj.data[k]); });
          RC.toast("Restored."); RC.go("#/");
        } catch (e) { RC.toast("That file isn't a Chrysalis backup."); }
      };
      r.readAsText(f);
    });
    RC.app.appendChild(el("div", { class: "card" }, [
      el("div", { class: "row", style: "margin-top:0" }, [
        el("button", { class: "btn", text: "Save backup", onclick: function () {
          var payload = { app: "chrysalis", version: 1, saved: new Date().toISOString(), data: RC.store.snapshot() };
          var name = "chrysalis-backup-" + RC.todayISO() + ".json";
          var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
          var file; try { file = new File([blob], name, { type: "application/json" }); } catch (e) {}
          if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: "Chrysalis backup" }).catch(function () {});
          } else {
            var a = el("a", { href: URL.createObjectURL(blob), download: name });
            document.body.appendChild(a); a.click(); a.remove();
          }
        } }),
        el("button", { class: "btn ghost", text: "Restore from file", onclick: function () { fileIn.click(); } })
      ]),
      fileIn
    ]));
    RC.app.appendChild(el("p", { class: "note", text: "A backup file contains your journal, plan, and contacts in plain text. Keep it somewhere private." }));
  };
})();
