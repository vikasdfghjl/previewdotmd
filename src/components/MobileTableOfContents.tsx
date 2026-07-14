'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { HeadingEntry } from '@/hooks/useHeadings';
import { ActionButton } from './ActionButton';

interface MobileTableOfContentsProps {
  headings: HeadingEntry[];
}

const ListIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
  </svg>
);

/**
 * MobileTableOfContents — bottom-sheet heading navigator for viewports below
 * `lg`, where the sidebar TableOfContents is hidden (no room for it next to
 * the preview). Reuses the same heading data; scrolling behavior is
 * duplicated rather than shared because the sidebar's scroll-spy
 * (IntersectionObserver) has no equivalent need here — the sheet closes
 * immediately after a tap.
 */
export const MobileTableOfContents: React.FC<MobileTableOfContentsProps> = ({
  headings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const scrollToHeading = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsOpen(false);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsOpen(false);
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className="lg:hidden">
      <ActionButton onClick={() => setIsOpen(true)} title="Table of contents">
        <div className="flex items-center gap-1.5">
          {ListIcon}
          <span className="hidden sm:inline">Contents</span>
        </div>
      </ActionButton>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-end bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Table of contents"
        >
          <div className="w-full max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-t-xl shadow-2xl border-t border-gray-200 dark:border-gray-700 pb-[env(safe-area-inset-bottom)]">
            <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-sm font-semibold text-primary">On this page</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -m-2 rounded-md text-secondary hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close table of contents"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav aria-label="Headings" className="p-2">
              <ul>
                {headings.map((h) => (
                  <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 16}px` }}>
                    <button
                      onClick={() => scrollToHeading(h.id)}
                      className="w-full text-left px-3 py-3 min-h-11 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 truncate block"
                    >
                      {h.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
