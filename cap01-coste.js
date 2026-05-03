/* Cap. 01 · Bloque 4 · Construir no sale rentable
   Barra apilada de costes vs precio de venta. Cinco capas que se van
   añadiendo por step (tiempo, crédito, mano de obra, materiales,
   productividad). El cierre muestra que tampoco sale para el público. */

(() => {
  const root = document.querySelector("[data-cap01-coste]");
  if (!root) return;

  const stage = root.querySelector("[data-coste-stage]");
  const steps = Array.from(root.querySelectorAll(".cap01-coste-step"));
  if (!stage || !steps.length) return;

  let current = "0";
  function setStep(s) {
    if (!s || s === current) return;
    current = s;
    stage.dataset.step = s;
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.classList.toggle("is-active", e.isIntersecting);
          if (e.isIntersecting) setStep(e.target.dataset.step);
        }
      },
      { rootMargin: "-50% 0px -25% 0px", threshold: 0 }
    );
    steps.forEach((s) => io.observe(s));
  }
})();
