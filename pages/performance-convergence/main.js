import { svgEl, linePath, formatNumber } from "../../assets/js/common.js";
import { loadPerformanceSeries } from "../../assets/js/performance-series.js";

const svg = document.querySelector("#chart");
const detail = document.querySelector("#detail");

function render(series) {
  const { cases } = series;
  const left = 105;
  const right = 842;
  const top = 55;
  const bottom = 440;
  const minLog = Math.log10(cases[0].nodes);
  const maxLog = Math.log10(cases.at(-1).nodes);
  const x = nodes => left + ((Math.log10(nodes) - minLog) / (maxLog - minLog)) * (right - left);
  const y = iterations => bottom - ((iterations - 5) / 6) * (bottom - top);

  for (const value of [6, 7, 8, 9, 10]) {
    svg.append(svgEl("line", { x1: left, y1: y(value), x2: right, y2: y(value), class: "gridline" }));
    svg.append(svgEl("text", { x: left - 18, y: y(value) + 6, "text-anchor": "end", class: "tick" }, String(value)));
  }
  svg.append(svgEl("line", { x1: left, y1: top, x2: left, y2: bottom, class: "axis" }));
  svg.append(svgEl("line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "axis" }));
  svg.append(svgEl("text", { x: 24, y: 258, transform: "rotate(-90 24 258)", "text-anchor": "middle", class: "label" }, "BiCGSTAB iterations"));
  svg.append(svgEl("text", { x: 474, y: 523, "text-anchor": "middle", class: "label" }, "Total nodes (log scale)"));
  svg.append(svgEl("path", { d: linePath(cases.map(item => [item.nodes, item.meanIterations]), x, y), class: "series" }));

  for (const item of cases) {
    const px = x(item.nodes);
    const [minimum, maximum] = item.iterationRange;
    svg.append(svgEl("line", { x1: px, y1: y(minimum), x2: px, y2: y(maximum), class: "range" }));
    svg.append(svgEl("line", { x1: px - 10, y1: y(minimum), x2: px + 10, y2: y(minimum), class: "cap" }));
    svg.append(svgEl("line", { x1: px - 10, y1: y(maximum), x2: px + 10, y2: y(maximum), class: "cap" }));

    const mark = svgEl("g", { class: "mark", tabindex: "0", role: "button", "aria-label": `${item.id}: mean ${item.meanIterations.toFixed(2)} iterations, range ${minimum} to ${maximum}` });
    mark.append(svgEl("circle", { cx: px, cy: y(item.meanIterations), r: 12, class: "point" }));
    mark.append(svgEl("text", { x: px, y: bottom + 34, "text-anchor": "middle", class: "case-label" }, item.id));
    mark.append(svgEl("title", {}, `${item.id} · ${item.grid.join(" × ")} · ${formatNumber(item.nodes, 0)} nodes · mean ${item.meanIterations.toFixed(2)} · range ${minimum}–${maximum}`));

    const show = () => {
      detail.innerHTML = `<strong>${item.id}</strong> · ${item.grid.join(" × ")} · ${formatNumber(item.nodes, 0)} nodes<br>Mean <strong>${item.meanIterations.toFixed(2)}</strong> iterations · observed range <strong>${minimum}–${maximum}</strong>`;
    };
    mark.addEventListener("pointerenter", show);
    mark.addEventListener("focus", show);
    svg.append(mark);
  }
}

loadPerformanceSeries().then(render).catch(error => {
  detail.textContent = error.message;
});
