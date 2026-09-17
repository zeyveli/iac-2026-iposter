const SUMMARY_URL = new URL("../../data/CFD/gpu_scaling_summary.csv", import.meta.url);
const STEPS_URL = new URL("../../data/CFD/gpu_scaling_steps.csv", import.meta.url);

function splitCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell);
  return cells;
}

export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines.shift());
  return lines.filter(Boolean).map(line => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

const number = value => Number(value);

export function buildPerformanceSeries(summaryText, stepsText) {
  const summaries = parseCsv(summaryText);
  const samples = parseCsv(stepsText).map(row => Object.freeze({
    id: row.case,
    measuredStep: number(row.measured_step),
    stepTime: number(row.step_time_s),
    poissonTime: number(row.poisson_time_s),
    poissonShare: number(row.poisson_fraction) * 100,
    iterations: number(row.bicgstab_iterations),
    gpuUsedBytes: number(row.gpu_used_bytes)
  }));

  const cases = summaries.map(row => Object.freeze({
    id: row.case,
    grid: Object.freeze([number(row.Nx), number(row.Ny), number(row.Nz)]),
    nodes: number(row.total_nodes),
    samples: number(row.samples),
    stepTimeMedian: number(row.step_time_median_s),
    stepTimeP95: number(row.step_time_p95_s),
    poissonTimeMedian: number(row.poisson_time_median_s),
    meanIterations: number(row.iterations_mean),
    iterationRange: Object.freeze([number(row.iterations_min), number(row.iterations_max)]),
    poissonShare: number(row.poisson_fraction_aggregate) * 100,
    otherShare: (1 - number(row.poisson_fraction_aggregate)) * 100,
    gpuUsedPeakBytes: number(row.gpu_used_peak_bytes)
  }));

  if (cases.length !== 4 || cases.some((item, index) => item.id !== `G${index + 1}`)) {
    throw new Error("Expected ordered G1-G4 benchmark summaries.");
  }

  const first = cases[0];
  const last = cases.at(-1);
  return Object.freeze({
    cases: Object.freeze(cases),
    samples: Object.freeze(samples),
    nodeRatio: last.nodes / first.nodes,
    iterationIncreasePercent: ((last.meanIterations / first.meanIterations) - 1) * 100,
    refinementRatios: Object.freeze([
      cases[2].stepTimeMedian / cases[1].stepTimeMedian,
      cases[3].stepTimeMedian / cases[2].stepTimeMedian
    ]),
    observedDeviceOccupancyGiB: last.gpuUsedPeakBytes / (1024 ** 3)
  });
}

export async function loadPerformanceSeries() {
  const [summaryResponse, stepsResponse] = await Promise.all([fetch(SUMMARY_URL), fetch(STEPS_URL)]);
  if (!summaryResponse.ok || !stepsResponse.ok) {
    throw new Error("Benchmark CSV exports could not be loaded.");
  }
  return buildPerformanceSeries(await summaryResponse.text(), await stepsResponse.text());
}
