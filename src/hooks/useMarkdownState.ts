import { useState, useCallback } from 'react';

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

export function useMarkdownState(initialValue = DEFAULT_MARKDOWN) {
  const [markdown, setMarkdown] = useState<string>(initialValue);

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
  };
}