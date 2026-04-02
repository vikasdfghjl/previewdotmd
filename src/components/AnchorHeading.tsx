'use client';

import React, { useState, type ReactElement } from 'react';

interface AnchorHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  id?: string;
}

interface ReactElementWithChildren {
  props: {
    children?: React.ReactNode;
  };
}

/**
 * AnchorHeading - Heading component with clickable anchor links
 * Clicking the heading copies a shareable link to the clipboard
 */
export const AnchorHeading: React.FC<AnchorHeadingProps> = ({
  level,
  children,
  id: providedId,
}) => {
  const [showCopied, setShowCopied] = useState(false);
  
  // Generate ID from children text if not provided
  const generateId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  // Extract text from children for ID generation
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (React.isValidElement(node)) {
      const element = node as ReactElementWithChildren;
      if (element.props.children) {
        return extractText(element.props.children);
      }
    }
    return '';
  };

  const headingText = extractText(children);
  const id = providedId || generateId(headingText);

  const handleClick = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
      
      // Update URL hash without scrolling
      window.history.replaceState(null, '', `#${id}`);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const headings: Record<number, React.ElementType> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
  };
  const Tag = headings[level];
  
  const sizeClasses = {
    1: 'text-3xl font-bold mt-8 mb-4',
    2: 'text-2xl font-semibold mt-6 mb-3',
    3: 'text-xl font-semibold mt-5 mb-2',
    4: 'text-lg font-medium mt-4 mb-2',
    5: 'text-base font-medium mt-3 mb-1',
    6: 'text-sm font-medium mt-3 mb-1',
  }[level];

  return (
    <Tag
      id={id}
      className={`
        group relative flex items-center gap-2 cursor-pointer
        text-gray-900 dark:text-gray-100
        ${sizeClasses}
      `}
      onClick={handleClick}
      title="Click to copy link to this section"
    >
      {children}
      
      {/* Anchor link icon - visible on hover */}
      <span
        className="
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-200
          text-gray-400 hover:text-blue-500 dark:hover:text-blue-400
          flex items-center justify-center
          w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-800
        "
        aria-hidden="true"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </span>
      
      {/* Copied tooltip */}
      {showCopied && (
        <span
          className="
            absolute -top-8 left-1/2 -translate-x-1/2
            px-2 py-1 text-xs font-medium
            bg-gray-800 dark:bg-gray-700 text-white
            rounded shadow-lg
            animate-fade-in
            whitespace-nowrap
            z-10
          "
          role="status"
          aria-live="polite"
        >
          Link copied!
        </span>
      )}
    </Tag>
  );
};

export default AnchorHeading;
