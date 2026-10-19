# 03. Design system

Read this before writing any CSS or markup. It exists to keep the site from looking like every other generated portfolio.

---

## 1. Design thesis

**Subject:** perception software for machines that move. The world this subject lives in: LiDAR returns, bird's-eye views, lane paint, road signage, the sensor's point of view.

**Audience job:** a recruiter or engineer decides in seconds whether this person builds real perception systems.

**The one memorable thing:** the *sensor viewport*, a framed panel showing a live point cloud of a car and a robot, swept by a LiDAR-style beam. Everything else on the page is quiet, typographic, and disciplined so that this panel carries the identity.

**Principles**
1. **Spend boldness in one place.** The viewport is loud. Type, layout, and color around it are restrained.
2. **Structure carries information.** A dashed lane line shows scroll progress because it is a progress indicator. Numbers mark steps only where the content is a real sequence. Rules separate things that are separate.
3. **Content-derived visuals.** Each project's figure is drawn from that project's real architecture, not from stock decoration.
4. **Honest drawing.** Built parts are solid; planned parts are dashed. The visual language itself tells the truth about status.
5. **Left-aligned and legible.** Reading comes first. Nothing centered except where a single short line demands it.

---

## 2. Rejected defaults (and why)

These are the looks that currently appear on generated sites regardless of subject. They are rejected here. If the build drifts toward one of them, fix it.

| Default | Why it's rejected |
|---|---|
| Warm cream background with a high-contrast serif display and a terracotta or clay accent | Reads as generated; unrelated to perception or robotics |
| Near-black page with a single acid-green or vermilion accent | Same: a default, not a decision |
| Broadsheet layout: hairline rules everywhere, zero radius, dense newspaper columns | A mood borrowed from print, unrelated to the subject |
| The "SaaS card kit": identical rounded cards, soft grey shadow on each, gradient washes | Makes three different projects look the same |
| Template chrome: tracked-out ALL-CAPS eyebrow labels, middle-dot meta strings (`A · B · C`), `WORD — fragment` labels, a monospace face for small data labels, `→` on every link | Appears whatever the subject; signals no thought |
| Numbered markers `01 / 02 / 03` on non-sequential content | Decoration pretending to be structure |
| Fade-and-slide-up entrance on every section; hover lift on every card | Motion with no purpose |
| Gradient text, glassmorphism panels, blurred color blobs, glow | Tells of a template |

---

## 3. Tokens

All tokens are CSS custom properties on `:root`, with a dark override under `@media (prefers-color-scheme: dark)`. Components never use raw hex values.

### 3.1 Color (named, 6 core values)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--fog` | `#EDEFEC` | `#2A2E32` | Page background |
| `--asphalt` | `#25282C` | `#E6E8E4` | Primary text and strong strokes |
| `--asphalt-soft` | `#4A4F55` | `#AEB4B9` | Secondary text |
| `--concrete` | `#C4C9C4` | `#454A50` | Rules, borders, dashed lane track |
| `--lane` | `#F0B90B` | `#F0B90B` | The accent: fills, active states, lane-line progress |
| `--viewport` | `#25282C` | `#1B1E21` | Background of the sensor viewport panel (dark in both themes) |
| `--on-lane` | `#25282C` | `#25282C` | The ink paired with `--lane`: text on a `--lane` fill, and the fill behind `--lane` text. Fixed in both themes, because the dark theme's `--asphalt` on `--lane` is 1.46:1 |

Return colors used inside the scene (see `05-3d-and-motion.md`), a height ramp from ground to roof:

| Token | Value | Role |
|---|---|---|
| `--ramp-ground` | `#2B3F9E` | Lowest points (ground, wheels) |
| `--ramp-mid` | `#1A98A6` | Body |
| `--ramp-top` | `#F0B90B` | Highest points (roof sensor, head) — the same yellow as `--lane` |

**Why this palette:** concrete, asphalt, and lane paint are the physical world of the subject. The scene's ramp mirrors how LiDAR viewers color points by height. Yellow appears twice (lane line, scene top) so the page and the viewport feel like one system.

**Rules**
- `--lane` is a *fill* color or a graphic, never a text color in either theme. Text on a `--lane` fill is `--on-lane`; when `--lane` is the text color (primary button hover), the fill behind it is `--on-lane`.
- `--lane` and `--concrete` are allowed only in these uses: 1 px rules, the lane-line track and fill, status squares, the viewport border, figure-frame borders, the primary button fill, and the link highlighter background. `check:tokens` fails on any other use. Graphics that carry meaning, including the solid and dashed strokes in project diagrams, use `--asphalt`.
- Contrast requirement: all text at least 4.5:1, large text and UI graphics at least 3:1. **Claude must compute and print the ratio for every text/background pair and for the focus ring**, in light and dark, before Stage 1 is done. The hex values above are starting points; adjust them minimally if a pair fails and record the change in the decision log.
- No gradients anywhere in the UI. The only multi-color element is the scene's height ramp.
- No pure `#000` or `#fff`.

