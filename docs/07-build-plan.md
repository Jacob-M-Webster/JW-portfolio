# 07. Build plan

The build is split into stages. Each stage has its own plan-mode session, deliverables, verification, a `/goal` condition, and a human gate where Jake reviews before the next stage starts.

## How to run a stage

1. **Branch.** Work on `redesign`. Start each stage from a clean `git status`.
2. **Plan mode.** Start Claude Code in plan mode (`claude --permission-mode plan`, or Shift+Tab until the status bar shows plan mode). Paste the stage's *plan prompt*. Review and edit the plan (Ctrl+G opens it in your editor). Approve it.
3. **Build with `/goal`.** Exit plan mode and set the stage's goal with `/goal <condition>`. The goal's evaluator judges the condition only from what Claude shows in the conversation, so every condition requires pasted command output. A goal without pasted evidence cannot be met.
4. **Review.** Run the stage's checklist in `08-review-checklists.md`. Jake does the human gate.
5. **Clear and move on.** `/goal clear` if it is still active, commit, and start the next stage in a fresh session so context stays small.

**Rules for every stage**
- A stage's goal is never "make the site look good." It is a list of things Claude can run and show.
- Stop conditions are part of the goal: if blocked twice on the same issue, stop and ask.
- Don't start the next stage's work early.
- Don't change a doc to make a check pass; if a doc is wrong, say so and ask.

---

## Stage 0. Recon (no code changes)

**Purpose:** learn what exists before changing it.

**Plan prompt**
> Read `CLAUDE.md` and everything in `docs/`. Then inspect this repository without changing any files and write `docs/recon.md` containing: (1) framework, language, package manager, Node version, and every dependency with one line on what it's for; (2) routes and pages that exist; (3) where content currently lives; (4) build, dev, lint, and deploy commands, verified by actually running the build; (5) Lighthouse mobile baseline (three-run median) for the home page; (6) what's worth keeping and what should go, with reasons; (7) a recommendation on decision D7 (framework) with the trade-offs. Do not propose design or copy. Do not delete or modify anything except creating `docs/recon.md`.

**Deliverables:** `docs/recon.md`; `CLAUDE.md` "Commands" section filled in.

**`/goal`**
> `docs/recon.md` exists and covers all seven numbered items; the build command ran successfully and its output is pasted; the Lighthouse median table is pasted; `git status` shows only `docs/recon.md` and `CLAUDE.md` changed.

**Human gate:** Jake reads `recon.md`, decides D7, and confirms what to keep.

---

## Stage 1. Foundations

**Purpose:** tokens, fonts, base styles, layout shell, check scripts. No content styling beyond what proves the foundations work.

**Plan prompt**
> Follow `docs/03-design-system.md` and `docs/06-quality-bars.md`. Plan the foundations: the token file (colors for light and dark, type scale, spacing scale, radius), self-hosted fonts (verify each license is OFL and include the license files; subset to Latin; preload the two critical files), base CSS (reset, typography, focus ring, link and button styles per the doc), the page shell (header, main, footer, skip link, grid with the sticky-column layout reserved), and the check scripts `check:tokens`, `check:content`, `check:size`. Before writing code, produce the design plan required by section 8b of the design doc: palette, type roles, an ASCII layout sketch, and three principles, and say what you changed after comparing it against section 2.

**Deliverables**
- Token CSS, font files and licenses, base styles, shell components.
- A temporary style-guide route (not shipped to production) showing every component state in light and dark.
- Contrast table printed for every token pair.
- `check:tokens`, `check:content`, `check:size` working.

