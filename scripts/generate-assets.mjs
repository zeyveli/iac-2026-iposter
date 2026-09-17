import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { validationErrors } from '../assets/js/data.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const C = { blue: '#173b8f', warm: '#f45c8b', ink: '#152642', mute: '#52657d', line: '#d8e1ed', pale: '#eef3fa', cream: '#f9d0e4', white: '#ffffff', teal: '#367e86' };
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const csv = path => {
  const records = readFileSync(root + path, 'utf8').trim().split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#'));
  const [header, ...lines] = records;
  const keys = header.split(',');
  return lines.map(line => Object.fromEntries(line.split(',').map((v, i) => [keys[i], v !== '' && Number.isFinite(Number(v)) ? Number(v) : v])));
};
const performance = csv('data/CFD/gpu_scaling_summary.csv');
const profiles = csv('data/CFD/base_similarity_profiles.csv');
const qualification = csv('data/CFD/base_qualification.csv');
const stations = [...new Set(profiles.map(d => d.station))];
const firstProfile = profiles.filter(d => d.station === stations[0]);
const nodeRatio = performance.at(-1).total_nodes / performance[0].total_nodes;
const iterationRise = (performance.at(-1).iterations_mean / performance[0].iterations_mean - 1) * 100;
const resultFiles = [];

function text(x, y, value, size = 24, fill = C.ink, weight = 400, extra = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${escape(value)}</text>`;
}
function lines(x, y, values, size = 24, fill = C.ink, weight = 400, gap = size * 1.35) {
  return values.map((v, i) => text(x, y + i * gap, v, size, fill, weight)).join('');
}
function rect(x, y, w, h, fill = C.pale, radius = 18, extra = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" ${extra}/>`;
}
function line(x1, y1, x2, y2, stroke = C.line, width = 2, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
}
function circle(x, y, r = 6, fill = C.blue, extra = '') {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
}
function path(points, stroke = C.blue, width = 4, extra = '') {
  return `<path d="${points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
}
function shell(w, h, title, desc, body, kicker = 'IAC 2026 · ITU ASTRONAUTICAL ENGINEERING') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${escape(title)}</title><desc id="desc">${escape(desc)}</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="${C.blue}" stroke-width="1.5"/></marker></defs><g font-family="Arial, Helvetica, sans-serif">${rect(0, 0, w, h, C.white, 0)}${rect(0, 0, w, 9, C.blue, 0)}${text(48, 47, kicker, 15, C.mute, 700, 'letter-spacing="2"')}${body}</g></svg>`;
}
function footer(w, h, caption) {
  return line(48, h - 67, w - 48, h - 67) + text(48, h - 28, caption, 20, C.mute);
}
function save(name, w, h, title, desc, body) {
  const file = root + name;
  mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  writeFileSync(file, shell(w, h, title, desc, body));
  resultFiles.push(file);
}
function title(x, y, value, size = 36) { return text(x, y, value, size, C.blue, 700); }

