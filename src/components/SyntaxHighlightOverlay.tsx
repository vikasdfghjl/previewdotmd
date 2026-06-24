'use client';

import React from 'react';
import type { BracketMatch } from '@/hooks/useBracketMatching';

interface SyntaxHighlightOverlayProps {
  markdown: string;
  activeBracketMatch?: BracketMatch | null;
  zoomLevel?: number;
}

/** Syntax highlighting rules — data-driven so new rules can be added without modifying logic. */
const SYNTAX_RULES: Array<{ pattern: RegExp; className: string; replacement?: string }> = [
  // Headers
  { pattern: /^(#{1,6}\s.*?)$/, className: 'text-purple-600 dark:text-purple-400 font-bold' },
  // Bold
  { pattern: /(\*\*|__)(.*?)\1/g, className: 'text-blue-600 dark:text-blue-400 font-bold' },
  // Italic
  { pattern: /(?<!\*)\*([^*]+)\*(?!\*)/g, className: 'text-blue-500 dark:text-blue-300 italic' },
  // Code blocks
  { pattern: /(```|~~~)(\w*)/g, className: 'text-green-600 dark:text-green-400' },
  // Inline code
  { pattern: /`([^`]+)`/g, className: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-0.5 rounded' },
  // Links
  { pattern: /\[([^\]]+)\]\(([^)]+)\)/g, className: 'text-cyan-600 dark:text-cyan-400' },
  // Images
  { pattern: /!\[([^\]]+)\]\(([^)]+)\)/g, className: 'text-cyan-600 dark:text-cyan-400' },
  // Blockquotes
  { pattern: /^(&gt;\s.*?)$/, className: 'text-gray-500 dark:text-gray-400' },
  // Unordered lists
  { pattern: /^(\s*[-*+]\s)/, className: 'text-orange-500' },
  // Ordered lists
  { pattern: /^(\s*\d+\.\s)/, className: 'text-orange-500' },
  // Horizontal rules
  { pattern: /^([-*_]{3,})$/, className: 'text-gray-400' },
];

function highlightMarkdown(text: string, activeBracketMatch?: BracketMatch | null): string {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    let html = escapeHtml(line);

    // Apply each syntax rule in order
    for (const { pattern, className } of SYNTAX_RULES) {
      html = html.replace(pattern, `<span class="${className}">$1</span>`);
    }

    // Bracket matching highlighting
    if (activeBracketMatch) {
      html = highlightBracketMatch(html, lineIndex, activeBracketMatch);
    }

    return html;
  }).join('\n');
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
  const bracketClass = 'bg-yellow-300 dark:bg-yellow-600 rounded px-0.5';

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

export const SyntaxHighlightOverlay: React.FC<SyntaxHighlightOverlayProps> = React.memo(({
  markdown,
  activeBracketMatch,
  zoomLevel,
}) => {
  const highlightedHtml = highlightMarkdown(markdown, activeBracketMatch);

  return (
    <pre
      className="absolute inset-0 w-full h-full font-mono text-sm p-4 pt-4 pb-4 leading-5 whitespace-pre-wrap break-words pointer-events-none overflow-hidden"
      style={{ fontSize: `${zoomLevel ?? 100}%` }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
    />
  );
});

SyntaxHighlightOverlay.displayName = 'SyntaxHighlightOverlay';
