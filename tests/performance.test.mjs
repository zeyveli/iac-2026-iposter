import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const summaryText = await readFile(
  new URL("../data/CFD/gpu_scaling_summary.csv", import.meta.url),
  "utf8"
);
const stepsText = await readFile(
  new URL("../data/CFD/gpu_scaling_steps.csv", import.meta.url),
  "utf8"
);

test("performance series are derived from the benchmark exports", async () => {
  const { buildPerformanceSeries } = await import("../assets/js/performance-series.js");
  const series = buildPerformanceSeries(summaryText, stepsText);

  assert.deepEqual(series.cases.map(({ id }) => id), ["G1", "G2", "G3", "G4"]);
  assert.deepEqual(
    series.cases.map(({ meanIterations }) => meanIterations),
    [6.633333333333334, 7.133333333333334, 7.9, 8.433333333333334]
  );
  assert.deepEqual(
    series.cases.map(({ iterationRange }) => iterationRange),
    [[6, 7], [6, 8], [7, 9], [8, 10]]
  );
  const expectedShares = [81.50435884888266, 76.54728147944261, 74.24338845611778, 73.02045444382334];
  series.cases.forEach(({ poissonShare }, index) => {
    assert.ok(Math.abs(poissonShare - expectedShares[index]) < 1e-12);
  });
  assert.equal(series.nodeRatio, 512);
  assert.ok(Math.abs(series.iterationIncreasePercent - 27.1356783919598) < 1e-12);
  assert.ok(Math.abs(series.refinementRatios[0] - 7.899940980844088) < 1e-12);
  assert.ok(Math.abs(series.refinementRatios[1] - 8.50044322980782) < 1e-12);
});

test("step-level observations agree with exported summary ranges", async () => {
  const { buildPerformanceSeries } = await import("../assets/js/performance-series.js");
  const series = buildPerformanceSeries(summaryText, stepsText);

  assert.equal(series.samples.length, 120);
  for (const benchmark of series.cases) {
    const observations = series.samples.filter(({ id }) => id === benchmark.id);
    assert.equal(observations.length, 30);
    assert.equal(Math.min(...observations.map(({ iterations }) => iterations)), benchmark.iterationRange[0]);
    assert.equal(Math.max(...observations.map(({ iterations }) => iterations)), benchmark.iterationRange[1]);
  }
});

test("all performance pages expose responsive SVG and hover detail regions", async () => {
  for (const route of ["performance-convergence", "performance-scaling", "performance-composition"]) {
    const html = await readFile(new URL(`../pages/${route}/index.html`, import.meta.url), "utf8");
    assert.match(html, /<meta name="viewport"/);
    assert.match(html, /assets\/css\/style\.css/);
    assert.match(html, /<svg[^>]*viewBox=/);
    assert.match(html, /role="status"/);
    assert.doesNotMatch(html, /(?:^|[;{])\s*width:\s*\d+px/m);
    assert.doesNotMatch(html, /<svg[^>]*\swidth="\d+"/);
  }
});
