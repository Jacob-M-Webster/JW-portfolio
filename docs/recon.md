# Stage 0 recon

Written 2026-10-19 on branch `redesign` at commit `c8073ac`. This file is the only file created in Stage 0. Nothing else in the repo was modified. `npm run build` wrote `dist/` and `.astro/`, which are both gitignored.

This is a report on what exists. It proposes no design and no copy.

---

## 0. Doc issues found while reading (need Jake's call)

These come first because they affect every later stage. Per the build plan's rule, "if a doc is wrong, say so and ask", none of them were fixed.

1. **The numbered docs are shifted by one file.** The file names don't match their contents:

   | File | Its first heading | SHA-256 note |
   |---|---|---|
   | `docs/01-brief.md` | `# 01. Brief` | |
   | `docs/02-content.md` | `# 01. Brief` | byte-identical to `01-brief.md` |
   | `docs/03-design-system.md` | `# 02. Content` | |
   | `docs/04-site-flow.md` | `# 03. Design system` | |
   | `docs/05-3d-and-motion.md` | `# 04. Site flow` | |
   | `docs/06-quality-bars.md` | `# 05. 3D and motion` | |
   | `docs/07-build-plan.md` | `# 06. Quality bars` | |
   | `docs/08-review-checklists.md` | `# 07. Build plan` | |

   Every cross-reference by file name (for example "follow `docs/02-content.md`") points at the wrong text.
2. **The "08. Review checklists" content does not exist** in the repo. The claims audit, anti-slop audit, device checks, and launch checklist referenced throughout are missing, so Stage 1 onward has no end-of-stage checklist to run.
3. **`docs/README.md` is byte-identical to `CLAUDE.md`.** That's harmless, but the two can drift.
4. **Stage 0 deliverables conflict.** The build plan lists "`CLAUDE.md` 'Commands' section filled in", but this stage's instruction allowed only `docs/recon.md`. The commands are in section 4 below so they can be copied across. Note also that `CLAUDE.md` is listed in `.gitignore`, so it's local-only and never committed.

In the rest of this report, docs are referred to **by their content title** (for example "the content doc"), not by file name.

---

## 1. Framework, language, package manager, Node, dependencies

| Item | Value | Evidence |
|---|---|---|
| Framework | Astro 7.0.3, default config (`astro.config.mjs` is an empty `defineConfig({})`) | `node_modules/astro/package.json` |
| Output mode | `static` | the build log prints `output: "static"` |
| Language | Astro components (`.astro`), CSS, one plain JS file. `tsconfig.json` extends `astro/tsconfigs/strict`, but there are no `.ts` files | `git ls-files` |
| Package manager | npm 11.11.0; `package-lock.json` committed | `npm -v` |
| Node | Local v24.12.0. `package.json` `engines.node` is `>=22.12.0`. No `.nvmrc` or `.node-version`; Vercel's Node version is not pinned in the repo | `node -v` |
| Editor config | `.vscode/extensions.json` recommends the Astro extension; `.vscode/launch.json` runs `astro dev` | |

**Direct dependencies:** one.

| Package | Version | What it's for |
|---|---|---|
| `astro` | ^7.0.3 (7.0.3 installed) | Static site generator: components, routing, bundling, image optimization |

There are no devDependencies.

**Transitive dependencies worth knowing:** there are 207 packages in the installed tree, all pulled in by `astro`.

| Package | What it's for |
|---|---|
| `vite`, `rolldown`, `esbuild` | Dev server and production bundling of JS and CSS |
| `sharp`, `@img/sharp-win32-x64`, `@img/colour` | Image transcoding behind `astro:assets` (`<Image>`), which produced the WebP files in `dist/_astro/` |
| `svgo` | SVG optimization available to the asset pipeline |
| `js-yaml`, `semver`, `nanoid`, `is-docker`, `is-inside-container`, `am-i-vibing` | Astro CLI internals (config/frontmatter parsing, version checks, IDs, environment detection) |

