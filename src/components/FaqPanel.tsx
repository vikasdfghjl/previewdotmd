'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { FAQ_ITEMS } from '@/constants/faq';
import { Icons } from '@/constants/icons';

interface FaqPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * FaqPanel — always rendered in the DOM (visibility toggled via CSS, not
 * conditional unmounting) so its Q&A text is present in the static HTML
 * for crawlers that don't execute JavaScript, matching the FAQPage JSON-LD
 * in layout.tsx. Each item is a native <details> for accessible, no-JS
 * expand/collapse.
 */
export const FaqPanel: React.FC<FaqPanelProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <div
      className={`fixed inset-0 z-[200] items-center justify-center bg-black/50 backdrop-blur-sm p-4 ${isOpen ? 'flex' : 'hidden'}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-panel-title"
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 id="faq-panel-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Frequently Asked Questions
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex-shrink-0"
            aria-label="Close FAQ"
          >
            <span className="w-4 h-4 block">{Icons.close}</span>
          </button>
        </div>

        <div>
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group border-b border-gray-100 dark:border-gray-700 py-2 last:border-0"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-medium text-sm text-gray-800 dark:text-gray-200">
                {item.question}
                <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" aria-hidden="true">
                  ▾
                </span>
              </summary>
              <p className="text-sm text-gray-600 dark:text-gray-400 pt-1.5">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};
