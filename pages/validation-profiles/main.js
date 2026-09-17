import { makeSvg, svgEl, linePath, formatNumber } from "../../assets/js/common.js";
import { parseCsv, buildProfileSeries } from "../../assets/js/validation-series.js";

const chart = document.querySelector("#profile-chart");
const tooltip = document.querySelector("#profile-tooltip");
const status = document.querySelector("#profile-status");
const stationControls = document.querySelector("#station-controls");
const curveButtons = [...document.querySelectorAll("[data-curve]")];
const visible = new Set(["numerical", "analytical"]);
let stations = [];
let activeStation = 0;

function scale(domainMin, domainMax, rangeMin, rangeMax) {
  return value => rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
}

function addText(svg, x, y, text, attrs = {}) {
  svg.append(svgEl("text", { x, y, fill: "#596579", "font-size": 14, ...attrs }, text));
}

function render() {
  const station = stations[activeStation];
  const svg = makeSvg(chart, `Blasius similarity profile at x equals ${station.xStation.toFixed(3)}`, "0 0 900 560");
  const bounds = { left: 82, right: 32, top: 24, bottom: 68 };
  const width = 900 - bounds.left - bounds.right;
  const height = 560 - bounds.top - bounds.bottom;
  const x = scale(0, 1.04, bounds.left, bounds.left + width);
  const y = scale(0, 12, bounds.top + height, bounds.top);

  for (const tick of [0, .2, .4, .6, .8, 1]) {
    svg.append(svgEl("line", { x1: x(tick), y1: bounds.top, x2: x(tick), y2: bounds.top + height, stroke: "#e4e8ee" }));
    addText(svg, x(tick), bounds.top + height + 28, tick.toFixed(1), { "text-anchor": "middle" });
  }
  for (const tick of [0, 2, 4, 6, 8, 10, 12]) {
    svg.append(svgEl("line", { x1: bounds.left, y1: y(tick), x2: bounds.left + width, y2: y(tick), stroke: "#e4e8ee" }));
    addText(svg, bounds.left - 14, y(tick) + 5, tick, { "text-anchor": "end" });
  }
  svg.append(svgEl("line", { x1: bounds.left, y1: bounds.top + height, x2: bounds.left + width, y2: bounds.top + height, stroke: "#182239", "stroke-width": 2 }));
  svg.append(svgEl("line", { x1: bounds.left, y1: bounds.top, x2: bounds.left, y2: bounds.top + height, stroke: "#182239", "stroke-width": 2 }));
  addText(svg, bounds.left + width / 2, 548, "u / Uₑ", { "text-anchor": "middle", fill: "#182239", "font-size": 17, "font-weight": 700 });
  addText(svg, 22, bounds.top + height / 2, "η", { "text-anchor": "middle", fill: "#182239", "font-size": 18, "font-weight": 700, transform: `rotate(-90 22 ${bounds.top + height / 2})` });

  const points = station.eta.map((eta, index) => ({
    eta,
    numerical: station.numerical[index],
    analytical: station.analytical[index]
  }));
  const styles = {
    analytical: { stroke: "#1f2937", dash: "8 7", width: 4 },
    numerical: { stroke: "#1572a1", dash: "", width: 5 }
  };
  for (const curve of ["analytical", "numerical"]) {
    if (!visible.has(curve)) continue;
    svg.append(svgEl("path", {
      d: linePath(points.map(point => [point[curve], point.eta]), x, y),
      fill: "none",
      stroke: styles[curve].stroke,
      "stroke-width": styles[curve].width,
      "stroke-dasharray": styles[curve].dash,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }));
  }

  const hitArea = svgEl("rect", { x: bounds.left, y: bounds.top, width, height, fill: "transparent", tabindex: "0", "aria-label": "Inspect profile values" });
  const marker = svgEl("circle", { r: 7, fill: "#f45c8b", stroke: "white", "stroke-width": 3, visibility: "hidden", "pointer-events": "none" });
  svg.append(hitArea, marker);

  const inspect = event => {
    const rect = svg.getBoundingClientRect();
    const pointerY = ((event.clientY - rect.top) / rect.height) * 560;
    const closest = points.reduce((best, point) => Math.abs(y(point.eta) - pointerY) < Math.abs(y(best.eta) - pointerY) ? point : best);
    const markerValue = visible.has("numerical") ? closest.numerical : closest.analytical;
    marker.setAttribute("cx", x(markerValue));
    marker.setAttribute("cy", y(closest.eta));
    marker.setAttribute("visibility", "visible");
    tooltip.hidden = false;
    tooltip.style.left = `${(x(markerValue) / 900) * 100}%`;
    tooltip.style.top = `${(y(closest.eta) / 560) * 100}%`;
    tooltip.innerHTML = `<strong>η ${formatNumber(closest.eta, 3)}</strong><br>Numerical: ${formatNumber(closest.numerical, 5)}<br>Blasius: ${formatNumber(closest.analytical, 5)}`;
  };
  hitArea.addEventListener("pointermove", inspect);
  hitArea.addEventListener("pointerleave", () => { tooltip.hidden = true; marker.setAttribute("visibility", "hidden"); });
  status.textContent = `x = ${station.xStation.toFixed(3)} · Reₓ = ${Math.round(station.reynoldsX).toLocaleString("en-US")} · ${station.eta.length} exported samples`;
}

function setStation(index) {
  activeStation = index;
  [...stationControls.children].forEach((button, buttonIndex) => button.setAttribute("aria-pressed", String(buttonIndex === index)));
  tooltip.hidden = true;
  render();
}

async function start() {
  try {
    const response = await fetch("../../data/CFD/base_similarity_profiles.csv");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    stations = buildProfileSeries(parseCsv(await response.text()));
    stations.forEach((station, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = station.label;
      button.setAttribute("aria-pressed", String(index === 0));
      button.addEventListener("click", () => setStation(index));
      stationControls.append(button);
    });
    curveButtons.forEach(button => button.addEventListener("click", () => {
      const curve = button.dataset.curve;
      if (visible.has(curve) && visible.size === 1) return;
      visible.has(curve) ? visible.delete(curve) : visible.add(curve);
      button.setAttribute("aria-pressed", String(visible.has(curve)));
      render();
    }));
    render();
  } catch (error) {
    status.textContent = `Profile data could not be loaded (${error.message}).`;
  }
}

start();
