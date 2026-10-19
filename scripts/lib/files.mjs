// @ts-check
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

export const ROOT = join(import.meta.dirname, '..', '..');

/**
 * Files under `dir` (relative to the repo root) whose names match `pattern`.
 * @param {string} dir
 * @param {RegExp} pattern
 * @returns {string[]} repo-relative paths with forward slashes
 */
export function walk(dir, pattern) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(abs, { recursive: true, encoding: 'utf8' })) {
    const full = join(abs, entry);
    if (pattern.test(entry) && statSync(full).isFile()) {
      out.push(relative(ROOT, full).split(sep).join('/'));
    }
  }
  return out.sort();
}

/** @param {string} path repo-relative or absolute */
export function read(path) {
  return readFileSync(resolve(ROOT, path), 'utf8');
}

/**
 * 1-based line number of a character offset.
 * @param {string} text
 * @param {number} index
 */
export function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

/**
 * Prints findings and returns the process exit code.
 * @param {string} name
 * @param {{ file: string, line: number, rule: string, text: string }[]} errors
 * @param {{ file: string, line: number, rule: string, text: string }[]} [warnings]
 */
export function report(name, errors, warnings = []) {
  for (const w of warnings) console.log(`warn  ${w.file}:${w.line}  [${w.rule}]  ${w.text}`);
  for (const e of errors) console.log(`FAIL  ${e.file}:${e.line}  [${e.rule}]  ${e.text}`);
  const summary = `${name}: ${errors.length} error(s), ${warnings.length} warning(s)`;
  console.log(errors.length ? `\n${summary}` : `${summary}. Pass.`);
  return errors.length ? 1 : 0;
}
