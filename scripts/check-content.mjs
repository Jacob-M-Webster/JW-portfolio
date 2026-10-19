// @ts-check
// check:content. Always fails on forbidden claims, banned words and
// incomplete project files. TODO(jake) fails only in strict mode (--strict, or
// VERCEL_ENV=production on Vercel's production builds); otherwise it warns.
// Warn-level rules stay warnings in every mode. With --dist it scans the
// build output too.
import { walk, read, lineOf, report } from './lib/files.mjs';
import { FORBIDDEN, BANNED_WORDS, ALLOWED_PHRASES, PROJECT_KEYS } from './content-rules.mjs';

/** @typedef {{ file: string, line: number, rule: string, text: string }} Finding */
/** @type {Finding[]} */
const errors = [];
/** @type {Finding[]} */
const warnings = [];

const args = process.argv.slice(2);
const dist = args.includes('--dist');
const strict = args.includes('--strict') || process.env.VERCEL_ENV === 'production';
const paths = args.filter((a) => !a.startsWith('--'));

// TODO scan covers every text file; claim and word rules cover copy only
// (markup, Markdown, JSON, HTML), not CSS or script source.
const COPY = /\.(astro|md|mdx|json|html|txt|xml)$/;
const files = paths.length
  ? paths
  : [
      ...walk('content', /\.(md|mdx|json)$/),
      ...walk('src', /\.(astro|md|mdx|json|ts|js|mjs|css|html)$/),
      ...(dist ? walk('dist', /\.(html|js|css|xml|txt|json)$/) : []),
    ];

const BANNED = BANNED_WORDS.map((w) => ({
  word: w,
  re: new RegExp(`(?<![\\w-])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'gi'),
}));

/** Blank out approved phrases so their words aren't flagged. */
function maskAllowed(/** @type {string} */ text) {
  return ALLOWED_PHRASES.reduce((t, re) => t.replace(re, (m) => ' '.repeat(m.length)), text);
}

for (const file of files) {
  const text = read(file);
  const add = (
    /** @type {number} */ i,
    /** @type {string} */ rule,
    /** @type {string} */ found,
    list = errors,
  ) => list.push({ file, line: lineOf(text, i), rule, text: found });

  for (const m of text.matchAll(/TODO\(jake\)[^\n]{0,80}/g)) {
    const finding = { file, line: lineOf(text, m.index ?? 0), rule: 'todo-jake', text: m[0] };
    (strict ? errors : warnings).push(finding);
  }
  if (!COPY.test(file)) continue;

  const copy = maskAllowed(text);
  for (const rule of FORBIDDEN) {
    if (rule.scope && !rule.scope.test(file)) continue;
    const re = new RegExp(
      rule.re.source,
      rule.re.flags.includes('g') ? rule.re.flags : rule.re.flags + 'g',
    );
    for (const m of copy.matchAll(re))
      add(
        m.index ?? 0,
        `forbidden:${rule.id} (02 ${rule.source})`,
        m[0],
        rule.level === 'warn' ? warnings : errors,
      );
  }
  for (const { word, re } of BANNED) {
    for (const m of copy.matchAll(re)) add(m.index ?? 0, `banned-word (02 F)`, `${m[0]} [${word}]`);
  }

  if (/(^|\/)content\/projects\/[^/]+\.mdx?$/.test(file)) {
    const fm = /^---\n([\s\S]*?)\n---/.exec(text.replace(/\r\n/g, '\n'));
    const keys = new Set(
      (fm?.[1] ?? '')
        .split('\n')
        .map((l) => /^(\w+):/.exec(l)?.[1])
        .filter(Boolean),
    );
    for (const key of PROJECT_KEYS) if (!keys.has(key)) add(0, 'frontmatter', `missing "${key}"`);
    if (!/^#{2,3}\s+What isn['’]t done\s*$/m.test(text))
      add(0, 'section', `missing "What isn't done"`);
  }
}

const mode = strict
  ? 'strict: TODO(jake) fails'
  : 'TODO(jake) warns; --strict or VERCEL_ENV=production makes it fail';
console.log(
  `check:content: scanned ${files.length} files${dist ? ' (including dist/)' : ''} [${mode}]`,
);
process.exitCode = report('check:content', errors, warnings);
