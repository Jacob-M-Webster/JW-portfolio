# 01. Brief

## One-sentence purpose

Show, in under 30 seconds, that Jacob Webster builds perception and autonomy software, and give anyone who wants more a fast path to evidence they can check.

## Who it is for

### Reader A: the skimming recruiter (most visits)
- Arrives from a resume link, LinkedIn, or an email signature, usually on a laptop, sometimes on a phone between meetings.
- Spends 20 to 40 seconds. Looks for: name, school and graduation date, what kind of role he wants, two or three things he has built, recent employers, a way to get the resume.
- Does not read paragraphs. Does not wait for animations.
- **The site passes for this reader if** all of the above are visible without scrolling more than two screens and without any interaction.

### Reader B: the engineer or hiring manager (fewer visits, more weight)
- Opens a project page to judge depth. Looks for: what the person personally did, how the system works, what the results actually are, and what is unfinished.
- Distrusts inflated claims and will check the GitHub repo.
- **The site passes for this reader if** each project page states his role in a sentence, shows the architecture honestly (built versus planned), gives results only where they were measured, and says what is not done.

### Reader C: Jake, maintaining it
- Needs to add a project or change copy without touching layout code.
- **The site passes for this reader if** projects and experience live in content files (Markdown or JSON), not hard-coded in components.

## Jobs the site must do

1. State who he is and what he wants: new grad software engineering roles in autonomy and infrastructure, starting 2027.
2. Make the three projects (Spot, WayFinder, Baton) legible and credible.
3. Show current work honestly, including what is in progress.
4. Put the resume and email one click away on every screen.
5. Be memorable through one idea (the point-cloud sensor view) without making content harder to reach.

## Success criteria (measurable)

| # | Criterion | How it is checked |
|---|---|---|
| S1 | Name, school, graduation date, target role, resume link and email are visible in the first viewport on 375 px and 1280 px wide screens (no scrolling) | Playwright screenshot review plus a DOM check |
| S2 | Mobile Lighthouse performance 90 or higher, accessibility 100, best practices 100, SEO 100 | Lighthouse CLI output pasted in the conversation |
| S3 | LCP is 2.5 s or less, CLS 0.05 or less, TBT 200 ms or less on a throttled mobile profile | Same run |
| S4 | The page is fully readable and navigable with JavaScript disabled | Playwright with JS disabled |
| S5 | With the scene unavailable (no WebGL, reduced motion, or save-data), the page still looks intentional (poster image in place) | Playwright with stubbed WebGL and reduced motion |
| S6 | Every factual statement maps to a row in the claims ledger | Claims audit in `08-review-checklists.md` |
| S7 | No banned pattern from `03-design-system.md` appears | Anti-slop audit in `08-review-checklists.md` |
| S8 | No raw purchased 3D file appears in the repo or the build output | `check:assets` script |

## Non-goals

- A blog, a CMS, comments, newsletter signup, or a contact form.
- A dark-mode toggle button (the site follows the system setting).
- Analytics, cookies, or any third-party script.
- Showing every project Jake has ever made. Three projects and one honest experience list.
- Winning design awards. The goal is credibility with engineers.

## Voice

- First person, plain, specific. "I built the event log" beats "Passionate engineer with a track record of."
- State status honestly. "In progress" and "paused" are fine words.
- Numbers only when measured, with their context. Say what the baseline was.
- Sentence case everywhere. No all-caps labels, no exclamation marks, no emoji.
- Write for the reader's question, not the system's structure. A hiring manager wants to know what Jake did, not what his repo folders are called.

Detailed rules, banned words, and rewrites are in `02-content.md`.

## Constraints that cannot bend

1. **Honesty.** Everything on the site must be true as of launch and match the resume. Where the site goes deeper than the resume (project pages), the extra detail must also be true and must be something Jake can explain cold in an interview.
2. **Licensing.** The purchased car model's raw files never ship. Only a derived point-cloud file ships. No Waymo, Jaguar, or Boston Dynamics logos anywhere. Naming them as facts ("Boston Dynamics Spot", "Waymo scenario data") is fine; implying affiliation is not.
3. **Privacy.** No phone number, no street address, no photo of anyone else. Email only.
4. **Accessibility.** WCAG 2.2 AA minimum. Motion is never required to understand content.
5. **Longevity.** It must be buildable and editable by one student with no paid services.

## What the current site contributes

Unknown to these docs. Stage 0 (see `07-build-plan.md`) inspects the existing repo and reports: framework, dependencies, routes, content, build and deploy commands, current Lighthouse numbers, and what is worth keeping. No design or copy from the old site carries over by default.
