'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { HeadingEntry } from '@/hooks/useHeadings';

interface TableOfContentsProps {
  headings: HeadingEntry[];
  /** A ref to the scrollable preview container, used to track active section. */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * TableOfContents — sticky sidebar that shows markdown headings.
 * Highlights the current section based on scroll position and
 * scrolls to the heading on click.
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  scrollContainerRef,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Track which heading is currently in view
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || headings.length === 0) return;

    const handleScroll = () => {
      const containerTop = container.scrollTop;
      // Find the last heading whose element top is above the container top
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

    // Initial detection
    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [headings, scrollContainerRef]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [],
  );

  if (headings.length === 0) return null;

  return (
    <div className="hidden lg:block w-48 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20 overflow-y-auto">
      <div className="sticky top-0 px-3 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            On this page
          </h3>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
            title={collapsed ? 'Expand TOC' : 'Collapse TOC'}
            aria-label={collapsed ? 'Expand table of contents' : 'Collapse table of contents'}
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
        </div>

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
  );
};
