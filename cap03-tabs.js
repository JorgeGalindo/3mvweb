/* Cap. 03.b · abanico de cartas para las 7 palancas. */

(() => {
  const root = document.querySelector("[data-cap03-tabs]");
  if (!root) return;

  const fichas = Array.from(root.querySelectorAll(".cap03-ficha"));

  function activate(id) {
    fichas.forEach((f) => {
      const on = f.dataset.panel === id;
      f.classList.toggle("is-active", on);
      f.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  fichas.forEach((f) => {
    f.addEventListener("click", () => activate(f.dataset.panel));
    f.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate(f.dataset.panel);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const idx = fichas.indexOf(f);
        const next = e.key === "ArrowRight"
          ? (idx + 1) % fichas.length
          : (idx - 1 + fichas.length) % fichas.length;
        fichas[next].focus();
        activate(fichas[next].dataset.panel);
      }
    });
  });
})();
