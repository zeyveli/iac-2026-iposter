const NS = "http://www.w3.org/2000/svg";

export function svgEl(name, attrs = {}, text = "") {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text) node.textContent = text;
  return node;
}

export function makeSvg(container, title, viewBox = "0 0 900 520") {
  const svg = svgEl("svg", { viewBox, role: "img", "aria-label": title });
  svg.append(svgEl("title", {}, title));
  container.replaceChildren(svg);
  return svg;
}

export function linePath(points, x, y) {
  return points.map((p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(2)},${y(p[1]).toFixed(2)}`).join(" ");
}

export function setPressed(buttons, active) {
  buttons.forEach(button => button.setAttribute("aria-pressed", String(button === active)));
}

export function formatNumber(value, digits = 2) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: digits });
}

