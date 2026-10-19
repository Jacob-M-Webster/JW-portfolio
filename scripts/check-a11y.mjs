// @ts-check
// check:a11y. Runs axe-core on every route in light and dark and fails on any
// violation (docs/06-quality-bars.md section 2). Needs a server running:
// `npm run preview` after a build (or `npm run dev`); BASE_URL overrides
// http://localhost:4321.
import { chromium } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { report } from './lib/files.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const ROUTES = (
  process.env.ROUTES ?? '/,/projects/spot,/projects/wayfinder,/projects/baton,/404'
).split(',');
const SCHEMES = /** @type {const} */ (['light', 'dark']);
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** @typedef {{ file: string, line: number, rule: string, text: string }} Finding */
/** @type {Finding[]} */
const errors = [];

const browser = await chromium.launch();
console.log('| Route | Theme | Rules passed | Violations |');
console.log('|---|---|---|---|');
for (const route of ROUTES) {
  for (const colorScheme of SCHEMES) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme,
    });
    const page = await context.newPage();
    // The 404 route answers with status 404 on purpose; only the markup matters.
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    for (const v of results.violations) {
      for (const node of v.nodes) {
        errors.push({
          file: `${route} (${colorScheme})`,
          line: 0,
          rule: v.id,
          text: `${node.target.join(' ')}: ${v.help}`,
        });
      }
    }
    console.log(
      `| ${route} | ${colorScheme} | ${results.passes.length} | ${results.violations.length} |`,
    );
    await context.close();
  }
}
await browser.close();

process.exitCode = report('check:a11y', errors);
