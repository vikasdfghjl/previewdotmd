import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
  /** sm = compact (toolbars), md = standard (layout controls). Default: md. */
  size?: 'sm' | 'md';
  /**
   * True on/off buttons (sync scroll, reading mode, fullscreen) expose
   * `isActive` as aria-pressed. Mutually-exclusive selections (layout mode)
   * are not toggles — leave this false so screen readers aren't told a
   * single button is "pressed" out of a group.
   */
  isToggle?: boolean;
  /** Mutually-exclusive selections (layout mode) expose `isActive` as aria-checked instead, when rendered inside a role="radiogroup". */
  isRadio?: boolean;
}

// sm grows to the 44px touch-target minimum on coarse pointers (phones/tablets).
const sizeClasses = {
  sm: 'p-1.5 min-w-[32px] min-h-[32px] pointer-coarse:min-w-11 pointer-coarse:min-h-11 rounded',
  md: 'p-2 min-w-[44px] min-h-[44px] rounded-md',
} as const;

/**
 * ToolbarButton — consistent icon button used across the app.
 * Replaces ad-hoc <button> elements to keep the design language uniform.
 */
export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  title,
  children,
  size = 'md',
  isToggle = false,
  isRadio = false,
}) => {
  const base = sizeClasses[size];

  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      role={isRadio ? 'radio' : undefined}
      aria-checked={isRadio ? isActive : undefined}
      aria-pressed={isToggle ? isActive : undefined}
      className={`
        ${base} transition-colors flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        ${isActive
          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
        }
      `}
    >
      {children}
    </button>
  );
};
