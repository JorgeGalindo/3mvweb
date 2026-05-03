import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { ratioIntercensal } from "./data/ratio-intercensal.js";
import { emancipacionTasa } from "./data/emancipacion-tasa.js";
import { tenenciaEff, tenenciaEffSeries } from "./data/tenencia-eff.js";

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── nav: scroll past hero → cream mode ─── */
  const nav = document.querySelector("[data-nav]");
  const heroEnd = document.querySelector("[data-hero-end]");
  if (nav && heroEnd && "IntersectionObserver" in window) {
    const heroIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // sentinel debajo del hero. Si está sobre el viewport, estamos sobre el hero.
          // Si está debajo del top (rootBounds), pasamos al modo cream.
          const passed = !e.isIntersecting && e.boundingClientRect.top < 0;
          nav.classList.toggle("is-cream", passed);
        }
      },
      { rootMargin: "-56px 0px 0px 0px", threshold: 0 }
    );
    heroIO.observe(heroEnd);
  }

  /* ─── nav active link según sección ─── */
  const navLinks = Array.from(document.querySelectorAll(".nav__list a[href^='#']"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const navIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id;
          navLinks.forEach((a) => {
            a.classList.toggle("is-current", a.getAttribute("href") === `#${id}`);
          });
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => navIO.observe(s));
  }

  /* ─── reveal on scroll ─── */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && !reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ─── hero typing ─────────────────────────────────────────────
     Convierte cada nodo de texto del título en una secuencia de
     <span class="char"> respetando los <span class="num"> y <em>
     que llevan color/peso especial. Tras terminar el typing, se
     muestra la portada del libro a la izquierda. */
  const titleEl = document.querySelector("[data-typing-title]");
  const coverEl = document.querySelector("[data-cover]");

  const charifyTextNode = (textNode, classModifier) => {
    const text = textNode.nodeValue;
    if (!text) return [];
    const frag = document.createDocumentFragment();
    const chars = [];
    const tokens = text.split(/(\s+)/);
    for (const token of tokens) {
      if (token === "") continue;
      if (/^\s+$/.test(token)) {
        frag.appendChild(document.createTextNode(token));
        continue;
      }
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";
      for (const ch of token) {
        const charSpan = document.createElement("span");
        charSpan.className = "char char--pending" + (classModifier ? ` ${classModifier}` : "");
        charSpan.textContent = ch;
        wordSpan.appendChild(charSpan);
        chars.push(charSpan);
      }
      frag.appendChild(wordSpan);
    }
    textNode.parentNode.replaceChild(frag, textNode);
    return chars;
  };

  const collectCharsFromTitle = (root) => {
    const chars = [];
    const walk = (node, modifier) => {
      let next;
      for (let child = node.firstChild; child; child = next) {
        next = child.nextSibling;
        if (child.nodeType === Node.TEXT_NODE) {
          const newChars = charifyTextNode(child, modifier);
          chars.push(...newChars);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          let childMod = modifier;
          if (child.tagName === "EM") childMod = "char--em";
          else if (child.classList.contains("num--red")) childMod = "char--num-red";
          else if (child.classList.contains("num--green")) childMod = "char--num-green";
          walk(child, childMod);
        }
      }
    };
    walk(root, null);
    return chars;
  };

  const showCover = () => {
    if (coverEl) coverEl.classList.add("is-shown");
  };

  const drawUnderlines = () => {
    if (!titleEl) return;
    const uls = titleEl.querySelectorAll(".ul");
    uls.forEach((el, i) => {
      setTimeout(() => el.classList.add("is-drawn"), 250 + i * 380);
    });
  };

  if (titleEl) {
    const titleOriginalHTML = titleEl.innerHTML;
    let cancelled = false;
    let queue = [];

    const finishAll = () => {
      if (cancelled) return;
      cancelled = true;
      try {
        queue.forEach((it) => { if (it.span) it.span.classList.remove("char--pending"); });
        titleEl.classList.add("is-typed");
        showCover();
        drawUnderlines();
      } catch (_) {
        titleEl.innerHTML = titleOriginalHTML;
        titleEl.classList.add("is-typed");
        showCover();
        drawUnderlines();
      }
    };

    try {
      const caret = document.createElement("span");
      caret.className = "caret-inline";
      caret.setAttribute("aria-hidden", "true");
      caret.textContent = "▌";

      // queue line-aware: cada línea aporta sus chars; entre líneas, una pausa.
      const lines = titleEl.querySelectorAll(".hero__line");
      if (lines.length) {
        lines.forEach((line, idx) => {
          if (idx > 0) queue.push({ pause: 650 });
          collectCharsFromTitle(line).forEach((span) => queue.push({ span }));
        });
      } else {
        collectCharsFromTitle(titleEl).forEach((span) => queue.push({ span }));
      }
      titleEl.appendChild(caret);

      const hasChars = queue.some((it) => it.span);
      if (reduceMotion || !hasChars) {
        finishAll();
      } else {
        const baseSpeed = 16;
        const pauseFor = (ch) => {
          if (ch === "." || ch === "?" || ch === "!") return 240;
          if (ch === "," || ch === ";" || ch === ":") return 120;
          return 0;
        };

        const typeTitle = () => {
          let k = 0;
          const tick = () => {
            if (cancelled) return;
            if (k >= queue.length) {
              titleEl.classList.add("is-typed");
              setTimeout(showCover, 220);
              setTimeout(drawUnderlines, 220);
              return;
            }
            const item = queue[k++];
            if (item.pause) {
              setTimeout(tick, item.pause);
              return;
            }
            item.span.classList.remove("char--pending");
            const ch = item.span.textContent;
            const variance = 4 + Math.random() * 12;
            setTimeout(tick, baseSpeed + variance + pauseFor(ch));
          };
          tick();
        };

        setTimeout(typeTitle, 350);

        document.addEventListener("click", finishAll, { once: true });
        setTimeout(() => { if (!cancelled) finishAll(); }, 30000);
      }
    } catch (err) {
      console.error("[typing] error:", err);
      titleEl.innerHTML = titleOriginalHTML;
      titleEl.classList.add("is-typed");
      showCover();
    }
  } else {
    showCover();
  }

  /* ─── helpers compartidos por todos los gráficos ─── */
  const cssVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const palette = () => ({
    green:      cssVar("--green"),
    greenDeep:  cssVar("--green-deep"),
    greenPastel:cssVar("--green-pastel"),
    red:        cssVar("--red"),
    redDeep:    cssVar("--red-deep"),
    redPastel:  cssVar("--red-pastel"),
    paper:      cssVar("--paper"),
    paperSoft:  cssVar("--paper-soft"),
    paperDeep:  cssVar("--paper-deep"),
    ink:        cssVar("--ink"),
    inkSoft:    cssVar("--ink-soft"),
    inkMute:    cssVar("--ink-mute"),
    rule:       cssVar("--rule"),
    ruleStrong: cssVar("--rule-strong"),
  });

  const MONO = "Roboto Mono, ui-monospace, monospace";
  const fmt1 = (n) => n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt0 = (n) => n.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  /* ─── gráfico 01 · ratio viviendas / hogar por periodo ─── */
  const renderRatioChart = () => {
    const container = document.querySelector('[data-plot="ratio"]');
    if (!container) return;

    const data = ratioIntercensal;
    const c = palette();

    const colorFor = (k) =>
      k === "actual" ? c.red :
      k === "ech"    ? c.inkMute :
                       c.green;
    const colorDeepFor = (k) =>
      k === "actual" ? c.redDeep :
      k === "ech"    ? c.inkSoft :
                       c.greenDeep;

    const W = 880, H = 380;
    const m = { top: 26, right: 24, bottom: 60, left: 52 };

    const x = d3.scaleBand()
      .domain(data.map((d) => d.periodo))
      .range([m.left, W - m.right])
      .padding(0.32);

    const y = d3.scaleLinear()
      .domain([0, 2])
      .range([H - m.bottom, m.top]);

    const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("width", "100%")
      .attr("height", "auto")
      .attr("role", "img")
      .attr("aria-label", "Ratio de viviendas terminadas por hogar creado, agregada por periodo intercensal.");

    // grid horizontal + etiquetas y
    const yTicks = [0, 0.5, 1, 1.5, 2];
    svg.append("g").selectAll("line")
      .data(yTicks).join("line")
      .attr("x1", m.left).attr("x2", W - m.right)
      .attr("y1", (d) => y(d)).attr("y2", (d) => y(d))
      .attr("stroke", c.rule).attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "2 3");

    svg.append("g").selectAll("text")
      .data(yTicks).join("text")
      .attr("x", m.left - 8).attr("y", (d) => y(d))
      .attr("dy", "0.32em").attr("text-anchor", "end")
      .attr("fill", c.inkMute).attr("font-size", 11).attr("font-family", MONO)
      .text((d) => fmt0(d));

    // línea de equilibrio
    svg.append("line")
      .attr("x1", m.left).attr("x2", W - m.right)
      .attr("y1", y(1)).attr("y2", y(1))
      .attr("stroke", c.redDeep).attr("stroke-width", 1.2)
      .attr("stroke-dasharray", "8 6");
    svg.append("text")
      .attr("x", m.left + 6).attr("y", y(1) - 4)
      .attr("fill", c.redDeep).attr("font-size", 10).attr("font-family", MONO)
      .text("equilibrio (ratio = 1)");

    // barras
    svg.append("g").selectAll("rect")
      .data(data).join("rect")
      .attr("x", (d) => x(d.periodo))
      .attr("y", (d) => y(d.ratio))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.ratio))
      .attr("fill", (d) => colorFor(d.color))
      .attr("fill-opacity", 0.65)
      .attr("stroke", (d) => colorFor(d.color))
      .attr("stroke-width", 1);

    // valores encima de cada barra
    svg.append("g").selectAll("text")
      .data(data).join("text")
      .attr("x", (d) => x(d.periodo) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.ratio) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", (d) => colorDeepFor(d.color))
      .attr("font-size", 12).attr("font-weight", 500).attr("font-family", MONO)
      .text((d) => fmt1(d.ratio));

    // etiquetas x — split en dos líneas si tienen paréntesis
    const xLabels = svg.append("g");
    data.forEach((d) => {
      const cx = x(d.periodo) + x.bandwidth() / 2;
      const parts = d.periodo.split(/\s+(?=\()/);
      const t = xLabels.append("text")
        .attr("x", cx).attr("y", H - m.bottom + 18)
        .attr("text-anchor", "middle")
        .attr("fill", c.inkSoft)
        .attr("font-size", 10).attr("font-family", MONO);
      t.append("tspan").attr("x", cx).text(parts[0]);
      if (parts[1]) t.append("tspan").attr("x", cx).attr("dy", 13).text(parts[1]);
    });

    // baseline
    svg.append("line")
      .attr("x1", m.left).attr("x2", W - m.right)
      .attr("y1", y(0)).attr("y2", y(0))
      .attr("stroke", c.ruleStrong).attr("stroke-width", 1);

    container.replaceChildren(svg.node());
  };

  /* ─── gráfico 03 · tasa de emancipación 25-34 (ECV INE) ─── */
  const renderEmancipacionChart = () => {
    const container = document.querySelector('[data-plot="emancipacion"]');
    if (!container) return;

    const data = emancipacionTasa;
    const c = palette();

    const W = 880, H = 360;
    const m = { top: 24, right: 64, bottom: 38, left: 56 };

    const x = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([m.left, W - m.right]);

    const y = d3.scaleLinear()
      .domain([40, 65])
      .range([H - m.bottom, m.top]);

    const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("width", "100%")
      .attr("height", "auto")
      .attr("role", "img")
      .attr("aria-label", "Tasa de emancipación de los 25 a 34 años en España.");

    // grid
    const yTicks = [40, 45, 50, 55, 60, 65];
    svg.append("g").selectAll("line")
      .data(yTicks).join("line")
      .attr("x1", m.left).attr("x2", W - m.right)
      .attr("y1", (d) => y(d)).attr("y2", (d) => y(d))
      .attr("stroke", c.rule).attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "2 3");
    svg.append("g").selectAll("text")
      .data(yTicks).join("text")
      .attr("x", m.left - 8).attr("y", (d) => y(d))
      .attr("dy", "0.32em").attr("text-anchor", "end")
      .attr("fill", c.inkMute).attr("font-size", 11).attr("font-family", MONO)
      .text((d) => `${d} %`);

    // x ticks: cada 2 años
    const xYears = data.map((d) => d.year).filter((y) => y % 2 === 1);
    svg.append("g").selectAll("text")
      .data(xYears).join("text")
      .attr("x", (d) => x(d)).attr("y", H - m.bottom + 20)
      .attr("text-anchor", "middle")
      .attr("fill", c.inkMute).attr("font-size", 11).attr("font-family", MONO)
      .text((d) => d);

    // baseline
    svg.append("line")
      .attr("x1", m.left).attr("x2", W - m.right)
      .attr("y1", H - m.bottom).attr("y2", H - m.bottom)
      .attr("stroke", c.ruleStrong).attr("stroke-width", 1);

    // área bajo la curva, rojo pastel para resaltar la caída
    const area = d3.area()
      .x((d) => x(d.year))
      .y0(y(40))
      .y1((d) => y(d.tasa))
      .curve(d3.curveMonotoneX);
    svg.append("path")
      .datum(data)
      .attr("d", area)
      .attr("fill", c.redPastel)
      .attr("fill-opacity", 0.35);

    // línea
    const line = d3.line()
      .x((d) => x(d.year))
      .y((d) => y(d.tasa))
      .curve(d3.curveMonotoneX);
    svg.append("path")
      .datum(data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", c.red)
      .attr("stroke-width", 2.4);

    // dots
    svg.append("g").selectAll("circle")
      .data(data).join("circle")
      .attr("cx", (d) => x(d.year)).attr("cy", (d) => y(d.tasa))
      .attr("r", 3).attr("fill", c.red)
      .attr("stroke", c.paperSoft).attr("stroke-width", 1.5);

    // valores extremos
    const first = data[0], last = data[data.length - 1];
    svg.append("text")
      .attr("x", x(first.year)).attr("y", y(first.tasa) - 12)
      .attr("text-anchor", "start")
      .attr("fill", c.redDeep).attr("font-size", 12).attr("font-weight", 500)
      .attr("font-family", MONO)
      .text(`${fmt0(first.tasa).replace(".", ",")} %`);
    svg.append("text")
      .attr("x", x(last.year)).attr("y", y(last.tasa) + 18)
      .attr("text-anchor", "end")
      .attr("fill", c.redDeep).attr("font-size", 12).attr("font-weight", 500)
      .attr("font-family", MONO)
      .text(`${fmt0(last.tasa).replace(".", ",")} %`);

    container.replaceChildren(svg.node());
  };

  /* ─── gráfico 02 · tenencia EFF · 2 líneas: <35 vs 65-74 ─── */
  const renderTenenciaChart = () => {
    const container = document.querySelector('[data-plot="tenencia"]');
    if (!container) return;

    const data = tenenciaEff;
    const c = palette();

    const W = 880, H = 380;
    const m = { top: 28, right: 110, bottom: 38, left: 56 };

    const x = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([m.left, W - m.right]);
    const y = d3.scaleLinear()
      .domain([25, 90])
      .range([H - m.bottom, m.top]);

    const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("width", "100%")
      .attr("height", "auto")
      .attr("role", "img")
      .attr("aria-label", "Porcentaje de propietarios de la vivienda principal: menores de 35 frente a 65-74 años.");

    // grid
    const yTicks = [30, 50, 70, 90];
    svg.append("g").selectAll("line")
      .data(yTicks).join("line")
      .attr("x1", m.left).attr("x2", W - m.right)
      .attr("y1", (d) => y(d)).attr("y2", (d) => y(d))
      .attr("stroke", c.rule).attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "2 3");
    svg.append("g").selectAll("text")
      .data(yTicks).join("text")
      .attr("x", m.left - 8).attr("y", (d) => y(d))
      .attr("dy", "0.32em").attr("text-anchor", "end")
      .attr("fill", c.inkMute).attr("font-size", 11).attr("font-family", MONO)
      .text((d) => `${d} %`);

    // x ticks
    const xTicks = data.map((d) => d.year);
    svg.append("g").selectAll("text")
      .data(xTicks).join("text")
      .attr("x", (d) => x(d)).attr("y", H - m.bottom + 20)
      .attr("text-anchor", "middle")
      .attr("fill", c.inkMute).attr("font-size", 11).attr("font-family", MONO)
      .text((d) => d);

    // baseline
    svg.append("line")
      .attr("x1", m.left).attr("x2", W - m.right)
      .attr("y1", H - m.bottom).attr("y2", H - m.bottom)
      .attr("stroke", c.ruleStrong).attr("stroke-width", 1);

    // sombreado entre las dos líneas (la brecha generacional)
    const gap = d3.area()
      .x((d) => x(d.year))
      .y0((d) => y(d["65-74"]))
      .y1((d) => y(d["<35"]))
      .curve(d3.curveMonotoneX);
    svg.append("path")
      .datum(data)
      .attr("d", gap)
      .attr("fill", c.redPastel)
      .attr("fill-opacity", 0.32);

    // línea 65-74 (gris, referencia estable)
    const lineEst = d3.line()
      .x((d) => x(d.year)).y((d) => y(d["65-74"]))
      .curve(d3.curveMonotoneX);
    svg.append("path")
      .datum(data)
      .attr("d", lineEst)
      .attr("fill", "none")
      .attr("stroke", c.inkMute)
      .attr("stroke-width", 1.6);

    // línea <35 (rojo, protagonista)
    const lineYoung = d3.line()
      .x((d) => x(d.year)).y((d) => y(d["<35"]))
      .curve(d3.curveMonotoneX);
    svg.append("path")
      .datum(data)
      .attr("d", lineYoung)
      .attr("fill", "none")
      .attr("stroke", c.red)
      .attr("stroke-width", 2.8);

    // dots <35
    svg.append("g").selectAll("circle")
      .data(data).join("circle")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d["<35"]))
      .attr("r", 3.2)
      .attr("fill", c.red)
      .attr("stroke", c.paperSoft)
      .attr("stroke-width", 1.5);

    // etiquetas finales
    const last = data[data.length - 1];
    svg.append("text")
      .attr("x", x(last.year) + 10).attr("y", y(last["65-74"]))
      .attr("dy", "0.32em")
      .attr("fill", c.inkSoft).attr("font-size", 11).attr("font-family", MONO)
      .text(`65–74 · ${last["65-74"]} %`);

    svg.append("text")
      .attr("x", x(last.year) + 10).attr("y", y(last["<35"]))
      .attr("dy", "0.32em")
      .attr("fill", c.redDeep).attr("font-size", 12).attr("font-weight", 500).attr("font-family", MONO)
      .text(`menores de 35 · ${last["<35"]} %`);

    // valor inicial <35
    const first = data[0];
    svg.append("text")
      .attr("x", x(first.year)).attr("y", y(first["<35"]) - 12)
      .attr("text-anchor", "start")
      .attr("fill", c.redDeep).attr("font-size", 12).attr("font-weight", 500).attr("font-family", MONO)
      .text(`${first["<35"]} %`);

    // anotación brecha
    const midIdx = Math.floor(data.length / 2);
    const mid = data[midIdx];
    const midY = (y(mid["<35"]) + y(mid["65-74"])) / 2;
    svg.append("text")
      .attr("x", x(mid.year)).attr("y", midY)
      .attr("text-anchor", "middle")
      .attr("fill", c.redDeep)
      .attr("font-size", 10).attr("font-style", "italic").attr("font-family", MONO)
      .attr("opacity", 0.85)
      .text("← brecha generacional →");

    container.replaceChildren(svg.node());
  };


  renderRatioChart();
  renderEmancipacionChart();
  renderTenenciaChart();
})();
