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
      className={`${getVariantClasses()} px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition-all duration-200`}
      title={title}
    >
      {children}
    </button>
  );
};