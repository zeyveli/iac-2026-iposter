import { makeSvg, setPressed, svgEl } from "../../assets/js/common.js";

const grid = Object.freeze({ x: 16, y: 12, z: 8 });

export function describeBatch(direction) {
  if (!Object.hasOwn(grid, direction)) throw new Error(`Unknown grid direction: ${direction}`);
  const varyingAxes = ["x", "y", "z"].filter(axis => axis !== direction);
  const systemFactors = varyingAxes.map(axis => grid[axis]);
  return {
    direction,
    lineLength: grid[direction],
    systems: systemFactors[0] * systemFactors[1],
    systemFactors,
    varyingAxes
  };
}

export const gpuParallelismNote = "GPU parallelism is across independent line systems, not within a single line system. Each compact line is solved directly as one tridiagonal system.";

const dirColor = { x: "#245eb6", y: "#a84d1c", z: "#1572a1" };

function drawBatch(container, batch) {
  const svg = makeSvg(container, `Batched ${batch.direction}-direction line systems`, "0 0 900 430");
  svg.append(svgEl("rect", { x: 8, y: 12, width: 420, height: 394, rx: 20, class: "svg-panel" }));
  svg.append(svgEl("rect", { x: 452, y: 12, width: 440, height: 394, rx: 20, class: "svg-panel" }));
  svg.append(svgEl("text", { x: 34, y: 52, class: "svg-label" }, "Structured grid: selected line family"));
  svg.append(svgEl("text", { x: 478, y: 52, class: "svg-label" }, "Independent systems → GPU batch"));

  const color = dirColor[batch.direction];
  const axes = batch.varyingAxes.join("–");
  svg.append(svgEl("text", { x: 34, y: 80, class: "svg-small" }, `${batch.systems.toLocaleString()} lines span the ${axes} cross-section`));
  const gx = 60, gy = 115, cols = 11, rows = 8, dx = 29, dy = 25;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      svg.append(svgEl("circle", { cx: gx + c * dx, cy: gy + r * dy, r: 4, fill: "#b9c6d7" }));
    }
  }
  for (let k = 0; k < 4; k++) {
    const offset = k * 48;
    if (batch.direction === "x") svg.append(svgEl("line", { x1: gx, y1: gy + 13 + offset, x2: gx + (cols - 1) * dx, y2: gy + 13 + offset, stroke: color, "stroke-width": 7, "stroke-linecap": "round" }));
    if (batch.direction === "y") svg.append(svgEl("line", { x1: gx + 16 + k * 78, y1: gy, x2: gx + 16 + k * 78, y2: gy + (rows - 1) * dy, stroke: color, "stroke-width": 7, "stroke-linecap": "round" }));
    if (batch.direction === "z") svg.append(svgEl("line", { x1: gx + 22, y1: gy + 12 + offset, x2: gx + 255, y2: gy + 55 + offset, stroke: color, "stroke-width": 7, "stroke-linecap": "round" }));
  }
  svg.append(svgEl("text", { x: 34, y: 350, class: "svg-small" }, `One highlighted stroke = one length-${batch.lineLength} tridiagonal solve`));
  svg.append(svgEl("text", { x: 34, y: 377, class: "svg-small" }, "The other cross-section coordinates label independent systems."));

  const cardPositions = [[490, 100], [634, 100], [778, 100], [490, 225], [634, 225], [778, 225]];
  cardPositions.forEach(([x, y], index) => {
    svg.append(svgEl("rect", { x, y, width: 108, height: 86, rx: 12, fill: index === 1 ? "#eaf2fb" : "#f7f8f6", stroke: color, "stroke-width": 2 }));
    for (let n = 0; n < 6; n++) svg.append(svgEl("circle", { cx: x + 18 + n * 14, cy: y + 37, r: 5, fill: color }));
    svg.append(svgEl("text", { x: x + 14, y: y + 68, class: "svg-small" }, `line ${index + 1}`));
  });
  svg.append(svgEl("text", { x: 478, y: 345, class: "svg-small" }, `… ${batch.systems.toLocaleString()} direct line solves in one batched launch`));
  svg.append(svgEl("text", { x: 478, y: 377, class: "svg-small" }, "shared factorization · independent right-hand sides"));
}

function drawMemory(container, batch) {
  const svg = makeSvg(container, `Coalesced ${batch.direction}-direction memory access`, "0 0 560 160");
  const color = dirColor[batch.direction];
  svg.append(svgEl("text", { x: 12, y: 28, class: "svg-small" }, `Thread group reads adjacent ${batch.direction}-pass entries`));
  for (let i = 0; i < 12; i++) {
    const x = 14 + i * 43;
    svg.append(svgEl("rect", { x, y: 52, width: 34, height: 34, rx: 6, fill: i % 3 === 0 ? color : "#eaf2fb" }));
    svg.append(svgEl("text", { x: x + 9, y: 75, fill: i % 3 === 0 ? "#fff" : "#173b8f", "font-size": 14 }, String(i)));
  }
  svg.append(svgEl("path", { d: "M32 115 H500", stroke: color, "stroke-width": 4, "stroke-linecap": "round" }));
  svg.append(svgEl("path", { d: "M500 115 l-12 -8 M500 115 l-12 8", stroke: color, "stroke-width": 4, fill: "none", "stroke-linecap": "round" }));
  svg.append(svgEl("text", { x: 14, y: 148, class: "svg-small" }, "contiguous addresses for a coalesced warp transaction"));
}

function render(direction) {
  const batch = describeBatch(direction);
  document.querySelector("#batch-equation").textContent = `${batch.systemFactors[0]} × ${batch.systemFactors[1]} = ${batch.systems.toLocaleString()} independent systems; ${batch.lineLength} unknowns per ${batch.direction}-line.`;
  document.querySelector("#batch-caption").textContent = `Demo grid: ${grid.x} × ${grid.y} × ${grid.z}. Selecting ${batch.direction} fixes the two transverse coordinates, producing ${batch.systems.toLocaleString()} independent line systems.`;
  document.querySelector("#batch-metrics").replaceChildren(
    metric("line length", String(batch.lineLength)),
    metric("batch systems", batch.systems.toLocaleString()),
    metric("reused", "LHS factors")
  );
  document.querySelector("#parallelism-note").textContent = gpuParallelismNote;
  drawBatch(document.querySelector("#batch-graphic"), batch);
  drawMemory(document.querySelector("#memory-graphic"), batch);
}

function metric(label, value) {
  const cell = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = value;
  cell.append(strong, document.createTextNode(label));
  return cell;
}

if (typeof document !== "undefined") {
  const buttons = [...document.querySelectorAll("[data-direction]")];
  buttons.forEach(button => button.addEventListener("click", () => {
    setPressed(buttons, button);
    render(button.dataset.direction);
  }));
  render("x");
}
