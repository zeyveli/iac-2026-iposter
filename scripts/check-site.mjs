import { access, readFile } from "node:fs/promises";

const routes = ["compact", "projection", "batching", "multigrid", "validation-profiles", "validation-integrals", "performance-convergence", "performance-scaling", "performance-composition"];
for (const route of routes) {
  const path = new URL(`../pages/${route}/index.html`, import.meta.url);
  await access(path);
  const html = await readFile(path, "utf8");
  if (!html.includes("../../assets/css/style.css")) throw new Error(`${route}: missing shared stylesheet`);
}
console.log(`PASS: ${routes.length} iframe routes found`);

