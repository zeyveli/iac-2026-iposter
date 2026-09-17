import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = name => readFile(new URL(name, root), "utf8");

const routes = [
  "compact",
  "projection",
  "batching",
  "multigrid",
  "validation-profiles",
  "validation-integrals",
  "performance-convergence",
  "performance-scaling",
  "performance-composition"
];

test("content includes the approved headline claims and equations", async () => {
  const [collapsed, expanded] = await Promise.all([
    read("content/collapsed-panels.md"),
    read("content/expanded-panels.md")
  ]);
  const copy = `${collapsed}\n${expanded}`;

  assert.match(copy, /Maximum error below 0\.12%/);
  assert.match(copy, /6\.63 to 8\.43 mean BiCGSTAB iterations/);
  assert.match(copy, /512[- ]times? increase in nodes/i);
  assert.match(copy, /pressure solution accounts for \**73[-–]82%\**/i);
  assert.match(copy, /D_hG_h\\phi=\\frac\{1\}\{\\Delta t\}D_h\\hat\{\\mathbf\{u\}\}\^\*/);
  assert.match(copy, /\\hat\{\\mathbf\{u\}\}\^\{n\+1\}=\\hat\{\\mathbf\{u\}\}\^\*-\\Delta tG_h\\phi/);
  assert.match(copy, /0\.06025%/);
  assert.match(copy, /0\.11192%/);
  assert.match(copy, /NVIDIA A100 80 GB/);
  assert.match(copy, /4013792022/);
  assert.match(copy, /FLO-2026-48134/);
});

test("content preserves transition and divergence terminology guards", async () => {
  const [collapsed, expanded, map] = await Promise.all([
    read("content/collapsed-panels.md"),
    read("content/expanded-panels.md"),
    read("content/iposter-entry-map.md")
  ]);
  const copy = `${collapsed}\n${expanded}\n${map}`;

  assert.doesNotMatch(copy, /controlled transition (?:is|was|has been) demonstrated/i);
  assert.doesNotMatch(copy, /turbulent(?:-flow)? results (?:are|were) presented/i);
  assert.doesNotMatch(copy, /nodal[^.\n]{0,80}divergence-certified/i);
  assert.match(copy, /corrected staggered face[- ]velocity field[\s\S]{0,100}?divergence criterion/i);
  assert.match(copy, /interpolated nodal velocity field[\s\S]{0,120}?(?:not|does not)[\s\S]{0,80}?divergence-certified/i);
  assert.match(copy, /controlled transition\s+and\s+turbulent[- ]flow results\s+are not presented/i);
});

test("development index links every approved responsive iframe route", async () => {
  const html = await read("index.html");
  for (const route of routes) {
    assert.match(html, new RegExp(`(?:pages/)?${route}/index\\.html`));
  }
  assert.match(html, /development index/i);
  assert.match(html, /responsive mode/i);
});

test("entry map documents all nine route labels and the publication gate", async () => {
  const map = await read("content/iposter-entry-map.md");
  for (const route of routes) assert.match(map, new RegExp(`\\b${route}\\b`));
  assert.match(map, /Acknowledgements/i);
  assert.match(map, /IAC-26,C4,IP,63,x110913/);
  assert.match(map, /separate approval/i);
});

test("README documents local preview and static hosting without authorizing publication", async () => {
  const readme = await read("README.md");
  assert.match(readme, /python3 -m http\.server 4173/);
  assert.match(readme, /GitHub Pages[- ]ready/i);
  assert.match(readme, /publication requires separate approval/i);
});

test("main-view assembly sheet maps every fixed panel and slider asset exactly", async () => {
  const sheet = await read("content/main-view-assembly-sheet.md");
  for (const panel of [
    "Motivation & Objective",
    "Conclusion",
    "Method",
    "Validation",
    "Performance",
    "Visual Summary"
  ]) assert.match(sheet, new RegExp(panel.replace("&", "&(?:amp;)?"), "i"));

  for (const asset of [
    "poster-assets/method-workflow.png",
    "poster-assets/validation-summary.png",
    "poster-assets/performance-summary.png",
    "slider/01-blasius-validation.png",
    "slider/02-half-staggered.png",
    "slider/03-batched-lines.png",
    "slider/04-gmg-convergence.png",
    "slider/05-timestep-performance.png"
  ]) assert.match(sheet, new RegExp(asset.replaceAll(".", "\\.")));

  assert.match(sheet, /do not shrink to fit/i);
  assert.match(sheet, /iframe URLs remain placeholders/i);
});
