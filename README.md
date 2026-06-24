<p align="center">
  <img src="public/icon-192x192.png" alt="Preview.md" width="96" height="96" />
</p>

<h1 align="center">Preview.md</h1>

<p align="center">
  A professional, installable markdown editor with live preview, offline support, and multiple layout views.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-4.3-38BDF8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa" alt="PWA" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
</p>

---

## What is Preview.md?

Preview.md is a single-page markdown editor that renders your writing in real time. Type markdown on the left, see the formatted result on the right. It works offline, installs as a PWA on any device, and exports to HTML, PDF, and plain text.

No accounts. No servers. Everything stays in your browser.

## Features

### Writing & Editing

- **Live preview** — debounced rendering updates 150ms after you stop typing
- **Syntax highlighting** — markdown syntax colored inline within the editor
- **Line numbers** — always visible, synchronized with scroll
- **Auto-save** — content persists to localStorage on every change
- **Smart typing** — auto-close brackets, quotes, and markdown pairs (`**`, `~~`, etc.)
- **Auto-complete** — markdown syntax suggestions as you type
- **Bracket matching** — highlights matching `()`, `[]`, `{}` near the cursor
- **Find & Replace** — case-insensitive search with replace-one and replace-all
- **Column selection** — `Alt + drag` for rectangular text selection
- **Editor shortcuts** — `Ctrl+B` (bold), `Ctrl+I` (italic), `Ctrl+K` (link), `Ctrl+F` (find)

### Markdown Rendering

- **GitHub Flavored Markdown** — tables, task lists, strikethrough, autolinks
- **Syntax-highlighted code blocks** — 100+ languages with light/dark themes
- **Mermaid diagrams** — flowcharts, sequence diagrams, Gantt charts, class diagrams
- **Math equations** — inline and block LaTeX via KaTeX
- **Emoji shortcodes** — `:rocket:`, `:tada:`, `:fire:` and every GitHub emoji
- **Definition lists** — term-definition pairs
- **Image lightbox** — click any image to view full-size
- **Heading anchors** — hover any heading to copy its anchor link

### Layout & Views

- **Split view** — editor and preview side-by-side with a draggable divider
- **Stacked view** — editor above, preview below
- **Tabbed view** — switch between editor and preview with tabs
- **Reading mode** — preview only, no distractions
- **Fullscreen mode** — `F11` for a full-window editing experience
- **Synchronized scrolling** — lock editor and preview scroll positions
- **Zoom controls** — 50%–200% zoom on the preview panel

### Export & File Operations

- **Upload** `.md` or `.markdown` files via button or drag-and-drop
- **Download** current content as a `.md` file (`Ctrl+S`)
- **Export as HTML** — self-contained document with embedded styles
- **Export as PDF** — print-friendly formatted output
- **Export as plain text** — strip formatting, keep the words

### PWA & Offline

- **Installable** — add to home screen on desktop and mobile
- **Offline-ready** — service worker caches the app and your content
- **Dark mode** — system preference detection with manual toggle
- **Command palette** — `Ctrl+Shift+P` for quick access to all commands

## Quick Start

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later

### Install & Run

```bash
# Clone the repository
git clone https://github.com/vikasdfghjl/previewdotmd.git
cd previewdotmd

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Keyboard Shortcuts

| Shortcut            | Action                         |
| ------------------- | ------------------------------ |
| `Ctrl+Shift+P`      | Open command palette           |
| `Ctrl+F`            | Find & Replace                 |
| `Ctrl+B`            | Bold selected text             |
| `Ctrl+I`            | Italic selected text           |
| `Ctrl+K`            | Insert link                    |
| `Ctrl+S`            | Download as `.md`              |
| `Ctrl++` / `Ctrl+-` | Zoom in / out                  |
| `Ctrl+0`            | Reset zoom                     |
| `F11`               | Toggle fullscreen              |
| `Escape`            | Exit fullscreen / reading mode |
| `Tab`               | Indent (2 spaces)              |

## Tech Stack

| Category          | Technology                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Framework         | [Next.js 16](https://nextjs.org) (App Router)                                                            |
| UI                | [React 19](https://react.dev)                                                                            |
| Styling           | [Tailwind CSS v4](https://tailwindcss.com)                                                               |
| Language          | [TypeScript](https://typescriptlang.org)                                                                 |
| Markdown          | [react-markdown](https://github.com/remarkjs/react-markdown) + remark/rehype                             |
| Code Highlighting | [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) (Prism) |
| Diagrams          | [Mermaid](https://mermaid.js.org)                                                                        |
| Math              | [KaTeX](https://katex.org)                                                                               |
| Fonts             | [Geist](https://vercel.com/font)                                                                         |
| Deployment        | [Cloudflare Pages](https://pages.cloudflare.com)                                                         |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (metadata, PWA, fonts)
│   ├── page.tsx            # Home page (renders MarkdownPreview)
│   ├── loading.tsx         # Loading state (JS bundle download)
│   ├── error.tsx           # Error boundary (graceful recovery)
│   └── globals.css         # Tailwind v4 + theme variables
├── components/             # React components
│   ├── MarkdownPreview.tsx # Main app orchestrator
│   ├── EditorPanel.tsx     # Markdown input panel
│   ├── PreviewPanel.tsx    # Rendered output panel
│   ├── CodeRenderer.tsx    # Code block / Mermaid renderer
│   ├── CommandPalette.tsx  # VS Code-style command palette
│   ├── Header.tsx          # App header with controls
│   └── ...                 # 18 components total
├── contexts/               # React context providers
│   ├── ThemeContext.tsx     # Light/dark theme state
│   └── LayoutContext.tsx    # Layout mode, zoom, sync scroll
├── hooks/                  # Custom React hooks
│   ├── useMarkdownState.ts # Markdown state + auto-save
│   ├── useFileOperations.ts# File upload/download/export
│   ├── useSmartTyping.ts   # Auto-close brackets and pairs
│   └── ...                 # 8 hooks total
├── lib/
│   └── markdownPlugins.ts  # Remark/rehype plugin config
└── constants/
    ├── config.ts           # App metadata and defaults
    └── icons.tsx           # Centralized SVG icons
```

## Deployment

Preview.md is deployed on **Cloudflare Pages** with automatic SSL, global CDN, and preview deployments for every pull request.

### Deploy your own

1. Push this repo to GitHub
2. Connect the repo in the [Cloudflare Pages dashboard](https://dash.cloudflare.com)
3. Set the build command to `npm run build`
4. Deploy

For a custom domain, set the `NEXT_PUBLIC_SITE_URL` environment variable in the Cloudflare Pages dashboard.

## Contributing

Contributions are welcome. See [FUTURE.md](FUTURE.md) for planned features and priorities.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## License

MIT © [vikasdfghjl](https://github.com/vikasdfghjl)

---

<p align="center">
  <sub>Built with Next.js, React, and Tailwind CSS. Deployed on Cloudflare Pages.</sub>
</p>
