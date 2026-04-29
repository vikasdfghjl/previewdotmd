'use client';

import React from 'react';
import type { BracketMatch } from '@/hooks/useBracketMatching';

interface SyntaxHighlightOverlayProps {
  markdown: string;
  activeBracketMatch?: BracketMatch | null;
  zoomLevel?: number;
}

const highlightMarkdown = (text: string, activeBracketMatch?: BracketMatch | null): string => {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // Escape HTML entities first
    let html = escapeHtml(line);

    // Apply syntax highlighting
    // Headers
    html = html.replace(/^(#{1,6}\s.*?)$/, '<span class="text-purple-600 dark:text-purple-400 font-bold">$1</span>');

    // Bold
    html = html.replace(/(\*\*|__)(.*?)\1/g, '<span class="text-blue-600 dark:text-blue-400 font-bold">$1$2$1</span>');

    // Italic
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<span class="text-blue-500 dark:text-blue-300 italic">*$1*</span>');

    // Code blocks
    html = html.replace(/(```|~~~)(\w*)/g, '<span class="text-green-600 dark:text-green-400">$1$2</span>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<span class="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-0.5 rounded">`$1`</span>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="text-cyan-600 dark:text-cyan-400">[$1]($2)</span>');

    // Images
    html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<span class="text-cyan-600 dark:text-cyan-400">![$1]($2)</span>');

    // Blockquotes
    html = html.replace(/^(&gt;\s.*?)$/, '<span class="text-gray-500 dark:text-gray-400">$1</span>');

    // Unordered lists
    html = html.replace(/^(\s*[-*+]\s)/, '<span class="text-orange-500">$1</span>');

    // Ordered lists
    html = html.replace(/^(\s*\d+\.\s)/, '<span class="text-orange-500">$1</span>');

    // Horizontal rules
    html = html.replace(/^([-*_]{3,})$/, '<span class="text-gray-400">$1</span>');

    // Bracket matching highlighting
    if (activeBracketMatch) {
      html = highlightBracketMatch(html, lineIndex, activeBracketMatch);
    }

    return html;
  }).join('\n');
};

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
    const openCol = match.open.column;
    const closeCol = match.close.column;
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

export const SyntaxHighlightOverlay: React.FC<SyntaxHighlightOverlayProps> = ({
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
};
