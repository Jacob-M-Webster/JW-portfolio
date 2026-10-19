---
title: WayFinder
summary: A model that infers a traffic light's state from how nearby cars behave, so an autonomous vehicle has a fallback when a signal goes dark.
oneLine: Infers a traffic light's state from how nearby cars behave, for when the signal fails.
status: prototype
statusLabel: Hackathon prototype
rowStatusLabel: Hackathon prototype, ShellHacks X
role: I built the model and part of the web visualizer. A teammate built the hardware demo.
when: ShellHacks X, September 2026
stack:
  - Python
  - LightGBM
  - Pandas
links:
  - label: WayFinder on GitHub
    href: https://github.com/Jacob-M-Webster/Wayfinder
order: 2
figure:
  id: wayfinder
  alt: 'Diagram of the WayFinder flow, all built and drawn solid: Waymo scenario data, then per-lane features, then the LightGBM classifier, then a predicted signal state with a confidence. No planned parts.'
  caption: Every part shown is built; none are planned.
---

## The problem

When a traffic signal is out, an autonomous vehicle can't read it. Other cars still behave as if the signal exists: they stop, they go, they queue by lane. That behavior carries information.

## What I built

A LightGBM classifier and the per-lane feature pipeline behind it, plus part of the web visualizer. I engineered features from more than 2 million rows across 16,000 Waymo scenarios, added ego-lane detection, and put controls in place against data leakage.

A teammate built a hardware demo.

## How it works

Waymo scenario data becomes per-lane features. The model reads those features and predicts the signal state with a confidence.

## Results

- At a model confidence of 0.8 or higher, 95% of predictions are correct.
- On those confident predictions, false-green errors are 2.5%, compared with 19% for a hand-written rule (if the cars nearby are stopped, predict stop; if they are moving, predict go).
- 0.25 ms per inference.

TODO(jake): was the 19% baseline measured over all cases or over the same 0.8-or-higher subset? The page must say which.

TODO(jake): what share of cases clear the 0.8 confidence threshold?

TODO(jake): what hardware was the 0.25 ms measured on?

## What isn't done

It's a hackathon prototype. It hasn't been tested outside the Waymo scenarios it trained on. A false green is the dangerous error, which is why I optimized against it, but this is not a safety system.

TODO(jake): confirm this, and add any real limits.
