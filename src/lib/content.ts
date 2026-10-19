// Shared content lookups for pages and components.
import { getCollection, getEntry } from 'astro:content';

export async function getSite() {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('content/site.json is missing');
  return entry.data;
}

/** Entries of a collection in display order (`order`: frontmatter or file position). */
export async function getOrdered<C extends 'projects' | 'experience' | 'skills' | 'honors'>(
  collection: C,
) {
  return (await getCollection(collection)).sort((a, b) => a.data.order - b.data.order);
}

export const getProjects = () => getOrdered('projects');

/** The five body sections every project page has, in order (02 section D). */
export const PROJECT_SECTIONS = [
  'The problem',
  'What I built',
  'How it works',
  'Results',
  "What isn't done",
] as const;
