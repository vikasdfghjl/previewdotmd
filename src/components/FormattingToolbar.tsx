'use client';

import React, { useCallback } from 'react';

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
  action: (sel: { text: string; start: number; end: number }) => {
    replacement: string;
    cursorOffset?: number;
    newCursorStart?: number;
    newCursorEnd?: number;
  };
}

/** Inserts/replaces text at the selection and positions the cursor. */
function applyAction(
  textarea: HTMLTextAreaElement,
  markdown: string,
  onChange: (value: string) => void,
  action: ToolbarAction['action'],
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = markdown.slice(start, end);

  const { replacement, newCursorStart, newCursorEnd } = action({
    text: selectedText,
    start,
    end,
  });

  const newValue = markdown.slice(0, start) + replacement + markdown.slice(end);
  onChange(newValue);

  // Restore focus and cursor position after React re-render
  requestAnimationFrame(() => {
    textarea.focus();
    const selStart = newCursorStart ?? start + replacement.length;
    const selEnd = newCursorEnd ?? start + replacement.length;
    textarea.setSelectionRange(selStart, selEnd);
  });
}

/** SVG path for the bold icon */
const BoldIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </svg>
);

const ItalicIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 4h4M12 4v16M14 20h-4" />
  </svg>
);

const StrikethroughIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M17.5 12c0 3-2 4-5.5 4S6.5 15 6.5 12M17.5 12c0-3-2-4-5.5-4S6.5 9 6.5 12" />
  </svg>
);

const CodeIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4l-4 8 4 8M16 4l4 8-4 8" />
  </svg>
);

const LinkIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const ImageIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ListIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const OrderedListIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h14M7 8h14M7 12h14M7 16h14M3 4h.01M3 8h.01M3 12h.01M3 16h.01" />
  </svg>
);

const QuoteIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9H6l4 8h2M18 9h-4l4 8h2" />
  </svg>
);

const TableIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
    <line x1="3" y1="9" x2="21" y2="9" strokeWidth={2} />
    <line x1="3" y1="15" x2="21" y2="15" strokeWidth={2} />
    <line x1="9" y1="3" x2="9" y2="21" strokeWidth={2} />
  </svg>
);

const DividerIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
  </svg>
);

function prefixLines(text: string, prefix: string): string {
  if (!text) return prefix;
  return text
    .split('\n')
    .map((line) => prefix + line)
    .join('\n');
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    label: 'Bold', title: 'Bold (Ctrl+B)', shortcut: 'Ctrl+B', icon: BoldIcon,
    action: ({ text }) => ({
      replacement: `**${text || 'bold text'}**`,
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Italic', title: 'Italic (Ctrl+I)', shortcut: 'Ctrl+I', icon: ItalicIcon,
    action: ({ text }) => ({
      replacement: `*${text || 'italic text'}*`,
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Strikethrough', title: 'Strikethrough', icon: StrikethroughIcon,
    action: ({ text }) => ({
      replacement: `~~${text || 'strikethrough'}~~`,
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Code', title: 'Inline Code', icon: CodeIcon,
    action: ({ text }) => ({
      replacement: `\`${text || 'code'}\``,
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Link', title: 'Insert Link (Ctrl+K)', shortcut: 'Ctrl+K', icon: LinkIcon,
    action: ({ text }) => ({
      replacement: `[${text || 'link text'}](url)`,
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Image', title: 'Insert Image', icon: ImageIcon,
    action: ({ text }) => ({
      replacement: `![${text || 'alt text'}](url)`,
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'List', title: 'Unordered List', icon: ListIcon,
    action: ({ text }) => ({
      replacement: prefixLines(text, '- '),
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Numbered List', title: 'Ordered List', icon: OrderedListIcon,
    action: ({ text }) => ({
      replacement: text
        ? text
            .split('\n')
            .map((line, i) => `${i + 1}. ${line}`)
            .join('\n')
        : '1. ',
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Quote', title: 'Blockquote', icon: QuoteIcon,
    action: ({ text }) => ({
      replacement: prefixLines(text, '> '),
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Table', title: 'Insert Table', icon: TableIcon,
    action: () => ({
      replacement: '| Header | Header | Header |\n|--------|--------|--------|\n| Cell   | Cell   | Cell   |\n| Cell   | Cell   | Cell   |\n',
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Code Block', title: 'Code Block', icon: CodeIcon,
    action: ({ text }) => ({
      replacement: `\`\`\`\n${text || 'code'}\n\`\`\``,
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
  },
  {
    label: 'Divider', title: 'Horizontal Rule', icon: DividerIcon,
    action: () => ({
      replacement: '\n---\n',
      newCursorStart: undefined, newCursorEnd: undefined,
    }),
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
      applyAction(textarea, markdown, onChange, action);
    },
    [textareaRef, markdown, onChange],
  );

  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 overflow-x-auto flex-shrink-0"
      role="toolbar"
      aria-label="Markdown formatting"
    >
      {TOOLBAR_ACTIONS.map((item) => (
        <button
          key={item.label}
          onClick={() => handleAction(item.action)}
          className="p-1.5 min-w-[32px] min-h-[32px] rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center"
          title={item.shortcut ? `${item.title} (${item.shortcut})` : item.title}
          aria-label={item.title}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};
