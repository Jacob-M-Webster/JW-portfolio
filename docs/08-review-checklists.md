# 08. Review checklists

Run the relevant checklist at the end of each stage. Mark every line pass or fail with evidence (a command output, a screenshot path, or a quoted ledger row). A line without evidence is a fail.

---

## 1. Claims audit (the honesty check)

Do this for every sentence that states a fact on the site, in the built output, not in the source.

**Procedure**
1. Export the visible text of each route (Playwright `innerText` of `main`, plus header and footer).
2. For each sentence containing a fact (a number, date, title, employer, technology, status, result, or award), find its row in `02-content.md`, section A (facts) or section D (project content).
3. Check it against the forbidden column in section B.
4. Record it in a table.

| Route | Sentence | Ledger row | Forbidden-column hit? | Verified by Jake |
|---|---|---|---|---|

**Fails if**
- Any sentence has no ledger row.
- Any sentence hits a forbidden phrase.
- Any number appears without its baseline or unit.
- Spot is described as working end to end, deployed, or autonomous.
- Caelus is described as SLAM, real-time mapping, or measured 3D rotation.
- WayFinder implies Jake built the hardware demo, or implies production use.
- Baton says "I built Baton", or includes market, pricing, or customer claims.
- The word "paused" is missing next to Caelus.
- The resume PDF on the site differs from Jake's current resume (compare dates and titles).

Also run: `check:content` (forbidden-phrase regexes and `TODO(jake)` scan).

---

## 2. Anti-slop audit (the design check)

Go through `03-design-system.md` section 8 line by line against the built site. For each item, record: present or absent, and where.

**Quick scans (run and paste)**
- `grep -rniE "gradient|backdrop-filter|box-shadow|filter: *blur|text-shadow" src/ styles/` → no results (the single exception: none).
- `grep -rniE "text-transform: *uppercase|letter-spacing" src/ styles/` → letter-spacing appears only on `--text-display`; no `uppercase`.
- `grep -rniE "font-family" src/ styles/` → only the two declared families, via tokens.
- `grep -rnE "#[0-9a-fA-F]{3,8}\b" src/ styles/` → hex only in the token file (and the poster script).
- `grep -rniE "!important" src/ styles/` → no results.
- `grep -rnE "→|›|↗|➜" src/ content/` → no results.
- `grep -rniE "lorem|ipsum" src/ content/` → no results.
- `grep -rniE "outline: *none|outline: *0" src/ styles/` → each hit has a replacement focus style.
- No `<img>` without `width` and `height`.
- No icon library, no emoji characters in markup (`grep` for common emoji ranges).

**Visual pass (screenshots at 375, 768, 1280, 1920, both themes)**

For each screenshot, answer in writing:
1. What does the eye land on first? Is it the sensor viewport or the H1 (both are acceptable; nothing else is)?
2. Is any element competing with the viewport?
3. Is anything centered that should be left-aligned?
4. Are there more than two type weights or sizes in use in one block without a reason?
5. Do the three project rows look different because the content differs, or the same because a template made them?
6. Where is the empty space? Is it doing work (separating things, giving rest), or is it leftover?
7. Remove one accessory: what is the least necessary element? Remove it or say why nothing qualifies.

**Taste tests**
- Cover the name. Could this page belong to anyone? If yes, find what is generic and make it specific to perception, robotics, or Jake's work.
- Could this page be mistaken for a template? Check the first viewport against the rejected defaults in `03`, section 2.

---

## 3. Content proofreading

- Read every page aloud once.
- No banned words (list in `02`, section F).
- Sentence case in every heading, label, and button.
- Dates written as `Sep 2026 to present`; no dash ranges in prose.
- Same name for the same thing everywhere (Spot voice-following, WayFinder, Baton, Caelus).
- Link text names the destination.
- Alt text and captions are accurate and not redundant.
- Spelling of proper names: Boston Dynamics, Spot, LocateAnything-3B, YOLO11n, LightGBM, WayFinder, Baton, PalmettoHacks, ShellHacks, CUhackit, NASA Space Apps, Michelin, USC Center for Industry Solutions.

