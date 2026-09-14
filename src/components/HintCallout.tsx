'use client';

import React, { useLayoutEffect, useRef } from 'react';

interface HintCalloutProps {
  children: React.ReactNode;
  onDismiss: () => void;
  /** Which side the callout's arrow (and the callout itself) hugs, relative to the anchor button. */
  align?: 'left' | 'right';
}

/** Minimum gap kept between the callout and the viewport edges. */
const VIEWPORT_MARGIN = 8;

/**
 * HintCallout — shared visual shell for one-time onboarding coachmarks.
 * Positions itself below its `relative` parent, pointing an arrow back up
 * at whatever button/control it's anchored to.
 */
export const HintCallout: React.FC<HintCalloutProps> = ({ children, onDismiss, align = 'right' }) => {
  const sideClass = align === 'right' ? 'right-0' : 'left-0';
  const arrowSideClass = align === 'right' ? 'right-4' : 'left-4';
  const calloutRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  // The callout hangs off its anchor, so near a screen edge (e.g. the header
  // on a 360px phone) it can run off-screen. Slide it back inside the viewport
  // and counter-shift the arrow so it still points at the anchor. Styles are
  // written directly: this is a layout correction, not render state.
  useLayoutEffect(() => {
    const callout = calloutRef.current;
    const arrow = arrowRef.current;
    if (!callout || !arrow) return;

    const reposition = () => {
      callout.style.translate = '';
      arrow.style.translate = '';
      const rect = callout.getBoundingClientRect();
      let shift = 0;
      if (rect.left < VIEWPORT_MARGIN) {
        shift = VIEWPORT_MARGIN - rect.left;
      } else if (rect.right > window.innerWidth - VIEWPORT_MARGIN) {
        shift = window.innerWidth - VIEWPORT_MARGIN - rect.right;
      }
      if (shift !== 0) {
        callout.style.translate = `${shift}px 0`;
        arrow.style.translate = `${-shift}px 0`;
      }
    };

    reposition();
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, []);

  return (
    <div
      ref={calloutRef}
      role="tooltip"
      className={`absolute top-full ${sideClass} mt-3 z-50 w-60 max-w-[calc(100vw-1rem)] rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl p-3 text-xs text-gray-700 dark:text-gray-300`}
    >
      {/* Arrow pointing up at the anchor */}
      <div
        ref={arrowRef}
        className={`absolute -top-1.5 ${arrowSideClass} w-3 h-3 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-700 rotate-45`}
        aria-hidden="true"
      />
      <div className="relative leading-relaxed">{children}</div>
      <button
        onClick={onDismiss}
        className="relative mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
      >
        Got it
      </button>
    </div>
  );
};
