'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ToolbarButton } from './ToolbarButton';
import { applyTextareaFormat, wrapAsBold, wrapAsItalic, wrapAsLink, type FormatAction } from '@/lib/textareaFormat';
import { Icons } from '@/constants/icons';

interface FormattingToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  markdown: string;
  onChange: (value: string) => void;
}

interface ToolbarAction {
  label: string;
  title: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: FormatAction;
}

function prefixLines(text: string, prefix: string): string {
  if (!text) return prefix;
  return text
    .split('\n')
    .map((line) => prefix + line)
    .join('\n');
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: 'Bold', title: 'Bold (Ctrl+B)', shortcut: 'Ctrl+B', icon: Icons.bold, action: wrapAsBold },
  { label: 'Italic', title: 'Italic (Ctrl+I)', shortcut: 'Ctrl+I', icon: Icons.italic, action: wrapAsItalic },
  {
    label: 'Strikethrough', title: 'Strikethrough', icon: Icons.strikethrough,
    action: ({ text }) => ({ replacement: `~~${text || 'strikethrough'}~~` }),
  },
  {
    label: 'Code', title: 'Inline Code', icon: Icons.formatCode,
    action: ({ text }) => ({ replacement: `\`${text || 'code'}\`` }),
  },
  { label: 'Link', title: 'Insert Link (Ctrl+K)', shortcut: 'Ctrl+K', icon: Icons.link, action: wrapAsLink },
  {
    label: 'Image', title: 'Insert Image', icon: Icons.image,
    action: ({ text }) => ({ replacement: `![${text || 'alt text'}](url)` }),
  },
  {
    label: 'List', title: 'Unordered List', icon: Icons.list,
    action: ({ text }) => ({ replacement: prefixLines(text, '- ') }),
  },
  {
    label: 'Numbered List', title: 'Ordered List', icon: Icons.orderedList,
    action: ({ text }) => ({
      replacement: text
        ? text
            .split('\n')
            .map((line, i) => `${i + 1}. ${line}`)
            .join('\n')
        : '1. ',
    }),
  },
  {
    label: 'Quote', title: 'Blockquote', icon: Icons.quote,
    action: ({ text }) => ({ replacement: prefixLines(text, '> ') }),
  },
  {
    label: 'Table', title: 'Insert Table', icon: Icons.table,
    action: () => ({ replacement: '| Header | Header | Header |\n|--------|--------|--------|\n| Cell   | Cell   | Cell   |\n| Cell   | Cell   | Cell   |\n' }),
  },
  {
    label: 'Code Block', title: 'Code Block', icon: Icons.formatCode,
    action: ({ text }) => ({ replacement: `\`\`\`\n${text || 'code'}\n\`\`\`` }),
  },
  {
    label: 'Divider', title: 'Horizontal Rule', icon: Icons.divider,
    action: () => ({ replacement: '\n---\n' }),
  },
];

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  textareaRef,
  markdown,
  onChange,
}) => {
  const handleAction = useCallback(
    (action: ToolbarAction['action']) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      applyTextareaFormat(textarea, markdown, onChange, action);
    },
    [textareaRef, markdown, onChange],
  );

  // Undo/redo ride the textarea's native history (same one Ctrl+Z uses) so
  // there's a visible control for it — mobile keyboards often have no
  // reachable undo key. execCommand is deprecated for most uses but remains
  // the only cross-browser way to trigger a focused textarea's own undo stack.
  const handleUndo = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    document.execCommand('undo');
  }, [textareaRef]);

  const handleRedo = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    document.execCommand('redo');
  }, [textareaRef]);

  // Track whether the toolbar has hidden content to either side so we can
  // show a fade hint — on narrow screens not all buttons fit and there's
  // otherwise no visual cue that the row scrolls horizontally.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollShadows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollShadows();
    el.addEventListener('scroll', updateScrollShadows, { passive: true });
    const observer = new ResizeObserver(updateScrollShadows);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollShadows);
      observer.disconnect();
    };
  }, [updateScrollShadows]);

  return (
    <div className="relative flex-shrink-0">
      <div
        ref={scrollRef}
        className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 overflow-x-auto"
        role="toolbar"
        aria-label="Markdown formatting"
      >
        <ToolbarButton size="sm" onClick={handleUndo} title="Undo (Ctrl+Z)">
          {Icons.undo}
        </ToolbarButton>
        <ToolbarButton size="sm" onClick={handleRedo} title="Redo (Ctrl+Y)">
          {Icons.redo}
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1 flex-shrink-0" aria-hidden="true" />
        {TOOLBAR_ACTIONS.map((item) => (
          <ToolbarButton
            key={item.label}
            size="sm"
            onClick={() => handleAction(item.action)}
            title={item.shortcut ? `${item.title} (${item.shortcut})` : item.title}
          >
            {item.icon}
          </ToolbarButton>
        ))}
      </div>
      {canScrollLeft && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-transparent"
          aria-hidden="true"
        />
      )}
      {canScrollRight && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-50 dark:from-gray-800 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
