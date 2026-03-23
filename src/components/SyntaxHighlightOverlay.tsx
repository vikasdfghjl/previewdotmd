'use client';

import React from 'react';

interface SyntaxHighlightOverlayProps {
  markdown: string;
}

const highlightMarkdown = (text: string): string => {
  // Escape HTML entities first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply syntax highlighting
  // Headers
  html = html.replace(/^(#{1,6}\s.*?)$/gm, '<span class="text-purple-600 dark:text-purple-400 font-bold">$1</span>');

  // Bold
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<span class="text-blue-600 dark:text-blue-400 font-bold">$1$2$1</span>');

  // Italic
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<span class="text-blue-500 dark:text-blue-300 italic">*$1*</span>');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<span class="text-green-600 dark:text-green-400">```\n$2```</span>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<span class="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-0.5 rounded">`$1`</span>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="text-cyan-600 dark:text-cyan-400">[$1]($2)</span>');

  // Images
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<span class="text-cyan-600 dark:text-cyan-400">![$1]($2)</span>');

  // Blockquotes
  html = html.replace(/^(&gt;\s.*?)$/gm, '<span class="text-gray-500 dark:text-gray-400">$1</span>');

  // Unordered lists
  html = html.replace(/^(\s*[-*+]\s)/gm, '<span class="text-orange-500">$1</span>');

  // Ordered lists
  html = html.replace(/^(\s*\d+\.\s)/gm, '<span class="text-orange-500">$1</span>');

  // Horizontal rules
  html = html.replace(/^([-*_]{3,})$/gm, '<span class="text-gray-400">$1</span>');

  return html;
};

export const SyntaxHighlightOverlay: React.FC<SyntaxHighlightOverlayProps> = ({ markdown }) => {
  const highlightedHtml = highlightMarkdown(markdown);

  return (
    <pre
      className="absolute inset-0 w-full h-full font-mono text-sm p-4 pt-4 pb-4 leading-5 whitespace-pre-wrap break-words pointer-events-none overflow-hidden"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
    />
  );
};
