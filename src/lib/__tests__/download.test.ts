import { describe, it, expect } from 'vitest';
import { EXPORT_CSS } from '../download';

describe('download utilities', () => {
  it('contains base export CSS styles', () => {
    expect(EXPORT_CSS).toContain('font-family');
    expect(EXPORT_CSS).toContain('table');
    expect(EXPORT_CSS).toContain('pre');
  });
});
