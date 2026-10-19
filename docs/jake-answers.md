# Jake's answers

Answers from Jake, recorded 2026-10-19. Stage 2 uses this file to resolve `TODO(jake)` items.

## How to use this file

1. **Precedence.** Where this file conflicts with `docs/02-content.md`, **this file wins**. Section A lists the conflicts explicitly. Update `02-content.md` to match in the first Stage 2 commit and note it in the decision log.
2. **Quote the line.** When you fill a `TODO(jake)` from this file, use the wording given here and quote the line you used in the commit message or the conversation.
3. **Don't extend.** If something is not covered here, it stays `TODO(jake)`. Do not infer, round, or improve any claim.
4. **Approved sentences are marked "Use:".** Other lines are facts to write from; keep their meaning exactly.
5. **Claims ledger still applies.** Nothing here relaxes the forbidden columns in `02-content.md` section B except where section A says so.

---

## A. Overrides to `02-content.md` (Spot)

| In `02-content.md` | Replace with |
|---|---|
| Spot "Role" has a labmate collaborator caveat | Jake is the sole contributor. Remove the caveat. |
| "Speech becomes text. The text becomes a query." (two steps) | One step. The transcript goes straight to the vision-language model as the query. There is no rewriting step yet. |
| "A small YOLO model tracks that person between model calls." | Not integrated. YOLO11n detects and tracks people across the live camera feed on its own. The vision-language model and YOLO are separate components. Connecting them is the next step. |
| Spot "When": `Aug 2025 to present` | `September 2026 to present`. The fellowship (Aug 2025 to present) stays on the experience timeline. |
| "The pieces run on a laptop and a GPU desktop. They are not yet running on the robot." | Keep the first sentence. Add: all camera footage comes from Spot's own cameras; the code runs on a laptop and a GPU desktop because deploying to the robot slows iteration. |
| Home row one-liner: "Describe a person out loud; a robot dog finds and tracks them." | Use: "A voice-commanded person-following system for a Boston Dynamics Spot, in progress." |
| Home "Now" item 1 second sentence: "Speech, visual grounding, and tracking work separately; I'm connecting them." | Use: "Speech to text, visual grounding, and person tracking each work on their own. Connecting them is next." |

The project name stays "Spot voice-following." It names the goal. Status is "In progress," and the summary says what works today.

---

## B. Spot voice-following

**Facts**
- Role: sole contributor.
- Built the pipeline around pretrained models. The models are not Jake's work.
- Started: September 2026, within the fellowship that began in August 2025.
- Speech to text: faster-whisper, running OpenAI's Whisper `base.en` model (the English-only base size).
- Query: the raw transcript is passed straight to the vision-language model. No rewriting yet.
- Vision-language model: NVIDIA's LocateAnything-3B. It takes a text query and returns a bounding box for the described target. Runs on a GPU desktop.
- Detection and tracking: Ultralytics YOLO11n, person class only. It takes the live camera feed and tracks people across frames with decent identity persistence. Runs on a laptop.
- Footage: all camera feed is from Spot's own cameras.
- Integration: the vision-language model and YOLO are not yet integrated. Everything after that hand-off (matching the box to a tracked person, navigation goal, following) is not built.
- Public material: no public repo. Jake can provide screenshots.

**Use (role line):** "I'm the sole contributor. I built the pipeline around pretrained models: faster-whisper with Whisper base.en, NVIDIA's LocateAnything-3B, and Ultralytics YOLO11n."

**Use (summary):** "A voice-commanded person-following system for a Boston Dynamics Spot. Speech to text, visual grounding, and person tracking each work on their own; I'm connecting them."

**Pipeline diagram (replaces the six-step list in `02`, section D1)**

Two solid chains that converge on a dashed hand-off:
- Chain 1 (solid): Spoken command, then speech to text (faster-whisper, Whisper base.en), then vision-language model (LocateAnything-3B), then a bounding box for the described person.
- Chain 2 (solid): Spot's camera feed, then person detection and tracking (YOLO11n), then tracked people with IDs.
- Both chains take the same camera feed as input to their vision step.
- Dashed: match the model's box to a tracked person, then turn that person into a navigation goal for Spot, then Spot follows.

Caption: "Solid boxes work today, each on its own. Dashed boxes are what I'm building next."

These are a real sequence within each chain, so step numerals are allowed inside the chains.

**Results:** "None measured yet." Do not state latency, accuracy, or frame rate. Do not use "accurate" or "decent" on the page; describe what each piece does.

**What isn't done (use as the section's content; two items are assumed and marked):**
- The vision-language model and the tracker aren't integrated, so the system can't yet follow a described person.
- Matching the model's box to a tracked person is not built.
- Turning the tracked person into a navigation goal for Spot is not built.
- The code does not run on the robot; it runs on a laptop and a GPU desktop with footage from Spot's cameras.
- `TODO(jake)`: confirm that handling a lost target and a safety stop are also not built.

