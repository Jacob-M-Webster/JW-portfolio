---
title: Spot voice-following
summary: "A voice-commanded person-following system for a Boston Dynamics Spot. Speech to text, visual grounding, and person tracking each work on their own; I'm connecting them."
oneLine: A voice-commanded person-following system for a Boston Dynamics Spot, in progress.
status: in-progress
statusLabel: In progress
rowStatusLabel: In progress
role: "I'm the sole contributor. I built the pipeline around pretrained models: faster-whisper with Whisper base.en, NVIDIA's LocateAnything-3B, and Ultralytics YOLO11n."
when: September 2026 to present, at USC's Center for Industry Solutions
stack:
  - Python
  - faster-whisper
  - NVIDIA LocateAnything-3B
  - YOLO11n
links: []
linksNote: No public repo.
order: 1
figure:
  id: spot
  alt: "Diagram of the Spot pipeline. Built, drawn solid: a spoken command goes through speech to text (faster-whisper) into the vision-language model (LocateAnything-3B), which returns a bounding box for the described person; separately, Spot's camera feed goes into person detection and tracking (YOLO11n), which gives tracked people with IDs. Planned, drawn dashed: match the model's box to a tracked person, then a navigation goal for Spot, then follow the person."
  caption: Solid boxes work today, each on its own. Dashed boxes are what I'm building next.
---

## The problem

Following someone on command needs three things a robot doesn't have by default: understanding a spoken description, finding the right person in the camera image, and not losing them. Most person-following demos track "the nearest person." I want "the person in the red jacket."

TODO(jake): confirm this framing, or replace it with your own sentence.

## What I built

I built the pipeline around pretrained models; the models are not my work.

- Speech to text: faster-whisper, running OpenAI's Whisper base.en model (the English-only base size).
- Query: the raw transcript is passed straight to the vision-language model. There is no rewriting step yet.
- Visual grounding: NVIDIA's LocateAnything-3B takes the text query and returns a bounding box for the described person. It runs on a GPU desktop.
- Person detection and tracking: Ultralytics YOLO11n, person class only, takes the live camera feed and tracks people across frames. It runs on a laptop.

## How it works

Two chains run side by side. In the first, a spoken command becomes text, and the transcript goes straight to the vision-language model as the query; the model returns a bounding box for the described person. In the second, YOLO11n detects and tracks people across Spot's camera feed and gives each one an ID. Both chains take the same camera feed as input to their vision step.

The two chains are separate components. Connecting them is the next step: match the model's box to a tracked person, turn that person into a navigation goal for Spot, then follow the person.

The pieces run on a laptop and a GPU desktop, because deploying to the robot slows iteration. All camera footage comes from Spot's own cameras.

## Results

None measured yet.

## What isn't done

- The vision-language model and the tracker aren't integrated, so the system can't yet follow a described person.
- Matching the model's box to a tracked person is not built.
- Turning the tracked person into a navigation goal for Spot is not built.
- The code does not run on the robot; it runs on a laptop and a GPU desktop with footage from Spot's cameras.
- TODO(jake): confirm that handling a lost target and a safety stop are also not built.
