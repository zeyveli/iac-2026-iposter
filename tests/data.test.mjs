import test from "node:test";
import assert from "node:assert/strict";

test("all Blasius errors remain below 0.12 percent", async () => {
  const { validationErrors } = await import("../assets/js/data.js");
  assert.ok(Math.max(...Object.values(validationErrors)) < 0.12);
});

test("performance endpoints match the manuscript", async () => {
  const { performanceCases } = await import("../assets/js/data.js");
  assert.equal(performanceCases.at(-1).nodes / performanceCases[0].nodes, 512);
  assert.equal(performanceCases[0].meanIterations.toFixed(2), "6.63");
  assert.equal(performanceCases.at(-1).meanIterations.toFixed(2), "8.43");
  assert.equal(performanceCases[0].poissonShare.toFixed(1), "81.5");
  assert.equal(performanceCases.at(-1).poissonShare.toFixed(1), "73.0");
});

test("all performance summary values match the benchmark export", async () => {
  const { performanceCases } = await import("../assets/js/data.js");
  assert.deepEqual(
    performanceCases.map(({ meanIterations }) => meanIterations),
    [6.633333333333334, 7.133333333333334, 7.9, 8.433333333333334]
  );
  assert.deepEqual(
    performanceCases.map(({ stepTime }) => stepTime),
    [0.0508198545, 0.247402725, 1.954466926, 16.613835149]
  );
  assert.deepEqual(
    performanceCases.map(({ poissonShare }) => poissonShare),
    [81.50435884888266, 76.54728147944261, 74.24338845611778, 73.02045444382334]
  );
});
