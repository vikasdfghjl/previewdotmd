export const DEFAULT_MARKDOWN = `# Welcome to Preview.md 🚀

A powerful, offline-capable **Markdown editor** with live preview — write, preview, and export in one place. Designed for developers, writers, and anyone who works with Markdown.

> 💡 **New here?** Try the **formatting toolbar** above the editor, press \`Ctrl+Shift+P\` for the **Command Palette**, or click headings in the preview to **copy anchor links**. Your work auto-saves to this browser.

---

## ✨ Quick Example: README Template

Preview.md shines for writing project documentation. Here's a realistic README snippet:

\`\`\`markdown
# Project Name

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A brief description of what this project does and why it exists.

## 🚀 Quick Start

\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
npm install
npm run dev
\`\`\`

## 📖 API Reference

| Endpoint | Method | Description |
|:---------|:-------|:------------|
| \`/api/users\` | \`GET\` | List all users |
| \`/api/users/:id\` | \`GET\` | Get user by ID |
| \`/api/users\` | \`POST\` | Create a new user |
| \`/api/users/:id\` | \`PATCH\` | Update user details |

## 🧪 Testing

\`\`\`bash
npm test           # Run unit tests
npm run test:e2e   # Run end-to-end tests
\`\`\`

## 📄 License

MIT © 2026 Your Name
\`\`\`

---

## 🎨 Code Highlighting

100+ languages with light & dark themes:

\`\`\`typescript
// Generic API response handler
interface ApiResponse<T> {
  data: T;
  meta: { page: number; total: number };
}

async function fetchUsers(page = 1): Promise<ApiResponse<User[]>> {
  const res = await fetch(\`/api/users?page=\${page}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

const { data: users, meta } = await fetchUsers(1);
console.log(\`Loaded \${users.length} of \${meta.total} users\`);
\`\`\`

\`\`\`python
from dataclasses import dataclass

@dataclass
class MarkdownConfig:
    enable_math: bool = True
    enable_diagrams: bool = True
    theme: str = "auto"

config = MarkdownConfig(theme="dark")
print(f"Markdown engine ready — {config}")
\`\`\`

---

## 📐 Math Equations (KaTeX)

Inline math renders beautifully: the quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ is a classic.

Block equations with alignment:

$$
\\begin{aligned}
f(x) &= x^3 - 3x^2 + 2x \\\\
f'(x) &= 3x^2 - 6x + 2 \\\\
f''(x) &= 6x - 6
\\end{aligned}
$$

Statistical notation:

$$
P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}
$$

---

## 📈 Diagrams (Mermaid)

### Architecture Flow

\`\`\`mermaid
graph LR
    A[Browser] --> B[Cloudflare CDN]
    B --> C[Next.js Static Export]
    C --> D[Markdown Parser]
    D --> E[React Renderer]
    E --> F[Live Preview]

    style A fill:#3b82f6,color:#fff
    style F fill:#10b981,color:#fff
\`\`\`

### User Journey

\`\`\`mermaid
sequenceDiagram
    actor Writer
    participant Editor
    participant Parser
    participant Preview

    Writer->>Editor: Type markdown
    Editor->>Parser: Parse after 150ms debounce
    Parser->>Preview: Render HTML
    Preview-->>Writer: Show live output

    Note over Editor,Preview: Bidirectional scroll sync
\`\`\`

---

## 📊 Feature Comparison

| Capability | Preview.md | Other Editors | Notes |
|:-----------|:----------:|:-------------:|:------|
| Syntax Highlighting | ✅ 100+ lang | Usually ~20 | Via Prism |
| Math Equations | ✅ KaTeX | ⚠️ MathJax only | Faster rendering |
| Diagrams | ✅ Mermaid | ❌ Rare | Flowchart, sequence, Gantt |
| Offline PWA | ✅ Full | ⚠️ Partial | Service worker caching |
| Export Formats | ✅ HTML/PDF/TXT | ⚠️ Limited | One-click export |
| Dark Mode | ✅ System-aware | ⚠️ Manual toggle | Auto-detects preference |
| Command Palette | ✅ Ctrl+Shift+P | ❌ Rare | VS Code style |
| Drag & Drop | ✅ .md files | ❌ Rare | Instant file loading |
| Anchor Links | ✅ Click heading | ❌ Rare | Copy section URL |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|:---------|:-------|
| \`Ctrl+Shift+P\` | Command Palette |
| \`Ctrl+F\` | Find & Replace |
| \`Ctrl+B\` / \`Ctrl+I\` | Bold / Italic |
| \`Ctrl+K\` | Insert Link |
| \`F11\` | Toggle Fullscreen |
| \`Ctrl++\` / \`Ctrl+-\` | Zoom In / Out |
| \`Ctrl+0\` | Reset Zoom |
| \`Tab\` / \`Shift+Tab\` | Indent / Outdent |
| \`Escape\` | Exit fullscreen / reading mode |

---

## 📝 Writing Tips

- Use the **formatting toolbar** above the editor for quick access to common Markdown syntax
- **Drag & drop** a \`.md\` file anywhere on the editor to load it instantly
- Click any heading in the preview to **copy a direct link** to that section
- Switch between **Split**, **Stacked**, and **Tabbed** layouts via the header controls
- Enable **Sync Scroll** to keep editor and preview aligned while scrolling
- Your content is **auto-saved** to this browser — export to a file for permanent storage
- Install as a **PWA** for offline access (\`Ctrl+Shift+P\` → "Install")

---

## 🧪 Advanced Formatting

**Rich text** with *emphasis*, ~~corrections~~, \`inline code\`, [links](https://example.com), and footnotes[^1].

> Blockquotes support **nested formatting** and multi-paragraph content.
>
> — *Anonymous*

### Task Lists

- [x] Clone the repository
- [x] Install dependencies
- [x] Run the dev server
- [ ] Write documentation
- [ ] Deploy to production

### Definition Lists

Markdown
: A lightweight markup language with plain-text formatting syntax.

Preview.md
: A modern Markdown editor with live preview, PWA support, and export capabilities.

[^1]: This is a footnote. Footnotes are rendered at the bottom of the document with back-links.

---

**Happy writing!** 🎉 Built with Next.js, React, TypeScript, and Tailwind CSS.

*Edit this content or click **Clear All** to start fresh. Your changes are saved automatically.*
`;
