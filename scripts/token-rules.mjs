// @ts-check
// Rules for check:tokens. Spec: docs/03-design-system.md sections 3 and 8,
// docs/08-review-checklists.md section 2 (quick scans).

/** The only file allowed raw color values. */
export const TOKEN_FILE = 'src/styles/tokens.css';

/** Files where the --lane/--concrete allowlist does not apply (never shipped). */
export const DEV_ONLY = /^src\/dev\//;

export const BREAKPOINTS = [480, 768, 1024, 1280, 1440];

/** Custom properties allowed in margin, padding and gap. */
export const SPACING_VARS = /^--(space-\d+|gutter|button-pad-inline)$/;

/**
 * Where --lane and --concrete may be used (03 section 3.1). Each entry is a
 * selector pattern; a declaration using the token must sit in a rule whose
 * every selector matches one of them.
 */
export const RESTRICTED_COLORS = {
  lane: [
    /^\.button\[data-variant='primary'\](:hover|:focus-visible)?$/,
    /^a:(hover|focus-visible)$/,
    /^\.lane-line\b/,
    /^\.status-square\b/,
  ],
  concrete: [
    /^\.rule\b/,
    /^\.lane-line\b/,
    /^\.status-square\b/,
    /^\.viewport\b/,
    /^\.figure-frame\b/,
  ],
};

/** Simple pattern bans: [rule id, regex, applies to CSS (true) or any text (false)]. */
/** @type {[string, RegExp, boolean][]} */
export const BANS = [
  ['important', /!important/g, true],
  ['gradient', /gradient\s*\(/g, true],
  ['backdrop-filter', /backdrop-filter\s*:/g, true],
  ['box-shadow', /box-shadow\s*:/g, true],
  ['text-shadow', /text-shadow\s*:/g, true],
  ['blur', /filter\s*:[^;]*blur\(/g, true],
  ['uppercase', /text-transform\s*:\s*uppercase/g, true],
  ['small-caps', /small-caps|font-variant-caps/g, true],
  ['outline-none', /outline\s*:\s*(none|0)\b/g, true],
  ['client-router', /ClientRouter/g, false],
  ['arrow-glyph', /[→›↗➜]/g, false],
  ['lorem', /\blorem\b|\bipsum\b/gi, false],
];