**Extraneous packages:** `npm ls --depth=0` reports 6 packages installed in `node_modules` but not declared anywhere: `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`, and `tslib`. They're most likely leftovers from an earlier install (WASM fallbacks for native bundlers). They don't affect the build output, and `npm prune` would remove them. Not done here.

---

## 2. Routes and pages that exist

| Route | Source | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` (253 lines) | The only page. In-page anchors: `#hero-section`, `#about`, `#experience`, `#education`, `#projects`, `#contact` |
| `/Jacob_Webster_Resume.pdf` | `public/` | Static file |
| `/favicon.svg`, `/favicon.ico` | `public/` | |
| `/michelin_logo.svg`, `/USC_text_logo.svg`, `/c4is_logo.svg`, `/cuhackit_logo.svg` | `public/` | Used as `<img>` in the page |

There are no layouts, no components folder, no 404 page, no project pages, no `sitemap.xml`, and no `robots.txt`.

**Live host behavior** (curl against `https://www.jakewebster.dev`, 2026-10-19):

| Request | Result |
|---|---|
| `https://jakewebster.dev/` | `308` to `https://www.jakewebster.dev/` (apex redirects to www) |
| `/` | `200`, `Server: Vercel`, `Strict-Transport-Security: max-age=63072000` |
| `/index.html` | `200` |
| `/Jacob_Webster_Resume.pdf` | `200` |
| `/jacob-webster-resume.pdf` (spec path, D8) | `404` |
| `/nope`, `/nope/`, `/404` | `404` (Vercel's default page; the repo has no custom 404) |

Trailing-slash behavior for nested routes like `/projects/spot` vs `/projects/spot/` can't be observed yet because no nested route exists. Astro's default (`trailingSlash: "ignore"`, `build.format: "directory"`) emits `projects/spot/index.html`. Verify both forms on the first Vercel preview deployment in Stage 2 and record it in the decision log. The site flow doc asks for this decision. It isn't made here.

---

## 3. Where content currently lives

- **All copy is hard-coded in `src/pages/index.astro`**: hero, about, three experience entries, education, three projects, and contact links. There are no content files, collections, JSON, or Markdown, so this fails "Reader C" in the brief as it stands.
- **Styles:** `src/styles/global.css` (455 lines). It has its own `:root` token set (`--bg`, `--ink`, `--accent: #2b6cff`, and others), a monospace family used across nav, labels and meta, and one `@media (max-width: 860px)` breakpoint.
- **Script:** `src/scripts/nav.js` (scroll listener that highlights the active nav link). Astro bundles it inline as a `<script type="module">` in `dist/index.html`.
- **Images processed by Astro** (`src/assets/`, 7 files, about 6.1 MB of source): `DSC06603.JPG` (hero photo of Jake), `michelin.jpg` (intern cohort photo), `Organizer_Photo_2.JPG` (3.0 MB, CUhackit organizer team), `videoframe_2529.png` (Caelus render), `AstroAegisKValueMap.jpg`, `SmartaMap.png`, `QuickChartsHomePage.png`.
- **Static files** (`public/`): four organization logos as SVG, the favicon pair, and the resume PDF.
- **Fonts:** JetBrains Mono, loaded from Google Fonts (`fonts.googleapis.com` and `fonts.gstatic.com`). The body uses Arial or Helvetica.
- **Private assets:** `assets-private/` holds three folders of the purchased Jaguar I-PACE / Waymo Driver low-poly car model. The folder is gitignored, and `git log --all --name-only` contains zero paths under `assets-private`. Nothing from it is in `dist/`.

---

## 4. Commands (build run and verified)

| Purpose | Command | Status |
|---|---|---|
| Install | `npm ci` | Lockfile present (not re-run; `node_modules` already installed) |
| Dev server | `npm run dev` (→ `astro dev`, http://localhost:4321) | Defined |
| Production build | `npm run build` (→ `astro build`, output in `dist/`) | **Ran, exit 0** |
| Preview build | `npm run preview` (→ `astro preview`) | **Ran** (served the Lighthouse runs) |
| Lint / format / type check | **None.** There's no ESLint, Prettier, or Stylelint config, and no `lint` script. `astro check` needs `@astrojs/check`, which isn't installed (it wasn't run, because it offers to modify `package.json`) | Missing |
| Tests | None | Missing |
| Deploy | **Vercel, apparently via git integration.** There's no `vercel.json`, no `.github/` workflows, and no CLI script in the repo. The live site responds with `Server: Vercel` and `X-Vercel-Cache`. The build command, output directory, production branch, and Node version are set in the Vercel dashboard, not in the repo. **Jake should confirm those settings, and whether pushes to `redesign` create preview deployments.** | Inferred, not verifiable from the repo |

**Build output** (`npm run build`, 2026-10-19, ANSI color codes stripped, the 22 image lines condensed):

```
> jw-portfolio@0.0.1 build
> astro build

00:28:37 [types] Generated 48ms
00:28:37 [build] output: "static"
00:28:37 [build] mode: "static"
00:28:37 [build] directory: C:\Users\jakew\OneDrive\Desktop\Portfolio\JW-portfolio\dist\
00:28:37 [build] Collecting build info...
00:28:37 [build] ✓ Completed in 64ms.
00:28:37 [build] Building static entrypoints...
00:28:38 [vite] ✓ built in 350ms
00:28:38 [vite] ✓ built in 19ms
00:28:38 [build] Rearranging server assets...

 generating static routes
00:28:38   ├─ /index.html (+26ms)
00:28:38 ✓ Completed in 39ms.

 generating optimized images
00:28:38   ▶ /_astro/michelin.wLIG9YyY_lT3DJ.webp (reused cache entry) (+2ms) (1/22)
   … 20 more WebP variants (3 widths for each of the 7 source images) …
00:28:38   ▶ /_astro/DSC06603.UoYz1bON_nsXgR.webp (reused cache entry) (+3ms) (22/22)
00:28:38 ✓ Completed in 11ms.

00:28:38 [build] ✓ Completed in 494ms.
00:28:38 [build] 1 page(s) built in 559ms
00:28:38 [build] Complete!
EXIT 0
```

**`dist/` summary:** 1 HTML page (12.4 KB), 1 CSS file (7.3 KB), **0 external JS files** (one small inline module), 22 WebP variants (2.2 MB total; the largest is `Organizer_Photo_2…1hYRyB.webp` at 1.05 MB), 4 logo SVGs (137 KB), the favicons, and the resume PDF (106 KB).

---

## 5. Lighthouse mobile baseline (home page)

**Setup:** Lighthouse 12.8.2 via `npx lighthouse@12`, the default mobile preset (`formFactor: mobile`, `throttlingMethod: simulate`), headless Chrome on Jake's machine. The target was the production build served by `npm run preview` at `http://localhost:4321/`. Three runs; the reports were saved outside the repo.

| Metric | Run 1 | Run 2 | Run 3 | **Median** | Bar (quality doc) |
|---|---|---|---|---|---|
| Performance | 93 | 99 | 99 | **99** | 90 or higher (pass) |
| Accessibility | 96 | 96 | 96 | **96** | 100 (fail) |
| Best practices | 100 | 100 | 100 | **100** | 100 (pass) |
| SEO | 91 | 91 | 91 | **91** | 100 (fail) |
| First Contentful Paint | 2.43 s | 1.48 s | 1.44 s | **1.48 s** | |
| Largest Contentful Paint | 2.65 s | 1.73 s | 1.73 s | **1.73 s** | 2.5 s or less (pass) |
| Total Blocking Time | 0 ms | 0 ms | 0 ms | **0 ms** | 200 ms or less (pass) |
| Cumulative Layout Shift | 0.000 | 0.000 | 0.000 | **0.000** | 0.05 or less (pass) |
| Speed Index | 2.75 s | 1.48 s | 1.44 s | **1.48 s** | |
| Total transfer | 327 KB | 327 KB | 327 KB | **327 KB** | 400 KB or less (pass) |

Run 1 was a cold start (first Chrome launch and first font fetch). Runs 2 and 3 agree.

**What's behind the gaps (median run):**
- **Accessibility 96:**
  - `color-contrast`: white on `#2b6cff` in the section eyebrow labels, and `#2b6cff` on white in the `01/02/03` project numbers, both measure 4.47:1 against a required 4.5:1.
  - `aria-allowed-role`: `<article role="listitem">` on the three project rows.
- **SEO 91:** no `<meta name="description">`.
- **Performance opportunities:**
  - Render-blocking resources (estimated 790 ms): the Google Fonts stylesheet and the site CSS.
  - Image delivery (estimated 143 KiB) and responsive images (estimated 87 KiB): the Michelin cohort photo ships a 106 KB variant to a phone.
- **Third-party requests: 2 origins** (`fonts.googleapis.com`, `fonts.gstatic.com`). The quality doc's bar is 0.
- **LCP element:** the hero photo (`DSC06603…dzjT5.webp`, 28.5 KB, `fetchpriority="high"`, explicit width and height).

Caveat: this is a local preview with simulated throttling. It isn't the live Vercel URL, so Vercel's compression and CDN aren't reflected. That matches the quality doc's method ("production build served locally or from a preview deployment").

---

## 6. What's worth keeping and what should go

### Keep

| Item | Reason |
|---|---|
| **Astro as the toolchain** | Already static output, already deploying on Vercel, builds in under 1 s, and ships no framework JS. See section 7. |
| **The `astro:assets` / sharp image pipeline** | It already produces responsive WebP with explicit `width` and `height`, and `fetchpriority="high"` on the LCP image. The quality doc requires that pattern, and Stage 3's posters can go through it (AVIF is available as a format option). |
| **The repo, its history, and the Vercel project** | The domain, HTTPS and HSTS, and the apex-to-www redirect already work. Nothing needs re-provisioning. |
| **The `assets-private/` gitignore entry** | It's already correct, and history is clean (0 hits). Stage 3's `check:assets` can rely on that. |
| **`.vscode/` config** | Harmless and useful. |
| **Resume PDF (contents)** | Kept, but the file must be renamed or replaced to `public/jacob-webster-resume.pdf` per D8, and Jake must confirm it's the general version. The live URL `/Jacob_Webster_Resume.pdf` is probably linked from past applications, so consider a redirect from the old path (a decision for Stage 5; not made here). |
| **The empty-config, single-dependency footprint** | A good starting point for the "minimal dependencies, each justified" rule. |

### Should go

| Item | Reason |
|---|---|
| **Hard-coded copy in `index.astro`** | The brief (Reader C) and the content doc §G require content in `content/` files with schema validation. |
| **All existing copy as a source of truth** | The brief says no old copy carries over by default. Several current claims are on the content doc's forbidden list: the Caelus bullet says "real-time 50,000-point 3D point cloud … for autonomous navigation" and "21,600 LiDAR measurements/sec" (forbidden: "real-time", "autonomous navigation", and claims the third dimension is measured). "Software Engineering Lead, Caelus, Sep 2025" doesn't match ledger F5/F7. The CUhackit organizer role and its "2x" claim aren't in the facts ledger. |
| **The old project set (AstroAegis, SMARTA, QuickCharts) and their screenshots** | Out of scope: the brief says three projects, Spot, WayFinder, and Baton. |
| **Organization logos** (`michelin_logo.svg`, `USC_text_logo.svg`, `c4is_logo.svg`, `cuhackit_logo.svg`) | The content doc forbids Michelin and USC logos and bans logo walls. All four are also 137 KB of SVG. |
| **Photos** (`DSC06603.JPG`, `michelin.jpg`, `Organizer_Photo_2.JPG`, `videoframe_2529.png`) | D5 says no headshot. The Michelin cohort and CUhackit team photos show other people, which the brief's privacy constraint forbids. `Organizer_Photo_2` is also the largest single asset (3 MB source, 1 MB WebP). |
| **JetBrains Mono via Google Fonts** | It breaks the zero third-party request rule and is render-blocking (estimated 790 ms). The design system also bans monospace. |
| **`global.css`** | Its tokens, monospace usage, eyebrow labels, `01/02/03` numerals, middle-dot meta strings, `→`/`↗` arrows, and the `#2b6cff` accent are on the design system's banned list. It also causes the two contrast failures. |
| **`src/scripts/nav.js`** | It's a scroll listener that reads `offsetTop` for every section on every scroll event. The site flow doc's header has no active-link behavior, and it conflicts with "only the scene and the lane line are scroll-driven." |
| **`target="_blank"` on GitHub, LinkedIn and resume links** | The site flow doc says external links open in the same tab, except the PDF and the video. |
| **Extraneous `node_modules` packages** | Clean with `npm prune` at the start of Stage 1. |

---

## 7. Recommendation on D7 (framework)

**Recommendation: keep Astro (7.x) and restructure inside it. Don't rewrite.**

D7's own rule is "keep the current framework if it already ships static output and a rewrite isn't justified." Both conditions hold. The existing site already is the static-output setup D7 prefers.

**Why it fits the spec:**
- **Static HTML with all content in it.** This meets the site flow doc's loading sequence and the "works with JS off" requirement by default. The current build ships 0 external JS files.
- **Content collections with a Zod schema.** They give the content doc §G's "frontmatter validated at build; missing fields fail the build" without writing a validator.
- **Islands or a plain `<script>` loaded on idle.** Either one gives the lazy scene module that the 3D doc requires. A raw WebGL2 module needs no UI framework integration at all (no React, Vue, or other renderer).
- **`astro:assets`.** It covers AVIF and WebP posters with explicit dimensions.
- **File-based routing.** It maps directly onto the six routes in the site flow doc, and `@astrojs/sitemap` or a static `robots.txt` covers the SEO rows.
- **Vercel deploy.** It already works with zero config. Adding security headers later means a `vercel.json`, which works independently of the framework choice.

**Trade-offs and risks:**
- **Major-version churn.** Astro releases a major roughly every year (the repo is on 7.x). Upgrades occasionally change defaults (trailing slashes, image service, content-collection API). Mitigation: pin the minor version in `package.json`, commit the lockfile, and pin Node in an `.nvmrc` or in `engines` plus Vercel's setting.
- **Build-time weight.** It's about 200 packages, including native `sharp`. That doesn't affect visitors, but it's more to audit for `npm audit` than a hand-rolled build.
- **New dependencies the spec implies.** Lint (ESLint and/or Prettier plus `prettier-plugin-astro`), `@astrojs/check` for type checking, Playwright, axe-core, and Lighthouse for the check scripts. These are needed regardless of framework.
- **Abstraction risk.** Astro's helpers (`<Image>`, `ClientRouter`) can add JS or markup the quality doc doesn't want. Don't add the view-transitions router. Check `dist/` for stray scripts in `check:size`.

**Alternatives considered:**
- **Plain Vite plus hand-written HTML or a small Node build script.** It has the fewest dependencies, but you'd have to write and own content loading, schema validation, routing, image resizing, and sitemap generation yourself. That's more code for one student to maintain, which works against the brief's longevity constraint.
- **Eleventy.** It's also static-first and has fewer dependencies, but it would be a full rewrite with no capability gain over what's already deployed, and the image pipeline and JS bundling are less integrated.
- **Next.js, SvelteKit, or another SPA/SSR framework.** This would be the wrong tool. They default to shipping a client runtime for a content site, and they work against "content is never injected by script."

**Decision needed from Jake:** confirm D7 = Astro, and record it in the decision log.
