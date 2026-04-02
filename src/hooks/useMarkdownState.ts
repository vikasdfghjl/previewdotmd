import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'previewdotmd-content';
const AUTOSAVE_DELAY = 1000; // 1 second debounce

const DEFAULT_MARKDOWN = `# Welcome to Preview.md 🚀

A powerful, feature-rich **markdown editor** with live preview, designed for developers and writers.

---

## ✨ Features Showcase

### 📝 Rich Text Formatting

**Bold text**, *italic text*, ~~strikethrough~~, and ***bold italic*** — all the essentials for expressive writing.

> 💡 **Pro Tip:** Use \`Ctrl+Shift+P\` to open the Command Palette for quick access to all features!

---

## 🎨 Code Highlighting

Syntax highlighting for 100+ languages with beautiful themes:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const createUser = (data: Omit<User, 'id'>): User => ({
  id: Math.floor(Math.random() * 10000),
  ...data,
});

// Usage
const user = createUser({
  name: 'Alice Johnson',
  email: 'alice@example.com',
});

console.log(\`Created user: \${user.name}\`);
\`\`\`

\`\`\`python
# Python example with syntax highlighting
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

# Generate first 10 Fibonacci numbers
print(fibonacci(10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

\`\`\`css
/* Custom styling with CSS */
.markdown-preview {
  font-family: 'Geist', system-ui, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
}

.markdown-preview pre {
  background: #f6f8fa;
  border-radius: 8px;
  padding: 1rem;
}
\`\`\`

---

## 📊 Tables & Data

| Feature | Status | Description |
|:--------|:------:|:------------|
| Live Preview | ✅ | Real-time markdown rendering |
| Syntax Highlighting | ✅ | 100+ languages supported |
| Math Equations | ✅ | KaTeX integration |
| Diagrams | ✅ | Mermaid.js support |
| Dark Mode | ✅ | Automatic theme switching |
| PWA Support | ✅ | Works offline |

---

## 📐 Math Equations (KaTeX)

Inline math: $E = mc^2$

Block equations:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\begin{aligned}
\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\
\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t}
\\end{aligned}
$$

Matrix notation:

$$
\\mathbf{A} = \\begin{bmatrix}
a_{11} & a_{12} & a_{13} \\\\
a_{21} & a_{22} & a_{23} \\\\
a_{31} & a_{32} & a_{33}
\\end{bmatrix}
$$

---

## 📈 Diagrams (Mermaid)

### Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great! 🎉]
    B -->|No| D[Debug]
    D --> E[Fix Issues]
    E --> B
    C --> F[Deploy]
\`\`\`

### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Editor
    participant Preview
    
    User->>Editor: Type markdown
    Editor->>Preview: Parse & render
    Preview-->>User: Show live preview
    
    Note over Editor,Preview: Real-time sync
\`\`\`

### Gantt Chart

\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Research           :done, a1, 2024-01-01, 7d
    Design             :done, a2, after a1, 5d
    section Development
    Core Features      :active, a3, after a2, 14d
    Advanced Features  :a4, after a3, 10d
    section Launch
    Testing            :a5, after a4, 7d
    Deployment         :a6, after a5, 3d
\`\`\`

---

## ✅ Task Lists

- [x] Create markdown editor
- [x] Add live preview
- [x] Implement syntax highlighting
- [x] Support math equations
- [x] Add diagram rendering
- [ ] AI-powered suggestions (coming soon)
- [ ] Real-time collaboration (coming soon)

---

## 🎯 Emoji Support

Express yourself with emoji! :rocket: :sparkles: :heart:

Common shortcuts work too:
- :+1: → :+1:
- :tada: → :tada:
- :fire: → :fire:
- :bug: → :bug:
- :idea: → :bulb:

---

## 🔗 Links & References

External links open in a new tab: [GitHub](https://github.com)

Internal anchors work too: [Jump to Features](#-features-showcase)

---

## 📖 Blockquotes & Callouts

> **Note:** This is a standard blockquote.

> **Warning:** Remember to save your work! The app auto-saves to localStorage.

> 💡 **Tip:** Use \`Ctrl+K\` to quickly insert a link.

---

## 📋 Lists

### Unordered Lists

- First level item
  - Second level item
    - Third level item
  - Another second level
- Back to first level

### Ordered Lists

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

### Mixed Lists

1. Main task
   - Subtask 1
   - Subtask 2
2. Another main task
   - Detail A
   - Detail B

---

## 🖼️ Images

Images are automatically centered and support click-to-enlarge:

![Markdown Logo](https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg)

*The Markdown logo - click to enlarge!*

---

## 🏷️ Definition Lists

Term 1
:   Definition of term 1

Term 2
:   Definition of term 2
:   Another definition for term 2

---

## 🎨 Horizontal Rules

Use three or more dashes, asterisks, or underscores:

---

***

___

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
|:---------|:-------|
| \`Ctrl+Shift+P\` | Open Command Palette |
| \`Ctrl+F\` | Find & Replace |
| \`Ctrl+B\` | Bold text |
| \`Ctrl+I\` | Italic text |
| \`Ctrl+K\` | Insert link |
| \`F11\` | Toggle fullscreen |
| \`Ctrl++\` / \`Ctrl+-\` | Zoom in/out |
| \`Tab\` | Indent |
| \`Shift+Tab\` | Outdent |

---

## 🚀 Getting Started

1. **Start typing** in the editor on the left
2. **See the preview** update in real-time on the right
3. **Try different layouts**: Split, Stacked, or Tabbed
4. **Export your work**: HTML, PDF, or Markdown
5. **Install as PWA**: Works offline!

---

## 📝 Sample Text for Testing

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

---

**Happy writing!** 🎉

*Built with Next.js, React, TypeScript, and Tailwind CSS*
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
