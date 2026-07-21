import { useMemo } from 'react';
import { slugify } from '@/lib/slugify';

export interface HeadingEntry {
  id: string;
  text: string;
  level: number; // 1–6
}

/**
 * useHeadings — parses a markdown string and extracts heading entries
 * (h1–h3 for the table of contents). Skips headings inside code blocks.
 *
 * Returns an array of { id, text, level } objects.
 */
export function useHeadings(markdown: string): HeadingEntry[] {
  return useMemo(() => {
    const headings: HeadingEntry[] = [];
    let inCodeBlock = false;

    for (const line of markdown.split('\n')) {
      // Track code fences
      if (/^```/.test(line.trim())) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      const match = line.match(/^(#{1,3})\s+(.+?)(?:\s*\{#[\w-]+\})?\s*$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = slugify(text);
        headings.push({ id, text, level });
      }
    }

    return headings;
  }, [markdown]);
}
