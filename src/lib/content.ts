// Shared content lookups for pages and components.
import { getCollection, getEntry } from 'astro:content';

export async function getSite() {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('content/site.json is missing');
  return entry.data;
}

/** Projects in display order (frontmatter `order`). */
export async function getProjects() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

/** The five body sections every project page has, in order (02 section D). */
export const PROJECT_SECTIONS = [
  'The problem',
  'What I built',
  'How it works',
  'Results',
  "What isn't done",
] as const;
