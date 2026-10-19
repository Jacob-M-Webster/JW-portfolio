// @ts-check
// Captures each route at 375, 768, 1280 and 1920 px in light and dark.
// Needs `npm run dev` running. Elements with data-force="hover|focus-visible|
// active|visited" get that pseudo-state through the DevTools protocol.
// Also audits fonts: every family/weight/style in use must be one the shipped
// files cover, so nothing renders as faux bold or italic.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { ROOT } from './lib/files.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const OUT = join(ROOT, '.screenshots', process.env.SHOTS_DIR ?? 'stage1');
const ROUTES = (process.env.ROUTES ?? '/styleguide,/').split(',');
const WIDTHS = [375, 768, 1280, 1920];
const SCHEMES = /** @type {const} */ (['light', 'dark']);

/** Faces the site ships: family -> [min weight, max weight], normal style only. */
const FACES = { Overpass: [400, 700], 'JW Serif': [400, 400] };

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
/** @type {Set<string>} */
const combos = new Set();
/** @type {string[]} */
const problems = [];

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    for (const colorScheme of SCHEMES) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme });
      const page = await context.newPage();
      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      const cdp = await context.newCDPSession(page);
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
        nodeId: root.nodeId,
        selector: '[data-force]',
      });
      for (const nodeId of nodeIds) {
        const { attributes } = await cdp.send('DOM.getAttributes', { nodeId });
        const state = attributes[attributes.indexOf('data-force') + 1];
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [state] });
      }

      const used = await page.evaluate(() => {
        const out = new Set();
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement;
          if (!el || !n.textContent?.trim() || !el.checkVisibility()) continue;
          const s = getComputedStyle(el);
          out.add(
            `${s.fontFamily.split(',')[0].replace(/["']/g, '').trim()}|${s.fontWeight}|${s.fontStyle}`,
          );
        }
        return [...out];
      });
      for (const c of used) {
        combos.add(c);
        const [family, weight, style] = c.split('|');
        const range = FACES[/** @type {keyof typeof FACES} */ (family)];
        const ok = range && style === 'normal' && +weight >= range[0] && +weight <= range[1];
        if (!ok) problems.push(`${route} ${width} ${colorScheme}: ${family} ${weight} ${style}`);
      }

      const name = `${route === '/' ? 'home' : route.replace(/\//g, '')}-${width}-${colorScheme}.png`;
      await page.screenshot({ path: join(OUT, name), fullPage: true });
      console.log(`saved ${name}`);
      await context.close();
    }
  }
}
await browser.close();

console.log(`\nFont combinations in use: ${[...combos].sort().join(', ')}`);
if (problems.length) {
  console.log(
    `Unsupported (would be faux or substituted):\n  ${[...new Set(problems)].join('\n  ')}`,
  );
  process.exitCode = 1;
} else {
  console.log(
    'Font audit: every family, weight and style in use is covered by a shipped face. Pass.',
  );
}
