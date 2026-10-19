# Redesign docs: index

These documents are the spec for the jakewebster.dev redesign. They are written so that a coding agent can work from them without guessing, and so that Jake can review any decision in one place.

## Reading order

| Doc | What it settles | Read when |
|---|---|---|
| `01-brief.md` | Who the site is for, what it must achieve, how it should sound | Always, first |
| `02-content.md` | Every fact, every allowed and forbidden claim, all copy | Before writing any text |
| `03-design-system.md` | Visual direction, tokens, type, layout, components, banned patterns | Before writing any CSS or markup |
| `04-site-flow.md` | Routes, page anatomy, section-by-section behavior | Before building a page |
| `05-3d-and-motion.md` | The point-cloud scene, asset pipeline, scroll choreography, fallbacks | Before touching WebGL or animation |
| `06-quality-bars.md` | Performance, accessibility, SEO, privacy, security budgets | Before calling anything done |
| `07-build-plan.md` | Stages, deliverables, verification commands, `/goal` conditions | At the start of every stage |
| `08-review-checklists.md` | Claims audit, anti-slop audit, device checks, launch checklist | End of every stage |

## How the docs fit together

- **Truth beats polish.** If a visual idea requires an untrue or unsupported claim, the idea loses.
- **Content, design, and motion each have one owner doc.** Don't restate rules in a second place; link to them.
- **Words like "must" and "never" are tested.** Each one has a matching check in `06` or `08`.
- **Placeholders are loud.** Missing information is written as `TODO(jake): ...` and fails the production build.

## Open decisions (defaults apply until Jake changes them)

| ID | Decision | Default | Why |
|---|---|---|---|
| D1 | Name shown on the site | "Jacob Webster" everywhere on the page; "Jake" only inside the email address and handles | Matches the resume and applications. Jake can switch to "Jake" for warmth. |
| D2 | Theme | Both themes built; follow `prefers-color-scheme`; light is the fallback | Recruiters use both; the sensor viewport reads well in either. |
| D3 | Project detail pages | Yes: Spot, WayFinder, Baton get their own pages | Detail pages are where "My role" and honest limits live. |
| D4 | Disclose AI assistance on the Baton page | Yes, one plain sentence (wording in `02-content.md`) | Matches what Jake says in interviews; avoids a mismatch. |
| D5 | Headshot | None. The old site's hero photo is removed with the old design. Jake may later add one small photo of himself alone (optimized, with alt text) outside the first viewport. | Keeps the first screen about the work; easy to add later. |
| D6 | Analytics | None | No cookies, no consent banner, faster page. |
| D7 | Framework | **Decided after Stage 0 recon: keep Astro 7.x** (static output, deployed on Vercel). Pin the minor version and the Node version. The 3D scene is a lazy-loaded plain module, with no UI framework. | Already static, already deploying, ships no framework JS. |
| D8 | Resume PDF on the site | The general version, supplied by Jake at `public/jacob-webster-resume.pdf`. The old URL `/Jacob_Webster_Resume.pdf` keeps working through a permanent redirect (set in `vercel.json`), because past applications may link to it. | Role-specific versions are for applications, not the public site. Don't break old links. |
| D9 | Contact method | Email link only. No form, no phone number. | Privacy and simplicity. |
| D10 | Which purchased car file feeds the point cloud | Decide in Stage 3 by comparing sampled silhouettes of the Waymo_Taxi OBJ and the low-poly glTF | Pick whichever reads better from the side and three-quarter view. |
| D11 | Canonical host | `https://www.jakewebster.dev` (the apex domain redirects to www on Vercel). Use it for canonical URLs, the sitemap, and Open Graph URLs. | Matches the live redirect behavior found in Stage 0. |

## Glossary

- **Scene**: the WebGL point-cloud render.
- **Sensor viewport**: the framed panel on the page that contains the scene.
- **Return**: one point in the cloud (borrowed from the LiDAR term).
- **Lane line**: the dashed vertical scroll-progress indicator in the left gutter.
- **Poster**: the static image used when the scene can't or shouldn't run.
- **Ledger**: the table of allowed and forbidden claims in `02-content.md`.

## Decision log

Append one line per decision made during the build: `YYYY-MM-DD | stage | decision | reason`.

