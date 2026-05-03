/* Cap. 03.b · archivador con pestañas para las 7 palancas. */

(() => {
  const root = document.querySelector("[data-cap03-tabs]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll(".cap03-tab"));
  const panels = Array.from(root.querySelectorAll(".cap03-ficha"));

  function activate(id) {
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === id));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const idx = tabs.indexOf(tab);
      const next = e.key === "ArrowRight"
        ? (idx + 1) % tabs.length
        : (idx - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next].dataset.tab);
    });
  });
})();
