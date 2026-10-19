// @ts-check
// Encodes the poster PNG masters (scripts/render_poster.py) to AVIF and WebP
// in public/posters/ (one set per theme). Uses the sharp that Astro already
// installs, called directly because the posters are small colored dots: AVIF
// needs 4:4:4 chroma to keep their color, and Astro's image service doesn't
// expose that.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/files.mjs';

const sharp = await import('sharp').then(
  (m) => m.default,
  () => {
    console.error('encode-posters: sharp not found; run npm ci (Astro installs it).');
    process.exit(1);
  },
);

const SRC = join(ROOT, '.posters-src');
const OUT = join(ROOT, 'public', 'posters');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
console.log(`sharp ${sharp.versions.sharp}, libvips ${sharp.versions.vips}`);

for (const file of readdirSync(SRC)
  .filter((f) => /^poster-.+\.png$/.test(f))
  .sort()) {
  const base = file.replace(/\.png$/, '');
  const input = readFileSync(join(SRC, file));
  const outputs = [
    [`${base}.avif`, sharp(input).avif({ quality: 62, effort: 9, chromaSubsampling: '4:4:4' })],
    [`${base}.webp`, sharp(input).webp({ quality: 80, effort: 6, smartSubsample: true })],
  ];
  for (const [name, pipeline] of /** @type {[string, import('sharp').Sharp][]} */ (outputs)) {
    const info = await pipeline.toFile(join(OUT, name));
    const hash = createHash('sha256')
      .update(readFileSync(join(OUT, name)))
      .digest('hex');
    console.log(`${name}: ${info.size} bytes, sha256 ${hash}`);
  }
}
