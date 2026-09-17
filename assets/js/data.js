export const validationCase = Object.freeze({
  grid: [1120, 1024, 120],
  gpu: "NVIDIA A100 80 GB PCIe",
  dt: 2.5e-4,
  reThetaInlet: 174,
  reThetaOutlet: 317
});

export const validationErrors = Object.freeze({
  deltaStar: 0.06025,
  theta: 0.06684,
  H12: 0.03086,
  Cf: 0.11192
});

export const performanceCases = Object.freeze([
  Object.freeze({ id: "G1", grid: [140, 128, 15], nodes: 268800, stepTime: 0.0508198545, meanIterations: 6.633333333333334, iterationRange: [6, 7], poissonShare: 81.50435884888266 }),
  Object.freeze({ id: "G2", grid: [280, 256, 30], nodes: 2150400, stepTime: 0.247402725, meanIterations: 7.133333333333334, iterationRange: [6, 8], poissonShare: 76.54728147944261 }),
  Object.freeze({ id: "G3", grid: [560, 512, 60], nodes: 17203200, stepTime: 1.954466926, meanIterations: 7.9, iterationRange: [7, 9], poissonShare: 74.24338845611778 }),
  Object.freeze({ id: "G4", grid: [1120, 1024, 120], nodes: 137625600, stepTime: 16.613835149, meanIterations: 8.433333333333334, iterationRange: [8, 10], poissonShare: 73.02045444382334 })
]);

export const performanceSummary = Object.freeze({
  timestepRefinementRatios: Object.freeze([7.90, 8.50]),
  observedDeviceOccupancyGiB: 56,
  occupancyQualification: "Observed device occupancy during sequential benchmarks; not an isolated working-set measurement."
});
