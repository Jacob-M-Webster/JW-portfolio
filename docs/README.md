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
| D5 | Headshot | None | Adds weight and a decision Jake hasn't made. Add later if wanted. |
| D6 | Analytics | None | No cookies, no consent banner, faster page. |
| D7 | Framework | Decided in Stage 0 from the existing code. Preference is a static-output setup (for example Astro) with the 3D scene as a lazy-loaded island. Keep the current framework if it already ships static output and a rewrite isn't justified. | Content site; minimal JS. |
| D8 | Resume PDF on the site | The general version, supplied by Jake at `public/jacob-webster-resume.pdf` | Role-specific versions are for applications, not the public site. |
| D9 | Contact method | Email link only. No form, no phone number. | Privacy and simplicity. |
| D10 | Which purchased car file feeds the point cloud | Decide in Stage 3 by comparing sampled silhouettes of the Waymo_Taxi OBJ and the low-poly glTF | Pick whichever reads better from the side and three-quarter view. |

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
| | | | |
