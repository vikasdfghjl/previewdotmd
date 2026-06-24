/**
 * scrollToPercentage — shared utility to scroll a scrollable element to a given
 * percentage position while setting a flag ref so external scroll listeners can
 * distinguish programmatic from user-initiated scrolls.
 */
export function scrollToPercentage(
  el: HTMLElement,
  percentage: number,
  isScrollingRef: { current: boolean },
): void {
  isScrollingRef.current = true;
  const scrollHeight = el.scrollHeight - el.clientHeight;
  el.scrollTop = scrollHeight * percentage;
  requestAnimationFrame(() => {
    isScrollingRef.current = false;
  });
}

/**
 * Calculates the current scroll position of an element as a percentage (0–1).
 * Returns 0 when the element is not scrollable.
 */
export function getScrollPercentage(el: HTMLElement): number {
  const scrollHeight = el.scrollHeight - el.clientHeight;
  return scrollHeight > 0 ? el.scrollTop / scrollHeight : 0;
}
