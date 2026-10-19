// @ts-check
// check:tokens. Fails on raw colors outside the token file, banned CSS,
// off-scale spacing, off-list breakpoints, misuse of --lane/--concrete, and
// the markup bans from docs/08-review-checklists.md section 2.
import { walk, read, lineOf, report } from './lib/files.mjs';
import {
  TOKEN_FILE,
  DEV_ONLY,
  BREAKPOINTS,
  SPACING_VARS,
  RESTRICTED_COLORS,
  BANS,
} from './token-rules.mjs';

/** @typedef {{ file: string, line: number, rule: string, text: string }} Finding */
/** @type {Finding[]} */
const errors = [];
/** @type {Finding[]} */
const warnings = [];

const SPACING_PROP =
  /^(margin|padding)(-(top|right|bottom|left|inline|block)(-(start|end))?)?$|^(row-|column-)?gap$/;
const LITERAL = /(?<![\w-])-?\d*\.?\d+(px|rem|em|vh|vw|svh|dvh|lvh|%)(?![\w-])/g;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

/** Blank out comments, keeping offsets and line numbers. */
function stripComments(/** @type {string} */ css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/** Split on commas that are not inside parentheses or brackets. */
function splitTop(/** @type {string} */ text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

/**
 * Walks a stylesheet and calls back for each at-rule prelude and declaration.
 * @param {string} css
 * @param {(d: { prop: string, value: string, index: number, selector: string, atRules: string[] }) => void} onDecl
 * @param {(prelude: string, index: number) => void} onAtRule
 */
function walkCss(css, onDecl, onAtRule) {
  /** @type {{ kind: 'at' | 'rule', text: string }[]} */
  const stack = [];
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '{') {
      const prelude = css.slice(start, i).trim();
      if (prelude.startsWith('@')) {
        onAtRule(prelude, start + css.slice(start, i).indexOf('@'));
        stack.push({ kind: 'at', text: prelude });
      } else {
        stack.push({ kind: 'rule', text: prelude });
      }
      start = i + 1;
    } else if (c === ';' || c === '}') {
      const chunk = css.slice(start, i);
      const colon = chunk.indexOf(':');
      const top = stack.at(-1);
      if (colon > 0 && top && (top.kind === 'rule' || top.text.startsWith('@font-face'))) {
        const lead = chunk.length - chunk.trimStart().length;
        onDecl({
          prop: chunk.slice(0, colon).trim().toLowerCase(),
          value: chunk.slice(colon + 1).trim(),
          index: start + lead,
          selector: top.kind === 'rule' ? top.text : top.text,
          atRules: stack.filter((s) => s.kind === 'at').map((s) => s.text),
        });
      }
      if (c === '}') stack.pop();
      start = i + 1;
    }
  }
}

/**
 * Checks the literals and var() references in a spacing value.
 * @returns {{ errors: string[], warnings: string[] }}
 */
function checkSpacing(/** @type {string} */ value) {
  const out = { errors: /** @type {string[]} */ ([]), warnings: /** @type {string[]} */ ([]) };
  for (const m of value.matchAll(/var\((--[\w-]+)/g)) {
    if (!SPACING_VARS.test(m[1])) out.errors.push(`${m[1]} is not a spacing token`);
  }
  // Literals inside calc()/min()/max()/clamp() warn; bare literals fail.
  let depth = 0;
  let fnDepth = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') {
      depth++;
      if (/(calc|min|max|clamp)$/.test(value.slice(0, i))) fnDepth = fnDepth || depth;
    } else if (value[i] === ')') {
      if (depth === fnDepth) fnDepth = 0;
      depth--;
    } else {
      LITERAL.lastIndex = i;
      const m = LITERAL.exec(value);
      if (m && m.index === i) {
        const msg = `literal ${m[0]}`;
        if (fnDepth) out.warnings.push(`${msg} inside a computed value`);
        else if (depth === 0) out.errors.push(msg);
        i += m[0].length - 1;
      }
    }
  }
  return out;
}

/**
 * @param {string} file
 * @param {string} css  stylesheet text (comments already stripped)
 * @param {string} whole  the full file, for line numbers
 * @param {number} offset  where `css` starts in `whole`
 */
