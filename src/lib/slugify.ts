/**
 * slugify — converts heading text into a URL-friendly anchor ID.
 * Kept in a single shared helper so Table of Contents links (useHeadings)
 * and rendered heading anchors (AnchorHeading) produce identical IDs.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}
