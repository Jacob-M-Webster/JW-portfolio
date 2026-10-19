# 04. Site flow

Routes, page anatomy, and what each section does. Copy comes from `02-content.md`; visual rules from `03-design-system.md`; scene behavior from `05-3d-and-motion.md`.

---

## 1. Routes

| Route | Purpose | Notes |
|---|---|---|
| `/` | Home: hero, now, projects, experience, skills and honors, footer | One page. Anchors: `#projects`, `#experience`, `#contact` |
| `/projects/spot` | Spot voice-following write-up | Template in section 6 |
| `/projects/wayfinder` | WayFinder write-up | Same template |
| `/projects/baton` | Baton write-up | Same template |
| `/jacob-webster-resume.pdf` | Resume | Static file supplied by Jake; the "Resume" links point here |
| `/Jacob_Webster_Resume.pdf` | Old resume URL | Permanent redirect to the new path (see D8); do not remove |
| `/404` | Not found | Copy in `02` |
| `/sitemap.xml`, `/robots.txt` | SEO | Generated at build |

No other routes. No `/about`, `/blog`, `/contact`.

Trailing slashes, canonical URLs, and redirects are decided in Stage 0 from the host's behavior and recorded in the decision log.

---

## 2. Loading sequence (what the visitor experiences)

The order is part of the design. Content first, the scene last.

1. **HTML arrives with all content in it.** Header, H1, lead, actions, and every section are present in the server-rendered or prebuilt HTML. No content is injected by JavaScript.
2. **CSS and the two critical fonts load.** Text renders with a fallback font and swaps; layout is reserved so nothing shifts (`size-adjust` on the fallback if needed).
3. **The viewport frame is already in the layout** with the poster image as its background. The poster is the LCP candidate on desktop only if it's the largest element; if text is larger, text is. Either way the frame has fixed dimensions (aspect ratio set), so CLS is 0.
4. **After the page is idle** (`requestIdleCallback`, with a timeout fallback), the scene module and the point file load. If the browser can't or shouldn't run the scene (see `05` for the exact conditions), nothing loads and the poster stays.
5. **The scene fades from the poster to the live canvas** (a 200 ms crossfade, once) and the first-load sweep plays.
6. **Scroll-linked behavior starts** (desktop only, section 4).

If any step fails, the previous step is the final state, and the page is still correct.

---

## 3. Page anatomy (home)

```
<header>      wordmark + links
<main>
  <section id="hero">        H1, lead, two actions
  <section id="now">         two short items
  <section id="projects">    three ruled rows
  <section id="experience">  timeline + education
  <section id="skills">      skills (definition list) + honors (list)
</main>
<footer id="contact">        email, links, one sentence
<aside aria-hidden>          lane line (desktop)
<figure class="viewport">    sensor viewport + caption + live count (sticky on desktop)
```

Landmarks: one `header`, one `main`, one `footer`, `nav` inside the header, sections labeled by their headings. The viewport is a `figure` with a caption; the canvas inside is `aria-hidden="true"`.

DOM order (matters for keyboard and screen readers): header, main content in reading order, footer. The viewport figure sits after the hero in DOM order and is positioned into the right column with CSS grid, so tab order never jumps into a decorative panel.

---

## 4. Sections

### 4.1 Header
- **Purpose:** identity and the two actions a recruiter wants.
- **Content:** wordmark, `Projects`, `Experience`, `Resume`, `Email` (mobile: `Resume`, `Email`).
- **Behavior:** anchors scroll smoothly to sections only if reduced motion is off; otherwise jump. Scroll offset accounts for the header height (`scroll-margin-top`).
- **States:** link hover and focus per design system.
- **Acceptance:** header never overlaps content; tap targets 44 px; works with JS off.

### 4.2 Hero
- **Purpose:** state who he is and what he wants, in one screen.
- **Content:** H1, lead paragraph, two actions (`02`, section C).
- **Layout:** desktop: left column. Mobile: stacked, then the inline viewport.
- **Behavior:** none. The first-load sweep happens in the viewport, not on the text. Text is visible immediately.
- **Acceptance (S1):** at 375 and 1280 px wide, name, school and graduation date (in the lead), target role, resume link and email are visible without scrolling.

### 4.3 Now
- **Purpose:** show current work, honestly, so the page feels alive without fake telemetry.
- **Content:** the two items in `02`.
- **Layout:** two short blocks in the content column, each a bold lead phrase in Overpass followed by serif text. A link to the Spot page.
- **Acceptance:** nothing in this section implies the Spot system works end to end.