// All curve coordinates come from the supplied CFD CSVs. Numerical markers use
// every eighth sample for clarity; the numerical line retains all samples.
function profilePlot(x, y, w, h, compact = false) {
  const X = u => x + u / 1.06 * w;
  const Y = eta => y + h - eta / 8 * h;
  let body = text(x, y - 23, 'Similarity profiles', 26, C.ink, 700);
  for (const eta of [0, 2, 4, 6, 8]) body += line(x, Y(eta), x + w, Y(eta)) + text(x - 16, Y(eta) + 7, eta, 18, C.mute, 400, 'text-anchor="end"');
  for (const u of [0, .5, 1]) body += text(X(u), y + h + 27, u.toFixed(1), 18, C.mute, 400, 'text-anchor="middle"');
  body += line(x, y, x, y + h, C.mute) + line(x, y + h, x + w, y + h, C.mute);
  body += text(x - 51, y + h / 2, 'η', 23, C.ink, 700) + text(x + w + 18, y + h + 29, 'u/Ue', 21, C.ink, 700);
  const ref = firstProfile.filter(d => d.eta <= 8);
  body += path(ref.map(d => [X(d.blasius_fp), Y(d.eta)]), C.blue, 5);
  stations.forEach((station, i) => {
    const data = profiles.filter(d => d.station === station && d.eta <= 8);
    body += path(data.map(d => [X(d.u_over_Ue), Y(d.eta)]), C.warm, 1.8, 'opacity="0.65"');
    body += data.filter((_, j) => j % 26 === i * 3).map(d => circle(X(d.u_over_Ue), Y(d.eta), compact ? 3 : 4, C.white, `stroke="${C.warm}" stroke-width="2"`)).join('');
  });
  body += line(x + 7, y + 25, x + 39, y + 25, C.blue, 5) + text(x + 50, y + 31, 'Blasius', compact ? 19 : 21, C.blue, 700);
  body += circle(x + 23, y + 58, 5, C.white, `stroke="${C.warm}" stroke-width="2"`) + text(x + 50, y + 65, 'Numerical', compact ? 19 : 21, C.warm, 700);
  return body;
}
function cfPlot(x, y, w, h) {
  const X = val => x + val / 1.5 * w;
  const Y = val => y + h - (val * 1000 - 1.3) / 1.3 * h;
  let body = text(x, y - 23, 'Skin friction', 26, C.ink, 700);
  for (const val of [1.4, 1.8, 2.2, 2.6]) body += line(x, Y(val / 1000), x + w, Y(val / 1000)) + text(x - 13, Y(val / 1000) + 6, val.toFixed(1), 17, C.mute, 400, 'text-anchor="end"');
  for (const val of [0, .5, 1, 1.5]) body += text(X(val), y + h + 28, val.toFixed(1), 18, C.mute, 400, 'text-anchor="middle"');
  body += line(x, y, x, y + h, C.mute) + line(x, y + h, x + w, y + h, C.mute);
  body += text(x, y - 2, 'Cf × 10³', 18, C.mute) + text(x + w + 20, y + h + 29, 'x', 21, C.ink, 700);
  body += path(qualification.map(d => [X(d.x), Y(d.Cf_ref)]), C.blue, 5);
  body += qualification.filter((_, index) => index % 140 === 0 || index === qualification.length - 1)
    .map(d => circle(X(d.x), Y(d.Cf), 6, C.white, `stroke="${C.warm}" stroke-width="3"`)).join('');
  return body;
}
function iterations(x, y, w, h, options = {}) {
  const X = n => x + Math.log(n / performance[0].total_nodes) / Math.log(nodeRatio) * w;
  const Y = n => y + h - (n - 5) / 6 * h;
  let body = text(x, y - 22, 'BiCGSTAB iterations', 23, C.ink, 700);
  for (const n of [6, 8, 10]) body += line(x, Y(n), x + w, Y(n)) + text(x - 17, Y(n) + 7, n, 19, C.mute, 400, 'text-anchor="end"');
  body += line(x, y + h, x + w, y + h, C.mute);
  body += path(performance.map(d => [X(d.total_nodes), Y(d.iterations_mean)]), C.blue, 5);
  for (const d of performance) {
    const px = X(d.total_nodes);
    body += line(px, Y(d.iterations_min), px, Y(d.iterations_max), C.warm, 4);
    body += line(px - 9, Y(d.iterations_min), px + 9, Y(d.iterations_min), C.warm, 3) + line(px - 9, Y(d.iterations_max), px + 9, Y(d.iterations_max), C.warm, 3);
    body += circle(px, Y(d.iterations_mean), 8, C.blue, 'stroke="white" stroke-width="2"');
    body += text(px + (options.labelsAbove ? 14 : 0), options.labelsAbove ? Y(d.iterations_mean) - 14 : y + h + 29, d.iterations_mean.toFixed(2), 24, C.blue, 700, `text-anchor="${options.labelsAbove ? 'start' : 'middle'}"`);
    body += text(px, y + h + (options.labelsAbove ? 27 : 59), `${d.case} · ${(d.total_nodes / 1e6).toFixed(d.total_nodes < 1e6 ? 2 : 1)}M`, 19, C.mute, 400, 'text-anchor="middle"');
  }
  body += text(x + w / 2, y + h + (options.labelsAbove ? 56 : 90), 'Grid nodes · logarithmic scale', 19, C.mute, 400, 'text-anchor="middle"');
  return body;
}

