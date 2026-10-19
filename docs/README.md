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
| 2026-10-19 | 1 | The six "extraneous" WASM packages stay | They are optional platform fallbacks recorded in the lockfile, so `npm prune` keeps them; nothing ships from them |
