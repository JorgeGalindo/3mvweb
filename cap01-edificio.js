/* Cap. 01 · Bloque 2 · Proyecto-tipo isométrico
   Tres restricciones que se activan al levantar un edificio:
   altura · CTE · red eléctrica.
   Stack: SVG inline + IntersectionObserver + capas CSS toggleables. */

(() => {
  const root = document.querySelector("[data-cap01-edif]");
  if (!root) return;

  const stage = root.querySelector("[data-edif-stage]");
  const steps = Array.from(root.querySelectorAll(".cap01-edif-step"));
  if (!stage || !steps.length) return;

  let current = "0";

  function setStep(s) {
    if (!s || s === current) return;
    current = s;
    stage.dataset.step = s;
  }

  /* El step se activa mientras intersecta la franja inferior del viewport
     (60 %–90 %): es donde aparece bajo el edificio en móvil y donde
     emerge desde abajo en la columna lateral en desktop. En ese instante
     dispara el cambio del SVG. Al salir de la franja por arriba, pierde
     `is-active` y hace fade-out. */
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