| Date | Stage | Decision | Reason |
|---|---|---|---|
| 2026-10-19 | 1 | Added `--on-lane` (`#25282C`, both themes) as the ink paired with `--lane` | Dark `--asphalt` on `--lane` is 1.46:1; `--on-lane` gives 8.21:1 in both themes and equals `--asphalt` in light |
| 2026-10-19 | 1 | Decorative graphics (rules, lane track and fill, status squares, frame borders) are exempt from 3:1 and listed with reasons; `--lane`/`--concrete` are restricted to those uses by `check:tokens` | Jake's call; `--concrete` and light `--lane` on `--fog` are below 3:1, and darkening them would push toward heavy hairlines |
| 2026-10-19 | 1 | Node pinned to `24.x` (`engines.node` + `.nvmrc`) | Vercel docs list 24.x (default) and 22.x; `engines.node` overrides the dashboard; local dev is 24.12 |
| 2026-10-19 | 1 | Astro pinned to `~7.3.8` instead of `~7.0.3` | `npm audit` flagged a critical Astro advisory fixed after 7.2.7; 7.3.8 is the latest patch on a six-week-old minor; 7.4.0 was 4 days old |
| 2026-10-19 | 1 | Old home copy replaced in Stage 1 with the `02` §C hero only | The old copy contains forbidden claims ("real-time") that would fail `check:content` in the build; old images and logos still go in Stage 2 |
| 2026-10-19 | 1 | Fonts from google/fonts: Overpass variable (wght 400 to 700) and Source Serif 4 as a static 400 instance at opsz 18; both Latin-subset WOFF2, 45.7 KB total | Prose uses only the regular weight (`font-synthesis: none`, no `em`/`strong`), so one static serif file is enough |
| 2026-10-19 | 1 | The serif subset is renamed `JW Serif` (name table and CSS family) | Its copyright notice reserves the name "Source"; a subset is a Modified Version under OFL section 3 |
| 2026-10-19 | 1 | `--button-pad-inline: 20px` kept as a component token, off the spacing scale | Section 5 specifies 20 px for buttons explicitly; the specific rule wins over the general scale |
| 2026-10-19 | 1 | Header hides Projects and Experience below 768 px | "Mobile" in section 5 is read as below the tablet breakpoint |
| 2026-10-19 | 1 | `build.inlineStylesheets: 'never'`; no inline `style` attributes (enforced by `check:tokens`) | Keeps the Stage 5 CSP at `style-src 'self'` with no hashes |
| 2026-10-19 | 1 | The style guide exists only under `astro dev` (injected route); `src/dev/` is exempt from the `--lane`/`--concrete` allowlist | It shows every token as a swatch and never ships |
| 2026-10-19 | 1 | `theme-color` meta deferred to Stage 5 | It needs hex outside the token file; it belongs with the metadata work |
| 2026-10-19 | 1 | `@types/node@24` added; `scripts/` is type-checked by `astro check` | Approved by Jake; matches the pinned Node 24.x |
| 2026-10-19 | 1 | Desktop grid changed to content 1 to 6, viewport 7 to 12; panel 4:3, height capped at 640 px (`--viewport-max`), still sticky | Jake's call: a 4:3 panel matches the posters and frames a car better than the tall `100svh` panel (about 440 by 720) |
| 2026-10-19 | 1 | `check:content` fails on `TODO(jake)` only with `--strict` or `VERCEL_ENV=production`; otherwise it warns. Forbidden claims and banned words always fail | Jake's call; Vercel production deploys still fail on any `TODO(jake)` |
| 2026-10-19 | 1 | The six "extraneous" WASM packages stay | They are optional platform fallbacks recorded in the lockfile, so `npm prune` keeps them; nothing ships from them |
| 2026-10-19 | 2 | `--text-display` lowered from `clamp(2.5rem, 1.5rem + 4vw, 4.75rem)` to `clamp(2.5rem, 1.5rem + 3vw, 4rem)`; `text-wrap: balance` kept | Measured: above about 68 px "I build perception" no longer fits the 455 to 536 px column, so "I build" was stranded at 1024 to 1920; 4rem passes with margin (4.5rem fails at 1920) |
| 2026-10-19 | 2 | `--viewport-max` removed | The desktop column is at most 536 px, so the 853 by 640 cap could never apply |
| 2026-10-19 | 2 | `02-content.md` updated to match `jake-answers.md` section A (Spot: sole contributor, Sep 2026 start, no query-rewriting step, YOLO not integrated, footage from Spot's cameras, new home row and Now copy) | `jake-answers.md` overrides `02` where they conflict and asks for this in the first Stage 2 commit |
| 2026-10-19 | 2 | Spot-scope claim rules added to `check:content` (fail and warn levels), with a planted fixture; `--strict` promotes only `todo-jake` | Jake's call: today's Spot pipeline must never read as finding, following or tracking the described person; warn-level phrases like "integrated" appear in true sentences and need a human read, not a block |
| 2026-10-19 | 2 | Content moved to `content/` as Astro collections with Zod schemas; schema extended with `oneLine`, `rowStatusLabel`, `linksNote`, `figure`, and `education.json` added | The `02` copy has separate home-row and page text, Spot has no public links, and education had no file; recorded in `02` section G |
| 2026-10-19 | 2 | Project summary cap raised from 160 to 170 characters and "one sentence" dropped | `jake-answers.md` B's approved Spot summary is two sentences, 168 characters, and that file wins over `02` |
| 2026-10-19 | 2 | One `stack` list feeds both the facts block and the home row, so the Spot row now lists faster-whisper (from `jake-answers.md` B) | Simplest single source; `02` section C row updated |
| 2026-10-19 | 2 | Skills and honors: two columns only from 768 to 1023 px; stacked in the desktop content column | The desktop content column is 455 to 536 px, so two columns would be about 250 px each; `04` section 4.6 updated |
| 2026-10-19 | 2 | No project-row posters on mobile in Stage 2 | `04` section 4.4 says to omit them unless they add clarity, and a flat placeholder adds none |
| 2026-10-19 | 2 | The lane line ships as its static `--concrete` track (SVG line, dash 12, gap 10) | That is its reduced-motion and no-JS state; the scroll-linked `--lane` fill is Stage 4 motion |
| 2026-10-19 | 2 | Row rules use a shared `.rule-list` class; JSON list collections record file position as `order` | `--concrete` is allowlisted for `.rule` selectors only; `getCollection` sorts by id, which put the experience timeline out of order |
| 2026-10-19 | 2 | Project figures are one vertical layout each (viewBox 360 wide, capped at 30rem), square boxes, arrowheads drawn as paths | One layout keeps labels at about 13 to 18 px from 343 px to desktop; the one radius is for buttons, the viewport and frames |
| 2026-10-19 | 2 | Markdown `smartypants` turned off | It curled the apostrophe in "What isn't done" (breaking the heading check) and made project pages differ from the straight quotes in the JSON copy and `02` |
| 2026-10-19 | 2 | Previous and next links are labeled "Previous project" and "Next project" in small text, with the project name as link text | `04` section 6 asks for project names as link text; the small labels say which direction |
| 2026-10-19 | 2 | Poster placeholders are empty SVGs at the poster sizes (1600 by 1200, 800 by 600) in real `<img>` markup with `object-fit: cover`; no `fetchpriority` yet | The panel's own `--viewport` fill is then the flat rectangle in both themes with no hex outside the token file; whether the poster is the LCP element is decided with the real posters in Stage 3 |
| 2026-10-19 | 2 | The scene caption and the footer's second clause ("Illustrations of the car and robot are point clouds drawn for this page.") wait for Stage 3; the footer reads "Built by me." | Both describe point clouds that don't exist yet; every claim on the page must be true when it ships |
| 2026-10-19 | 2 | `/Jacob_Webster_Resume.pdf` redirects permanently via `vercel.json`; `site` set in `astro.config.mjs`; `sitemap.xml` and `robots.txt` are small endpoints with no new dependency | D8 and D11; the redirect and trailing-slash behavior can only be verified on a Vercel preview deployment, which needs a push |
| 2026-10-19 | 2 | Kept `markdown.smartypants: false` despite Astro 7.3's deprecation warning | The suggested replacement imports `@astrojs/markdown-remark` directly, a new dependency; the flag works on the pinned `~7.3.8` and gets revisited at the next Astro minor |
| 2026-10-19 | 2 | Figure labels raised to 14 and 13.5 viewBox units, viewBoxes trimmed to the drawing, frame padding 12 px below 480 px, SVG capped at 26rem | Measured at 375 px, every label was 9.0 to 10.6 px; now 12.2 to 13.5 px at 375 and 16.0 to 17.8 px at 1280, with every label still inside its box |
| 2026-10-19 | design | Overpass rebuilt with the weight axis at 400 to 800 (was 400 to 700); 26,716 bytes, fonts now 47,192 bytes of the 90 KB budget; the screenshot font audit accepts Overpass 400 to 800 | Jake asked for the H1 at 800; the serif file was left as committed because a rebuild with current fontTools changed its bytes for no design reason |
| 2026-10-19 | design | H1 at weight 800 (`--weight-display`); size unchanged | Jake asked for 800; the sweep at 1024, 1280, 1440 and 1920 still wraps "I build perception / and autonomy / software.", so no size reduction was needed |
| 2026-10-19 | design | Section vertical padding lowered to 64 desktop and 48 mobile (from 96 and 64) | Jake found the page thin; with padding on both sides, sections sat about 192 px apart on desktop, which read as separate islands rather than one page |
