import { makeSvg, svgEl, linePath, formatNumber, setPressed } from "../../assets/js/common.js";
import { validationErrors } from "../../assets/js/data.js";
import { parseCsv, buildIntegralSeries } from "../../assets/js/validation-series.js";

const chart = document.querySelector("#integral-chart");
const tooltip = document.querySelector("#integral-tooltip");
const status = document.querySelector("#integral-status");
const metricButtons = [...document.querySelectorAll("[data-metric]")];
const errorCards = [...document.querySelectorAll("[data-error-card]")];
let dataset;
let activeMetric = "deltaStar";

function scale(domainMin, domainMax, rangeMin, rangeMax) {
  return value => rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
}

function formatAxis(value, range) {
  if (range < .01) return value.toExponential(2);
  return formatNumber(value, range < 1 ? 4 : 3);
}

function addText(svg, x, y, text, attrs = {}) {
  svg.append(svgEl("text", { x, y, fill: "#596579", "font-size": 14, ...attrs }, text));
}

function render() {
  const metric = dataset.metrics.find(item => item.id === activeMetric);
  const svg = makeSvg(chart, `${metric.label} along the plate`, "0 0 900 540");
  const bounds = { left: 100, right: 34, top: 28, bottom: 70 };
  const width = 900 - bounds.left - bounds.right;
  const height = 540 - bounds.top - bounds.bottom;
  const allValues = [...metric.numerical, ...metric.analytical];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const padding = Math.max((rawMax - rawMin) * .16, Math.abs(rawMax || 1) * .0002);
  const yMin = rawMin - padding;
  const yMax = rawMax + padding;
  const x = scale(0, 1.45, bounds.left, bounds.left + width);
  const y = scale(yMin, yMax, bounds.top + height, bounds.top);

  for (const tick of [0, .25, .5, .75, 1, 1.25]) {
    svg.append(svgEl("line", { x1: x(tick), y1: bounds.top, x2: x(tick), y2: bounds.top + height, stroke: "#e4e8ee" }));
    addText(svg, x(tick), bounds.top + height + 28, formatNumber(tick, 2), { "text-anchor": "middle" });
  }
  for (let index = 0; index <= 5; index += 1) {
    const value = yMin + ((yMax - yMin) * index) / 5;
    svg.append(svgEl("line", { x1: bounds.left, y1: y(value), x2: bounds.left + width, y2: y(value), stroke: "#e4e8ee" }));
    addText(svg, bounds.left - 14, y(value) + 5, formatAxis(value, yMax - yMin), { "text-anchor": "end" });
  }
  svg.append(svgEl("line", { x1: bounds.left, y1: bounds.top + height, x2: bounds.left + width, y2: bounds.top + height, stroke: "#182239", "stroke-width": 2 }));
  svg.append(svgEl("line", { x1: bounds.left, y1: bounds.top, x2: bounds.left, y2: bounds.top + height, stroke: "#182239", "stroke-width": 2 }));
  addText(svg, bounds.left + width / 2, 528, "Streamwise location x", { "text-anchor": "middle", fill: "#182239", "font-size": 17, "font-weight": 700 });
  addText(svg, 24, bounds.top + height / 2, metric.symbol, { "text-anchor": "middle", fill: "#182239", "font-size": 17, "font-weight": 700, transform: `rotate(-90 24 ${bounds.top + height / 2})` });

  svg.append(svgEl("path", {
    d: linePath(dataset.x.map((value, index) => [value, metric.analytical[index]]), x, y),
    fill: "none", stroke: "#1f2937", "stroke-width": 4, "stroke-dasharray": "8 7", "stroke-linecap": "round", "stroke-linejoin": "round"
  }));
  svg.append(svgEl("path", {
    d: linePath(dataset.x.map((value, index) => [value, metric.numerical[index]]), x, y),
    fill: "none", stroke: "#1572a1", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round"
  }));
  dataset.x.forEach((value, index) => svg.append(svgEl("circle", {
    cx: x(value), cy: y(metric.numerical[index]), r: 5, fill: "white", stroke: "#1572a1", "stroke-width": 3
  })));

  const hitArea = svgEl("rect", { x: bounds.left, y: bounds.top, width, height, fill: "transparent", tabindex: "0", "aria-label": "Inspect streamwise values" });
  const marker = svgEl("line", { y1: bounds.top, y2: bounds.top + height, stroke: "#a84d1c", "stroke-width": 2, visibility: "hidden", "pointer-events": "none" });
  svg.append(hitArea, marker);
  hitArea.addEventListener("pointermove", event => {
    const rect = svg.getBoundingClientRect();
    const pointerX = ((event.clientX - rect.left) / rect.width) * 900;
    const closestIndex = dataset.x.reduce((best, value, index) => Math.abs(x(value) - pointerX) < Math.abs(x(dataset.x[best]) - pointerX) ? index : best, 0);
    marker.setAttribute("x1", x(dataset.x[closestIndex]));
    marker.setAttribute("x2", x(dataset.x[closestIndex]));
    marker.setAttribute("visibility", "visible");
    tooltip.hidden = false;
    tooltip.style.left = `${(x(dataset.x[closestIndex]) / 900) * 100}%`;
    tooltip.style.top = `${(y(metric.numerical[closestIndex]) / 540) * 100}%`;
    tooltip.innerHTML = `<strong>x ${formatNumber(dataset.x[closestIndex], 3)}</strong><br>Numerical: ${formatNumber(metric.numerical[closestIndex], 6)}<br>Blasius: ${formatNumber(metric.analytical[closestIndex], 6)}`;
  });
  hitArea.addEventListener("pointerleave", () => { tooltip.hidden = true; marker.setAttribute("visibility", "hidden"); });

  errorCards.forEach(card => card.dataset.active = String(card.dataset.errorCard === activeMetric));
  status.textContent = `978 streamwise stations · manuscript maximum error ${validationErrors[activeMetric].toFixed(5)}%`;
}

function selectMetric(button) {
  activeMetric = button.dataset.metric;
  setPressed(metricButtons, button);
  tooltip.hidden = true;
  render();
}

async function start() {
  try {
    const response = await fetch("../../data/CFD/base_qualification.csv");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    dataset = buildIntegralSeries(parseCsv(await response.text()));
    metricButtons.forEach(button => button.addEventListener("click", () => selectMetric(button)));
    render();
  } catch (error) {
    status.textContent = `Validation data could not be loaded (${error.message}).`;
  }
}

start();
