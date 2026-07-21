import { describe, it, expect } from 'vitest';
import { slugify } from '../slugify';

describe('slugify utility', () => {
  it('converts title text to a lowercase hyphenated slug', () => {
    expect(slugify('Welcome to Preview.md 🚀')).toBe('welcome-to-previewmd-');
    expect(slugify('Quick Example: README Template')).toBe('quick-example-readme-template');
  });

  it('truncates long heading titles to 50 characters', () => {
    const longHeading = 'This is a very long heading that should be truncated to fifty characters maximum';
    expect(slugify(longHeading).length).toBeLessThanOrEqual(50);
  });
});
