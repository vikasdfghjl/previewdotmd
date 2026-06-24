import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
  /** sm = compact (toolbars), md = standard (layout controls). Default: md. */
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'p-1.5 min-w-[32px] min-h-[32px] rounded',
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
}) => {
  const base = sizeClasses[size];

  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
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
