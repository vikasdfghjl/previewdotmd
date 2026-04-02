'use client';

import React from 'react';
import { useLayout, ActiveTab } from '@/contexts/LayoutContext';
import { Icons } from '@/constants/icons';

interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { id: 'editor', label: 'Editor', icon: Icons.edit },
  { id: 'preview', label: 'Preview', icon: Icons.eye },
];

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useLayout();

  return (
    <div className="flex border-b bg-gray-50 dark:bg-gray-800/50">
      {tabs.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === id
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {icon}
            {label}
          </div>
        </button>
      ))}
    </div>
  );
};
