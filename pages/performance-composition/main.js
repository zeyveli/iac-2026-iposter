import { svgEl } from "../../assets/js/common.js";
import { loadPerformanceSeries } from "../../assets/js/performance-series.js";

const svg = document.querySelector("#chart");
const detail = document.querySelector("#detail");

function render(series) {
  const { cases } = series;
  const left = 115;
  const right = 842;
  const top = 72;
  const rowGap = 96;
  const barHeight = 52;
  const x = percent => left + (percent / 100) * (right - left);

  for (const value of [0, 25, 50, 75, 100]) {
    svg.append(svgEl("line", { x1: x(value), y1: top - 18, x2: x(value), y2: top + rowGap * 3 + barHeight + 14, class: "gridline" }));
    svg.append(svgEl("text", { x: x(value), y: top + rowGap * 3 + barHeight + 46, "text-anchor": "middle", class: "tick" }, `${value}%`));
  }

  cases.forEach((item, index) => {
    const y = top + index * rowGap;
    svg.append(svgEl("text", { x: left - 22, y: y + 34, "text-anchor": "end", class: "case-label" }, item.id));

    const poisson = svgEl("rect", {
      x: left,
      y,
      width: x(item.poissonShare) - left,
      height: barHeight,
      rx: 9,
      class: "poisson segment",
      tabindex: "0",
      role: "button",
      "aria-label": `${item.id} pressure-Poisson share ${item.poissonShare.toFixed(1)} percent`
    });
    const other = svgEl("rect", {
      x: x(item.poissonShare),
      y,
      width: right - x(item.poissonShare),
      height: barHeight,
      rx: 9,
      class: "other segment",
      tabindex: "0",
      role: "button",
      "aria-label": `${item.id} remaining work share ${item.otherShare.toFixed(1)} percent`
    });

    const showPoisson = () => {
      detail.innerHTML = `<strong>${item.id} · Pressure-Poisson</strong><br>${item.poissonShare.toFixed(1)}% aggregate share · ${item.poissonTimeMedian.toFixed(4)} s median pressure time`;
    };
    const showOther = () => {
      detail.innerHTML = `<strong>${item.id} · Remaining work</strong><br>${item.otherShare.toFixed(1)}% aggregate share · includes momentum, compact operators, and all other operations`;
    };
    poisson.addEventListener("pointerenter", showPoisson);
    poisson.addEventListener("focus", showPoisson);
    other.addEventListener("pointerenter", showOther);
    other.addEventListener("focus", showOther);
    poisson.append(svgEl("title", {}, `${item.id}: pressure-Poisson ${item.poissonShare.toFixed(1)}%`));
    other.append(svgEl("title", {}, `${item.id}: remaining work ${item.otherShare.toFixed(1)}%`));
    svg.append(poisson, other);
    svg.append(svgEl("text", { x: (left + x(item.poissonShare)) / 2, y: y + 33, "text-anchor": "middle", class: "inside" }, `${item.poissonShare.toFixed(1)}%`));
  });
}

loadPerformanceSeries().then(render).catch(error => {
  detail.textContent = error.message;
});
