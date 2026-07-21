import { describe, it, expect } from 'vitest';
import { getScrollPercentage } from '../scroll';

describe('scroll utilities', () => {
  it('calculates 0 percentage when element at top', () => {
    const mockElement = {
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 200,
    } as HTMLElement;

    expect(getScrollPercentage(mockElement)).toBe(0);
  });

  it('calculates 100 percentage when scrolled to bottom', () => {
    const mockElement = {
      scrollTop: 800,
      scrollHeight: 1000,
      clientHeight: 200,
    } as HTMLElement;

    expect(getScrollPercentage(mockElement)).toBe(1);
  });

  it('handles zero scrollable range gracefully', () => {
    const mockElement = {
      scrollTop: 0,
      scrollHeight: 200,
      clientHeight: 200,
    } as HTMLElement;

    expect(getScrollPercentage(mockElement)).toBe(0);
  });
});
