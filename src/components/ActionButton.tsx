import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  title,
  children,
  variant = 'default',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'danger':
        return 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20';
      default:
        return 'btn';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`${getVariantClasses()} px-3 py-1.5 pointer-coarse:min-h-11 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200`}
      title={title}
    >
      {children}
    </button>
  );
};