// Collapsed method: a six-stage loop, intentionally free of equations.
{
  let body = title(48, 100, 'High-order accuracy.') + title(48, 146, 'GPU-native execution.');
  body += text(48, 189, 'A half-staggered projection timestep', 26, C.mute);
  const steps = [
    ['Nodal velocity', 'Cell-centred pressure'],
    ['AB2 momentum predictor', 'Advance the nodal velocity'],
    ['Compact interpolation', 'Transfer velocity to faces'],
    ['Matrix-free pressure projection', 'BiCGSTAB + geometric multigrid'],
    ['Velocity + pressure correction', 'Enforce face-velocity incompressibility'],
    ['Return to nodal velocity', 'Ready for the next timestep']
  ];
  steps.forEach(([label, sub], i) => {
    const y = 235 + i * 137;
    body += rect(94, y, 708, 108, i === 3 ? C.blue : C.pale);
    body += circle(130, y + 37, 20, i === 3 ? C.white : C.blue) + text(130, y + 45, i + 1, 22, i === 3 ? C.blue : C.white, 700, 'text-anchor="middle"');
    body += text(165, y + 42, label, 27, i === 3 ? C.white : C.blue, 700) + text(165, y + 79, sub, 22, i === 3 ? C.white : C.mute);
    if (i < 5) body += line(448, y + 112, 448, y + 131, C.blue, 3, 'marker-end="url(#arrow)"');
  });
  body += `<path d="M802 974 H842 V290 H811" fill="none" stroke="${C.blue}" stroke-width="3" marker-end="url(#arrow)"/>`;
  body += rect(94, 1090, 708, 89, C.cream) + text(448, 1127, 'Sixth-order compact operators', 27, C.warm, 700, 'text-anchor="middle"') + text(448, 1161, 'Batched line systems · entirely on the GPU', 23, C.ink, 400, 'text-anchor="middle"');
  save('poster-assets/method-workflow.svg', 900, 1260, 'Sixth-order compact half-staggered GPU method', 'Six stages form a timestep loop: nodal velocity and cell-centred pressure; AB2 momentum predictor; compact interpolation to faces; matrix-free BiCGSTAB-GMG pressure projection; velocity and pressure correction; return to nodal velocity. Incompressibility is enforced for the corrected face velocities.', body);
}

{
  let body = title(48, 101, 'Laminar Flat-Plate') + title(48, 144, 'Boundary Layer');
  body += rect(48, 177, 1004, 134, C.blue) + text(78, 235, 'Maximum error below 0.12%', 43, C.white, 700) + text(78, 277, 'Across displacement thickness, momentum thickness, H₁₂ and Cf', 24, C.white);
  body += profilePlot(105, 397, 395, 290) + cfPlot(655, 397, 350, 290);
  body += text(105, 754, 'Analytical reference', 23, C.blue, 700) + text(430, 754, 'Numerical result', 23, C.warm, 700);
  const metrics = [['δ*', validationErrors.deltaStar], ['θ', validationErrors.theta], ['H₁₂', validationErrors.H12], ['Cf', validationErrors.Cf]];
  metrics.forEach(([name, value], i) => {
    const x = 48 + i * 255;
    body += rect(x, 794, 235, 119) + text(x + 24, 831, name, 24, C.mute, 700) + text(x + 24, 877, `${value.toFixed(5)}%`, 29, C.blue, 700);
  });
  body += footer(1100, 1000, 'Maximum relative errors · laminar validation; no transition claim');
  save('poster-assets/validation-summary.svg', 1100, 1000, 'Laminar Flat-Plate Boundary Layer validation', 'Numerical similarity profiles match the supplied analytical Blasius profile. Skin-friction values are paired with the independent ODE-Blasius references in the manuscript-generating qualification export. Maximum relative errors are 0.06025% in displacement thickness, 0.06684% in momentum thickness, 0.03086% in shape factor and 0.11192% in skin friction.', body);
}