**Added after the Stage 0 recon**
- Remove the old stylesheet (`src/styles/global.css`), the nav scroll script (`src/scripts/nav.js`), and the Google Fonts links. Third-party requests must be 0.
- Run `npm prune` to remove the extraneous packages the recon found. Add an `.nvmrc` and confirm Vercel's Node setting matches it. Pin Astro's minor version.
- Dev dependencies to propose in the plan, for Jake to approve by name: `@astrojs/check`, `typescript`, `prettier`, `prettier-plugin-astro`, `@playwright/test`, `@axe-core/playwright`. Run Lighthouse with `npx lighthouse@12` rather than installing it. Do not add Astro's `ClientRouter` (view transitions).
- The old copy, project images, photos, and logos are removed in Stage 2, not Stage 1 (recon section 6 lists them).

**`/goal`**
> The build passes; `check:tokens` and `check:size` pass and their output is pasted; a contrast table for all token pairs in light and dark is pasted and every text pair is at least 4.5:1 and every graphic and focus pair at least 3:1; screenshots of the style-guide route at 375, 768, 1280 and 1920 px in both themes are captured and I have written a short critique of each following section 8b of the design doc.

**Human gate:** Jake looks at the style guide screenshots on a laptop and a phone. Question: does it feel like his, and is it free of the banned patterns?

---

## Stage 2. Content and pages (no 3D)

**Purpose:** every page and section, complete and correct, with posters in place of the scene.

**Plan prompt**
> Follow `docs/02-content.md` and `docs/04-site-flow.md`. Plan the content files (`content/` structure in `02`, section G), the home page sections, the three project pages with their SVG figures (built solid, planned dashed), the 404, and the poster placeholders. Use `TODO(jake)` for anything missing. List every `TODO(jake)` you expect. Do not write the WebGL scene. Do not add motion beyond what `03` allows.

**Deliverables**
- All routes in `04`, section 1, built from the content files.
- Project figures as inline SVG using tokens.
- Placeholder poster images (flat `--viewport` rectangles with correct dimensions) in the viewport frame.
- A list of every remaining `TODO(jake)`.

**`/goal`**
> Every route in `docs/04-site-flow.md` section 1 builds; `check:content` output is pasted showing only the expected `TODO(jake)` items (listed in a table with file and line); `check:a11y` shows zero axe violations on all routes in both themes; the home page with JavaScript disabled is screenshotted at 375 and 1280 px and shows name, school and graduation date, target role, resume link and email without scrolling; every sentence on screen is mapped to a row in the claims ledger (table pasted).

**Human gate (the important one):** Jake reads every line of every page against his own records and fills in or removes each `TODO(jake)`. Nothing moves on until `check:content` passes with zero TODOs.

---

## Stage 3. Asset pipeline

**Purpose:** produce the derived point-cloud files and posters, with proof that no raw asset ships.

**Plan prompt**
> Follow `docs/05-3d-and-motion.md` sections 2 and 6.1. Plan `scripts/mesh_to_points.py`, `scripts/make_quadruped.py`, `scripts/render_poster.py`, and `scripts/check-assets`. Start by inspecting the purchased meshes in `assets-private/` and writing `docs/asset-report.md` (group names, face counts, bounding boxes, exclusion list). Decide D10 by rendering a quick preview of each candidate car and recommending one. Do not copy any raw file out of `assets-private/`. Do not commit anything from `assets-private/`.

**Deliverables**
- `docs/asset-report.md`, scripts, `public/models/scene-points.bin` and `.json`, posters (AVIF and WebP), `og-home.png`.
- Unit tests for the scripts.

**`/goal`**
> `docs/asset-report.md` exists; running the sampling and poster scripts twice gives byte-identical outputs (SHA-256 pairs pasted); the script unit tests pass and their output is pasted; `check:assets` passes with output pasted showing `git ls-files`, `git log --all`, extension, and hash checks; `scene-points.bin` is within the size budget (sizes pasted, uncompressed and brotli); poster previews of car, quadruped and scatter are screenshotted.

**Human gate:** Jake views the posters. Does the car read as a car? Does the quadruped read as a four-legged robot? Is anything recognizably a competitor's trade dress? Jake confirms nothing from `assets-private/` is staged.

---

## Stage 4. Scene and choreography

