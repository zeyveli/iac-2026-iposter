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

export function batchPanelNotes(batch) {
  return {
    grid: [
      "One highlighted stroke = one independent system",
      "Transverse coordinates identify each system."
    ],
    gpu: [
      `${batch.systems.toLocaleString()} direct line solves`,
      "in one batched launch",
      "Shared factorization · independent RHS"
    ]
  };
}

export function batchLatticeGeometry(direction) {
  if (!Object.hasOwn(grid, direction)) throw new Error(`Unknown grid direction: ${direction}`);

  const dimensions = { x: 6, y: 5, z: 3 };
  const origin = { x: 170, y: 292 };
  const basis = {
    x: { x: 84, y: 0 },
    y: { x: 0, y: -38 },
    z: { x: 55, y: -26 }
  };
  const point = (x, y, z) => ({
    x: origin.x + x * basis.x.x + y * basis.y.x + z * basis.z.x,
    y: origin.y + x * basis.x.y + y * basis.y.y + z * basis.z.y
  });

  const nodes = [];
  for (let depth = 0; depth < dimensions.z; depth++) {
    for (let y = 0; y < dimensions.y; y++) {
      for (let x = 0; x < dimensions.x; x++) nodes.push({ ...point(x, y, depth), depth });
    }
  }

  const lineAnchors = {
    x: [0, 1, 2, 3, 4].map(y => ({ start: [0, y, 1], end: [dimensions.x - 1, y, 1] })),
    y: [0, 1, 2, 3, 4, 5].map(x => ({ start: [x, 0, 1], end: [x, dimensions.y - 1, 1] })),
    z: [0, 1, 2, 3, 4, 5].map(x => ({ start: [x, 2, 0], end: [x, 2, dimensions.z - 1] }))
  };
  const lines = lineAnchors[direction].map(({ start, end }) => {
    const a = point(...start);
    const b = point(...end);
    return { direction, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  });

  const planes = Array.from({ length: dimensions.z }, (_, depth) => {
    const corners = [
      point(0, 0, depth),
      point(dimensions.x - 1, 0, depth),
      point(dimensions.x - 1, dimensions.y - 1, depth),
      point(0, dimensions.y - 1, depth)
    ];
    return { depth, points: corners.map(({ x, y }) => `${x},${y}`).join(" ") };
  });

  return { nodes, lines, planes };
}

export function batchDiagramModel(batch) {
  return {
    panels: [{ x: 8, y: 12, width: 884, height: 394 }],
    cards: [],
    lattice: batchLatticeGeometry(batch.direction)
  };
}

const dirColor = { x: "#245eb6", y: "#f45c8b", z: "#1572a1" };

function drawBatch(container, batch) {
  const svg = makeSvg(container, `Batched ${batch.direction}-direction line systems`, "0 0 900 430");
  const model = batchDiagramModel(batch);
  model.panels.forEach(panel => {
    svg.append(svgEl("rect", { ...panel, rx: 20, class: "svg-panel" }));
  });
  svg.append(svgEl("text", { x: 34, y: 52, class: "svg-label" }, "Structured 3D grid: selected line family"));

  const color = dirColor[batch.direction];
  const axes = batch.varyingAxes.join("–");
  svg.append(svgEl("text", { x: 34, y: 80, class: "svg-small" }, `${batch.systems.toLocaleString()} lines span the ${axes} cross-section`));
  const lattice = model.lattice;
  lattice.planes.forEach(plane => {
    svg.append(svgEl("polygon", {
      points: plane.points,
      fill: "none",
      stroke: "#dfe5ed",
      "stroke-width": 1.5,
      "stroke-linejoin": "round",
      "data-depth-plane": plane.depth
    }));
  });
  lattice.lines.forEach(line => {
    svg.append(svgEl("line", {
      x1: line.x1,
      y1: line.y1,
      x2: line.x2,
      y2: line.y2,
      stroke: color,
      "stroke-width": 7,
      "stroke-linecap": "round",
      "data-line-direction": line.direction
    }));
  });
  lattice.nodes.forEach(node => {
    svg.append(svgEl("circle", {
      cx: node.x,
      cy: node.y,
      r: 4.2,
      fill: "#b9c6d7",
      stroke: "#ffffff",
      "stroke-width": 1,
      "data-node-depth": node.depth
    }));
  });
  const notes = batchPanelNotes(batch);
  notes.grid.forEach((line, index) => {
    svg.append(svgEl("text", { x: 34, y: 342 + index * 23, class: "svg-small" }, line));
  });
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