**Screenshots (optional, from Jake):** a frame with the model's box and the text query that produced it; a frame with tracked person IDs; a transcription line. Before use: crop or blur any other person, remove anything identifying private lab space, and confirm the lab is fine with the images going public. Until provided, the page uses the diagram only.

---

## C. WayFinder

**Facts**
- Role: Jake built the model and part of the web visualizer. The focus is the model. A teammate built the hardware demo; Jake did not.
- Event: ShellHacks X, September 2026.
- "When confident" means: at a model confidence of 0.8 or higher, the predictions are correct 95% of the time.
- False-green errors: 2.5% **on predictions at 0.8 or higher confidence only**.
- Baseline (19% false-green): a hand-written rule. If the cars near the vehicle are stopped, predict stop. If they are moving, predict go.
- Inference time: 0.25 ms per inference.
- Data: per-lane features from more than 2 million rows across 16,000 Waymo scenarios, with ego-lane detection and controls against data leakage.

**Use (role line):** "I built the model and part of the web visualizer. A teammate built the hardware demo."

**Use (what I built):** "A LightGBM classifier and the per-lane feature pipeline behind it, plus part of the web visualizer. I engineered features from more than 2 million rows across 16,000 Waymo scenarios, added ego-lane detection, and put controls in place against data leakage."

**Use (results):**
- "At a model confidence of 0.8 or higher, 95% of predictions are correct."
- "On those confident predictions, false-green errors are 2.5%, compared with 19% for a hand-written rule (if the cars nearby are stopped, predict stop; if they are moving, predict go)."
- "0.25 ms per inference."

**Wording rule:** every use of the 2.5% states its scope ("on predictions at 0.8 or higher confidence"). Never present 2.5% versus 19% as a like-for-like comparison unless the baseline scope below is confirmed.

**Still open (`TODO(jake)`):**
- Baseline scope: was the 19% measured over all cases, or over the same confident subset as the 2.5%? Check the notebook. The page must say which.
- What share of cases clear the 0.8 threshold.
- Hardware the 0.25 ms was measured on.
- Do not name a specific Waymo dataset by title. Say "Waymo scenario data."

---

## D. Baton

**Facts**
- Event: PalmettoHacks, October 2026. Placed 2nd overall. Team of 4.
- Role, confirmed accurate after Jake's prep: contributed to the shared-session layer and designed the append-only event log that every session is built on.
- Repo: https://github.com/Jacob-M-Webster/Baton. Demo video: https://youtu.be/sKwHaWB106Q.

**Use (role line):** "I contributed to the shared-session layer and designed the append-only event log that every session is built on."

**AI-assistance line (decision D4):** include one plain sentence. Default wording, pending Jake's okay: "We built this quickly and used AI coding tools heavily. I focused on understanding and owning the event log." `TODO(jake)`: approve or edit.

**Wording rules:** do not write "I built Baton." Do not include market, pricing, customer, or validation claims. The "What isn't done" content comes from the repo README (command runner is a guard, not isolation; container mode untested; identity is name-only).

---

## E. Dates

| Item | Date |
|---|---|
| ShellHacks X (WayFinder) | September 2026 |
| PalmettoHacks (Baton) | October 2026 |
| Spot work started | September 2026 |
| C4IS fellowship | August 2025 to present |
| Michelin part-time | September 2026 to present |
| Michelin internship | May to August 2026 |

---

## F. Still open

**Needed before launch (production build fails until each is resolved)**
- WayFinder baseline scope, share of cases at 0.8 or higher, and hardware for the 0.25 ms (section C).
- Spot: whether lost-target handling and a safety stop are not built (section B).
- Baton: approve the AI-assistance line (section D).
- Dean's Scholar semester count against the transcript. The resume says 5.
- Whether to show GPA (default: show it once, in the education block, not in the hero).
- Michelin: confirm what may be listed publicly.

**Optional**
- Spot screenshots (section B).
- A one-sentence "problem" framing for each project, in Jake's own words. Until then, use the drafts in `02-content.md` section D marked `TODO(jake)`.

---

## G. Jake's own follow-ups (not for the site)

These answers show that two resume lines are slightly ahead of the facts. Worth tightening before the next applications.

- **Spot bullet.** "speech-to-query parsing" suggests a transformation step that doesn't exist, and "integrating with Spot navigation" is ahead of the hand-off. More accurate: "Developing a voice-commanded person-following system for Boston Dynamics Spot: faster-whisper speech-to-text, VLM grounding (LocateAnything-3B), and YOLO11n person tracking, built as separate components; integration in progress."
- **WayFinder bullet.** Scope the 2.5%. For example: "Cut false-green errors from 19% (hand-written rule) to 2.5% on predictions at 0.8+ confidence." Confirm the baseline scope first.
