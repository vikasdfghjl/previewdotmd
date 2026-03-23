import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'previewdotmd-content';
const AUTOSAVE_DELAY = 1000; // 1 second debounce

const DEFAULT_MARKDOWN = `# Hello, World!

This is a **markdown** preview app.

## Features

- Live preview
- Side-by-side layout
- Syntax highlighting for code blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

> This is a blockquote.

1. First item
2. Second item
3. Third item
`;

function loadFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveToStorage(content: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, content);
  } catch {
    // Storage full or unavailable
  }
}

export function useMarkdownState(initialValue?: string) {
  const [markdown, setMarkdown] = useState<string>(() => {
    const saved = loadFromStorage();
    return saved ?? initialValue ?? DEFAULT_MARKDOWN;
  });
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save effect with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(markdown);
      setLastSaved(new Date());
    }, AUTOSAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [markdown]);

  const handleChange = useCallback((value: string) => {
    setMarkdown(value);
  }, []);

  const handleClear = useCallback(() => {
    setMarkdown('');
  }, []);

  const handleReset = useCallback(() => {
    setMarkdown(DEFAULT_MARKDOWN);
  }, []);

  return {
    markdown,
    handleChange,
    handleClear,
    handleReset,
    lastSaved,
  };
}
