---
title: Baton
summary: A shared session where a whole team can watch, comment on, and steer one AI coding agent, with a log you can replay from any step.
oneLine: A shared, replayable session where a team watches and steers one AI coding agent.
status: placed
statusLabel: Hackathon project, 2nd overall at PalmettoHacks
rowStatusLabel: 2nd overall, PalmettoHacks
role: I contributed to the shared-session layer and designed the append-only event log that every session is built on.
when: PalmettoHacks, October 2026, with a team of four
stack:
  - Python
  - FastAPI
  - React
  - WebSockets
  - SQLite
links:
  - label: Baton on GitHub
    href: https://github.com/Jacob-M-Webster/Baton
  - label: Watch the Baton demo
    href: https://youtu.be/sKwHaWB106Q
order: 3
figure:
  id: baton
  alt: 'Diagram of Baton, all built and drawn solid: an append-only event log in the center; the AI coding agent appends messages and tool calls and has its context rebuilt from the log; browsers append human actions and subscribe over WebSockets; replay reads the log from any step. No planned parts.'
  caption: Every part shown is built; none are planned.
---

## The problem

Coding agents live in one person's terminal. When the agent goes down the wrong path, a teammate who knows the code can't see it, and when the person who started it logs off, the work stalls.

## What I built

I contributed to the shared-session layer and designed the append-only event log that every session is built on.

TODO(jake): add anything else you built for Baton, or confirm this is complete.

We built this quickly and used AI coding tools heavily. I focused on understanding and owning the event log.

TODO(jake): approve or edit the AI-assistance line above.

## How it works

Every agent message, tool call, and human action is appended to a log with a sequence number. Browsers subscribe over WebSockets, replay from any point, then go live. The agent's context is rebuilt from the log on each turn. That one choice gives crash recovery, forking a session from any step, and switching AI models mid-session.

## Results

2nd overall at PalmettoHacks.

## What isn't done

The default command runner is a guard, not a sandbox: it blocks obviously destructive commands but isn't isolation. A container mode exists but wasn't tested. Identity is name-only. Run it on a network you trust.
