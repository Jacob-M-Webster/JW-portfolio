// @ts-check
// check:size. Budgets from docs/06-quality-bars.md section 1 and
// docs/05-3d-and-motion.md section 7, measured on dist/.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { walk, read, ROOT } from './lib/files.mjs';

const KB = 1024;
const BUDGET = {
  firstLoad: 400 * KB, // brotli, excluding the scene module and point file
  js: 100 * KB, // gzip, excluding the scene
  fonts: 90 * KB, // raw woff2, all font files
  sceneJs: 25 * KB, // gzip
  sceneBin: 450 * KB, // raw
  sceneBinBrotli: 350 * KB,
};
const HOST = 'www.jakewebster.dev';
const SCENE = /scene/i;

if (!existsSync(join(ROOT, 'dist'))) {
  console.log('check:size: dist/ not found. Run npm run build first.');
  process.exit(1);
}

/** @param {string} path dist-relative */
function sizes(path) {
  const buf = readFileSync(join(ROOT, 'dist', path));
  return {
    raw: buf.length,
    gzip: gzipSync(buf, { level: 9 }).length,
    br: brotliCompressSync(buf).length,
  };
}

const kb = (/** @type {number} */ n) => `${(n / KB).toFixed(1)} KB`;
/** @type {string[]} */
const failures = [];
const check = (
  /** @type {string} */ label,
  /** @type {number} */ value,
  /** @type {number} */ max,
) => {
  const ok = value <= max;
  if (!ok) failures.push(`${label}: ${kb(value)} > ${kb(max)}`);
  return `${kb(value)} / ${kb(max)} ${ok ? 'pass' : 'FAIL'}`;
};

/** Same-origin resources a page loads on first paint, plus third-party URLs. */
function firstLoad(/** @type {string} */ htmlPath) {
  const html = read(`dist/${htmlPath}`);
  const resources = new Set();
  /** @type {string[]} */
  const thirdParty = [];
  const tagRefs = [
    ...html.matchAll(/<link\b[^>]*\brel=["']?(stylesheet|preload|modulepreload|icon)["']?[^>]*>/g),
    ...html.matchAll(/<(script|img|source|video|iframe)\b[^>]*>/g),
  ];
  for (const [tag] of tagRefs) {
    for (const m of tag.matchAll(/\b(href|src)=["']([^"']+)["']/g)) {
      const url = m[2];
      if (/^(https?:)?\/\//.test(url)) {
        if (!url.includes(HOST)) thirdParty.push(url);
      } else if (!url.startsWith('data:')) {
        resources.add(url.replace(/^\//, '').split(/[?#]/)[0]);
      }
    }
  }
  for (const css of [...resources].filter((r) => r.endsWith('.css'))) {
    for (const m of read(`dist/${css}`).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      if (/^(https?:)?\/\//.test(m[1])) thirdParty.push(m[1]);
      else if (!m[1].startsWith('data:')) resources.add(m[1].replace(/^\//, ''));
    }
  }
  return { resources: [...resources].filter((r) => existsSync(join(ROOT, 'dist', r))), thirdParty };
}

const pages = walk('dist', /\.html$/).map((p) => p.replace(/^dist\//, ''));
console.log('| Page | First load (brotli) | JS (gzip) | Requests | Third-party |');
console.log('|---|---|---|---|---|');
for (const page of pages) {
  const { resources, thirdParty } = firstLoad(page);
  const counted = resources.filter((r) => !SCENE.test(r));
  const total = sizes(page).br + counted.reduce((sum, r) => sum + sizes(r).br, 0);
  const js = counted.filter((r) => /\.m?js$/.test(r)).reduce((sum, r) => sum + sizes(r).gzip, 0);
  if (thirdParty.length) failures.push(`${page}: third-party ${thirdParty.join(', ')}`);
  console.log(
    `| /${page} | ${check(`${page} first load`, total, BUDGET.firstLoad)} | ${check(`${page} JS`, js, BUDGET.js)} | ${counted.length + 1} | ${thirdParty.length} |`,
  );
}

const fonts = walk('dist', /\.(woff2?|ttf|otf)$/).map((p) => p.replace(/^dist\//, ''));
const fontTotal = fonts.reduce((sum, f) => sum + sizes(f).raw, 0);
console.log(
  `\nFonts (${fonts.length} files: ${fonts.map((f) => `${f} ${kb(sizes(f).raw)}`).join(', ')})`,
);
console.log(`  total ${check('fonts', fontTotal, BUDGET.fonts)}`);

const sceneJs = walk('dist', /\.m?js$/).filter((p) => SCENE.test(p));
const sceneBin = walk('dist', /\.bin$/);
if (!sceneJs.length && !sceneBin.length) console.log('Scene: no scene module or point file yet');
for (const f of sceneJs)
  console.log(
    `Scene module ${f}: ${check(f, sizes(f.replace(/^dist\//, '')).gzip, BUDGET.sceneJs)} gzip`,
  );
for (const f of sceneBin) {
  const s = sizes(f.replace(/^dist\//, ''));
  console.log(
    `Scene data ${f}: ${check(f, s.raw, BUDGET.sceneBin)} raw, ${check(`${f} brotli`, s.br, BUDGET.sceneBinBrotli)} brotli`,
  );
}

if (failures.length) {
  console.log(`\ncheck:size: ${failures.length} failure(s)`);
  for (const f of failures) console.log(`FAIL  ${f}`);
  process.exitCode = 1;
} else {
  console.log('\ncheck:size: all budgets met. Pass.');
}
