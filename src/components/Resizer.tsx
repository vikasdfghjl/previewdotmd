'use client';

import React, { useRef, useCallback, useEffect } from 'react';

interface ResizerProps {
  onResize: (percentage: number) => void;
  minPercent?: number;
  maxPercent?: number;
  /**
   * Applied to the handle itself. Visibility classes must go here rather than
   * on a wrapper — the percentage math measures `parentElement`, which has to
   * be the row being split.
   */
  className?: string;
  /** Current split percentage — exposed as aria-valuenow and used for keyboard resizing. */
  value?: number;
}

export const Resizer: React.FC<ResizerProps> = ({
  onResize,
  minPercent = 10,
  maxPercent = 90,
  className = '',
  value,
}) => {
  const resizerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const updateFromClientX = useCallback((clientX: number) => {
    const container = resizerRef.current?.parentElement;
    if (!container) return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const rect = container.getBoundingClientRect();
      const percentage = ((clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(minPercent, Math.min(maxPercent, percentage));
      onResize(clamped);
    });
  }, [onResize, minPercent, maxPercent]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    updateFromClientX(e.clientX);
  }, [updateFromClientX]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleTouchStart = useCallback(() => {
    isDraggingRef.current = true;
    document.body.style.userSelect = 'none';
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault();
    updateFromClientX(touch.clientX);
  }, [updateFromClientX]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.userSelect = '';
  }, []);

  // Keyboard resizing for the focusable separator: arrows nudge by 2% (10% with
  // Shift), Home/End jump to the limits.
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (value === undefined) return;
    const step = e.shiftKey ? 10 : 2;
    let next: number | null = null;
    if (e.key === 'ArrowLeft') next = value - step;
    else if (e.key === 'ArrowRight') next = value + step;
    else if (e.key === 'Home') next = minPercent;
    else if (e.key === 'End') next = maxPercent;
    if (next === null) return;
    e.preventDefault();
    onResize(Math.max(minPercent, Math.min(maxPercent, next)));
  }, [value, onResize, minPercent, maxPercent]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={resizerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize editor and preview"
      aria-valuenow={value === undefined ? undefined : Math.round(value)}
      aria-valuemin={minPercent}
      aria-valuemax={maxPercent}
      tabIndex={0}
      className={`${className} w-1 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-blue-400 dark:hover:bg-blue-500 focus-visible:outline-none focus-visible:bg-blue-500 transition-colors group relative z-10 touch-none`}
      title="Drag to resize"
    >
      {/* Visual indicator — widened tap target on touch devices */}
      <div className="absolute inset-y-0 -left-3 -right-3 sm:-left-1 sm:-right-1 flex items-center justify-center">
        <div className="w-0.5 h-8 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors" />
      </div>
    </div>
  );
};