{
  let body = title(48, 103, 'Pressure convergence that scales');
  body += rect(48, 145, 1004, 161, C.blue) + text(78, 211, `${performance[0].iterations_mean.toFixed(2)} → ${performance.at(-1).iterations_mean.toFixed(2)}`, 58, C.white, 700) + text(78, 260, `mean iterations · ${nodeRatio}× more grid nodes`, 31, C.white);
  body += iterations(133, 388, 810, 295);
  body += line(84, 816, 126, 816, C.blue, 5) + text(139, 824, 'Mean iterations', 23, C.blue, 700) + line(435, 816, 477, 816, C.warm, 4) + text(490, 824, 'Observed min–max', 23, C.warm, 700);
  body += rect(48, 858, 1004, 66, C.cream) + text(78, 900, 'Pressure solution accounts for 73–82% of the timestep', 29, C.warm, 700);
  body += footer(1100, 1000, 'Single NVIDIA A100 80 GB PCIe · 30 sampled timesteps per case');
  save('poster-assets/performance-summary.svg', 1100, 1000, 'GMG-preconditioned pressure convergence', `${nodeRatio}-fold growth in nodes causes only ${iterationRise.toFixed(1)}% growth in mean BiCGSTAB iterations. Exact means and ranges are sourced from gpu_scaling_summary.csv. Pressure solution accounts for approximately 73 to 82 percent of the timestep.`, body);
}

{
  let body = title(48, 97, 'Blasius validation', 35);
  body += profilePlot(101, 163, 349, 215, true) + cfPlot(613, 163, 361, 215);
  body += rect(1098, 122, 454, 277, C.blue) + text(1130, 183, '<0.12%', 61, C.white, 700) + lines(1130, 224, ['maximum relative error', 'across δ*, θ, H₁₂ and Cf'], 25, C.white, 400, 35);
  body += line(1130, 302, 1165, 302, C.white, 4) + text(1180, 310, 'Blasius reference', 21, C.white, 700) + circle(1148, 348, 6, C.white, `stroke="${C.warm}" stroke-width="3"`) + text(1180, 356, 'Numerical solution', 21, C.white, 700);
  body += footer(1600, 500, 'Numerical profiles collapse onto the analytical solution; all evaluated quantities remain within 0.12%.');
  save('slider/01-blasius-validation.svg', 1600, 500, 'Blasius validation: profiles and skin friction', 'Profiles from every supplied station are overlaid against the analytical Blasius profile. Numerical skin friction is paired with the independent ODE-Blasius reference in the manuscript-generating qualification export. Manuscript-reported maximum relative errors remain below 0.12%.', body);
}

