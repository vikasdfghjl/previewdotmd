# Future Scope (Pruned)

This file lists only features that are Not Implemented or Partially Implemented after a codebase review. Each item includes a short verification note and a file reference.

## Extended Markdown Support

- **Footnotes — Not Implemented**: No remark-footnotes or equivalent plugin found in the markdown pipeline. See [src/lib/markdownPlugins.ts](src/lib/markdownPlugins.ts).
- **Abbreviations — Not Implemented**: No abbreviation support detected in the current remark/rehype configuration. See [src/lib/markdownPlugins.ts](src/lib/markdownPlugins.ts).

## Templates & Snippets

- **Pre-built Templates (README, Docs, Blog, API) — Not Implemented**: No template library or example templates present. Consider creating a `/templates` directory and UI. (No specific file reference)
- **Snippet Panel / Custom Templates / Quick Insert — Not Implemented**: No snippet manager or template save/load UI found.

## Accessibility & UX

- **Copy HTML to Clipboard (Ctrl+Shift+C) — Not Implemented**: No handler or command for copying rendered HTML found. See commands in [src/constants/commands.tsx](src/constants/commands.tsx) for existing commands.
- **Focus Mode — Not Implemented**: UI to highlight current line/section not present.

## Performance & Technical

- **Virtual Scrolling — Not Implemented**: No virtualization for very large documents detected.
- **Web Workers — Not Implemented**: Markdown parsing not offloaded; no worker files or usage found.
- **Performance Monitoring — Not Implemented**: No APM or performance metrics collection present.
- **Bundle Optimization — Not Implemented**: Further bundle work is possible; no specialized optimization tooling in repo.

## Preview Enhancements

- **Print Styles — Partially Implemented**: `exportAsPdf` injects `EXPORT_CSS` and an `@media print` rule into the printable template, but there is no dedicated site-wide print stylesheet. See [src/hooks/useFileOperations.ts](src/hooks/useFileOperations.ts) and [src/lib/download.ts](src/lib/download.ts).
- **Responsive Preview — Not Implemented**: No device-size simulator in the preview pane.
- **Custom CSS — Not Implemented**: No user-provided CSS injection UI discovered.

## Import/Export & Integration

- **Import from URL — Not Implemented**: No fetch/import-from-URL feature found.
- **Notion / Obsidian Integration — Not Implemented**: No connectors or exporters detected.
- **Word Export (.docx) — Not Implemented**: No docx export library integration found.
- **Image Upload to CDN — Partially Implemented**: Drag-and-drop image insertion exists (see [src/components/EditorPanel.tsx](src/components/EditorPanel.tsx)), but automatic upload to a CDN (Imgur/Cloudinary) is not implemented.
- **Embed External Content (oEmbed) — Not Implemented**: No oEmbed handling was found.

## Security & Privacy

- **Content Security Policy — Not Implemented**: No CSP enforcement found in app config or headers.
- **XSS Prevention / Sanitization — Partially Implemented / Needs Review**: Several components render HTML via `dangerouslySetInnerHTML` (e.g. [src/components/MermaidRenderer.tsx](src/components/MermaidRenderer.tsx), [src/components/SyntaxHighlightOverlay.tsx](src/components/SyntaxHighlightOverlay.tsx), [src/app/layout.tsx](src/app/layout.tsx)). A repo-wide sanitizer (DOMPurify or similar) was not detected — this is a security risk that should be addressed.
- **Local-Only Mode / Encrypted Storage / Session Timeout — Not Implemented**: Privacy-oriented features not present.

## Advanced Features & Tools

- **Table of Contents — Implemented (removed)**: TOC component exists; not listed here. See [src/components/TableOfContents.tsx](src/components/TableOfContents.tsx).
- **Grammar Checking — Not Implemented**: No grammar tool integration (LanguageTool, Grammarly API) detected.

## Notes & Next Steps

- If you want, I can:
  - open PR to add simple sanitization (DOMPurify) around rendered HTML,
  - implement a basic Copy-HTML command,
  - scaffold template/snippet storage and UI,
  - or restore any removed FUTURE items for discussion.

## Housekeeping

- `.gitignore` was updated to include local/editor/tooling artifacts (including `.claude/`). If `.claude` was already committed, run `git rm -r --cached .claude` and commit to stop tracking it.

_Last reviewed: July 9, 2026_