function checkCss(file, css, whole, offset) {
  const at = (/** @type {number} */ i) => lineOf(whole, offset + i);
  const add = (
    /** @type {Finding[]} */ list,
    /** @type {number} */ i,
    /** @type {string} */ rule,
    /** @type {string} */ text,
  ) => list.push({ file, line: at(i), rule, text });

  for (const [rule, re, cssOnly] of BANS) {
    if (!cssOnly) continue;
    for (const m of css.matchAll(re)) add(errors, m.index ?? 0, rule, m[0]);
  }
  if (file !== TOKEN_FILE) {
    for (const m of css.matchAll(HEX)) add(errors, m.index ?? 0, 'raw-hex', m[0]);
    for (const m of css.matchAll(/\b(rgba?|hsla?|oklch|lab|lch)\(/g)) {
      add(errors, m.index ?? 0, 'raw-color', m[0]);
    }
  }

  walkCss(
    css,
    ({ prop, value, index, selector, atRules }) => {
      const inFontFace = atRules.some((a) => a.startsWith('@font-face'));
      const forced = atRules.some((a) => a.includes('forced-colors'));

      if (
        /^border(-\w+)*-radius$|^border-radius$/.test(prop) &&
        !/^(var\(--radius\)|0)$/.test(value)
      ) {
        add(errors, index, 'radius', `${prop}: ${value}`);
      }
      if (
        prop === 'font-family' &&
        !inFontFace &&
        !/^(var\(--font-(sans|serif)\)|inherit)$/.test(value)
      ) {
        add(errors, index, 'font-family', value);
      }
      if (prop === 'letter-spacing' && value !== 'var(--tracking-display)') {
        add(errors, index, 'letter-spacing', value);
      }
      if (SPACING_PROP.test(prop)) {
        const r = checkSpacing(value);
        for (const e of r.errors) add(errors, index, 'spacing', `${prop}: ${value} (${e})`);
        for (const w of r.warnings) add(warnings, index, 'spacing', `${prop}: ${value} (${w})`);
      }
      if (!DEV_ONLY.test(file) && !forced) {
        for (const [token, allowed] of Object.entries(RESTRICTED_COLORS)) {
          if (!value.includes(`var(--${token})`)) continue;
          const ok = splitTop(selector).every((s) => allowed.some((re) => re.test(s)));
          if (!ok) add(errors, index, `${token}-use`, `${selector} { ${prop}: ${value} }`);
        }
      }
    },
    (prelude, index) => {
      if (!prelude.startsWith('@media')) return;
      for (const m of prelude.matchAll(/\((min|max)-width\s*:\s*([^)]+)\)/g)) {
        const px = /^(\d+)px$/.exec(m[2].trim());
        if (m[1] === 'max')
          add(errors, index, 'breakpoint', `${m[0]} (mobile-first: min-width only)`);
        else if (!px || !BREAKPOINTS.includes(Number(px[1]))) {
          add(errors, index, 'breakpoint', `${m[0]} (allowed: ${BREAKPOINTS.join(', ')} px)`);
        }
      }
    },
  );
}

/** Markup checks for .astro/.md/.html (outside <style> blocks). */
function checkMarkup(
  /** @type {string} */ file,
  /** @type {string} */ markup,
  /** @type {string} */ whole,
) {
  const add = (/** @type {number} */ i, /** @type {string} */ rule, /** @type {string} */ text) =>
    errors.push({ file, line: lineOf(whole, i), rule, text });
  // Ignore Astro frontmatter for tag checks, but not for bans.
  const tags = markup.replace(/^---[\s\S]*?---/, (m) => m.replace(/[^\n]/g, ' '));

  for (const m of tags.matchAll(/\sstyle=["'{]/g)) add(m.index ?? 0, 'inline-style', m[0].trim());
  for (const m of tags.matchAll(/<(em|strong|b|i)(?=[\s>])/g))
    add(m.index ?? 0, 'synthetic-style', m[0]);
  for (const m of tags.matchAll(/<img\b[^>]*>/g)) {
    if (!/\swidth=/.test(m[0]) || !/\sheight=/.test(m[0]))
      add(m.index ?? 0, 'img-size', m[0].slice(0, 60));
  }
  if (!DEV_ONLY.test(file)) {
    for (const m of tags.matchAll(/var\(--(lane|concrete)\)/g)) {
      add(
        m.index ?? 0,
        `${m[1]}-use`,
        `${m[0]} in markup (graphics that carry meaning use --asphalt)`,
      );
    }
  }
  for (const m of tags.matchAll(HEX)) add(m.index ?? 0, 'raw-hex', m[0]);
}

// Paths on the command line replace the default scan (used to test the rules).
const args = process.argv.slice(2);
const files = args.length
  ? args
  : [...walk('src', /\.(css|astro|ts|js|mjs|md|html)$/), ...walk('content', /\.(md|json)$/)];

for (const file of files) {
  const text = read(file);

  for (const [rule, re, cssOnly] of BANS) {
    if (cssOnly) continue;
    for (const m of text.matchAll(re))
      errors.push({ file, line: lineOf(text, m.index ?? 0), rule, text: m[0] });
  }
  for (const m of text.matchAll(/\p{Extended_Pictographic}/gu)) {
    if (!/[©®™]/.test(m[0]))
      errors.push({ file, line: lineOf(text, m.index ?? 0), rule: 'emoji', text: m[0] });
  }

  if (file.endsWith('.css')) {
    checkCss(file, stripComments(text), text, 0);
  } else if (/\.(astro|html|md)$/.test(file)) {
    let markup = text;
    for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
      const start = (m.index ?? 0) + m[0].indexOf('>') + 1;
      checkCss(file, stripComments(m[1]), text, start);
      markup =
        markup.slice(0, m.index) +
        m[0].replace(/[^\n]/g, ' ') +
        markup.slice((m.index ?? 0) + m[0].length);
    }
    checkMarkup(file, markup, text);
  } else {
    for (const m of text.matchAll(HEX))
      errors.push({ file, line: lineOf(text, m.index ?? 0), rule: 'raw-hex', text: m[0] });
  }
}

console.log(`check:tokens: scanned ${files.length} files`);
process.exitCode = report('check:tokens', errors, warnings);