### 3.2 Typography

Two typefaces, clearly distinct, both open-licensed and self-hosted (verify each license is SIL OFL and ship the license file):

| Role | Family | Why |
|---|---|---|
| Headings, UI text, buttons, labels | **Overpass** (variable) | Derived from the U.S. highway sign alphabet. It is the typeface of the road, which is the subject's world. |
| Running prose | **Source Serif 4** (variable) | A readable text serif; the contrast with Overpass is deliberate. |

Fallback stacks:
- `Overpass, "Overpass fallback", "Helvetica Neue", Arial, sans-serif`
- `"JW Serif", "JW Serif fallback", Charter, "Iowan Old Style", Georgia, serif`

`JW Serif` is our Latin subset of Source Serif 4, renamed because its copyright notice reserves the name "Source" (OFL section 3). The `fallback` faces are metric-adjusted `local()` faces (from `scripts/fonts/build_fonts.py`) so the swap doesn't shift layout.

**Scale** (fluid, `clamp`; sizes are starting values to tune against screenshots):

| Token | Size | Line height | Weight | Use |
|---|---|---|---|---|
| `--text-display` | `clamp(2.5rem, 1.5rem + 4vw, 4.75rem)` | 1.02 | 700 | The H1 only |
| `--text-h2` | `clamp(1.75rem, 1.25rem + 1.8vw, 2.75rem)` | 1.1 | 700 | Section headings |
| `--text-h3` | `clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)` | 1.2 | 700 | Project titles, role titles |
| `--text-body` | `1.125rem` | 1.65 (serif gets extra leading) | 400 | Prose |
| `--text-ui` | `1rem` | 1.4 | 600 | Links in nav, buttons, labels |
| `--text-small` | `0.875rem` | 1.5 | 400/600 | Captions, facts blocks |

**Rules**
- Line length 65 characters maximum for prose (`max-width: 38rem` at body size).
- **Sentence case everywhere.** No ALL-CAPS labels, no tracked caps, no small-caps.
- **No eyebrow labels** above headings unless the label names something the heading doesn't.
- **No single-word accents in headlines** (one word in a different color, italic, or weight).
- Headlines are set with the type treatment doing real work: tight leading, negative tracking of about `-0.015em` on the display size only, and weight 700. Do not add effects.
- Use tabular numerals for measurements and dates if the font supports them.
- No monospace face in the system. (A readout of live numbers in the viewport uses Overpass with tabular figures.)
- `font-display: swap`; preload only the two files above the fold (Overpass 700 and the Source Serif 4 regular subset); subset to Latin; total font payload 90 KB or less.

### 3.3 Spacing, radius, borders, shadow

- Spacing scale, 4 px base: `4, 8, 12, 16, 24, 32, 48, 64, 96, 144`. No other values.
- Section vertical padding: `96` on desktop, `64` on mobile. Between a heading and its content: `24`. Between rows: `32`.
- **One radius:** `--radius: 3px`, used only on buttons, the viewport panel, and figure frames. Everything else is square.
- Borders: 1 px `--concrete` for rules; 2 px `--asphalt` for button strokes and the focus ring.
- **No box shadows. No blurs. No glows.**

---

## 4. Layout

### 4.1 Concept

A two-column layout on desktop. The left column holds the content and scrolls. The right column holds the **sticky sensor viewport**, which stays in view and changes what it shows as the left column advances. A dashed **lane line** runs down the left gutter and fills with yellow as the page scrolls.

On mobile there is no sticky panel. The viewport appears once, inline, in the hero. Below it, each project shows a static poster. Reason: a sticky panel eats a third of a phone screen, and scroll-linked 3D costs battery and attention.

### 4.2 Desktop wireframe (1280 px)

```
+----------------------------------------------------------------------+
| Jacob Webster                        Projects  Experience  Resume  Email |
+----------------------------------------------------------------------+
|:  I build perception and            +------------------------------+ |
|:  autonomy software.                |                              | |
|:                                    |        sensor viewport       | |
|:  I'm a computer science senior ... |        (sticky, dark panel)  | |
|:  [Download resume (PDF)] [Email me]|                              | |
|:                                    |                              | |
|:  What I'm working on now          +------------------------------+ |
|:  Spot voice-following ...          Illustration: a point cloud ...  |
|:  Michelin ...                       30,000 points                    |
|:  Projects                                                           |
|:  Spot voice-following   In progress                                 |
|:  ...                                                                |
+----------------------------------------------------------------------+
  ':' = the dashed lane line in the left gutter
```

