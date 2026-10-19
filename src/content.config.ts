// Content collections. Copy lives in content/ (docs/02-content.md, section G);
// these schemas fail the build on a missing or malformed field.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Loads a JSON array and records each entry's position as `order`, because
 * getCollection returns entries sorted by id, not in file order.
 */
const list = (path: string) =>
  file(path, {
    parser: (text) =>
      (JSON.parse(text) as Record<string, unknown>[]).map((entry, order) => ({ ...entry, order })),
  });

const order = z.number().int();

/** Loads a flat JSON object as a single entry with the given id. */
const single = (path: string, id: string) =>
  file(path, { parser: (text) => [{ id, ...JSON.parse(text) }] });

// An open question for Jake, shown on the page until answered.
const todo = z
  .string()
  .regex(/^TODO\(jake\): /)
  .optional();

const site = defineCollection({
  loader: single('content/site.json', 'site'),
  schema: z.object({
    name: z.string(),
    email: z.email(),
    linkedin: z.url(),
    github: z.url(),
    resume: z.string().startsWith('/'),
    title: z.string(),
    hero: z.object({
      heading: z.string(),
      lead: z.string(),
      resumeAction: z.string(),
      emailAction: z.string(),
    }),
    now: z
      .array(
        z.object({
          id: z.string(),
          lead: z.string(),
          text: z.string(),
          link: z.object({ label: z.string(), href: z.string() }).optional(),
        }),
      )
      .length(2),
    footer: z.string(),
  }),
});

const experience = defineCollection({
  loader: list('content/experience.json'),
  schema: z.object({
    role: z.string(),
    employer: z.string(),
    location: z.string(),
    dates: z.string(),
    bullets: z.array(z.string()).min(1),
    todo,
    order,
  }),
});

const education = defineCollection({
  loader: single('content/education.json', 'education'),
  schema: z.object({
    school: z.string(),
    degree: z.string(),
    dates: z.string(),
    gpa: z.string().optional(),
    todo,
  }),
});

const skills = defineCollection({
  loader: list('content/skills.json'),
  schema: z.object({ label: z.string(), items: z.array(z.string()).min(1), order }),
});

const honors = defineCollection({
  loader: list('content/honors.json'),
  schema: z.object({ text: z.string(), todo, order }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/projects' }),
  schema: z.object({
    title: z.string(),
    // jake-answers.md B's approved Spot summary is two sentences, 168 characters.
    summary: z.string().max(170),
    // Home row text and the meta description (06 section 4: 150 or fewer).
    oneLine: z.string().max(150),
    status: z.enum(['in-progress', 'paused', 'prototype', 'placed']),
    statusLabel: z.string(),
    rowStatusLabel: z.string(),
    role: z.string(),
    when: z.string(),
    stack: z.array(z.string()).min(1).max(6),
    links: z.array(z.object({ label: z.string(), href: z.url() })),
    linksNote: z.string().optional(),
    order: z.number().int(),
    figure: z.object({
      id: z.enum(['spot', 'wayfinder', 'baton']),
      // Must name every planned (dashed) part in words.
      alt: z.string(),
      caption: z.string(),
    }),
  }),
});

export const collections = { site, experience, education, skills, honors, projects };
