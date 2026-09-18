import test from "node:test";
import assert from "node:assert/strict";
import * as batching from "../pages/batching/app.js";
import { operatorStages, multigridConfig } from "../pages/multigrid/app.js";

const { describeBatch, gpuParallelismNote } = batching;

test("batch selection reports the independent line systems for every grid direction", () => {
  assert.deepEqual(describeBatch("x"), {
    direction: "x",
    lineLength: 16,
    systems: 96,
    systemFactors: [12, 8],
    varyingAxes: ["y", "z"]
  });
  assert.deepEqual(describeBatch("y"), {
    direction: "y",
    lineLength: 12,
    systems: 128,
    systemFactors: [16, 8],
    varyingAxes: ["x", "z"]
  });
  assert.deepEqual(describeBatch("z"), {
    direction: "z",
    lineLength: 8,
    systems: 192,
    systemFactors: [16, 12],
    varyingAxes: ["x", "y"]
  });
});

test("batch page describes parallelism across independent systems, never within a line solve", () => {
  assert.match(gpuParallelismNote, /across independent line systems/i);
  assert.match(gpuParallelismNote, /not within a single line system/i);
});

test("batch diagram splits its panel notes into short contained lines", () => {
  assert.equal(typeof batching.batchPanelNotes, "function");
  assert.deepEqual(batching.batchPanelNotes(describeBatch("x")), {
    grid: [
      "One highlighted stroke = one",
      "length-16 tridiagonal solve",
      "Transverse coordinates identify each system."
    ],
    gpu: [
      "96 direct line solves",
      "in one batched launch",
      "Shared factorization · independent RHS"
    ]
  });
  for (const line of Object.values(batching.batchPanelNotes(describeBatch("z"))).flat()) {
    assert.ok(line.length <= 48, `panel note is too long: ${line}`);
  }
});

test("batch iframe projects its node field through three depth planes", () => {
  assert.equal(typeof batching.batchLatticeGeometry, "function");

  const expectedVectors = {
    x: { dx: 210, dy: 0 },
    y: { dx: 0, dy: -152 },
    z: { dx: 70, dy: -40 }
  };

  for (const direction of ["x", "y", "z"]) {
    const geometry = batching.batchLatticeGeometry(direction);
    assert.equal(geometry.nodes.length, 90);
    assert.deepEqual([...new Set(geometry.nodes.map(node => node.depth))], [0, 1, 2]);
    assert.equal(geometry.lines.length, 4);
    assert.ok(geometry.lines.every(line => line.direction === direction));
    assert.deepEqual(
      { dx: geometry.lines[0].x2 - geometry.lines[0].x1, dy: geometry.lines[0].y2 - geometry.lines[0].y1 },
      expectedVectors[direction]
    );
  }
});

test("matrix-free pathway carries phi through gradient and divergence without a global matrix", () => {
  assert.deepEqual(operatorStages.map(stage => stage.symbol), ["φ", "Gₕφ", "DₕGₕφ"]);
  assert.match(operatorStages.at(-1).detail, /without assembling a global matrix/i);
});

test("GMG configuration preserves the seven-point preconditioner and line-solve reuse", () => {
  assert.equal(multigridConfig.preconditioner, "second-order seven-point Laplacian");
  assert.equal(multigridConfig.cycle, "W-cycle");
  assert.equal(multigridConfig.smoother, "wall-normal line relaxation");
  assert.match(multigridConfig.reuse, /batched tridiagonal/i);
});