{
  let body = title(48, 97, 'Half-staggered projection', 35);
  const gx = 100, gy = 158, cell = 74;
  for (let i = 0; i <= 5; i++) body += line(gx + i * cell, gy, gx + i * cell, gy + 3 * cell, C.line, 2);
  for (let j = 0; j <= 3; j++) body += line(gx, gy + j * cell, gx + 5 * cell, gy + j * cell, C.line, 2);
  for (let i = 0; i <= 5; i++) for (let j = 0; j <= 3; j++) body += circle(gx + i * cell, gy + j * cell, 5, C.blue);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) body += rect(gx + i * cell + 31, gy + j * cell + 31, 12, 12, C.warm, 1);
  for (let i = 1; i < 5; i++) for (let j = 0; j < 3; j++) body += line(gx + i * cell - 12, gy + j * cell + 37, gx + i * cell + 12, gy + j * cell + 37, C.teal, 3);
  for (let i = 0; i < 5; i++) for (let j = 1; j < 3; j++) body += line(gx + i * cell + 37, gy + j * cell - 12, gx + i * cell + 37, gy + j * cell + 12, C.teal, 3);
  body += circle(555, 165, 7, C.blue) + text(576, 173, 'Nodal velocity', 25, C.blue, 700);
  body += rect(548, 210, 14, 14, C.warm, 1) + text(576, 225, 'Cell-centred pressure', 25, C.warm, 700);
  body += line(544, 268, 566, 268, C.teal, 4) + text(576, 276, 'Face-normal operators', 25, C.teal, 700);
  body += lines(548, 330, ['Momentum at nodes.', 'Projection at faces.'], 27, C.ink, 700, 38);
  body += rect(997, 130, 555, 273, C.pale) + text(1028, 172, 'PREDICT → PROJECT → CORRECT', 22, C.blue, 700);
  body += lines(1028, 223, ['AB2 predictor', 'Compact interpolation to faces', 'Matrix-free DₕGₕ pressure solve', 'Face correction → nodal return'], 25, C.ink, 400, 45);
  body += footer(1600, 500, 'Incompressibility is enforced on corrected staggered face velocities—not claimed for interpolated nodal velocity.');
  save('slider/02-half-staggered.svg', 1600, 500, 'Half-staggered arrangement and projection locations', 'Schematic, not a flow-field visualization. Blue circles indicate nodal velocity storage; warm squares cell-centred pressure; teal marks face-normal operator locations. Momentum prediction is nodal, while divergence and pressure correction use staggered faces.', body);
}

{
  let body = title(48, 97, 'Many grid lines. One GPU batch.', 35);
  const gx = 100, gy = 163;
  for (let j = 0; j < 5; j++) {
    body += line(gx, gy + j * 43, gx + 405, gy + j * 43, j === 2 ? C.warm : C.blue, j === 2 ? 5 : 3);
    for (let i = 0; i < 10; i++) body += circle(gx + i * 45, gy + j * 43, 5, j === 2 ? C.warm : C.blue);
  }
  body += text(100, 388, 'Independent compact grid lines', 24, C.ink, 700);
  body += line(554, 255, 647, 255, C.blue, 4, 'marker-end="url(#arrow)"');
  body += rect(696, 141, 377, 242, C.pale) + text(725, 180, 'BATCHED LINE SOLVES', 21, C.blue, 700);
  for (let i = 0; i < 5; i++) {
    body += rect(726, 197 + i * 31, 317, 23, i === 2 ? C.warm : C.blue, 5);
    body += text(742, 214 + i * 31, `Line ${i + 1}  ·  tridiagonal system`, 16, C.white, 700);
  }
  body += lines(1137, 169, ['REUSE', 'Shared left-hand-side', 'factorization'], 24, C.ink, 400, 32);
  body += lines(1137, 287, ['COALESCE', 'Memory access without', 'a main-path transpose'], 24, C.ink, 400, 32);
  body += footer(1600, 500, 'GPU parallelism spans independent systems; each compact grid-line solve remains direct. Schematic, not a benchmark.');
  save('slider/03-batched-lines.svg', 1600, 500, 'Batched GPU compact line systems', 'Illustrative independent grid lines map to GPU-batched tridiagonal solves. A common uniform-grid left-hand-side factorization is reused. Coalesced memory layout avoids an explicit transpose on the main execution path. Line counts in this schematic are illustrative, not problem dimensions.', body);
}

{
  let body = title(48, 97, 'Nearly grid-independent pressure convergence', 35);
  body += iterations(122, 166, 791, 197, { labelsAbove: true });
  body += rect(1073, 127, 479, 279, C.blue) + text(1108, 188, `${nodeRatio}×`, 60, C.white, 700) + text(1108, 226, 'more grid nodes', 25, C.white);
  body += text(1108, 288, `+${iterationRise.toFixed(0)}%`, 48, C.white, 700) + text(1108, 326, 'mean iteration growth', 25, C.white);
  body += text(1108, 377, 'Mean + observed min–max', 20, C.white);
  body += footer(1600, 500, 'Matrix-free BiCGSTAB + GMG · single NVIDIA A100 80 GB PCIe · 30 sampled timesteps per case');
  save('slider/04-gmg-convergence.svg', 1600, 500, 'GMG-preconditioned convergence across four GPU benchmarks', `CSV means: ${performance.map(d => `${d.case} ${d.iterations_mean.toFixed(2)}`).join(', ')}. Error bars show the observed min–max iterations, not uncertainty. Node count uses a logarithmic axis.`, body);
}