### 4.4 Projects
- **Purpose:** put the three projects in front of the reader with their honest status.
- **Content:** three ruled rows (`02`, section C).
- **Behavior (desktop):** as each row crosses the middle of the viewport, the scene shows the matching state (Spot: quadruped, WayFinder: car, Baton: quiet scatter). Hover or focus on a row requests its state. Scroll and hover never fight: scroll sets the base state; hover applies for as long as the pointer is on the row and then releases.
- **Behavior (mobile and tablet):** each row shows a small static poster to its right (desktop-hidden) or above (mobile) only if it adds clarity; otherwise omit. No scroll-linked changes. Until Stage 3's real posters exist, rows show none.
- **Acceptance:** keyboard users can tab to each row and activate it; focus ring visible; status word present as text.

### 4.5 Experience
- **Purpose:** credible, checkable history.
- **Content:** three roles and education (`02`).
- **Layout:** dates left, role and employer right, bullets below. Real chronology.
- **Behavior:** the scene settles into its quiet ambient state here.
- **Acceptance:** wording matches the resume; the word "paused" appears next to Caelus.

### 4.6 Skills and honors
- **Purpose:** keyword coverage for people and parsers, without a logo wall.
- **Content:** skills definition list; honors list (`02`).
- **Layout:** two columns from 768 to 1023 px, where the content runs full width; stacked on mobile and inside the 536 px desktop content column, where two columns would be about 250 px each. No icons.
- **Acceptance:** every tool listed appears on the resume.

### 4.7 Footer
- **Purpose:** the last place to find the email, LinkedIn, GitHub, and resume.
- **Content:** per `02`.
- **Acceptance:** four links, one sentence, nothing else.

---

## 5. The lane line

- Desktop only (1024 px and up). A 2 px dashed vertical line in the left gutter (dash 12 px, gap 10 px), `--concrete` track.
- A second, identical dashed line in `--lane` is clipped from the top to the current scroll fraction. The scroll fraction is the document scroll position divided by (document height minus viewport height).
- It is `aria-hidden`, has no interaction, and renders as a static full `--concrete` track when reduced motion is on.
- Implementation preference: native scroll-driven animation (`animation-timeline: scroll()`) where supported, with a tiny `requestAnimationFrame` scroll listener fallback. Passive listener; no layout reads in the handler other than `scrollY`; never causes layout.
- **Acceptance:** the line reaches the bottom exactly at the end of the page; no jank (frame time under 16 ms in the Performance trace).

---

## 6. Project page template

```
<header>            same as home
<main>
  <nav aria-label="Breadcrumb">  Home / Projects / {Title}   (plain links, no arrows)
  <h1>               title
  <p class="lede">   one-sentence summary
  <dl class="facts"> Status, Role, When, Stack, Links
  <section>          The problem
  <section>          What I built
  <section>          How it works     (figure with a caption)
  <section>          Results
  <section>          What isn't done
  <section>          Links
<footer>
```

- Layout: single prose column (38rem) with the facts block beside it on desktop (right, sticky not required). The sensor viewport does not appear on project pages; the page's figure is the visual.
- The figure is built per project from the diagram description in `02`. Draw it as inline SVG with token colors. Built parts solid; planned parts dashed.
- "Results" lists only measured numbers, each with its baseline. If there are none, the section says `None measured yet.`
- "What isn't done" is never omitted.
- Previous and next project links at the bottom, as plain text links with the project names.
- Each project page has its own `<title>`, meta description, and Open Graph image (the poster crop or the diagram).

---

## 7. States and edge cases

| Situation | Behavior |
|---|---|
| JavaScript disabled | Everything is readable and navigable. The viewport shows the poster. The lane line shows a static track. |
| WebGL unavailable or context lost | Poster stays or returns. No error shown to the visitor. |
| Reduced motion requested | Poster in place of the scene; no sweep, no morph, no lane fill; anchors jump. |
| Save-data header or very slow connection | Poster only; the scene file is never requested. |
| Very small viewport (320 px) | Layout holds; the two header links stay on one line; no horizontal scroll. |
| Very large viewport (2560 px) | Content stays within 1200 px; the viewport keeps its max size; no stretched text. |
| Print | Not designed; if the visitor prints, the content prints and the viewport is hidden. |
| Browser zoom to 200% | No overlap, no clipped content, no horizontal scroll at 1280 px equivalent |
| High contrast mode (`forced-colors`) | All content visible; focus rings use system colors; the viewport shows its poster with a visible border |
| Keyboard only | Skip link first; every control reachable and visible; no traps |
| Broken external link | Link checker catches it at build time, not the visitor |

---

## 8. Navigation and links

- Internal links are plain `<a>` elements; no client-side router is required. If the framework adds one, the page must still work as normal documents.
- External links: `rel="noopener"`; the resume PDF and the Baton demo video open normally in the same tab.
- Every link's text makes sense out of context (see `02`, microcopy).
- Anchor links update the hash and move focus to the target heading (set `tabindex="-1"` on headings if needed).

---

## 9. Acceptance summary for this doc

- All routes in section 1 exist and build.
- Every section in section 4 matches its content in `02` exactly.
- Section 7's situations each have a Playwright test or a recorded manual check in `08`.
- The page works end to end with JS disabled.
