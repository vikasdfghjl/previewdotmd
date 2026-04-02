# Future Scope

This document outlines potential enhancements and features for the Markdown Preview application. These are ideas for future development, categorized by area of improvement.

## 1. File Operations
- [x] **File Upload**: Drag-and-drop or file picker for `.md` files
- [x] **Download**: Save current markdown as `.md` file
- [x] **Export Options**: Export formatted preview as:
  - [x] HTML document
  - [x] PDF file
  - [x] Plain text

## 2. Editor Enhancements
- [x] **Line Numbers**: Display line numbers in the editor
- [x] **Syntax Highlighting**: Markdown syntax highlighting in editor
- [x] **Find & Replace**: Search and replace functionality
- [x] **Auto-save**: Automatic saving to localStorage
- [x] **Bracket Matching**: Highlight matching brackets

## 3. Extended Markdown Support
- [x] **Math Equations**: KaTeX/LaTeX math rendering
- [x] **Diagrams**: Mermaid.js integration for:
  - [x] Flowcharts
  - [x] Sequence diagrams
  - [x] Gantt charts
  - [x] Class diagrams
- [x] **Emoji Support**: Convert emoji codes to actual emojis
- [ ] **Footnotes**: Markdown footnotes support (disabled due to vfile compatibility)
- [x] **Task Lists**: Interactive task list checkboxes (via remark-gfm)
- [x] **Definition Lists**: Term-definition pairs
- [ ] **Abbreviations**: Glossary-style abbreviations

## 4. View Options & Layout
- [x] **Synchronized Scrolling**: Sync editor and preview scroll positions
- [x] **Fullscreen Mode**: Distraction-free editing
- [x] **Layout Options**:
  - [x] Stacked (editor above preview)
  - [x] Tabbed interface
  - [x] Adjustable split ratios
- [x] **Zoom Controls**: Zoom in/out of preview
- [x] **Reading Mode**: Minimalist preview-only view

## 4. Templates & Snippets
- [ ] **Pre-built Templates**:
  - [ ] README template
  - [ ] Documentation template
  - [ ] Blog post template
  - [ ] API documentation template
- [ ] **Snippet Panel**: Common markdown patterns
- [ ] **Custom Templates**: Save and load user templates
- [ ] **Quick Insert**: Toolbar for common markdown elements

## 5. Accessibility & UX Improvements
- [x] **Keyboard Shortcuts**:
  - [x] Ctrl+B: Toggle bold
  - [x] Ctrl+I: Toggle italic
  - [x] Ctrl+K: Insert link
  - [x] Ctrl+F: Find/Replace
  - [ ] Ctrl+Shift+C: Copy HTML
- [x] **Screen Reader Optimizations**: Better ARIA labels and roles
- [x] **Customizable Font Sizes**: Adjustable text size in editor/preview (via zoom)
- [x] **Color Themes**: Light/dark mode toggle
- [ ] **Focus Mode**: Highlight current line/section
- [x] **Distraction-free Mode**: Fullscreen and Reading Mode
- [x] **WCAG 2.1 Compliance**: 44px touch targets, visible focus indicators, proper ARIA semantics

## 6. Performance & Technical
- [ ] **Virtual Scrolling**: For handling very large documents
- [ ] **Web Workers**: Offload markdown parsing to background threads
- [x] **Service Worker**: Offline functionality & PWA support
- [x] **PWA**: Installable app with manifest
- [ ] **Performance Monitoring**: Track rendering performance
- [ ] **Bundle Optimization**: Reduce initial load size

## 7. Advanced Features
- [ ] **Table of Contents**: Auto-generated TOC from headings
- [x] **Word Count Analytics**: Basic statistics (characters, words, lines)
- [ ] **Grammar Checking**: Integration with grammar tools


## 8. Editor Productivity
- [x] **Column Selection**: Alt+Drag for column/rectangular selection
- [x] **Auto-completion**: Markdown syntax suggestions
- [x] **Smart Typing**: Auto-close brackets, quotes, and markdown pairs
- [x] **Command Palette**: Quick access to all commands (Ctrl+Shift+P)

## 9. Preview Enhancements
- [x] **Scroll Sync Indicator**: Visual indicator showing sync status
- [x] **Anchor Links**: Click heading to get shareable link to section
- [x] **Image Lightbox**: Click images to enlarge
- [ ] **Print Styles**: Optimized CSS for printing
- [ ] **Responsive Preview**: Simulate mobile/tablet view
- [ ] **Custom CSS**: User-defined styles for preview

## 10. Import/Export & Integration
- [ ] **Import from URL**: Fetch markdown from GitHub/GitLab raw URLs
- [ ] **Notion Integration**: Import/export with Notion pages
- [ ] **Obsidian Integration**: Work with Obsidian vaults
- [ ] **Word Export**: Export to .docx format
- [ ] **Image Upload**: Drag images to upload to CDN (Imgur, Cloudinary)
- [ ] **Embed External Content**: oEmbed support for YouTube, Twitter, etc.

## 11. Security & Privacy
- [ ] **Content Security Policy**: Strict CSP headers
- [ ] **XSS Prevention**: Sanitize untrusted markdown
- [ ] **Local-Only Mode**: No external requests option
- [ ] **Encrypted Storage**: Password-protected documents
- [ ] **Session Timeout**: Auto-lock after inactivity

## Implementation Priorities

### High Priority (Core Functionality)
1. [x] File upload/download
2. [x] Line numbers in editor
3. [x] Auto-save functionality
4. [x] Keyboard shortcuts
5. [x] Accessibility compliance (WCAG 2.1)

### Medium Priority (Enhanced Experience)
1. [x] Synchronized scrolling
2. [x] Export to HTML/PDF
3. [x] Math equation support
4. [x] Multiple layout options
5. [ ] Table of Contents
6. [ ] Copy HTML to clipboard
7. [ ] Templates & Snippets

### Low Priority (Advanced Features)
1. [ ] Real-time collaboration
2. [ ] Mobile app
3. [ ] Browser extension
4. [ ] Cloud storage integration
5. [ ] Grammar checking
6. [ ] Presentation mode

## Contributing

If you'd like to contribute to any of these features, please:
1. Check the issue tracker for existing discussions
2. Create a new issue for the feature you want to implement
3. Follow the project's coding standards
4. Submit a pull request with your implementation

## Notes

- Features marked with (*) require external libraries or APIs
- Some features may require significant architectural changes
- Performance considerations should be evaluated for each feature
- User feedback will help prioritize which features to implement first

---

*Last updated: April 2, 2026*