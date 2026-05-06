/* Chapter 3.a · "how much" simulator (EN). */

(() => {
  const root = document.querySelector("[data-cap03-sim]");
  if (!root) return;

  const DEFICIT0 = 739000;
  const DEMANDA = 250000;
  const ANYOS_DEMANDA = 13;
  const RITMO_ACTUAL = 95000;
  const OBJETIVO_LIBRO = 3_000_000;
  const ANYO0 = 2026;
  const T_MAX = 44;
  const VIV_MAX = 5_000_000;

  const X_MIN = 60, X_MAX = 700, Y_TOP = 20, Y_BOT = 320;
  const xScale = (t) => X_MIN + (t / T_MAX) * (X_MAX - X_MIN);
  const yScale = (v) => Y_BOT - (v / VIV_MAX) * (Y_BOT - Y_TOP);

  function necesidadEn(t) {
    return DEFICIT0 + DEMANDA * Math.min(t, ANYOS_DEMANDA);
  }
  function aniosCierre(X) {
    if (X <= 0) return Infinity;
    if (X > DEMANDA) {
      const t1 = DEFICIT0 / (X - DEMANDA);
      if (t1 <= ANYOS_DEMANDA) return t1;
    }
    return (DEFICIT0 + DEMANDA * ANYOS_DEMANDA) / X;
  }
  function aniosTres(X) {
    return X > 0 ? OBJETIVO_LIBRO / X : Infinity;
  }

  function pathNecesidad() {
    const p0 = `M ${xScale(0)} ${yScale(DEFICIT0)}`;
    const p1 = `L ${xScale(ANYOS_DEMANDA)} ${yScale(DEFICIT0 + DEMANDA * ANYOS_DEMANDA)}`;
    const p2 = `L ${xScale(T_MAX)} ${yScale(DEFICIT0 + DEMANDA * ANYOS_DEMANDA)}`;
    return `${p0} ${p1} ${p2}`;
  }
  function pathConstruido(X) {
    const tCap = X > 0 ? VIV_MAX / X : T_MAX;
    const tEnd = Math.min(T_MAX, tCap);
    return `M ${xScale(0)} ${yScale(0)} L ${xScale(tEnd)} ${yScale(Math.min(X * tEnd, VIV_MAX))}`;
  }

  const fmt = new Intl.NumberFormat("en-US");
  const fmtAnyos = (t) => {
    if (!isFinite(t)) return "∞";
    if (t < 1) return t.toFixed(1);
    return Math.round(t).toString();
  };

  const slider     = root.querySelector("[data-slider]");
  const valEl      = root.querySelector("[data-value]");
  const factorEl   = root.querySelector("[data-factor]");
  const outCierre  = root.querySelector("[data-out-cierre]");
  const outTres    = root.querySelector("[data-out-tres]");
  const outAnyo    = root.querySelector("[data-out-anyo]");
  const curveNeed  = root.querySelector('[data-curve="need"]');
  const curveBuild = root.querySelector('[data-curve="build"]');
  const cross      = root.querySelector("[data-cross]");
  const crossLine  = cross.querySelector(".cap03-sim__cross-line");
  const crossLabel = cross.querySelector("[data-cross-label]");

  curveNeed.setAttribute("d", pathNecesidad());

  function update() {
    const X = +slider.value;
    valEl.textContent = fmt.format(X);
    factorEl.textContent = "×" + (X / RITMO_ACTUAL).toFixed(1);

    curveBuild.setAttribute("d", pathConstruido(X));

    const tCierre = aniosCierre(X);
    const tTres   = aniosTres(X);
    outCierre.textContent = fmtAnyos(tCierre);
    outTres.textContent   = fmtAnyos(tTres);
    outAnyo.textContent   = isFinite(tCierre) && tCierre <= T_MAX
      ? (ANYO0 + Math.round(tCierre)).toString()
      : "out of range";

    if (isFinite(tCierre) && tCierre <= T_MAX) {
      const cx = xScale(tCierre);
      const cy = yScale(necesidadEn(tCierre));
      cross.setAttribute("transform", `translate(${cx},${cy})`);
      cross.classList.add("is-on");
      crossLine.setAttribute("x1", 0);
      crossLine.setAttribute("y1", 0);
      crossLine.setAttribute("x2", 0);
      crossLine.setAttribute("y2", Y_BOT - cy);
      crossLabel.setAttribute("x", 0);
      crossLabel.setAttribute("y", -10);
      crossLabel.setAttribute("text-anchor", cx > X_MAX - 80 ? "end" : "middle");
      crossLabel.textContent = `closes in ${fmtAnyos(tCierre)} y · ${ANYO0 + Math.round(tCierre)}`;
    } else {
      cross.classList.remove("is-on");
    }
  }

  slider.addEventListener("input", update);
  update();
})();
