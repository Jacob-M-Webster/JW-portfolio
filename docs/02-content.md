# 02. Content

This is the only source of copy and facts for the site. If something is not here, it does not go on the site. Missing information is written as `TODO(jake): ...` and blocks the production build.

Sources for every fact below: Jake's final resume, his GitHub profile and repositories, and his own statements.

`docs/jake-answers.md` (Jake's answers, 2026-10-19) overrides this file where they conflict. Its section A overrides are applied below; its other sections resolve `TODO(jake)` items in `content/`. "Verify" means Jake must confirm against his own records before launch.

---

## A. Facts ledger

| ID | Fact | Source | Verify before launch |
|---|---|---|---|
| F1 | Name: Jacob Webster (goes by Jake) | Resume | |
| F2 | B.S. Computer Science, University of South Carolina, Aug 2024 to May 2027, GPA 3.6 | Resume | GPA shown on the site: optional. Default: omit from the hero, include on the experience/education block. |
| F3 | Software Engineer (Part-Time), Michelin, Greenville SC, Sep 2026 to present. Works on documentation updates and testing and code-quality tooling (Renovate dependency updates, SonarQube static analysis, automated test setup) | Resume | Check what Michelin allows to be listed publicly |
| F4 | Software Engineering Intern, Michelin, May to Aug 2026. Playwright frontend tests cut minor release testing from 150 minutes to 3.5 minutes on the inventory management application. Cut the steps to transmit parcel data by 75% using Kafka and Java microservices | Resume | |
| F5 | Software Engineering Fellow, University of South Carolina Center for Industry Solutions, Columbia SC, Aug 2025 to present | Resume | |
| F6 | Spot work (in progress, started September 2026; Jake is the sole contributor): faster-whisper (Whisper base.en) transcribes the spoken command; the raw transcript goes straight to NVIDIA's LocateAnything-3B vision-language model as the query, which returns a bounding box for the described person; separately, YOLO11n (person class) detects and tracks people across Spot's live camera feed. The two are not integrated. Runs on a laptop plus a GPU desktop, with footage from Spot's own cameras | Jake, `jake-answers.md` A and B | |
| F7 | Caelus: ROS2 drone perception prototype led by Jake (team of 3). Accumulates 2D LiDAR scans into a 3D voxel point cloud at 10 cm resolution. The project is paused. The Z-axis uses a placeholder increment rather than measured angle data | Resume, Jake | Whether to say "paused" on the site (default: yes) |
| F8 | WayFinder: LightGBM model that infers traffic light state from nearby vehicle behavior, as a fallback when signals fail. 95% accuracy when confident. False-green errors cut to 2.5% from a 19% baseline. 0.25 ms per inference. Per-lane features from 2M+ rows across 16k Waymo scenarios, with ego-lane detection and leakage controls. ShellHacks X, Sep 2026 | Resume | Definition of "confident"; which parts Jake wrote (a teammate built the hardware demo; Jake did not) |
| F9 | Baton: multi-user layer for AI coding agents. PalmettoHacks, Oct 2026, 2nd overall, team of 4. Jake contributed to the layer and designed the append-only event log | Resume, repo README | Event-log ownership wording after Jake's prep; hackathon dates |
| F10 | Honors: Palmetto Fellows Scholarship (SC merit-based); Dean's Scholar (5 semesters); hackathons: CUhackit 2025 Best Web Dev, NASA Space Apps Most Inspirational, PalmettoHacks 2nd Overall | Resume | Dean's Scholar semester count against the transcript |
| F11 | Contact: jakewebster5619@gmail.com; linkedin.com/in/jacob-webster2; github.com/Jacob-M-Webster | Resume, GitHub | |
| F12 | Looking for: new grad software engineering roles in autonomy and infrastructure, 2027 | GitHub profile | |
| F13 | Baton demo video: https://youtu.be/sKwHaWB106Q. Repo: https://github.com/Jacob-M-Webster/Baton | Repo README | Repo public and secrets-clean |
| F14 | WayFinder repo: https://github.com/Jacob-M-Webster/Wayfinder | GitHub | README explains the Python model and the web visualizer |

---

## B. Claims ledger

Format: what may be said, what may not. "Allowed" phrasing can be reworded, but it may not claim more.

### Spot voice-following (F6)
| Allowed | Forbidden |
|---|---|
| "I'm building a system that lets a Boston Dynamics Spot find and follow a person described out loud." (the verb is *building*) | "Spot follows people", "autonomously follows", "deployed on Spot", "working end to end" |
| "A vision-language model locates the person in the camera image from a text description." | "Real-time" (unless a latency number is measured and shown) |
| "YOLO11n detects and tracks people across the live camera feed on its own. The vision-language model and YOLO are separate components; connecting them is the next step." (`jake-answers.md` A) | Any claim about navigation, obstacle avoidance, or safety behavior being done; any claim that the tracker follows the person the model found |
| "The pieces run on a laptop and a GPU desktop." All camera footage comes from Spot's own cameras; the code runs on a laptop and a GPU desktop because deploying to the robot slows iteration. (`jake-answers.md` A) | Implying the model runs on Spot's own hardware |
| "Next: connect the tracker's output to Spot's navigation." | Dates or promises about when it will work |

### Caelus (F7)
| Allowed | Forbidden |
|---|---|
| "Led a three-person team building Caelus, a ROS2 drone perception prototype." | "Autonomous navigation", "SLAM", "real-time 3D mapping", "3D LiDAR" |
| "It accumulates 2D LiDAR scans into a 3D voxel point cloud at 10 cm resolution." | Any claim that the third dimension comes from measured sensor rotation |
| "The project is paused." | "Completed", "flight-tested" |

### WayFinder (F8)
| Allowed | Forbidden |
|---|---|
| The numbers exactly as in F8, with the baseline stated | "Deployed", "production", "works on real intersections" |
| "Inferred from the behavior of nearby vehicles" | "I built the hardware demo" (a teammate did) |
| "Trained and tested on Waymo scenario data" | Naming a specific Waymo dataset by title unless Jake confirms it |
| "A hackathon prototype" | Any claim about Waymo using or endorsing it |

### Baton (F9)
| Allowed | Forbidden |
|---|---|
| "2nd overall at PalmettoHacks." | "I built Baton" (it was a team of 4) |
| "I contributed to the shared-session layer and designed the append-only event log." (after Jake confirms) | "Production-ready", "secure", "enterprise" |
| "Built with heavy AI assistance." (D4, wording below) | Market size, pricing, revenue, customers, validation claims (these live in the hackathon pitch, not on a portfolio) |
| "The default sandbox is a guard, not isolation." (from the repo's own README) | Claims about features the README lists as untested (Docker sandbox mode) |

### Michelin (F3, F4)
| Allowed | Forbidden |
|---|---|
| The two intern results exactly as in F4 | "Owned", "led", or "architected" the application |
| "Part-time software engineer working on testing and code-quality tooling" | Naming internal systems or tools beyond the public-safe wording in the resume |

### General
- No "expert", "senior", "seasoned", "world-class", "passionate".
- No logos for Waymo, Jaguar, Boston Dynamics, Michelin, NVIDIA, or USC.
- Boston Dynamics, Waymo, NVIDIA, YOLO, and Michelin appear as plain text names.
- Every number on the site is either in this doc or computed live and real (for example, the actual number of points in the scene).
- No fake telemetry, fake counters, or decorative numbers.

---

## C. Home page copy

### Header
- Wordmark (left): `Jacob Webster`
- Links (right): `Projects`, `Experience`, `Resume`, `Email`

### Hero
- **H1:** `I build perception and autonomy software.`
- **Lead paragraph:** `I'm a computer science senior at the University of South Carolina, graduating in May 2027. I enjoy building software for machines that move. I'm looking for new grad software engineering roles in autonomy and infrastructure.`
- **Actions (two links styled as buttons):** `Download resume (PDF)` and `Email me`

### What I'm working on now
Two short items, no heading decoration.

1. `Spot voice-following.` `I'm building a system that lets a Boston Dynamics Spot find and follow a person described out loud. Speech to text, visual grounding, and person tracking each work on their own. Connecting them is next.` Link: `Read the Spot write-up` (to the project page)
2. `Michelin.` `I work part-time as a software engineer on testing and code-quality tooling.`

### Projects (section heading: `Projects`)
Row copy (title, one line, status, stack):

| Project | One line | Status | Stack |
|---|---|---|---|
| Spot voice-following | A voice-commanded person-following system for a Boston Dynamics Spot, in progress. | In progress | Python, LocateAnything-3B, YOLO11n |
| WayFinder | Infers a traffic light's state from how nearby cars behave, for when the signal fails. | Hackathon prototype, ShellHacks X | Python, LightGBM, Pandas |
| Baton | A shared, replayable session where a team watches and steers one AI coding agent. | 2nd overall, PalmettoHacks | Python, FastAPI, React, WebSockets, SQLite |

### Experience (section heading: `Experience`)
Reverse chronological. Real chronology, so dates are the structure.

**Software Engineer (part-time), Michelin, Greenville, SC. Sep 2026 to present**
- Updating technical documentation for the team's applications.
- Setting up testing and code-quality tooling, including Renovate dependency updates and SonarQube static analysis.

**Software Engineering Intern, Michelin, Greenville, SC. May to Aug 2026**
- Developed automated frontend tests with Playwright for the inventory management application, cutting minor release testing from 150 minutes to 3.5.
- Reduced the steps to transmit parcel data by 75% using Kafka and Java microservices.

**Software Engineering Fellow, USC Center for Industry Solutions, Columbia, SC. Aug 2025 to present**
- Building the Spot voice-following system described above.
- Led a team of three building Caelus, a ROS2 drone perception prototype that accumulates 2D LiDAR scans into a 3D voxel point cloud at 10 cm resolution. The project is paused.
- Set the team's Git workflow and code review standards.

### Education
`University of South Carolina. B.S. Computer Science. Aug 2024 to May 2027.` Optional: `GPA 3.6` (D-level choice: include here, not in the hero).

### Skills (plain definition list, grouped by what Jake does)
- `Languages:` Python, C++, Java, C, JavaScript and TypeScript, SQL
- `Robotics and machine learning:` ROS2, LiDAR point clouds, LightGBM, PyTorch, TensorFlow, YOLO, vision-language models
- `Backend and systems:` Linux, Git, Kafka, Spring Boot, REST APIs, FastAPI, WebSockets, SQLite
- `Web and testing:` React, Node.js, Tailwind CSS, Playwright

No logo walls, skill bars, percentages, or star ratings.

### Honors
- `Palmetto Fellows Scholarship (South Carolina merit-based scholarship)`
- `Dean's Scholar, 5 semesters`
- `Hackathons: CUhackit 2025 (Best Web Development), NASA Space Apps (Most Inspirational), PalmettoHacks (2nd overall)`

### Footer
- `Email jakewebster5619@gmail.com`, `LinkedIn`, `GitHub`, `Resume (PDF)`
- Line: `Built by me. Illustrations of the car and robot are point clouds drawn for this page.`
- No copyright year banner required; if present, `© 2026 Jacob Webster`.

---

## D. Project pages

Every project page uses this structure, in this order. Headings are sentence case. Do not add sections.

1. Title and one-line summary
2. A small facts block (definition list): Status, Role, When, Stack, Links
3. The problem
4. What I built (names the exact pieces Jake wrote)
5. How it works (honest diagram: solid = built, dashed = planned)
6. Results (only measured numbers, each with its baseline)
7. What isn't done
8. Links (repo, demo, and a "Back to projects" link)

### D1. Spot voice-following

- **Title:** `Spot voice-following`
- **Summary:** `Describe a person out loud and a Boston Dynamics Spot finds and tracks them. The perception pieces work separately; I'm connecting them.`
- **Facts block:**
  - Status: `In progress`
  - Role: Jake is the sole contributor (`jake-answers.md` B gives the role line).
  - When: `September 2026 to present, at USC's Center for Industry Solutions` (the fellowship itself, Aug 2025 to present, stays on the experience timeline)
  - Stack: `Python, NVIDIA LocateAnything-3B, YOLO11n` (`TODO(jake)`: speech-to-text tool)
  - Links: none yet (`TODO(jake)`: repo or demo if public)
- **The problem:** `Following someone on command needs three things a robot doesn't have by default: understanding a spoken description, finding the right person in the camera image, and not losing them. Most person-following demos track "the nearest person." I want "the person in the red jacket."` (`TODO(jake)`: confirm this is the intended framing; delete if not.)
- **What I built:** `TODO(jake): list the specific components Jake wrote, one sentence each. Do not include anything a labmate wrote.`
- **How it works** (`jake-answers.md` B; two real sequences, so step numerals are allowed inside each chain). Two solid chains converge on a dashed hand-off:
  - Chain 1 (built): spoken command, then speech to text (faster-whisper, Whisper base.en), then the vision-language model (LocateAnything-3B), then a bounding box for the described person. The transcript goes straight to the model as the query; there is no rewriting step yet.
  - Chain 2 (built): Spot's camera feed, then person detection and tracking (YOLO11n), then tracked people with IDs.
  - Both chains take the same camera feed as input to their vision step.
  - Planned (dashed): match the model's box to a tracked person, then turn that person into a navigation goal for Spot, then follow the person.
  Caption: `Solid boxes work today, each on its own. Dashed boxes are what I'm building next.`
- **Results:** `None measured yet.` (If measured: `TODO(jake)`: latency per grounding call, tracker frame rate, hand-off accuracy. Do not estimate.)
- **What isn't done:** `The pieces run on a laptop and a GPU desktop, not on Spot. The hand-off from the model's box to the tracker, and from the tracker to navigation, is what I'm working on.` (`TODO(jake)`: replace with the true current state; list how the model's box is matched to a tracked person, how a lost target is handled, and the safety stop behavior, each as done or not done.)

### D2. WayFinder

- **Title:** `WayFinder`
- **Summary:** `A model that infers a traffic light's state from how nearby cars behave, so an autonomous vehicle has a fallback when a signal goes dark.`
- **Facts block:**
  - Status: `Hackathon prototype`
  - Role: `Model and feature pipeline` (`TODO(jake)`: confirm; list anything else Jake built, such as the web visualizer; note that a teammate built the hardware demo)
  - When: `ShellHacks X, September 2026` (`TODO(jake)`: verify)
  - Stack: `Python, LightGBM, Pandas` (the repo also contains a TypeScript visualizer; say who built it)
  - Links: repo (F14)
- **The problem:** `When a traffic signal is out, an autonomous vehicle can't read it. Other cars still behave as if the signal exists: they stop, they go, they queue by lane. That behavior carries information.`
- **What I built:** `A LightGBM classifier and the per-lane feature pipeline behind it. I engineered features from more than 2 million rows across 16,000 Waymo scenarios, added ego-lane detection, and put controls in place to prevent data leakage between training and test.` (`TODO(jake)`: confirm every clause.)
- **How it works:** a simple labeled flow: scenario data, per-lane features, model, predicted signal state with a confidence. Mark the hardware demo as `built by a teammate`.
- **Results:**
  - `95% accuracy when the model is confident.` (`TODO(jake)`: define the confidence threshold and what share of cases are "confident".)
  - `False-green errors cut to 2.5%, down from a 19% baseline.` (`TODO(jake)`: define the baseline.)
  - `0.25 ms per inference.` (`TODO(jake)`: the hardware this was measured on.)
- **What isn't done:** `It's a hackathon prototype. It hasn't been tested outside the Waymo scenarios it trained on. A false green is the dangerous error, which is why I optimized against it, but this is not a safety system.` (`TODO(jake)`: confirm; add any real limits.)

### D3. Baton

- **Title:** `Baton`
- **Summary:** `A shared session where a whole team can watch, comment on, and steer one AI coding agent, with a log you can replay from any step.`
- **Facts block:**
  - Status: `Hackathon project, 2nd overall at PalmettoHacks`
  - Role: `I contributed to the shared-session layer and designed the append-only event log.` (`TODO(jake)`: confirm this after the prep pass; remove "designed" if it isn't accurate.)
  - When: `PalmettoHacks, October 2026, with a team of four` (`TODO(jake)`: verify)
  - Stack: `Python, FastAPI, React, WebSockets, SQLite`
  - Links: repo and demo video (F13)
- **The problem:** `Coding agents live in one person's terminal. When the agent goes down the wrong path, a teammate who knows the code can't see it, and when the person who started it logs off, the work stalls.`
- **What I built:** `The pieces I own are the event log that every session is built on, and ... ` (`TODO(jake)`: finish after prep.)
- **How it works:** `Every agent message, tool call, and human action is appended to a log with a sequence number. Browsers subscribe over WebSockets, replay from any point, then go live. The agent's context is rebuilt from the log on each turn. That one choice gives crash recovery, forking a session from any step, and switching AI models mid-session.` Diagram: log in the center; agent, browsers, and replay around it. All parts are built; none planned.
- **Results:** `2nd overall at PalmettoHacks.` No other results.
- **What isn't done:** `The default command runner is a guard, not a sandbox: it blocks obviously destructive commands but isn't isolation. A container mode exists but wasn't tested. Identity is name-only. Run it on a network you trust.` (Taken from the repo's own README; keep it consistent with the README.)
- **How it was built (D4):** `We built this quickly and used AI coding tools heavily. I focused on understanding and owning the event log.` (`TODO(jake)`: edit to taste, keeping it true.)

---

## E. Microcopy

| Place | Copy |
|---|---|
| Resume link | `Download resume (PDF)` |
| Email link | `Email me` (opens `mailto:`); visible address in the footer |
| External links | Link text names the destination: `Baton on GitHub`, `Watch the Baton demo`. Never `Click here`, never an arrow glyph. |
| Project row hover/focus | Underline thickens; no scale, no shadow |
| Status words | `In progress`, `Paused`, `Hackathon prototype`, `2nd overall` |
| Scene caption (visible text near the viewport) | `Illustration: a point cloud drawn for this page. Each dot is one return.` |
| Scene live readout (optional; must be real) | `30,000 points`, showing the actual count currently rendered |
| 404 | Heading `That page doesn't exist.` Body `The link may be old. Projects and the resume are one click away.` Links: `Projects`, `Home` |
| Image alt text | Describes content and purpose, and names every planned part: `Diagram of the Spot pipeline: speech to text into a grounding model, and a separate person tracker on the camera feed, then planned steps: match the box to a tracked person, a navigation goal, follow the person` |
| Canvas | `aria-hidden="true"`; the caption above carries the meaning |
| Skip link | `Skip to content` |
| Print | Not required; if added, hide the scene and show the resume contact line |

---

## F. Writing rules

### Do
- Lead with the thing, then the evidence.
- Name the baseline whenever you give a number.
- Say what's unfinished in the same breath as what works.
- Use the same name for the same thing everywhere: "Spot voice-following" is never also "robot dog project."
- Make link text self-explanatory out of context.

### Don't use these words or phrases
passionate, driven, leverage, leveraging, cutting-edge, state-of-the-art, seamless, robust (unless describing a measured property), innovative, solutions, synergy, journey, deep dive, game-changing, next-generation, world-class, rockstar, ninja, guru, "I'm excited to", "I love to", "hard-working", "team player", "fast learner".

### Rewrites
| Instead of | Write |
|---|---|
| `Passionate about autonomous vehicles` | `I enjoy building software for machines that move.` |
| `Leveraged ML to deliver robust results` | `Cut false-green errors from 19% to 2.5% with a LightGBM model.` |
| `Cutting-edge robotics project` | `A Spot robot that finds a person from a spoken description.` |
| `Fast learner who thrives in teams` | (delete; show the Git workflow and code review standards he set) |
| `Check out my work →` | `See the three projects` |

### Formatting rules
- Sentence case for every heading, label, and button.
- No exclamation marks. No emoji. No ellipsis for effect.
- No em dash used as a label separator ("Status — in progress"). Use a definition list.
- Dates: `Sep 2026 to present`, `May to Aug 2026`. Write "to," not a dash, in prose.
- Numbers: digits for measurements (`150 minutes`, `95%`, `0.25 ms`).

---

## G. Content files (structure for the build)

Content lives outside components so Jake can edit it without touching layout:

```
content/
  site.json              # name, descriptor, links, status line
  experience.json        # roles with dates and bullets
  skills.json            # grouped lists
  honors.json
  projects/
    spot.md              # frontmatter: title, summary, status, role, when, stack, links; body sections D1
    wayfinder.md
    baton.md
```

Frontmatter schema for a project (validated at build; missing required fields fail the build):

```yaml
title: string
summary: string          # one sentence, no more than 160 characters
status: string           # one of: in-progress | paused | prototype | placed
statusLabel: string      # what the reader sees, e.g. "In progress"
role: string             # one sentence, first person
when: string
stack: [string]          # no more than 6
links:
  - label: string        # names the destination
    href: url
order: number
```
