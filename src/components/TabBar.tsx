'use client';

import React, { useCallback } from 'react';
import { useLayoutState, useLayoutActions, ActiveTab } from '@/contexts/LayoutContext';
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

/** DOM ids shared with the tabpanels rendered in MarkdownPreview. */
export const tabPanelId = (tab: ActiveTab) => `${tab}-tabpanel`;
const tabButtonId = (tab: ActiveTab) => `${tab}-tab`;

export const TabBar: React.FC = () => {
  const { activeTab } = useLayoutState();
  const { setActiveTab } = useLayoutActions();

  // Standard ARIA tabs keyboard pattern: arrow keys move focus and
  // activate the adjacent tab; Home/End jump to the first/last tab.
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex === null) return;
    e.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    document.getElementById(tabButtonId(tabs[nextIndex].id))?.focus();
  }, [setActiveTab]);

  return (
    <div role="tablist" aria-label="Editor and preview panels" className="flex border-b bg-gray-50 dark:bg-gray-800/50">
      {tabs.map(({ id, label, icon }, index) => {
        const selected = activeTab === id;
        return (
          <button
            key={id}
            id={tabButtonId(id)}
            role="tab"
            aria-selected={selected}
            aria-controls={tabPanelId(id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => setActiveTab(id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 pointer-coarse:min-h-11 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
              selected
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {icon}
              {label}
            </div>
          </button>
        );
      })}
    </div>
  );
};
