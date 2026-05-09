/* Cap. 03.a · simulador del cuánto.
   Modelo:
     - año 0 = 2026 (punto de partida del simulador)
     - déficit pasado básico = 739.000 (brief EsadeEcPol, abr 2026)
     - demanda nueva D(t) decae linealmente desde 250.000/año en t=0 hasta
       0 en t = 26 años. Por simplicidad: en vez del corte abrupto en 2039
       (cliff), modelamos un descenso suave hasta plana. La demanda
       acumulada total sigue siendo ~3,25M (= 250.000 · 26 / 2).
     - oferta = X viv/año (slider, X ∈ [60.000, 450.000])
     - necesidad acumulada N(t) = 739 + 250·t − (250/52)·t² para t ≤ 26;
       N(t) = 739 + 3.250 = 3.989 para t ≥ 26.
     - "brecha cerrada" cuando construido ≥ necesidad
     - objetivo simbólico del libro: 3 M de viviendas terminadas. */

(() => {
  const root = document.querySelector("[data-cap03-sim]");
  if (!root) return;

  const DEFICIT0 = 739000;
  const DEMANDA0 = 250000;            // demanda inicial (año 0)
  const T_DECAY = 26;                 // años hasta que la demanda llega a 0
  const TOTAL_DEM = DEMANDA0 * T_DECAY / 2; // 3.250.000
  const NEED_MAX = DEFICIT0 + TOTAL_DEM;    // 3.989.000
  const RITMO_ACTUAL = 95000;
  const OBJETIVO_LIBRO = 3_000_000;
  const ANYO0 = 2026;
  const T_MAX = 44;                  // ventana de la gráfica: 2026-2070
  const VIV_MAX = 5_000_000;         // tope eje Y: 5M

  // viewBox 720×360, area útil 60..700 × 20..320
  const X_MIN = 60, X_MAX = 700, Y_TOP = 20, Y_BOT = 320;
  const xScale = (t) => X_MIN + (t / T_MAX) * (X_MAX - X_MIN);
  const yScale = (v) => Y_BOT - (v / VIV_MAX) * (Y_BOT - Y_TOP);

  /* — funciones del modelo — */
  function necesidadEn(t) {
    if (t <= 0) return DEFICIT0;
    if (t >= T_DECAY) return NEED_MAX;
    const beta = DEMANDA0 / (2 * T_DECAY);
    return DEFICIT0 + DEMANDA0 * t - beta * t * t;
  }
  /* año t* en el que construido(t,X) = necesidad(t).
     Tramo curvo (t ≤ T_DECAY):
       X·t = 739 + 250·t − (250/52)·t²
       (250/52)·t² + (X-250)·t − 739 = 0
       Quadratic positive root.
     Tramo plano (t > T_DECAY):
       X·t = 3.989  →  t = 3.989/X */
  function aniosCierre(X) {
    if (X <= 0) return Infinity;
    const beta = DEMANDA0 / (2 * T_DECAY);
    const disc = (DEMANDA0 - X) ** 2 + 4 * beta * DEFICIT0;
    const tQuad = (DEMANDA0 - X + Math.sqrt(disc)) / (2 * beta);
    if (tQuad > 0 && tQuad <= T_DECAY) return tQuad;
    return NEED_MAX / X;
  }
  function aniosTres(X) {
    return X > 0 ? OBJETIVO_LIBRO / X : Infinity;
  }

  /* — paths SVG — */
  function pathNecesidad() {
    // Bezier cuadrática equivalente a la parábola N(t) = D + 250·t − (250/52)·t²
    // Anchor inicial (0, 739), control (13, 3989), anchor final (26, 3989) → flat hasta T_MAX.
    const p0 = `M ${xScale(0)} ${yScale(DEFICIT0)}`;
    const ctrl = `${xScale(T_DECAY/2)} ${yScale(NEED_MAX)}`;
    const end  = `${xScale(T_DECAY)} ${yScale(NEED_MAX)}`;
    const flat = `L ${xScale(T_MAX)} ${yScale(NEED_MAX)}`;
    return `${p0} Q ${ctrl} ${end} ${flat}`;
  }
  function pathConstruido(X) {
    // Línea recta: (0,0) → (T_MAX, X·T_MAX). Recortamos a Y_TOP si supera 5M.
    const tCap = X > 0 ? VIV_MAX / X : T_MAX;
    const tEnd = Math.min(T_MAX, tCap);
    return `M ${xScale(0)} ${yScale(0)} L ${xScale(tEnd)} ${yScale(Math.min(X * tEnd, VIV_MAX))}`;
  }

  /* — formato — */
  const fmt = new Intl.NumberFormat("es-ES");
  const fmtAnyos = (t) => {
    if (!isFinite(t)) return "∞";
    if (t < 1) return t.toFixed(1);
    return Math.round(t).toString();
  };

  /* — actualizar UI — */
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
    factorEl.textContent = "×" + (X / RITMO_ACTUAL).toFixed(1).replace(".", ",");

    curveBuild.setAttribute("d", pathConstruido(X));

    const tCierre = aniosCierre(X);
    const tTres   = aniosTres(X);
    outCierre.textContent = fmtAnyos(tCierre);
    outTres.textContent   = fmtAnyos(tTres);
    outAnyo.textContent   = isFinite(tCierre) && tCierre <= T_MAX
      ? (ANYO0 + Math.round(tCierre)).toString()
      : "fuera de rango";

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
      crossLabel.textContent = `cierre en ${fmtAnyos(tCierre)} a · ${ANYO0 + Math.round(tCierre)}`;
    } else {
      cross.classList.remove("is-on");
    }
  }

  slider.addEventListener("input", update);
  update();
})();
