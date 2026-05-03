/* Cap. 01 · Bloque 3 · Todo esto se convierte en tiempo
   Timeline horizontal con cuatro segmentos secuenciales (PGOU, Plan
   parcial + urbanización, licencia, obra). Mismo patrón de scrolly. */

(() => {
  const root = document.querySelector("[data-cap01-tiempo]");
  if (!root) return;

  const stage = root.querySelector("[data-tiempo-stage]");
  const steps = Array.from(root.querySelectorAll(".cap01-tiempo-step"));
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
