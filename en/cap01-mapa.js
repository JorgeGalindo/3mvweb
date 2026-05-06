/* Chapter 1 · "Why we don't build" — English version.
   Madrid map with three zoom-ins: 22 annulled PGOU-97 sectors (A),
   Operación Campamento (B), Cuatro Caminos depots (C). */

(() => {
  const root = document.querySelector("[data-cap01-mapa]");
  if (!root) return;
  if (typeof maplibregl === "undefined") {
    console.warn("[cap01] MapLibre not available");
    return;
  }

  const VISTAS = {
    "0":      { center: [-3.703, 40.430],   zoom: 10.2, pitch: 0,  bearing: 0,   title: "// Madrid · 1997 General Plan", body: "The plan that still rules." },
    "A":      { center: [-3.620, 40.430],   zoom: 10.6, pitch: 0,  bearing: 0,   title: "// 22 annulled sectors",         body: "Supreme Court rulings · 28 Sep 2012." },
    "B":      { center: [-3.771, 40.403],   zoom: 14.0, pitch: 30, bearing: -10, title: "// Operación Campamento",        body: "211 ha · 10,700 homes · since 1989." },
    "C":      { center: [-3.7035, 40.4485], zoom: 15.5, pitch: 35, bearing: 15,  title: "// Cuatro Caminos depots",       body: "Antonio Palacios · 1919." },
    "D":      { center: [-3.700, 40.420],   zoom: 9.4,  pitch: 0,  bearing: 0,   title: "// the metropolitan ring",       body: "Eleven mayors ask for stressed-market status." },
    "E":      { center: [-3.5176, 40.3565], zoom: 13.2, pitch: 25, bearing: -8,  title: "// Rivas-Vaciamadrid",           body: "Draft General Plan · 5 Jun 2025." },
    "F":      { center: [-3.8714, 40.4732], zoom: 13.0, pitch: 25, bearing: 10,  title: "// Majadahonda",                 body: "Arroyo del Arcipreste · 20 years." },
    "cierre": { center: [-3.500, 40.300],   zoom: 5.4,  pitch: 0,  bearing: 0,   title: "// Spain",                       body: "Cases all across the country." },
  };

  const COLORS = {
    paper: "#F4EFE2",
    paperSoft: "#FAF6ED",
    paperDeep: "#ECE5D2",
    rule: "#D9D2C0",
    ink: "#1A1C24",
    inkSoft: "#535868",
    inkMute: "#8A8E9C",
    red: "#C13027",
    redPastel: "#F5C6BF",
    green: "#2F8A6B",
  };

  const style = {
    version: 8,
    name: "tresmillones-positron",
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      openfreemap: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": COLORS.paper } },
      { id: "water", source: "openfreemap", "source-layer": "water", type: "fill", paint: { "fill-color": "#D7CFB9" } },
      { id: "landcover-park", source: "openfreemap", "source-layer": "landcover", type: "fill", filter: ["in", "class", "wood", "grass", "park"], paint: { "fill-color": "#E8DFC7", "fill-opacity": 0.55 } },
      { id: "roads-minor", source: "openfreemap", "source-layer": "transportation", type: "line", filter: ["in", "class", "minor", "service", "track"], minzoom: 12, paint: { "line-color": COLORS.paperDeep, "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.4, 18, 1.4] } },
      { id: "roads-secondary", source: "openfreemap", "source-layer": "transportation", type: "line", filter: ["in", "class", "secondary", "tertiary"], paint: { "line-color": "#C9C0A8", "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.4, 16, 1.6] } },
      { id: "roads-primary", source: "openfreemap", "source-layer": "transportation", type: "line", filter: ["in", "class", "primary", "trunk", "motorway"], paint: { "line-color": "#B5AB91", "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.6, 16, 2.4] } },
      { id: "buildings", source: "openfreemap", "source-layer": "building", type: "fill", minzoom: 13, paint: { "fill-color": "#E2D9C2", "fill-outline-color": "#CFC5AB", "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 0.7] } },
      { id: "boundary", source: "openfreemap", "source-layer": "boundary", type: "line", filter: ["<=", "admin_level", 6], paint: { "line-color": COLORS.rule, "line-width": 0.6, "line-dasharray": [2, 2] } },
      { id: "place-major", source: "openfreemap", "source-layer": "place", type: "symbol", filter: ["in", "class", "city", "town"], layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 8, 11, 14, 14], "text-letter-spacing": 0.06, "text-transform": "uppercase" }, paint: { "text-color": COLORS.ink, "text-halo-color": COLORS.paperSoft, "text-halo-width": 1.4 } },
      { id: "place-suburb", source: "openfreemap", "source-layer": "place", type: "symbol", filter: ["in", "class", "suburb", "neighbourhood", "village"], minzoom: 11, layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 10, "text-letter-spacing": 0.04 }, paint: { "text-color": COLORS.inkSoft, "text-halo-color": COLORS.paperSoft, "text-halo-width": 1.2 } },
    ],
  };

  const map = new maplibregl.Map({
    container: "cap01-map",
    style,
    center: VISTAS["0"].center,
    zoom: VISTAS["0"].zoom,
    minZoom: 8,
    maxZoom: 17,
    attributionControl: false,
    cooperativeGestures: true,
  });

  map.addControl(
    new maplibregl.AttributionControl({
      compact: true,
      customAttribution: "© OpenFreeMap · OpenMapTiles · OpenStreetMap",
    }),
    "bottom-right"
  );

  map.on("load", async () => {
    try {
      const res = await fetch("../data/madrid-sectores.geojson");
      const sectores = await res.json();
      map.addSource("sectores", { type: "geojson", data: sectores });
      map.addLayer({ id: "sectores-fill", type: "fill", source: "sectores", paint: { "fill-color": COLORS.red, "fill-opacity": 0.18 } });
      map.addLayer({ id: "sectores-line", type: "line", source: "sectores", paint: { "line-color": COLORS.red, "line-width": 1.2, "line-dasharray": [3, 2] } });
    } catch (err) {
      console.warn("[cap01] could not load madrid-sectores.geojson", err);
    }

    addPin([-3.771, 40.403],   "B", "Operación Campamento");
    addPin([-3.7035, 40.4485], "C", "Cuatro Caminos depots");
    addPin([-3.5176, 40.3565], "E", "Rivas-Vaciamadrid");
    addPin([-3.8714, 40.4732], "F", "Majadahonda");
    addPin([-8.395,  43.371],  "G", "A Coruña · O Castrillón");
    addPin([-0.887,  41.649],  "H", "Zaragoza · barrio Jesús");
    addPin([-5.984,  37.388],  "I", "Sevilla · Cortijo del Cuarto");
    addPin([-0.376,  39.470],  "J", "Valencia · barracks");
    addPin([ 2.270,  41.474],  "K", "Tiana · Barcelona");
    addPin([ 2.502,  39.564],  "L", "Calvià · Mallorca");
  });

  function addPin(lngLat, label, title) {
    const el = document.createElement("div");
    el.className = "cap01-pin";
    el.dataset.label = label;
    el.title = title;
    if (["G", "H", "I", "J", "K", "L"].includes(label)) el.classList.add("is-hidden");
    new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(lngLat).addTo(map);
  }

  function setHighlight(step) {
    if (map.getLayer("sectores-fill")) {
      const filterCampamento = ["==", ["get", "id"], "campamento"];
      if (step === "B") {
        map.setPaintProperty("sectores-fill", "fill-opacity", ["case", filterCampamento, 0.45, 0.05]);
        map.setPaintProperty("sectores-line", "line-width",   ["case", filterCampamento, 2.0,  0.6 ]);
      } else if (step === "A") {
        map.setPaintProperty("sectores-fill", "fill-opacity", 0.28);
        map.setPaintProperty("sectores-line", "line-width",   1.4);
      } else if (step === "C" || step === "E" || step === "F") {
        map.setPaintProperty("sectores-fill", "fill-opacity", 0.06);
        map.setPaintProperty("sectores-line", "line-width",   0.5);
      } else {
        map.setPaintProperty("sectores-fill", "fill-opacity", 0.18);
        map.setPaintProperty("sectores-line", "line-width",   1.2);
      }
    }
    const madrid = ["B", "C", "E", "F"];
    const nacional = ["G", "H", "I", "J", "K", "L"];
    madrid.forEach((lbl) => {
      const pin = document.querySelector(`.cap01-pin[data-label='${lbl}']`);
      if (!pin) return;
      pin.classList.toggle("is-active", step === lbl);
      pin.classList.toggle("is-hidden", step === "cierre");
    });
    nacional.forEach((lbl) => {
      const pin = document.querySelector(`.cap01-pin[data-label='${lbl}']`);
      if (!pin) return;
      pin.classList.toggle("is-hidden", step !== "cierre");
      pin.classList.toggle("is-active", step === "cierre");
    });
  }

  function setStep(step) {
    const v = VISTAS[step] || VISTAS["0"];
    map.flyTo({ center: v.center, zoom: v.zoom, pitch: v.pitch, bearing: v.bearing, duration: 1100, curve: 1.4, essential: true });
    const legend = document.querySelector("[data-cap01-legend]");
    if (legend) {
      legend.dataset.step = step;
      const t = legend.querySelector("[data-legend-title]");
      const b = legend.querySelector("[data-legend-body]");
      if (t) t.textContent = v.title;
      if (b) b.textContent = v.body;
    }
    setHighlight(step);
  }

  const steps = Array.from(document.querySelectorAll(".cap01-step"));
  let currentStep = "0";

  function activate(s, el) {
    if (!s || s === currentStep) return;
    currentStep = s;
    steps.forEach((it) => it.classList.toggle("is-active", it === el));
    setStep(s);
  }

  if (steps.length && "IntersectionObserver" in window) {
    const enterIO = new IntersectionObserver(
      (entries) => {
        const incoming = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        for (const e of incoming) activate(e.target.dataset.step, e.target);
      },
      { rootMargin: "-60% 0px -10% 0px", threshold: 0 }
    );
    steps.forEach((s) => enterIO.observe(s));

    const upIO = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);
        for (const e of visible) activate(e.target.dataset.step, e.target);
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 }
    );
    steps.forEach((s) => upIO.observe(s));
  }
})();
