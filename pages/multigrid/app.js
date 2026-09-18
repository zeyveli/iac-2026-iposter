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

export const operatorDiagramCopy = Object.freeze({
  subtitle: Object.freeze([
    "BiCGSTAB requests the operator action.",
    "No global sparse matrix is assembled."
  ]),
  footer: Object.freeze([
    "The final field supplies the",
    "pressure-correction residual used by",
    "the Krylov iteration."
  ])
});

export function multigridDiagramModel() {
  return {
    levels: [
      { name: "Fine", spacing: "h" },
      { name: "Level 2", spacing: "2h" },
      { name: "Level 3", spacing: "4h" },
      { name: "Coarse", spacing: "8h" }
    ],
    visits: [0, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 0],
    subtitle: [
      "Four geometric levels · recursive W traversal",
      "Restriction ↓ · prolongation ↑",
      "Line relaxation on every level"
    ],
    explanation: [
      "Each level calls its coarse correction twice.",
      "The W pattern recurses at intermediate levels."
    ],
    badges: [
      "7-point Laplacian preconditioner",
      "Wall-normal line relaxation"
    ]
  };
}

function textLines(svg, lines, x, y, lineHeight, attrs = {}) {
  lines.forEach((line, index) => {
    svg.append(svgEl("text", { x, y: y + index * lineHeight, ...attrs }, line));
  });
}

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
  textLines(svg, operatorDiagramCopy.subtitle, 24, 73, 24, { class: "svg-small" });
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
  svg.append(svgEl("text", { x: 24, y: 323, class: "svg-small" }, prompt));
  textLines(svg, operatorDiagramCopy.footer, 24, 342, 21, { class: "svg-small" });
}

function addArrowMarker(svg) {
  const defs = svgEl("defs");
  const marker = svgEl("marker", {
    id: "w-cycle-arrow",
    viewBox: "0 0 10 10",
    refX: 8,
    refY: 5,
    markerWidth: 6,
    markerHeight: 6,
    orient: "auto-start-reverse"
  });
  marker.append(svgEl("path", { d: "M0 0 L10 5 L0 10 z", fill: "#f45c8b" }));
  defs.append(marker);
  svg.append(defs);
}

function levelBadge(svg, level, y) {
  svg.append(svgEl("rect", { x: 22, y: y - 22, width: 116, height: 42, rx: 12, fill: level.name === "Coarse" ? "#f9d0e4" : "#eaf2fb" }));
  svg.append(svgEl("text", { x: 36, y: y + 5, fill: "#173b8f", "font-size": 15, "font-weight": 700 }, level.name));
  svg.append(svgEl("text", { x: 118, y: y + 5, fill: "#596579", "font-size": 13, "text-anchor": "end" }, level.spacing));
}

function drawHierarchy(container) {
  const model = multigridDiagramModel();
  const svg = makeSvg(container, "Four-level geometric multigrid W-cycle", "0 0 900 500");
  addArrowMarker(svg);
  svg.append(svgEl("text", { x: 22, y: 38, class: "svg-label" }, "Geometric coarsening with a W-cycle"));
  textLines(svg, model.subtitle, 22, 67, 22, { class: "svg-small" });

  const rowY = [170, 230, 290, 350];
  model.levels.forEach((level, index) => {
    levelBadge(svg, level, rowY[index]);
    svg.append(svgEl("path", {
      d: `M152 ${rowY[index]} H872`,
      fill: "none",
      stroke: "#d6dce5",
      "stroke-width": 2,
      "stroke-dasharray": "7 8"
    }));
  });

  svg.append(svgEl("text", { x: 154, y: 139, fill: "#245eb6", "font-size": 14, "font-weight": 700 }, "RESTRICT + PRE-SMOOTH ↓"));
  svg.append(svgEl("text", { x: 681, y: 139, fill: "#245eb6", "font-size": 14, "font-weight": 700 }, "↑ PROLONG + POST-SMOOTH"));

  const xStart = 166;
  const xStep = 49;
  const points = model.visits.map((level, index) => ({ x: xStart + index * xStep, y: rowY[level], level }));
  points.slice(1).forEach((point, index) => {
    const previous = points[index];
    svg.append(svgEl("path", {
      d: `M${previous.x} ${previous.y} L${point.x} ${point.y}`,
      fill: "none",
      stroke: "#f45c8b",
      "stroke-width": 5,
      "stroke-linecap": "round",
      "marker-end": "url(#w-cycle-arrow)"
    }));
  });

  let coarseVisit = 0;
  points.forEach(point => {
    if (point.level === 3) {
      coarseVisit += 1;
      svg.append(svgEl("circle", { cx: point.x, cy: point.y, r: 15, fill: "#f45c8b", stroke: "#fff", "stroke-width": 3 }));
      svg.append(svgEl("text", { x: point.x, y: point.y + 5, fill: "#fff", "font-size": 13, "font-weight": 800, "text-anchor": "middle" }, String(coarseVisit)));
    } else {
      svg.append(svgEl("circle", { cx: point.x, cy: point.y, r: 6, fill: "#245eb6", stroke: "#fff", "stroke-width": 2 }));
    }
  });

  textLines(svg, model.explanation, 450, 395, 21, { fill: "#596579", "font-size": 15, "text-anchor": "middle" });

  const badgeLayout = [
    { x: 52, width: 380, text: model.badges[0] },
    { x: 448, width: 400, text: model.badges[1] }
  ];
  badgeLayout.forEach(badge => {
    svg.append(svgEl("rect", { x: badge.x, y: 444, width: badge.width, height: 38, rx: 12, fill: "#f9d0e4" }));
    svg.append(svgEl("text", { x: badge.x + badge.width / 2, y: 469, fill: "#182239", "font-size": 15, "font-weight": 650, "text-anchor": "middle" }, badge.text));
  });
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