**Purpose:** the live viewport, intro, scroll states, hover, fallbacks.

**Plan prompt**
> Follow `docs/05-3d-and-motion.md` sections 3 to 8. Plan the raw WebGL2 renderer (or justify a library in one paragraph and stop for approval), the state machine, the scroll mapping measured from the DOM, the hover override, the adaptive quality controller, the fallback conditions, and the Playwright tests listed in section 9. Include the live point-count readout. Do not add any animation outside the scene and the lane line.

**Deliverables**
- Scene module, lane line, fallbacks, tests.
- Frame-time report under 4x CPU throttling.

**`/goal`**
> All nine scene Playwright checks in `docs/05-3d-and-motion.md` section 9 pass, with output pasted; the 4x-throttled frame-time median and p95 are pasted and the adaptive quality step-down is demonstrated; the scene module gzip size and scene data size are pasted and within budget; screenshots of each scene state (car, quadruped, scatter) on desktop and the mobile hero are pasted; with `reducedMotion` on and with `getContext` stubbed to null, the page shows posters and has zero console errors; `check:assets` still passes.

**Human gate:** Jake scrolls the page on a real laptop and a real phone, with the browser console open. Does it feel smooth? Is anything distracting while reading? Does the caption read as honest? Are text, links, and buttons usable at every moment?

---

## Stage 5. Polish, performance, and metadata

**Purpose:** meet the budgets, finish metadata, remove the least necessary decoration.

**Plan prompt**
> Follow `docs/06-quality-bars.md`. Plan the remaining work: `check:perf`, `check:links`, `check:a11y` finalization, metadata (titles, descriptions, Open Graph, JSON-LD, sitemap, robots, favicon), security headers if the host supports them, the repo README, and a final pass on tokens and banned patterns. Then perform the "remove one accessory" step from the design doc and say what was removed.

**`/goal`**
> `npm run check:all` exits 0 with its full output pasted; the Lighthouse mobile median table meets every bar in section 1 of the quality doc; the contrast table is re-printed and passes; a secrets scan over the full git history is pasted and clean; `npm audit` shows no high or critical issues; the README explains running, building, adding a project, regenerating assets, and where private assets live; the "remove one accessory" note is written.

**Human gate:** Jake screen-reader-tests the home page, checks the site on two real phones, and reads the metadata in a link preview (paste the preview URL into a chat app).

---

## Stage 6. Final review and launch

**Purpose:** a clean, defensible launch.

**Plan prompt**
> Run the full review in `docs/08-review-checklists.md`: the claims audit, the anti-slop audit, the device and browser checks, and the launch checklist. Produce `docs/launch-report.md` with a pass or fail and evidence for each line. Do not fix failures silently; list them with proposed fixes.

**`/goal`**
> `docs/launch-report.md` exists with every line of the claims audit, the anti-slop audit, and the launch checklist marked pass with evidence or fail with a proposed fix; zero fails remain; `npm run check:all` output is pasted again after the last change.

**Human gate:** Jake reads the claims audit one more time, confirms the resume PDF on the site matches the current resume, then deploys. After deploying, he opens the live site on a phone and runs Lighthouse against the live URL.

---

## After launch

- Update `content/` when the Spot work changes status. The "What isn't done" section is the first thing to edit.
- Re-run `check:content` after any copy change.
- When Caelus, Spot, or a new project needs a write-up, copy an existing project file; do not add new section types.
- Review the site against the resume every time the resume changes.

---

## Prompt snippets worth reusing

**For any visual change:**
> Before editing, state which token and which component this uses. After editing, screenshot at 375 and 1280 in both themes, and tell me what you would remove.

**For any copy change:**
> Quote the ledger row this claim comes from. If there isn't one, don't write the sentence; write `TODO(jake)` and tell me what you need.

**When something breaks:**
> Don't guess. Reproduce it, paste the failing output, state the cause in one sentence, then fix it and paste the passing output.
