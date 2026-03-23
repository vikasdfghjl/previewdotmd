import { useRef, useCallback } from 'react';

interface UseSyncScrollOptions {
  enabled: boolean;
  onScroll?: (percentage: number) => void;
}

interface UseSyncScrollReturn<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  handleScroll: () => void;
  scrollToPercentage: (percentage: number) => void;
}

export function useSyncScroll<T extends HTMLElement>(
  options: UseSyncScrollOptions
): UseSyncScrollReturn<T> {
  const { enabled, onScroll } = options;
  const ref = useRef<T | null>(null);
  const isScrollingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!enabled || !ref.current || isScrollingRef.current) return;

    const el = ref.current;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    const percentage = scrollHeight > 0 ? el.scrollTop / scrollHeight : 0;

    onScroll?.(percentage);
  }, [enabled, onScroll]);

  const scrollToPercentage = useCallback((percentage: number) => {
    if (!enabled || !ref.current) return;

    isScrollingRef.current = true;
    const el = ref.current;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    el.scrollTop = scrollHeight * percentage;

    // Reset flag after scroll completes
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, [enabled]);

  return {
    ref,
    handleScroll,
    scrollToPercentage,
  };
}
