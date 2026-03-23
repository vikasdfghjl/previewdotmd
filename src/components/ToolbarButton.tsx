import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

// DRY: Reusable toolbar button to avoid repeated style definitions
export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  title,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        p-1.5 rounded-md transition-colors
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
