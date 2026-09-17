import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = name => new URL(`../pages/${name}/index.html`, import.meta.url);

test("compact discretization page presents an interactive, accurate resolution comparison", async () => {
  const html = await readFile(route("compact"), "utf8");

  assert.match(html, /<main\b/);
  assert.match(html, /modified wavenumber/i);
  assert.match(html, /points per wavelength/i);
  assert.match(html, /sixth-order compact/i);
  assert.match(html, /id="(?:scheme-controls|scheme-select)"/);
  assert.match(html, /id="resolution-chart"/);
  assert.match(html, /function compactModifiedWavenumber/);
  assert.match(html, /14\s*\/\s*9/);
  assert.match(html, /1\s*\/\s*18/);
  assert.match(html, /\.\.\/\.\.\/assets\/css\/style\.css/);
  assert.match(html, /\.\.\/\.\.\/assets\/js\/common\.js/);
});

test("compact chart uses omega notation and anchors the sample label above-left", async () => {
  const html = await readFile(route("compact"), "utf8");

  assert.match(html, /wavenumber, ω/);
  assert.match(html, /modified wavenumber, ω′/u);
  assert.match(html, /ω′<\/i>\s*=\s*<i>ω/u);
  assert.match(html, /metric\("ω",/u);
  assert.match(html, /x:\s*x\(theta\)\s*-\s*16/);
  assert.match(html, /y:\s*y\(kStar\)\s*-\s*16/);
  assert.match(html, /"text-anchor":\s*"end"/);
});

test("half-staggered projection page has five interactive stages and approved relations", async () => {
  const html = await readFile(route("projection"), "utf8");

  assert.match(html, /<main\b/);
  assert.match(html, /nodal velocity/i);
  assert.match(html, /cell-centred pressure/i);
  assert.match(html, /id="projection-grid"/);
  assert.match(html, /id="projection-stage-controls"/);
  assert.match(html, /data-stage="1"/);
  assert.match(html, /data-stage="5"/);
  assert.match(html, /D<sub>h<\/sub>G<sub>h<\/sub>\s*φ\s*=\s*\(1\s*\/\s*Δt\)\s*D<sub>h<\/sub>\s*<strong>û<\/strong><sup>\*<\/sup>/u);
  assert.match(html, /<strong>û<\/strong><sup>n\+1<\/sup>\s*=\s*<strong>û<\/strong><sup>\*<\/sup>\s*[−-]\s*ΔtG<sub>h<\/sub>φ/u);
  assert.doesNotMatch(html, /nodal[^.]{0,100}divergence-certified/i);
  assert.match(html, /\.\.\/\.\.\/assets\/css\/style\.css/);
  assert.match(html, /\.\.\/\.\.\/assets\/js\/common\.js/);
});
