/* Cap. 03.b · archivador clásico con pestañas en diagonal. */

(() => {
  const root = document.querySelector("[data-cap03-tabs]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll(".cap03-tab"));
  const panels = Array.from(root.querySelectorAll(".cap03-ficha"));
  const panel = root.querySelector(".cap03-tabs__panel");

  function activate(id) {
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      if (on && panel) panel.style.borderTopColor = t.style.getPropertyValue("--tone");
    });
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === id));
  }

  // sincroniza color del panel al cargar con la tab activa
  const initial = tabs.find((t) => t.classList.contains("is-active"));
  if (initial && panel) panel.style.borderTopColor = initial.style.getPropertyValue("--tone");

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
