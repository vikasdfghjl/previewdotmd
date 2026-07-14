'use client';

import React, { useMemo } from 'react';
import type { BracketMatch } from '@/hooks/useBracketMatching';

interface SyntaxHighlightOverlayProps {
  markdown: string;
  activeBracketMatch?: BracketMatch | null;
  zoomLevel?: number;
}

/**
 * Syntax highlighting rules — data-driven so new rules can be added without
 * modifying logic.
 *
 * IMPORTANT: the overlay is the *visible* text of the editor and must stay
 * character-for-character identical to the textarea content, or the caret
 * and soft-wrap positions drift. Rules therefore wrap the whole match (`$&`)
 * in a span and must never use classes that change glyph advance widths
 * (no horizontal padding, letter-spacing, or non-mono font swaps).
 */
const SYNTAX_RULES: Array<{ pattern: RegExp; className: string }> = [
  // Headers
  { pattern: /^#{1,6}\s.*$/, className: 'text-purple-600 dark:text-purple-400 font-bold' },
  // Bold
  { pattern: /(\*\*|__)(.*?)\1/g, className: 'text-blue-600 dark:text-blue-400 font-bold' },
  // Italic
  { pattern: /(?<!\*)\*([^*]+)\*(?!\*)/g, className: 'text-blue-500 dark:text-blue-300 italic' },
  // Code blocks
  { pattern: /(```|~~~)(\w*)/g, className: 'text-green-600 dark:text-green-400' },
  // Inline code
  { pattern: /`([^`]+)`/g, className: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded' },
  // Images (before links — an image is a link with a leading `!`)
  { pattern: /!\[([^\]]*)\]\(([^)]+)\)/g, className: 'text-cyan-600 dark:text-cyan-400' },
  // Links
  { pattern: /\[([^\]]+)\]\(([^)]+)\)/g, className: 'text-cyan-600 dark:text-cyan-400' },
  // Blockquotes
  { pattern: /^&gt;\s.*$/, className: 'text-gray-500 dark:text-gray-400' },
  // Unordered lists
  { pattern: /^\s*[-*+]\s/, className: 'text-orange-500' },
  // Ordered lists
  { pattern: /^\s*\d+\.\s/, className: 'text-orange-500' },
  // Horizontal rules
  { pattern: /^[-*_]{3,}$/, className: 'text-gray-400' },
];

/** Highlights one line of markdown; returns an HTML string. */
function highlightLine(line: string, lineIndex: number, activeBracketMatch?: BracketMatch | null): string {
  let html = escapeHtml(line);

  // Apply each syntax rule in order, wrapping the whole match so no
  // characters are added or removed relative to the textarea content.
  for (const { pattern, className } of SYNTAX_RULES) {
    html = html.replace(pattern, `<span class="${className}">$&</span>`);
  }

  // Bracket matching highlighting
  if (activeBracketMatch) {
    html = highlightBracketMatch(html, lineIndex, activeBracketMatch);
  }

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightBracketMatch(html: string, lineIndex: number, match: BracketMatch): string {
  const isOpenLine = lineIndex === match.open.line;
  const isCloseLine = lineIndex === match.close.line;

  if (!isOpenLine && !isCloseLine) return html;

  // For simplicity, we'll add a background highlight to the brackets
  // Since we've already escaped HTML, we need to work with the escaped content
  // No horizontal padding — it would shift glyphs relative to the textarea.
  const bracketClass = 'bg-yellow-300 dark:bg-yellow-600 rounded';

  if (isOpenLine && isCloseLine) {
    // Both on same line - this is rare but possible
    // This is a simplified approach - for exact positioning we'd need character mapping
    return html; // Skip complex same-line case for now
  }

  if (isOpenLine) {
    // Highlight the opening bracket
    const col = match.open.column;
    // Find the bracket character at this position in the escaped HTML
    // This is approximate since HTML entities may change positions
    return highlightCharAtPosition(html, col, bracketClass);
  }

  if (isCloseLine) {
    // Highlight the closing bracket
    const col = match.close.column;
    return highlightCharAtPosition(html, col, bracketClass);
  }

  return html;
}

function highlightCharAtPosition(html: string, position: number, className: string): string {
  // This is a simplified approach - we try to wrap the character at the given position
  // Note: This may not be perfectly accurate due to HTML entities
  if (position < 0 || position >= html.length) return html;

  const before = html.slice(0, position);
  const char = html[position];
  const after = html.slice(position + 1);

  // Only highlight if it's a bracket character
  if ('()[]{}'.includes(char)) {
    return `${before}<span class="${className}">${char}</span>${after}`;
  }

  return html;
}

/**
 * SyntaxHighlightOverlay — the visible text layer of the editor.
 *
 * Rendered in normal flow (it defines the editor's content height) beneath a
 * transparent textarea. Both share the `editor-text` metrics class and the
 * same padding utilities, so the caret and selection line up with this text.
 * Each logical line is its own div; the line number is drawn by the
 * `.editor-line::before` counter in globals.css, which keeps numbers aligned
 * even when long lines soft-wrap.
 */
export const SyntaxHighlightOverlay: React.FC<SyntaxHighlightOverlayProps> = React.memo(({
  markdown,
  activeBracketMatch,
  zoomLevel,
}) => {
  const lines = useMemo(
    () => markdown.split('\n').map((line, i) => highlightLine(line, i, activeBracketMatch)),
    [markdown, activeBracketMatch],
  );

  return (
    <div
      className="editor-lines editor-text relative whitespace-pre-wrap break-words py-4 pr-4 pl-16 pointer-events-none select-none"
      style={{ fontSize: `${zoomLevel ?? 100}%` }}
      aria-hidden="true"
    >
      {lines.map((html, i) => (
        <div key={i} className="editor-line" dangerouslySetInnerHTML={{ __html: html }} />
      ))}
    </div>
  );
});

SyntaxHighlightOverlay.displayName = 'SyntaxHighlightOverlay';
