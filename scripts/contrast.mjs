// @ts-check
// check:contrast. Prints WCAG contrast ratios for every token pair in both
// themes and fails if a text pair is under 4.5:1 or a required graphic or
// focus pair is under 3:1. Decorative pairs are listed with their reason
// (docs/06-quality-bars.md section 2, decorative exemption).
import { read } from './lib/files.mjs';
import { TOKEN_FILE } from './token-rules.mjs';

const css = read(TOKEN_FILE).replace(/\/\*[\s\S]*?\*\//g, '');
const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');

/** @param {string} block */
function colors(block) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const m of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) out[m[1]] = m[2];
  return out;
}

const light = colors(css.slice(0, darkStart));
const themes = { light, dark: { ...light, ...colors(css.slice(darkStart)) } };

/** @param {string} hex */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** @param {string} a @param {string} b */
function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** [foreground, background, where it's used, kind, reason for exemption] */
/** @type {[string, string, string, 'text' | 'graphic' | 'decorative', string?][]} */
const PAIRS = [
  ['asphalt', 'fog', 'Body text, headings, links', 'text'],
  ['asphalt-soft', 'fog', 'Secondary text', 'text'],
  ['on-lane', 'lane', 'Primary button text; link highlighter (hover, focus)', 'text'],
  ['lane', 'on-lane', 'Primary button hover and focus text', 'text'],
  ['fog', 'asphalt', 'Secondary button hover and focus text', 'text'],
  // The ring is drawn 3 px outside the element (--focus-offset), so it always
  // sits on --fog, never on a lane or button fill.
  [
    'asphalt',
    'fog',
    'Focus ring (all elements, including highlighted links and buttons)',
    'graphic',
  ],
  // A button's boundary is its border against the page, in every state.
  ['asphalt', 'fog', 'Button borders, all states; diagram strokes (solid and dashed)', 'graphic'],
  [
    'concrete',
    'fog',
    '1 px rules, lane-line track, frame borders',
    'decorative',
    'Separators only; adjacent text and spacing carry the structure (WCAG 1.4.11)',
  ],
  [
    'lane',
    'fog',
    'Lane-line fill, in-progress status square',
    'decorative',
    'aria-hidden; the status word and scrollbar carry the meaning',
  ],
  [
    'viewport',
    'fog',
    'Sensor viewport panel edge',
    'decorative',
    'Illustration frame; the caption carries the meaning',
  ],
  ['concrete', 'viewport', 'Viewport border against the panel', 'decorative', 'Frame edge only'],
];
const MIN = { text: 4.5, graphic: 3 };

/** @type {string[]} */
const failures = [];
for (const kind of /** @type {const} */ (['text', 'graphic', 'decorative'])) {
  const title = {
    text: 'Text (4.5:1 required)',
    graphic: 'Required graphics and focus (3:1 required)',
    decorative: 'Decorative (exempt, listed with reasons)',
  }[kind];
  console.log(`\n### ${title}\n`);
  console.log(
    kind === 'decorative'
      ? '| Foreground on background | Use | Light | Dark | Reason |'
      : '| Foreground on background | Use | Light | Dark | Result |',
  );
  console.log('|---|---|---|---|---|');
  for (const [fg, bg, use, , reason] of PAIRS.filter((p) => p[3] === kind)) {
    const r = Object.fromEntries(Object.entries(themes).map(([t, c]) => [t, ratio(c[fg], c[bg])]));
    let last = reason ?? '';
    if (kind !== 'decorative') {
      const min = MIN[kind];
      const bad = Object.entries(r)
        .filter(([, v]) => v < min)
        .map(([t]) => t);
      for (const t of bad)
        failures.push(`--${fg} on --${bg} (${use}), ${t}: ${r[t].toFixed(2)} < ${min}`);
      last = bad.length ? `FAIL (${bad.join(', ')})` : 'pass';
    }
    console.log(
      `| \`--${fg}\` on \`--${bg}\` | ${use} | ${r.light.toFixed(2)} | ${r.dark.toFixed(2)} | ${last} |`,
    );
  }
}

if (failures.length) {
  console.log(`\ncheck:contrast: ${failures.length} failure(s)`);
  for (const f of failures) console.log(`FAIL  ${f}`);
  process.exitCode = 1;
} else {
  console.log(
    '\ncheck:contrast: every text pair is at least 4.5:1 and every required graphic and focus pair at least 3:1. Pass.',
  );
}