### 4.3 Mobile wireframe (375 px)

```
+-----------------------------+
| Jacob Webster   Resume Email|
+-----------------------------+
| I build perception and      |
| autonomy software.          |
| I'm a computer science ...  |
| [Download resume] [Email me]|
| +-------------------------+ |
| |   sensor viewport       | |
| |   (inline, ~46svh)      | |
| +-------------------------+ |
| Illustration: a point ...   |
| What I'm working on now     |
| ...                         |
+-----------------------------+
```
On a phone the first viewport must already contain the name, the H1, the lead paragraph and both actions. The viewport may sit partly below the fold; content never waits for it.

### 4.4 Grid and measures

- Max page width 1200 px, centered. Page gutters `clamp(16px, 4vw, 48px)`.
- Desktop (1024 px and up): 12-column grid. Content column spans 7; viewport spans 5 (sticky, `top` equal to header height plus 24 px, height `calc(100svh - header - 48px)`, max 720 px).
- Tablet (768 to 1023 px): single column; the viewport is inline in the hero at 50svh; no sticky behavior.
- Prose width 38rem max. Never full-width prose.
- Alignment: everything left-aligned. The footer and 404 are left-aligned too.
- Breakpoints: 480, 768, 1024, 1440. Mobile-first CSS.

### 4.5 Structural devices (each has a job)

| Device | Job | Where |
|---|---|---|
| Lane line (dashed, vertical, left gutter, desktop only) | Shows scroll progress | Fixed in the gutter; `--concrete` track, `--lane` fill; static full track under reduced motion |
| 1 px rules (`--concrete`) | Separate project rows and role entries | Between rows only; no rules around everything |
| Numerals | Mark real sequences | Only the pipeline steps on project pages and the dates on the experience timeline |
| Definition lists | Facts blocks and skills | Project facts, skills, honors |
| Solid versus dashed strokes | Built versus planned | Project diagrams; both in `--asphalt` |

---

## 5. Components

Each component lists default, hover, focus, active, and disabled states where they apply. Motion on interaction is instant or 120 ms or less; there are no hover transitions that move or scale elements.

**Header**
- Wordmark `Jacob Webster` in Overpass 700, links in `--text-ui`. Not sticky on desktop (the viewport is). On mobile, show `Resume` and `Email` only; no hamburger, no overlay menu.
- Tap targets 44 px high minimum.

**Links (inline)**
- Default: `--asphalt` text, 1.5 px `--asphalt` underline, offset 3 px.
- Hover and focus-visible: highlighter treatment, with the text on a solid `--lane` background, underline removed, text becomes `--on-lane`. No transition.
- Visited: no color change.
- External links open in the same tab unless they are the resume PDF or a video; no "opens in new window" icons.

**Buttons (two types only)**
- Primary: `--lane` fill, `--on-lane` text, 2 px `--asphalt` border, radius 3. Hover: fill becomes `--on-lane`, text `--lane`. Active: translate 0, no scale.
- Secondary: transparent, 2 px `--asphalt` border. Hover: fill `--asphalt`, text `--fog`.
- Height 48 px, horizontal padding 20 px. Text is a verb phrase in sentence case.

**Focus ring (all interactive elements)**
- `outline: 3px solid var(--asphalt)` in light, `var(--asphalt)` (which is light in dark theme) in dark; `outline-offset: 3px`. Must be at least 3:1 against whatever it sits on. Never `outline: none` without a replacement.

**Hero**
- H1 in `--text-display`, left aligned, wrapping naturally within the 7-column content area. Lead paragraph in serif body size. Two buttons. No badges, no stat bar, no gradient, no scroll-down arrow.

**Project rows (the Projects list)**
- Not cards. Each project is a full-width ruled row: title (`--text-h3`) on the left with the status text beside it; the one-line description in serif below; the stack as a plain comma-separated sentence in `--text-small`.
- The title is the only link; its click area stretches over the row (the stretched-link technique), with a visible focus ring around the row.
- Status is plain text with a small filled square (8 px) in a state color: in progress (`--lane`), paused (`--concrete`), prototype and placed (`--asphalt`). The square is decorative and has `aria-hidden`; the word carries the meaning.
- Hover and focus: the title gets the highlighter treatment; on desktop the matching scene state also becomes active (see `05`).

**Experience timeline**
- A definition-style list. Dates in `--text-small` left, role and employer right. Real sequence, so the dates *are* the structure. Bullets are short plain sentences.

