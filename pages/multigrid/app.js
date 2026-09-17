import { makeSvg, setPressed, svgEl } from "../../assets/js/common.js";

export const operatorStages = Object.freeze([
  { symbol: "φ", title: "Cell-centred pressure correction", detail: "Start with the pressure-correction potential at cell centres. No coefficient matrix is assembled or stored." },
  { symbol: "Gₕφ", title: "Compact gradient at face-normal locations", detail: "Apply the compact discrete gradient to obtain the face-normal correction used by the half-staggered projection." },
  { symbol: "DₕGₕφ", title: "Compact pressure operator action", detail: "Apply the discrete divergence to the gradient result. This evaluates DₕGₕφ without assembling a global matrix." }
]);

export const multigridConfig = Object.freeze({
  preconditioner: "second-order seven-point Laplacian",
  cycle: "W-cycle",
  smoother: "wall-normal line relaxation",
  reuse: "batched tridiagonal line-solve infrastructure reused on every level"
});

function stageNode(svg, x, stage, active, index) {
  const fill = active ? "#f45c8b" : "#eaf2fb";
  const textFill = active ? "#fff" : "#173b8f";
  svg.append(svgEl("rect", { x, y: 160, width: 188, height: 112, rx: 17, fill, stroke: "#173b8f", "stroke-width": active ? 4 : 2 }));
  svg.append(svgEl("text", { x: x + 18, y: 201, fill: textFill, "font-size": 32, "font-weight": 750 }, stage.symbol));
  svg.append(svgEl("text", { x: x + 18, y: 235, fill: textFill, "font-size": 15 }, `stage ${index + 1}`));
}

function drawOperator(container, activeIndex) {
  const svg = makeSvg(container, "Interactive matrix-free pressure operator pathway", "0 0 720 390");
  svg.append(svgEl("text", { x: 24, y: 45, class: "svg-label" }, "Compact pressure operator applied on demand"));
  svg.append(svgEl("text", { x: 24, y: 75, class: "svg-small" }, "BiCGSTAB requests the action; no global sparse matrix is assembled."));
  const xs = [34, 266, 498];
  operatorStages.forEach((stage, index) => {
    stageNode(svg, xs[index], stage, index === activeIndex, index);
    if (index < 2) {
      const color = index < activeIndex ? "#f45c8b" : "#9aa8b9";
      svg.append(svgEl("path", { d: `M${xs[index] + 194} 216 H${xs[index + 1] - 12}`, stroke: color, "stroke-width": 7, "stroke-linecap": "round" }));
      svg.append(svgEl("path", { d: `M${xs[index + 1] - 12} 216 l-14 -10 M${xs[index + 1] - 12} 216 l-14 10`, stroke: color, "stroke-width": 7, fill: "none", "stroke-linecap": "round" }));
      svg.append(svgEl("text", { x: xs[index] + 197, y: 190, class: "svg-small" }, index === 0 ? "compact Gₕ" : "compact Dₕ"));
    }
  });
  const prompt = activeIndex === 0 ? "select a stage" : "operator action continues";
  svg.append(svgEl("text", { x: 24, y: 338, class: "svg-small" }, prompt));
  svg.append(svgEl("text", { x: 24, y: 366, class: "svg-small" }, "The final field drives the pressure-correction residual in the Krylov iteration."));
}

function gridLevel(svg, x, y, cell, label) {
  const n = 4;
  svg.append(svgEl("text", { x, y: y - 12, class: "svg-small" }, label));
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      svg.append(svgEl("rect", { x: x + col * cell, y: y + row * cell, width: cell - 2, height: cell - 2, fill: (row + col) % 2 ? "#eaf2fb" : "#fff", stroke: "#245eb6", "stroke-width": 1 }));
    }
  }
}

function drawHierarchy(container) {
  const svg = makeSvg(container, "Four-level geometric multigrid W-cycle", "0 0 900 430");
  svg.append(svgEl("text", { x: 22, y: 38, class: "svg-label" }, "Geometric coarsening with a W-cycle"));
  svg.append(svgEl("text", { x: 22, y: 67, class: "svg-small" }, "full weighting ↓ · linear prolongation ↑ · wall-normal line relaxation at each level"));
  const levels = [
    { x: 55, y: 125, cell: 27, label: "fine grid" },
    { x: 260, y: 175, cell: 20, label: "level 2" },
    { x: 450, y: 230, cell: 14, label: "level 3" },
    { x: 630, y: 280, cell: 10, label: "coarse solve" }
  ];
  levels.forEach(level => gridLevel(svg, level.x, level.y, level.cell, level.label));
  const path = "M165 175 C205 175 210 225 260 225 S400 280 450 280 S585 330 630 330 M630 330 C585 330 575 298 450 280 C400 262 382 245 260 225 C210 205 205 175 165 175 M260 225 C300 245 330 275 450 280 C500 290 535 316 630 330";
  svg.append(svgEl("path", { d: path, fill: "none", stroke: "#f45c8b", "stroke-width": 5, "stroke-linecap": "round" }));
  svg.append(svgEl("text", { x: 710, y: 160, class: "svg-small" }, "W-cycle"));
  svg.append(svgEl("text", { x: 710, y: 189, class: "svg-small" }, "revisits coarse"));
  svg.append(svgEl("text", { x: 710, y: 216, class: "svg-small" }, "levels before"));
  svg.append(svgEl("text", { x: 710, y: 243, class: "svg-small" }, "returning fine"));
  svg.append(svgEl("rect", { x: 52, y: 365, width: 796, height: 42, rx: 12, fill: "#f9d0e4" }));
  svg.append(svgEl("text", { x: 72, y: 392, fill: "#182239", "font-size": 16 }, "Second-order seven-point Laplacian preconditioner · batched tridiagonal wall-normal relaxation reused"));
}

function renderStage(index) {
  const stage = operatorStages[index];
  const copy = document.querySelector("#operator-copy");
  copy.replaceChildren();
  const symbol = document.createElement("strong");
  symbol.textContent = `${stage.symbol} — ${stage.title}`;
  const detail = document.createElement("p");
  detail.textContent = stage.detail;
  copy.append(symbol, detail);
  drawOperator(document.querySelector("#operator-graphic"), index);
}

if (typeof document !== "undefined") {
  const buttons = [...document.querySelectorAll("[data-stage]")];
  buttons.forEach(button => button.addEventListener("click", () => {
    setPressed(buttons, button);
    renderStage(Number(button.dataset.stage));
  }));
  renderStage(0);
  drawHierarchy(document.querySelector("#hierarchy-graphic"));
}
