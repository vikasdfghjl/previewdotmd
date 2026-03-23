'use client';

import React, { useRef, useCallback, useEffect } from 'react';

interface ResizerProps {
  onResize: (percentage: number) => void;
  minPercent?: number;
  maxPercent?: number;
}

export const Resizer: React.FC<ResizerProps> = ({
  onResize,
  minPercent = 10,
  maxPercent = 90,
}) => {
  const resizerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    const container = resizerRef.current?.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(minPercent, Math.min(maxPercent, percentage));

    onResize(clamped);
  }, [onResize, minPercent, maxPercent]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={resizerRef}
      onMouseDown={handleMouseDown}
      className="w-1 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors group relative z-10"
      title="Drag to resize"
    >
      {/* Visual indicator */}
      <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
        <div className="w-0.5 h-8 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors" />
      </div>
    </div>
  );
};
