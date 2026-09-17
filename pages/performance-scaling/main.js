import { svgEl, linePath, formatNumber } from "../../assets/js/common.js";
import { loadPerformanceSeries } from "../../assets/js/performance-series.js";

const svg = document.querySelector("#chart");
const detail = document.querySelector("#detail");

function render(series) {
  const { cases } = series;
  const left = 105;
  const right = 842;
  const top = 50;
  const bottom = 440;
  const x = index => left + index * ((right - left) / 3);
  const minLog = Math.log10(0.04);
  const maxLog = Math.log10(25);
  const y = seconds => bottom - ((Math.log10(seconds) - minLog) / (maxLog - minLog)) * (bottom - top);
  const ideal = cases.slice(1).map((item, offset) => ({ ...item, idealTime: cases[1].stepTimeMedian * (8 ** offset) }));

  for (const value of [0.05, 0.2, 1, 5, 20]) {
    svg.append(svgEl("line", { x1: left, y1: y(value), x2: right, y2: y(value), class: "gridline" }));
    svg.append(svgEl("text", { x: left - 18, y: y(value) + 6, "text-anchor": "end", class: "tick" }, `${value} s`));
  }
  svg.append(svgEl("line", { x1: left, y1: top, x2: left, y2: bottom, class: "axis" }));
  svg.append(svgEl("line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "axis" }));
  svg.append(svgEl("text", { x: 25, y: 250, transform: "rotate(-90 25 250)", "text-anchor": "middle", class: "label" }, "Median timestep (log scale)"));
  svg.append(svgEl("path", { d: linePath(cases.map((item, index) => [index, item.stepTimeMedian]), x, y), class: "measured" }));
  svg.append(svgEl("path", { d: linePath(ideal.map((item, index) => [index + 1, item.idealTime]), x, y), class: "ideal" }));

  svg.append(svgEl("text", { x: (x(1) + x(2)) / 2, y: y(Math.sqrt(cases[1].stepTimeMedian * cases[2].stepTimeMedian)) - 18, "text-anchor": "middle", class: "ratio" }, "7.90×"));
  svg.append(svgEl("text", { x: (x(2) + x(3)) / 2, y: y(Math.sqrt(cases[2].stepTimeMedian * cases[3].stepTimeMedian)) - 18, "text-anchor": "middle", class: "ratio" }, "8.50×"));

  cases.forEach((item, index) => {
    const mark = svgEl("g", { class: "mark", tabindex: "0", role: "button", "aria-label": `${item.id}: median timestep ${item.stepTimeMedian.toFixed(3)} seconds` });
    mark.append(svgEl("circle", { cx: x(index), cy: y(item.stepTimeMedian), r: index === 0 ? 10 : 13, class: `point${index === 0 ? " context-point" : ""}` }));
    mark.append(svgEl("text", { x: x(index), y: bottom + 36, "text-anchor": "middle", class: "case-label" }, item.id));
    mark.append(svgEl("title", {}, `${item.id} · ${formatNumber(item.nodes, 0)} nodes · ${item.stepTimeMedian.toFixed(4)} s median`));
    const show = () => {
      const emphasis = index === 0 ? " · context case; GPU not fully occupied" : " · included in scaling comparison";
      detail.innerHTML = `<strong>${item.id}</strong> · ${item.grid.join(" × ")} · ${formatNumber(item.nodes, 0)} nodes<br>Median timestep <strong>${item.stepTimeMedian.toFixed(4)} s</strong>${emphasis}`;
    };
    mark.addEventListener("pointerenter", show);
    mark.addEventListener("focus", show);
    svg.append(mark);
  });
}

loadPerformanceSeries().then(render).catch(error => {
  detail.textContent = error.message;
});
