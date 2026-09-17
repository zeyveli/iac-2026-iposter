import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = [
  ['poster-assets/method-workflow.svg', 900, 1260],
  ['poster-assets/validation-summary.svg', 1100, 1000],
  ['poster-assets/performance-summary.svg', 1100, 1000],
  ...['01-blasius-validation', '02-half-staggered', '03-batched-lines', '04-gmg-convergence', '05-timestep-performance'].map(name => [`slider/${name}.svg`, 1600, 500])
];

for (const [name, width, height] of files) {
  test(`${name} provides a self-contained accessible export at the required aspect ratio`, () => {
    assert.ok(existsSync(root + name), `${name} must be generated`);
    const svg = readFileSync(root + name, 'utf8');
    assert.match(svg, new RegExp(`viewBox="0 0 ${width} ${height}"`));
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title[^>]*>[^<]+<\/title>/);
    assert.match(svg, /<desc[^>]*>[^<]+<\/desc>/);
    assert.match(svg, /#173b8f/);
    assert.doesNotMatch(svg, /<script|<foreignObject|(?:href|src)="https?:|NaN|undefined/);
  });
}

test('iteration figure labels measured CSV means instead of stale manuscript values', () => {
  const filename = root + 'slider/04-gmg-convergence.svg';
  assert.ok(existsSync(filename), 'convergence asset must exist');
  const svg = readFileSync(filename, 'utf8');
  for (const mean of ['6.63', '7.13', '7.90', '8.43']) assert.ok(svg.includes(mean), `missing mean ${mean}`);
  assert.ok(svg.includes('512'));
});

test('validation export preserves the error bound and explicitly identifies measured profiles', () => {
  const filename = root + 'poster-assets/validation-summary.svg';
  assert.ok(existsSync(filename), 'validation asset must exist');
  const svg = readFileSync(filename, 'utf8');
  assert.ok(svg.includes('0.12%'));
  assert.ok(svg.includes('Blasius'));
  assert.ok(svg.includes('Numerical'));
  assert.ok(svg.includes('0.11192%'));
});

test('iframe theme and generated graphics use the manuscript pink accent consistently', () => {
  const themedFiles = [
    'assets/css/style.css',
    ...files.map(([name]) => name)
  ];

  for (const name of themedFiles) {
    const contents = readFileSync(root + name, 'utf8').toLowerCase();
    assert.ok(contents.includes('#f45c8b'), `${name} must use the manuscript pink accent`);
    assert.doesNotMatch(contents, /#a84d1c/, `${name} must not retain the former orange accent`);
  }

  const css = readFileSync(root + 'assets/css/style.css', 'utf8').toLowerCase();
  assert.ok(css.includes('#f9d0e4'), 'iframe theme must include the pale manuscript pink');
  for (const [name] of files) {
    const svg = readFileSync(root + name, 'utf8').toLowerCase();
    assert.doesNotMatch(svg, /#(?:fff1e7|fbf1e8)/, `${name} must not retain a pale orange background`);
  }
});
