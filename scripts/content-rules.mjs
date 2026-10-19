// @ts-check
// Rules for check:content, maintained from docs/02-content.md:
// section B (forbidden claims) and section F (banned words).
// `scope` limits a rule to files whose path matches it.

/** @typedef {{ id: string, re: RegExp, source: string, scope?: RegExp }} Rule */

/** @type {Rule[]} */
export const FORBIDDEN = [
  // Spot (F6)
  { id: 'spot-follows', re: /\bspot follows (people|a person|someone)\b/i, source: 'B Spot' },
  { id: 'autonomously-follows', re: /\bautonomously follows?\b/i, source: 'B Spot' },
  { id: 'deployed-on-spot', re: /\bdeployed on (spot|the robot)\b/i, source: 'B Spot' },
  { id: 'end-to-end', re: /\bworking end[- ]to[- ]end\b/i, source: 'B Spot' },
  { id: 'real-time', re: /\breal[- ]?time\b/i, source: 'B Spot, Caelus' },
  // Caelus (F7)
  { id: 'autonomous-navigation', re: /\bautonomous navigation\b/i, source: 'B Caelus' },
  { id: 'slam', re: /\bSLAM\b/, source: 'B Caelus' },
  { id: '3d-lidar', re: /\b3D LiDAR\b/i, source: 'B Caelus' },
  { id: 'flight-tested', re: /\bflight[- ]tested\b/i, source: 'B Caelus' },
  // WayFinder (F8)
  { id: 'real-intersections', re: /\bworks on real intersections\b/i, source: 'B WayFinder' },
  { id: 'hardware-demo', re: /\bI built the hardware demo\b/i, source: 'B WayFinder' },
  { id: 'waymo-endorses', re: /\bWaymo (uses|used|endorses|endorsed)\b/i, source: 'B WayFinder' },
  {
    id: 'wayfinder-deployed',
    re: /\b(deployed|in production)\b/i,
    source: 'B WayFinder',
    scope: /wayfinder/i,
  },
  // Baton (F9)
  { id: 'i-built-baton', re: /\bI built Baton\b/i, source: 'B Baton' },
  { id: 'production-ready', re: /\bproduction[- ]ready\b/i, source: 'B Baton' },
  { id: 'enterprise', re: /\benterprise\b/i, source: 'B Baton' },
  { id: 'baton-secure', re: /\bsecure\b/i, source: 'B Baton', scope: /baton/i },
  {
    id: 'baton-business',
    re: /\b(market size|pricing|revenue|customers)\b/i,
    source: 'B Baton',
    scope: /baton/i,
  },
  // Michelin (F3, F4)
  {
    id: 'michelin-owned',
    re: /\b(owned|led|architected) the (inventory|application)\b/i,
    source: 'B Michelin',
  },
  // General
  { id: 'seniority-words', re: /\b(expert|senior|seasoned|world-class)\b/i, source: 'B General' },
];

/** Section F: words and phrases never used. */
export const BANNED_WORDS = [
  'passionate',
  'driven',
  'leverage',
  'leveraging',
  'cutting-edge',
  'state-of-the-art',
  'seamless',
  'robust',
  'innovative',
  'solutions',
  'synergy',
  'journey',
  'deep dive',
  'game-changing',
  'next-generation',
  'rockstar',
  'ninja',
  'guru',
  "I'm excited to",
  'I love to',
  'hard-working',
  'team player',
  'fast learner',
];

/**
 * Approved phrases that contain a flagged word. A match inside one of these
 * is not a finding. Each comes from docs/02-content.md.
 */
export const ALLOWED_PHRASES = [
  /Center for Industry Solutions/g, // F5: employer name
  /computer science senior/g, // section C lead paragraph: year in school
];

/** Required frontmatter keys for content/projects/*.md (02 section G). */
export const PROJECT_KEYS = [
  'title',
  'summary',
  'status',
  'statusLabel',
  'role',
  'when',
  'stack',
  'links',
  'order',
];
