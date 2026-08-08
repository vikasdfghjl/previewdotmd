import React from 'react';

interface HintCalloutProps {
  children: React.ReactNode;
  onDismiss: () => void;
  /** Which side the callout's arrow (and the callout itself) hugs, relative to the anchor button. */
  align?: 'left' | 'right';
}

/**
 * HintCallout — shared visual shell for one-time onboarding coachmarks.
 * Positions itself below its `relative` parent, pointing an arrow back up
 * at whatever button/control it's anchored to.
 */
export const HintCallout: React.FC<HintCalloutProps> = ({ children, onDismiss, align = 'right' }) => {
  const sideClass = align === 'right' ? 'right-0' : 'left-0';
  const arrowSideClass = align === 'right' ? 'right-4' : 'left-4';

  return (
    <div
      role="tooltip"
      className={`absolute top-full ${sideClass} mt-3 z-50 w-60 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl p-3 text-xs text-gray-700 dark:text-gray-300`}
    >
      {/* Arrow pointing up at the anchor */}
      <div
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