**Facts block (project pages)**
- `dl` with Status, Role, When, Stack, Links. Two columns on desktop, stacked on mobile. Terms in `--text-small` weight 600, sentence case.

**Figures (project diagrams)**
- Inline SVG, drawn with token colors via `currentColor` and CSS variables, so both themes work. Frame: 1 px `--concrete` border, radius 3, padding 24. Caption below in `--text-small`. Built = solid 2 px `--asphalt` stroke; planned = 2 px dashed `--asphalt` stroke (never `--concrete` or `--lane`, which are below 3:1 on `--fog`). The legend is a sentence in the caption, not a swatch row.
- Each figure has `role="img"` and a real `aria-label`/`<title>`/`<desc>`.

**Sensor viewport**
- Dark `--viewport` panel, radius 3, 1 px `--concrete` border. A canvas fills it. Below it, a caption (`--text-small`) and the live point count. The caption sits outside the panel so it remains readable in every state.
- Under any fallback condition the same frame shows the poster image.

**Footer**
- Left aligned. Four links and one sentence. Nothing else.

---

## 6. Imagery

- No stock photos, no illustrations from libraries, no icon sets, no emoji, no decorative SVG blobs.
- Screenshots (if any are added later): 1 px `--concrete` frame, true aspect ratio, captioned.
- The poster image is generated from the same point data as the scene (see `05`).
- The favicon is a small cluster of points in the ramp colors on `--viewport`, or a plain `JW` set in Overpass 700. One of those, not both.

---

## 7. Motion rules (summary; details in `05`)

- One orchestrated moment: the first-load sweep that resolves scattered points into the car.
- Scroll-linked morphs in the viewport, because the scene mirrors where the reader is.
- Everything else is instant: no entrance animations on sections, no hover lift, no parallax on text, no cursor followers.
- Reduced motion removes all of it and shows the poster.

---

## 8. Banned patterns (check these in `08`)

Anything in this list found in the build is a defect.

**Visual**
- Gradient backgrounds, gradient text, gradient borders
- Glassmorphism (blurred translucent panels), backdrop blur, glow, drop shadows
- Blurred color blobs, mesh gradients, noise textures as decoration
- Rounded corners larger than 3 px; the same radius used on everything
- Identical card grids; three-column icon-plus-heading-plus-blurb layouts
- Icon sets and emoji (including in buttons and bullets)
- Dark mode toggles or theme switchers
- Parallax text, sticky text that overlaps other text, scroll hijacking, scroll snapping
- Floating decorative shapes, particles that aren't the scene
- Animated gradient borders, shimmer effects, skeleton screens for static content

**Typographic**
- Tracked-out ALL-CAPS labels or eyebrows
- A monospace face used for small labels or metadata
- Middle-dot meta strings (`A · B · C`) and `WORD — fragment` labels
- `→`, `›`, or `↗` appended to links or buttons
- One word of a headline accented by color, italic, or weight
- Typewriter effects, text that fades in word by word
- Numbered `01 / 02 / 03` markers on non-sequential content

**Structural**
- Skill bars, percentages, star ratings, logo walls, tag clouds
- "Scroll down" prompts or bouncing arrows
- Fake numbers: counters that tick up, fake latency or FPS readouts, "100+ commits" style stats not backed by a source
- Testimonials, quotes, or logos of companies Jake hasn't worked for
- Stock hero sentences: "Hi, I'm Jake 👋", "Welcome to my portfolio", "Crafting digital experiences"
- Lorem ipsum or placeholder text in any built page (use `TODO(jake)` and fail the build)

**Code**
- Raw hex values in components (use tokens)
- `!important`
- `outline: none` without a replacement focus style
- Animations that run when the tab is hidden or the element is offscreen
- Any `<img>` without width and height

---

## 8b. Taste calibration

Use this routine on every visual stage.

1. **Plan first.** Before code, write a compact plan: palette (the six values above), type roles, a layout sketch in ASCII, and three principles. Compare it against section 2. If any element would appear on a generic portfolio, change it and say what you changed.
2. **Build.** Follow the tokens exactly.
3. **Screenshot and critique.** Capture 375, 768, 1280 and 1920 px, light and dark. For each, answer in writing: What is the first thing the eye lands on? Is it the intended thing? What is the second? Is any element competing with the viewport? Where is the empty space doing work?
4. **Remove one accessory.** Before declaring a stage done, remove the one decorative element that contributes least. If nothing qualifies, say so.
5. **Cross-check content.** Read every sentence on screen against `02-content.md`.

When in doubt: simpler, quieter, more left-aligned, more specific to the subject.