---

## 4. Device and browser checks

Record device, browser, version, result, and notes.

| Check | Devices |
|---|---|
| Home, hero, viewport, all rows | Laptop Chrome, Safari, Firefox; one iPhone (Safari); one Android phone (Chrome) |
| Project pages and figures | Same |
| Light and dark themes | Switch the OS setting on each device |
| Portrait and landscape on phones | Rotate; no overflow |
| 200% zoom on desktop | No overlap, no horizontal scroll |
| Keyboard only (desktop) | Tab through everything; skip link works |
| Screen reader (VoiceOver or NVDA) | Read home top to bottom |
| Reduced motion on | Poster shown; no animation |
| Slow network (DevTools "Slow 4G") | Content readable before the scene loads |
| JavaScript disabled | Content intact |
| Link preview | Paste the live URL into a chat app; image, title, and description correct |

---

## 5. Stage checklists

### Stage 1
- [ ] Token file is the only place raw hex appears
- [ ] Contrast table printed; all pairs pass in both themes (including focus ring and highlighter hover)
- [ ] Two fonts only; licenses included; font payload within budget
- [ ] Style guide shows every component state in both themes
- [ ] Anti-slop quick scans clean
- [ ] Screenshot critiques written

### Stage 2
- [ ] Every route builds
- [ ] Every sentence has a ledger row (claims audit)
- [ ] Every `TODO(jake)` listed
- [ ] Zero axe violations
- [ ] JS-off screenshots pass the first-viewport test (S1)
- [ ] Project pages include "What isn't done"
- [ ] Figures use solid for built and dashed for planned

### Stage 3
- [ ] `docs/asset-report.md` written
- [ ] Scripts deterministic (hashes match across two runs)
- [ ] `check:assets` clean (git index, git history, extensions, hashes, textures)
- [ ] Output sizes within budget
- [ ] Posters reviewed by Jake

### Stage 4
- [ ] Nine scene checks pass
- [ ] Adaptive quality demonstrated
- [ ] No third-party requests in the network log
- [ ] No console errors in any fallback path
- [ ] Mobile hero scene runs at 12,000 points with DPR capped
- [ ] Hover and scroll don't fight (recorded manual check)

### Stage 5
- [ ] `check:all` exits 0
- [ ] Lighthouse median table meets all bars
- [ ] Secrets scan over the full history is clean
- [ ] `npm audit` has no high or critical findings
- [ ] README complete
- [ ] "Remove one accessory" done

### Stage 6 (launch)
- [ ] Claims audit: zero fails, Jake has re-read it
- [ ] Anti-slop audit: zero fails
- [ ] Device and browser table filled
- [ ] Resume PDF on the site is the current resume
- [ ] Email link, LinkedIn link, GitHub link, and resume link all work on the live site
- [ ] Redirects from old URLs (if any) are in place
- [ ] Open Graph preview correct
- [ ] 404 page works on the live host
- [ ] `robots.txt` and `sitemap.xml` live
- [ ] GitHub profile README and pinned repos match the site (names, wording)
- [ ] LinkedIn "Featured" and website field point to the site
- [ ] Raw purchased assets confirmed absent from the live site (fetch a few likely URLs; each returns 404)

---

## 6. Things Jake does by hand

These can't be delegated to the agent.

1. Fill in or delete every `TODO(jake)`.
2. Confirm every fact and date in `02`, section A, against his records.
3. Decide D1 to D10.
4. Supply `public/jacob-webster-resume.pdf`.
5. Read the claims audit and approve it.
6. Test on real phones and with a screen reader.
7. Review the license text for the purchased model for any web-use clause, and keep the receipt.
8. Deploy.