{
  let body = title(48, 97, 'Timestep cost tracks problem size', 35);
  const large = performance.slice(1), x = 106, y = 167, w = 595, h = 206;
  const X = n => x + Math.log(n / large[0].total_nodes) / Math.log(64) * w;
  const Y = seconds => y + h - Math.log10(seconds / .2) / 2 * h;
  body += text(x, 143, 'Median timestep · seconds', 23, C.ink, 700);
  for (const seconds of [.2, 2, 20]) body += line(x, Y(seconds), x + w, Y(seconds)) + text(x - 15, Y(seconds) + 7, seconds, 19, C.mute, 400, 'text-anchor="end"');
  body += path(large.map(d => [X(d.total_nodes), Y(large[0].step_time_median_s * d.total_nodes / large[0].total_nodes)]), C.warm, 3, 'stroke-dasharray="9 7"');
  body += path(large.map(d => [X(d.total_nodes), Y(d.step_time_median_s)]), C.blue, 5);
  large.forEach(d => {
    const px = X(d.total_nodes), py = Y(d.step_time_median_s);
    body += circle(px, py, 7, C.blue) + text(px + 13, py - 25, `${d.step_time_median_s.toFixed(3)} s`, 21, C.blue, 700);
    body += text(px, 402, `${d.case} · ${(d.total_nodes / 1e6).toFixed(1)}M`, 19, C.mute, 400, 'text-anchor="middle"');
  });
  body += text(171, 185, 'Measured', 20, C.blue, 700) + text(171, 214, 'Ideal linear (anchored at G2)', 19, C.warm, 700);
  body += text(874, 143, 'Pressure share of timestep', 23, C.ink, 700);
  performance.forEach((d, i) => {
    const bx = 931, by = 169 + i * 54, bw = 488, pct = d.poisson_fraction_aggregate * 100;
    body += text(874, by + 26, d.case, 23, C.ink, 700) + rect(bx, by, bw, 35, C.pale, 5) + rect(bx, by, bw * pct / 100, 35, C.blue, 5);
    body += text(bx + 15, by + 26, `${pct.toFixed(1)}%`, 21, C.white, 700);
  });
  const ratios = [large[1].step_time_median_s / large[0].step_time_median_s, large[2].step_time_median_s / large[1].step_time_median_s];
  body += text(874, 404, `8× nodes → ${ratios[0].toFixed(2)}× and ${ratios[1].toFixed(2)}× timestep`, 25, C.warm, 700);
  body += footer(1600, 500, 'Log–log scaling at left; time fractions at right. Light remainder includes all non-pressure operations.');
  save('slider/05-timestep-performance.svg', 1600, 500, 'Timestep scaling and pressure-solution composition', `Measured median timesteps from the CSV are ${large.map(d => `${d.case}: ${d.step_time_median_s.toFixed(6)} seconds`).join('; ')}. Both scaling axes are logarithmic. G1 is omitted from scaling because it underfills the GPU, but retained in the pressure-fraction chart. Fractions use aggregate measured pressure share; no unprovided momentum subcategories are invented.`, body);
}

// Sharp uses libvips/librsvg and supplies reliable local PNG rasterization.
// PNGs are optional companions; SVGs remain the editable, resolution-independent source.
if (process.argv.includes('--png')) {
  const require = createRequire(import.meta.url);
  const sharp = require('sharp');
  for (const file of resultFiles) await sharp(file, { density: 144 }).png().toFile(file.replace(/\.svg$/, '.png'));
}
console.log(`Generated ${resultFiles.length} SVG assets${process.argv.includes('--png') ? ' and PNG companions' : ''}.`);
