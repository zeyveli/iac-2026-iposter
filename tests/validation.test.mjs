import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("profile series preserve all four CFD stations and their exported coordinates", async () => {
  const { parseCsv, buildProfileSeries } = await import("../assets/js/validation-series.js");
  const rows = parseCsv(await read("data/CFD/base_similarity_profiles.csv"));
  const series = buildProfileSeries(rows);

  assert.equal(rows.length, 1317);
  assert.deepEqual(series.map(item => item.id), ["x030", "x066", "x103", "x139"]);
  assert.deepEqual(series.map(item => item.eta.length), [267, 311, 352, 387]);
  assert.equal(series[0].xStation, 0.29981233243967831);
  assert.equal(series[0].numerical[1], 0.014947721279946501);
  assert.equal(series[0].analytical[1], 0.014963841209360366);
  assert.match(series[0].source, /base_similarity_profiles\.csv/);
  assert.match(series[0].case, /Blasius/i);
});

test("integral series use manuscript qualification values and ODE-Blasius references", async () => {
  const { parseCsv, buildIntegralSeries } = await import("../assets/js/validation-series.js");
  const qualification = parseCsv(await read("data/CFD/base_qualification.csv"));
  const result = buildIntegralSeries(qualification);

  assert.equal(result.x.length, 978);
  assert.deepEqual(result.metrics.map(metric => metric.id), ["deltaStar", "theta", "H12", "Cf"]);
  assert.equal(result.metrics[0].numerical[0], 0.0045231397157743615);
  assert.equal(result.metrics[0].analytical[0], 0.0045229278966916866);
  assert.equal(result.metrics[3].numerical.at(-1), 0.0014560522167097415);
  assert.equal(result.metrics[3].analytical.at(-1), 0.0014565745095635255);
  assert.match(result.source, /base_qualification\.csv/);
  assert.match(result.provenanceNote, /manuscript-generating|ODE-Blasius/i);
  assert.deepEqual(result.maximumRelativeErrors, {
    deltaStar: 0.0602500037329401,
    theta: 0.06683577859223734,
    H12: 0.030864260195480137,
    Cf: 0.11191652666355803
  });
});

test("validation pages expose responsive native-SVG controls and the exact manuscript errors", async () => {
  const [profiles, integrals] = await Promise.all([
    read("pages/validation-profiles/index.html"),
    read("pages/validation-integrals/index.html")
  ]);

  assert.match(profiles, /<meta name="viewport"/);
  assert.match(profiles, /id="station-controls"/);
  assert.match(profiles, /id="curve-controls"/);
  assert.match(profiles, /id="profile-chart"/);
  assert.match(profiles, /id="profile-tooltip"/);
  assert.match(profiles, /η/);
  assert.match(profiles, /u\s*\/\s*U/i);

  assert.match(integrals, /<meta name="viewport"/);
  assert.match(integrals, /id="metric-controls"/);
  assert.match(integrals, /id="integral-chart"/);
  assert.match(integrals, /id="integral-tooltip"/);
  for (const value of ["0.06025", "0.06684", "0.03086", "0.11192"]) {
    assert.match(integrals, new RegExp(`${value}%`));
  }
  assert.match(integrals, /manuscript-generating qualification export/i);
  assert.match(integrals, /ODE-Blasius/i);
});
