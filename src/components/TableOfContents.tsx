'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { HeadingEntry } from '@/hooks/useHeadings';

interface TableOfContentsProps {
  headings: HeadingEntry[];
  /** A ref to the scrollable preview container, used to track active section. */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * TableOfContents — slide-out sidebar showing markdown headings.
 *
 * - Open: full-width panel with heading links + collapse toggle
 * - Closed: slim pull-tab on the right edge; click to reopen
 * - Hidden entirely when there are no headings
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  scrollContainerRef,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);     // inner collapse (hide list)
  const [isOpen, setIsOpen] = useState(true);             // entire panel open/closed

  // Track which heading is currently in view
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || headings.length === 0) return;

    const handleScroll = () => {
      const containerTop = container.scrollTop;
      let currentId: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el) {
          const elTop = el.offsetTop - container.offsetTop;
          if (elTop <= containerTop + 80) {
            currentId = h.id;
          }
        }
      }
      setActiveId(currentId);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [headings, scrollContainerRef]);

  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Pull-tab — visible when panel is fully closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden lg:flex flex-shrink-0 w-6 items-center justify-center bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-500 transition-colors group"
          title="Show table of contents"
          aria-label="Show table of contents"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Main panel — visible when open */}
      {isOpen && (
        <div className="hidden lg:block w-48 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20 overflow-y-auto relative">
          <div className="sticky top-0 px-3 py-3">
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                On this page
              </h3>
              <div className="flex items-center gap-0.5">
                {/* Inner collapse toggle */}
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
                  title={collapsed ? 'Expand headings' : 'Collapse headings'}
                  aria-label={collapsed ? 'Expand headings list' : 'Collapse headings list'}
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${collapsed ? '' : 'rotate-90'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* Close panel button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
                  title="Hide table of contents"
                  aria-label="Hide table of contents panel"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Heading list (collapsible) */}
            {!collapsed && (
              <nav aria-label="Table of contents">
                <ul className="space-y-0.5">
                  {headings.map((h) => (
                    <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                      <button
                        onClick={() => scrollToHeading(h.id)}
                        className={`
                          w-full text-left text-sm py-0.5 px-1.5 rounded transition-colors truncate block
                          ${activeId === h.id
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }
                        `}
                        title={h.text}
                      >
                        {h.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      )}
    </>
  );
};
