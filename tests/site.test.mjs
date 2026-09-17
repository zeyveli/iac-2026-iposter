import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

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

test("all approved iframe routes exist and use the shared stylesheet", async () => {
  for (const route of routes) {
    const html = await readFile(new URL(`../pages/${route}/index.html`, import.meta.url), "utf8");
    assert.match(html, /assets\/css\/style\.css/);
    assert.match(html, /<meta name="viewport"/);
  }
});

test("shared CSS prevents horizontal page overflow", async () => {
  const css = await readFile(new URL("../assets/css/style.css", import.meta.url), "utf8");
  assert.match(css, /overflow-x:\s*(?:clip|hidden)/);
  assert.match(css, /max-width:\s*100%/);
});

test("GitHub Pages bypasses Jekyll processing", async () => {
  await access(new URL("../.nojekyll", import.meta.url));
});
