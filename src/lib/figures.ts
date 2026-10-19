// Planned (dashed) parts of each project figure. The figure's alt text and
// <desc> must name every one in words; ProjectFigure fails the build if the
// alt text misses one.
export const PLANNED = {
  spot: [
    "match the model's box to a tracked person",
    'navigation goal for Spot',
    'follow the person',
  ],
  wayfinder: [],
  baton: [],
} as const satisfies Record<'spot' | 'wayfinder' | 'baton', readonly string[]>;

/** Planned labels missing from the alt text (case-insensitive). */
export function missingPlanned(id: keyof typeof PLANNED, alt: string): string[] {
  const text = alt.toLowerCase();
  return PLANNED[id].filter((label) => !text.includes(label.toLowerCase()));
}
