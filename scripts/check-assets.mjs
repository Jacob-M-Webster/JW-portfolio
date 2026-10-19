// @ts-check
// check:assets. Proves no purchased raw asset is tracked, in history, or
// shipped (docs/05-3d-and-motion.md sections 2.1 and 9). Run after a build;
// the hash checks need assets-private/ and say "skipped" without it.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { brotliCompressSync, inflateRawSync } from 'node:zlib';
import { walk, ROOT } from './lib/files.mjs';

const PRIVATE = 'assets-private';
// --private DIR points the hash check at a fixture folder (to prove the check fails).
const flag = process.argv.indexOf('--private');
const HASH_SOURCE = flag > 0 ? process.argv[flag + 1] : PRIVATE;
const RAW_EXT = /\.(obj|fbx|gltf|glb|usdz|blend|mtl|zip)$/i;
const BIN = 'public/models/scene-points.bin';
const BUDGET = { raw: 450 * 1024, brotli: 350 * 1024 };
const TEXTURE_PX = 4096;

/** @type {string[]} */
const failures = [];
/** @param {string} label @param {boolean} ok @param {string} detail */
function report(label, ok, detail) {
  console.log(`${ok ? 'pass' : 'FAIL'}  ${label}: ${detail}`);
  if (!ok) failures.push(label);
}
const git = (/** @type {string[]} */ args) =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const sha256 = (/** @type {Buffer} */ buf) => createHash('sha256').update(buf).digest('hex');

console.log('## Git\n');
const tracked = git(['ls-files'])
  .split('\n')
  .filter((f) => /assets-private/i.test(f));
report('git ls-files', tracked.length === 0, `${tracked.length} tracked path(s) under ${PRIVATE}/`);
const history = git(['log', '--all', '--name-only', '--format=', '--', PRIVATE])
  .split('\n')
  .filter(Boolean);
report(
  'git log --all',
  history.length === 0,
  `${history.length} path(s) under ${PRIVATE}/ in any commit`,
);
const historyExt = git(['log', '--all', '--name-only', '--format='])
  .split('\n')
  .filter((f) => RAW_EXT.test(f));
report(
  'git history extensions',
  historyExt.length === 0,
  `${historyExt.length} raw-format path(s) ever committed`,
);

console.log('\n## Extensions\n');
for (const dir of ['dist', 'public']) {
  if (dir === 'dist' && !existsSync(join(ROOT, 'dist'))) {
    report('dist exists', false, 'run npm run build first');
    continue;
  }
  const hits = walk(dir, RAW_EXT);
  report(
    `${dir}/ raw extensions`,
    hits.length === 0,
    hits.length ? hits.join(', ') : 'none of .obj .fbx .gltf .glb .usdz .blend .mtl .zip',
  );
}

/** Entries of a zip archive (stored or deflated), read in memory. */
function zipEntries(/** @type {Buffer} */ buf) {
  /** @type {{ name: string, data: Buffer }[]} */
  const out = [];
  let at = 0;
  while (buf.readUInt32LE(at) === 0x04034b50) {
    const method = buf.readUInt16LE(at + 8);
    const size = buf.readUInt32LE(at + 18);
    const nameLen = buf.readUInt16LE(at + 26);
    const extraLen = buf.readUInt16LE(at + 28);
    const name = buf.toString('utf8', at + 30, at + 30 + nameLen);
    const start = at + 30 + nameLen + extraLen;
    const body = buf.subarray(start, start + size);
    out.push({ name, data: method === 8 ? inflateRawSync(body) : body });
    at = start + size;
  }
  return out;
}

/** Width and height of a PNG or JPEG, or null. */
function imageSize(/** @type {Buffer} */ b) {
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47)
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    let at = 2;
    while (at < b.length - 9) {
      const marker = b[at + 1];
      const len = b.readUInt16BE(at + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return [b.readUInt16BE(at + 7), b.readUInt16BE(at + 5)];
      at += 2 + len;
    }
  }
  return null;
}

console.log('\n## Hashes\n');
const privateDir = resolve(ROOT, HASH_SOURCE);
const privateFiles = existsSync(privateDir)
  ? readdirSync(privateDir, { recursive: true, encoding: 'utf8' })
      .map((f) => join(privateDir, f))
      .filter((f) => statSync(f).isFile())
  : [];
if (!privateFiles.length) {
  console.log(`skipped  ${HASH_SOURCE}/ not present here, so there is nothing to hash against`);
} else {
  /** @type {Map<string, string>} */
  const known = new Map();
  for (const f of privateFiles) {
    const buf = readFileSync(f);
    known.set(sha256(buf), f);
    if (/\.zip$/i.test(f))
      for (const e of zipEntries(buf)) known.set(sha256(e.data), `${f}:${e.name}`);
  }
  for (const dir of ['dist', 'public']) {
    const files = walk(dir, /./);
    const hits = files.filter((f) => known.has(sha256(readFileSync(join(ROOT, f)))));
    report(
      `${dir}/ hashes`,
      hits.length === 0,
      `${files.length} file(s) checked against ${known.size} raw file and archive-entry hashes; ${hits.length} match` +
        hits
          .map(
            (f) => `
      ${f} = ${known.get(sha256(readFileSync(join(ROOT, f))))}`,
          )
          .join(''),
    );
  }
}

console.log('\n## Textures\n');
const images = walk('dist', /\.(png|jpe?g)$/i);
const large = images.filter((f) => {
  const s = imageSize(readFileSync(join(ROOT, f)));
  return s && Math.max(...s) >= TEXTURE_PX;
});
report(
  'dist/ texture-sized images',
  large.length === 0,
  `${images.length} PNG/JPEG checked; ${large.length} at ${TEXTURE_PX} px or more`,
);

console.log('\n## Scene data\n');
if (!existsSync(join(ROOT, BIN))) report(BIN, false, 'missing');
else {
  const buf = readFileSync(join(ROOT, BIN));
  const br = brotliCompressSync(buf).length;
  report(`${BIN} raw`, buf.length <= BUDGET.raw, `${buf.length} bytes (budget ${BUDGET.raw})`);
  report(`${BIN} brotli`, br <= BUDGET.brotli, `${br} bytes (budget ${BUDGET.brotli})`);
}

if (failures.length) {
  console.log(`\ncheck:assets: ${failures.length} failure(s)`);
  process.exitCode = 1;
} else {
  console.log('\ncheck:assets: no raw asset tracked, in history, or shipped. Pass.');
}
